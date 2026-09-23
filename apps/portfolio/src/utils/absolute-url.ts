import { env } from "~/env";
import { getPathname } from "~/i18n/navigation";

/**
 * The absolute URL a given locale serves an app path at — `/` for the default
 * language, `/en` for the rest, exactly as `localePrefix: "as-needed"` decides.
 *
 * `getPathname` is the same helper `Link` uses, so a prefix rule can never be
 * right in the navigation and wrong in the `<link rel="canonical">` or the
 * sitemap. Both of those callers want the same string, which is why this lives
 * in `~/utils` rather than beside either of them: a second copy is how a
 * canonical URL ends up pointing at a path the router never generates.
 */
export function absoluteUrl(locale: string, href: string): string {
  const pathname = getPathname({ locale, href });

  return new URL(pathname, env.NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN).toString();
}
