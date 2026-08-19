"use client";

import { useState } from "react";
import type { ColorScale } from "@/lib/colors/generate-scale";
import { generateJsonTokens } from "@/lib/colors/export-json";
import { downloadFile } from "@/lib/colors/download";

type JsonExportProps = {
  palette: ColorScale;
};

export default function JsonExport({ palette }: JsonExportProps) {
  const [copied, setCopied] = useState(false);

  const json = generateJsonTokens(palette);

  function getFilename() {
    const name = palette.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    return `${name || "color-tokens"}.json`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(json);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy JSON:", error);
    }
  }

  function handleDownload() {
    downloadFile(
      json,
      getFilename(),
      "application/json;charset=utf-8",
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Design Tokens
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Export your palette as structured JSON tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950">
        <pre className="overflow-x-auto p-5 text-sm leading-6 text-gray-100">
          <code>{json}</code>
        </pre>
      </div>
    </section>
  );
}