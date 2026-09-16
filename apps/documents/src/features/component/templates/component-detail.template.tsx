import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { DetailHero } from "~/components/detail/detail-hero";
import { DetailPanels } from "~/components/detail/detail-panels";
import { DetailToolbar } from "~/components/detail/detail-toolbar";
import NotFound from "~/components/exception/not-found";
import { GlassPanel } from "~/components/panel/glass-panel";
import { componentCatalogue, findComponent } from "~/constants/docs-catalogue";
import { NPM_URLS } from "~/constants/packages";
import { ROUTES } from "~/constants/routes";
import { useDocumentTitle } from "~/hooks/use-document-title";
import { catalogueNeighbours } from "~/utils/catalogue-neighbours";

export default function ComponentDetailTemplate() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const entry = findComponent(slug);

  // Called unconditionally — a hook cannot sit behind the `entry` check, so the
  // missing case names itself in the title instead of skipping it.
  useDocumentTitle(entry?.slug ?? t("documents.notFound.title"));

  if (!entry) {
    // Rendered in place rather than redirected: the URL the visitor typed is
    // what should 404, and a redirect would hide which slug was wrong.
    return (
      <GlassPanel className="px-4 py-6 sm:px-8">
        <NotFound
          title={t("documents.notFound.title")}
          message={t("documents.notFound.component", { slug: slug ?? "" })}
        />
      </GlassPanel>
    );
  }

  const { prev, next } = catalogueNeighbours(
    componentCatalogue.items,
    entry.slug,
  );
  const neighbour = (
    target: typeof entry,
    labelKey:
      | "documents.components.detail.prev"
      | "documents.components.detail.next",
  ) => ({
    slug: target.slug,
    to: ROUTES.componentBySlugPath(target.slug),
    label: t(labelKey, { slug: target.slug }),
  });

  return (
    <>
      <DetailToolbar
        section={t("documents.nav.components")}
        slug={entry.slug}
        prev={prev && neighbour(prev, "documents.components.detail.prev")}
        next={next && neighbour(next, "documents.components.detail.next")}
      />

      <DetailHero
        slug={entry.slug}
        packageName={componentCatalogue.package}
        subpath={entry.subpath}
        exportSummary={t("documents.components.detail.exportSummary", {
          count: entry.exports.length,
        })}
        description={entry.description}
        npmUrl={NPM_URLS.ui}
        storybookDocsId={entry.storybookDocsId}
      />

      <DetailPanels
        exports={entry.exports}
        importPath={entry.importPath}
        importHeading={t("documents.components.detail.import")}
        exportsHeading={t("documents.components.detail.exports")}
      />
    </>
  );
}
