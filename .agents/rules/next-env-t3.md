---
title: Next Flavor of @monorepo/env — the Server/Client Split and the NEXT_PUBLIC_ Prefix
impact: CRITICAL
impactDescription: A client variable filed in the wrong block reads `undefined` in the browser with nothing thrown — the one env mistake that ships instead of failing.
tags: next, env, t3-env, configuration, dotenv, docker
---

## Next Flavor of `@monorepo/env` — the Server/Client Split and the `NEXT_PUBLIC_` Prefix

**Impact: CRITICAL (Applies to Next Runtime apps — `apps/_template_next` and clones. A Vite Runtime app uses the other Flavor; the two never appear in one app.)**

A Next app reads its config through `@monorepo/env/next/create-env` — t3-env with the base client
block already merged in. Two things about it are not a style choice. **Only a `NEXT_PUBLIC_`-prefixed
key declared in the `client` block is validated in the browser**: filed under `server` instead, it
vanishes from the env object once that module evaluates on the client, so every read is `undefined`
and nothing throws. And **`clientRuntimeEnv` must be written in the app's own `env.ts`, as literal
`process.env.NEXT_PUBLIC_*` reads** — Next substitutes those literals only in code it compiles, so
the same read performed inside `@monorepo/env` stays `undefined` in the browser.

The Vite Flavor answers the same need with a different shape, and neither maps onto the other:

| | Vite Flavor | Next Flavor |
|---|---|---|
| Entry | `@monorepo/env/vite/create-env` | `@monorepo/env/next/create-env` |
| Prefix | `PUBLIC_` (`envPrefix` in `vite.config.ts`) | `NEXT_PUBLIC_` (fixed by Next) |
| Source | `import.meta.env` | `process.env`, inlined at build |
| Call shape | `createEnv(schema, import.meta.env)` | `createEnv({ server, client, clientRuntimeEnv })` |
| Adding a key | `baseEnvSchema.extend({ … })` | a key in the `server` or `client` block |

There is no `.extend()` on this side: the base block is a plain dictionary, because t3-env validates
each key on its own rather than parsing one `z.object`.

**Incorrect (a client key in the wrong block, and a runtime map the bundler cannot see):**

```ts
export const env = createEnv({
  // ❌ prefixed but filed as server — absent from the object on the client, so every
  //    browser read is `undefined` and nothing warns
  server: { NEXT_PUBLIC_SENTRY_DSN: httpUrlSchema.optional() },
  client: {},
  // ❌ not literal `process.env.NEXT_PUBLIC_*` reads — Next has nothing to substitute
  clientRuntimeEnv: Object.fromEntries(Object.entries(process.env)),
});
```

**Correct (`apps/_template_next/src/env.ts` — three blocks, literal reads, namespace zod):**

```ts
import * as z from "zod";

import { httpUrlSchema } from "@monorepo/env/http-url";
import { createEnv } from "@monorepo/env/next/create-env";

export const env = createEnv({
  // ✅ no prefix → never inlined, and t3-env throws if a Client Component reads it
  server: { TEMPLATE_API_TOKEN: z.string().min(1).optional() },
  // ✅ prefixed → validated in the browser bundle; the base keys are already merged in
  client: { NEXT_PUBLIC_SENTRY_DSN: httpUrlSchema.optional() },
  // ✅ literal reads, in code Next compiles, so each is substituted at build time
  clientRuntimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN,
    NEXT_PUBLIC_BASE_DOMAIN_API: process.env.NEXT_PUBLIC_BASE_DOMAIN_API,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
});
```

## One root `.env`, loaded by dotenv-cli; the image validates it by import

`next dev` / `next build` only load a `.env` sitting **inside the app directory**, so the app's own
scripts name the single root one — `"dev": "dotenv -e ../../.env -- next dev --port 3001"`, with the
same prefix on `build`, `start` and Playwright's `webServer`. `.env.example` carries both prefixes
side by side; a value both Runtimes need is spelled twice, on purpose, never through a mapping layer.

The Dockerfile then runs the very module the app parses at runtime, so a bad variable fails the build
— named — instead of shipping a server that breaks on its first request, and the two cannot drift:

```dockerfile
# Bun only auto-loads a `.env` in its cwd, so the root one is named explicitly
RUN cd apps/${APP_DIRNAME} && bun --env-file=/app/.env -e "import './src/env.ts';"
```

## Conventions

- `env.ts` holds the schema **and** the `createEnv` call — never a separate `env-schema.ts`, or the
  Dockerfile check stops proving anything.
- New variable → add `NEXT_PUBLIC_<NAME>` (with a dev value) to the root `.env.example`, declare it in
  `client`, list it in `clientRuntimeEnv`, update the Docker build ARGs. A secret goes in `server`
  with no prefix and is **not** listed in `clientRuntimeEnv`.
- Import zod as `import * as z from "zod"` — the named form breaks on CI's musl build (see
  [[forms-schema-driven]]); URLs use `httpUrlSchema` from `@monorepo/env/http-url` —
  the Runtime-independent piece both Flavors share, and imported by subpath like everything else in
  the package (see [[quality-avoid-barrel-imports]]).
- `emptyStringAsUndefined` is on, so a blank line in `.env` is a **missing** value, not a passing one.
- Read `env`, never `process.env`: Biome exempts only `**/env.ts` and `**/*.config.*`, which is why the
  `NEXT_RUNTIME` branch lives in `sentry-runtime.config.ts`. `env.NEXT_PUBLIC_APP_ENV`, not
  `process.env.NODE_ENV`, decides a `secure` cookie or a devtools panel.
- `env` is a downward import for every layer — `~/libs`, a Server Component, a Server Action and a
  `"use client"` island read the same object (see [[architecture-circular-dependencies]],
  [[next-server-vs-client-components]]).

Reference: [`apps/_template_next/src/env.ts`](../../apps/_template_next/src/env.ts), [`packages/env/src/next/create-env.ts`](../../packages/env/src/next/create-env.ts), [`packages/env/src/next/schema.ts`](../../packages/env/src/next/schema.ts), [ADR-0003](../../docs/adr/0003-env-two-flavors-native-prefix.md), [T3 Env — Next.js](https://env.t3.gg/docs/nextjs), [Next.js — Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
