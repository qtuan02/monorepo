import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  envDir: path.resolve(__dirname, "../.."),
  envPrefix: "VITE_",
  plugins: [react()],
  build: {
    outDir: "storybook-static",
  },
  preview: {
    port: 4173,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
