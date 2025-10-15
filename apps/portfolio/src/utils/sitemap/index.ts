import type { MetadataRoute } from "next";
import type { Locale } from "next-intl";

import { env } from "~/env";
import { getPathname } from "~/i18n/navigation";
import { routing } from "~/i18n/routing";

// Adapt this as necessary
const host = env.NEXT_PUBLIC_PORTFOLIO_DOMAIN;

type Href = Parameters<typeof getPathname>[0]["href"];

function getEntries(
  href: Href,
  sitemap?: Omit<MetadataRoute.Sitemap[0], "url" | "alternates">,
): MetadataRoute.Sitemap {
  return routing.locales.map<MetadataRoute.Sitemap[0]>((locale) => ({
    lastModified: new Date(),
    ...sitemap,
    url: getUrl(href, locale),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((cur) => [cur, getUrl(href, cur)]),
      ),
    },
  }));
}

function getUrl(href: Href, locale: Locale) {
  const pathname = getPathname({ locale, href });
  return host + pathname;
}

function getSitemap(href: Href) {
  return routing.locales.map((locale) => getUrl(href, locale));
}

export { getEntries, getUrl, getSitemap };
