import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { defaultLanguage, languages, messages } from "@monorepo/i18n/languages";

import {
  CONTACT_ITEMS,
  EDUCATION_ITEMS,
  HERO_ACTIONS,
  HOBBY_ITEMS,
  PROJECT_ITEMS,
  PROJECT_SOURCE_LABEL_KEYS,
  SKILL_GROUPS,
  WORK_ITEMS,
} from "~/features/home/constants/resume";
import { NAVBAR_ITEMS } from "~/features/layout/constants/navbar";

/**
 * The join between this app and the `portfolio.*` namespace, in **both**
 * directions, off **one** list of keys.
 *
 * The CV is split down the middle: structure (ids, order, logos, which bullets
 * a role has) lives in the slices' constants, and every string a reader sees
 * lives in `@monorepo/i18n`. The two halves are joined at render time by an id,
 * and each half typechecks without knowing the other exists — so both ways of
 * breaking that join are silent, in opposite ways:
 *
 * - A **missing** message ships the key path itself onto the page, because
 *   next-intl renders an unresolved key as its own path. Nothing throws.
 * - An **unread** message — left behind when the thing that read it was
 *   renamed, dropped, or never shipped — breaks no render and fails no
 *   typecheck, so it accumulates until nobody editing `vi.json` can tell which
 *   lines are still live.
 *
 * One list catches both. Building the two directions from separate lists would
 * put the same key shapes in two places sixty lines apart, and forgetting the
 * second would report a *false* orphan.
 *
 * Cross-locale key parity is **not** here: `LocaleMessages` is `typeof vi`, so
 * a key missing from another catalogue is already a typecheck error, and what
 * no type can see — a stray `{{name}}`, a placeholder renamed in one language —
 * is `packages/i18n/test/locales/catalogue-invariants.test.ts`.
 */
// `process.cwd()` is the app root — Vitest sets it from this project's config.
const SOURCE_ROOT = resolve(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) return sourceFiles(path);

    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

/**
 * Every `portfolio.…` key written out in full somewhere under `src/`.
 *
 * Comments are stripped first, or the prose explaining a key would whitelist
 * it: the docblocks in `types/resume.ts` name several key paths, and a dead one
 * described in a comment must not count as read.
 */
function literalKeys(): string[] {
  const source = sourceFiles(SOURCE_ROOT)
    .map((path) => readFileSync(path, "utf8"))
    .join("\n")
    .replaceAll(/\/\*[\s\S]*?\*\//g, "")
    .replaceAll(/\/\/[^\n]*/g, "");

  // A key interpolated from an id (`portfolio.navbar.${item.id}`) stops at the
  // `$` and is dropped by the trailing-dot filter — those come from the
  // constants half below, and accepting the fragment as a prefix would let
  // anything underneath it pass.
  return [...source.matchAll(/portfolio\.[A-Za-z0-9_.]+/g)]
    .map((match) => match[0])
    .filter((key) => !key.endsWith("."));
}

/** Every key an id in the constants can build. */
function derivedKeys(): string[] {
  return [
    ...WORK_ITEMS.flatMap((item) => [
      `portfolio.work.items.${item.id}.role`,
      `portfolio.work.items.${item.id}.period`,
      ...(item.summary ? [`portfolio.work.items.${item.id}.summary`] : []),
      ...item.bulletKeys.map(
        (key) => `portfolio.work.items.${item.id}.bullets.${key}`,
      ),
    ]),
    ...PROJECT_ITEMS.flatMap((item) => [
      `portfolio.projects.items.${item.id}.description`,
      // Joined by the source's id, exactly as the row does it — so a renamed
      // label key fails here, not as a key path printed under the row.
      ...(item.source ?? []).map(
        (source) => PROJECT_SOURCE_LABEL_KEYS[source.id],
      ),
    ]),
    ...EDUCATION_ITEMS.flatMap((item) => [
      `portfolio.education.items.${item.id}.degree`,
      `portfolio.education.items.${item.id}.period`,
    ]),
    ...SKILL_GROUPS.map((group) => `portfolio.skills.groups.${group.id}`),
    ...HERO_ACTIONS.map((action) => `portfolio.hero.actions.${action.id}`),
    ...CONTACT_ITEMS.flatMap((item) => [
      `portfolio.contact.labels.${item.id}`,
      `portfolio.contact.items.${item.id}`,
    ]),
    ...HOBBY_ITEMS.map((item) => `portfolio.hobbies.items.${item.id}`),
    ...NAVBAR_ITEMS.map((item) => `portfolio.navbar.${item.id}`),
  ];
}

/** The one list. Both directions below are read off it. */
const readableKeys = [...new Set([...literalKeys(), ...derivedKeys()])];

function readMessage(locale: string, path: string): unknown {
  let current: unknown = messages[locale as keyof typeof messages];

  for (const segment of path.split(".")) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function leafKeys(value: unknown, path: string[]): string[] {
  if (typeof value !== "object" || value === null) return [path.join(".")];

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([segment, child]) => leafKeys(child, [...path, segment]),
  );
}

describe("the portfolio message namespace", () => {
  it("reads at least one key, so a broken scan cannot pass silently", () => {
    // Both assertions below are vacuous against an empty list — a regex that
    // stops matching, or a `src/` that moved, would turn this file green.
    expect(readableKeys.length).toBeGreaterThan(50);
  });

  it.each(languages)("resolves every key the app reads, in %s", (locale) => {
    for (const key of readableKeys) {
      const value = readMessage(locale, key);

      expect(value, `${locale}: ${key}`).toBeTypeOf("string");
      expect(String(value).trim(), `${locale}: ${key}`).not.toBe("");
    }
  });

  it("spells the hero's command lines identically in every language", () => {
    // The commands are code, not copy: `whoami` is the same word in every
    // shell. A translator who "helped" by rendering one of them would put the
    // two locales out of structural step — and nothing in the type of the
    // catalogue can see that, since a translated command is still a string.
    // Only the prose after each command is the translator's.
    const commands = leafKeys(messages.vi.portfolio.hero.commands, [
      "portfolio",
      "hero",
      "commands",
    ]);

    expect(commands.length).toBeGreaterThanOrEqual(3);

    for (const locale of languages) {
      for (const key of commands) {
        expect(readMessage(locale, key), `${locale}: ${key}`).toBe(
          readMessage(defaultLanguage, key),
        );
      }
    }
  });

  it("leaves no message no component reads", () => {
    const orphans = leafKeys(messages.vi.portfolio, ["portfolio"]).filter(
      (key) => !readableKeys.includes(key),
    );

    expect(orphans).toEqual([]);
  });
});
