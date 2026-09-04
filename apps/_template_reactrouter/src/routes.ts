import type { RouteConfig } from "@react-router/dev/routes";
import { index } from "@react-router/dev/routes";

/**
 * The route table — config-based, not file-system based (`@react-router/fs-routes`
 * is deliberately not installed). This file *is* the path table the other two
 * Runtimes keep as `~/constants/routes.ts` and as the `src/app/` folder tree:
 * every path is declared once here, and typegen turns it into the typed
 * `href()` that every link and redirect goes through.
 */
export default [index("routes/home.tsx")] satisfies RouteConfig;
