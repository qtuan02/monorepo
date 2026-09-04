import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Badge } from "@monorepo/ui/components/badge";

import type { ComponentDocsEntry } from "~/types/docs-catalogue";
import { ROUTES } from "~/constants/routes";

interface ComponentCardProps {
  entry: ComponentDocsEntry;
}

/**
 * One primitive in the list. The heading is the **slug**, not a prettified
 * name, because the slug is what a consumer types in the import path.
 */
export default function ComponentCard({ entry }: ComponentCardProps) {
  const { t } = useTranslation();

  return (
    <Link
      to={ROUTES.componentBySlugPath(entry.slug)}
      className="border-border bg-card hover:border-primary/50 focus-visible:ring-ring/50 flex flex-col gap-2 rounded-lg border p-4 transition-colors outline-none focus-visible:ring-2"
    >
      <span className="font-mono text-sm font-semibold">{entry.slug}</span>
      <span className="text-muted-foreground truncate font-mono text-xs">
        {entry.subpath}
      </span>
      <Badge variant="secondary" className="w-fit">
        {t("documents.components.exportCount", { count: entry.exports.length })}
      </Badge>
    </Link>
  );
}
