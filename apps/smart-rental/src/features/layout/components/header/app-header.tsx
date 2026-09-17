import { useLocation } from "react-router";

import { Separator } from "@monorepo/ui/components/separator";
import { SidebarTrigger } from "@monorepo/ui/components/sidebar";

import { resolveNavigationItem } from "~/features/layout/utils/navigation";
import HeaderUserMenu from "./header-user-menu";
import NotificationPanel from "./notification-panel";
import SearchDialog from "./search-dialog";

/**
 * The bar above every screen (ADR-0011, spec #153 §3.1): sidebar toggle, the
 * area's name, then search, notifications and the account menu. The area
 * name is chrome, not the page's `<h1>` — each screen owns that, and the
 * route-tree seam asserts on it. Building scope is its own row below this
 * one (`~/features/layout/templates/layout.template.tsx`), not a corner
 * control here — that shape is exactly what let seven pha-1 screens "forget"
 * it.
 *
 * Below `md` this bar carries only the title, search and the bell (§10 row
 * 22): the sidebar trigger and the account menu move to the bottom nav /
 * its "Thêm" sheet, which is where a phone-width visitor already reaches
 * every other area.
 */
export default function AppHeader() {
  const { pathname } = useLocation();
  const area = resolveNavigationItem(pathname);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 flex h-15 items-center gap-3 border-b px-4 backdrop-blur-md lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hidden md:inline-flex" />
        <Separator orientation="vertical" className="hidden h-5! md:block" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {area.title}
          </p>
          <p className="text-muted-foreground hidden truncate text-xs sm:block">
            {area.description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <SearchDialog />
        <Separator orientation="vertical" className="h-5!" />
        <NotificationPanel />
        <div className="hidden md:block">
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}
