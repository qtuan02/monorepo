import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { DetailExample } from "~/components/detail/detail-example";
import { DetailHero } from "~/components/detail/detail-hero";
import { DetailPanels } from "~/components/detail/detail-panels";
import { DetailToolbar } from "~/components/detail/detail-toolbar";
import NotFound from "~/components/exception/not-found";
import { GlassPanel } from "~/components/panel/glass-panel";
import { findHook, hookCatalogue } from "~/constants/docs-catalogue";
import { NPM_URLS } from "~/constants/packages";
import { ROUTES } from "~/constants/routes";
import { useDocumentTitle } from "~/hooks/use-document-title";
import { catalogueNeighbours } from "~/utils/catalogue-neighbours";

export default function HookDetailTemplate() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const entry = findHook(slug);

  useDocumentTitle(entry?.slug ?? t("documents.notFound.title"));

  if (!entry) {
    return (
      <GlassPanel className="px-4 py-6 sm:px-8">
        <NotFound
          title={t("documents.notFound.title")}
          message={t("documents.notFound.hook", { slug: slug ?? "" })}
        />
      </GlassPanel>
    );
  }

  const { prev, next } = catalogueNeighbours(hookCatalogue.items, entry.slug);
  return (
    <>
      <DetailToolbar
        section={t("documents.nav.hooks")}
        slug={entry.slug}
        prev={prev}
        next={next}
        buildPath={ROUTES.hookBySlugPath}
      />

      <DetailHero
        slug={entry.slug}
        packageName={hookCatalogue.package}
        subpath={entry.subpath}
        exportSummary={t("documents.hooks.detail.exportSummary", {
          count: entry.exports.length,
        })}
        // The sentence comes from the shared catalogue rather than the
        // generator's `description`: the JSDoc is English only, and this
        // site reads in two languages. The example below is the one field a
        // hook page does take from the source.
        description={t(`documents.hooks.items.${entry.slug}.description`)}
        npmUrl={NPM_URLS.hook}
        storybookDocsId={entry.storybookDocsId}
      />

      {/* The same frame a primitive page embeds: the hook's story on Storybook
          is a small screen that uses it, so a reader sees it work before
          reading how it is called. */}
      <DetailExample
        heading={t("documents.hooks.detail.example")}
        title={t("documents.hooks.detail.exampleFrame", { slug: entry.slug })}
        storyId={entry.storybookExampleId}
      />

      <DetailPanels
        exports={entry.exports}
        importPath={entry.importPath}
        importHeading={t("documents.hooks.detail.import")}
        exportsHeading={t("documents.hooks.detail.exports")}
        // The snippet is the hook's own `@example`, read by the generator —
        // the same text a consumer sees on hover, so the two cannot drift.
        example={
          entry.example === null
            ? undefined
            : {
                heading: t("documents.hooks.detail.usage"),
                code: entry.example,
              }
        }
      />
    </>
  );
}
