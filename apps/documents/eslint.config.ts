import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@monorepo/eslint-config/base";
import { reactConfig } from "@monorepo/eslint-config/react";

export default defineConfig(baseConfig, reactConfig, restrictEnvAccess, {
  ignores: ["dist/**", "scripts/**"],
});
