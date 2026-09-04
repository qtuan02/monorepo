import { defineConfig } from "@rslib/core";

const SHELL_DIST = "../hook-public/dist";

/**
 * Builds the Publish shell `packages/hook-public` — the only consumer of this
 * task. Every app in the repo still imports `@monorepo/hook/*` from `src/`
 * through this package's own `exports`, so nothing here is on the dev loop
 * (ADR-0004).
 *
 * `bundle: false` keeps the one-source-file-one-output-file shape the shell's
 * `./*` subpath export depends on, and bundleless ESM is what rewrites the two
 * relative imports (`./use-media-query`, `./use-isomorphic-layout-effect`) to
 * carry the `.js` extension ESM requires.
 */
export default defineConfig({
  lib: [
    {
      format: "esm",
      bundle: false,
      syntax: "es2022",
      dts: true,
      output: {
        // `auto` refuses to clean a dist outside this package, and the shell's
        // is. Forced on so a hook deleted from `src/` cannot survive in a
        // tarball as a stale `.js` nothing imports any more.
        cleanDistPath: true,
        distPath: { root: SHELL_DIST },
      },
    },
  ],
  source: {
    entry: { index: ["./src/**/*.ts"] },
    // Emitting needs `noEmit: false`, `declaration: true` and an explicit
    // `rootDir` (TypeScript 7 fails with TS5011 without one); the typecheck
    // tsconfig keeps none of those.
    tsconfigPath: "./tsconfig.build.json",
  },
});
