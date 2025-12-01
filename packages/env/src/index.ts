import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    DISCORD_TOKEN: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_ENV: z.string().optional(),

    // portfolio v1
    NEXT_PUBLIC_PORTFOLIO_V1_DOMAIN: z.string().url(),
    NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN: z.string().optional(),

    //portfolio
    NEXT_PUBLIC_PORTFOLIO_DOMAIN: z.string().url(),
    NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN: z.string().optional(),

    //template
    NEXT_PUBLIC_SENTRY_TEMPLATE_DSN: z.string().optional(),

    //assistant ai
    NEXT_PUBLIC_ASSISTANT_AI_DOMAIN: z.string().optional(),

    // google analytics
    NEXT_PUBLIC_GOOGLE_ANALYTICS: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,

    // portfolio v1
    NEXT_PUBLIC_PORTFOLIO_V1_DOMAIN:
      process.env.NEXT_PUBLIC_PORTFOLIO_V1_DOMAIN,
    NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN:
      process.env.NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN,

    //portfolio
    NEXT_PUBLIC_PORTFOLIO_DOMAIN: process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN,
    NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN:
      process.env.NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN || "",

    //template
    NEXT_PUBLIC_SENTRY_TEMPLATE_DSN:
      process.env.NEXT_PUBLIC_SENTRY_TEMPLATE_DSN,

    //assistant ai
    NEXT_PUBLIC_ASSISTANT_AI_DOMAIN:
      process.env.NEXT_PUBLIC_ASSISTANT_AI_DOMAIN,

    // google analytics
    NEXT_PUBLIC_GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER,
  },
});

export { env };
