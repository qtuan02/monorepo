import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout } from "@react-router/dev/routes";

/**
 * The route table — config-based, not file-system based (`@react-router/fs-routes`
 * is deliberately not installed). This file *is* the path table the other two
 * Runtimes keep as `~/constants/routes.ts` and as the `src/app/` folder tree:
 * every path is declared once here, and typegen turns it into the typed
 * `href()` that every link and redirect goes through.
 *
 * `layout()` is pathless: it wraps its children in the app shell without adding
 * a segment, so the shell is mounted once around the routes rather than
 * re-rendered by each of them. A screen that must render chromeless — the
 * sign-in page #84 brings — goes outside this wrapper, exactly as the Next
 * Template puts `sign-in/` outside its `(shell)` group.
 */
export default [
  layout("routes/layout.tsx", [index("routes/home.tsx")]),
] satisfies RouteConfig;
