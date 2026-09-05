import { useTranslation } from "react-i18next";
import { href, Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

/**
 * The one prerendered screen. Static copy and no loader, which is what makes it
 * prerenderable at all: `react-router build` renders this once, writes
 * `build/client/about/index.html` (plus `about.data` for client navigations),
 * and `react-router-serve`'s static middleware answers from disk before the
 * request handler ever runs.
 *
 * That is also the one thing to know when reading it: the document carries the
 * language of the BUILD (the registry default), not the visitor's negotiated
 * one — root's middleware never ran for a file served off disk. `entry.client`
 * hydrates it in that language (anything else is a hydration mismatch) and only
 * THEN switches to the visitor's stored choice, cookie included; the first
 * bytes are the build's either way. A screen whose first HTML must be per
 * visitor does not belong in `prerender`.
 */
export default function AboutTemplate() {
  const { t } = useTranslation();

  return (
    <article className="flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          {t("templateReactRouter.about.eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t("templateReactRouter.about.title")}
        </h1>
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          {t("templateReactRouter.about.lead")}
        </p>
      </header>

      <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
        {t("templateReactRouter.about.body")}
      </p>

      {/* A <Link> styled with `buttonVariants`, not wrapped in `Button`: Base
          UI's Button assumes a native <button>, and telling it otherwise stamps
          role="button" over the anchor's own link role. This navigates, so it
          stays a link. */}
      <Link
        to={href("/")}
        className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
      >
        {t("comingSoon.backToHome")}
      </Link>
    </article>
  );
}
