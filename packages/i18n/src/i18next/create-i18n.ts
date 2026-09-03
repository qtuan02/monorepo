import type { i18n as I18n, ResourceLanguage } from "i18next";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ICU from "i18next-icu";
import { initReactI18next } from "react-i18next";

import type { LanguageCode } from "../languages";
import { defaultLanguage, languages, messages } from "../languages";

/**
 * i18next wants each language wrapped in a namespace; the catalogue itself is
 * the shared ICU one, so the two Flavors read the very same objects. Typed
 * against the registry, so a new code breaks here as well as in `languages.ts`.
 */
const resources: Record<LanguageCode, ResourceLanguage> = {
  vi: { translation: messages.vi },
  en: { translation: messages.en },
};

export interface CreateI18nOptions {
  /** Cookie holding the chosen language — from the app's `~/constants/cookies`. */
  cookieName: string;
  /**
   * Leave unset to scope the cookie to the current host. Set a shared parent
   * domain (".example.com") to carry one language choice across subdomains.
   */
  cookieDomain?: string;
}

/**
 * Initializes the shared i18next singleton for a Vite Runtime. Call it exactly
 * once per app, from that app's `~/libs/i18n.ts` — the same wiring-site rule
 * `~/libs/http-client.ts` follows for `@monorepo/api` services.
 *
 * `.use(ICU)` is what lets one ICU catalogue serve both Flavors. It replaces
 * i18next's own interpolator and its `key_one` / `key_context` lookup, so the
 * catalogue's syntax is ICU throughout — `{name}`, not `{{name}}`, and a single
 * `{count, plural, ...}` message instead of a suffixed key pair. A leftover
 * `{{name}}` does not throw: it renders literally.
 */
export function createI18n({
  cookieName,
  cookieDomain,
}: CreateI18nOptions): I18n {
  i18next
    .use(LanguageDetector)
    .use(ICU)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: defaultLanguage,
      load: "languageOnly",
      supportedLngs: languages,
      // Inert while ICU is active — i18next's interpolator never runs. Kept so
      // the setting is correct again the day ICU is removed, and because React
      // already escapes values either way.
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ["cookie", "navigator"],
        caches: ["cookie"],
        lookupCookie: cookieName,
        cookieMinutes: 525600, // one year
        cookieDomain,
      },
    });

  return i18next;
}
