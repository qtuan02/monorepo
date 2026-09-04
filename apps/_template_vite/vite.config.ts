import { readFileSync } from "node:fs";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Read rather than imported: a JSON import attribute is not portable across the
// config loader, and this keeps package.json out of the app bundle.
const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as { version: string };

// Docs: https://vite.dev/config/
export default defineConfig({
  // The footer shows this so a support call can name the build it is on.
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
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
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Keep deps out of the app chunk so an app edit doesn't bust their cache.
        codeSplitting: { groups: [{ name: "vendor", test: /node_modules/ }] },
      },
    },
  },
});
