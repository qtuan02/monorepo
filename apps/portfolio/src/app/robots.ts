import type { MetadataRoute } from "next";

import { env } from "~/env";

/**
 * `/robots.txt`.
 *
 * The file name matters: the legacy app called this `robot.ts`, which is not a
 * convention Next recognises, so that site never served a generated
 * `robots.txt` at all. The Template's `public/robots.txt` was deleted along with
 * this file's arrival — two sources for one URL is one too many.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: new URL(
      "/sitemap.xml",
      env.NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN,
    ).toString(),
  };
}
