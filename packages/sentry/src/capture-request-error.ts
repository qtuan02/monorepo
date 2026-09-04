import * as Sentry from "@sentry/nextjs";

/**
 * Next's `onRequestError` hook: the one place a throw from a Server Component,
 * a Route Handler or `proxy.ts` becomes a Sentry event. The app re-exports it
 * from `src/instrumentation.ts` under exactly that name — Next looks the export
 * up by name, so it cannot be wrapped or renamed.
 *
 * ```ts
 * // apps/<app>/src/instrumentation.ts
 * export { captureRequestError as onRequestError } from "@monorepo/sentry/capture-request-error";
 * ```
 */
export const captureRequestError = Sentry.captureRequestError;
