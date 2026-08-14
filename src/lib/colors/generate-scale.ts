import { converter, formatHex } from "culori";

export type ColorScale = {
  step: number;
  hex: string;
};

const toOklch = converter("oklch");
const toRgb = converter("rgb");

const lightSteps = [
  { step: 50, position: 0.96 },
  { step: 100, position: 0.88 },
  { step: 200, position: 0.76 },
  { step: 300, position: 0.60 },
  { step: 400, position: 0.38 },
];

const darkSteps = [
  { step: 600, position: 0.22 },
  { step: 700, position: 0.40 },
  { step: 800, position: 0.58 },
  { step: 900, position: 0.74 },
  { step: 950, position: 0.86 },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Smooth interpolation that keeps the middle
 * of the scale more controlled.
 */
function smoothStep(value: number) {
  return value * value * (3 - 2 * value);
}

/**
 * Checks whether an OKLCH color fits inside sRGB.
 */
function isInSrgbGamut(color: {
  mode: "oklch";
  l: number;
  c: number;
  h: number;
}) {
  const rgb = toRgb(color);

  if (!rgb) {
    return false;
  }

  const epsilon = 0.0001;

  return (
    (rgb.r ?? 0) >= -epsilon &&
    (rgb.r ?? 0) <= 1 + epsilon &&
    (rgb.g ?? 0) >= -epsilon &&
    (rgb.g ?? 0) <= 1 + epsilon &&
    (rgb.b ?? 0) >= -epsilon &&
    (rgb.b ?? 0) <= 1 + epsilon
  );
}

/**
 * Reduces chroma until the color fits inside
 * the sRGB gamut while preserving lightness
 * and hue as much as possible.
 */
function gamutMap(
  lightness: number,
  chroma: number,
  hue: number
) {
  const safeLightness = clamp(lightness);
  const safeChroma = Math.max(0, chroma);

  const initial = {
    mode: "oklch" as const,
    l: safeLightness,
    c: safeChroma,
    h: hue,
  };

  if (isInSrgbGamut(initial)) {
    return initial;
  }

  let low = 0;
  let high = safeChroma;

  for (let i = 0; i < 20; i++) {
    const middle = (low + high) / 2;

    const candidate = {
      mode: "oklch" as const,
      l: safeLightness,
      c: middle,
      h: hue,
    };

    if (isInSrgbGamut(candidate)) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return {
    mode: "oklch" as const,
    l: safeLightness,
    c: low,
    h: hue,
  };
}

function generateColor(
  base: {
    l: number;
    c: number;
    h: number;
  },
  targetLightness: number,
  position: number
) {
  const easedPosition = smoothStep(position);

  const lightness =
    base.l +
    (targetLightness - base.l) *
      easedPosition;

  /*
   * Reduce chroma gradually as we approach
   * either end of the scale.
   *
   * We keep more chroma than before so the
   * generated colors retain their identity.
   */
  const chroma =
    base.c *
    (1 - easedPosition * 0.65);

  return gamutMap(
    lightness,
    chroma,
    base.h
  );
}

export function generateColorScale(
  baseColor: string
): ColorScale[] {
  const color = toOklch(baseColor);

  if (!color) {
    throw new Error("Invalid color");
  }

  const base = {
    l: color.l ?? 0,
    c: color.c ?? 0,
    h: color.h ?? 0,
  };

  const palette: ColorScale[] = [];

  /*
   * LIGHT SIDE
   *
   * We stop at 0.97 rather than pushing all
   * the way to absolute white.
   */
  if (base.l < 0.999) {
    for (const { step, position } of lightSteps) {
      const generated = generateColor(
        base,
        0.97,
        position
      );

      palette.push({
        step,
        hex: formatHex(generated),
      });
    }
  }

  /*
   * BASE
   *
   * Always preserve the exact input color.
   */
  palette.push({
    step: 500,
    hex: formatHex(baseColor),
  });

  /*
   * DARK SIDE
   *
   * We stop at 0.08 rather than pushing
   * everything toward absolute black.
   */
  if (base.l > 0.001) {
    for (const { step, position } of darkSteps) {
      const generated = generateColor(
        base,
        0.08,
        position
      );

      palette.push({
        step,
        hex: formatHex(generated),
      });
    }
  }

  return palette;
}