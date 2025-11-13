import { baseConfig, restrictEnvAccess } from "@monorepo/eslint-config/base";
import { nextjsConfig } from "@monorepo/eslint-config/nextjs";
import { reactConfig } from "@monorepo/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
