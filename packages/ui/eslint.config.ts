import { defineConfig } from "eslint/config";

import { baseConfig } from "@monorepo/eslint-config/base";
import { reactConfig } from "@monorepo/eslint-config/react";

export default defineConfig(baseConfig, reactConfig, {
  ignores: ["dist/**"],
});
