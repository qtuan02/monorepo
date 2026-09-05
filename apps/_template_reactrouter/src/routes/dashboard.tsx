import { defaultLanguage } from "@monorepo/i18n/languages";

import type { Route } from "./+types/dashboard";
import { userContext } from "~/features/auth/middleware/user-context";
import DashboardTemplate from "~/features/dashboard/templates/dashboard.template";
import i18n from "~/libs/i18n";

/**
 * Reads the user the guard put in context. No session check of its own: this
 * route is nested under `~/routes/protected`, whose middleware has already
 * decided, and a second check here would be the "auth logic in every page"
 * drift the route-tree guard exists to prevent. Reading `userContext` in a
 * route mounted outside the guard throws — deliberately (see that file).
 */
export function loader({ context }: Route.LoaderArgs) {
  return { user: context.get(userContext) };
}

/**
 * `noindex` because a crawler can never see this page — it is bounced to
 * sign-in — and a URL that only ever answers a crawler with a redirect should
 * not be offered for indexing either. Same call the Next Template makes on its
 * guarded page.
 *
 * Translated through `getFixedT` off root's loader data, exactly as
 * `~/routes/home` does: `meta` runs outside the React tree, so the request's
 * i18next clone is unreachable from here.
 */
export function meta({ matches }: Route.MetaArgs) {
  // `?? defaultLanguage`: root exports an `ErrorBoundary`, so on an error
  // render its loader never ran and the typed value is `undefined` at runtime.
  const t = i18n.getFixedT(matches[0].loaderData?.language ?? defaultLanguage);

  return [
    {
      title: `${t("home.modules.dashboard.title")} — ${t("common.brand")}`,
    },
    { name: "description", content: t("home.modules.dashboard.description") },
    { name: "robots", content: "noindex" },
  ];
}

export default function DashboardRoute({ loaderData }: Route.ComponentProps) {
  return <DashboardTemplate user={loaderData.user} />;
}
