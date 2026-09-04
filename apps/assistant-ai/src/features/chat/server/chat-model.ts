import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { env } from "~/env";

/**
 * The Gemini provider, built once from the **validated** key.
 *
 * `google` — the ready-made instance the package also exports — reads
 * `process.env.GOOGLE_GENERATIVE_AI_API_KEY` itself, which would put the one
 * value this app cannot run without outside the schema in `~/env.ts` and outside
 * Biome's `noProcessEnv`. Passing `apiKey` explicitly keeps `env` the only
 * reader, so a missing key fails at module load with the variable's name rather
 * than as a 400 from Google on the first turn.
 */
const googleProvider = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export { googleProvider };
