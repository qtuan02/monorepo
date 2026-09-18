import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { useBackendHealthQuery } from "~/hooks/api/health";

/**
 * Health gate (CONTEXT.md): blocks the whole app — nothing else renders —
 * until `GET /health-check` answers, retrying every 2s. No precedent
 * elsewhere in the repo; every other app assumes its backend is already up.
 */
export default function HealthGate({ children }: { children: ReactNode }) {
  const healthQuery = useBackendHealthQuery();

  if (!healthQuery.isSuccess) {
    return (
      <main className="bg-background text-foreground grid min-h-svh place-items-center">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          <span>Connecting to server...</span>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
