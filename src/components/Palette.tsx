"use client";

import { useState } from "react";
import type { ColorScale } from "@/lib/colors/generate-scale";
import ColorCard from "./ColorCard";

type PaletteProps = {
  palette: ColorScale;
  originalPalette: ColorScale;
  copiedValue: string | null;
  onCopy: (value: string) => void;

  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
  onReset: () => void;
  onColorChange: (step: number, value: string) => void;
  onResetColor: (step: number) => void;
};

export default function Palette({
  palette,
  originalPalette,
  copiedValue,
  onCopy,
  isEditing,
  onEdit,
  onDone,
  onReset,
  onColorChange,
  onResetColor,
}: PaletteProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  function toggleDetails(step: number) {
    setExpandedStep((current) => (current === step ? null : step));
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{palette.name}</h2>

          <p className="mt-1 text-sm text-gray-500">Generated using OKLCH.</p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              type="button"
              onClick={onDone}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              Edit palette
            </button>
          )}

          {!isEditing && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Reset to original
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {palette.tokens.map((color) => {
          const originalColor = originalPalette.tokens.find(
            (token) => token.step === color.step,
          );

          const isModified =
            originalColor?.hex.toLowerCase() !== color.hex.toLowerCase();

          return (
            <ColorCard
              key={color.step}
              color={color}
              isBase={color.step === palette.baseStep}
              isEditing={isEditing}
              isExpanded={expandedStep === color.step}
              copiedValue={copiedValue}
              onCopy={onCopy}
              onToggle={toggleDetails}
              onColorChange={onColorChange}
              isModified={isModified}
              onReset={() => onResetColor(color.step)}
            />
          );
        })}
      </div>
    </section>
  );
}
