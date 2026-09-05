import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

/**
 * The route table — config-based, not file-system based (`@react-router/fs-routes`
 * is deliberately not installed). This file *is* the path table the other two
 * Runtimes keep as `~/constants/routes.ts` and as the `src/app/` folder tree:
 * every path is declared once here, and typegen turns it into the typed
 * `href()` that every link and redirect goes through.
 *
 * Two pathless `layout()`s, nested, and the nesting is the access model:
 *
 * - The outer one is the app shell. It adds no segment, so the chrome is
 *   mounted once around the routes rather than re-rendered by each of them.
 * - The inner one is the session guard. It carries the `middleware` that
 *   bounces a signed-out visitor, and only the routes nested under it are
 *   gated — the catch-all splat sits beside it, INSIDE the shell but OUTSIDE
 *   the guard, so a mistyped URL says 404 instead of bouncing an already
 *   signed-in visitor to sign-in. Same shape as the Vite Template's
 *   `<ProtectedRoute>` mounted inside `<LayoutTemplate>`.
 *
 * Two routes live outside the shell on purpose. Sign-in renders chromeless,
 * exactly as the Next Template puts `sign-in/` outside its `(shell)` group; and
 * sign-out is a resource route with no screen at all, so there is nothing for
 * the shell to wrap.
 */
export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("modules/:slug", "routes/module.tsx"),
    route("about", "routes/about.tsx"),
    layout("routes/protected.tsx", [
      route("dashboard", "routes/dashboard.tsx"),
    ]),
    route("*", "routes/not-found.tsx"),
  ]),
  route("sign-in", "routes/sign-in.tsx"),
  route("sign-out", "routes/sign-out.tsx"),
] satisfies RouteConfig;
