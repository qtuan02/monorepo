import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

import { defaultLanguage } from "@monorepo/i18n/languages";

/**
 * The web app manifest, served at `/manifest.webmanifest` by convention.
 *
 * It sits **outside** `app/[locale]`, so there is no locale segment to read —
 * a manifest has one name per installed app, not one per language. The default
 * language is passed to `getTranslations` explicitly rather than the strings
 * being duplicated here, so a change to the site's title reaches both the tab
 * and the home-screen icon.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({ locale: defaultLanguage });

  const name = t("portfolio.meta.title");

  return {
    name,
    short_name: name,
    description: t("portfolio.meta.description"),
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    // One entry with the file's real type and `sizes: "any"`. The legacy
    // manifest declared the same `.ico` twice as 192×192 and 512×512, which
    // describes bitmaps that file does not contain.
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
