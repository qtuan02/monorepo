import type { StorybookConfig } from "@storybook/react-vite";

// builder-vite auto-discovers ../vite.config.ts, so no builder options here.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",

  // The two chunks over Vite's 500 kB advisory are Storybook's own —
  // `iframe.js` (~1.23 MB) and `DocsRenderer` (~754 kB) — emitted by the
  // builder, not by anything in `src/`. There is no chunking decision here to
  // make differently, and this app is an internal catalogue that ships to no
  // user, so the threshold is raised just above them rather than leaving a
  // warning nobody can act on. Same call as apps/_template_vite, which sets its
  // own limit in vite.config.ts.
  //
  // It has to be set here, not in ../vite.config.ts: builder-vite composes its
  // own `build` block over the discovered config and drops the setting.
  // `viteFinal` runs after that merge and is the only place it sticks.
  //
  // `checks.pluginTimings` goes off for the same reason and is silenced the
  // same way. Rolldown emits it once a build passes 3s with plugin hooks
  // dominating, which here is `storybook:react-docgen-plugin` (4,500-odd calls,
  // one per component it documents) and `vite:css`. Both belong to Storybook,
  // neither is tunable from this repo, and the 3s trigger means the warning
  // comes and goes with machine load — a build gate that flips on how busy the
  // laptop is teaches nothing. Note the key is `rolldownOptions`, not
  // `rollupOptions`: Vite 8 accepts both for the options it maps itself, but
  // `checks` is a Rolldown-only input and is dropped from the Rollup-named one.
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
