import { httpUrlSchema } from "@monorepo/env/http-url";
import { createEnv } from "@monorepo/env/next/create-env";

/**
 * Parsed once at module load, so a missing or malformed variable throws here —
 * named — instead of surfacing later as an `undefined` origin that silently
 * turns every absolute URL in the sitemap into a relative one.
 *
 * The base client block (`NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_BASE_DOMAIN_API`)
 * comes from `@monorepo/env/next/*`; this file only declares what this app adds
 * on top.
 *
 * Both additions carry the app's own name. The repo-root `.env` is **one** file
 * shared by every Next app, so a value that belongs to a single app has to say
 * which app — borrowing `NEXT_PUBLIC_SENTRY_DSN` would send this site's errors
 * to the Template's Sentry project.
 */
export const env = createEnv({
  // No server-only variable: this site talks to no backend and holds no secret.
  server: {},
  client: {
    /**
     * Sentry DSN for this site's own project (`org: sentry`,
     * `project: portfolio_v1` — see `next.config.ts`). Absent means the SDK
     * stays installed but disabled, see `@monorepo/sentry/options`.
     */
    NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN: httpUrlSchema.optional(),
    /**
     * The origin this site knows itself by. **Required**, not optional:
     * `metadataBase`, `app/robots.ts` and `app/sitemap.ts` all build absolute
     * URLs from it, and a sitemap of relative URLs is not a sitemap. A missing
     * value therefore fails `next build` with the variable's name rather than
     * shipping a site search engines cannot follow.
     */
    NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN: httpUrlSchema,
  },
  /**
   * Every prefixed value spelled out as a literal `process.env.NEXT_PUBLIC_*`
   * read. Next substitutes those literals only in code it compiles, so the same
   * read performed inside `@monorepo/env` would stay `undefined` in the browser.
   */
  clientRuntimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_BASE_DOMAIN_API: process.env.NEXT_PUBLIC_BASE_DOMAIN_API,
    NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN:
      process.env.NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN,
    NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN:
      process.env.NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN,
  },
});
