/**
 * The locale registry — every code here must have a matching `dayjs/locale/<code>`
 * side-effect import in `dayjs.ts`. Without one, `dayjs.locale(code)` silently
 * keeps the previous locale instead of throwing, so the narrow list here is what
 * lets `set-locale.ts` fall back deliberately rather than no-op.
 *
 * Mirrors `@monorepo/i18n`'s language registry by value, not by import: dayjs is
 * a foundation-layer package and must not depend on i18n. The app's
 * `~/libs/dayjs.ts` wiring site is what bridges the two.
 */
export const locales = ["vi", "en"] as const;

export type DayjsLocale = (typeof locales)[number];

export const defaultLocale: DayjsLocale = "vi";
