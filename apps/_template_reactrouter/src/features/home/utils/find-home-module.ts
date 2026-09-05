import type { HomeModule } from "~/features/home/types/home-module";
import { HOME_CATALOGUE } from "~/features/home/constants/home-catalogue";

/**
 * The lookup behind `/modules/:slug`, as a pure function so the route module's
 * `loader` is one line and the found / not-found decision is testable without
 * a router: a URL segment in, a catalogue entry or `undefined` out.
 *
 * `slug` is typed `string`, not `HomeModuleId` — it comes straight off the URL,
 * and narrowing it is exactly this function's job. Nothing else in the app may
 * turn a slug into a module, or the 404 decision would exist twice.
 */
export function findHomeModule(slug: string): HomeModule | undefined {
  return HOME_CATALOGUE.find((module) => module.id === slug);
}
