import { data, isRouteErrorResponse } from "react-router";

import { defaultLanguage } from "@monorepo/i18n/languages";

import type { Route } from "./+types/module";
import InternalServerError from "~/components/exception/internal-server-error";
import NotFound from "~/components/exception/not-found";
import ModuleTemplate from "~/features/home/templates/module.template";
import { findHomeModule } from "~/features/home/utils/find-home-module";
import i18n from "~/libs/i18n";

/**
 * The one place a slug becomes a module — or a 404. `throw`, not `return`: a
 * thrown `data()` skips the component and lands in the nearest `ErrorBoundary`
 * with the status it carries, and the server runtime uses that status for the
 * document itself, so a crawler gets a real 404 and drops the URL rather than
 * indexing a page that merely says "not found".
 *
 * Nothing here reaches a backend: `react-router build` executes a loader when
 * prerendering, so a Template's own screens have to resolve with no server
 * running. Swap `findHomeModule` for a `templateService` call when a real API
 * exists, and keep the throw exactly as it is.
 */
export function loader({ params }: Route.LoaderArgs) {
  const module = findHomeModule(params.slug);

  if (!module) {
    throw data(null, { status: 404 });
  }

  return { module };
}

/**
 * The tab is the module's own title — this is the property user story 12
 * exists for: one indexable URL per module, each with its own `<title>` and
 * description.
 *
 * `loaderData` is typed as present but is `undefined` when the loader threw:
 * this route has its own `ErrorBoundary`, so `meta` still runs for that error
 * render, and there the tab has to say 404 in the visitor's language, not
 * crash on a property of `undefined`. Root's entry, by contrast, is always
 * present on that path — root's loader succeeded for this route's `meta` to
 * run at all — so its `?? defaultLanguage` is the type's demand, not a branch.
 *
 * `getFixedT` over `matches[0].loaderData.language` for the same reason as in
 * `~/routes/home`: this runs outside the React tree, so the request's i18next
 * clone is out of reach, and `getFixedT` reads the shared store without moving
 * the singleton.
 */
export function meta({ loaderData, matches }: Route.MetaArgs) {
  const t = i18n.getFixedT(matches[0].loaderData?.language ?? defaultLanguage);

  if (!loaderData) {
    return [{ title: t("notFound.title") }];
  }

  return [
    { title: t(`home.modules.${loaderData.module.id}.title`) },
    {
      name: "description",
      content: t(`home.modules.${loaderData.module.id}.description`),
    },
  ];
}

/**
 * A route-level boundary rather than leaving the 404 to root's: root's
 * `ErrorBoundary` replaces the whole shell, so a visitor who mistyped a slug
 * would lose the header and every way out with it. Catching it here keeps the
 * chrome — the same reason the Next Template's `not-found.tsx` sits inside its
 * `(shell)` group.
 *
 * Only a 404 is "ours"; any other status or a thrown `Error` is a crash, and
 * that screen is the shared 500 like everywhere else in the workspace — not
 * `fullscreen`, because this boundary renders inside the shell's column, not
 * in place of it.
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  return <InternalServerError fullscreen={false} />;
}

/**
 * The whole body of a route module: hand what only the framework can resolve to
 * the slice's template.
 */
export default function ModuleRoute({ loaderData }: Route.ComponentProps) {
  return <ModuleTemplate module={loaderData.module} />;
}
