import { data } from "react-router";

import { defaultLanguage } from "@monorepo/i18n/languages";

import type { Route } from "./+types/not-found";
import NotFound from "~/components/exception/not-found";
import i18n from "~/libs/i18n";

/**
 * The catch-all: `src/routes.ts` mounts it as the `*` splat INSIDE the shell
 * and OUTSIDE the guarded layout, so a mistyped URL says 404 with the header
 * still around it instead of bouncing an already signed-in visitor to sign-in.
 *
 * `return`, not `throw`: this component IS the 404 screen, so the loader only
 * has to stamp the status onto the document. A returned `data()` with a
 * non-200 status is what the server runtime writes on the response, which is
 * the whole difference between a real 404 a crawler drops and a 200 that
 * merely says 404. `/modules/:slug` is the other shape — it throws, because
 * there the component is a real page and the 404 is the exception.
 */
export function loader() {
  return data(null, { status: 404 });
}

/**
 * `getFixedT` over root's loader data, as in every `meta` here: this runs
 * outside the React tree, where the request's i18next clone is out of reach.
 * The `?? defaultLanguage` satisfies typegen's `undefined`-able root entry; it
 * is not a path a visitor reaches (see `~/routes/about`).
 */
export function meta({ matches }: Route.MetaArgs) {
  const t = i18n.getFixedT(matches[0].loaderData?.language ?? defaultLanguage);

  return [{ title: t("notFound.title") }];
}

export default function NotFoundRoute() {
  return <NotFound />;
}
