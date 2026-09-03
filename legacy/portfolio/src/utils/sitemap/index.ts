import type { MetadataRoute } from "next";

import { env } from "~/env";

// Adapt this as necessary
const host = env.NEXT_PUBLIC_PORTFOLIO_DOMAIN;

type Href = string;

function getEntries(
  href: Href,
  sitemap?: Omit<MetadataRoute.Sitemap[0], "url">,
): MetadataRoute.Sitemap {
  return [
    {
      lastModified: new Date(),
      ...sitemap,
      url: getUrl(href),
    },
  ];
}

function getUrl(href: Href) {
  return host + href;
}

function getSitemap(href: Href) {
  return [getUrl(href)];
}

export { getEntries, getUrl, getSitemap };
