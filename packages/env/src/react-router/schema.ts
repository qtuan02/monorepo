import * as z from "zod";

import { httpUrlSchema } from "../http-url";

/**
 * The client variables every React Router (framework mode) app needs.
 * Declared as a plain dictionary — not a `z.object` — because this Flavor is
 * built on `@t3-oss/env-core`, which validates each key on its own and splits
 * the dictionary into a server half and a client half before parsing.
 *
 * The prefix is `PUBLIC_`, the same one the `vite` Flavor uses: a framework
 * mode app is a Vite build, so `envPrefix` decides what reaches the browser
 * (ADR-0003).
 *
 * These three keys are **re-declared here rather than imported from
 * `../vite/schema`**: a Flavor never imports another Flavor, and the two shapes
 * genuinely differ — `baseEnvSchema` is a `z.object` that is `safeParse`d
 * whole, this one is a per-key dictionary. The duplication is held honest by
 * the drift test in `test/react-router/create-env.test.ts`, which asserts the
 * two key sets are equal.
 */
export const baseClientSchema = {
  PUBLIC_APP_ENV: z.string().min(1),
  PUBLIC_BASE_DOMAIN: httpUrlSchema,
  PUBLIC_BASE_DOMAIN_API: httpUrlSchema,
};

export type BaseClientSchema = typeof baseClientSchema;

export type BaseReactRouterEnv = {
  [TKey in keyof BaseClientSchema]: z.infer<BaseClientSchema[TKey]>;
};
