import { useLocation } from "react-router";

import { Separator } from "@monorepo/ui/components/separator";
import { SidebarTrigger } from "@monorepo/ui/components/sidebar";

import { resolveNavigationItem } from "~/features/layout/constants/navigation";
import BuildingSelector from "./building-selector";
import NotificationPanel from "./notification-panel";
import SearchDialog from "./search-dialog";

/**
 * The bar above every screen: sidebar toggle, the area's name, then search,
 * Building scope and notifications. The area name is chrome, not the page's
 * `<h1>` — each screen owns that, and the route-tree seam asserts on it.
 */
export default function AppHeader() {
  const { pathname } = useLocation();
  const area = resolveNavigationItem(pathname);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 flex h-15 items-center gap-3 border-b px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
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

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <SearchDialog />
        <div className="rounded-lg border">
          <BuildingSelector />
        </div>
        <Separator orientation="vertical" className="h-5!" />
        <NotificationPanel />
      </div>
    </header>
  );
}
