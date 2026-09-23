import { createI18nRouting } from "@monorepo/i18n/next-intl/create-routing";

import { LANGUAGE_COOKIE_NAME } from "~/constants/cookies";

/**
 * The one routing table for this app's locales, built from the shared registry
 * in `@monorepo/i18n/languages` so a language is still added in one place.
 *
 * The same object is handed to the proxy and to `createNavigation` — they have
 * to agree on the prefix, or a generated `<Link>` points at a path the proxy
 * does not rewrite.
 *
 * Two divergences from every other app here, and they are one decision (#275):
 * a CV is read by people who may be anywhere, so it is written to be found in
 * English.
 *
 * - `defaultLocale: "en"` — English sits at `/`, Vietnamese at `/vi`, the
 *   mirror of the registry's `defaultLanguage` (still `vi`, and still right
 *   for the other apps).
 * - `localeDetection: false` — and the default actually *holds*. Left on,
 *   next-intl reads `Accept-Language` first, so a Vietnamese browser opening
 *   `/` is redirected to `/vi` and the "default" is whatever each visitor's
 *   browser asks for. Off, the URL alone decides: one shared link, one crawled
 *   page, one language. The cost is that a returning visitor's cookie no
 *   longer moves them — next-intl folds cookie reading into the same flag —
 *   so the switcher is the only way to Vietnamese, and it works by navigating.
 *
 * Read the default from **this object** everywhere else in the app —
 * `routing.defaultLocale`, never `defaultLanguage` from the registry, which is
 * still `vi` and now means something different here.
 */
export const routing = createI18nRouting({
  cookieName: LANGUAGE_COOKIE_NAME,
  defaultLocale: "en",
  localeDetection: false,
});
