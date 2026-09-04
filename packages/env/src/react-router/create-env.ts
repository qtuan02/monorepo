import type * as z from "zod";
import { createEnv as createT3Env } from "@t3-oss/env-core";

import type { BaseClientSchema, BaseReactRouterEnv } from "./schema";
import { baseClientSchema } from "./schema";

/**
 * Vite inlines by its own `envPrefix`, and this is the value both this Flavor
 * and the `vite` one are configured with. It is also what env-core uses at
 * runtime to decide which keys a client read is allowed to reach.
 */
const CLIENT_PREFIX = "PUBLIC_";

type ZodDictionary = Record<string, z.ZodType>;

/** Only a prefixed variable is inlined into the browser bundle. */
type ClientDictionary = Record<`${typeof CLIENT_PREFIX}${string}`, z.ZodType>;

/** An app that declares no `shared` block: `keyof` it is `never`. */
type EmptyDictionary = Record<never, z.ZodType>;

type InferDictionary<TDictionary extends ZodDictionary> = {
  [TKey in keyof TDictionary]: z.infer<TDictionary[TKey]>;
};

/** One failure reported by the underlying Standard Schema validation. */
type EnvIssue = {
  readonly message: string;
  readonly path?:
    | ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>
    | undefined;
};

/**
 * env-core computes its option types from the dictionaries it infers, and a
 * merge of the base block with a still-generic one can never be proven to
 * satisfy them. Casting narrows this file's view of the library to the shape it
 * actually calls; `ReactRouterEnv` below re-states the contract callers see, so
 * nothing outside this module loses type information.
 */
type T3CreateEnv = (options: {
  clientPrefix: typeof CLIENT_PREFIX;
  server: unknown;
  client: unknown;
  shared: unknown;
  runtimeEnv: Record<string, string | undefined>;
  emptyStringAsUndefined: boolean;
  isServer: boolean | undefined;
  onValidationError: (issues: readonly EnvIssue[]) => never;
  onInvalidAccess: (variable: string) => never;
}) => unknown;

const parseReactRouterEnv = createT3Env as unknown as T3CreateEnv;

export type CreateEnvOptions<
  TServer extends ZodDictionary,
  TClient extends ClientDictionary,
  TShared extends ZodDictionary,
> = {
  /**
   * Server-only variables, carrying no prefix. env-core keeps them off the
   * object once the module evaluates in the browser, and reading one there
   * throws rather than coming back `undefined`.
   *
   * A `PUBLIC_`-prefixed key filed here would defeat that, and by more than a
   * missing guard: env-core decides server-vs-client access by the prefix, so
   * such a key stays readable on the client, *and* its value reaches the
   * browser bundle from the app's own `runtimeEnv` map. The secret is present,
   * not merely reachable. Anything the browser may see belongs in `client`.
   */
  server: TServer;
  /** The client variables this app adds on top of the base block. */
  client: TClient;
  /**
   * Variables readable from both sides without the client prefix — `NODE_ENV`
   * and friends. env-core validates them in both halves, so their values must
   * be listed in `runtimeEnv` as well; the type below enforces that.
   */
  shared?: TShared;
  /**
   * Every value this app's schema names — the base block, its own `server`,
   * `client` and `shared` keys — as one map.
   *
   * It is the full map rather than the client half alone because env-core reads
   * **only** this object; it never falls back to `process.env` per key the way
   * the Next Flavor's `experimental__runtimeEnv` does. Write it out in the app's
   * own `env.ts` as literal `import.meta.env.PUBLIC_*` reads for the client
   * keys: Vite substitutes `import.meta.env` literals only in code it compiles,
   * so the same read performed inside this package would stay `undefined` in
   * the browser.
   *
   * The server reads must be written so they are **safe on the client**, since
   * this one module is evaluated in both graphs. Vite replaces `import.meta.env`
   * but leaves `process.env.SESSION_SECRET` alone, and defines no `process` in
   * a browser bundle — a bare read throws `ReferenceError: process is not
   * defined` at module load, before any validation runs and with an error that
   * names nothing about env. Guard each one with `import.meta.env.SSR`, which
   * Vite replaces with `false` on the client so the branch is dropped outright;
   * a `typeof process === "undefined"` check works too, and an app that wants
   * the bare form has to `define` `process.env` in its own Vite config.
   */
  runtimeEnv: Record<
    keyof BaseClientSchema | keyof TServer | keyof TClient | keyof TShared,
    string | undefined
  >;
  /**
   * Overrides env-core's `typeof window` probe. Pass `false` from a test to
   * exercise the client half — this package's runner is `node`, where there is
   * no `window` and every parse would otherwise take the server branch.
   */
  isServer?: boolean;
};

