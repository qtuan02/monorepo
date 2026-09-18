import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { contrastRatio, hexToRgb } from "./support/contrast";
import {
  atRuleRegions,
  declarationsOf,
  unconditional,
  withoutComments,
} from "./support/css-tokens";

/**
 * Both stylesheets are read as **text**: a jsdom test computes no styles, and
 * the accent lives in CSS custom properties that only a real cascade
 * resolves. What can be asserted here is the contract the override has to
 * honour (ADR-0011) — which tokens, where in the cascade, and the contrast
 * the values give.
 */
const appRoot = process.cwd();

const globalsSource = withoutComments(
  readFileSync(resolve(appRoot, "src/globals.css"), "utf8"),
);
const themeSource = withoutComments(
  readFileSync(resolve(appRoot, "../../tooling/tailwind/theme.css"), "utf8"),
);

/** The tokens the brief names (§5) — everything else stays the theme's. */
const OVERRIDDEN_TOKENS = [
  "primary",
  "primary-foreground",
  "ring",
  "sidebar-primary",
  "background",
  "foreground",
  "muted-foreground",
  "accent",
  "accent-foreground",
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

describe.each(Object.entries(themes))("%s palette", (_theme, { override }) => {
  const rgb = (token: string) => hexToRgb(override[token] ?? "");

  it("overrides exactly the tokens the brief names, in hex — radius aside, which carries no colour", () => {
    const colourTokens = Object.keys(override).filter(
      (key) => key !== "radius",
    );
    expect(colourTokens.sort()).toEqual([...OVERRIDDEN_TOKENS].sort());
    for (const token of OVERRIDDEN_TOKENS) {
      expect(override[token], token).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("keeps ring and sidebar-primary a mirror of primary", () => {
    expect(override.ring).toBe(override.primary);
    expect(override["sidebar-primary"]).toBe(override.primary);
  });

  it("reads AA as body copy: foreground on background ≥ 4.5:1", () => {
    expect(
      contrastRatio(rgb("foreground"), rgb("background")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("reads AA: muted-foreground on background ≥ 4.5:1", () => {
    expect(
      contrastRatio(rgb("muted-foreground"), rgb("background")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("reads AA: primary-foreground on primary ≥ 4.5:1", () => {
    expect(
      contrastRatio(rgb("primary-foreground"), rgb("primary")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("reads AA on the hover wash: accent-foreground on accent ≥ 4.5:1", () => {
    expect(
      contrastRatio(rgb("accent-foreground"), rgb("accent")),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("reads as a focus indicator: ring on background ≥ 3:1", () => {
    expect(
      contrastRatio(rgb("ring"), rgb("background")),
    ).toBeGreaterThanOrEqual(3);
  });
});

it(".dark declares every colour token :root overrides — radius is :root-only, it is not themed", () => {
  const withoutRadius = (keys: string[]) =>
    keys.filter((k) => k !== "radius").sort((a, b) => a.localeCompare(b));
  expect(withoutRadius(Object.keys(themes.dark.override))).toEqual(
    withoutRadius(Object.keys(themes.light.override)),
  );
  expect(themes.dark.override.radius).toBeUndefined();
});

describe("the radius", () => {
  it("is 0.375rem — with a unit, so theme.css's calc() derivations stay lengths", () => {
    expect(themes.light.override.radius).toBe("0.375rem");
  });
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
   * `@import`, so its `:root` / `.dark` blocks are **unlayered** — and an
   * unlayered declaration beats one in any `@layer`, whatever the source
   * order. Written inside `@layer base` this would compile, ship, and lose
   * silently (ADR-0008, ADR-0009, ADR-0011).
   */
  it("keeps every overridden token, and the radius, outside every @layer block", () => {
    for (const region of atRuleRegions(globalsSource, "layer")) {
      for (const token of [...OVERRIDDEN_TOKENS, "radius"]) {
        expect(region, token).not.toMatch(new RegExp(`--${token}:`));
      }
    }
  });
});

describe("no raw Tailwind palette class for status/icon colour", () => {
  it("writes no bg-*/text-*/border-* on a named hue anywhere under src/", () => {
    // Spec #153 §10 row 4 (ticket #156) asks this of the whole app, not one
    // file — `~/constants/status.ts` alone would miss a hue class written
    // straight into a component's className instead of routed through a
    // config there.
    const hues =
      "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|zinc|slate|gray|neutral|stone";
    const re = new RegExp(
      `\\b(?:bg|text|border|ring|fill|stroke)-(?:${hues})-\\d{2,3}\\b`,
    );

    const srcDir = resolve(appRoot, "src");
    const sourceFiles = readdirSync(srcDir, { recursive: true })
      .filter(
        (entry): entry is string =>
          typeof entry === "string" && /\.(ts|tsx)$/.test(entry),
      )
      .map((entry) =>
        withoutComments(readFileSync(resolve(srcDir, entry), "utf8")),
      );

    for (const source of sourceFiles) {
      expect(source).not.toMatch(re);
    }
  });
});
