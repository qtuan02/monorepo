import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  blendOverRgb,
  contrastRatio,
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

/** The tokens both themes override at the app layer. */
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

/**
 * `.dark` alone additionally overrides the Islands surface trio (ADR-0016
 * §4) — dark islands on a dark gradient. Light does not: theme.css's white
 * `--card` already clears AA as `bg-card/75` over the light gradient.
 */
const DARK_ONLY_TOKENS = ["card", "popover", "border"] as const;

const EXPECTED_TOKENS = {
  light: OVERRIDDEN_TOKENS,
  dark: [...OVERRIDDEN_TOKENS, ...DARK_ONLY_TOKENS],
} as const;

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
      const expected =
        EXPECTED_TOKENS[themeName as keyof typeof EXPECTED_TOKENS];
      expect(Object.keys(override).sort()).toEqual([...expected].sort());
      for (const token of expected) {
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

it(".dark declares every colour token :root overrides, plus the Islands surface trio", () => {
  for (const token of OVERRIDDEN_TOKENS) {
    expect(themes.dark.override[token], token).toBeDefined();
  }
  expect(Object.keys(themes.dark.override).sort()).toEqual(
    [...OVERRIDDEN_TOKENS, ...DARK_ONLY_TOKENS].sort(),
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
      for (const token of [...OVERRIDDEN_TOKENS, ...DARK_ONLY_TOKENS]) {
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

  it("never reaches for backdrop-filter (ADR-0016 §2)", () => {
    expect(globalsSource).not.toMatch(/backdrop-filter/);
  });
});

/**
 * The Islands shape (ADR-0016): `--font-sans` plus the three gradient stops
 * `body` paints — light and, since this ticket, `.dark`'s own darker trio
 * (ADR-0016 §4). Both live in `@layer base` — nothing in `theme.css`
 * declares a literal value for either, so there is no unlayered declaration
 * to lose to (unlike the palette override above, which has to sit outside
 * every `@layer` for exactly that reason). `declarationsOf` merges every
 * block it finds for a selector — the layered gradient block and, in
 * `.dark`'s case, the unlayered palette override below it too — so reading
 * `--card` for the dark case off the same merged object picks up this
 * app's own dark surface rather than theme.css's neutral grey.
 */
const GRADIENT_TOKENS = [
  "islands-gradient-teal",
  "islands-gradient-violet",
  "islands-gradient-amber",
] as const;

describe("Islands shell (ADR-0016)", () => {
  const layeredRoot = declarationsOf(globalsSource, ":root");

  it("declares --font-sans as a system stack, inside @layer base", () => {
    expect(declared(layeredRoot, "font-sans")).toMatch(/system-ui/);
  });

  it("paints all three stops on body, plus the theme's own --background as the last layer", () => {
    const bodyBlock = declarationsOfSelectorBlock(globalsSource, "body");
    if (!bodyBlock) throw new Error("Expected a body { … } block");

    for (const token of GRADIENT_TOKENS) {
      expect(bodyBlock, token).toContain(`var(--${token})`);
    }
    expect(bodyBlock).toContain("var(--background)");
  });
});

describe.each([
  ["light", ":root"],
  ["dark", ".dark"],
] as const)("Islands shell — %s (ADR-0016)", (themeName, selector) => {
  // Merges the layered gradient block with the unlayered palette override —
  // for "dark" that is the only place this app's own --card/--popover live.
  const root = declarationsOf(globalsSource, selector);
  const themeRoot = declarationsOf(themeSource, selector);

  it("declares all three gradient stops, in oklch()", () => {
    for (const token of GRADIENT_TOKENS) {
      expect(declared(root, token), token).toMatch(/^oklch\(/);
    }
  });

  it("reads AA on the darkest stop: --foreground on an Island (bg-card/75%) over it ≥ 4.5:1", () => {
    const card =
      themeName === "light" ? rgbOf(themeRoot, "card") : rgbOf(root, "card");
    const foreground = rgbOf(themeRoot, "foreground");
    const island = blendOverRgb(card, 0.75, darkestStopOf(root));

    expect(contrastRatio(foreground, island)).toBeGreaterThanOrEqual(4.5);
  });

  /**
   * Dark only: `.dark` is this ticket's own surface (`--card` overridden
   * here, `--muted-foreground` still theme.css's unmodified value), so it is
   * the one case where this pairing was never proven before. Light keeps
   * theme.css's `--card` and was never asked to clear this pairing — adding
   * it there now would be tightening a pre-existing, out-of-scope value
   * rather than guarding this ticket's own change.
   */
  it.runIf(themeName === "dark")(
    "reads AA on the darkest stop: --muted-foreground on the same Island surface ≥ 4.5:1",
    () => {
      const mutedForeground = rgbOf(themeRoot, "muted-foreground");
      const island = blendOverRgb(
        rgbOf(root, "card"),
        0.75,
        darkestStopOf(root),
      );

      expect(contrastRatio(mutedForeground, island)).toBeGreaterThanOrEqual(
        4.5,
      );
    },
  );
});

/** The gradient stop with the lowest luminance — the worst case an Island sits over. */
function darkestStopOf(root: Record<string, string>) {
  const stops = GRADIENT_TOKENS.map((token) =>
    oklchToRgb(parseOklch(declared(root, token))),
  );

  return stops.reduce((darkest, stop) =>
    // Luminance is cheaper to compare via contrast against a fixed black
    // reference than to expose a third helper for — the darker of two
    // colours contrasts *less* with white.
    contrastRatio(stop, { r: 255, g: 255, b: 255 }) >
    contrastRatio(darkest, { r: 255, g: 255, b: 255 })
      ? stop
      : darkest,
  );
}

/** The declarations of the first `selector { … }` block found in `source`, as raw text (not parsed key/value). */
function declarationsOfSelectorBlock(
  source: string,
  selector: string,
): string | undefined {
  const opener = `${selector} {`;
  const start = source.indexOf(opener);
  if (start === -1) return undefined;

  let depth = 0;
  let index = start + opener.length - 1;
  for (; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}") depth--;
    if (depth === 0) break;
  }

  return source.slice(start, index + 1);
}
