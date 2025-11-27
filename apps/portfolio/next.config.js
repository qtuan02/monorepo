import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs";
import createJiti from "jiti";

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      "*.svg": {
        as: "*.js",
        loaders: ["@svgr/webpack"],
      },
    },
  },
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@monorepo/ui", "@monorepo/env"],

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  output: process.env.CI === "true" ? "standalone" : undefined,
};

export default withSentryConfig(nextConfig, {
  org: "sentry",
  project: "portfolio_v1",

  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // You can capture React component names to see which component a user clicked on in Sentry features like Session Replay
  reactComponentAnnotation: {
    enabled: true,
  },
});
