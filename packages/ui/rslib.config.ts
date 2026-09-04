import { defineConfig } from "@rslib/core";

const SHELL_DIST = "../ui-public/dist";

/**
 * The vendored copy of `@monorepo/hook` that ships inside this package's own
 * `dist/`, so `@fe-monorepo/ui` depends on no sibling package (ADR-0004, spec
 * story 7). It is a directory name, and also the relative prefix every emitted
 * module uses to reach it — correct because `src/` is exactly two folders deep
 * (`components/`, `utils/`), so every output file sits one level under `dist/`.
 */
const VENDORED_HOOK_DIR = "internal";

/**
 * Builds the Publish shell `packages/ui-public`. Nothing in the repo consumes
 * this output: apps and Storybook keep importing `@monorepo/ui/components/*`
 * from `src/` through this package's own `exports` (ADR-0004).
 *
 * Two things here are load-bearing and were established by building it:
 *
 * - **`tsconfig.build.json` restates the `#` aliases as `paths`.** Rspack
 *   resolves this package's `imports` field on its own, so the emitted `.js`
 *   already carries `./button.js`. tsgo does not redirect through it, so
 *   without those `paths` every `.d.ts` ships `#components/button` — a
 *   specifier no consumer can resolve, and one nothing in the repo would catch,
 *   since `#` works fine from inside the package.
 * - **The vendored hook is an `externals` *rewrite*, not a bundle.** rslib's
 *   `autoExternal` is bundle-mode only; in bundleless mode every non-relative
 *   import is external, full stop, so there is no configuration that inlines
 *   `@monorepo/hook/use-is-mobile` into `sidebar.js`. Instead the second `lib`
 *   below compiles the hook's own source into `dist/internal/`, and the mapping
 *   here points the import at that file. `resolve.alias` does *not* work for
 *   this — externalization happens first, so the alias never runs.
 */
export default defineConfig({
  lib: [
    {
      format: "esm",
      bundle: false,
      syntax: "es2022",
      dts: true,
      source: {
        entry: { index: ["./src/**/*.{ts,tsx}"] },
        tsconfigPath: "./tsconfig.build.json",
      },
      output: {
        // `scripts/build.ts` empties the shell's dist before calling rslib.
        // Leaving it to rslib would race: this lib's root is the parent of the
        // second one's, so a clean here could land after that build wrote.
        cleanDistPath: false,
        distPath: { root: SHELL_DIST },
        externals: {
          "@monorepo/hook/use-is-mobile": `../${VENDORED_HOOK_DIR}/use-is-mobile.js`,
        },
      },
    },
    {
      format: "esm",
      bundle: false,
      syntax: "es2022",
      dts: true,
      source: {
        // The whole hook package, not just `use-is-mobile` and the two modules
        // it imports: bundleless emits only entry files, so a hand-picked list
        // would emit a dangling `./use-media-query.js` the day the import graph
        // moves. Five files come to 2.6 kB, and none of them is reachable from
        // the shell's `exports`.
        entry: { internal: ["../hook/src/*.ts"] },
        tsconfigPath: "./tsconfig.hook.json",
      },
      output: {
        cleanDistPath: false,
        distPath: { root: `${SHELL_DIST}/${VENDORED_HOOK_DIR}` },
      },
    },
  ],
});
