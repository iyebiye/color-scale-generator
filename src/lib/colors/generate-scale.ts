import { converter, formatHex } from "culori";

export type ColorToken = {
  step: number;
  hex: string;
};

export type ColorScale = {
  name: string;
  tokens: ColorToken[];
};

const toOklch = converter("oklch");

const lightSteps = [
  { step: 50, position: 0.92 },
  { step: 100, position: 0.84 },
  { step: 200, position: 0.72 },
  { step: 300, position: 0.56 },
  { step: 400, position: 0.32 },
];

const darkSteps = [
  { step: 600, position: 0.25 },
  { step: 700, position: 0.45 },
  { step: 800, position: 0.63 },
  { step: 900, position: 0.80 },
  { step: 950, position: 0.90 },
];

function generateColor(
  base: ReturnType<typeof toOklch>,
  lightness: number
) {
  if (!base) {
    throw new Error("Invalid color");
  }

  return formatHex({
    mode: "oklch",
    l: lightness,
    c: base.c ?? 0,
    h: base.h ?? 0,
  });
}

export function generateColorScale(
  baseColor: string,
  name = "primary"
): ColorScale {
  const color = toOklch(baseColor);

  if (!color) {
    throw new Error("Invalid color");
  }

  const baseLightness = color.l ?? 0.5;

  const tokens: ColorToken[] = [];

  // Black: there are no darker colors than the base.
  // Generate only the lighter side.
  if (baseLightness <= 0.001) {
    tokens.push(
      ...lightSteps.map(({ step, position }) => ({
        step,
        hex: generateColor(
          color,
          baseLightness +
            (1 - baseLightness) * position
        ),
      }))
    );

    tokens.push({
      step: 500,
      hex: formatHex(color),
    });

    return {
      name,
      tokens: tokens.sort((a, b) => a.step - b.step),
    };
  }

  // White: there are no lighter colors than the base.
  // Generate only the darker side.
  if (baseLightness >= 0.999) {
    tokens.push({
      step: 500,
      hex: formatHex(color),
    });

    tokens.push(
      ...darkSteps.map(({ step, position }) => ({
        step,
        hex: generateColor(
          color,
          baseLightness * (1 - position)
        ),
      }))
    );

    return {
      name,
      tokens: tokens.sort((a, b) => a.step - b.step),
    };
  }

  // Normal colors: generate both sides.
  tokens.push(
    ...lightSteps.map(({ step, position }) => ({
      step,
      hex: generateColor(
        color,
        baseLightness +
          (1 - baseLightness) * position
      ),
    }))
  );

  tokens.push({
    step: 500,
    hex: formatHex(color),
  });

  tokens.push(
    ...darkSteps.map(({ step, position }) => ({
      step,
      hex: generateColor(
        color,
        baseLightness * (1 - position)
      ),
    }))
  );

  return {
    name,
    tokens: tokens.sort((a, b) => a.step - b.step),
  };
}