import { converter, formatHex, type Hsl } from "culori";

export type ColorToken = {
  name: string;
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
const toOklch = converter("oklch");

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function createToken(name: string, step: number, hex: string): ColorToken {
  return {
    name: `${name.toLowerCase()}-${step}`,
    step,
    hex,
  };
}

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

type OklchColor = {
  l: number;
  c: number;
  h: number;
};

function createOklch(l: number, c: number, h: number): OklchColor {
  return {
    l: clamp(l),
    c: Math.max(0, c),
    h: ((h % 360) + 360) % 360,
  };
}

function oklchToHex(color: OklchColor): string {
  return formatHex({
    mode: "oklch",
    l: color.l,
    c: color.c,
    h: color.h,
  });
}

function interpolateOklch(
  start: OklchColor,
  end: OklchColor,
  amount: number,
): OklchColor {
  return createOklch(
    interpolate(start.l, end.l, amount),
    interpolate(start.c, end.c, amount),
    interpolateHue(start.h, end.h, amount),
  );
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
            name,
            step,
            hex: baseHex,
          });
          continue;
        }

        tokens.push(
          createToken(
            name,
            step,
            hslToHex(createHsl(0, 0, neutralLightness[step])),
          ),
        );

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
            name,
            step,
            hex: baseHex,
          });
          continue;
        }

        tokens.push(
          createToken(
            name,
            step,
            hslToHex(createHsl(0, 0, neutralLightness[step])),
          ),
        );

        continue;
      }

      /*
       * Normal neutral.
       *
       * The input remains the 500 token.
       */
      if (step === 500) {
        tokens.push({
          name,
          step,
          hex: baseHex,
        });
        continue;
      }

      tokens.push(
        createToken(
          name,
          step,
          hslToHex(createHsl(0, 0, neutralLightness[step])),
        ),
      );
    }

    return {
      name,
      baseStep,
      tokens,
    };
  }

  /*
   * ---
   * COLORED PALETTE
   * ---
   *
   * Colored palettes always use 500 as the base token.
   *
   * The input color is preserved exactly at 500.
   *
   * We generate the lighter shades by moving toward a
   * near-white version of the base color, and the darker
   * shades by moving toward a near-black version.
   *
   * This is relative to the actual base color rather than
   * using fixed OKLCH lightness values. This means:
   *
   * #FFFF00 → 500
   * #0066FF → 500
   * #FF0000 → 500
   * #00AA66 → 500
   * #8000FF → 500
   *
   * regardless of their natural perceptual lightness.
   */

  const baseStep = 500;

  /*
   * Convert the input color to OKLCH.
   */
  const parsedOklch = toOklch(baseColor) as
    | {
        l?: number;
        c?: number;
        h?: number;
      }
    | undefined;

  if (!parsedOklch) {
    throw new Error("Invalid color");
  }

  const baseOklch = createOklch(
    parsedOklch.l ?? 0.5,
    parsedOklch.c ?? 0,
    parsedOklch.h ?? base.h,
  );

  /*
   * The input color must remain exactly as provided
   * at the 500 step.
   */
  const tokens: ColorToken[] = [];

  /*
   * Amounts determine how far each shade moves away
   * from the base.
   *
   * The values are deliberately progressive rather
   * than linear in lightness.
   */
  const lightAmounts: Record<number, number> = {
    50: 1.0,
    100: 0.82,
    200: 0.64,
    300: 0.46,
    400: 0.25,
  };

  const darkAmounts: Record<number, number> = {
    600: 0.18,
    700: 0.36,
    800: 0.56,
    900: 0.78,
    950: 1.0,
  };

  /*
   * Light endpoint.
   *
   * We move toward a very light version of the color,
   * while retaining some chroma so the palette still
   * reads as the same hue.
   *
   * This is especially important for colors such as
   * yellow, where the base color itself is already very
   * light.
   */
  const lightEndpoint = createOklch(0.995, baseOklch.c * 0.12, baseOklch.h);

  /*
   * Dark endpoint.
   *
   * We move toward a very dark version of the base
   * color while reducing chroma enough to prevent
   * extremely saturated colors from becoming muddy.
   */
  const darkEndpoint = createOklch(0.12, baseOklch.c * 0.45, baseOklch.h);

  for (const step of steps) {
    /*
     * 500 is ALWAYS the exact base color.
     */
    if (step === baseStep) {
      tokens.push({
        name,
        step,
        hex: baseHex,
      });

      continue;
    }

    let color: OklchColor;

    /*
     * Light shades: 50 → 400
     */
    if (step < baseStep) {
      const amount = lightAmounts[step];

      color = interpolateOklch(baseOklch, lightEndpoint, amount);
    } else {
      /*
       * Dark shades: 600 → 950
       */
      const amount = darkAmounts[step];

      color = interpolateOklch(baseOklch, darkEndpoint, amount);
    }

    tokens.push(createToken(name, step, oklchToHex(color)));
  }

  /*
   * Development-only debugging.
   */
  if (process.env.NODE_ENV === "development") {
    console.table(
      tokens.map((token) => {
        const hsl = toHsl(token.hex) as Hsl | undefined;

        const oklch = toOklch(token.hex) as
          | {
              l?: number;
              c?: number;
              h?: number;
            }
          | undefined;

        return {
          step: token.step,
          hex: token.hex,

          /*
           * This should be true ONLY for 500
           * in a colored palette.
           */
          isBase: token.step === baseStep,

          hue: oklch?.h !== undefined ? Number(oklch.h.toFixed(1)) : null,

          chroma: oklch?.c !== undefined ? Number(oklch.c.toFixed(3)) : null,

          oklchLightness:
            oklch?.l !== undefined ? `${(oklch.l * 100).toFixed(1)}%` : null,

          hslLightness:
            hsl?.l !== undefined ? `${(hsl.l * 100).toFixed(1)}%` : null,

          brightness: Number(getPerceivedBrightness(token.hex).toFixed(3)),
        };
      }),
    );
  }

  return {
    name,
    baseStep,
    tokens,
  };
}
