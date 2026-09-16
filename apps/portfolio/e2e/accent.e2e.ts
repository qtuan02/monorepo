import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { ROUTES } from "../src/constants/routes";
import { hexToRgb, rgbDistance } from "../test/support/contrast";

/**
 * The palette is the one claim in this app no jsdom test can reach, because it
 * is a cascade result rather than a value in a file. `src/globals.css`
 * re-declares twelve custom properties that `tooling/tailwind/theme.css` has
 * already declared or never knew, plus `--radius`, and whether the app's values
 * win turns on cascade layers: `theme.css` arrives through a plain `@import`,
 * so it is unlayered, and an unlayered declaration beats anything inside a
 * `@layer`. One indentation level further in — beside `--font-sans` — the
 * override would compile, ship and lose with nothing logged, and the CV would
 * still be wearing the EMR product's teal, blue-grey text and invisible borders.
 *
 * `test/globals.test.ts` reads the stylesheet as text and pins that placement.
 * Only a browser resolves it, which is what this file is for.
 */

/** What each token has to come out as, once the cascade has run. */
const PALETTE = {
  light: {
    // the two neutrals and the shadow — ink
    "--foreground": "#0a0a0a",
    "--border": "#0a0a0a",
    "--hard-shadow": "#0a0a0a",
    // the indigo accent
    "--primary": "#4f39f6",
    "--primary-foreground": "#ffffff",
    "--ring": "#6262fa",
    "--accent": "#eff2fe",
    "--accent-foreground": "#432dd7",
    "--selection": "#4f39f6",
    "--selection-foreground": "#ffffff",
    // the yellow highlight
    "--highlight": "#ffe14d",
    "--highlight-foreground": "#0a0a0a",
  },
  dark: {
    // inverted, not dimmed: the same three go to near-white
    "--foreground": "#fafafa",
    "--border": "#fafafa",
    "--hard-shadow": "#fafafa",
    "--primary": "#7e89f9",
    "--primary-foreground": "#1a1b4d",
    "--ring": "#7e89f9",
    "--accent": "#2c306a",
    "--accent-foreground": "#cad2fb",
    "--selection": "#7e89f9",
    "--selection-foreground": "#1a1b4d",
    // dulled for a dark ground; the ink on it stays
    "--highlight": "#eec743",
    "--highlight-foreground": "#0a0a0a",
  },
} as const;

/** The EMR product teal this app is getting out of, light and dark. */
const EMR_TEAL = ["#38a696", "#75cdc0"] as const;

/**
 * The EMR text and border this app is also getting out of, by the token that
 * replaces each. The border is the telling one: `#f0f0f0` on `#f8f8f9` is a
 * card with no edge, and a test that only asked "is it teal?" would wave it
 * through. Light only: the theme's dark text already sits at the pole, and its
 * dark border is a 10% white that no opaque hex stands for.
 */
const EMR_NEUTRALS: Partial<Record<keyof (typeof PALETTE)["light"], string>> = {
  "--foreground": "#3d4c63",
  "--border": "#f0f0f0",
};

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
async function paintedTokens(page: Page, tokens: readonly string[]) {
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

async function openHomeIn(page: Page, theme: "light" | "dark") {
  await page.addInitScript((stored) => {
    window.localStorage.setItem("theme", stored);
  }, theme);
  await page.goto(ROUTES.HOME);

  // The page is up, and next-themes has stamped its class on <html>
  // (`attribute="class"`, which is what the `dark:` variant keys off).
  await expect(page.locator("#work")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
}

test.describe("the palette", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`resolves to the app's own tokens, not the EMR palette, in the ${theme} theme`, async ({
      page,
    }) => {
      await openHomeIn(page, theme);

      const expected = PALETTE[theme];
      const painted = await paintedTokens(page, Object.keys(expected));

      expect(painted).toHaveLength(Object.keys(expected).length);

      for (const { name, declared, rgb } of painted) {
        const token = name as keyof typeof expected;

        expect(declared, name).not.toBe("");

        // The app's value won the cascade…
        expect(
          rgbDistance(rgb, hexToRgb(expected[token])),
          `${name} is ${JSON.stringify(rgb)}, declared as "${declared}"`,
        ).toBeLessThan(SAME_COLOUR);

        // …and what lost was the EMR palette: the teal in both of its shades,
        // and — for the token that replaces each — the blue-grey text and the
        // near-invisible border.
        const replaced = theme === "light" ? EMR_NEUTRALS[token] : undefined;

        for (const emr of replaced ? [...EMR_TEAL, replaced] : EMR_TEAL) {
          expect(
            rgbDistance(rgb, hexToRgb(emr)),
            `${name} vs ${emr}`,
          ).toBeGreaterThan(NOT_THE_SAME_COLOUR);
        }
      }
    });
  }
});

test.describe("the radius", () => {
  /**
   * `--radius: 0px` is one line, and `theme.css` derives every `rounded-*`
   * size from it — so the claim is not that the line is there (the text test
   * has that) but that a primitive on the page actually has no corners. A badge
   * (`rounded-4xl`, the widest step) and a card (`rounded-xl`) are the two
   * that would show a leftover curve first. Located by the `data-slot` every
   * primitive stamps on its root: the assertion is about the primitive's box,
   * which has no accessible name to ask for.
   */
  test("squares the shared primitives on the page", async ({ page }) => {
    await openHomeIn(page, "light");

    for (const slot of ["badge", "card"]) {
      const element = page.locator(`[data-slot="${slot}"]`).first();

      await expect(element, slot).toBeAttached();
      await expect(element, slot).toHaveCSS("border-radius", "0px");
    }
  });
});
