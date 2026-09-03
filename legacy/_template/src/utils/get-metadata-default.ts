import type { Metadata } from "next";

export function getMetadataDefault(
  locale: string,
  metadata?: Metadata,
): Metadata {
  return {
    title: "Template",
    description: "Template Description",
    ...metadata,
    openGraph: {
      type: "website",
      locale,
      title: "Template",
      description: "Template Description",
      siteName: "Template",
      images: [
        {
          url: "/vercel.svg",
          height: 630,
          width: 1200,
          alt: "Template Description",
          type: "image/jpeg",
        },
      ],
      ...metadata?.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: "Template",
      description: "Template Description",
      site: "Template",
      images: [
        {
          url: "/vercel.svg",
          height: 630,
          width: 1200,
          alt: "Template Description",
          type: "image/jpeg",
        },
      ],
      ...metadata?.twitter,
    },
  };
}
