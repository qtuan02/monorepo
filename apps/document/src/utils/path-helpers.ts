import { routing } from "~/i18n/routing";

/**
 * Extracts the locale from a pathname (format: /locale/...)
 * @param pathname - The full pathname including locale
 * @returns The locale string or default locale if not found
 */
export function extractLocale(pathname: string): string {
  return pathname.split("/")[1] || routing.defaultLocale;
}

/**
 * Removes the locale prefix from a pathname
 * @param pathname - The full pathname including locale
 * @returns The pathname without the locale prefix
 */
export function removeLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/[^/]+/, "") || "/";
}

/**
 * Parses pathname information including locale extraction
 * @param pathname - The full pathname
 * @returns Object containing pathname, pathnameWithoutLocale, and locale
 */
export function parsePathname(pathname: string) {
  return {
    pathname,
    pathnameWithoutLocale: removeLocalePrefix(pathname),
    locale: extractLocale(pathname),
  };
}

