import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { cn } from "@monorepo/ui/utils/cn";

import { ROUTES } from "~/constants/routes";

interface NavLinksProps {
  /** `pill` lays the three out in a row; `sheet` stacks them for the mobile menu. */
  layout: "pill" | "sheet";
}

/**
 * The three top-level pages — the only navigation the site draws; the 68 entry
 * pages are reached through the search palette. The open section is the one
 * whose path is the current one or a prefix of it, so `/components/dialog`
 * still lights *Component*; the home link matches exactly, since every path
 * starts with `/`.
 */
export default function NavLinks({ layout }: NavLinksProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const sections = [
    { path: ROUTES.HOME, label: t("documents.nav.gettingStarted") },
    { path: ROUTES.COMPONENTS, label: t("documents.nav.components") },
    { path: ROUTES.HOOKS, label: t("documents.nav.hooks") },
  ];

  return (
    <ul className={cn("flex", layout === "pill" ? "gap-1" : "flex-col gap-1")}>
      {sections.map((section) => {
        const active =
          pathname === section.path ||
          (section.path !== ROUTES.HOME &&
            pathname.startsWith(`${section.path}/`));

        return (
          <li key={section.path}>
            <Link
              to={section.path}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-visible:ring-ring/50 block rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px] motion-safe:transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/75 hover:bg-(--glass-strong) hover:text-foreground",
                layout === "sheet" && "px-4 py-2.5 text-base",
              )}
            >
              {section.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
