import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTimeZone, getTranslations } from "next-intl/server";

import { I18nProvider } from "@monorepo/i18n/next-intl/provider";

import { env } from "~/env";
import { ThemeProvider } from "~/features/layout/provider/theme-provider";
import { routing } from "~/i18n/routing";

import "~/globals.css";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Prerenders one shell per locale. With `cacheComponents` on this is also what
 * makes `params` a build-time value rather than runtime data — without it, every
 * `await params` below would have to sit inside a `<Suspense>`.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * The site-wide metadata, built from the shared catalogue so the tab title and
 * the social cards are translated with everything else.
 *
 * `metadataBase` is what turns the relative `/og-image.jpg` below into the
 * absolute URL every crawler and chat client demands — and it is why
 * `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` is a required variable rather than an
 * optional one.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  const title = t("portfolio.meta.title");
  const description = t("portfolio.meta.description");
  const image = {
    url: "/og-image.jpg",
    width: 1200,
    height: 630,
    alt: title,
  };

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN),
    // `template` is what lets a page below set only its own half of the title.
    title: { template: `%s · ${title}`, default: title },
    description,
    icons: { icon: { url: "/favicon.ico", type: "image/x-icon" } },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      title,
      description,
      siteName: title,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    // A developer's own machine must not end up in a search index. Anywhere
    // else the default (indexable) applies, which is the whole point of the app.
    robots:
      env.NEXT_PUBLIC_APP_ENV === "local"
        ? { index: false, follow: false }
        : undefined,
  };
}

/**
 * The root layout — it owns `<html>`, so there is no layout above it. Locale
 * validation happens here and nowhere else: a path like `/de/...` reaches this
 * point with `locale = "de"`, and answering it with a 404 is the only honest
 * outcome.
 *
 * That 404 is Next's own — unstyled and English — because this layout has no
 * boundary above it: `(shell)/not-found.tsx` is a *child* of the layout that
 * threw. The status is still 404, which is what crawlers and monitors act on.
 *
 * It is reachable in ordinary use, not only via a hand-typed `/de`: the proxy's
 * matcher excludes any path containing a dot, so `/foo.bar` skips locale
 * negotiation and arrives here with `foo.bar` as the segment.
 *
 * `suppressHydrationWarning` is load-bearing, not decoration: `next-themes`
 * writes the theme class onto `<html>` before React hydrates, so the server's
 * markup and the client's first read differ by design.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Read back what the shared request config resolved. next-intl fills these in
  // automatically only when `NextIntlClientProvider` is rendered *directly* by a
  // Server Component: the RSC build of the package swaps in a server variant
  // that awaits them. `I18nProvider` is a "use client" module, so the import
  // inside it resolves to the plain client provider instead and nothing is
  // inherited — passing them here is what replaces that, and it is also what
  // keeps this layout statically rendered.
  const [messages, timeZone] = await Promise.all([
    getMessages(),
    getTimeZone(),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* `id="root"` picks up the `isolation: isolate` rule in the workspace
          Tailwind globals — the isolated stacking context Base UI's portaled
          popups rely on. A Vite app puts it on its mount div; Next renders the
          document itself, so `<body>` is that element. */}
      <body id="root" className="flex min-h-svh flex-col antialiased">
        <I18nProvider locale={locale} messages={messages} timeZone={timeZone}>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
