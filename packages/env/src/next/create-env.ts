import type * as z from "zod";
import { createEnv as createT3Env } from "@t3-oss/env-nextjs";

import type { BaseClientSchema, BaseNextEnv } from "./schema";
import { baseClientSchema } from "./schema";

type ZodDictionary = Record<string, z.ZodType>;

/** Next only inlines a client variable whose name carries the prefix. */
type ClientDictionary = Record<`NEXT_PUBLIC_${string}`, z.ZodType>;

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
 * t3-env computes its option types from the dictionaries it infers, and a
 * merge of the base block with a still-generic one can never be proven to
 * satisfy them. Casting narrows this file's view of the library to the shape
 * it actually calls; `NextEnv` below re-states the contract callers see, so
 * nothing outside this module loses type information.
 */
type T3CreateEnv = (options: {
  server: unknown;
  client: unknown;
  shared: unknown;
  experimental__runtimeEnv: unknown;
  emptyStringAsUndefined: boolean;
  isServer: boolean | undefined;
  onValidationError: (issues: readonly EnvIssue[]) => never;
}) => unknown;

const parseNextEnv = createT3Env as unknown as T3CreateEnv;

export type CreateEnvOptions<
  TServer extends ZodDictionary,
  TClient extends ClientDictionary,
  TShared extends ZodDictionary,
> = {
  /**
   * Server-only variables, carrying no prefix. Next keeps them out of the
   * browser bundle and t3-env reads their values straight from `process.env`.
   */
  server: TServer;
  /** The client variables this app adds on top of the base block. */
  client: TClient;
  /**
   * Variables readable from both sides without the client prefix — `NODE_ENV`
   * and friends. t3-env validates them in both halves, so their values must be
   * listed in `clientRuntimeEnv` as well; the type below enforces that.
   */
  shared?: TShared;
  /**
   * Every prefix-less-inlined value this app needs on the client: the base
   * block, its own `client` keys, and any `shared` key. Write them out as
   * literal `process.env.NEXT_PUBLIC_*` reads in the app's own `env.ts`: Next
   * substitutes those literals only in code it compiles, so the same read
   * performed inside this package would stay `undefined` in the browser.
   */
  clientRuntimeEnv: Record<
    keyof BaseClientSchema | keyof TClient | keyof TShared,
    string | undefined
  >;
  /**
   * Overrides t3-env's `typeof window` probe. Pass `true` from a test so the
   * server half is validated whatever the test environment looks like.
   */
  isServer?: boolean;
};

/** What `createEnv` returns: the base block plus this app's own variables. */
export type NextEnv<
  TServer extends ZodDictionary,
  TClient extends ClientDictionary,
  TShared extends ZodDictionary,
> = Readonly<
  InferDictionary<TServer> &
    BaseNextEnv &
    InferDictionary<TClient> &
    InferDictionary<TShared>
>;

/**
 * The Next Flavor of `createEnv`: t3-env with the base client block already
 * merged in, so an app declares only what it adds.
 *
 * ```ts
 * // apps/<app>/src/env.ts
 * export const env = createEnv({
 *   server: { DATABASE_URL: z.url() },
 *   client: { NEXT_PUBLIC_ANALYTICS_ID: z.string().min(1) },
 *   clientRuntimeEnv: {
 *     NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
 *     NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN,
 *     NEXT_PUBLIC_BASE_DOMAIN_API: process.env.NEXT_PUBLIC_BASE_DOMAIN_API,
 *     NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
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
): NextEnv<TServer, TClient, TShared> {
  const parsed = parseNextEnv({
    server: options.server,
    client: { ...baseClientSchema, ...options.client },
    shared: options.shared ?? {},
    // `experimental__runtimeEnv` rather than `runtimeEnv`: server values come
    // from `process.env` on their own, and only the client half has to be
    // spelled out for Next's static substitution.
    experimental__runtimeEnv: options.clientRuntimeEnv,
    // Safe despite the mutation t3-env performs: the Next wrapper spreads
    // `{ ...process.env, ...experimental__runtimeEnv }` into a fresh object
    // first, so the deletion never reaches the caller's object.
    emptyStringAsUndefined: true,
    isServer: options.isServer,
    onValidationError: throwInvalidEnv,
  });

  return parsed as NextEnv<TServer, TClient, TShared>;
}

/**
 * Replaces t3-env's default handler, which logs a generic
 * "Invalid environment variables" and prints the raw issue objects. Naming the
 * offending variables is the whole point of failing at module load.
 */
function throwInvalidEnv(issues: readonly EnvIssue[]): never {
  const details = issues.map(formatIssue).join("\n");

  throw new Error(
    `Invalid environment:\n${details}\n\nCopy .env.example to .env at the repo root and fill in the values; a Next app reads that file through \`dotenv -e ../../.env --\` (ADR-0003).`,
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
