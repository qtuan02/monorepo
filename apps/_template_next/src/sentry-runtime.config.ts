import type { SentryRuntimeOptions } from "@monorepo/sentry/options";
import { initSentryEdge } from "@monorepo/sentry/edge";
import { initSentryServer } from "@monorepo/sentry/server";

/**
 * Picks the Sentry SDK matching the runtime Next is booting.
 *
 * `NEXT_RUNTIME` is set by Next itself — it is not app configuration, and it has
 * no meaning outside this decision. Reading it lives in a `*.config.*` module
 * for exactly that reason: it is the one place the repo's `noProcessEnv` rule
 * points you at instead of a call site ("use a centralized configuration file"),
 * and it keeps `instrumentation.ts` down to the two exports Next looks up.
 *
 * The two runtimes stay behind separate imports: pulling the Node SDK into an
 * edge bundle is a build failure, not a warning.
 */
export function initSentryForRuntime(options: SentryRuntimeOptions): void {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    initSentryServer(options);
    return;
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    initSentryEdge(options);
  }
}
