/**
 * OKLCH → sRGB → WCAG 2 contrast, by hand.
 *
 * The theme writes every colour in OKLCH, and the contrast an accessibility
 * checker reports is computed on the 8-bit sRGB the browser actually paints.
 * This walks the same path — OKLab, the linear-sRGB matrix, the sRGB transfer
 * curve, quantisation to a hex triplet — so a ratio asserted here is the one
 * `getComputedStyle` and WebAIM agree on, not a value read off the OKLCH
 * lightness axis (which is not what WCAG measures).
 *
 * Matrices from Björn Ottosson's OKLab reference implementation. Copied from
 * `apps/portfolio/test/support` — an app never imports another app's test tree.
 */

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parses `oklch(L C H)` — whitespace-tolerant, so a multi-line value reads too. */
export function parseOklch(value: string): Oklch {
  const match = value.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/[^)]*)?\)/,
  );

  if (!match) {
    throw new Error(`Not an oklch() value: ${value}`);
  }

  return {
    l: Number(match[1]),
    c: Number(match[2]),
    h: Number(match[3]),
  };
}

/** OKLCH → 8-bit sRGB, clipped to the gamut the browser clips to. */
export function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lc = l_ ** 3;
  const mc = m_ ** 3;
  const sc = s_ ** 3;

  const linear = [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ].map(linearToSrgbChannel);

  return {
    r: linear[0] ?? 0,
    g: linear[1] ?? 0,
    b: linear[2] ?? 0,
  };
}

function linearToSrgbChannel(value: number): number {
  const clipped = Math.min(1, Math.max(0, value));
  const encoded =
    clipped <= 0.0031308
      ? 12.92 * clipped
      : 1.055 * clipped ** (1 / 2.4) - 0.055;

  return Math.round(encoded * 255);
}

function srgbChannelToLinear(value: number): number {
  const normalized = value / 255;

  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2 relative luminance of an 8-bit sRGB colour. */
export function relativeLuminance({ r, g, b }: Rgb): number {
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

/** WCAG 2 contrast ratio, `1` (identical) to `21` (black on white). */
export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function hexToRgb(hex: string): Rgb {
  const digits = hex.replace("#", "");
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((d) => d + d)
          .join("")
      : digits;

  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}
