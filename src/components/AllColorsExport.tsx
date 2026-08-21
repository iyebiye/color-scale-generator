
"use client";

import { useState } from "react";
import type { ColorScale } from "@/lib/colors/generate-scale";

type AllColorsExportProps = {
  palettes: ColorScale[];
};

type ExportFormat = "css" | "json" | "figma";

export default function AllColorsExport({
  palettes,
}: AllColorsExportProps) {
  const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null);

  function generateCSS() {
    const lines: string[] = [":root {"];

    palettes.forEach((palette) => {
      palette.tokens.forEach((token) => {
        lines.push(
          `  --${palette.name.toLowerCase()}-${token.step}: ${token.hex};`,
        );
      });
    });

    lines.push("}");

    return lines.join("\n");
  }

  function generateJSON() {
    const output: Record<string, Record<string, string>> = {};

    palettes.forEach((palette) => {
      output[palette.name] = {};

      palette.tokens.forEach((token) => {
        output[palette.name][String(token.step)] = token.hex;
      });
    });

    return JSON.stringify(output, null, 2);
  }

  function hexToSrgbComponents(hex: string): [number, number, number] {
    const cleanHex = hex.replace("#", "");

    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

    return [
      Number(r.toFixed(6)),
      Number(g.toFixed(6)),
      Number(b.toFixed(6)),
    ];
  }

  function generateFigmaTokens() {
    const output: Record<string, unknown> = {
      $schema:
        "https://www.designtokens.org/schemas/2025.10/format.json",
      color: {},
    };

    palettes.forEach((palette) => {
      const paletteName = palette.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");

      const paletteTokens: Record<string, unknown> = {
        $type: "color",
      };

      palette.tokens.forEach((token) => {
        paletteTokens[String(token.step)] = {
          $value: {
            colorSpace: "srgb",
            components: hexToSrgbComponents(token.hex),
            hex: token.hex.toLowerCase(),
          },
        };
      });

      (output.color as Record<string, unknown>)[paletteName] =
        paletteTokens;
    });

    return JSON.stringify(output, null, 2);
  }

  function getContent(format: ExportFormat) {
    switch (format) {
      case "css":
        return generateCSS();

      case "json":
        return generateJSON();

      case "figma":
        return generateFigmaTokens();
    }
  }

  function getFilename(format: ExportFormat) {
    switch (format) {
      case "css":
        return "colorlab-colors.css";

      case "json":
        return "colorlab-colors.json";

      case "figma":
        return "colorlab-tokens.json";
    }
  }

  async function copy(format: ExportFormat) {
    try {
      await navigator.clipboard.writeText(getContent(format));

      setCopiedFormat(format);

      setTimeout(() => {
        setCopiedFormat(null);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy export:", error);
    }
  }

  function download(format: ExportFormat) {
    const content = getContent(format);
    const filename = getFilename(format);

    const blob = new Blob([content], {
      type: format === "css" ? "text/css" : "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  const formats: {
    id: ExportFormat;
    title: string;
    description: string;
  }[] = [
    {
      id: "css",
      title: "CSS",
      description: "CSS custom properties for your application.",
    },
    {
      id: "json",
      title: "JSON",
      description: "Structured color data for development.",
    },
    {
      id: "figma",
      title: "Figma Tokens",
      description:
        "Design tokens using the Design Tokens Community Group format.",
    },
  ];

  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <div className="mb-6">
        <p className="text-sm font-medium tracking-wide text-gray-500">
          EXPORT
        </p>

        <h2 className="mt-2 text-2xl font-semibold">
          Export your color system
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
          Take all your generated colors into your development and design
          workflow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {formats.map((format) => {
          const isCopied = copiedFormat === format.id;

          return (
            <div
              key={format.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <h3 className="font-semibold text-gray-900">
                {format.title}
              </h3>

              <p className="mt-2 min-h-10 text-sm leading-5 text-gray-500">
                {format.description}
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => copy(format.id)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium transition hover:bg-gray-50"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={() => download(format.id)}
                  className="flex-1 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}