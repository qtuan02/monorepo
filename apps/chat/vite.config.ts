import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { DEV_PORT, E2E_PORT } from "./ports.ts";

// Docs: https://vite.dev/config/
export default defineConfig({
  // The monorepo's .env lives at the repo root, not per-app; PUBLIC_* keeps the
  // variable names as-is instead of Vite's default VITE_* prefix. Vitest merges
  // this config, so tests pick up the same env resolution.
  envDir: "../../",
  envPrefix: "PUBLIC_",
  plugins: [
    // plugin-react runs JSX/Fast Refresh through oxc and no longer accepts Babel
    // plugins, so the React Compiler runs as its own Babel pass after it.
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    // Vite 8 reads the `~/*` alias straight out of tsconfig.json, so the alias
    // is declared once, there — never restated as a `resolve.alias` entry that
    // then has to be kept in step with it.
    tsconfigPaths: true,
  },
  server: {
    // Both ports come from `ports.env` — see ./ports.ts. `strictPort` because
    // Vite's default is to take the next free port, and the next free one here
    // is the Next Template's dev port: two apps would be one restart from
    // swapping places. The generator now hands every app its own pair, so the
    // drift has nothing left to buy and a hard failure is the better signal.
    port: DEV_PORT,
    strictPort: true,
    open: true,
  },
  // `vite preview` is a second server with its own config key; it inherits from
  // `server` only through the fallbacks named below. It serves the production
  // build, which is what Playwright drives, so it takes the E2E port — and that
  // is what lets `bun run dev` and `bun run e2e` be up at the same time.
  //
  // `strictPort` replaces the `--port … --strictPort` flags that used to sit in
  // playwright.config.ts, and is what makes a busy port an error instead of a
  // 180s Playwright timeout on a port nothing is listening to. Without this
  // block at all, preview lands on Vite's own 4173 default. `open` is spelled
  // out because it otherwise falls back to `server.open` (true), so every
  // headless e2e run would pop a browser window it never uses.
  preview: {
    port: E2E_PORT,
    strictPort: true,
    open: false,
  },
  build: {
    // `vendor` below is deliberately one chunk, and trips Vite's 500 kB
    // advisory. Splitting it would silence the warning without moving a byte
    // off the critical path — React, the router, Query and Base UI all load
    // at first paint either way — so the threshold moves, not the chunking.
    // Kept low enough that a heavy dependency landing in the app chunk still
    // speaks up.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Keep deps out of the app chunk so an app edit doesn't bust their
        // cache. Every `emoji-mart`/`@emoji-mart/*` package is excluded on
        // purpose: they're only reached through a dynamic import() in the
        // emoji picker (ticket #200), and grouping any of them into `vendor`
        // would merge it into the one chunk every page preloads eagerly,
        // undoing the lazy load entirely. Bun nests every package under a
        // `.bun/<name>@<version>/node_modules/…` folder, so the lookahead
        // has to rule out `emoji-mart` anywhere in the id — not just right
        // after the first `node_modules/` segment, which is the `.bun`
        // cache folder itself.
        codeSplitting: {
          groups: [
            { name: "vendor", test: /^(?!.*emoji-mart).*node_modules\// },
          ],
        },
      },
    },
  },
});
