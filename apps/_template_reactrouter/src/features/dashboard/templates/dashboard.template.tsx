import { useTranslation } from "react-i18next";

import type { SessionUser } from "~/types/session-user";
import SessionCard from "~/features/dashboard/components/session-card";
import TemplateList from "~/features/dashboard/components/template-list";

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
 *
 * The two halves are the lesson. `SessionCard` is loader data: it is in the
 * first HTML because the page is about the session. `TemplateList` fetches
 * itself after paint through TanStack Query, so refetching it never re-runs a
 * loader — and its content is deliberately absent from what the server sends.
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          {t("templateReactRouter.dashboard.templates.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("templateReactRouter.dashboard.templates.lead")}
        </p>
        <TemplateList />
      </section>
    </section>
  );
}
