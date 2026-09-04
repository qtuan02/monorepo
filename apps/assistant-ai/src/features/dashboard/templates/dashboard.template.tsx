import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { PageContent } from "~/components/page/page-content";
import { PageHeader } from "~/components/page/page-header";
import SessionCard from "~/features/dashboard/components/session-card";
import { SessionCardSkeleton } from "~/features/dashboard/components/session-card.skeleton";
import TemplateList from "~/features/dashboard/components/template-list";

/**
 * The guarded screen. `proxy.ts` decided a signed-out visitor never gets here,
 * so nothing in this tree re-checks the session for access — it only *reads* it,
 * to show who is signed in.
 *
 * Three kinds of content on one page, which is the whole lesson:
 *   - the header and the section titles are static, in the prerendered shell;
 *   - `SessionCard` reads the request, so it streams inside `<Suspense>`;
 *   - `TemplateList` is a Client Component fetching after paint.
 *
 * The Template's "Thử lại" button is gone with the `home` slice this app
 * replaced: it posted to a Server Action that invalidated that slice's cached
 * catalogue, and there is no cached catalogue here — the chat screen is a client
 * island, not a server read.
 */
export default function DashboardTemplate() {
  const t = useTranslations();

  return (
    <>
      <PageHeader
        title={t("assistantAi.dashboard.title")}
        description={t("assistantAi.dashboard.description")}
      />
      <PageContent className="flex flex-col gap-6">
        <Suspense fallback={<SessionCardSkeleton />}>
          <SessionCard />
        </Suspense>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("header.toolbar")}
          </h2>
          <TemplateList />
        </section>
      </PageContent>
    </>
  );
}
