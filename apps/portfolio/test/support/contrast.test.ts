import { describe, expect, it } from "vitest";

import {
  contrastRatio,
  hexToRgb,
  oklchToRgb,
  parseOklch,
  rgbDistance,
  rgbToHex,
} from "./contrast";

/**
 * The colour maths in `contrast.ts` is hand-rolled — no `culori`, no
 * `wcag-contrast` — so `globals.test.ts` is only as trustworthy as this file.
 * Every case below is checked against a value published somewhere else rather
 * than against this implementation's own output: a helper that agrees with
 * itself proves nothing.
 */
describe("WCAG 2 contrast ratio", () => {
  /**
   * The two ends of the scale, and the grey WCAG's own understanding-document
   * uses as the AA borderline for normal text on white. Getting `#767676`
   * right to two decimals means the sRGB transfer curve and the luminance
   * coefficients are both correct, not merely close.
   */
  it.each([
    { foreground: "#000000", background: "#ffffff", expected: 21 },
    { foreground: "#ffffff", background: "#ffffff", expected: 1 },
    { foreground: "#767676", background: "#ffffff", expected: 4.54 },
    { foreground: "#0000ff", background: "#ffffff", expected: 8.59 },
    { foreground: "#ff0000", background: "#ffffff", expected: 3.998 },
  ])(
    "reads $foreground on $background as $expected:1",
    ({ foreground, background, expected }) => {
      expect(
        contrastRatio(hexToRgb(foreground), hexToRgb(background)),
      ).toBeCloseTo(expected, 2);
    },
  );

  it("is symmetric — the ratio does not depend on which colour is named first", () => {
    const teal = hexToRgb("#38a696");
    const white = hexToRgb("#ffffff");

    expect(contrastRatio(teal, white)).toBe(contrastRatio(white, teal));
  });
});

/**
 * `theme.css` writes every colour in OKLCH and names the source hex it was
 * converted from in a comment beside it. Those comments are an oracle this
 * file did not produce: if `oklchToRgb` walks OKLab → linear sRGB → the sRGB
 * transfer curve correctly, it has to land back on the hex the theme's author
 * started from, to the byte.
 */
describe("OKLCH → sRGB", () => {
  it.each([
    { oklch: "oklch(1 0 0)", hex: "#ffffff" },
    { oklch: "oklch(0 0 0)", hex: "#000000" },
    { oklch: "oklch(0.6591 0.1012 181.55)", hex: "#38a696" },
    { oklch: "oklch(0.7893 0.0875 183.49)", hex: "#75cdc0" },
    { oklch: "oklch(0.6749 0.1578 249.84)", hex: "#3b9bf3" },
    { oklch: "oklch(0.6853 0.1346 160.83)", hex: "#36b37e" },
    { oklch: "oklch(0.6831 0.2105 12.4)", hex: "#ff5075" },
    { oklch: "oklch(0.8308 0.1314 68.79)", hex: "#ffb762" },
  ])("converts $oklch to $hex", ({ oklch, hex }) => {
    expect(rgbToHex(oklchToRgb(parseOklch(oklch)))).toBe(hex);
  });

  it("reads a value Biome has wrapped across lines", () => {
    expect(parseOklch("oklch(\n    0.6591 0.1012 181.55\n  )")).toEqual({
      l: 0.6591,
      c: 0.1012,
      h: 181.55,
    });
  });

  it("rejects anything that is not an oklch() value, rather than guessing", () => {
    expect(() => parseOklch("var(--primary)")).toThrow(/Not an oklch/);
  });
});

describe("sRGB distance", () => {
  it("is 0 for the same colour and 441 for black against white", () => {
    expect(rgbDistance(hexToRgb("#38a696"), hexToRgb("#38a696"))).toBe(0);
    expect(rgbDistance(hexToRgb("#000000"), hexToRgb("#ffffff"))).toBeCloseTo(
      441.67,
      1,
    );
  });
});
