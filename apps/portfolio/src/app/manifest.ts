import type { MetadataRoute } from "next";

import { DESCRIPTION_METADATA, TITLE_METADATA } from "~/constants/common";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: TITLE_METADATA,
    short_name: TITLE_METADATA,
    description: DESCRIPTION_METADATA,
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "192x192",
        type: "image/x-icon",
      },
      {
        src: "/favicon.ico",
        sizes: "512x512",
        type: "image/x-icon",
      },
    ],
  };
}
