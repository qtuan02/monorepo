import { getDataDocs } from "~/features/docs/utils/get-data-docs";
import { getEntries } from "~/utils/sitemap";

export async function generateSitemaps() {
  const docs = getDataDocs().flatMap((doc) => doc.children);
  return Array.from({ length: docs.length }, (_, index) => ({
    id: index + 1,
  }));
}

export default async function sitemap() {
  const docs = getDataDocs().flatMap((doc) => doc.children);

  return docs.map((doc) =>
    getEntries(doc.href, {
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "daily",
    }),
  );
}
