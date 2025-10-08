import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Template",
    short_name: "Template",
    description: "Template",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/globe.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/globe.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
