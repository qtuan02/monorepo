import { defineConfig } from "eslint/config";

import { baseConfig } from "@monorepo/eslint-config/base";

export default defineConfig(baseConfig, {
  ignores: [],
});
