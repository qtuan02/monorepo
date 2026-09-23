import { defineRouting } from "next-intl/routing";

import type { LanguageCode } from "../languages";
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
  /**
   * Which language this app serves at the bare path. Defaults to the registry's
   * `defaultLanguage` — the right answer for an app whose readers are here, and
   * the answer every app took until one of them was not.
   *
   * `apps/portfolio` overrides it to `en`: a CV is read by recruiters who may
   * be anywhere, and the language a stranger with no `Accept-Language` match
   * lands in is the one the site is indexed in. It is a **routing** decision,
   * per app, which is why it lives here rather than in the shared registry —
   * moving `defaultLanguage` would move every app at once.
   */
  defaultLocale?: LanguageCode;
  /**
   * Whether the proxy negotiates a locale from `Accept-Language` (and from the
   * cookie a previous visit left) before falling back to `defaultLocale`.
   * Defaults to next-intl's own `true`, which is what an app whose readers
   * share a language wants.
   *
   * `apps/portfolio` turns it **off**: with it on, the bare path is whatever
   * language the reader's browser happens to ask for, so "the default" is a
   * promise the site never keeps — and the one URL a crawler and a shared link
   * both land on answers differently per visitor. Off, the URL alone decides:
   * `/` is the default language, `/vi` is Vietnamese, and the switcher moves
   * between them by navigating.
   *
   * Note this also stops the locale **cookie** from being read (next-intl folds
   * both into this one flag), so a returning visitor's previous choice no
   * longer moves them off the bare path. That is the trade the flag makes.
   */
  localeDetection?: boolean;
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
  defaultLocale = defaultLanguage,
  localeDetection = true,
}: CreateI18nRoutingOptions) {
  return defineRouting({
    locales: languages,
    defaultLocale,
    localePrefix,
    localeDetection,
    localeCookie: { name: cookieName },
  });
}

export type I18nRouting = ReturnType<typeof createI18nRouting>;
