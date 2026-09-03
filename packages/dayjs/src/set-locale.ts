import type { DayjsLocale } from "./locales";
import dayjs from "./dayjs";
import { defaultLocale, locales } from "./locales";

const isDayjsLocale = (locale: string): locale is DayjsLocale =>
  locales.some((candidate) => candidate === locale);

/**
 * Switches the active locale, falling back to the default for anything the
 * registry does not carry — `dayjs.locale()` on its own silently no-ops for a
 * locale that was never imported, leaving the previous one in place.
 *
 * Takes a plain `string` rather than `DayjsLocale` because it is fed from
 * i18next's `languageChanged` event, which is typed `string`. Matching on the
 * language half is what keeps a region code (`navigator.language` gives "en-US")
 * from missing the registry and falling back when it need not; dayjs resolves
 * "-" codes itself, but only once they are past this check.
 */
export function setDayjsLocale(locale: string): void {
  const language = locale.split("-")[0] ?? "";

  dayjs.locale(isDayjsLocale(language) ? language : defaultLocale);
}
