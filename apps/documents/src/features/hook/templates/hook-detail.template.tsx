import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";

import { Badge } from "@monorepo/ui/components/badge";
import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { ImportSnippet } from "~/components/code/import-snippet";
import NotFound from "~/components/exception/not-found";
import { DocsSection } from "~/components/page/docs-section";
import { PageHeader } from "~/components/page/page-header";
import { ExportTable } from "~/components/table/export-table";
import { findHook } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";
import { useDocumentTitle } from "~/hooks/use-document-title";

export default function HookDetailTemplate() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const entry = findHook(slug);

  useDocumentTitle(entry?.slug ?? t("documents.notFound.title"));

  if (!entry) {
    return (
      <NotFound
        title={t("documents.notFound.title")}
        message={t("documents.notFound.hook", { slug: slug ?? "" })}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={entry.slug}
        // The sentence comes from the shared catalogue rather than the
        // generator: a hook's source carries no JSDoc today, and the published
        // README already writes one line for each of the five.
        description={t(`documents.hooks.items.${entry.slug}.description`)}
        meta={
          <Badge variant="outline" className="font-mono">
            {entry.subpath}
          </Badge>
        }
      />

      <DocsSection title={t("documents.hooks.detail.import")}>
        <ImportSnippet exports={entry.exports} importPath={entry.importPath} />
      </DocsSection>

      <DocsSection title={t("documents.hooks.detail.exports")}>
        <ExportTable
          exports={entry.exports}
          label={t("documents.hooks.columns.exports")}
        />
      </DocsSection>

      <div className="py-8">
        <Link
          to={ROUTES.HOOKS}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <ArrowLeft className="size-4" />
          {t("documents.hooks.detail.back")}
        </Link>
      </div>
    </>
  );
}
