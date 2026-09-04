import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getHomeCatalogue } from "~/features/home/server/home-catalogue";
import HomeTemplate from "~/features/home/templates/home.template";

/**
 * Metadata built from the same data the page renders — the reason the loader is
 * a cached function rather than a fetch inside the component. Both calls hit one
 * cache entry, so the catalogue is resolved once per render.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [modules, t] = await Promise.all([
    getHomeCatalogue(),
    getTranslations(),
  ]);

  return {
    title: t("home.title"),
    description: t("home.description"),
    keywords: modules.map((module) => t(`home.modules.${module.id}.title`)),
  };
}

/**
 * The public page. A thin route module: it resolves the data and renders the
 * slice's template, exactly as `~/pages/<feat>-page.tsx` does in the SPA.
 */
export default async function HomePage() {
  const modules = await getHomeCatalogue();

  return <HomeTemplate modules={modules} />;
}
