"use client";

import { useState } from "react";
import type { ColorToken } from "@/lib/colors/generate-scale";
import { getOklch, getRgb } from "@/lib/colors/format-color";
import ColorValue from "./ColorValue";

type ColorCardProps = {
  color: ColorToken;
  isBase: boolean;
  isExpanded: boolean;
  copiedValue: string | null;
  onCopy: (value: string) => void;
  onToggle: (step: number) => void;
  onColorChange: (step: number, value: string) => void;
  isModified: boolean;
  onReset: () => void;
  isEditing: boolean;
};

export default function ColorCard({
  color,
  isBase,
  isExpanded,
  copiedValue,
  onCopy,
  onToggle,
  onColorChange,
  isModified,
  onReset,
  isEditing,
}: ColorCardProps) {
  const [draftHex, setDraftHex] = useState<string | null>(null);

  const displayedHex = draftHex ?? color.hex;

  const rgb = getRgb(color.hex);
  const oklch = getOklch(color.hex);

  function handleHexChange(value: string) {
    setDraftHex(value);

    const normalized = value.startsWith("#") ? value : `#${value}`;

    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      onColorChange(color.step, normalized.toLowerCase());
    }
  }

  function handleHexBlur() {
    const normalized = displayedHex.startsWith("#")
      ? displayedHex
      : `#${displayedHex}`;

    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      const formatted = normalized.toLowerCase();

      setDraftHex(null);
      onColorChange(color.step, formatted);
    } else {
      setDraftHex(null);
    }
  }

  function handleReset() {
    setDraftHex(null);
    onReset();
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        isBase
          ? "border-2 border-black"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <div
          className="h-16 w-20 shrink-0 rounded-lg"
          style={{
            backgroundColor: color.hex,
          }}
        />

        <div className="w-16 shrink-0">
          <div className="text-sm font-medium">{color.step}</div>

          {isBase && (
            <div className="mt-1 inline-flex rounded-full bg-black px-2 py-0.5 text-[10px] font-medium text-white">
              Base
            </div>
          )}
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={displayedHex}
                onChange={(event) => handleHexChange(event.target.value)}
                onBlur={handleHexBlur}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }

                  if (event.key === "Escape") {
                    setDraftHex(null);
                    event.currentTarget.blur();
                  }
                }}
                aria-label={`Edit HEX value for ${color.step}`}
                className="w-full max-w-40 rounded-md border border-gray-200 bg-white px-2 py-1 font-mono text-sm uppercase text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
              />

              {isModified && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-2 text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-black"
                >
                  Reset
                </button>
              )}
            </div>
          ) : (
            <div className="font-mono text-sm uppercase text-gray-700">
              {color.hex}
            </div>
          )}

          {copiedValue === color.hex && (
            <div className="mt-1 text-xs text-gray-400">Copied!</div>
          )}
        </div>

        <button
          type="button"
          aria-label={
            isExpanded
              ? `Hide details for ${color.step}`
              : `Show details for ${color.step}`
          }
          aria-expanded={isExpanded}
          onClick={(event) => {
            event.stopPropagation();
            onToggle(color.step);
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
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 pb-3 pt-3">
          <div className="grid gap-2">
            <ColorValue
              label="HEX"
              value={color.hex.toUpperCase()}
              copiedValue={copiedValue}
              onCopy={onCopy}
            />

            <ColorValue
              label="RGB"
              value={rgb}
              copiedValue={copiedValue}
              onCopy={onCopy}
            />

            <ColorValue
              label="OKLCH"
              value={oklch}
              copiedValue={copiedValue}
              onCopy={onCopy}
            />
          </div>
        </div>
      )}
    </div>
  );
}
