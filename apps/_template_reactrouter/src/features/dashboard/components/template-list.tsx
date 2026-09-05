import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";

import { TemplateListSkeleton } from "~/features/dashboard/components/template-list.skeleton";
import { useGetTemplates } from "~/hooks/api/template";

/**
 * The second data path of this Runtime, and the one this Template exists to
 * draw a line around: data that arrives **after** paint, is per-visitor and
 * short-lived, and must not be in the HTML the server sends. It goes through
 * TanStack Query and the same `templateService` singleton a loader would use —
 * one seam, two callers.
 *
 * Why not a loader, when this app has loaders everywhere else: a loader's data
 * is part of the document, so refetching it re-runs the server render and every
 * other loader on the route. The session card above comes from the loader
 * because the page is *about* the session; this list is a widget that reloads on
 * its own. One value never lives in both — there is no `dehydrate` /
 * `HydrationBoundary` here, deliberately.
 *
 * It renders on the server too — everything in this Runtime does — but with no
 * data: React Query does not fetch during a server render, so the server sends
 * the skeleton and the browser fetches once it hydrates.
 */
export default function TemplateList() {
  const { t } = useTranslation();
  const templatesQuery = useGetTemplates({ limit: 6 });

  // `isLoading`, not `isFetching`: the skeleton belongs to the first load only,
  // or it flashes back over loaded rows on every background refetch.
  if (templatesQuery.isLoading) return <TemplateListSkeleton />;

  if (templatesQuery.isError) {
    return (
      <div className="border-border flex flex-col items-start gap-3 rounded-md border p-4">
        <p className="text-muted-foreground text-sm">
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
      <p className="border-border text-muted-foreground rounded-md border border-dashed p-4 text-sm">
        {t("templateReactRouter.dashboard.templates.empty")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {templates.map((template) => (
        <li
          key={template.id}
          className="border-border rounded-md border px-3 py-2 text-sm"
        >
          {template.name}
        </li>
      ))}
    </ul>
  );
}
