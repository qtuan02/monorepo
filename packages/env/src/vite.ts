import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Vite client env (documents, storybook). Use instead of `import.meta.env` in app source.
 */
export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_DOCUMENTS_DOMAIN: z.string().optional(),
    VITE_STORYBOOK_DOMAIN: z.string().optional(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
  skipValidation:
    import.meta.env.VITE_SKIP_ENV_VALIDATION === "true" ||
    import.meta.env.VITE_SKIP_ENV_VALIDATION === "1",
});
