import type { StorybookConfig } from "@storybook/react-vite";

// builder-vite auto-discovers ../vite.config.ts, so no builder options here.
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",
};
export default config;
