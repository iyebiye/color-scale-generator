"use client";

import { useState } from "react";
import type { ColorScale } from "@/lib/colors/generate-scale";
import ColorCard from "./ColorCard";

type PaletteProps = {
  palette: ColorScale[];
  copiedValue: string | null;
  onCopy: (value: string) => void;
};

export default function Palette({
  palette,
  copiedValue,
  onCopy,
}: PaletteProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  if (palette.length === 0) {
    return null;
  }

  function toggleDetails(step: number) {
    setExpandedStep((current) =>
      current === step ? null : step
    );
  }

  return (
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
        {palette.map((color) => (
          <ColorCard
            key={color.step}
            color={color}
            isExpanded={expandedStep === color.step}
            copiedValue={copiedValue}
            onCopy={onCopy}
            onToggle={toggleDetails}
          />
        ))}
      </div>
    </section>
  );
}