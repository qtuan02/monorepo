import { describe, expect, it } from "vitest";

import {
  defaultLanguage,
  isLanguageCode,
  languages,
  messages,
} from "../src/languages";

/**
 * `isLanguageCode` is the gate every untrusted locale passes through — the
 * `[locale]` segment of a Next request, a cookie, a `navigator.language`. What
 * it rejects is what falls back to the default language, so its edges are the
 * Next Flavor's locale-resolution rule in `create-request-config.ts`.
 */
describe("isLanguageCode", () => {
  it.each(languages)("accepts the registered code %s", (code) => {
    expect(isLanguageCode(code)).toBe(true);
  });

  it.each([
    // A region-tagged tag is not a registry entry: `messages` has no key for it,
    // so it has to fall back rather than index to `undefined`.
    "vi-VN",
    "en-US",
    "fr",
    "unknown.txt",
    "",
  ])("rejects %o", (value) => {
    expect(isLanguageCode(value)).toBe(false);
  });

  it.each([undefined, null, 0, ["vi"]])(
    "rejects the non-string %o",
    (value) => {
      expect(isLanguageCode(value)).toBe(false);
    },
  );
});

describe("the registry", () => {
  it("holds a catalogue for every language, and none besides", () => {
    expect(Object.keys(messages).sort((a, b) => a.localeCompare(b))).toEqual(
      [...languages].sort((a, b) => a.localeCompare(b)),
    );
  });

  it("defaults to a language it actually registers", () => {
    expect(languages).toContain(defaultLanguage);
  });
});
