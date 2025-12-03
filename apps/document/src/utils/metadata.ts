import type { Metadata } from "next";

import { env } from "~/env";

/**
 * Default metadata configuration
 */
const DEFAULT_METADATA = {
  title: "Document",
  description: "Document Description",
  siteName: "Document",
  logoUrl: "/logo.webp",
} as const;

/**
 * Creates default metadata with optional overrides
 * @param locale - The locale for the metadata
 * @param metadata - Optional metadata overrides
 * @returns Complete metadata object
 */
export async function createMetadata(
  locale: string,
  metadata?: Metadata,
): Promise<Metadata> {
  const title = metadata?.title
    ? typeof metadata.title === "string"
      ? { default: metadata.title, template: `%s | ${DEFAULT_METADATA.title}` }
      : {
          default: DEFAULT_METADATA.title,
          template: `%s | ${DEFAULT_METADATA.title}`,
          ...metadata.title,
        }
    : {
        default: DEFAULT_METADATA.title,
        template: `%s | ${DEFAULT_METADATA.title}`,
      };

  return {
    title,
    description: DEFAULT_METADATA.description,
    ...metadata,
    icons: {
      icon: [
        {
          url: DEFAULT_METADATA.logoUrl,
          type: "image/webp",
          sizes: "32x32",
        },
        {
          url: DEFAULT_METADATA.logoUrl,
          type: "image/webp",
          sizes: "16x16",
        },
        {
          url: DEFAULT_METADATA.logoUrl,
          sizes: "any",
          type: "image/webp",
        },
      ],
      apple: [
        {
          url: DEFAULT_METADATA.logoUrl,
          type: "image/webp",
          sizes: "180x180",
        },
      ],
      shortcut: DEFAULT_METADATA.logoUrl,
      ...(metadata?.icons && typeof metadata.icons === "object"
        ? metadata.icons
        : {}),
    },
    openGraph: {
      type: "website",
      locale,
      title: DEFAULT_METADATA.title,
      description: DEFAULT_METADATA.description,
      siteName: DEFAULT_METADATA.siteName,
      images: [
        {
          url: DEFAULT_METADATA.logoUrl,
          height: 630,
          width: 1200,
          alt: DEFAULT_METADATA.description,
          type: "image/webp",
        },
      ],
      ...metadata?.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_METADATA.title,
      description: DEFAULT_METADATA.description,
      site: DEFAULT_METADATA.siteName,
      images: [
        {
          url: DEFAULT_METADATA.logoUrl,
          height: 630,
          width: 1200,
          alt: DEFAULT_METADATA.description,
          type: "image/webp",
        },
      ],
      ...metadata?.twitter,
    },
    robots:
      env.NEXT_PUBLIC_ENV === "local"
        ? {
            index: false,
            follow: false,
          }
        : metadata?.robots,
  };
}
