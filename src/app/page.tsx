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

  function generatePalette() {
    console.log("Generate clicked");
    console.log("Color:", color);
    console.log("Name:", name);

    try {
      const generated = generateColorScale(
        color,
        name || "primary"
      );

      console.log("Generated palette:", generated);

      setPalette(generated);
    } catch (error) {
      console.error("Palette generation failed:", error);
      setPalette(null);
    }
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
        <header className="mb-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
            COLORLAB
          </p>

          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight">
            Build a color system from a single color.
          </h1>

          <p className="mt-4 max-w-xl text-lg text-gray-600">
            Generate tints and shades, refine your palette, and
            take it directly into your design workflow.
          </p>
        </header>

        <ColorInput
          name={name}
          color={color}
          onNameChange={setName}
          onColorChange={setColor}
          onGenerate={generatePalette}
        />

        {palette && (
          <Palette
            palette={palette}
            copiedValue={copiedValue}
            onCopy={copyValue}
          />
        )}
      </div>
    </main>
  );
}