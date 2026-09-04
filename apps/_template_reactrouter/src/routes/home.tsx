import type { Route } from "./+types/home";
import { env } from "~/env";
import HomeTemplate from "~/features/home/templates/home.template";

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
 */
export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `Template React Router — Monorepo (${loaderData.appEnv})` },
    {
      name: "description",
      content:
        "Template app cho Runtime React Router 8 framework mode: SSR qua react-router-serve, cùng hệ sinh thái Vite với Template SPA.",
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
