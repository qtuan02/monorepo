import { env } from "~/env";
import { initSentryForRuntime } from "~/sentry-runtime.config";

/**
 * Next calls this once per server runtime, before anything else in that runtime
 * runs. Which SDK that means is decided in `~/sentry-runtime.config`.
 */
export function register() {
  initSentryForRuntime({
    dsn: env.NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN,
    environment: env.NEXT_PUBLIC_APP_ENV,
  });
}

/**
 * The hook Next looks up **by this name** to report a throw from a Server
 * Component, a Route Handler or `proxy.ts`. It cannot be renamed or wrapped, so
 * it is re-exported rather than called.
 */
export { captureRequestError as onRequestError } from "@monorepo/sentry/capture-request-error";
