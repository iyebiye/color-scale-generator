"use client";

import { useState } from "react";
import {
  generateColorScale,
  type ColorScale,
} from "@/lib/colors/generate-scale";
import ColorInput from "@/components/ColorInput";
import Palette from "@/components/Palette";

export default function Home() {
  const [name, setName] = useState("Primary");
  const [color, setColor] = useState("#0066FF");
  const [palette, setPalette] = useState<ColorScale | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [originalPalette, setOriginalPalette] = useState<ColorScale | null>(
    null,
  );

  function generatePalette() {
    console.log("Generate clicked");
    console.log("Color:", color);
    console.log("Name:", name);

    setError("");

    try {
      const generated = generateColorScale(color, name || "Primary");

      console.log("Generated palette:", generated);

      setPalette(generated);
      setOriginalPalette(generated);
    } catch (error) {
      console.error("Palette generation failed:", error);

      setPalette(null);
      setOriginalPalette(null);
      setError("Enter a valid HEX color, e.g. #0066FF.");
    }
  }

  function updateColor(step: number, value: string) {
    if (!palette) return;

    setPalette({
      ...palette,
      tokens: palette.tokens.map((token) =>
        token.step === step
          ? {
              ...token,
              hex: value,
            }
          : token,
      ),
    });
  }

  function resetColor(step: number) {
    if (!palette || !originalPalette) return;

    const originalToken = originalPalette.tokens.find(
      (token) => token.step === step,
    );

    if (!originalToken) return;

    setPalette({
      ...palette,
      tokens: palette.tokens.map((token) =>
        token.step === step
          ? {
              ...token,
              hex: originalToken.hex,
            }
          : token,
      ),
    });
  }

  function resetPalette() {
    if (!originalPalette) return;

    setPalette({
      ...originalPalette,
      tokens: originalPalette.tokens.map((token) => ({
        ...token,
      })),
    });
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

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header>
          <p className="text-sm font-medium tracking-wide text-gray-500">
            COLORLAB
          </p>

          <h1 className="mt-3 max-w-2xl text-5xl font-semibold tracking-tight">
            Build a color system from a single color.
          </h1>

          <p className="mt-4 max-w-xl text-lg text-gray-600">
            Generate tints and shades, refine your palette, and take it directly
            into your design workflow.
          </p>
        </header>

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

        {palette && originalPalette && (
          <Palette
            palette={palette}
            copiedValue={copiedValue}
            onCopy={copyValue}
            onColorChange={updateColor}
            onResetColor={resetColor}
            onResetPalette={resetPalette}
            originalPalette={originalPalette}
          />
        )}
      </div>
    </main>
  );
}
