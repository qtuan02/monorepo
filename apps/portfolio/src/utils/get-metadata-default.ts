import type { Metadata } from "next";

export const getMetadataDefault = async (
  locale: string,
  metadata?: Metadata
): Promise<Metadata> => {
  return {
    title: "Portfolio",
    description: "Portfolio Description",
    ...metadata,
    openGraph: {
      type: "website",
      locale,
      title: "Portfolio",
      description: "Portfolio Description",
      siteName: "Portfolio",
      images: [
        {
          url: "/vercel.svg",
          height: 630,
          width: 1200,
          alt: "Portfolio Description",
          type: "image/jpeg",
        },
      ],
      ...metadata?.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: "Portfolio", 
      description: "Portfolio Description",
      site: "Portfolio",
      images: [
        {
          url: "/vercel.svg",
          height: 630,
          width: 1200,
          alt: "Portfolio Description",
          type: "image/jpeg",
        },
      ],
      ...metadata?.twitter,
    },
  };
};
