import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { env as envBase } from "@monorepo/env";

export const env = createEnv({
  server: {
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    DISCORD_TOKEN: z.string().optional(),
    PORT: z.string().optional(),
  },
  client: {},
  experimental__runtimeEnv: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    PORT: process.env.PORT,
  },
  extends: [envBase],
});
