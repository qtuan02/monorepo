import { useTranslation } from "react-i18next";

import { BootIsland } from "~/components/boot/boot-island";

/** Shown by both guards while `useSessionCheck` awaits `/auth/refresh`. */
export default function RouteGuardLoading() {
  const { t } = useTranslation();
  return <BootIsland message={t("chat.auth.boot.checkingSession")} />;
}
