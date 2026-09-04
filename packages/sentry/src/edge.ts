import * as Sentry from "@sentry/nextjs";

import type { SentryRuntimeOptions } from "./options";
import { buildSentryInitOptions } from "./options";

/**
 * Edge-runtime init, called from `register()` when
 * `process.env.NEXT_RUNTIME === "edge"`.
 *
 * A Next 16 app has less edge surface than it used to — `proxy.ts` is Node-only
 * and cannot be configured otherwise — so this covers what is left: a Route
 * Handler or a page that opts in with `export const runtime = "edge"`. It stays
 * a separate module because the edge build must not pull in the Node SDK.
 */
export function initSentryEdge(options: SentryRuntimeOptions): void {
  Sentry.init(buildSentryInitOptions(options));
}
