import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { env as envBase } from "@monorepo/env";

export const env = createEnv({
  server: {
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    MCP_DOMAIN: z.string().optional(),
  },
  client: {},
  experimental__runtimeEnv: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    MCP_DOMAIN: process.env.MCP_DOMAIN,
  },
  extends: [envBase],
});
