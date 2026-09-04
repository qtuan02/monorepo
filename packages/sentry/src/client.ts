import * as Sentry from "@sentry/nextjs";

import type { SentryRuntimeOptions } from "./options";
import { buildSentryInitOptions } from "./options";

/**
 * Browser-side init. Next loads `src/instrumentation-client.ts` before it
 * hydrates, so this runs ahead of the app's own code.
 *
 * ```ts
 * // apps/<app>/src/instrumentation-client.ts
 * import { initSentryClient } from "@monorepo/sentry/client";
 *
 * initSentryClient({ dsn: env.NEXT_PUBLIC_SENTRY_DSN, environment: env.NEXT_PUBLIC_APP_ENV });
 * export { captureRouterTransitionStart as onRouterTransitionStart } from "@monorepo/sentry/client";
 * ```
 */
export function initSentryClient(options: SentryRuntimeOptions): void {
  Sentry.init({
    ...buildSentryInitOptions(options),
    // The browser tracing integration is what turns a page load and a route
    // change into a transaction; without it `tracesSampleRate` measures nothing.
    integrations: [Sentry.browserTracingIntegration()],
  });
}

/**
 * Re-exported so the app's `instrumentation-client.ts` can name it as its own
 * `onRouterTransitionStart` export — the hook Next calls when an App Router
 * navigation begins, which is the only way a client-side route change becomes a
 * span. It has to be exported from that file by that name, so the app cannot
 * hide it behind `initSentryClient`.
 */
export const captureRouterTransitionStart = Sentry.captureRouterTransitionStart;
