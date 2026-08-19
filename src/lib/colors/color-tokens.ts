import type { ColorScale } from "./generate-scale";

export type DesignColorToken = {
  name: string;
  step: number;
  value: string;
  isBase: boolean;
};

export type DesignColorTokens = {
  name: string;
  baseStep: number;
  tokens: DesignColorToken[];
};

export function colorScaleToTokens(
  scale: ColorScale,
): DesignColorTokens {
  return {
    name: scale.name,
    baseStep: scale.baseStep,

    tokens: scale.tokens.map((token) => ({
      name: `${scale.name.toLowerCase()}-${token.step}`,
      step: token.step,
      value: token.hex,
      isBase: token.step === scale.baseStep,
    })),
  };
}