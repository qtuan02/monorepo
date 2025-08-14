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

// import type { MetadataRoute } from "next";
// import { getTranslations } from "next-intl/server";
// import { getDataDocs } from "~/features/docs/utils/get-data-docs";
// import { getEntries } from "~/utils/sitemap";

// export async function generateSitemaps({ locale }: { locale: string }) {
//   const t = await getTranslations({ locale, namespace: "Docs" });
//   const docs = getDataDocs(t).flatMap((doc) => doc.children);
//   return docs.map((doc) => ({ slug: doc.href }));
// }

// export default async function sitemap({
//   slug,
// }: {
//   slug: string;
// }): Promise<MetadataRoute.Sitemap> {
//   return getEntries(`/docs/${slug}`, {
//     lastModified: new Date(),
//     priority: 0.8,
//     changeFrequency: "daily",
//   });
// }
