import type { MetadataRoute } from "next";

import { env } from "~/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: [`${env.NEXT_PUBLIC_PORTFOLIO_V1_DOMAIN}/sitemap.xml`],
  };
}
