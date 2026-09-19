import { Link } from "react-router";

import { cn } from "@monorepo/ui/utils/cn";

import { Island } from "~/components/island/island";
import { NavBadge } from "~/features/layout/components/nav-badge";
import { useNavActiveSection } from "~/features/layout/hooks/use-nav-active-section";
import { useNavBadges } from "~/features/layout/hooks/use-nav-badges";
import { NAV_ITEMS } from "~/features/layout/nav-items";

/**
 * The mobile (`<md`) primary nav — one Island, three destinations, no theme
 * toggle (that lives on the Rail; "Me" reaches sign-out instead — brief
 * §3.1). `layout.template.tsx` mounts this only below `md`, and only when
 * the current screen is not a Conversation/Draft — the composer owns the
 * bottom of the screen there.
 */
export default function BottomNav() {
  const active = useNavActiveSection();
  const badges = useNavBadges();

  return (
    <Island
      role="navigation"
      aria-label="Primary"
      className="flex items-center justify-around px-2 py-1.5"
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          aria-current={active[item.key] ? "page" : undefined}
          className={cn(
            "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs",
            active[item.key] ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <item.icon className="size-5" aria-hidden="true" />
          {item.bottomLabel}
          <NavBadge
            count={badges[item.key]}
            className="absolute top-0 right-[28%] size-4"
          />
        </Link>
      ))}
    </Island>
  );
}
