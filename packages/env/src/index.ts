import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {
    // ENV
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    // DISCORD
    DISCORD_TOKEN: z.string().optional(),

    // DATABASE
    MONGODB_URL: z.string().optional(),

    // BETTER AUTH
    BETTER_AUTH_SECRET: z.string().optional(),
    BETTER_AUTH_URL: z.string().optional(),

    // GOOGLE OAUTH
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // ASSISTANT AI KEY
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  },
  client: {
    // ENV
    NEXT_PUBLIC_ENV: z.string().optional(),

    // DOMAIN
    NEXT_PUBLIC_TEMPLATE_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_PORTFOLIO_V1_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_PORTFOLIO_DOMAIN: z.string().optional(),
    NEXT_PUBLIC_ASSISTANT_AI_DOMAIN: z.string().optional(),

    // SENTRY
    NEXT_PUBLIC_SENTRY_TEMPLATE_DSN: z.string().optional(),
    NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN: z.string().optional(),
    NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN: z.string().optional(),

    // GOOGLE
    NEXT_PUBLIC_GOOGLE_ANALYTICS: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,

    // DOMAIN
    NEXT_PUBLIC_TEMPLATE_DOMAIN: process.env.NEXT_PUBLIC_TEMPLATE_DOMAIN,
    NEXT_PUBLIC_PORTFOLIO_V1_DOMAIN:
      process.env.NEXT_PUBLIC_PORTFOLIO_V1_DOMAIN,
    NEXT_PUBLIC_PORTFOLIO_DOMAIN: process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN,
    NEXT_PUBLIC_ASSISTANT_AI_DOMAIN:
      process.env.NEXT_PUBLIC_ASSISTANT_AI_DOMAIN,

    //SENTRY
    NEXT_PUBLIC_SENTRY_TEMPLATE_DSN:
      process.env.NEXT_PUBLIC_SENTRY_TEMPLATE_DSN,
    NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN:
      process.env.NEXT_PUBLIC_SENTRY_PORTFOLIO_V1_DSN,
    NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN:
      process.env.NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN,

    // GOOGLE
    NEXT_PUBLIC_GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER,
  },
});

export { env };
