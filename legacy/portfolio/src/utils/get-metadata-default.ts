import type { Metadata } from "next";

import { DESCRIPTION_METADATA, TITLE_METADATA } from "~/constants/common";

export function getMetadataDefault(metadata?: Metadata): Metadata {
  return {
    title: TITLE_METADATA,
    description: DESCRIPTION_METADATA,
    ...metadata,
    openGraph: {
      type: "website",
      title: TITLE_METADATA,
      description: DESCRIPTION_METADATA,
      siteName: TITLE_METADATA,
      images: [
        {
          url: "/vercel.svg",
          height: 630,
          width: 1200,
          alt: TITLE_METADATA,
          type: "image/jpeg",
        },
      ],
      ...metadata?.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE_METADATA,
      description: DESCRIPTION_METADATA,
      site: TITLE_METADATA,
      images: [
        {
          url: "/vercel.svg",
          height: 630,
          width: 1200,
          alt: TITLE_METADATA,
          type: "image/jpeg",
        },
      ],
      ...metadata?.twitter,
    },
  };
}
