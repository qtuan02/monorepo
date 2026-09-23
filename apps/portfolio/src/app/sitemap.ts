import type { MetadataRoute } from "next";

import { ROUTES } from "~/constants/routes";
import { routing } from "~/i18n/routing";
import { absoluteUrl } from "~/utils/absolute-url";

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
