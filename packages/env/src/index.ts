import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_ENV: z.string().optional(),

    //portfolio
    NEXT_PUBLIC_PORTFOLIO_DOMAIN: z.string().url(),

    //template
    NEXT_PUBLIC_SENTRY_TEMPLATE_DSN: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,

    //portfolio
    NEXT_PUBLIC_PORTFOLIO_DOMAIN: process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN,

    //template
    NEXT_PUBLIC_SENTRY_TEMPLATE_DSN:
      process.env.NEXT_PUBLIC_SENTRY_TEMPLATE_DSN,
  },
});

export { env };
