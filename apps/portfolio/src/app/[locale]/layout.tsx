import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import { routing } from "~/i18n/routing";
import { NextParams } from "~/types/common";
import { Metadata } from "next";
import { getMetadataDefault } from "~/utils/get-metadata-default";
import { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Provider } from "./provider";
import RootLayout from "~/features/layout/templates";
import { Inter_Tight } from "next/font/google";

const inter = Inter_Tight({
  subsets: ["latin"],
  adjustFontFallback: true,
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter-tight",
});

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
      default: "Portfolio",
      template: "%s | Portfolio",
    },
    icons: {
      icon: [
        {
          url: "/logo.webp",
          type: "image/webp",
          sizes: "32x32",
        },
        {
          url: "/logo.webp",
          type: "image/webp",
          sizes: "16x16",
        },
        {
          url: "/logo.webp",
          sizes: "any",
          type: "image/webp",
        },
      ],
      apple: [
        {
          url: "/logo.webp",
          type: "image/webp",
          sizes: "180x180",
        },
      ],
      shortcut: "/logo.webp",
    },
    robots: {
      index: false,
      follow: false,
    },
    manifest: "/manifest.webmanifest",
  });
}

export default async function Layout({
  params,
  children,
}: {
  children: ReactNode;
  params: NextParams;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html suppressHydrationWarning lang={locale} className={inter.className}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale}>
          <Provider>
            <RootLayout>{children}</RootLayout>
          </Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
