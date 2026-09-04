import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

import { Badge } from "@monorepo/ui/components/badge";
import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { ImportSnippet } from "~/components/code/import-snippet";
import NotFound from "~/components/exception/not-found";
import { StorybookLink } from "~/components/link/storybook-link";
import { DocsSection } from "~/components/page/docs-section";
import { PageHeader } from "~/components/page/page-header";
import { ExportTable } from "~/components/table/export-table";
import { findComponent } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";
import { useDocumentTitle } from "~/hooks/use-document-title";

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
      <NotFound
        title={t("documents.notFound.title")}
        message={t("documents.notFound.component", { slug: slug ?? "" })}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={entry.slug}
        description={entry.description ?? undefined}
        meta={
          <Badge variant="outline" className="font-mono">
            {entry.subpath}
          </Badge>
        }
      />

      <DocsSection title={t("documents.components.detail.import")}>
        <ImportSnippet exports={entry.exports} importPath={entry.importPath} />
      </DocsSection>

      <DocsSection title={t("documents.components.detail.exports")}>
        <ExportTable
          exports={entry.exports}
          label={t("documents.components.columns.exports")}
        />
      </DocsSection>

      <DocsSection
        title={t("documents.components.detail.demo")}
        description={t("documents.components.detail.demoDescription")}
      >
        <StorybookLink docsId={entry.storybookDocsId}>
          {t("documents.components.detail.demoLink", { name: entry.slug })}
        </StorybookLink>
      </DocsSection>

      <div className="py-8">
        <Link
          to={ROUTES.COMPONENTS}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <ArrowLeft className="size-4" />
          {t("documents.components.detail.back")}
        </Link>
      </div>
    </>
  );
}
