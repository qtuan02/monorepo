import { MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@monorepo/ui/components/sheet";
import { cn } from "@monorepo/ui/utils/cn";

import {
  bottomNavItems,
  moreNavSections,
} from "~/features/layout/constants/navigation";
import { isNavigationItemActive } from "~/features/layout/utils/navigation";

/**
 * The mobile substitute for the sidebar (ADR-0011, spec #153 §10 row 22):
 * four fixed stops plus "Thêm", a Sheet over the eleven remaining areas
 * grouped as the sidebar groups them. `md:hidden` — the sidebar (and its
 * trigger in `AppHeader`) takes over from `md` up.
 */
export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Điều hướng chính"
      className="border-border bg-background fixed inset-x-0 bottom-0 z-20 flex h-16 items-stretch border-t md:hidden"
    >
      {bottomNavItems.map((item) => {
        const active = isNavigationItemActive(item, pathname);
        return (
          <Link
            key={item.path}
            to={item.path}
            data-active={active || undefined}
            className={cn(
              "text-muted-foreground flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
              active && "text-primary",
            )}
          >
            <item.icon className="size-5" />
            {item.title}
          </Link>
        );
      })}

      <Sheet>
        <SheetTrigger className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium">
          <MoreHorizontal className="size-5" />
          Thêm
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Thêm</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 px-4 pb-6">
            {moreNavSections.map((section) => (
              <div key={section.label}>
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                  {section.label}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="border-border flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center text-xs font-medium"
                    >
                      <item.icon className="text-muted-foreground size-5" />
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
