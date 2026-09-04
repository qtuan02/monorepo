import { describe, expect, it } from "vitest";

import type { LanguageCode } from "../../src/languages";
import { defaultLanguage, languages, messages } from "../../src/languages";

/**
 * Rules the catalogue has to hold to that no type can express.
 *
 * `LocaleMessages` already forces every locale to carry the same keys. What it
 * cannot see is the inside of a message: a leftover i18next `{{name}}`, a rich
 * text tag, or a placeholder renamed in one language only. Each of those still
 * typechecks and still renders — just wrongly, and only for the language nobody
 * on the team reads.
 */

/**
 * The name of every ICU argument in a message. An argument is the identifier
 * directly after `{`, closed by `,` (typed argument: `{count, plural, …}`) or
 * `}` (plain: `{name}`); a plural option name such as `other {` is not preceded
 * by a brace and so never matches.
 */
function argumentNames(message: string): string[] {
  return [...message.matchAll(/\{\s*(\w+)\s*[,}]/g)]
    .map(([, name]) => name ?? "")
    .sort((a, b) => a.localeCompare(b));
}

function flatten(
  value: unknown,
  path: string[] = [],
  into = new Map<string, string>(),
): Map<string, string> {
  if (typeof value === "string") {
    into.set(path.join("."), value);
    return into;
  }

  for (const [key, child] of Object.entries(value as object)) {
    flatten(child, [...path, key], into);
  }

  return into;
}

/**
 * Catalogue keys that contain a `.`, reported by the path that leads to each.
 *
 * It walks the raw object rather than reading `flatten`'s output, because that
 * map joins path segments with a `.` — the very character being looked for, so
 * a key holding one is indistinguishable there from real nesting.
 */
function dottedKeys(
  value: unknown,
  path: string[] = [],
  into: string[] = [],
): string[] {
  if (typeof value === "string") return into;

  for (const [key, child] of Object.entries(value as object)) {
    if (key.includes(".")) into.push([...path, key].join(" > "));
    dottedKeys(child, [...path, key], into);
  }

  return into;
}

const catalogues = new Map<LanguageCode, Map<string, string>>(
  languages.map((code) => [code, flatten(messages[code])]),
);

function catalogue(code: LanguageCode): Map<string, string> {
  const entries = catalogues.get(code);
  if (!entries) throw new Error(`No catalogue for ${code}`);
  return entries;
}

describe.each(languages)("the %s catalogue", (code) => {
  it("carries no i18next double-brace interpolation", () => {
    const offenders = [...catalogue(code)]
      .filter(([, message]) => message.includes("{{"))
      .map(([key]) => key);

    expect(offenders).toEqual([]);
  });

  it("carries no rich-text tag", () => {
    // The one construct the two Flavors disagree on: i18next-icu forces
    // `ignoreTag: true` and renders `<b>x</b>` literally, while next-intl
    // expects a matching React element to be supplied for the tag.
    const offenders = [...catalogue(code)]
      .filter(([, message]) => /<\/?\w+>/.test(message))
      .map(([key]) => key);

    expect(offenders).toEqual([]);
  });

  it("carries no key containing a dot", () => {
    // next-intl reads `.` as its nesting separator, so a key holding one is
    // rejected as INVALID_KEY when the catalogue loads — and because every
    // Next app mounts this one catalogue, a single offender breaks the render
    // of apps that never use the namespace it sits in. `t("gemini-2.5-flash")`
    // would also resolve to a nested `5-flash` under `gemini-2` rather than to
    // the message that is actually there.
    //
    // A model id is the shape that reaches for one: it is spelled with `-` in
    // the catalogue and mapped back at the call site (see
    // `apps/assistant-ai/src/constants/models.ts`).
    expect(dottedKeys(messages[code])).toEqual([]);
  });
});

describe("every language names the same ICU arguments", () => {
  const reference = catalogue(defaultLanguage);

  it.each(languages.filter((code) => code !== defaultLanguage))(
    "%s matches the default language",
    (code) => {
      const drifted = [...catalogue(code)]
        .filter(
          ([key, message]) =>
            argumentNames(message).join() !==
            argumentNames(reference.get(key) ?? "").join(),
        )
        .map(([key]) => key);

      expect(drifted).toEqual([]);
    },
  );

  it("actually reads the arguments it compares", () => {
    expect(argumentNames("{name}: {count, plural, other {# new}}")).toEqual([
      "count",
      "name",
    ]);
  });
});
