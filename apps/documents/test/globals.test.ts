import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import type { Rgb } from "./support/contrast";
import {
  contrastRatio,
  hexToRgb,
  oklchToRgb,
  parseOklch,
} from "./support/contrast";
import {
  atRuleRegions,
  declarationsOf,
  declared,
  unconditional,
  withoutComments,
} from "./support/css-tokens";

/**
 * The token contract of the Prism palette (ADR-0009). The stylesheet is read as
 * **text**: a jsdom test computes no styles, and the palette lives in custom
 * properties only a real cascade resolves. What can be asserted is which tokens
 * are overridden, where in the cascade, and the contrast their values give —
 * measured on the *effective glass* a panel shows over the worst patch of
 * aurora, because that is the ground a reader actually sees the ink on.
 */
// `process.cwd()` is the app root — Vitest sets it from this project's config.
const appRoot = process.cwd();

const globalsSource = withoutComments(
  readFileSync(resolve(appRoot, "src/globals.css"), "utf8"),
);
const themeSource = withoutComments(
  readFileSync(resolve(appRoot, "../../tooling/tailwind/theme.css"), "utf8"),
);

/**
 * The nine tokens of `colors#17` plus the three the brief derives from them
 * (popover, input, selection), each with its `-foreground` where the theme has
 * one. Held to exactly this set: status colours, charts and the sidebar stay
 * the theme's, and a token creeping in on the side has to be added here first.
 */
const OVERRIDDEN_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "border",
  "input",
  "ring",
  "selection",
  "selection-foreground",
] as const;

/** A sample of what must stay the theme's — one of each family. */
const THEME_OWNED_TOKENS = [
  "destructive",
  "success",
  "warning",
  "info",
  "chart-1",
  "sidebar",
  "sidebar-primary",
  "surface",
  "code",
] as const;

