import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import type { Rgb } from "./support/contrast";
import {
  contrastRatio,
  hexToRgb,
  oklchToRgb,
  parseOklch,
  relativeLuminance,
  rgbDistance,
} from "./support/contrast";

/**
 * Both stylesheets are read as **text**: a jsdom test computes no styles, and
 * the accent lives in CSS custom properties that only a real cascade resolves.
 * What can be asserted here is the contract the override has to honour — which
 * tokens, where in the cascade, and the contrast the values give. That the
 * cascade then resolves the way this file claims is asserted in a real browser,
 * in `e2e/accent.e2e.ts`.
 */
// `process.cwd()` is the app root — Vitest sets it from this project's config.
const appRoot = process.cwd();

/**
 * `source` with block and line comments removed. Both stylesheets are parsed
 * structurally below, and the prose in `globals.css` quotes the very syntax
 * being looked for — a `@theme inline {…}` in a comment would otherwise read as
 * a region of its own, and a comment naming both teals as a colour the app
 * writes.
 */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

const globalsSource = withoutComments(
  readFileSync(resolve(appRoot, "src/globals.css"), "utf8"),
);
const themeSource = withoutComments(
  readFileSync(resolve(appRoot, "../../tooling/tailwind/theme.css"), "utf8"),
);

/**
 * The brand-carrying tokens a CV actually renders — the v1 list, unchanged.
 * Every list below is the ticket's, and the test holds the override to exactly
 * their union so the app cannot drift into re-theming status colours or charts
 * on the side.
 */
const ACCENT_TOKENS = [
  "primary",
  "primary-foreground",
  "ring",
  "accent",
  "accent-foreground",
  "selection",
  "selection-foreground",
] as const;

/**
 * The two neutrals the redesign takes over from the EMR palette: the text
 * colour, which the theme keeps blue-grey so nothing on an EMR screen is ever
 * quite black, and the border, which the theme keeps a hair off its own
 * background. A hard-edged page needs both at the poles. `muted-foreground` is
 * deliberately *not* here — it already reads AA and stays the theme's.
 */
const NEUTRAL_TOKENS = ["foreground", "border"] as const;

/**
 * The second accent — yellow, for exactly two roles: the primary button's fill
 * and the award badge. Declared ahead of either component so the tickets that
 * draw them only have to call `bg-highlight`.
 */
const HIGHLIGHT_TOKENS = ["highlight", "highlight-foreground"] as const;

/**
 * The colour of the solid offset shadow every block casts. A token rather than
 * a literal in a className so the dark theme can flip it to light together
 * with the border — one edit, one place.
 */
const SHADOW_TOKENS = ["hard-shadow"] as const;

const OVERRIDDEN_TOKENS = [
  ...ACCENT_TOKENS,
  ...NEUTRAL_TOKENS,
  ...HIGHLIGHT_TOKENS,
  ...SHADOW_TOKENS,
] as const;

/** The one indigo the accent sits on, and the one yellow the highlight does. */
const INDIGO_HUE = { from: 270, to: 285 } as const;
const YELLOW_HUE = { from: 85, to: 100 } as const;

/**
 * The poles. "Near black" and "near white" as relative luminance, which is what
 * a contrast ratio is computed from: `#0a0a0a` sits at 0.003 and `#fafafa` at
 * 0.956, while the EMR blue-grey this app is leaving reads 0.13.
 */
const INK_MAX_LUMINANCE = 0.05;
const PAPER_MIN_LUMINANCE = 0.85;

/**
 * The five primitives the ticket names as going square, and the one line that
 * squares them: every `rounded-*` they use resolves through `--radius`.
 */
const SQUARED_PRIMITIVES = [
  "badge",
  "card",
  "button",
  "skeleton",
  "select",
] as const;

/** The EMR product teal this app is getting out of, light and dark. */
const EMR_TEAL = ["#38a696", "#75cdc0"] as const;

/**
 * Two colours further apart than this are not the same colour to a reader.
 * Black against white is ~441 on the same scale, and the nearest neutral in
 * either stylesheet sits at 76 from a teal, so the band is a wide one.
 */
const NOT_THE_SAME_COLOUR = 40;

/** The index just past the `}` that closes the block opened at `open`. */
function blockEnd(source: string, open: number): number {
  let depth = 0;
  let index = open;

  for (; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}") depth--;
    if (depth === 0) break;
  }

  return index;
}

