"use client";

import type { ColorScale } from "@/lib/colors/generate-scale";

type ColorScaleSidebarProps = {
  palettes: ColorScale[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAddColor: () => void;
  onAllColors: () => void;
};

export default function ColorScaleSidebar({
  palettes,
  selectedIndex,
  onSelect,
  onAddColor,
  onAllColors,
}: ColorScaleSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-6">
        <p className="text-sm font-semibold tracking-[0.2em] text-gray-900">
          COLORLAB
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <button
          type="button"
          onClick={onAllColors}
          className="mb-6 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-white"
        >
          All colors
        </button>

        <div className="mb-3 px-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Color scales
          </p>
        </div>

        <div className="space-y-1">
          {palettes.map((palette, index) => {
            const baseColor =
              palette.tokens.find(
                (token) => token.step === palette.baseStep,
              )?.hex ?? "";

            const isSelected = selectedIndex === index;

            return (
              <button
                key={`${palette.name}-${index}`}
                type="button"
                onClick={() => onSelect(index)}
                className={`w-full rounded-lg p-2 text-left transition ${
                  isSelected
                    ? "bg-white shadow-sm ring-1 ring-gray-200"
                    : "hover:bg-white/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 shrink-0 rounded-md border border-black/5"
                    style={{ backgroundColor: baseColor }}
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {palette.name}
                    </p>

                    <p className="font-mono text-xs uppercase text-gray-400">
                      {baseColor}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add color */}
      <div className="border-t border-gray-200 p-4">
        <button
          type="button"
          onClick={onAddColor}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <span className="text-lg leading-none">+</span>
          Add color
        </button>
      </div>
    </aside>
  );
}