/** Every ink/fill pair the primitives paint, and the ratio each has to clear. */
const TEXT_PAIRS = [
  ["foreground", "background"],
  ["foreground", "card"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["selection-foreground", "selection"],
] as const;

/** Indigo for everything but the accent; the accent is orange. */
const INDIGO_HUE = { from: 255, to: 290 } as const;
const ORANGE_HUE = { from: 35, to: 55 } as const;

/**
 * The aurora stops of the direction (brief §2c), and the glass over them. A
 * light panel is 58% white; a dark panel is 60% of the card colour. The pink
 * and amber blobs are the light theme's worst patches, the violet blob the
 * dark theme's — the aurora runs at half opacity there, so this is
 * conservative.
 */
const AURORA = {
  pink: "#f472b6",
  amber: "#fbbf24",
  violet: "#8b5cf6",
} as const;

function composite(top: Rgb, alpha: number, under: Rgb): Rgb {
  const mix = (a: number, b: number) => Math.round(alpha * a + (1 - alpha) * b);

  return {
    r: mix(top.r, under.r),
    g: mix(top.g, under.g),
    b: mix(top.b, under.b),
  };
}

const themes = {
  light: {
    override: declarationsOf(unconditional(globalsSource), ":root"),
    base: declarationsOf(themeSource, ":root"),
    glass: (card: Rgb) => [
      composite(card, 0.58, hexToRgb(AURORA.pink)),
      composite(card, 0.58, hexToRgb(AURORA.amber)),
    ],
  },
  dark: {
    override: declarationsOf(unconditional(globalsSource), ".dark"),
    base: declarationsOf(themeSource, ".dark"),
    glass: (card: Rgb) => [composite(card, 0.6, hexToRgb(AURORA.violet))],
  },
} as const;

describe.each(Object.entries(themes))(
  "%s palette",
  (theme, { override, base, glass }) => {
    const rgb = (token: string) =>
      oklchToRgb(parseOklch(declared(override, token)));
    const panels = glass(rgb("card"));

    it("overrides exactly the listed tokens, in oklch", () => {
      const colourTokens = Object.keys(override).filter((token) =>
        (override[token] ?? "").startsWith("oklch("),
      );

      expect(colourTokens.sort()).toEqual([...OVERRIDDEN_TOKENS].sort());
    });

    it("leaves status, chart, sidebar and surface tokens to the theme", () => {
      for (const token of THEME_OWNED_TOKENS) {
        expect(base[token], token).toBeDefined();
        expect(override[token], token).toBeUndefined();
      }
    });

    it("declares every token opaque, so the ratios below are the colours a reader sees", () => {
      for (const token of OVERRIDDEN_TOKENS) {
        expect(declared(override, token), token).not.toContain("/");
      }
    });

    it("keeps the selection pair a mirror of the primary pair, as theme.css does", () => {
      expect(override.selection).toBe(override.primary);
      expect(override["selection-foreground"]).toBe(
        override["primary-foreground"],
      );
    });

    it("keeps the input on the border, as theme.css does", () => {
      expect(override.input).toBe(override.border);
    });

    it("is indigo throughout and orange on the accent — achromatic aside", () => {
      // The accent's own ink is the night ground, indigo like everything else.
      for (const token of OVERRIDDEN_TOKENS) {
        const { c, h } = parseOklch(declared(override, token));
        if (c === 0) continue;
        const band = token === "accent" ? ORANGE_HUE : INDIGO_HUE;
        expect(h, token).toBeGreaterThanOrEqual(band.from);
        expect(h, token).toBeLessThanOrEqual(band.to);
      }
    });

    it.each(TEXT_PAIRS)("reads AA: %s on %s ≥ 4.5:1", (ink, fill) => {
      expect(contrastRatio(rgb(ink), rgb(fill))).toBeGreaterThanOrEqual(4.5);
    });

    it.each(["foreground", "muted-foreground"])(
      "reads AA on the glass over the worst aurora: %s ≥ 4.5:1",
      (ink) => {
        for (const panel of panels) {
          expect(contrastRatio(rgb(ink), panel)).toBeGreaterThanOrEqual(4.5);
        }
      },
    );

    it("reads as a focus indicator: ring on background, card and glass ≥ 3:1", () => {
      for (const ground of [rgb("background"), rgb("card"), ...panels]) {
        expect(contrastRatio(rgb("ring"), ground)).toBeGreaterThanOrEqual(3);
      }
    });

    it("draws an edge a reader can see: border on background and card ≥ 1.3:1", () => {
      // The theme's own light border reads 1.09:1 on its background — no edge
      // at all. This one is the soft edge of a glass panel rather than a 3:1
      // line: on this palette a 3:1 border is a mid-indigo rule around every
      // card and input, which is the focus ring's job, asserted above.
      expect(
        contrastRatio(rgb("border"), rgb("background")),
      ).toBeGreaterThanOrEqual(1.3);
      expect(contrastRatio(rgb("border"), rgb("card"))).toBeGreaterThanOrEqual(
        1.3,
      );
    });

    if (theme === "dark") {
      it("is an indigo night, not the theme's grey and not the light theme inverted", () => {
        // Same hue as the light theme, with chroma the theme's greys never
        // have; and the ground is not the light foreground inverted — it is
        // its own, darker colour.
        expect(parseOklch(declared(override, "background")).c).toBeGreaterThan(
          0.02,
        );
        expect(parseOklch(declared(override, "foreground")).c).toBeGreaterThan(
          0.02,
        );
        expect(parseOklch(declared(override, "background")).l).toBeLessThan(
          0.2,
        );
      });
    }
  },
);

describe("the radius", () => {
  it("is 1.125rem — with a unit, so theme.css's calc() derivations stay lengths", () => {
    expect(themes.light.override.radius).toBe("1.125rem");
    expect(themes.dark.override.radius).toBeUndefined();
  });
});

describe("the fonts", () => {
  const baseRoot = declarationsOf(
    atRuleRegions(globalsSource, "layer base").join("\n"),
    ":root",
  );

  it("declares the three font variables theme.css maps its utilities onto", () => {
    expect(declared(baseRoot, "font-sans")).toMatch(/system-ui/);
    expect(declared(baseRoot, "font-heading")).toMatch(/^"Outfit Variable"/);
    expect(declared(baseRoot, "font-mono")).toMatch(
      /^"JetBrains Mono Variable"/,
    );
  });

  it("bundles both webfonts through @fontsource-variable, never a font CDN", () => {
    expect(globalsSource).toContain('@import "@fontsource-variable/outfit";');
    expect(globalsSource).toContain(
      '@import "@fontsource-variable/jetbrains-mono";',
    );
    expect(globalsSource).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
  });
});

describe("where the override sits in the cascade", () => {
  /**
   * `@monorepo/tailwind-config/globals` imports `theme.css` with a plain
   * `@import`, so its `:root` / `.dark` blocks are **unlayered** — and an
   * unlayered declaration beats one in any `@layer`, whatever the source order.
   * An override written inside `@layer base` (where the fonts live) would
   * compile, ship, and lose silently.
   */
  it("keeps every overridden token, and the radius, outside every @layer block", () => {
    for (const region of atRuleRegions(globalsSource, "layer")) {
      for (const token of [...OVERRIDDEN_TOKENS, "radius"]) {
        expect(region, token).not.toMatch(new RegExp(`--${token}:`));
      }
    }
  });

  it("switches the primitives' open/close animations off under reduced motion", () => {
    const [region] = atRuleRegions(globalsSource, "media");

    expect(region).toContain("prefers-reduced-motion: reduce");
    expect(region).toMatch(
      /\[data-open\],\s*\[data-closed\]\s*\{\s*animation:\s*none;/,
    );
  });

  it("wires ::selection to the selection tokens, which theme.css declares but never applies", () => {
    const rule = globalsSource.match(/::selection\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toContain("var(--selection)");
    expect(rule).toContain("var(--selection-foreground)");
  });
});

/**
 * The override only holds if nothing in the app paints past the tokens: a
 * `text-gray-400` or a `bg-white` is the same in both themes and reads wrong
 * in one of them. Checked statically over every source file.
 */
describe("no colour outside the tokens", () => {
  const appSources = readdirSync(resolve(appRoot, "src"), {
    recursive: true,
    encoding: "utf8",
  })
    .filter(
      (entry) => /\.(tsx?|css)$/.test(entry) && !entry.includes("generated"),
    )
    .map((entry) => resolve(appRoot, "src", entry));

  const RAW_COLOUR_CLASS =
    /\b(?:text|bg|border|from|to|via|fill|stroke|ring|outline|shadow)-(?:white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d+)?\b/;

  it("writes no Tailwind palette class and no hex literal in a component", () => {
    for (const file of appSources) {
      if (file.endsWith(".css")) continue;
      const source = withoutComments(readFileSync(file, "utf8"));

      expect(source, file).not.toMatch(RAW_COLOUR_CLASS);
      expect(source, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });
});
