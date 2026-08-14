"use client";

import { useState } from "react";
import {
  generateColorScale,
  type ColorScale,
} from "@/lib/colors/generate-scale";

export default function Home() {
  const [color, setColor] = useState("#0066FF");
  const [palette, setPalette] = useState<ColorScale[]>([]);

  function generatePalette() {
  console.log("Generate clicked");
  console.log("Color:", color);

  try {
    const generated = generateColorScale(color);

    console.log("Generated palette:", generated);

    setPalette(generated);
  } catch (error) {
    console.error("Palette generation failed:", error);
    setPalette([]);
  }
}

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12">
          <p className="mb-3 text-sm font-medium text-gray-500">
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
  {palette.map((item) => (
    <div
      key={item.step}
      className={`flex items-center gap-4 rounded-xl border p-3 ${
        item.step === 500
          ? "border-2 border-black"
          : "border-gray-200"
      }`}
    >
      <div
        className="h-16 w-20 rounded-lg"
        style={{
          backgroundColor: item.hex,
        }}
      />

      <div className="w-16 text-sm font-medium">
        {item.step}
      </div>

      <div className="font-mono text-sm text-gray-600">
        {item.hex}
      </div>

      {item.step === 500 && (
        <div className="ml-auto rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
          Base
        </div>
      )}
    </div>
  ))}
</div>
          </section>
        )}
      </div>
    </main>
  );
}