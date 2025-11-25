import { pluginReact } from "@rsbuild/plugin-react";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/**", "!src/v1/**"],
    },
    tsconfigPath: "./tsconfig.build.json",
  },
  lib: [
    {
      format: "esm",
      dts: true,
      bundle: false,
    },
    {
      format: "cjs",
      dts: false,
      bundle: false,
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
