import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTimeZone, getTranslations } from "next-intl/server";

import { I18nProvider } from "@monorepo/i18n/next-intl/provider";
import { Toaster } from "@monorepo/ui/components/toast";

import { QueryProvider } from "~/features/layout/provider/query-provider";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    // `template` is what lets every page below set only its own half of the
    // title. `default` covers a route that sets none.
    title: {
      template: `%s · ${t("assistantAi.meta.title")}`,
      default: t("assistantAi.meta.title"),
    },
    description: t("assistantAi.meta.description"),
  };
}

/**
 * The root layout — it owns `<html>`, so there is no layout above it. Locale
 * validation happens here and nowhere else: a path like `/de/...` reaches this
 * point with `locale = "de"`, and answering it with a 404 is the only honest
 * outcome.
 *
 * That 404 is the one in the app Next renders itself — unstyled and English —
 * because this layout has no boundary above it: `(shell)/not-found.tsx` is a
 * *child* of the layout that threw, so it never gets to render. The status is
 * still 404, which is what crawlers and monitors act on. `global-not-found.tsx`
 * does not help — `[locale]` matches every path, so no request is ever unmatched
 * and the file is unreachable (measured: with `experimental.globalNotFound` on,
 * the flight payload for `/foo.bar` is byte-identical). Replacing it means
 * moving this check below the layout that owns `<html>` and adding a
 * `[locale]/not-found.tsx` for it — a change to the template's root, not a file
 * you can just add.
 *
 * It is reachable in ordinary use, not only via a hand-typed `/de`: the proxy's
 * matcher excludes any path containing a dot, so `/foo.bar` skips locale
 * negotiation and arrives here with `foo.bar` as the segment.
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
      <body id="root" className="flex min-h-svh flex-col">
        <I18nProvider locale={locale} messages={messages} timeZone={timeZone}>
          <QueryProvider>
            <Toaster>{children}</Toaster>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
