// Namespace import, not `import { z }`: a bundler that externalizes zod for SSR
// on musl/Linux (CI) drops zod's `export { z }` namespace re-export, so `z`
// resolves to undefined and `z.string` throws at module load — a failure that
// never reproduces on a Windows dev box.
import * as z from "zod";

import { createEnv } from "@monorepo/env/react-router/create-env";

/**
 * Parsed once at module load, so a missing or malformed variable throws here —
 * named — instead of surfacing later as an `undefined` baseURL or a session
 * cookie signed with nothing.
 *
 * The `react-router` Flavor, not the `vite` one: this Runtime builds server code
 * and client code out of one Vite build, so it needs a `server` block the `vite`
 * Flavor has nowhere to put (ADR-0003). The base client block
 * (`PUBLIC_APP_ENV`, `PUBLIC_BASE_DOMAIN`, `PUBLIC_BASE_DOMAIN_API`) comes from
 * `@monorepo/env/react-router/schema`; this file declares only what this app
 * adds.
 *
 * This one module is evaluated in **both** graphs — Vite compiles it into the
 * server bundle and the browser bundle alike. That is what `runtimeEnv` below
 * has to survive, and why each read there is written the way it is.
 */
export const env = createEnv({
  server: {
    /**
     * What the session cookie is signed with. No prefix, so Vite never inlines
     * it and env-core keeps it off the object in the browser — reading it from
     * client code throws by name rather than coming back `undefined`.
     *
     * Required, not `.optional()`: a session cookie signed with nothing is not
     * a session. `.env.example` carries a development placeholder so a fresh
     * clone still builds, and a real deployment replaces it.
     */
    TEMPLATE_REACTROUTER_SESSION_SECRET: z.string().min(1),
  },
  client: {},
  /**
   * Every value this app's schema names, as one map — env-core reads only this
   * object and never falls back to `process.env` per key.
   *
   * The client keys are literal `import.meta.env.PUBLIC_*` reads because Vite
   * substitutes those literals only in code it compiles: the same read
   * performed inside `@monorepo/env` would stay `undefined`.
   *
   * The server key is guarded with `typeof process`, and the guard is not
   * decoration. Vite replaces `import.meta.env` but leaves `process.env.X`
   * alone, and defines no `process` in a browser bundle — a bare read would
   * throw `ReferenceError: process is not defined` at module load, before any
   * validation runs and with an error naming nothing about env. `typeof
   * process` is chosen over `import.meta.env.SSR` (which Vite folds to `false`
   * on the client) because it is also true under a plain Bun/Node run, so the
   * Dockerfile can validate the image with `bun -e "import './src/env.ts';"`
   * and get a real answer instead of a guaranteed "missing".
   */
  runtimeEnv: {
    PUBLIC_APP_ENV: import.meta.env.PUBLIC_APP_ENV,
    PUBLIC_BASE_DOMAIN: import.meta.env.PUBLIC_BASE_DOMAIN,
    PUBLIC_BASE_DOMAIN_API: import.meta.env.PUBLIC_BASE_DOMAIN_API,
    TEMPLATE_REACTROUTER_SESSION_SECRET:
      typeof process === "undefined"
        ? undefined
        : process.env.TEMPLATE_REACTROUTER_SESSION_SECRET,
  },
});
