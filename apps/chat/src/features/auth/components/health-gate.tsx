import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { BootIsland } from "~/components/boot/boot-island";
import { useBackendHealthQuery } from "~/hooks/api/health";

/**
 * Health gate (CONTEXT.md): blocks the whole app — nothing else renders —
 * until `GET /health-check` answers, retrying every 2s. No precedent
 * elsewhere in the repo; every other app assumes its backend is already up.
 */
export default function HealthGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const healthQuery = useBackendHealthQuery();

  if (!healthQuery.isSuccess) {
    return <BootIsland message={t("chat.auth.boot.connecting")} />;
  }

  return <>{children}</>;
}
