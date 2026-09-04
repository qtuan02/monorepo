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
} satisfies Config;
