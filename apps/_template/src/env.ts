import { env as envBase } from "@monorepo/env";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {},
  client: {},
  experimental__runtimeEnv: {},
  extends: [envBase],
});
