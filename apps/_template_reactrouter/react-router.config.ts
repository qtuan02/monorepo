import type { Config } from "@react-router/dev/config";

export default {
  /**
   * Server render every route. This is the Runtime's whole reason to exist: a
   * Vite build that also produces a server bundle, so the first HTML a crawler
   * reads is already the page. An app that wants a client-only SPA clones
   * `apps/_template_vite` instead — flipping this to `false` here would produce
   * a third spelling of that Template.
   */
  ssr: true,

  /**
   * `"app"` is React Router's default; this repo says `src`. Every other app
   * here keeps its source under `src/`, and that one word is what lets the
   * `~/*` alias, the `test/` tree mirroring it, the `apps/**` Biome overrides
   * and the Dockerfile's `import './src/env.ts'` check read identically across
   * all three Runtimes.
   */
  appDirectory: "src",

  /**
   * The one route emitted as static HTML at build time, and the ONE place in
   * this app a path is written as a literal rather than through `href()`: this
   * config runs before typegen exists, so there is nothing typed to call yet.
   *
   * A literal list rather than `prerender: true`: `true` would also emit an
   * `index.html` for `/`, and `react-router-serve`'s static middleware answers
   * before the request handler does — so the home page would silently stop
   * being server rendered and lose the per-request language negotiation the
   * whole Runtime is here for.
   */
  prerender: ["/about"],

  /**
   * The host a form action may be posted from, on top of the request's own
   * origin. Not optional in production: React Router refuses an action whose
   * `Origin` header disagrees with `request.url`'s origin (its built-in CSRF
   * check), and behind a TLS-terminating proxy — every non-`local` deployment
   * of this image — the browser sends `Origin: https://host` while
   * `react-router-serve` builds `request.url` as `http://host`, because it never
   * sets Express's `trust proxy`. Without this line every sign-in and sign-out
   * POST is answered 400 before the action runs. Matched on host, not scheme,
   * which is exactly the difference the proxy introduces.
   *
   * `PUBLIC_BASE_DOMAIN` is the origin the app is built against, and this file
   * runs under the same `dotenv -e ../../.env` as `build`. It is read directly
   * rather than through `~/env` because the config runs before the app exists,
   * and it is guarded because `react-router typegen` runs with no `.env` at all.
   * Locally the two origins already agree, so the list is only ever consulted
   * behind a proxy.
   */
  allowedActionOrigins: process.env.PUBLIC_BASE_DOMAIN
    ? [new URL(process.env.PUBLIC_BASE_DOMAIN).host]
    : [],
} satisfies Config;
