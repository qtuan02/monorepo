import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Badge } from "@monorepo/ui/components/badge";

import type { DocsEntry } from "~/types/docs-catalogue";
import { ROUTES } from "~/constants/routes";

interface HookCardProps {
  entry: DocsEntry;
}

/**
 * One hook in the list. Unlike a primitive it carries a sentence, because there
 * are only five of them and the published README already writes one for each —
 * the copy lives in the shared i18n catalogue, keyed by slug.
 */
export default function HookCard({ entry }: HookCardProps) {
  const { t } = useTranslation();

  return (
    <Link
      to={ROUTES.hookBySlugPath(entry.slug)}
      className="border-border bg-card hover:border-primary/50 focus-visible:ring-ring/50 flex flex-col gap-2 rounded-lg border p-4 transition-colors outline-none focus-visible:ring-2"
    >
      <span className="font-mono text-sm font-semibold">{entry.slug}</span>
      <span className="text-muted-foreground text-sm">
        {t(`documents.hooks.items.${entry.slug}.description`)}
      </span>
      <Badge variant="secondary" className="w-fit">
        {t("documents.hooks.exportCount", { count: entry.exports.length })}
      </Badge>
    </Link>
  );
}
