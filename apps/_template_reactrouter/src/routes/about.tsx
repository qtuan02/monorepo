import { defaultLanguage } from "@monorepo/i18n/languages";

import type { Route } from "./+types/about";
import AboutTemplate from "~/features/about/templates/about.template";
import i18n from "~/libs/i18n";

/**
 * No `loader`, on purpose: this route is in `react-router.config.ts`'s
 * `prerender` list, so it is rendered ONCE at build time — root's middleware
 * and loader run then, against no request in particular, and the emitted file
 * is what `react-router-serve` answers from disk afterwards. A loader here
 * would execute at build, not per visitor, so anything it read would be frozen
 * into the file; a screen whose data is per request does not belong in
 * `prerender`.
 *
 * The same holds for `meta`: `matches[0].loaderData.language` is the language
 * of the BUILD (the registry default), not the visitor's — so the title below
 * is fixed at build time exactly like the body. The `?? defaultLanguage` is
 * what typegen's `undefined`-able root entry demands, not a branch a visitor
 * reaches: on an error render the framework stops running `meta` at the
 * boundary that caught the error, so a child's never sees a root that failed.
 */
export function meta({ matches }: Route.MetaArgs) {
  const t = i18n.getFixedT(matches[0].loaderData?.language ?? defaultLanguage);

  return [
    { title: t("templateReactRouter.about.meta.title") },
    {
      name: "description",
      content: t("templateReactRouter.about.meta.description"),
    },
  ];
}

/** The whole body of a route module: render the slice's template. */
export default function AboutRoute() {
  return <AboutTemplate />;
}
