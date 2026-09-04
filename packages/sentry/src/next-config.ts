import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

/**
 * The build-time half of the SDK, as the library itself types it. Derived from
 * the function rather than imported by name: the option bag's exported type name
 * has changed across major versions, and deriving it means a bump can never
 * leave this wrapper describing options that no longer exist.
 */
export type SentryBuildOptions = Parameters<typeof withSentryConfig>[1];

/**
 * Wraps an app's `next.config.ts`. This is what uploads source maps, tunnels
 * browser events past ad blockers, and instruments the server build.
 *
 * The defaults below are the ones a template should not have to think about:
 * quiet locally and loud in CI, and no build failure when the auth token is
 * missing — a repo clone with no Sentry credentials still has to build.
 *
 * ```ts
 * // apps/<app>/next.config.ts
 * export default withSentry(withNextIntl(nextConfig), { org: "acme", project: "web" });
 * ```
 */
export function withSentry(
  nextConfig: NextConfig,
  options: SentryBuildOptions = {},
): NextConfig {
  return withSentryConfig(nextConfig, {
    // Upload logs are noise on a dev box and the only record in CI. `silent` is
    // the only default set here: with no `SENTRY_AUTH_TOKEN` in the environment
    // the plugin skips the source-map upload with a warning instead of failing,
    // so a clone carrying no Sentry credentials still runs `next build`.
    silent: !process.env.CI,
    ...options,
  });
}
