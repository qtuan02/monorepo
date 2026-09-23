import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

import { routing } from "~/i18n/routing";

/**
 * The web app manifest, served at `/manifest.webmanifest` by convention.
 *
 * It sits **outside** `app/[locale]`, so there is no locale segment to read —
 * a manifest has one name per installed app, not one per language. The app's
 * own default is passed to `getTranslations` explicitly rather than the strings
 * being duplicated here, so a change to the site's title reaches both the tab
 * and the home-screen icon.
 *
 * `routing.defaultLocale`, not the registry's `defaultLanguage`: this app
 * serves English at the bare path (see `~/i18n/routing.ts`), and a manifest
 * naming the app in the other language is exactly the kind of drift a shared
 * constant hides.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({ locale: routing.defaultLocale });

  return {
    // The full "Name — Software Engineer" for the install prompt, the bare name
    // under the icon: `short_name` is what a home screen has room for.
    name: t("portfolio.meta.title"),
    short_name: t("portfolio.hero.name"),
    description: t("portfolio.meta.description"),
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    // The same square `src/app/icon.svg` the tab shows, declared once. A vector
    // needs no size list — `sizes: "any"` is what tells an installer to scale
    // it — where the legacy manifest declared one `.ico` twice, as 192×192 and
    // 512×512, describing bitmaps that file never contained.
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
