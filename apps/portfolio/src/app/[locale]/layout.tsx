import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, getTimeZone, getTranslations } from "next-intl/server";

import { I18nProvider } from "@monorepo/i18n/next-intl/provider";

import { PROFILE_LINKS } from "~/constants/profile";
import { ROUTES } from "~/constants/routes";
import { env } from "~/env";
import { ThemeProvider } from "~/features/layout/provider/theme-provider";
import { routing } from "~/i18n/routing";
import { absoluteUrl } from "~/utils/absolute-url";

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
 * What each field is here for, since "add more meta tags" is not a strategy:
 *
 * - `title` is **"Name — Software Engineer"**, not the bare name. A tab, a
 *   bookmark and a search result all render this string, and a name alone tells
 *   a stranger nothing; the role is the query a recruiter actually types.
 *   `template` is what lets a page below set only its own half.
 * - `alternates` is the one field this site cannot do without. Two languages
 *   serve the same content at two URLs, and without `canonical` plus the
 *   `languages` map a crawler is free to treat them as duplicates and pick a
 *   winner itself. `x-default` names which URL a searcher of neither language
 *   should land on. Both are built with `absoluteUrl`, the same helper the
 *   sitemap uses, so the two can never disagree about the prefix.
 * - `openGraph.locale` / `alternateLocale` say the same thing to an unfurler,
 *   which reads none of the above.
 * - the icons are **not** here: `src/app/icon.svg` is the file convention, and
 *   Next derives the `<link rel="icon">` from the file itself rather than from
 *   a path spelled twice.
 *
 * The social card is not listed either: `opengraph-image.tsx` beside this file
 * generates it per locale, and a file-convention image outranks anything
 * `openGraph.images` would say. `metadataBase` is still load-bearing — it is
 * what turns the URL Next emits for that route into the absolute one every
 * crawler and chat client demands, and why `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN`
 * is a required variable rather than an optional one.
 */
export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations();

  const title = t("portfolio.meta.title");
  const description = t("portfolio.meta.description");
  // This runs for an unknown segment too — the `notFound()` below has not
  // happened yet — and `getPathname` would then build a URL for a locale that
  // does not exist. A 404 page's canonical is meaningless either way, so it
  // falls back to the default language rather than inventing one.
  const activeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN),
    title: { template: `%s · ${title}`, default: title },
    description,
    applicationName: t("portfolio.hero.name"),
    authors: [{ name: t("portfolio.hero.name"), url: PROFILE_LINKS.github }],
    creator: t("portfolio.hero.name"),
    manifest: "/manifest.webmanifest",
    alternates: {
      canonical: absoluteUrl(activeLocale, ROUTES.HOME),
      languages: {
        ...Object.fromEntries(
          routing.locales.map((code) => [code, absoluteUrl(code, ROUTES.HOME)]),
        ),
        "x-default": absoluteUrl(routing.defaultLocale, ROUTES.HOME),
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      siteName: t("portfolio.hero.name"),
      url: absoluteUrl(activeLocale, ROUTES.HOME),
      locale: activeLocale,
      alternateLocale: routing.locales.filter((code) => code !== activeLocale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
 * `suppressHydrationWarning` is load-bearing, not decoration: the theme
 * provider's init script writes the theme class onto `<html>` before React
 * hydrates, so the server's markup and the client's first read differ by design.
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
