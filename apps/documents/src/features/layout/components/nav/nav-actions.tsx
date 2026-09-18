import { BookMarked, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { SelectLanguage } from "~/components/select/select-language";
import { NPM_URLS } from "~/constants/packages";
import { ROUTES } from "~/constants/routes";
import { env } from "~/env";
import ThemeToggleButton from "./theme-toggle-button";

/**
 * The round glass control every button in the pill wears — the four here, the
 * menu trigger and the search field's collapsed form. Exported so the three
 * files agree on one string rather than each restating it.
 */
export const roundControlClassName =
  "size-9 rounded-full border border-(--glass-edge) bg-(--glass) text-foreground/80 shadow-none hover:bg-(--glass-strong) hover:text-foreground";

/**
 * The four round controls at the end of the pill: language, theme, and the two
 * places a reader goes next — the package on npm and the Storybook with every
 * live demo. Those two are anchors styled with `buttonVariants`, not
 * `<Button render>`: Base UI's Button expects a native button and would either
 * warn on every render or stamp `role="button"` over the link.
 */
export default function NavActions() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  // The hook pages point at the hook package — the same prefix match NavLinks
  // lights the section with, so the two never disagree.
  const npmUrl =
    pathname === ROUTES.HOOKS || pathname.startsWith(`${ROUTES.HOOKS}/`)
      ? NPM_URLS.hook
      : NPM_URLS.ui;

  return (
    <div className="flex items-center gap-1.5">
      <SelectLanguage
        compact
        triggerClassName={cn(roundControlClassName, "justify-center px-0")}
      />

      <ThemeToggleButton className={roundControlClassName} />

      <a
        href={npmUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("documents.nav.npm")}
        title={t("documents.nav.npm")}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          roundControlClassName,
        )}
      >
        <Package className="size-4.5" />
      </a>

      <a
        href={env.PUBLIC_DOCUMENTS_STORYBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("documents.nav.storybook")}
        title={t("documents.nav.storybook")}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          roundControlClassName,
        )}
      >
        <BookMarked className="size-4.5" />
      </a>
    </div>
  );
}
