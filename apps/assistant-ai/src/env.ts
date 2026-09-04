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
 * chat turn into an opaque 400.
 *
 * The base client block (`NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_BASE_DOMAIN`,
 * `NEXT_PUBLIC_BASE_DOMAIN_API`) comes from `@monorepo/env/next/*`; this file
 * only declares what this app adds on top.
 */
export const env = createEnv({
  server: {
    /**
     * The Gemini key every chat turn is signed with. No `NEXT_PUBLIC_` prefix,
     * so Next never inlines it into a browser bundle and t3-env throws if a
     * Client Component reads it.
     *
     * **Required**, like `apps/mcp-weather`'s provider key and unlike the
     * Template's example secret: a chat app that cannot reach a model is not a
     * degraded chat app, it is a broken one, so a missing value must fail
     * `next build` — and the Dockerfile's `import './src/env.ts'` step — with
     * the variable's name. `.env.example` carries a placeholder, which is what
     * keeps `docker build` and CI green without a real key.
     *
     * It keeps the bare name `@ai-sdk/google` documents rather than the
     * app-named form the rest of this repo uses (`packages/env/README.md`),
     * because the name is the provider's, not ours: it is the variable a
     * developer already has exported, and a second app wanting Gemini wants the
     * *same* Google project key rather than one of its own. The value is still
     * handed to the provider explicitly — see
     * `~/features/chat/server/chat-model.ts` — so this schema, not an
     * unvalidated `process.env` read inside the SDK, is what decides it exists.
     */
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
    /**
     * Origin of the MCP server whose tools the model may call — `apps/mcp-weather`
     * in this workspace. Optional: with it unset the app is a plain Gemini chat,
     * which is exactly what a developer without the weather server running
     * should get instead of a boot failure.
     *
     * App-named, unlike the key above and unlike the `MCP_DOMAIN` the app this
     * replaced used. That app owned its own `.env`; here one root `.env` serves
     * every app (ADR-0003), and "the MCP server" is a name this repo invented for
     * something only this app reads — so a second app pointing at a *different*
     * MCP server would silently overwrite it. The exception that lets the Gemini
     * key keep its bare name does not stretch to cover this one: that name
     * belongs to `@ai-sdk/google`, this one does not belong to anybody.
     */
    ASSISTANT_AI_MCP_DOMAIN: httpUrlSchema.optional(),
  },
  client: {
    /**
     * Sentry DSN for this app's own project. Absent means the SDK stays
     * installed but disabled, see `@monorepo/sentry/options`. It is a client
     * variable because the browser SDK needs it inlined; the server SDK reads
     * the same inlined value.
     */
    NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN: httpUrlSchema.optional(),
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
    NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN:
      process.env.NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN,
  },
});
