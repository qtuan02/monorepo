import { defaultLanguage } from "@monorepo/i18n/languages";

import type { Route } from "./+types/home";
import { env } from "~/env";
import HomeTemplate from "~/features/home/templates/home.template";
import i18n from "~/libs/i18n";

/**
 * Runs on the server for the first render, so what it returns is in the HTML
 * before any JavaScript does — the property this whole Runtime exists for.
 *
 * It also fixes where this Runtime's two data paths meet: a `loader` for what a
 * crawler must read and what `meta` is built from, TanStack Query in a client
 * component for what happens after paint. One value never lives in both.
 *
 * The build eliminates this export from the client bundle, which is what makes
 * it safe for a loader to read server-side config. Nothing here reaches a
 * backend — `react-router build` executes a loader when prerendering, so a
 * Template's own screens have to resolve with no server running.
 */
export function loader() {
  return { appEnv: env.PUBLIC_APP_ENV };
}

/**
 * `meta` is what a crawler reads, and it runs on the server for the first
 * render too. It is built from `loaderData` rather than from a second read, so
 * the tab and the page cannot describe different things.
 *
 * Translating it takes `getFixedT` rather than `useTranslation`, because this
 * runs outside the React tree: there is no provider in scope, so the request's
 * own i18next clone is unreachable. `getFixedT(language)` reads the shared
 * store at a fixed language without moving the singleton — the one i18next API
 * that is safe to call on it from a server.
 *
 * The language comes from `matches[0].loaderData`, root's loader data. Typegen
 * emits `Matches` as a TUPLE, so index 0 is statically root's return type; and
 * root is where the negotiation happened, so this cannot disagree with the
 * language the tree is being rendered in. Re-deriving it from the request here
 * would be a second decision to keep in step for no gain.
 */
export function meta({ loaderData, matches }: Route.MetaArgs) {
  // `?? defaultLanguage` even though the type says it is present: root exports
  // an `ErrorBoundary`, so on an error render its loader never ran and the
  // typed value is `undefined` at runtime.
  const t = i18n.getFixedT(matches[0].loaderData?.language ?? defaultLanguage);

  return [
    {
      title: t("templateReactRouter.home.meta.title", {
        appEnv: loaderData.appEnv,
      }),
    },
    {
      name: "description",
      content: t("templateReactRouter.home.meta.description"),
    },
  ];
}

/**
 * The whole body of a route module: hand what only the framework can resolve to
 * the slice's template. Markup, copy and state belong in `~/features/<feat>/`,
 * exactly as they do in the other two Runtimes.
 */
export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomeTemplate appEnv={loaderData.appEnv} />;
}
