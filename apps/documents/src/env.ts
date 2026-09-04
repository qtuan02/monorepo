import { httpUrlSchema } from "@monorepo/env/http-url";
import { createEnv } from "@monorepo/env/vite/create-env";
import { baseEnvSchema } from "@monorepo/env/vite/schema";

// Parses import.meta.env at module load, so a bad/missing .env fails here, at
// boot, rather than surfacing later as a demo link pointing nowhere.
//
// The `vite` Flavor of @monorepo/env, not the `next` one: the two keep separate
// prefixes (`PUBLIC_` vs `NEXT_PUBLIC_`) and neither maps onto the other
// (ADR-0003). The schema is extended right here, in this same file — the
// Dockerfile validates the image by importing this module, so the check and the
// app parse the same schema by construction.
//
// Exported so `test/env.test.ts` can validate the committed `.env.example`
// against *this app's* schema rather than the base one it extends.
export const envSchema = baseEnvSchema.extend({
  // Required, not `.optional()`: every primitive page builds its demo link from
  // this, so a missing value should fail the image build — named — instead of
  // shipping 63 pages whose only demo link goes nowhere.
  PUBLIC_DOCUMENTS_STORYBOOK_URL: httpUrlSchema,
});

export const env = createEnv(envSchema, import.meta.env);
