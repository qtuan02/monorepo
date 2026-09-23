import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { messages } from "@monorepo/i18n/languages";

import { env } from "~/env";
import OpenGraphCard from "~/features/home/components/open-graph-card";
import { routing } from "~/i18n/routing";

interface OpenGraphImageProps {
  params: Promise<{ locale: string }>;
}

/**
 * The `alt` export is one string for every locale — the convention has no
 * per-params variant short of `generateImageMetadata`, which also changes the
 * image URL. So it is read from the app's own default locale's catalogue rather
 * than spelled a second time here.
 */
export const alt = messages[routing.defaultLocale].portfolio.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * One card per locale, prerendered at build time. The root layout declares the
 * same list for the pages, but an image route is compiled as its own route and
 * does not inherit it — without this export the card is rendered on demand.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * `/<locale>/opengraph-image` — the 1200×630 card a link preview shows for this
 * site, rendered on the server per locale so the positioning line reads in the
 * language the shared URL points at. `metadataBase` in the root layout is what
 * turns the URL Next emits for it into the absolute one every unfurler
 * demands.
 *
 * This module resolves what only the framework can — the locale, its
 * catalogue, the host — and hands the strings to the `home` slice's card,
 * which owns the drawing and its palette.
 *
 * No `fonts` option on purpose: `ImageResponse` ships Geist Regular, which
 * covers every Vietnamese diacritic in the catalogue, and loading a webfont
 * here would make `next build` — and with it `docker build` and CI — reach for
 * the network. Regular is the only weight bundled, so hierarchy is size and
 * the yellow slab, not weight.
 */
export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { locale } = await params;

  // The root layout validates the segment for pages; an image route renders
  // with no layout above it, so it repeats the one check.
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Explicit `locale`: this runs outside the page render, where the request
  // config would otherwise read `next/root-params` for it.
  const t = await getTranslations({ locale });
  const host = new URL(env.NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN).host;

  return new ImageResponse(
    <OpenGraphCard
      title={t("portfolio.hero.name")}
      // The card's slab holds the name, so the line beneath it has to carry
      // both halves of what the hero splits over two rows — the title a
      // recruiter scans for, then what drives the work.
      positioning={`${t("portfolio.hero.role")} — ${t("portfolio.hero.tagline")}`}
      host={host}
    />,
    size,
  );
}
