import { createEnv } from "@monorepo/env/vite/create-env";
import { baseEnvSchema } from "@monorepo/env/vite/schema";

// Parses import.meta.env at module load, so a bad/missing .env fails here,
// at boot, rather than surfacing later as an undefined baseURL that silently
// sends every request to the app's own origin.
//
// The `vite` Flavor of @monorepo/env, not the `next` one: the two keep separate
// prefixes (`PUBLIC_` vs `NEXT_PUBLIC_`) and neither maps onto the other
// (ADR-0003). An app with variables of its own extends `baseEnvSchema` right
// here, in this same file — the Dockerfile validates the image by importing
// this module, so the check and the app parse the same schema by construction.
export const env = createEnv(baseEnvSchema, import.meta.env);
