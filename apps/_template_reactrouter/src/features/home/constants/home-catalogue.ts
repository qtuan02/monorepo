import type { HomeModule } from "~/features/home/types/home-module";

/**
 * The public page's data: what a crawler must read in the first HTML, so it is
 * returned by the home route's `loader` and never fetched by a TanStack Query
 * hook. Which read belongs on which side of that line is the same question the
 * Next Template answers in `.agents/rules/next-data-fetching.md`.
 *
 * Local data on purpose. A Template must build with no backend running —
 * `react-router build` executes a loader when it prerenders — and every other
 * screen of the app is reachable from this list. Replace this constant with a
 * `templateService` call inside the loader (the same singleton `~/hooks/api`
 * uses) when a real API exists, and keep everything else exactly as it is.
 *
 * Every entry is a page, `comingSoon` included: `/modules/:slug` is a public,
 * indexable URL per module, and an unbuilt module's page says so in words
 * rather than 404-ing on a URL the catalogue itself advertises.
 */
export const HOME_CATALOGUE: readonly HomeModule[] = [
  { id: "dashboard" },
  { id: "pos", comingSoon: true },
  { id: "patients", comingSoon: true },
  { id: "medications", comingSoon: true },
  { id: "analytics", comingSoon: true },
  { id: "appointments", comingSoon: true },
];
