import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import createJiti from "jiti";

createJiti(fileURLToPath(import.meta.url))("./env");

const nextConfig: NextConfig = {
  // Externalize discord.js and its dependencies to avoid bundling issues
  serverExternalPackages: [
    "discord.js",
    "@discordjs/ws",
    "zlib-sync",
    "bufferutil",
    "utf-8-validate",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark these as external for server-side bundling
      config.externals = config.externals || [];
      config.externals.push({
        "discord.js": "commonjs discord.js",
        "@discordjs/ws": "commonjs @discordjs/ws",
        "zlib-sync": "commonjs zlib-sync",
        bufferutil: "commonjs bufferutil",
        "utf-8-validate": "commonjs utf-8-validate",
      });
    }
    return config;
  },
};

export default nextConfig;
