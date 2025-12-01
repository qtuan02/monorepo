import type { MetadataRoute } from "next";

import { getEntries } from "~/utils/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  // Adapt this as necessary
  return [
    ...getEntries("/about", {
      changeFrequency: "weekly",
      priority: 1,
    }),
  ];
}
