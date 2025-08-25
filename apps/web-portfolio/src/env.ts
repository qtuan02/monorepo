import { createEnv } from "@t3-oss/env-nextjs";
import { env as envBase } from "@web/env";

export const env = createEnv({
  server: {},
  client: {},
  experimental__runtimeEnv: {},
  extends: [envBase],
});
