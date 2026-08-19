"use client";

import { useState } from "react";
import type { ColorScale } from "@/lib/colors/generate-scale";
import { generateCssVariables } from "@/lib/colors/export-css";

type CssExportProps = {
  palette: ColorScale;
};

export default function CssExport({ palette }: CssExportProps) {
  const [copied, setCopied] = useState(false);

  const css = generateCssVariables(palette);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(css);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy CSS:", error);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">CSS Variables</h2>

          <p className="mt-1 text-sm text-gray-500">
            Use these variables directly in your CSS.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {copied ? "Copied!" : "Copy CSS"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950">
        <pre className="overflow-x-auto p-5 text-sm leading-6 text-gray-100">
          <code>{css}</code>
        </pre>
      </div>
    </section>
  );
}