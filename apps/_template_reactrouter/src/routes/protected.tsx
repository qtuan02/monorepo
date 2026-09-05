import { Outlet } from "react-router";

import type { Route } from "./+types/protected";
import { requireSession } from "~/features/auth/middleware/require-session";
import { userContext } from "~/features/auth/middleware/user-context";

/**
 * The session guard as a route: a pathless `layout()` in `src/routes.ts` that
 * adds no segment and gates every route nested under it — this Runtime's
 * spelling of the SPA's `<Route element={<ProtectedRoute />}>` inside the
 * shell, and of the Next Template's `proxy.ts` checking a prefix list. Here the
 * route table IS the prefix list.
 *
 * The decision lives in the auth slice (`requireSession`); this module only
 * mounts it. It runs on the server before any loader beneath it, and a
 * signed-out visitor is answered with a redirect before one byte of a guarded
 * page is rendered — the property a guard that decides while rendering cannot
 * have.
 */
export const middleware: Route.MiddlewareFunction[] = [requireSession];

/**
 * Not optional, even though nothing below reads its value directly. Server
 * middleware runs only on a `.data` request, and the client router makes one
 * only when a matched route has a `loader`. Today `dashboard` has its own, so
 * the guard would run either way — but this export is what keeps that true for
 * ANY child added under this layout, including a static page with no loader
 * of its own, which would otherwise be reached by a client navigation with no
 * server round-trip and therefore no guard.
 *
 * Returning the user rather than `null` also puts "who is signed in" into the
 * hydration payload once, where `useRouteLoaderData("routes/protected")` can
 * read it from any guarded screen.
 */
export function loader({ context }: Route.LoaderArgs) {
  return { user: context.get(userContext) };
}

export default function ProtectedRoute() {
  return <Outlet />;
}
