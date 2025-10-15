import "./globals.css";

import { ReactNode } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "~/i18n/routing";
import { NextParams } from "~/types/common";
import { getMetadataDefault } from "~/utils/get-metadata-default";
import { Provider } from "./provider";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: NextParams;
}): Promise<Metadata> {
  const { locale } = await params;

  return getMetadataDefault(locale, {
    title: {
      default: "Template",
      template: "%s | Template",
    },
    icons: {
      icon: [
        {
          url: "/globe.svg",
          type: "image/svg+xml",
          sizes: "32x32",
        },
        {
          url: "/globe.svg",
          type: "image/svg+xml",
          sizes: "16x16",
        },
        {
          url: "/globe.svg",
          sizes: "any",
          type: "image/x-icon",
        },
      ],
      apple: [
        {
          url: "/globe.svg",
          type: "image/svg+xml",
          sizes: "180x180",
        },
      ],
      shortcut: "/globe.svg",
    },
    robots: {
      index: false,
      follow: false,
    },
    manifest: "/manifest.webmanifest",
  });
}

export default async function RootLayout({
  params,
  children,
}: {
  children: ReactNode;
  params: NextParams;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html suppressHydrationWarning lang={locale}>
      <body suppressHydrationWarning>
        <GoogleAnalytics gaId="" />
        <GoogleTagManager gtmId="" />
        <NextIntlClientProvider locale={locale}>
          <Provider>{children}</Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
