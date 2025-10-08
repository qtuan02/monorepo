import type { MetadataRoute } from "next";

// import { env } from "~/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    // sitemap: [`${env.NEXT_PUBLIC_NEWS_DOMAIN}/sitemap.xml`],
  };
}