/** Every `@<name> …{…}` region of `source`, whole, outermost first. */
function atRuleRegions(source: string, name = "[\\w-]+"): string[] {
  const regions: string[] = [];
  const opener = new RegExp(`@${name}[^;{]*\\{`, "g");
  let cursor = 0;

  for (const match of source.matchAll(opener)) {
    // Skip an at-rule nested inside one already taken, so the `@page` inside
    // `@media print` is not reported as a region of its own.
    if (match.index < cursor) continue;

    const open = match.index + match[0].length - 1;
    const close = blockEnd(source, open);

    regions.push(source.slice(match.index, close + 1));
    cursor = close;
  }

  return regions;
}

/**
 * `source` with every at-rule block removed — what is left is the declarations
 * that apply unlayered and unconditionally. This is the distinction the whole
 * override rests on, so it is read structurally rather than by position:
 * `@media print` re-declares `.dark` as well, and a plain search for `.dark {`
 * would happily read the print palette as part of the accent.
 */
function unconditional(source: string): string {
  let stripped = source;

  for (const region of atRuleRegions(source)) {
    stripped = stripped.replace(region, "");
  }

  return stripped;
}

/**
 * Every custom property declared in a `selector {…}` block of `source`, the
 * blocks merged. Values are whitespace-normalised, because Biome may wrap a
 * long value across lines and the comparison must not care.
 */
function declarationsOf(
  source: string,
  selector: string,
): Record<string, string> {
  const declarations: Record<string, string> = {};
  const opener = `${selector} {`;

  for (
    let start = source.indexOf(opener);
    start !== -1;
    start = source.indexOf(opener, start + 1)
  ) {
    const open = start + opener.length - 1;
    const body = source.slice(open + 1, blockEnd(source, open));

    for (const match of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      declarations[match[1] as string] = (match[2] as string)
        .replace(/\s+/g, " ")
        .replace(/\( /g, "(")
        .replace(/ \)/g, ")")
        .trim();
    }
  }

  return declarations;
}

/**
 * A declaration this file cannot proceed without. `noUncheckedIndexedAccess`
 * makes every lookup `string | undefined`, and a silent `?? ""` fallback would
 * turn a token that has been renamed away into a passing assertion.
 */
function declared(declarations: Record<string, string>, token: string): string {
  const value = declarations[token];

  if (!value) {
    throw new Error(`Expected a declaration for --${token}`);
  }

  return value;
}

const printRegion = atRuleRegions(globalsSource, "media print").at(0) ?? "";
/**
 * The print palette is one `:root, .dark` rule — read off the `.dark` half,
 * which is the last selector in the list and so the one `declarationsOf`'s
 * `"<selector> {"` opener can match whatever the formatter does above it.
 */
const printPalette = declarationsOf(printRegion, ".dark");

const themes = {
  light: {
    override: declarationsOf(unconditional(globalsSource), ":root"),
    base: declarationsOf(themeSource, ":root"),
    ink: "dark",
  },
  dark: {
    override: declarationsOf(unconditional(globalsSource), ".dark"),
    base: declarationsOf(themeSource, ".dark"),
    ink: "light",
  },
} as const;

