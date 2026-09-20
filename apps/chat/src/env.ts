import * as z from "zod";

import { httpUrlSchema } from "@monorepo/env/http-url";
import { createEnv } from "@monorepo/env/vite/create-env";
import { baseEnvSchema } from "@monorepo/env/vite/schema";

// Parses import.meta.env at module load, so a bad/missing .env fails here,
// at boot, rather than surfacing later as an undefined baseURL that silently
// sends every request to the app's own origin.
//
// The `vite` Flavor of @monorepo/env, not the `next` one: the two keep separate
// prefixes (`PUBLIC_` vs `NEXT_PUBLIC_`) and neither maps onto the other
// (ADR-0003). The schema is extended right here, in this same file — the
// Dockerfile validates the image by importing this module, so the check and
// the app parse the same schema by construction.
//
// Two keys of its own, named for the app rather than reusing the base
// `PUBLIC_BASE_DOMAIN_API`: the backend this app talks to (`chat-socket`,
// origin 8089) is not the shared one every other app builds against.
//
// Exported so `test/env.test.ts` can validate the committed `.env.example`
// against *this app's* schema rather than the base one it extends.
export const envSchema = baseEnvSchema.extend({
  // The backend origin — the service singleton appends `/api` itself.
  PUBLIC_CHAT_API_BASE_URL: httpUrlSchema,
  // A ws(s) URL, so it needs its own protocol check rather than httpUrlSchema.
  PUBLIC_CHAT_SOCKET_URL: z.url({ protocol: /^wss?$/ }),
});

export const env = createEnv(envSchema, import.meta.env);
