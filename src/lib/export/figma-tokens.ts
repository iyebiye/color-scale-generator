import type { ColorScale } from "@/lib/colors/generate-scale";

type FigmaColorValue = {
  colorSpace: "srgb";
  components: [number, number, number];
  alpha: 1;
  hex: string;
};

type FigmaColorToken = {
  $type: "color";
  $value: FigmaColorValue;
};

function hexToRgbComponents(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  return [r, g, b];
}

export function generateFigmaTokens(
  palette: ColorScale,
): Record<string, Record<string, FigmaColorToken>> {
  const tokens: Record<string, Record<string, FigmaColorToken>> = {};

  const paletteName = palette.name.toLowerCase().replace(/\s+/g, "-");

  tokens[paletteName] = {};

  palette.tokens.forEach((token) => {
    tokens[paletteName][String(token.step)] = {
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: hexToRgbComponents(token.hex),
        alpha: 1,
        hex: token.hex.toUpperCase(),
      },
    };
  });

  return tokens;
}