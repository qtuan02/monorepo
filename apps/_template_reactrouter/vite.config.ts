import { reactRouter } from "@react-router/dev/vite";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { DEV_PORT } from "./ports.ts";

// Vitest sets this, and it is the one fork in this file. `reactRouter()` renders
// a route module into a whole HTML document and throws "can't detect preamble"
// when there is none — which is exactly what `createRoutesStub` hands it. So the
// test run swaps in the plain React plugin for its JSX transform, and gets the
// route modules as ordinary components.
//
// The two are mutually exclusive rather than complementary: `reactRouter()`
// already installs React Refresh, so running `@vitejs/plugin-react` beside it
// would transform every file twice.
const isVitest = process.env.VITEST === "true";

// Docs: https://reactrouter.com/api/framework-conventions/react-router.config.ts
export default defineConfig({
  // The monorepo's .env lives at the repo root, not per-app; PUBLIC_* keeps the
  // variable names as-is instead of Vite's default VITE_* prefix. Both halves of
  // this build read it — `import.meta.env.PUBLIC_*` is substituted into the
  // server bundle as well as the client one, which is what lets `src/env.ts` be
  // one module evaluated in both graphs.
  envDir: "../../",
  envPrefix: "PUBLIC_",
  plugins: [
    isVitest ? react() : reactRouter(),
    // The React Compiler runs as its own Babel pass beside the framework
    // plugin. `@vitejs/plugin-react` is NOT used for it here (it is above, on
    // the Vitest branch only) — the maintainers' answer to compiler + framework
    // mode is a standalone Babel plugin, because the framework plugin owns
    // React Refresh itself.
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
    // `react-router dev` is a Vite dev server, so it takes its port from here
    // rather than from a flag — the same read the Vite Template makes, off the
    // same `ports.env`. `strictPort` because Vite's default is to drift to the
    // next free port, and a Template that silently answers on another app's
    // port is worse than one that refuses to start.
    port: DEV_PORT,
    strictPort: true,
    open: true,
  },
  // There is no `preview` block, and that is not an omission: `vite preview`
  // serves static files and this build has a server bundle. The production
  // server is `react-router-serve`, started by the `start` script on the port
  // `PORT` names — which is what `playwright.config.ts` drives.
});
