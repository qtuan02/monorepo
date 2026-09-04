import { createI18nRouting } from "@monorepo/i18n/next-intl/create-routing";

import { LANGUAGE_COOKIE_NAME } from "~/constants/cookies";

/**
 * The one routing table for this app's locales, built from the shared registry
 * in `@monorepo/i18n/languages` so a language is still added in one place.
 *
 * The same object is handed to the proxy and to `createNavigation` — they have
 * to agree on the prefix, or a generated `<Link>` points at a path the proxy
 * does not rewrite.
 */
export const routing = createI18nRouting({ cookieName: LANGUAGE_COOKIE_NAME });