/** What `createEnv` returns: the base block plus this app's own variables. */
export type ReactRouterEnv<
  TServer extends ZodDictionary,
  TClient extends ClientDictionary,
  TShared extends ZodDictionary,
> = Readonly<
  InferDictionary<TServer> &
    BaseReactRouterEnv &
    InferDictionary<TClient> &
    InferDictionary<TShared>
>;

/**
 * The React Router (framework mode) Flavor of `createEnv`: `@t3-oss/env-core`
 * with the base client block already merged in, so an app declares only what it
 * adds.
 *
 * This Runtime builds server code and client code from one Vite build, which is
 * why it needs a Flavor of its own rather than the `vite` one: that Flavor knows
 * only a single `PUBLIC_` schema, and has nowhere to put a secret.
 *
 * ```ts
 * // apps/<app>/src/env.ts
 * export const env = createEnv({
 *   server: { SESSION_SECRET: z.string().min(1) },
 *   client: { PUBLIC_ANALYTICS_ID: z.string().min(1) },
 *   runtimeEnv: {
 *     PUBLIC_APP_ENV: import.meta.env.PUBLIC_APP_ENV,
 *     PUBLIC_BASE_DOMAIN: import.meta.env.PUBLIC_BASE_DOMAIN,
 *     PUBLIC_BASE_DOMAIN_API: import.meta.env.PUBLIC_BASE_DOMAIN_API,
 *     PUBLIC_ANALYTICS_ID: import.meta.env.PUBLIC_ANALYTICS_ID,
 *     // `import.meta.env.SSR` is `false` in the client build, so the
 *     // `process` read is eliminated rather than throwing there.
 *     SESSION_SECRET: import.meta.env.SSR ? process.env.SESSION_SECRET : undefined,
 *   },
 * });
 * ```
 */
export function createEnv<
  TServer extends ZodDictionary,
  TClient extends ClientDictionary,
  TShared extends ZodDictionary = EmptyDictionary,
>(
  options: CreateEnvOptions<TServer, TClient, TShared>,
): ReactRouterEnv<TServer, TClient, TShared> {
  const parsed = parseReactRouterEnv({
    clientPrefix: CLIENT_PREFIX,
    server: options.server,
    client: { ...baseClientSchema, ...options.client },
    shared: options.shared ?? {},
    // A copy, not the caller's object: `emptyStringAsUndefined` is implemented
    // by *deleting* the empty keys from whatever is handed in, and env-core —
    // unlike the Next wrapper — spreads nothing first.
    runtimeEnv: { ...options.runtimeEnv },
    emptyStringAsUndefined: true,
    isServer: options.isServer,
    onValidationError: throwInvalidEnv,
    onInvalidAccess: throwInvalidAccess,
  });

  return parsed as ReactRouterEnv<TServer, TClient, TShared>;
}

/**
 * Replaces env-core's default handler, which logs a generic
 * "Invalid environment variables" and prints the raw issue objects. Naming the
 * offending variables is the whole point of failing at module load.
 */
function throwInvalidEnv(issues: readonly EnvIssue[]): never {
  const details = issues.map(formatIssue).join("\n");

  throw new Error(
    `Invalid environment:\n${details}\n\nCopy .env.example to .env at the repo root and fill in the values; a React Router app reads the PUBLIC_* keys through Vite's \`envDir\` and the server keys from \`process.env\` (ADR-0003).`,
  );
}

/**
 * Same reason as above: env-core's default says a server variable was read on
 * the client but not which one, and the read site is usually a component far
 * from the declaration.
 */
function throwInvalidAccess(variable: string): never {
  throw new Error(
    `Invalid environment: \`${variable}\` is a server variable and cannot be read on the client. Move it to the \`client\` block with a ${CLIENT_PREFIX} prefix if the browser genuinely needs it, or read it from a loader/action instead.`,
  );
}

function formatIssue(issue: EnvIssue): string {
  const path = (issue.path ?? [])
    .map((segment) => (typeof segment === "object" ? segment.key : segment))
    .map((key) => String(key))
    .join(".");
  const location = path.length > 0 ? `${path}: ` : "";

  return `✖ ${location}${issue.message}`;
}
