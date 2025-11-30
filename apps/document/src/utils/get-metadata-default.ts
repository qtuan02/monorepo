import type { Metadata } from "next";

export const getMetadataDefault = async (
  locale: string,
  metadata?: Metadata,
): Promise<Metadata> => {
  return {
    title: "Document",
    description: "Document Description",
    ...metadata,
    openGraph: {
      type: "website",
      locale,
      title: "Document",
      description: "Document Description",
      siteName: "Document",
      images: [
        {
          url: "/logo.webp",
          height: 630,
          width: 1200,
          alt: "Document Description",
          type: "image/webp",
        },
      ],
      ...metadata?.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: "Document",
      description: "Document Description",
      site: "Document",
      images: [
        {
          url: "/logo.webp",
          height: 630,
          width: 1200,
          alt: "Document Description",
          type: "image/webp",
        },
      ],
      ...metadata?.twitter,
    },
  };
};
