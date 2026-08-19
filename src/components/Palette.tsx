"use client";

import { useState } from "react";
import type { ColorScale } from "@/lib/colors/generate-scale";
import ColorCard from "./ColorCard";

type PaletteProps = {
  palette: ColorScale;
  originalPalette: ColorScale;
  copiedValue: string | null;
  onCopy: (value: string) => void;
  onColorChange: (step: number, value: string) => void;
  onResetColor: (step: number) => void;
  onResetPalette: () => void;
};

export default function Palette({
  palette,
  originalPalette,
  copiedValue,
  onCopy,
  onColorChange,
  onResetColor,
  onResetPalette,
}: PaletteProps & {
  onToggle?: (step: number) => void;
}) {
  const [expandedStep, setExpandedStep] =
    useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  function toggleDetails(step: number) {
    setExpandedStep((current) =>
      current === step ? null : step,
    );
  }

  const hasChanges = palette.tokens.some((token) => {
    const original = originalPalette.tokens.find(
      (originalToken) => originalToken.step === token.step,
    );

    return original?.hex !== token.hex;
  });

  function handleEditToggle() {
    setIsEditing((current) => !current);
  }

  function handleResetPalette() {
    onResetPalette();
    setIsEditing(false);
  }

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {palette.name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Generated using OKLCH.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && hasChanges && (
            <button
              type="button"
              onClick={handleResetPalette}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium transition hover:border-gray-300 hover:bg-gray-50"
            >
              Reset palette
            </button>
          )}

          <button
            type="button"
            onClick={handleEditToggle}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isEditing
                ? "bg-black text-white hover:bg-gray-800"
                : "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {isEditing ? "Done" : "Edit palette"}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {palette.tokens.map((color) => {
          const originalColor =
            originalPalette.tokens.find(
              (token) => token.step === color.step,
            );

          const isModified =
            originalColor?.hex !== color.hex;

          return (
            <ColorCard
              key={color.step}
              color={color}
              isBase={color.step === palette.baseStep}
              isExpanded={expandedStep === color.step}
              isEditing={isEditing}
              isModified={isModified}
              copiedValue={copiedValue}
              onCopy={onCopy}
              onToggle={toggleDetails}
              onColorChange={onColorChange}
              onReset={() => onResetColor(color.step)}
            />
          );
        })}
      </div>
    </section>
  );
}