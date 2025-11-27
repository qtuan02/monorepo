import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs";
import createJiti from "jiti";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Provide the path to the messages that you're using in `AppConfig`
    createMessagesDeclaration: "./messages/vi.json",
  },
});

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
  transpilePackages: [
    "@tanstack/query-core",
    "@tanstack/react-query",
    "@tanstack/react-table",
    "@tanstack/react-query-devtools",
    "@monorepo/ui",
    "@monorepo/env",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },

  output: process.env.CI === "true" ? "standalone" : undefined,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "sentry",
  project: "template",

  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
