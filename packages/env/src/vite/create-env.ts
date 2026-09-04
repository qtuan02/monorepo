// Namespace import, not `import { z }`: a bundler that externalizes zod for
// SSR on musl/Linux (CI) drops zod's `export { z }` namespace re-export, so `z`
// resolves to undefined and `z.object` throws at module load — a failure that
// never reproduces on the Windows dev box. The top-level `export *` names
// survive, so importing the module namespace keeps `z.prettifyError` intact.
import * as z from "zod";

/**
 * Validates `runtimeEnv` against `schema` and returns the typed, parsed object.
 *
 * `runtimeEnv` is a parameter rather than a direct read of `import.meta.env` so
 * the package stays usable outside Vite (a plain Bun/Node script, this
 * package's own tests) and so each app can extend `baseEnvSchema` with its own
 * variables.
 *
 * Parses instead of casts: an invalid config throws here, at module load,
 * rather than surfacing later as an undefined baseURL that silently sends every
 * request to the app's own origin.
 */
export function createEnv<TSchema extends z.ZodType>(
  schema: TSchema,
  runtimeEnv: unknown,
): z.infer<TSchema> {
  const parsed = schema.safeParse(runtimeEnv);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment:\n${z.prettifyError(parsed.error)}\n\nCopy .env.example to .env at the repo root and fill in the PUBLIC_* values.`,
    );
  }

  return parsed.data;
}
