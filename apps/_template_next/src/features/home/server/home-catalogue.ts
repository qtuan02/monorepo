import { cacheLife, cacheTag } from "next/cache";

import type { HomeModule } from "~/features/home/types/home-module";
import { ROUTES } from "~/constants/routes";

/** The tag `refreshHomeCatalogue` invalidates. One name, two call sites. */
export const HOME_CATALOGUE_TAG = "home-catalogue";

/**
 * The public page's data: what a crawler must read in the first HTML, so it is
 * fetched on the server and cached, never in a TanStack Query hook. Which read
 * belongs on which side of that boundary is
 * `.agents/rules/next-data-fetching.md`.
 *
 * `"use cache"` puts the result in the static shell: the page prerenders, and
 * the entry is revalidated on the profile below rather than per request.
 *
 * The catalogue is local data on purpose. A template must build with no backend
 * running — `next build` executes this function — so replace the body with a
 * `templateService` call (the same singleton `~/hooks/api` uses) when a real API
 * exists, and keep everything else exactly as it is.
 */
export async function getHomeCatalogue(): Promise<HomeModule[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(HOME_CATALOGUE_TAG);

  return [
    { id: "dashboard", href: ROUTES.DASHBOARD },
    { id: "pos", href: ROUTES.HOME, comingSoon: true },
    { id: "patients", href: ROUTES.HOME, comingSoon: true },
    { id: "medications", href: ROUTES.HOME, comingSoon: true },
    { id: "analytics", href: ROUTES.HOME, comingSoon: true },
    { id: "appointments", href: ROUTES.HOME, comingSoon: true },
  ];
}
