import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Docs: https://vite.dev/config/
// Storybook's builder-vite auto-discovers this file. `react()` is required here
// — @storybook/react-vite does not inject it, and without it every .stories.tsx
// fails to parse with an error that never mentions React.
//
// No React Compiler pass here, unlike apps/_template_vite: this is a workshop
// that ships nothing, and the compiler's memoization would sit between a story
// and the render a reviewer is inspecting.
//
// Tailwind runs through PostCSS in this app (postcss.config.mjs → the shared
// @monorepo/tailwind-config), not the Vite plugin, so it is deliberately absent
// from `plugins`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Vite 8 reads the `~/*` alias straight out of tsconfig.json, so the alias
    // is declared once, there.
    tsconfigPaths: true,
  },
});
