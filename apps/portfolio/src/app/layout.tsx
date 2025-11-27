import "./globals.css";

import type { Metadata } from "next";
import type * as React from "react";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

import { TooltipProvider } from "@monorepo/ui";

import { TITLE_METADATA } from "~/constants/common";
import { env } from "~/env";
import Navbar from "~/features/navbar";
import { getMetadataDefault } from "~/utils/get-metadata-default";
import { Provider } from "./provider";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  return getMetadataDefault({
    title: {
      default: TITLE_METADATA,
      template: "%s | " + TITLE_METADATA,
    },
    icons: {
      icon: [
        {
          url: "/favicon.ico",
          type: "image/x-icon",
          sizes: "32x32",
        },
        {
          url: "/favicon.ico",
          type: "image/x-icon",
          sizes: "16x16",
        },
        {
          url: "/favicon.ico",
          sizes: "any",
          type: "image/x-icon",
        },
      ],
      apple: [
        {
          url: "/favicon.ico",
          type: "image/x-icon",
          sizes: "180x180",
        },
      ],
      shortcut: "/favicon.ico",
    },
    robots:
      env.NEXT_PUBLIC_ENV === "local"
        ? {
            index: false,
            follow: false,
          }
        : undefined,
    manifest: "/manifest.webmanifest",
  });
}

export default async function RootLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="en">
      <body
        suppressHydrationWarning
        className="bg-background mx-auto min-h-screen max-w-2xl px-6 py-12 font-sans antialiased sm:py-24"
      >
        <GoogleAnalytics gaId="" />
        <GoogleTagManager gtmId="" />
        <Provider>
          <TooltipProvider delayDuration={0}>
            {children}
            <Navbar />
          </TooltipProvider>
        </Provider>
      </body>
    </html>
  );
}
