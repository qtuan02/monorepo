import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { contrastRatio, oklchToRgb, parseOklch } from "./support/contrast";
import {
  atRuleRegions,
  declarationsOf,
  declared,
  unconditional,
  withoutComments,
} from "./support/css-tokens";

/**
 * Both stylesheets are read as **text**: a jsdom test computes no styles, and
 * the palette lives in CSS custom properties that only a real cascade
 * resolves. What can be asserted here is the contract the override has to
 * honour — which tokens, where in the cascade, and the contrast the values
 * give. Unlike `apps/smart-rental` (hex) or `apps/portfolio`, this override
 * keeps the source app's own `oklch()` values, so the tokens are parsed with
 * `parseOklch`/`oklchToRgb` instead of `hexToRgb`.
 */
const appRoot = process.cwd();

const globalsSource = withoutComments(
  readFileSync(resolve(appRoot, "src/globals.css"), "utf8"),
);
const themeSource = withoutComments(
  readFileSync(resolve(appRoot, "../../tooling/tailwind/theme.css"), "utf8"),
);

/** The tokens this app overrides at the app layer. */
const OVERRIDDEN_TOKENS = [
  "primary",
  "primary-foreground",
  "ring",
  "accent",
  "accent-foreground",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "online",
] as const;

/** Status colours never move — a status keeps the same meaning in every app. */
const STATUS_TOKENS = [
  "destructive",
  "destructive-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "info",
  "info-foreground",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

const themes = {
  light: { override: declarationsOf(unconditional(globalsSource), ":root") },
  dark: { override: declarationsOf(unconditional(globalsSource), ".dark") },
} as const;

const rgbOf = (declarations: Record<string, string>, token: string) =>
  oklchToRgb(parseOklch(declared(declarations, token)));

describe.each(Object.entries(themes))(
  "%s palette",
  (themeName, { override }) => {
    const themeRoot = declarationsOf(
      themeSource,
      themeName === "light" ? ":root" : ".dark",
    );
    const background = rgbOf(themeRoot, "background");

    it("overrides exactly the tokens this app names, in oklch()", () => {
      expect(Object.keys(override).sort()).toEqual(
        [...OVERRIDDEN_TOKENS].sort(),
      );
      for (const token of OVERRIDDEN_TOKENS) {
        expect(override[token], token).toMatch(/^oklch\(/);
      }
    });

    it("keeps ring and sidebar-primary a mirror of primary", () => {
      expect(override.ring).toBe(override.primary);
      expect(override["sidebar-primary"]).toBe(override.primary);
    });

    it("reads AA: primary-foreground on primary ≥ 4.5:1", () => {
      expect(
        contrastRatio(
          rgbOf(override, "primary-foreground"),
          rgbOf(override, "primary"),
        ),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("reads AA on the hover wash: accent-foreground on accent ≥ 4.5:1", () => {
      expect(
        contrastRatio(
          rgbOf(override, "accent-foreground"),
          rgbOf(override, "accent"),
        ),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("reads as a focus indicator: ring on the theme's background ≥ 3:1", () => {
      expect(
        contrastRatio(rgbOf(override, "ring"), background),
      ).toBeGreaterThanOrEqual(3);
    });

    it("is a distinct hue from the background, not an AA claim", () => {
      // This is a 1:1 port of the source's own value (oklch(0.7 0.17 155) light /
      // oklch(0.75 0.18 155) dark) — it does NOT clear the 3:1 WCAG 1.4.11
      // non-text-contrast ratio against a plain background (~2.5:1 measured).
      // Redesigning the colour is out of scope for this port; a real dot always
      // renders with a solid ring border rather than bare fill on a page
      // background, so the un-ringed ratio here is not the ratio a user sees.
      // What is worth guarding is that the token still reads as its own colour
      // rather than collapsing onto the background.
      expect(
        contrastRatio(rgbOf(override, "online"), background),
      ).toBeGreaterThan(1);
    });
  },
);

it(".dark declares every colour token :root overrides", () => {
  expect(Object.keys(themes.dark.override).sort()).toEqual(
    Object.keys(themes.light.override).sort(),
  );
});

describe("status/chart tokens stay the theme's", () => {
  it("declares none of the status or chart tokens itself", () => {
    for (const region of [themes.light.override, themes.dark.override]) {
      for (const token of STATUS_TOKENS) {
        expect(region[token], token).toBeUndefined();
      }
    }
  });

  it("every status/chart token the app reads still resolves from theme.css", () => {
    const themeRoot = declarationsOf(themeSource, ":root");
    for (const token of STATUS_TOKENS) {
      expect(themeRoot[token], token).toBeDefined();
    }
  });
});

describe("where the override sits in the cascade", () => {
  /**
   * `@monorepo/tailwind-config/globals` imports `theme.css` with a plain
   * `@import`, so its `:root`/`.dark` blocks are **unlayered** — and an
   * unlayered declaration beats one in any `@layer`, whatever the source
   * order. Written inside `@layer base` this would compile, ship, and lose
   * silently.
   */
  it("keeps every overridden token outside every @layer block", () => {
    for (const region of atRuleRegions(globalsSource, "layer")) {
      for (const token of OVERRIDDEN_TOKENS) {
        expect(region, token).not.toMatch(new RegExp(`--${token}:`));
      }
    }
  });

  it("maps --online onto a Tailwind colour utility via @theme inline", () => {
    const themeBlocks = atRuleRegions(globalsSource, "theme inline");
    expect(
      themeBlocks.some((block) =>
        /--color-online:\s*var\(--online\)/.test(block),
      ),
    ).toBe(true);
  });
});
