import { getRequestConfig } from "next-intl/server";

import { defaultLanguage, isLanguageCode, messages } from "../languages";

export interface CreateRequestConfigOptions {
  /** IANA zone every server-formatted date is rendered in. */
  timeZone: string;
  /**
   * Reads the locale segment of the request being rendered. In a Next 16 app
   * that is `locale` from `next/root-params`.
   *
   * The app passes the reader rather than this package importing it: the types
   * of `next/root-params` are generated per app from its own route tree, and
   * next-intl's own `requestLocale` is deprecated because it reads a header,
   * which opts the whole render out of `cacheComponents`.
   */
  resolveLocale: () => Promise<string | undefined>;
}

/**
 * Builds the module `next-intl`'s plugin loads as `~/i18n/request.ts` — the one
 * place a Next Runtime resolves a locale and hands over its messages.
 *
 * Inside the RSC graph — where Next loads `i18n/request.ts` — `getRequestConfig`
 * is an identity function that exists for the types, so a shared package may
 * build the whole callback and the app's file is a single default re-export.
 * Resolved without the `react-server` condition (a plain test run, a Client
 * Component) the very same import returns a function that throws when called,
 * so the locale-resolution rule below is covered through `isLanguageCode`
 * instead of by invoking the callback.
 */
export function createRequestConfig({
  timeZone,
  resolveLocale,
}: CreateRequestConfigOptions) {
  return getRequestConfig(async ({ locale }) => {
    // `locale` is set only when a caller overrides it — `getTranslations({
    // locale })` from a Server Action or a Route Handler, the two places
    // `next/root-params` cannot be read yet.
    const requested = locale ?? (await resolveLocale());
    const resolved = isLanguageCode(requested) ? requested : defaultLanguage;

    return {
      locale: resolved,
      messages: messages[resolved],
      timeZone,
    };
  });
}
