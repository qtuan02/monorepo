// Tailwind v4 through PostCSS: Next has no Vite plugin pipeline, so the app
// declares `@tailwindcss/postcss` itself and re-exports the workspace config
// rather than restating the plugin list.
export { default } from "@monorepo/tailwind-config/postcss-config";
