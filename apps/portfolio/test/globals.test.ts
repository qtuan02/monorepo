import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import type { Rgb } from "./support/contrast";
import {
  contrastRatio,
  hexToRgb,
  oklchToRgb,
  parseOklch,
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
const globalsSource = readFileSync(resolve(appRoot, "src/globals.css"), "utf8");
const themeSource = readFileSync(
  resolve(appRoot, "../../tooling/tailwind/theme.css"),
  "utf8",
);

/**
 * The brand-carrying tokens a CV actually renders. The list is the ticket's,
 * and the test holds the override to exactly these so the app cannot drift
 * into re-theming status colours or charts on the side.
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
    emrPrimary: "#38a696",
  },
  dark: {
    override: declarationsOf(unconditional(globalsSource), ".dark"),
    base: declarationsOf(themeSource, ".dark"),
    emrPrimary: "#75cdc0",
  },
};

describe.each(Object.entries(themes))(
  "%s accent",
  (_theme, { override, base, emrPrimary }) => {
    const colourTokens = Object.fromEntries(
      Object.entries(override).filter(([, value]) =>
        value.startsWith("oklch("),
      ),
    );
    const rgb = (token: string) =>
      oklchToRgb(parseOklch(colourTokens[token] ?? base[token] ?? ""));

    it("overrides exactly the seven brand-carrying tokens, in oklch", () => {
      expect(Object.keys(colourTokens).sort()).toEqual(
        [...ACCENT_TOKENS].sort(),
      );
    });

    it("keeps the selection pair a mirror of the primary pair, as theme.css does", () => {
      expect(colourTokens.selection).toBe(colourTokens.primary);
      expect(colourTokens["selection-foreground"]).toBe(
        colourTokens["primary-foreground"],
      );
    });

    it("stays on one indigo hue — achromatic white aside", () => {
      for (const [token, value] of Object.entries(colourTokens)) {
        const { c, h } = parseOklch(value);
        if (c === 0) continue;
        expect(h, token).toBeGreaterThanOrEqual(270);
        expect(h, token).toBeLessThanOrEqual(285);
      }
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
      for (const token of ACCENT_TOKENS) {
        for (const teal of EMR_TEAL) {
          expect(
            rgbDistance(rgb(token), hexToRgb(teal)),
            `${token} vs ${teal}`,
          ).toBeGreaterThan(NOT_THE_SAME_COLOUR);
        }
      }
    });

    it("does not touch tooling/tailwind: theme.css still carries the EMR teal", () => {
      expect(
        rgbDistance(
          oklchToRgb(parseOklch(base.primary ?? "")),
          hexToRgb(emrPrimary),
        ),
      ).toBeLessThan(4);
    });
  },
);

describe("where the override sits in the cascade", () => {
  /**
   * `@monorepo/tailwind-config/globals` imports `theme.css` with a plain
   * `@import`, so its `:root` / `.dark` blocks are **unlayered** — and an
   * unlayered declaration beats one in any `@layer`, whatever the source order.
   * An override written inside `@layer base` (where `--font-sans` lives) would
   * compile, ship, and lose silently: the site stays teal with nothing logged.
   */
  it("keeps the seven tokens outside every @layer block", () => {
    for (const region of atRuleRegions(globalsSource, "layer")) {
      for (const token of ACCENT_TOKENS) {
        expect(region, token).not.toMatch(new RegExp(`--${token}:`));
      }
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

    for (const token of PRINTED_ACCENT_TOKENS) {
      expect(printPalette[token], token).toBeDefined();
    }

    for (const token of ACCENT_TOKENS) {
      if ((PRINTED_ACCENT_TOKENS as readonly string[]).includes(token)) {
        continue;
      }
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

  /**
   * `source` with block and line comments removed, so the prose above — which
   * names both teals on purpose — is not read as a colour the app writes.
   */
  function withoutComments(source: string): string {
    return source
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^\s*\/\/.*$/gm, " ");
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
