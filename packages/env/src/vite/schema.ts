import * as z from "zod";

import { httpUrlSchema } from "../http-url";

/**
 * The variables every Vite app needs, whichever backend it fronts. An app with
 * extra variables extends this with `.extend({ ... })` rather than declaring a
 * second, unrelated schema.
 *
 * The prefix is `PUBLIC_`, not `NEXT_PUBLIC_`: Vite inlines by its own
 * configurable `envPrefix`, and nothing maps one Runtime's group onto the
 * other's (ADR-0003).
 */
export const baseEnvSchema = z.object({
  PUBLIC_APP_ENV: z.string().min(1),
  PUBLIC_BASE_DOMAIN: httpUrlSchema,
  PUBLIC_BASE_DOMAIN_API: httpUrlSchema,
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
