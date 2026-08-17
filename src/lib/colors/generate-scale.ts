import { converter, formatHex, type Hsl } from "culori";

export type ColorToken = {
  step: number;
  hex: string;
};

export type ColorScale = {
  name: string;
  baseStep: number;
  tokens: ColorToken[];
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

const toHsl = converter("hsl");
const toRgb = converter("rgb");

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * Keep a value between 0 and 1.
 */
function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Interpolate between two numbers.
 */
function interpolate(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

/**
 * Interpolate hue using the shortest path around
 * the color wheel.
 */
function interpolateHue(start: number, end: number, amount: number): number {
  let difference = end - start;

  if (difference > 180) {
    difference -= 360;
  }

  if (difference < -180) {
    difference += 360;
  }

  return (start + difference * amount + 360) % 360;
}

/**
 * Create an HSL color.
 */
function createHsl(h: number, s: number, l: number): HslColor {
  return {
    h: ((h % 360) + 360) % 360,
    s: clamp(s),
    l: clamp(l),
  };
}

/**
 * Convert HSL to HEX.
 */
function hslToHex(color: HslColor): string {
  return formatHex({
    mode: "hsl",
    h: color.h,
    s: color.s,
    l: color.l,
  });
}

/**
 * Calculate perceived brightness using normalized RGB values.
 *
 * Returns a value between 0 and 1.
 */
function getPerceivedBrightness(hex: string): number {
  const rgb = toRgb(hex);

  if (!rgb) {
    return 0;
  }

  const r = rgb.r ?? 0;
  const g = rgb.g ?? 0;
  const b = rgb.b ?? 0;

  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Determine whether a color is effectively neutral.
 *
 * When saturation is essentially zero, hue has no visual
 * meaning, so we should never introduce a hue shift.
 */
function isNeutral(color: HslColor): boolean {
  return color.s < 0.01;
}

/**
 * Find the nearest "dark" primary hue.
 *
 * These are the approximate perceived-darkness anchors:
 *
 * Red     0°
 * Green   120°
 * Blue    240°
 */
function getDarkHue(hue: number): number {
  const darkHues = [0, 120, 240];

  let closest = darkHues[0];
  let smallestDistance = Infinity;

  for (const candidate of darkHues) {
    let distance = Math.abs(hue - candidate);

    if (distance > 180) {
      distance = 360 - distance;
    }

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closest = candidate;
    }
  }

  return closest;
}

/**
 * Find the nearest "bright" primary/secondary hue.
 *
 * These are the approximate perceived-brightness anchors:
 *
 * Yellow   60°
 * Cyan     180°
 * Magenta  300°
 */
function getBrightHue(hue: number): number {
  const brightHues = [60, 180, 300];

  let closest = brightHues[0];
  let smallestDistance = Infinity;

  for (const candidate of brightHues) {
    let distance = Math.abs(hue - candidate);

    if (distance > 180) {
      distance = 360 - distance;
    }

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closest = candidate;
    }
  }

  return closest;
}

/**
 * Move a hue a limited distance toward a target.
 *
 * We intentionally cap the movement so the scale still
 * feels like the same color.
 */
function moveHueToward(
  hue: number,
  target: number,
  maxRotation: number,
): number {
  let difference = target - hue;

  if (difference > 180) {
    difference -= 360;
  }

  if (difference < -180) {
    difference += 360;
  }

  const rotation = Math.min(Math.abs(difference), maxRotation);

  return (hue + Math.sign(difference) * rotation + 360) % 360;
}

/**
 * Interpolate two HSL colors.
 */
function interpolateColor(
  start: HslColor,
  end: HslColor,
  amount: number,
): HslColor {
  return createHsl(
    interpolateHue(start.h, end.h, amount),
    interpolate(start.s, end.s, amount),
    interpolate(start.l, end.l, amount),
  );
}

/**
 * Generate a perceptual color scale.
 *
 * The scale is built around three conceptual anchors:
 *
 * 100 = lightest
 * 500 = base
 * 900 = darkest
 *
 * Saturation, lightness and subtle hue movement are all
 * considered when creating the scale.
 */
export function generateColorScale(
  baseColor: string,
  name = "Primary",
): ColorScale {
  const parsed = toHsl(baseColor) as Hsl | undefined;

  if (!parsed) {
    throw new Error("Invalid color");
  }

  const base = createHsl(parsed.h ?? 0, parsed.s ?? 0, parsed.l ?? 0.5);

  const baseHex = formatHex(parsed);

  const isVeryLight = base.l >= 0.92;
  const isVeryDark = base.l <= 0.08;
  const neutral = isNeutral(base);

  if (neutral) {
    /*
     * Neutral scales use lightness as the primary dimension.
     *
     * Very light neutrals:
     * The input becomes 50.
     *
     * Very dark neutrals:
     * The input becomes 950.
     *
     * Normal neutrals:
     * The input remains 500.
     */

    const neutralLightness: Record<number, number> = {
      50: 0.98,
      100: 0.95,
      200: 0.9,
      300: 0.82,
      400: 0.72,
      500: 0.6,
      600: 0.48,
      700: 0.36,
      800: 0.24,
      900: 0.12,
      950: 0.06,
    };

    const tokens: ColorToken[] = [];

    let baseStep = 500;

    if (isVeryLight) {
      baseStep = 50;
    } else if (isVeryDark) {
      baseStep = 950;
    }

    for (const step of steps) {
      /*
       * Very light neutral.
       *
       * Example:
       * #FFFFFF → 50
       * #FAFAFA → 50
       */
      if (isVeryLight) {
        if (step === 50) {
          tokens.push({
            step,
            hex: baseHex,
          });
          continue;
        }

        tokens.push({
          step,
          hex: hslToHex(createHsl(0, 0, neutralLightness[step])),
        });

        continue;
      }

      /*
       * Very dark neutral.
       *
       * Example:
       * #000000 → 950
       * #0A0A0A → 950
       */
      if (isVeryDark) {
        if (step === 950) {
          tokens.push({
            step,
            hex: baseHex,
          });
          continue;
        }

        tokens.push({
          step,
          hex: hslToHex(createHsl(0, 0, neutralLightness[step])),
        });

        continue;
      }

      /*
       * Normal neutral.
       *
       * The input remains the 500 token.
       */
      if (step === 500) {
        tokens.push({
          step,
          hex: baseHex,
        });
        continue;
      }

      tokens.push({
        step,
        hex: hslToHex(createHsl(0, 0, neutralLightness[step])),
      });
    }

    return {
      name,
      baseStep,
      tokens,
    };
  }

  /*
   * -----------------------------------------------
   * COLORED PALETTE
   * -----------------------------------------------
   */

  /*
   * Determine the hues that help us move toward
   * visually brighter and darker versions.
   */
  const brightHue = getBrightHue(base.h);
  const darkHue = getDarkHue(base.h);

  /*
   * Keep hue rotation subtle.
   *
   * Highly saturated colors get slightly more rotation,
   * but never more than 20°.
   */
  const maxHueRotation = Math.min(20, Math.max(6, base.s * 20));

  /*
   * Light anchor.
   *
   * We increase lightness substantially while also
   * slightly increasing saturation.
   */
  const lightAnchor = createHsl(
    moveHueToward(base.h, brightHue, maxHueRotation),
    clamp(base.s * 1.08 + 0.02),
    Math.min(0.96, Math.max(0.9, base.l + 0.42)),
  );

  /*
   * Dark anchor.
   *
   * We move toward the nearest perceived-dark hue.
   */
  const darkAnchor = createHsl(
    moveHueToward(base.h, darkHue, maxHueRotation),
    clamp(base.s * 1.08 + 0.02),
    Math.max(0.08, Math.min(0.18, base.l - 0.32)),
  );

  /*
   * Light-side interpolation.
   */
  const lightAmounts: Record<number, number> = {
    50: -0.15,
    100: 0,
    200: 0.35,
    300: 0.62,
    400: 0.82,
  };

  /*
   * Dark-side interpolation.
   */
  const darkAmounts: Record<number, number> = {
    600: 0.18,
    700: 0.4,
    800: 0.62,
    900: 1,
    950: 1.08,
  };

  const tokens: ColorToken[] = [];

  for (const step of steps) {
    /*
     * Base color is always exactly 500.
     */
    if (step === 500) {
      tokens.push({
        step,
        hex: baseHex,
      });

      continue;
    }

    let color: HslColor;

    if (step < 500) {
      color = interpolateColor(lightAnchor, base, lightAmounts[step]);
    } else {
      color = interpolateColor(base, darkAnchor, darkAmounts[step]);
    }

    /*
     * Saturation compensation.
     *
     * As we approach either extreme, saturation tends
     * to become visually weaker. We compensate slightly.
     */
    const distanceFromMiddle = Math.abs(color.l - 0.5);

    const saturationBoost = distanceFromMiddle * base.s * 0.12;

    color = createHsl(color.h, clamp(color.s + saturationBoost), color.l);

    tokens.push({
      step,
      hex: hslToHex(color),
    });
  }

  /*
   * Development-only debugging.
   *
   * This gives us useful brightness values instead of
   * the previous 0/1 output.
   */
  if (process.env.NODE_ENV === "development") {
    console.table(
      tokens.map((token) => ({
        step: token.step,
        hex: token.hex,
        brightness: Number(getPerceivedBrightness(token.hex).toFixed(3)),
      })),
    );
  }

  return {
    name,
    baseStep: 500,
    tokens,
  };
}
