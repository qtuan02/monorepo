import { fileURLToPath } from "url";
import type { NextConfig } from "next";
import createJiti from "jiti";

createJiti(fileURLToPath(import.meta.url))("./env");

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
