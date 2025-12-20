import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@monorepo/eslint-config/base";
import { nextjsConfig } from "@monorepo/eslint-config/nextjs";
import { reactConfig } from "@monorepo/eslint-config/react";

export default defineConfig(
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
  {
    ignores: [".next/**"],
  },
);

