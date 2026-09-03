import { describe, expect, it } from "vitest";

import { defaultLanguage, languages } from "../../src/languages";
import { createI18nRouting } from "../../src/next-intl/create-routing";

/**
 * The Next Flavor has to read its locale list from the shared registry, or a
 * language added in `languages.ts` would reach the i18next Flavor and quietly
 * 404 in the Next one.
 */
describe("createI18nRouting", () => {
  it("takes its locales and default from the shared registry", () => {
    const routing = createI18nRouting({ cookieName: "monorepo_lang" });

    expect(routing.locales).toEqual(languages);
    expect(routing.defaultLocale).toBe(defaultLanguage);
  });

  it("leaves the default language unprefixed unless told otherwise", () => {
    expect(createI18nRouting({ cookieName: "x" }).localePrefix).toBe(
      "as-needed",
    );
    expect(
      createI18nRouting({ cookieName: "x", localePrefix: "always" })
        .localePrefix,
    ).toBe("always");
  });

  it("names the cookie the caller asked for", () => {
    const routing = createI18nRouting({ cookieName: "monorepo_lang" });

    expect(routing.localeCookie).toEqual({ name: "monorepo_lang" });
  });
});
