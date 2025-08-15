import type { MetadataRoute } from "next";

import { getEntries } from "~/utils/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getEntries("/docs", {
      changeFrequency: "weekly",
      priority: 1,
    }),
  ];
}
