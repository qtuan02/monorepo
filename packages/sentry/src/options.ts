/**
 * The knobs every runtime's `Sentry.init` shares. Deliberately small: a template
 * app should be able to turn Sentry on by passing a DSN and an environment name,
 * and nothing else.
 */
export interface SentryRuntimeOptions {
  /**
   * The project DSN. `undefined` — the value an app gets when the key is absent
   * from `.env` — switches the SDK off instead of throwing, which is what makes
   * `initSentry*` safe to call unconditionally from an instrumentation file.
   */
  dsn: string | undefined;
  /** Names the deployment in Sentry: `local`, `staging`, `production`, … */
  environment: string;
  /**
   * Fraction of transactions sampled for tracing. Defaults to 0 — a template
   * that silently sampled 100% would bill a real project the first time someone
   * pasted a DSN in.
   */
  tracesSampleRate?: number;
  /** Prints the SDK's own diagnostics. Never turn this on in production. */
  debug?: boolean;
}

/**
 * What every runtime passes to `Sentry.init`, resolved from the options above.
 * Kept in its own function (and its own module) so the "no DSN means disabled"
 * rule is stated once rather than repeated in three init files.
 */
export function buildSentryInitOptions(options: SentryRuntimeOptions) {
  return {
    dsn: options.dsn,
    environment: options.environment,
    // `enabled: false` keeps the SDK installed but silent: no network calls, no
    // console noise, and every `Sentry.*` call in app code stays a no-op.
    enabled: Boolean(options.dsn),
    tracesSampleRate: options.tracesSampleRate ?? 0,
    debug: options.debug ?? false,
  };
}
