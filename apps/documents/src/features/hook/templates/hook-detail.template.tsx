import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

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
  const neighbour = (
    target: typeof entry,
    labelKey: "documents.hooks.detail.prev" | "documents.hooks.detail.next",
  ) => ({
    slug: target.slug,
    to: ROUTES.hookBySlugPath(target.slug),
    label: t(labelKey, { slug: target.slug }),
  });

  return (
    <>
      <DetailToolbar
        section={t("documents.nav.hooks")}
        slug={entry.slug}
        prev={prev && neighbour(prev, "documents.hooks.detail.prev")}
        next={next && neighbour(next, "documents.hooks.detail.next")}
      />

      <DetailHero
        slug={entry.slug}
        packageName={hookCatalogue.package}
        subpath={entry.subpath}
        exportCount={t("documents.hooks.exportCount", {
          count: entry.exports.length,
        })}
        // The sentence comes from the shared catalogue rather than the
        // generator: a hook's source carries no JSDoc today, and the published
        // README already writes one line for each of the five.
        description={t(`documents.hooks.items.${entry.slug}.description`)}
        npmUrl={NPM_URLS.hook}
      />

      <DetailPanels
        exports={entry.exports}
        importPath={entry.importPath}
        importHeading={t("documents.hooks.detail.import")}
        exportsHeading={t("documents.hooks.detail.exports")}
      />
    </>
  );
}
