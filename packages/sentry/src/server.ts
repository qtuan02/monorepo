import * as Sentry from "@sentry/nextjs";

import type { SentryRuntimeOptions } from "./options";
import { buildSentryInitOptions } from "./options";

/**
 * Node-runtime init, called from the app's `register()` in
 * `src/instrumentation.ts` when `process.env.NEXT_RUNTIME === "nodejs"`.
 *
 * Server values are read when the process boots, not inlined at build time —
 * which is what lets one standalone image be promoted between environments with
 * a different DSN each time.
 */
export function initSentryServer(options: SentryRuntimeOptions): void {
  Sentry.init(buildSentryInitOptions(options));
}
