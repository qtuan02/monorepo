import { useTranslation } from "react-i18next";
import { href, Link } from "react-router";

import { Badge } from "@monorepo/ui/components/badge";
import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import type {
  HomeModule,
  HomeModuleId,
} from "~/features/home/types/home-module";
import { moduleIcons } from "~/features/home/constants/module-icons";

/**
 * Where a built module's screen lives. Only the ids listed here get an "open"
 * link; everything else is `comingSoon` in the catalogue and gets the
 * not-built-yet copy instead. Kept beside the template rather than in the
 * catalogue because `href()` is a typed call over `src/routes.ts`: built here,
 * a renamed route is a compile error, while a path copied into the catalogue as
 * data would be a string nothing checks (contrast the Next Template, whose
 * catalogue carries `href` because its `ROUTES` constant is plain data too).
 */
const moduleScreens: Partial<Record<HomeModuleId, string>> = {
  dashboard: href("/dashboard"),
};

type ModuleTemplateProps = {
  /** Resolved by the route's loader from the `:slug` — the page owns the lookup, the slice the UI. */
  module: HomeModule;
};

/**
 * One module's public page. Server rendered like every screen here, so the
 * name, the description and — for an unbuilt module — the "not built yet"
 * notice are all in the first HTML a crawler reads.
 *
 * An unbuilt module gets this page rather than a 404 on purpose: the catalogue
 * on the home page advertises the URL, and a URL the app itself links to must
 * answer 200 with an honest explanation, not tell a crawler the page is gone.
 * The 404 is reserved for a slug the catalogue does not know (see the route
 * module's loader).
 */
export default function ModuleTemplate({ module }: ModuleTemplateProps) {
  const { t } = useTranslation();
  const Icon = moduleIcons[module.id];
  const title = t(`home.modules.${module.id}.title`);
  const screen = module.comingSoon ? undefined : moduleScreens[module.id];

  return (
    <article className="flex flex-col gap-8 py-12">
      <header className="flex flex-col gap-4">
        <Link
          to={href("/")}
          className="text-muted-foreground hover:text-foreground w-fit text-xs font-medium tracking-widest uppercase"
        >
          {t("home.title")}
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-accent text-accent-foreground flex size-14 shrink-0 items-center justify-center rounded-xl">
            <Icon className="size-7" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </h1>
            <Badge variant={module.comingSoon ? "outline" : "secondary"}>
              {module.comingSoon
                ? t("comingSoon.title")
                : t("templateReactRouter.module.available")}
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground max-w-prose text-base leading-relaxed">
          {t(`home.modules.${module.id}.description`)}
        </p>
      </header>

      <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
        {module.comingSoon
          ? t("comingSoon.message")
          : t("templateReactRouter.module.lead")}
      </p>

      {/* A <Link> styled with `buttonVariants`, not wrapped in `Button`: Base
          UI's Button assumes a native <button>, and telling it otherwise stamps
          role="button" over the anchor's own link role. These navigate, so they
          stay links. */}
      <div className="flex flex-wrap gap-3">
        {screen ? (
          <Link to={screen} className={cn(buttonVariants())}>
            {t("templateReactRouter.module.open", { name: title })}
          </Link>
        ) : null}
        <Link
          to={href("/")}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {t("templateReactRouter.module.backToCatalogue")}
        </Link>
      </div>
    </article>
  );
}
