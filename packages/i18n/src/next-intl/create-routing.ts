import { defineRouting } from "next-intl/routing";

import { defaultLanguage, languages } from "../languages";

export interface CreateI18nRoutingOptions {
  /**
   * Cookie next-intl writes the chosen language to. Give it the same name the
   * i18next Flavor uses (`~/constants/cookies`) so one visitor keeps one
   * language across both kinds of app on the same domain.
   */
  cookieName: string;
  /**
   * `as-needed` keeps the default language at the bare path (`/gioi-thieu`) and
   * prefixes every other one (`/en/gioi-thieu`).
   */
  localePrefix?: "always" | "as-needed" | "never";
}

/**
 * The routing table for a Next Runtime, with `locales` taken from the shared
 * registry so a language is still added in exactly one place.
 *
 * Build it once per app in `~/i18n/routing.ts` and hand the same object to both
 * `createI18nProxy` and next-intl's `createNavigation` — they have to agree on
 * the prefix or a generated `<Link>` will not match what the proxy rewrites.
 */
export function createI18nRouting({
  cookieName,
  localePrefix = "as-needed",
}: CreateI18nRoutingOptions) {
  return defineRouting({
    locales: languages,
    defaultLocale: defaultLanguage,
    localePrefix,
    localeCookie: { name: cookieName },
  });
}

export type I18nRouting = ReturnType<typeof createI18nRouting>;
