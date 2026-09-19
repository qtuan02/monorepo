import { Link } from "react-router";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

import { BrandMark } from "~/components/brand/brand-mark";
import { Island } from "~/components/island/island";
import { CurrentUserMenu } from "~/features/current-user/components/current-user-menu";
import { NavBadge } from "~/features/layout/components/nav-badge";
import ThemeToggleButton from "~/features/layout/components/theme-toggle-button";
import { useNavActiveSection } from "~/features/layout/hooks/use-nav-active-section";
import { useNavBadges } from "~/features/layout/hooks/use-nav-badges";
import { NAV_ITEMS } from "~/features/layout/nav-items";

/**
 * The desktop (`≥md`) primary nav — one Island, brand mark on top, three
 * destinations, theme toggle and the current-user menu at the bottom (brief
 * §3.1). Below `md` this is not rendered at all; `BottomNav` takes over
 * (see layout.template.tsx).
 */
export default function NavRail() {
  const active = useNavActiveSection();
  const badges = useNavBadges();

  return (
    <Island className="flex w-16 shrink-0 flex-col items-center gap-2 py-4">
      <BrandMark />
      <TooltipProvider delay={200}>
        <nav
          aria-label="Primary"
          className="flex flex-1 flex-col items-center gap-1"
        >
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.key}>
              <TooltipTrigger
                render={
                  <Link
                    to={item.to}
                    aria-current={active[item.key] ? "page" : undefined}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground relative grid size-11 place-items-center rounded-xl transition-colors",
                      active[item.key]
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="size-5" aria-hidden="true" />
                    <span className="sr-only">{item.railLabel}</span>
                    <NavBadge
                      count={badges[item.key]}
                      className="absolute -top-1 -right-1 size-4.5"
                    />
                  </Link>
                }
              />
              <TooltipContent side="right">{item.railLabel}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
      <ThemeToggleButton />
      <CurrentUserMenu compact />
    </Island>
  );
}
