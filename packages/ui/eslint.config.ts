import { baseConfig } from "@monorepo/eslint-config/base";
import { reactConfig } from "@monorepo/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
