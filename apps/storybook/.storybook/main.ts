import type { StorybookConfig } from "@storybook/react-vite";

// builder-vite auto-discovers ../vite.config.ts, so no builder options here.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",

  // Two build warnings, both about Storybook's own output rather than anything
  // in `src/`: the chunks over Vite's 500 kB advisory are `iframe.js` and
  // `DocsRenderer`, and `pluginTimings` names `storybook:react-docgen-plugin`
  // and `vite:css`. Neither is tunable from this repo, and `pluginTimings` only
  // fires above a 3s build, so it came and went with machine load.
  //
  // Two traps in silencing them. It has to be `viteFinal`, not
  // ../vite.config.ts, which builder-vite composes its own `build` block over;
  // and `checks` has to sit under `rolldownOptions` — Vite 8 accepts the
  // `rollupOptions` alias for what it maps itself, but drops Rolldown-only
  // inputs from it.
  //
  // Numbers and the reasoning:
  // ../../../.agents/plans/personal-monorepo-rebuild/12-gate-cuoi-kiem-tay.md
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    build: {
      ...viteConfig.build,
      chunkSizeWarningLimit: 1500,
      rolldownOptions: {
        ...viteConfig.build?.rolldownOptions,
        checks: {
          ...viteConfig.build?.rolldownOptions?.checks,
          pluginTimings: false,
        },
      },
    },
  }),
};
export default config;
