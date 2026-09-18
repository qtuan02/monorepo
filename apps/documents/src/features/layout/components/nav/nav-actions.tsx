import { BookMarked, Languages, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { SelectLanguage } from "~/components/select/select-language";
import { NPM_URLS } from "~/constants/packages";
import { ROUTES } from "~/constants/routes";
import { env } from "~/env";
import { useTheme } from "~/libs/theme-provider";
import ThemeToggleButton, { nextThemeLabelKey } from "./theme-toggle-button";

/**
 * The round glass control every button in the pill wears — the four here, the
 * menu trigger and the search field's collapsed form. Exported so the three
 * files agree on one string rather than each restating it.
 */
export const roundControlClassName =
  "size-9 rounded-full border border-(--glass-edge) bg-(--glass) text-foreground/80 shadow-none hover:bg-(--glass-strong) hover:text-foreground";

interface NavActionsProps {
  /** `pill` is four round icon-only controls; `sheet` stacks them as labelled rows. */
  layout?: "pill" | "sheet";
}

/**
 * The four controls at the end of the pill: language, theme, and the two
 * places a reader goes next — the package on npm and the Storybook with every
 * live demo. In `sheet` layout each becomes its own `h-11` row with a visible
 * label, reusing the labels already on the pill's `aria-label`/`title` — no
 * new catalogue key. The select and the toggle keep their own control
 * unchanged; only npm/storybook grow visible text inside the same anchor.
 */
export default function NavActions({ layout = "pill" }: NavActionsProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { resolvedTheme } = useTheme();
  // The hook pages point at the hook package — the same prefix match NavLinks
  // lights the section with, so the two never disagree.
  const npmUrl =
    pathname === ROUTES.HOOKS || pathname.startsWith(`${ROUTES.HOOKS}/`)
      ? NPM_URLS.hook
      : NPM_URLS.ui;

  const links = [
    { href: npmUrl, label: t("documents.nav.npm"), Icon: Package },
    {
      href: env.PUBLIC_DOCUMENTS_STORYBOOK_URL,
      label: t("documents.nav.storybook"),
      Icon: BookMarked,
    },
  ];

  if (layout === "sheet") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex h-11 items-center gap-3 px-1">
          <Languages className="text-foreground/70 size-4.5 shrink-0" />
          <span className="text-foreground/90 flex-1 text-sm font-medium">
            {t("language.placeholder")}
          </span>
          <SelectLanguage triggerClassName="h-9 w-auto gap-1.5 border-none bg-transparent px-2 shadow-none hover:bg-(--glass-strong)" />
        </div>

        <div className="flex h-11 items-center gap-3 px-1">
          <span className="text-foreground/90 flex-1 text-sm font-medium">
            {t(nextThemeLabelKey(resolvedTheme))}
          </span>
          <ThemeToggleButton className={roundControlClassName} />
        </div>

        {links.map(({ href, label, Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/85 hover:bg-(--glass-strong) hover:text-foreground flex h-11 items-center gap-3 rounded-md px-1"
          >
            <Icon className="size-4.5 shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <SelectLanguage
        compact
        triggerClassName={cn(roundControlClassName, "justify-center px-0")}
      />

      <ThemeToggleButton className={roundControlClassName} />

      {links.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            roundControlClassName,
          )}
        >
          <Icon className="size-4.5" />
        </a>
      ))}
    </div>
  );
}
