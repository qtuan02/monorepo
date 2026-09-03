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
