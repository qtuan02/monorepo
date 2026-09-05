// Namespace import, not `import { z }`: a bundler that externalizes zod for SSR
// on musl/Linux (CI) drops zod's `export { z }` namespace re-export, so `z`
// resolves to undefined and `z.object` throws at module load — a failure that
// never reproduces on a Windows dev box.
import * as z from "zod";

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
  server: {
    /**
     * The example server-side key. It carries no `NEXT_PUBLIC_` prefix, so Next
     * never inlines it into the browser bundle and t3-env reads it straight from
     * `process.env` — a read that throws if attempted from a Client Component,
     * which is the whole point of the `server` block.
     *
     * Optional on purpose: the template has no backend to authenticate against,
     * and a required secret would make `next build` fail on a fresh clone. A
     * real app drops the `.optional()` the moment the value is genuinely needed.
     */
    TEMPLATE_API_TOKEN: z.string().min(1).optional(),
  },
  client: {
    /**
     * Absent means Sentry stays installed but disabled — see
     * `@monorepo/sentry/options`. It is a client variable because the browser
     * SDK needs it inlined; the server SDK reads the same inlined value.
     */
    NEXT_PUBLIC_SENTRY_DSN: httpUrlSchema.optional(),
  },
  /**
   * Every prefixed value spelled out as a literal `process.env.NEXT_PUBLIC_*`
   * read. Next substitutes those literals only in code it compiles, so the same
   * read performed inside `@monorepo/env` would stay `undefined` in the browser.
   */
  clientRuntimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_BASE_DOMAIN_API: process.env.NEXT_PUBLIC_BASE_DOMAIN_API,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
});