describe.each(Object.entries(themes))(
  "%s palette",
  (_theme, { override, base, ink }) => {
    const colourTokens = Object.fromEntries(
      Object.entries(override).filter(([, value]) =>
        value.startsWith("oklch("),
      ),
    );
    const rgb = (token: string) =>
      oklchToRgb(parseOklch(colourTokens[token] ?? base[token] ?? ""));
    const luminance = (token: string) => relativeLuminance(rgb(token));

    it("overrides exactly the listed tokens — accent, two neutrals, highlight pair, shadow — in oklch", () => {
      expect(Object.keys(colourTokens).sort()).toEqual(
        [...OVERRIDDEN_TOKENS].sort(),
      );
    });

    it("keeps the selection pair a mirror of the primary pair, as theme.css does", () => {
      expect(colourTokens.selection).toBe(colourTokens.primary);
      expect(colourTokens["selection-foreground"]).toBe(
        colourTokens["primary-foreground"],
      );
    });

    it("keeps the accent on the indigo hue and the highlight on the yellow one — achromatic aside", () => {
      const hueOf = (token: string) => parseOklch(colourTokens[token] ?? "");

      for (const token of ACCENT_TOKENS) {
        const { c, h } = hueOf(token);
        if (c === 0) continue;
        expect(h, token).toBeGreaterThanOrEqual(INDIGO_HUE.from);
        expect(h, token).toBeLessThanOrEqual(INDIGO_HUE.to);
      }

      for (const token of HIGHLIGHT_TOKENS) {
        const { c, h } = hueOf(token);
        if (c === 0) continue;
        expect(h, token).toBeGreaterThanOrEqual(YELLOW_HUE.from);
        expect(h, token).toBeLessThanOrEqual(YELLOW_HUE.to);
      }
    });

    it("keeps the neutrals and the shadow achromatic — a neutral hue, not a tinted one", () => {
      for (const token of [...NEUTRAL_TOKENS, ...SHADOW_TOKENS]) {
        expect(parseOklch(colourTokens[token] ?? "").c, token).toBe(0);
      }
    });

    it(`sits at the ${ink}-ink pole: text, border and shadow on one side, the background on the other`, () => {
      // The dark theme is the light one inverted, not dimmed: near-black
      // ground, near-white text — and the border and the hard shadow follow
      // the text, because in the dark a black shadow on a black ground is no
      // shadow at all.
      const nearBlack = (token: string) =>
        expect(luminance(token), token).toBeLessThan(INK_MAX_LUMINANCE);
      const nearWhite = (token: string) =>
        expect(luminance(token), token).toBeGreaterThan(PAPER_MIN_LUMINANCE);
      const [inkSide, paperSide] =
        ink === "dark" ? [nearBlack, nearWhite] : [nearWhite, nearBlack];

      for (const token of [...NEUTRAL_TOKENS, ...SHADOW_TOKENS]) {
        inkSide(token);
      }
      paperSide("background");
    });

    it("reads AA as body copy: foreground on background and on card ≥ 4.5:1", () => {
      expect(
        contrastRatio(rgb("foreground"), rgb("background")),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(rgb("foreground"), rgb("card")),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("draws an edge a reader can see: border on background and on card ≥ 3:1", () => {
      // WCAG's non-text threshold. The theme's light border reads 1.09:1 on
      // its background — the design brief's "card and divider do not exist",
      // measured.
      expect(
        contrastRatio(rgb("border"), rgb("background")),
      ).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(rgb("border"), rgb("card"))).toBeGreaterThanOrEqual(
        3,
      );
    });

    it("casts a shadow a reader can see: hard-shadow on background ≥ 3:1", () => {
      expect(
        contrastRatio(rgb("hard-shadow"), rgb("background")),
      ).toBeGreaterThanOrEqual(3);
    });

    it("reads AA on the highlight: highlight-foreground on highlight ≥ 4.5:1", () => {
      expect(
        contrastRatio(rgb("highlight-foreground"), rgb("highlight")),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("keeps a focus ring legible on the highlight: highlight-foreground on highlight ≥ 3:1", () => {
      // A yellow control draws its focus ring in the pair's own foreground,
      // not in `--ring`. In the light theme the indigo ring would clear the
      // yellow (3.47:1); in the dark theme no yellow can — the lifted indigo
      // sits at a luminance where a colour would have to be brighter than pure
      // yellow to reach 3:1 against it. So the contract is one colour that
      // reads on the fill in both themes, and the text colour is that colour.
      expect(
        contrastRatio(rgb("highlight-foreground"), rgb("highlight")),
      ).toBeGreaterThanOrEqual(3);
    });

    it("reads AA: primary-foreground on primary ≥ 4.5:1", () => {
      expect(
        contrastRatio(rgb("primary-foreground"), rgb("primary")),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("reads as a focus indicator: ring on background ≥ 3:1", () => {
      expect(
        contrastRatio(rgb("ring"), rgb("background")),
      ).toBeGreaterThanOrEqual(3);
    });

    it("leaves muted-foreground on background at AA — untouched, re-confirmed", () => {
      expect(override["muted-foreground"]).toBeUndefined();
      expect(
        contrastRatio(rgb("muted-foreground"), rgb("background")),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("reads AA on the hover wash: accent-foreground on accent ≥ 4.5:1", () => {
      expect(
        contrastRatio(rgb("accent-foreground"), rgb("accent")),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("is a different colour from the EMR teal, not a re-spelled one", () => {
      for (const token of OVERRIDDEN_TOKENS) {
        for (const teal of EMR_TEAL) {
          expect(
            rgbDistance(rgb(token), hexToRgb(teal)),
            `${token} vs ${teal}`,
          ).toBeGreaterThan(NOT_THE_SAME_COLOUR);
        }
      }
    });

    it("overrides the shared theme rather than restating its value", () => {
      // Not a hard-coded EMR hex: `tooling/tailwind/theme.css` belongs to
      // another workspace and is free to be rebranded, which would turn a
      // pinned hex here red for a change this app did not make. What this app
      // decides is that its accent is its OWN — so assert the two differ,
      // whatever the shared value happens to be.
      expect(base.primary).toBeDefined();
      expect(
        rgbDistance(
          oklchToRgb(parseOklch(base.primary ?? "")),
          oklchToRgb(parseOklch(colourTokens.primary ?? "")),
        ),
      ).toBeGreaterThan(4);
    });

    it("declares the neutrals and the shadow opaque", () => {
      // The theme's dark border is `oklch(1 0 0 / 10%)` — a white that paints
      // as a dark grey once composited over the ground. `parseOklch` ignores
      // alpha, so every ratio above would be computed on the white and not on
      // the grey: a translucent value here is a contrast assertion that lies.
      for (const token of [...NEUTRAL_TOKENS, ...SHADOW_TOKENS]) {
        expect(colourTokens[token], token).not.toContain("/");
      }
    });
  },
);

describe("the radius", () => {
  /**
   * `theme.css` derives every `rounded-*` size from one `--radius`, so one
   * unlayered line in this app squares every primitive at once. The chain is
   * asserted end to end — the app's line, the theme's derivation, and the
   * classes the five named primitives actually use — because a primitive that
   * reached for `rounded-full` or an arbitrary pixel value would keep its
   * corners with nothing logged.
   */
  const uiRoot = resolve(appRoot, "../../packages/ui/src/components");
  const themeInline = atRuleRegions(themeSource, "theme").at(0) ?? "";

  it("is zero, declared once and unlayered", () => {
    expect(themes.light.override.radius).toBe("0");
  });

  it("is what theme.css derives every rounded-* size from", () => {
    for (const size of ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"]) {
      expect(themeInline, size).toMatch(
        new RegExp(`--radius-${size}:[^;]*var\\(--radius\\)`),
      );
    }
  });

  it.each(SQUARED_PRIMITIVES)(
    "squares %s without an edit to the package: every corner it rounds goes through --radius",
    (primitive) => {
      const source = readFileSync(resolve(uiRoot, `${primitive}.tsx`), "utf8");
      // Each `rounded…` utility, with any variant prefix stripped off.
      const utilities = [...source.matchAll(/[^\s"'`]*rounded[^\s"'`]*/g)]
        .map((match) => match[0].slice(match[0].lastIndexOf("rounded")))
        .filter((utility) => utility !== "rounded-none");

      expect(utilities.length).toBeGreaterThan(0);

      for (const utility of utilities) {
        expect(utility).toMatch(
          // `rounded-md`, `rounded-t-xl`, … or button's
          // `rounded-[min(var(--radius-md),8px)]` — every one a function of
          // `--radius`, so zero in, zero out.
          /^rounded(?:-(?:t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee))?(?:-(?:sm|md|lg|xl|2xl|3xl|4xl)|-\[min\(var\(--radius-(?:sm|md|lg|xl|2xl|3xl|4xl)\),\d+px\)\])$/,
        );
      }
    },
  );
});

describe("where the override sits in the cascade", () => {
  /**
   * `@monorepo/tailwind-config/globals` imports `theme.css` with a plain
   * `@import`, so its `:root` / `.dark` blocks are **unlayered** — and an
   * unlayered declaration beats one in any `@layer`, whatever the source order.
   * An override written inside `@layer base` (where `--font-sans` lives) would
   * compile, ship, and lose silently: the site stays teal with nothing logged.
   */
  it("keeps every overridden token, and the radius, outside every @layer block", () => {
    for (const region of atRuleRegions(globalsSource, "layer")) {
      for (const token of [...OVERRIDDEN_TOKENS, "radius"]) {
        expect(region, token).not.toMatch(new RegExp(`--${token}:`));
      }
    }
  });

  it("maps the highlight pair and the shadow into Tailwind's colour namespace, so bg-highlight compiles", () => {
    // A custom property on `:root` is not a utility until `@theme` names it —
    // `theme.css` does this for its own tokens, and the three this app adds
    // have to do it here, or the first `bg-highlight` renders nothing.
    const themeInline = atRuleRegions(globalsSource, "theme").at(0) ?? "";

    for (const token of [...HIGHLIGHT_TOKENS, ...SHADOW_TOKENS]) {
      expect(themeInline, token).toContain(`--color-${token}: var(--${token})`);
    }
  });

  it("wires ::selection to the selection tokens, which theme.css declares but never applies", () => {
    const rule = globalsSource.match(/::selection\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(rule).toContain("var(--selection)");
    expect(rule).toContain("var(--selection-foreground)");
  });
});

/**
 * The print stylesheet replaces the neutral half of the palette so both themes
 * print the same document. It has to compose with the accent rather than fight
 * it, and — being declared later on the same `:root, .dark` specificity —
 * silence is the whole contract: what it does not re-declare, it inherits.
 */
describe("composing with the print palette", () => {
  /**
   * The print palette pins `primary` because something on paper is painted
   * with it: the project card's source and demo links are `text-primary`, and
   * the stylesheet prints each one's href after it in the same colour. The
   * other five stay out of it — they are fills, hover washes and a focus ring,
   * none of which a printer reproduces.
   */
  const PRINTED_ACCENT_TOKENS = ["primary", "primary-foreground"] as const;

  it("replaces the neutrals, and only the accent that reaches paper as text", () => {
    expect(printPalette.background).toBeDefined();
    expect(printPalette["muted-foreground"]).toBeDefined();
    // The v1 print contract re-declares both neutrals this app now overrides
    // on screen — a printed border is a thin grey rule, not the screen's ink —
    // and, being later on the same specificity, it still wins on paper.
    for (const token of NEUTRAL_TOKENS) {
      expect(printPalette[token], token).toBeDefined();
    }

    for (const token of PRINTED_ACCENT_TOKENS) {
      expect(printPalette[token], token).toBeDefined();
    }

    for (const token of ACCENT_TOKENS) {
      if ((PRINTED_ACCENT_TOKENS as readonly string[]).includes(token)) {
        continue;
      }
      expect(printPalette[token], token).toBeUndefined();
    }

    // A yellow fill and a shadow are background graphics, which a browser
    // does not print; the text on the fill prints as its foreground on white.
    // Nothing for print to re-declare — and the radius is not a colour at all.
    for (const token of [...HIGHLIGHT_TOKENS, ...SHADOW_TOKENS, "radius"]) {
      expect(printPalette[token], token).toBeUndefined();
    }
  });

  it("prints the accent legibly on paper, from either theme", () => {
    const paper = oklchToRgb(parseOklch(declared(printPalette, "background")));
    const inkOf = (theme: keyof typeof themes, token: string): Rgb =>
      oklchToRgb(parseOklch(declared(themes[theme].override, token)));

    // A browser prints no background graphics unless the reader asks for them,
    // so a `bg-primary` fill reaches paper as its foreground on white. The
    // light indigo is also readable *as* ink at AA, which is the stricter case.
    expect(
      contrastRatio(inkOf("light", "primary"), paper),
    ).toBeGreaterThanOrEqual(4.5);

    // The dark theme's lifted indigo would be the weaker of the two on white —
    // it clears the 3:1 a non-text mark needs, not the 4.5:1 of body copy — so
    // it must not be what a reader in the dark theme prints. The print palette
    // pins `primary` to the light value for exactly that reason; this asserts
    // the pin, which is the thing that can regress, rather than the dark value
    // it makes unreachable.
    expect(contrastRatio(inkOf("dark", "primary"), paper)).toBeLessThan(4.5);
    expect(
      contrastRatio(
        oklchToRgb(parseOklch(declared(printPalette, "primary"))),
        paper,
      ),
    ).toBeGreaterThanOrEqual(4.5);

    // The print palette's own body copy, re-confirmed against the same maths.
    expect(
      contrastRatio(
        oklchToRgb(parseOklch(declared(printPalette, "muted-foreground"))),
        paper,
      ),
    ).toBeGreaterThanOrEqual(4.5);
  });
});

/**
 * The seven overrides only matter if nothing else on the page still reaches for
 * a teal token, and that is not something to check by eye: the teal that would
 * survive is on a control nobody looks at twice — a focus ring, a dropdown's
 * highlighted row. So it is checked twice over, statically. `e2e/accent.e2e.ts`
 * then confirms the same claim on a real cascade.
 */
describe("no EMR teal reaches a portfolio element", () => {
  const uiRoot = resolve(appRoot, "../../packages/ui/src/components");

  /** Every file under `dir` whose name ends in one of `extensions`. */
  function sourcesUnder(dir: string, extensions: string[]): string[] {
    return readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((entry) => extensions.some((ext) => entry.endsWith(ext)))
      .map((entry) => resolve(dir, entry));
  }

  const appSources = sourcesUnder(resolve(appRoot, "src"), [
    ".ts",
    ".tsx",
    ".css",
  ]);

  it("writes no teal colour literal of its own, in any source file", () => {
    for (const file of appSources) {
      const source = withoutComments(readFileSync(file, "utf8"));
      const literals = [
        ...[...source.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) =>
          hexToRgb(m[0]),
        ),
        ...[...source.matchAll(/oklch\([^)]*\)/g)].map((m) =>
          oklchToRgb(parseOklch(m[0])),
        ),
      ];

      for (const literal of literals) {
        for (const teal of EMR_TEAL) {
          expect(
            rgbDistance(literal, hexToRgb(teal)),
            `${file} vs ${teal}`,
          ).toBeGreaterThan(NOT_THE_SAME_COLOUR);
        }
      }
    }
  });

  /**
   * A token counts as teal-carrying by **hue**, not by distance: the theme's
   * `--accent` is `#eefffd`, a wash so pale that a distance test would call it
   * white, and it is still the EMR brand — it is what an antd row hover paints.
   */
  const tealTokens = Object.entries({
    ...themes.light.base,
    ...themes.dark.base,
  })
    .filter(([, value]) => value.startsWith("oklch("))
    .filter(([, value]) => {
      const { c, h } = parseOklch(value);

      return c > 0.01 && h >= 175 && h <= 195;
    })
    .map(([token]) => token);

  it("finds the teal in theme.css to be a real list, so the test below has work to do", () => {
    expect(tealTokens.length).toBeGreaterThan(5);
    expect(tealTokens).toContain("primary");
    expect(tealTokens).toContain("sidebar-primary");
  });

  it("overrides every teal token any primitive this app renders can reach", () => {
    const imported = new Set(
      appSources
        .filter((file) => file.endsWith(".tsx"))
        .flatMap((file) => [
          ...readFileSync(file, "utf8").matchAll(
            /@monorepo\/ui\/components\/([\w-]+)/g,
          ),
        ])
        .map((match) => match[1] as string),
    );

    expect(imported.size).toBeGreaterThan(0);

    const primitiveSource = [...imported]
      .map((name) => readFileSync(resolve(uiRoot, `${name}.tsx`), "utf8"))
      .join("\n");

    // A Tailwind utility (`bg-primary`) or an arbitrary value (`[--primary]`).
    // The prefix list is what stops `bg-sidebar-primary` reading as `primary`.
    const references = (token: string) =>
      primitiveSource.includes(`--${token}`) ||
      new RegExp(
        `(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|caret|divide|accent)-${token}(?![\\w-])`,
      ).test(primitiveSource);

    // The detector fires at all: `badge`/`button` paint `bg-primary`, and no
    // primitive this app imports goes near the sidebar. Without this line the
    // loop below would pass just as happily on a regex that matches nothing.
    const reachable = tealTokens.filter(references);

    expect(reachable).toContain("primary");
    expect(reachable).not.toContain("sidebar-primary");

    for (const token of reachable) {
      // Reachable from something this app renders, so the app has to answer for
      // it: on the ticket's list, and actually declared in both themes.
      expect([...ACCENT_TOKENS] as string[], token).toContain(token);
      expect(themes.light.override[token], token).toBeDefined();
      expect(themes.dark.override[token], token).toBeDefined();
    }
  });
});
