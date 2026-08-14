"use client";

import { useState } from "react";
import { converter } from "culori";
import {
  generateColorScale,
  type ColorScale,
} from "@/lib/colors/generate-scale";

const toRgb = converter("rgb");
const toOklch = converter("oklch");

export default function Home() {
  const [color, setColor] = useState("#0066FF");
  const [palette, setPalette] = useState<ColorScale[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  function generatePalette() {
    console.log("Generate clicked");
    console.log("Color:", color);

    try {
      const generated = generateColorScale(color);

      console.log("Generated palette:", generated);

      setPalette(generated);
      setExpandedStep(null);
    } catch (error) {
      console.error("Palette generation failed:", error);
      setPalette([]);
    }
  }

  function getRgb(hex: string) {
    const rgb = toRgb(hex);

    if (!rgb) {
      return "";
    }

    const r = Math.round((rgb.r ?? 0) * 255);
    const g = Math.round((rgb.g ?? 0) * 255);
    const b = Math.round((rgb.b ?? 0) * 255);

    return `rgb(${r}, ${g}, ${b})`;
  }

  function getOklch(hex: string) {
    const oklch = toOklch(hex);

    if (!oklch) {
      return "";
    }

    const l = (oklch.l ?? 0).toFixed(3);
    const c = (oklch.c ?? 0).toFixed(3);
    const h = Math.round(oklch.h ?? 0);

    return `oklch(${l} ${c} ${h})`;
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

  function toggleDetails(step: number) {
    setExpandedStep((current) =>
      current === step ? null : step
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
            COLORLAB
          </p>

          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight">
            Build a color system from a single color.
          </h1>

          <p className="mt-4 max-w-xl text-lg text-gray-600">
            Generate tints and shades, refine your palette, and take it
            directly into your design workflow.
          </p>
        </header>

        <section className="mb-12 rounded-2xl border border-gray-200 p-6">
          <label
            htmlFor="color"
            className="mb-3 block text-sm font-medium"
          >
            Base color
          </label>

          <div className="flex gap-3">
            <input
              id="color-picker"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-12 w-14 cursor-pointer rounded-lg border border-gray-200 p-1"
            />

            <input
              id="color"
              type="text"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-12 flex-1 rounded-lg border border-gray-200 px-4 font-mono text-sm uppercase outline-none focus:border-gray-400"
              placeholder="#0066FF"
            />

            <button
              type="button"
              onClick={generatePalette}
              className="rounded-lg bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Generate
            </button>
          </div>
        </section>

        {palette.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                Your palette
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Generated using OKLCH.
              </p>
            </div>

            <div className="grid gap-3">
              {palette.map((item) => {
                const isBase = item.step === 500;
                const isExpanded = expandedStep === item.step;

                const rgb = getRgb(item.hex);
                const oklch = getOklch(item.hex);

                return (
                  <div
                    key={item.step}
                    className={`overflow-hidden rounded-xl border transition ${
                      isBase
                        ? "border-2 border-black"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Main color row */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => copyValue(item.hex)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          copyValue(item.hex);
                        }
                      }}
                      className="flex cursor-pointer items-center gap-4 p-3"
                    >
                      <div
                        className="h-16 w-20 shrink-0 rounded-lg"
                        style={{
                          backgroundColor: item.hex,
                        }}
                      />

                      <div className="w-16 shrink-0">
                        <div className="text-sm font-medium">
                          {item.step}
                        </div>

                        {isBase && (
                          <div className="mt-1 inline-flex rounded-full bg-black px-2 py-0.5 text-[10px] font-medium text-white">
                            Base
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="font-mono text-sm uppercase text-gray-700">
                          {item.hex}
                        </div>

                        {copiedValue === item.hex && (
                          <div className="mt-1 text-xs text-gray-400">
                            Copied!
                          </div>
                        )}
                      </div>

                      {/* Dropdown button */}
                      <button
                        type="button"
                        aria-label={
                          isExpanded
                            ? `Hide details for ${item.step}`
                            : `Show details for ${item.step}`
                        }
                        aria-expanded={isExpanded}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleDetails(item.step);
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-gray-100"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>

                    {/* Color details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50 px-3 pb-3 pt-3">
                        <div className="grid gap-2">
                          <ColorValue
                            label="HEX"
                            value={item.hex.toUpperCase()}
                            copiedValue={copiedValue}
                            onCopy={copyValue}
                          />

                          <ColorValue
                            label="RGB"
                            value={rgb}
                            copiedValue={copiedValue}
                            onCopy={copyValue}
                          />

                          <ColorValue
                            label="OKLCH"
                            value={oklch}
                            copiedValue={copiedValue}
                            onCopy={copyValue}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

type ColorValueProps = {
  label: string;
  value: string;
  copiedValue: string | null;
  onCopy: (value: string) => void;
};

function ColorValue({
  label,
  value,
  copiedValue,
  onCopy,
}: ColorValueProps) {
  const isCopied = copiedValue === value;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </div>

        <div className="truncate font-mono text-xs text-gray-700">
          {value}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onCopy(value)}
        className="shrink-0 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium transition hover:bg-gray-100"
      >
        {isCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}