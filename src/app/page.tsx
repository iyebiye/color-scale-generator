"use client";

import { useEffect, useState } from "react";
import {
  generateColorScale,
  type ColorScale,
} from "@/lib/colors/generate-scale";
import ColorInput from "@/components/ColorInput";
import Palette from "@/components/Palette";
import CssExport from "@/components/CssExport";
import JsonExport from "@/components/JsonExport";
import ColorScaleSidebar from "@/components/ColorScaleSidebar";
import AllColorsExport from "@/components/AllColorsExport";

type View = "dashboard" | "add-color" | "all-colors" | "colors";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");

  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);

  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [palettes, setPalettes] = useState<ColorScale[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem("colorlab-palettes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [originalPalettes, setOriginalPalettes] = useState<ColorScale[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem("colorlab-original-palettes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const selectedPalette = palettes[selectedPaletteIndex] ?? null;

  const originalPalette = originalPalettes[selectedPaletteIndex] ?? null;

  useEffect(() => {
    try {
      localStorage.setItem("colorlab-palettes", JSON.stringify(palettes));
      localStorage.setItem(
        "colorlab-original-palettes",
        JSON.stringify(originalPalettes),
      );
    } catch (error) {
      console.error("Failed to save ColorLab data:", error);
    }
  }, [palettes, originalPalettes]);

  function getContrastText(hex: string) {
    const cleanHex = hex.replace("#", "");

    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 150 ? "#000000" : "#FFFFFF";
  }

  function openAddColor() {
    setName("");
    setColor("");
    setError("");
    setIsEditing(false);
    setView("add-color");
  }

  function generatePalette() {
    setError("");

    if (!color.trim()) {
      setError("Enter a HEX color, e.g. #0066FF.");
      return;
    }

    try {
      const generated = generateColorScale(color, name.trim() || "Primary");

      setPalettes((current) => {
        const newIndex = current.length;
        setSelectedPaletteIndex(newIndex);

        return [...current, generated];
      });

      setOriginalPalettes((current) => [
        ...current,
        structuredClone(generated),
      ]);

      setView("colors");
      setIsEditing(false);

      setName("");
      setColor("");
    } catch (error) {
      console.error("Palette generation failed:", error);

      setError("Enter a valid HEX color, e.g. #0066FF.");
    }
  }

  function updateSelectedPalette(step: number, value: string) {
    setPalettes((current) =>
      current.map((palette, paletteIndex) => {
        if (paletteIndex !== selectedPaletteIndex) {
          return palette;
        }

        return {
          ...palette,
          tokens: palette.tokens.map((token) =>
            token.step === step
              ? {
                  ...token,
                  hex: value,
                }
              : token,
          ),
        };
      }),
    );
  }

  function resetSelectedPalette() {
    const original = originalPalettes[selectedPaletteIndex];

    if (!original) return;

    setPalettes((current) =>
      current.map((palette, index) =>
        index === selectedPaletteIndex ? structuredClone(original) : palette,
      ),
    );

    setIsEditing(false);
  }

  function resetColor(step: number) {
    const original = originalPalette;

    if (!original) return;

    const originalToken = original.tokens.find((token) => token.step === step);

    if (!originalToken) return;

    setPalettes((current) =>
      current.map((palette, paletteIndex) => {
        if (paletteIndex !== selectedPaletteIndex) {
          return palette;
        }

        return {
          ...palette,
          tokens: palette.tokens.map((token) =>
            token.step === step
              ? {
                  ...token,
                  hex: originalToken.hex,
                }
              : token,
          ),
        };
      }),
    );
  }

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);

      setCopiedValue(value);

      setTimeout(() => {
        setCopiedValue(null);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy value:", error);
    }
  }

  /*
   * DASHBOARD
   */
  if (view === "dashboard") {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center px-8 py-16">
          <div className="w-full max-w-4xl">
            {/* Brand */}
            <p className="text-sm font-semibold tracking-[0.2em] text-gray-500">
              COLORLAB
            </p>

            {/* Hero */}
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Create your color system once. Use it everywhere.
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-8 text-gray-600">
              Generate a complete color scale from a single brand color, built
              for product designers and developers.
            </p>

            {/* Features */}
            <div className="mt-16 grid gap-6 sm:grid-cols-3">
              {/* Design */}
              <div className="rounded-2xl border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-400">01</div>

                <h2 className="mt-4 text-lg font-semibold">
                  Build your color scale
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Start with a single brand color and generate a complete scale
                  of tints and shades. Refine individual tokens and create a
                  color system that works for your product.
                </p>
              </div>

              {/* Collaboration */}
              <div className="rounded-2xl border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-400">02</div>

                <h2 className="mt-4 text-lg font-semibold">
                  One color system for design and development
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Keep designers and developers working from the same color
                  values. What you create in ColorLab can be used across your
                  design files and product code.
                </p>
              </div>

              {/* Development */}
              <div className="rounded-2xl border border-gray-200 p-6">
                <div className="text-sm font-medium text-gray-400">03</div>

                <h2 className="mt-4 text-lg font-semibold">
                  Take your colors straight into design and code
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Copy individual colors or export your complete color system as
                  Figma Tokens or CSS and JSON for your development workflow.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={openAddColor}
              className="mt-10 rounded-xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Create your first color scale
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * COLOR WORKSPACE
   */
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {palettes.length > 0 && (
        <ColorScaleSidebar
          palettes={palettes}
          selectedIndex={selectedPaletteIndex}
          onSelect={(index) => {
            setSelectedPaletteIndex(index);
            setView("colors");
            setIsEditing(false);
          }}
          onAddColor={openAddColor}
          onAllColors={() => {
            setView("all-colors");
            setIsEditing(false);
          }}
          onDashboard={() => {
            setView("dashboard");
            setIsEditing(false);
          }}
          activeView={
            view === "all-colors"
              ? "all-colors"
              : view === "add-color"
                ? "add-color"
                : "palette"
          }
        />
      )}

      <div
        className={
          palettes.length > 0 ? "ml-[280px] min-h-screen" : "min-h-screen"
        }
      >
        {view === "add-color" && (
          <div className="mx-auto max-w-4xl px-10 py-16">
            <div className="mb-12">
              <p className="text-sm font-medium tracking-wide text-gray-500">
                ADD COLOR
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Add a color to your system.
              </h1>

              <p className="mt-4 max-w-xl text-gray-600">
                Enter a base color and ColorLab will generate its complete color
                scale.
              </p>
            </div>

            <ColorInput
              name={name}
              color={color}
              error={error}
              onNameChange={setName}
              onColorChange={(value) => {
                setColor(value);
                setError("");
              }}
              onGenerate={generatePalette}
            />
          </div>
        )}

        {view === "all-colors" && (
          <div className="mx-auto max-w-6xl px-10 py-16">
            <div className="mb-10">
              <p className="text-sm font-medium tracking-wide text-gray-500">
                COLOR SYSTEM
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                All colors
              </h1>

              <p className="mt-4 max-w-xl text-gray-600">
                View all the color scales you&apos;ve generated in one place.
              </p>
            </div>

            <div className="space-y-10">
              {palettes.map((palette, index) => (
                <button
                  key={`${palette.name}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedPaletteIndex(index);
                    setView("colors");
                    setIsEditing(false);
                  }}
                  className="block w-full text-left"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{palette.name}</h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {palette.tokens.length} color tokens
                      </p>
                    </div>

                    <span className="text-sm text-gray-400">View scale →</span>
                  </div>

                  <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
                    {palette.tokens.map((token) => (
                      <div
                        key={token.step}
                        className="group relative h-24"
                        style={{
                          backgroundColor: token.hex,
                        }}
                      >
                        <div className="absolute inset-x-0 bottom-0 bg-black/0 px-2 py-2 transition group-hover:bg-black/10">
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: getContrastText(token.hex),
                            }}
                          >
                            {token.step}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <AllColorsExport palettes={palettes} />
          </div>
        )}

        {view === "colors" && selectedPalette && (
          <div className="mx-auto max-w-5xl px-10 py-16">
            <Palette
              palette={selectedPalette}
              originalPalette={originalPalette}
              copiedValue={copiedValue}
              onCopy={copyValue}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onDone={() => setIsEditing(false)}
              onReset={resetSelectedPalette}
              onResetColor={resetColor}
              onColorChange={updateSelectedPalette}
            />

            <div className="mt-12 gap-4">
              <CssExport palette={selectedPalette} />
              <JsonExport palette={selectedPalette} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
