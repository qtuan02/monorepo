import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { env as envBase } from "@monorepo/env";

export const env = createEnv({
  server: {
    OPENWEATHERMAP_API_KEY: z.string().optional(),
  },
  client: {},
  experimental__runtimeEnv: {
    OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
  },
  extends: [envBase],
});
