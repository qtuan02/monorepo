import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { StorybookLink } from "~/components/link/storybook-link";
import { GlassPanel } from "~/components/panel/glass-panel";
import { Swatch } from "~/components/swatch/swatch";

interface DetailHeroProps {
  slug: string;
  /** The npm name a consumer installs — `@fe-monorepo/ui`, never the workspace name. */
  packageName: string;
  /** The subpath after the package name — `components/dialog`. */
  subpath: string;
  /** Already localised — "10 export". */
  exportSummary: string;
  description?: string | null;
  npmUrl: string;
  /** Every entry has a Storybook docs page; the 404 branch is the one caller without one. */
  storybookDocsId?: string;
}

/**
 * The two action pills, both `buttonVariants` with the colour swapped: a
 * solid ink one for the demo (over `default`, whose three colour classes are
 * the only ones it sets), a glass one for npm (over `ghost`, which paints no
 * fill of its own).
 */
const solidActionClassName =
  "bg-foreground text-background hover:bg-foreground/90 rounded-full px-4 font-semibold shadow-(--sh-3) max-sm:h-10 max-sm:w-full";
const glassActionClassName =
  "bg-(--glass-strong) border-(--glass-edge) text-foreground hover:bg-card dark:hover:bg-card rounded-full px-4 font-semibold max-sm:h-10 max-sm:w-full";

/**
 * The head of a detail page (mockup frame 3): the entry's swatch at hero size,
 * the slug as the page's one `<h1>`, and the specifier a consumer types with
 * the export count beside it — the same colour and the same name the tile and
 * the search palette showed, so arriving here reads as the same thing.
 * Actions stack on the right: Storybook, then npm.
 */
export function DetailHero({
  slug,
  packageName,
  subpath,
  exportSummary,
  description,
  npmUrl,
  storybookDocsId,
}: DetailHeroProps) {
  const { t } = useTranslation();

  return (
    <GlassPanel
      deep
      className="mb-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-6 sm:p-7 lg:grid-cols-[auto_1fr_auto]"
    >
      <Swatch
        slug={slug}
        size="lg"
        className="max-sm:size-16 max-sm:rounded-[20px]"
      />

      <div className="min-w-0">
        <h1 className="font-mono text-3xl font-extrabold leading-none tracking-[-0.04em] break-words sm:text-[2.75rem]">
          {slug}
        </h1>
        <p className="text-muted-foreground mt-2.5 font-mono text-[13.5px] break-all">
          <b className="text-foreground font-semibold">{packageName}</b>/
          {subpath} · {exportSummary}
        </p>
        {description ? (
          <p className="text-muted-foreground mt-3 max-w-prose text-sm">
            {description}
          </p>
        ) : null}
      </div>

      <div className="col-span-2 flex flex-col gap-2 sm:flex-row lg:col-span-1 lg:flex-col">
        {storybookDocsId ? (
          <StorybookLink
            docsId={storybookDocsId}
            variant="default"
            className={solidActionClassName}
          >
            {t("documents.components.detail.storybook")}
          </StorybookLink>
        ) : null}
        <a
          href={npmUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={t("documents.nav.npm")}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            glassActionClassName,
          )}
        >
          <ExternalLink className="size-4" />
          npm
        </a>
      </div>
    </GlassPanel>
  );
}
