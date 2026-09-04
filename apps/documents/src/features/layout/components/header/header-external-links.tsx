import { BookMarked, Package } from "lucide-react";
import { useTranslation } from "react-i18next";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

import { NPM_URLS } from "~/constants/packages";
import { env } from "~/env";

// The header's own ghost styling: the primitive's `hover:bg-accent` is a light
// wash meant for a light surface, which washes out on the primary bar.
const iconLinkClassName =
  "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground";

/**
 * The two places a reader goes next: the package on npm, and the Storybook that
 * holds every live demo. Both are anchors styled with `buttonVariants` rather
 * than `Button`, because they navigate away (see architecture-ui-primitives).
 */
export default function HeaderExternalLinks() {
  const { t } = useTranslation();

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={NPM_URLS.ui}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("documents.nav.npm")}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                iconLinkClassName,
              )}
            >
              <Package className="size-4.5" />
            </a>
          }
        />
        <TooltipContent>{t("documents.nav.npm")}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={env.PUBLIC_DOCUMENTS_STORYBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("documents.nav.storybook")}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                iconLinkClassName,
              )}
            >
              <BookMarked className="size-4.5" />
            </a>
          }
        />
        <TooltipContent>{t("documents.nav.storybook")}</TooltipContent>
      </Tooltip>
    </>
  );
}
