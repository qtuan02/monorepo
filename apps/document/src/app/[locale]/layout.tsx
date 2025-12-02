import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { cn } from "@monorepo/ui/libs/cn";

import { interFont } from "~/constants/fonts";
import type { NextParams } from "~/types/common";
import { env } from "~/env";
import { AuthProvider } from "~/features/auth/provider/auth.provider";
import { routing } from "~/i18n/routing";
import { auth } from "~/libs/auth";
import { createMetadata } from "~/utils/metadata";
import { Provider } from "./provider";

// export const dynamic = "force-static";

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

  return createMetadata(locale, {
    title: {
      default: "Document",
      template: "%s | Document",
    },
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

  // Get headers once
  const headersList = await headers();

  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // Get pathname from header (set by middleware)
  const pathname = headersList.get("x-current-path") || "";

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      className={cn(interFont.className, "antialiased")}
    >
      <body suppressHydrationWarning className="min-h-screen">
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? ""} />
        <GoogleTagManager gtmId={env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER ?? ""} />
        <NextIntlClientProvider locale={locale}>
          <Provider>
            <AuthProvider session={session} pathname={pathname}>
              {children}
            </AuthProvider>
          </Provider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
