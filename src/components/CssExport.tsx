"use client";

import { useEffect, useRef, useState } from "react";
import type { ColorScale } from "@/lib/colors/generate-scale";
import { generateCssVariables } from "@/lib/colors/export-css";
import { downloadFile } from "@/lib/colors/download";

type CssExportProps = {
  palette: ColorScale;
};

export default function CssExport({ palette }: CssExportProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const css = generateCssVariables(palette);

  function getFilename() {
    const name = palette.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");

    return `${name || "color-tokens"}.css`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(css);

      setCopied(true);
      setIsOpen(false);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy CSS:", error);
    }
  }

  function handleDownload() {
    downloadFile(css, getFilename(), "text/css;charset=utf-8");
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">CSS Variables</h2>

          <p className="mt-1 text-sm text-gray-500">
            Use these variables directly in your CSS.
          </p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            {copied ? "Copied!" : "Action"}

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {isOpen && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
            >
              <button
                type="button"
                onClick={handleCopy}
                role="menuitem"
                className="w-full rounded-md px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Copy CSS
              </button>

              <button
                type="button"
                onClick={handleDownload}
                role="menuitem"
                className="w-full rounded-md px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Download CSS
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950">
        <pre className="overflow-x-auto p-5 text-sm leading-6 text-gray-100">
          <code>{css}</code>
        </pre>
      </div>
    </section>
  );
}
