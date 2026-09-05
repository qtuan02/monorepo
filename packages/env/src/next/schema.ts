import * as z from "zod";

import { httpUrlSchema } from "../http-url";

/**
 * The client variables every Next app needs. Declared as a plain dictionary —
 * not a `z.object` — because t3-env validates each key on its own.
 *
 * These belong under `client`, never `server`: only a `NEXT_PUBLIC_`-prefixed
 * key declared as a client variable is validated in the browser bundle. A base
 * key filed under `server` is simply absent from the env object once it
 * evaluates on the client, and every read comes back `undefined` with nothing
 * thrown — the exact failure this package exists to prevent.
 */
export const baseClientSchema = {
  NEXT_PUBLIC_APP_ENV: z.string().min(1),
  NEXT_PUBLIC_BASE_DOMAIN_API: httpUrlSchema,
};

export type BaseClientSchema = typeof baseClientSchema;

export type BaseNextEnv = {
  [TKey in keyof BaseClientSchema]: z.infer<BaseClientSchema[TKey]>;
};
