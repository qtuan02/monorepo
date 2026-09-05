import { useTranslation } from "react-i18next";

import type { SessionUser } from "~/types/session-user";
import SessionCard from "~/features/dashboard/components/session-card";

interface DashboardTemplateProps {
  /** Who is signed in, read by the route from the guard's context. */
  user: SessionUser;
}

/**
 * The guarded screen. `~/routes/protected`'s middleware decided a signed-out
 * visitor never gets here, so nothing in this tree re-checks the session for
 * access — it only *reads* it, to show who is signed in.
 *
 * Server rendered like every other template here, in the request's language,
 * because `entry.server` wraps the tree in an i18next instance fixed to it.
 * No `<main>` and no `min-h-dvh`: this renders into `BodyTemplate`'s outlet.
 */
export default function DashboardTemplate({ user }: DashboardTemplateProps) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-6 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("home.modules.dashboard.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("home.modules.dashboard.description")}
        </p>
      </header>

      <SessionCard user={user} />

      {/* #85 lands the second data path here: a client component over
          `~/hooks/api` + TanStack Query, reading `templateService` after
          paint, with its own skeleton and error state. It is deliberately
          NOT in this ticket — the point of the split is that the session
          above comes from the loader and the list below comes from Query,
          and one value never lives in both. */}
    </section>
  );
}
