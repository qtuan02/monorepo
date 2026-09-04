"use client";

import { useTranslations } from "next-intl";

import { Button } from "@monorepo/ui/components/button";

import { TemplateListSkeleton } from "~/features/dashboard/components/template-list.skeleton";
import { useGetTemplates } from "~/hooks/api/template";

/**
 * The interactive half of the server-cache-vs-Query boundary: data that arrives
 * **after** paint, is per-visitor and short-lived, and must not end up in the
 * HTML a crawler reads. It goes through TanStack Query and the same
 * `templateService` singleton the server side uses — one seam, two callers.
 *
 * A Client Component on purpose. The public launcher is the page that has to be
 * indexable; this list is behind the session guard and nobody indexes it.
 */
export default function TemplateList() {
  const t = useTranslations();
  const templatesQuery = useGetTemplates({ limit: 6 });

  // `isLoading`, not `isFetching`: the skeleton belongs to the first load only,
  // or it flashes back on every background refetch.
  if (templatesQuery.isLoading) return <TemplateListSkeleton />;

  if (templatesQuery.isError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground">
          {t("common.genericError")}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={templatesQuery.isFetching}
          onClick={() => {
            templatesQuery.refetch();
          }}
        >
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  const templates = templatesQuery.data ?? [];

  if (templates.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        {t("comingSoon.message")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {templates.map((template) => (
        <li
          key={template.id}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          {template.name}
        </li>
      ))}
    </ul>
  );
}
