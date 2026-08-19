import type { ColorScale } from "./generate-scale";

export function generateCssVariables(palette: ColorScale): string {
  const variableName = palette.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  const lines = palette.tokens.map((token) => {
    const tokenName =
      token.step === palette.baseStep
        ? variableName
        : `${variableName}-${token.step}`;

    return `  --${tokenName}: ${token.hex};`;
  });

  return `:root {\n${lines.join("\n")}\n}`;
}