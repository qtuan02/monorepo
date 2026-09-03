import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    // Uncomment and configure when you have a domain:
    // sitemap: [`${env.NEXT_PUBLIC_TEMPLATE_DOMAIN}/sitemap.xml`],
  };
}
