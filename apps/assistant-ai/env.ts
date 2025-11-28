import { createEnv } from "@t3-oss/env-nextjs";

import { env as envBase } from "@monorepo/env";

export const env = createEnv({
  server: {},
  client: {},
  experimental__runtimeEnv: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  },
  extends: [envBase],
});
