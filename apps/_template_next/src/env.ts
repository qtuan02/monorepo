import { httpUrlSchema } from "@monorepo/env/http-url";
import { createEnv } from "@monorepo/env/next/create-env";

/**
 * Parsed once at module load, so a missing or malformed variable throws here —
 * named — instead of surfacing later as an `undefined` baseURL that silently
 * sends every request to the app's own origin.
 *
 * The base client block (`NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_BASE_DOMAIN_API`)
 * comes from `@monorepo/env/next/*`; this file only declares what this app adds
 * on top.
 */
export const env = createEnv({
  // No server-only variable: the template has no backend to authenticate
  // against. A clone adds one here, unprefixed, so Next never inlines it and
  // t3-env throws if a Client Component reads it (see apps/mcp).
  server: {},
  client: {
    /**
     * Absent means Sentry stays installed but disabled — see
     * `@monorepo/sentry/options`. It is a client variable because the browser
     * SDK needs it inlined; the server SDK reads the same inlined value.
     *
     * Named for this app: the repo-root `.env` is one file shared by every Next
     * app, so a clone renames it (`NEXT_PUBLIC_<APP>_SENTRY_DSN`) rather than
     * sending its errors to the Template's Sentry project.
     */
    NEXT_PUBLIC_TEMPLATE_NEXT_SENTRY_DSN: httpUrlSchema.optional(),
  },
  /**
   * Every prefixed value spelled out as a literal `process.env.NEXT_PUBLIC_*`
   * read. Next substitutes those literals only in code it compiles, so the same
   * read performed inside `@monorepo/env` would stay `undefined` in the browser.
   */
  clientRuntimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_BASE_DOMAIN_API: process.env.NEXT_PUBLIC_BASE_DOMAIN_API,
    NEXT_PUBLIC_TEMPLATE_NEXT_SENTRY_DSN:
      process.env.NEXT_PUBLIC_TEMPLATE_NEXT_SENTRY_DSN,
  },
});
