import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { defaultLanguage, messages } from "@monorepo/i18n/languages";

import { env } from "~/env";
import { routing } from "~/i18n/routing";

interface OpenGraphImageProps {
  params: Promise<{ locale: string }>;
}

/**
 * The `alt` export is one string for every locale — the convention has no
 * per-params variant short of `generateImageMetadata`, which also changes the
 * image URL. The candidate's name is the same in both languages, so the
 * default catalogue's title is read rather than spelled a second time here.
 */
export const alt = messages[defaultLanguage].portfolio.meta.title;
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
 * Satori cannot read a CSS variable, so every colour is a literal. The accent
 * is deliberately **not** the shared theme's `--primary`: that is the EMR
 * product's teal, an employer's brand, and the CV rebuild replaces it with a
 * neutral indigo-600 (`#4f39f6`, ticket #108) — the card wears that one so it
 * matches the site once both land. The greys are Tailwind's zinc-900 /
 * zinc-700 on a zinc-50 ground. A 4.5:1 floor holds for every pair: the card
 * is read at thumbnail size in a chat.
 */
const ACCENT = "#4f39f6";
const INK = "#18181b";
const INK_MUTED = "#3f3f46";
const GROUND = "#fafafa";

/**
 * `/<locale>/opengraph-image` — the 1200×630 card a link preview shows for this
 * site, rendered on the server per locale so the positioning line reads in the
 * language the shared URL points at. `metadataBase` in the root layout is what
 * turns the URL Next emits for it into the absolute one every unfurler
 * demands.
 *
 * No `fonts` option on purpose: `ImageResponse` ships Geist Regular, which
 * covers every Vietnamese diacritic in the catalogue, and loading a webfont
 * here would make `next build` — and with it `docker build` and CI — reach for
 * the network. Regular is the only weight bundled, so hierarchy is size, not
 * weight.
 *
 * Inline `style`, not `className`: Satori lays out from the style object and
 * never sees the app's stylesheet — this is not the DOM the Tailwind rule is
 * about.
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
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: GROUND,
        color: INK,
      }}
    >
      <div style={{ width: 24, height: "100%", background: ACCENT }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.1, letterSpacing: -2 }}>
            {t("portfolio.meta.title")}
          </div>
          <div
            style={{
              width: 120,
              height: 8,
              marginTop: 28,
              marginBottom: 36,
              borderRadius: 4,
              background: ACCENT,
            }}
          />
          <div
            style={{
              maxWidth: 960,
              fontSize: 40,
              lineHeight: 1.35,
              color: INK_MUTED,
            }}
          >
            {t("portfolio.hero.positioning")}
          </div>
        </div>
        <div style={{ fontSize: 30, color: ACCENT }}>{host}</div>
      </div>
    </div>,
    size,
  );
}
