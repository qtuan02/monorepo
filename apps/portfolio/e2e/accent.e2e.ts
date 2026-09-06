import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { hexToRgb, rgbDistance } from "../test/support/contrast";

/**
 * The accent is the one claim in this app no jsdom test can reach, because it
 * is a cascade result rather than a value in a file. `src/globals.css`
 * re-declares seven custom properties that `tooling/tailwind/theme.css` has
 * already declared, and whether the app's values win turns on cascade layers:
 * `theme.css` arrives through a plain `@import`, so it is unlayered, and an
 * unlayered declaration beats anything inside a `@layer`. One indentation level
 * further in — beside `--font-sans` — the override would compile, ship and lose
 * with nothing logged, and the CV would still be wearing the EMR product's
 * teal.
 *
 * `test/globals.test.ts` reads the stylesheet as text and pins that placement.
 * Only a browser resolves it, which is what this file is for.
 */

/** What each token has to come out as, once the cascade has run. */
const INDIGO = {
  light: {
    "--primary": "#4f39f6",
    "--primary-foreground": "#ffffff",
    "--ring": "#6262fa",
    "--accent": "#eff2fe",
    "--accent-foreground": "#432dd7",
    "--selection": "#4f39f6",
    "--selection-foreground": "#ffffff",
  },
  dark: {
    "--primary": "#7e89f9",
    "--primary-foreground": "#1a1b4d",
    "--ring": "#7e89f9",
    "--accent": "#2c306a",
    "--accent-foreground": "#cad2fb",
    "--selection": "#7e89f9",
    "--selection-foreground": "#1a1b4d",
  },
} as const;

/** The EMR product teal this app is getting out of, light and dark. */
const EMR_TEAL = ["#38a696", "#75cdc0"] as const;

/** A rounding step or two apart — the same colour. */
const SAME_COLOUR = 4;
/** Wide enough that a near-miss still reads as "not that colour". */
const NOT_THE_SAME_COLOUR = 40;

/**
 * Each token as the 8-bit sRGB a compositor would paint, read by filling a
 * canvas with it. Reading the property text instead would make this a test of
 * the serialiser: the source is OKLCH, but a production build ships an sRGB
 * fallback plus a `lab()` upgrade, so the string that comes back out is not the
 * string that went in — while the pixel is the same either way.
 */
async function paintedTokens(
  page: import("@playwright/test").Page,
  tokens: readonly string[],
) {
  return page.evaluate((names) => {
    const styles = getComputedStyle(document.documentElement);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) throw new Error("No 2d context");

    return names.map((name) => {
      const declared = styles.getPropertyValue(name).trim();

      context.clearRect(0, 0, 1, 1);
      context.fillStyle = declared;
      context.fillRect(0, 0, 1, 1);

      const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;

      return { name, declared, rgb: { r, g, b } };
    });
  }, tokens);
}

test.describe("indigo accent", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`resolves to indigo, not the EMR teal, in the ${theme} theme`, async ({
      page,
    }) => {
      await page.addInitScript((stored) => {
        window.localStorage.setItem("theme", stored);
      }, theme);
      await page.goto(ROUTES.HOME);

      // The page is up, and next-themes has stamped its class on <html>
      // (`attribute="class"`, which is what the `dark:` variant keys off).
      await expect(page.locator("#work")).toBeVisible();
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`),
      );

      const expected = INDIGO[theme];
      const painted = await paintedTokens(page, Object.keys(expected));

      expect(painted).toHaveLength(Object.keys(expected).length);

      for (const { name, declared, rgb } of painted) {
        expect(declared, name).not.toBe("");

        // The app's value won the cascade…
        expect(
          rgbDistance(rgb, hexToRgb(expected[name as keyof typeof expected])),
          `${name} is ${JSON.stringify(rgb)}, declared as "${declared}"`,
        ).toBeLessThan(SAME_COLOUR);

        // …and what lost was the teal, in both of its shades.
        for (const teal of EMR_TEAL) {
          expect(
            rgbDistance(rgb, hexToRgb(teal)),
            `${name} vs ${teal}`,
          ).toBeGreaterThan(NOT_THE_SAME_COLOUR);
        }
      }
    });
  }
});
