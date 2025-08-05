/* eslint-disable turbo/no-undeclared-env-vars */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_ENV: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  },
});

export { env };
