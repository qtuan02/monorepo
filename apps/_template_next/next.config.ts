import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { withSentry } from "@monorepo/sentry/next-config";

const nextConfig: NextConfig = {
  /**
   * The workspace root, stated rather than inferred. Next guesses it from the
   * nearest lockfile, warns when the guess is ambiguous in a monorepo, and the
   * guess decides the directory layout **inside** `.next/standalone` — which the
   * Dockerfile's COPY paths depend on. `next build` runs with the app directory
   * as its cwd, both locally through Turbo and in the pruned image.
   */
  outputFileTracingRoot: path.join(process.cwd(), "..", ".."),

  /**
   * Every workspace package an app imports is **source-only** — its `exports`
   * map points at `.ts`/`.tsx` under `src/`, with no build step in between.
   * (`@monorepo/ui` and `@monorepo/hook` do carry a `build`, but it writes into
   * a Publish shell for npm and never into anything an app reads — ADR-0004.)
   * Next does not compile anything inside `node_modules` unless it is named
   * here, and a workspace package is symlinked into `node_modules`, so leaving
   * one out is a parse error on its first import rather than a resolution
   * failure.
   *
   * Add a package to this list the same moment you add it to `dependencies`.
   */
  transpilePackages: [
    "@monorepo/api",
    "@monorepo/env",
    "@monorepo/hook",
    "@monorepo/i18n",
    "@monorepo/sentry",
    "@monorepo/types",
    "@monorepo/ui",
  ],

  /**
   * Emits `.next/standalone/server.js` with only the traced files an app needs
   * at runtime, so the Docker runner is `node:24-alpine` + `node server.js`
   * rather than a full workspace install. Vercel ignores it, so the same repo
   * still deploys zero-config there.
   */
  output: "standalone",

  /**
   * Next 16's replacement for `experimental.dynamicIO` + `experimental.useCache`.
   * With it on, a route is prerendered by default and anything reading runtime
   * data — `cookies()`, `headers()`, `searchParams`, an uncached `fetch` — has to
   * sit inside a `<Suspense>` boundary or be wrapped in `"use cache"`. That is
   * the boundary this template teaches: cached server data for what a crawler
   * reads, TanStack Query for what a visitor does after paint.
   */
  cacheComponents: true,

  /**
   * Stable in Next 16 (it was `experimental.reactCompiler` in 15). Needs the
   * `babel-plugin-react-compiler` devDependency, which is why it is declared in
   * this app's package.json even though nothing imports it.
   */
  reactCompiler: true,

  images: {
    /**
     * Next 16 requires every `quality` a page asks for to be listed here — an
     * unlisted value is a 400 from the optimizer, not a silent fallback. 75 is
     * the default `next/image` uses, so listing only it keeps the optimizer's
     * output surface to one variant per size.
     */
    qualities: [75],
  },
};

// Explicit path rather than the plugin's own lookup: this app keeps its source
// under `src/`, and naming the file means a rename fails the build here instead
// of at the first `getTranslations()` call.
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Sentry wraps last, so it instruments the fully-assembled config.
export default withSentry(withNextIntl(nextConfig));
