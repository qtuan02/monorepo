import type { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";

/**
 * What `IslandBoundary` renders in place of an Island's content once it has
 * thrown — same footprint as the "couldn't load" branch `MessageList` already
 * has for a query error (see .agents/knowledge-base.md — a render throw is a
 * different failure than a query's own `isError`), so the two read as one
 * family. No `min-h-svh`: this fills its Island, not the viewport.
 */
export default function IslandFallback({ resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
      <p className="text-muted-foreground text-sm">
        {t("chat.islandFallback.title")}
      </p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        {t("chat.islandFallback.retry")}
      </Button>
    </div>
  );
}
