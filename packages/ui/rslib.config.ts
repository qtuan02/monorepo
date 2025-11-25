import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: "./src/index.ts",
    },
    tsconfigPath: "./tsconfig.build.json",
  },
  lib: [
    {
      format: "esm",
      bundle: false,
      dts: true,
    },
  ],
  output: {
    target: "web",
    minify: true,
    distPath: {
      root: "./dist",
    },
  },
  plugins: [pluginReact()],
});
