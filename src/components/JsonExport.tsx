"use client";

import { useState } from "react";
import type { ColorScale } from "@/lib/colors/generate-scale";
import { generateJsonTokens } from "@/lib/colors/export-json";
import { downloadFile } from "@/lib/colors/download";
import { generateFigmaTokens } from "@/lib/export/figma-tokens";

type JsonExportProps = {
  palette: ColorScale;
};

export default function JsonExport({ palette }: JsonExportProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const json = generateJsonTokens(palette);

  function getFilename() {
    const name = palette.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    return `${name || "color-tokens"}.json`;
  }

  function getFigmaFilename() {
    const name = palette.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    return `${name || "color-tokens"}-figma.json`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(json);

      setCopied(true);
      setIsOpen(false);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy JSON:", error);
    }
  }

  function handleDownload() {
    downloadFile(json, getFilename(), "application/json;charset=utf-8");
    setIsOpen(false);
  }

  function exportFigmaTokens() {
    const tokens = generateFigmaTokens(palette);

    const figmaJson = JSON.stringify(tokens, null, 2);

    downloadFile(
      figmaJson,
      getFigmaFilename(),
      "application/json;charset=utf-8",
    );

    setIsOpen(false);
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Design Tokens</h2>

          <p className="mt-1 text-sm text-gray-500">
            Export your palette as structured Figma or JSON tokens.
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            {copied ? "Copied!" : "Action"}

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isOpen && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                onClick={handleCopy}
                role="menuitem"
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Copy JSON
              </button>

              <button
                type="button"
                onClick={handleDownload}
                role="menuitem"
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Download JSON
              </button>

              <div className="my-1 border-t border-gray-100" />

              <button
                type="button"
                onClick={exportFigmaTokens}
                role="menuitem"
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Download Figma Tokens
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-[360px] overflow-auto rounded-xl border border-gray-200 bg-gray-950">
        <pre className="min-w-max p-5 text-sm leading-6 text-gray-100">
          <code>{json}</code>
        </pre>
      </div>
    </section>
  );
}
