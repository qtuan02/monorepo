import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import DashboardTemplate from "~/features/dashboard/templates/dashboard.template";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("home.modules.dashboard.title"),
    // A guarded page has nothing to gain from being indexed, and something to
    // lose: the URL would show up in results for people who cannot open it.
    robots: { index: false, follow: false },
  };
}

/** Guarded by `proxy.ts` — no page-level auth check, by design. */
export default function DashboardPage() {
  return <DashboardTemplate />;
}
