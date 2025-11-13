import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_ENV: z.string().optional(),
    NEXT_PUBLIC_PORTFOLIO_DOMAIN: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_PORTFOLIO_DOMAIN: process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN,
  },
});

export { env };
