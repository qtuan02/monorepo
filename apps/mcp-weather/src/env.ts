// Namespace import, not `import { z }`: a bundler that externalizes zod for SSR
// on musl/Linux (CI) drops zod's `export { z }` namespace re-export, so `z`
// resolves to undefined and `z.object` throws at module load — a failure that
// never reproduces on a Windows dev box.
import * as z from "zod";

import { httpUrlSchema } from "@monorepo/env/http-url";
import { createEnv } from "@monorepo/env/next/create-env";

/**
 * Parsed once at module load, so a missing or malformed variable throws here —
 * named — instead of surfacing later as an `undefined` API key that turns every
 * weather tool call into a 401 nobody reads.
 *
 * The base client block (`NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_BASE_DOMAIN`,
 * `NEXT_PUBLIC_BASE_DOMAIN_API`) comes from `@monorepo/env/next/*`; this file
 * only declares what this app adds on top.
 *
 * Both additions carry the app's own name. The repo-root `.env` is **one** file
 * shared by every Next app, so a value that belongs to a single app has to say
 * which app — see `packages/env/README.md`. That is also why the key is
 * `MCP_WEATHER_OPENWEATHERMAP_API_KEY` here and was a bare
 * `OPENWEATHERMAP_API_KEY` in the app this replaced: back then it lived in a
 * workspace whose apps did not share one env file.
 */
export const env = createEnv({
  server: {
    /**
     * The OpenWeatherMap key `get-weather` and `get-forecast` sign their
     * requests with. No `NEXT_PUBLIC_` prefix, so Next never inlines it into a
     * browser bundle and t3-env throws if a Client Component reads it.
     *
     * **Required**, unlike the Template's example secret: this app's entire
     * reason to exist is two calls that cannot be made without it, so a missing
     * value must fail `next build` — and the Dockerfile's `import './src/env.ts'`
     * step — with the variable's name, rather than shipping a server whose
     * weather tools answer 401 and whose `hello-world` still passes a smoke test.
     */
    MCP_WEATHER_OPENWEATHERMAP_API_KEY: z.string().min(1),
  },
  client: {
    /**
     * Sentry DSN for this app's own project. Absent means the SDK stays
     * installed but disabled, see `@monorepo/sentry/options`. It is a client
     * variable because the browser SDK needs it inlined; the server SDK reads
     * the same inlined value.
     */
    NEXT_PUBLIC_MCP_WEATHER_SENTRY_DSN: httpUrlSchema.optional(),
  },
  /**
   * Every prefixed value spelled out as a literal `process.env.NEXT_PUBLIC_*`
   * read. Next substitutes those literals only in code it compiles, so the same
   * read performed inside `@monorepo/env` would stay `undefined` in the browser.
   */
  clientRuntimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN,
    NEXT_PUBLIC_BASE_DOMAIN_API: process.env.NEXT_PUBLIC_BASE_DOMAIN_API,
    NEXT_PUBLIC_MCP_WEATHER_SENTRY_DSN:
      process.env.NEXT_PUBLIC_MCP_WEATHER_SENTRY_DSN,
  },
});
