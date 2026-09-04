import type { MetadataRoute } from "next";

import { ROUTES } from "~/constants/routes";
import { env } from "~/env";
import { getPathname } from "~/i18n/navigation";
import { routing } from "~/i18n/routing";

/**
 * Builds the absolute URL a locale serves a given app path at — `/` for the
 * default language, `/en` for the rest, exactly as `localePrefix: "as-needed"`
 * decides. `getPathname` is the same helper `Link` uses, so a prefix rule can
 * never be right in the navigation and wrong in the sitemap.
 */
function absoluteUrl(locale: string, href: string): string {
  const pathname = getPathname({ locale, href });

  return new URL(pathname, env.NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN).toString();
}

/**
 * `/sitemap.xml`, listing every route this site actually has, each with the
 * `alternates.languages` map that tells a crawler the two URLs are the same
 * page in different languages.
 *
 * The legacy app answered this path with a hand-written `sitemapindex` pointing
 * at `/api/sitemaps/common/sitemap.xml` — a route that exists nowhere in that
 * repo, so the sitemap was a dead link.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(ROUTES).map((href) => ({
    url: absoluteUrl(routing.defaultLocale, href),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, absoluteUrl(locale, href)]),
      ),
    },
  }));
}
