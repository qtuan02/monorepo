import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter_Tight } from "next/font/google";
import { notFound } from "next/navigation";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { cn } from "@monorepo/ui/libs/cn";

import type { NextParams } from "~/types/common";
import { env } from "~/env";
import LayoutTemplate from "~/features/layout/templates/layout.template";
import { routing } from "~/i18n/routing";
import { getMetadataDefault } from "~/utils/get-metadata-default";
import { Provider } from "./provider";

// export const dynamic = "force-static";

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

export function generateViewport() {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#fff" },
      { media: "(prefers-color-scheme: dark)", color: "#000" },
    ],
    viewportFit: "cover",
    width: "device-width",
    initialScale: 1,
    colorScheme: "light dark",
  };
}

export async function generateMetadata({
  params,
}: {
  params: NextParams;
}): Promise<Metadata> {
  const { locale } = await params;

  return getMetadataDefault(locale, {
    title: {
      default: "Document",
      template: "%s | Document",
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
    robots:
      env.NEXT_PUBLIC_ENV === "local"
        ? {
            index: false,
            follow: false,
          }
        : undefined,
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
    <html
      suppressHydrationWarning
      lang={locale}
      className={cn(inter.className, "antialiased")}
    >
      <body suppressHydrationWarning className="min-h-screen">
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""} />
        <GoogleTagManager gtmId={env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER ?? ""} />
        <NextIntlClientProvider locale={locale}>
          <Provider>
            <LayoutTemplate>{children}</LayoutTemplate>
          </Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
