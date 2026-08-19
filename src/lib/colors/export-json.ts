import type { ColorScale } from "./generate-scale";

export function generateJsonTokens(palette: ColorScale): string {
  const variableName = palette.name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  const tokens = palette.tokens.reduce(
    (result, token) => {
      const tokenName =
        token.step === palette.baseStep
          ? variableName
          : `${variableName}-${token.step}`;

      result[tokenName] = {
        value: token.hex,
        type: "color",
      };

      return result;
    },
    {} as Record<string, { value: string; type: string }>,
  );

  return JSON.stringify(
    {
      [variableName]: tokens,
    },
    null,
    2,
  );
}