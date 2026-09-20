import { useLocation } from "react-router";

import { Separator } from "@monorepo/ui/components/separator";
import { SidebarTrigger } from "@monorepo/ui/components/sidebar";

import { HEADER_ACTION_SLOT_ID } from "~/components/page/header-action-slot";
import { resolveNavigationItem } from "~/features/layout/utils/navigation";
import HeaderUserMenu from "./header-user-menu";
import NotificationPanel from "./notification-panel";
import SearchDialog from "./search-dialog";

/**
 * The bar above every screen (ADR-0011, spec #153 §3.1). From `md` up it
 * names nothing: a screen's own `<h1>` is the one heading a visitor sees
 * (round 4 §10 Q2), so this bar carries only the sidebar toggle, search,
 * notifications and the account menu. Building scope is its own row below
 * this one (`~/features/layout/templates/layout.template.tsx`), not a
 * corner control here — that shape is exactly what let seven pha-1 screens
 * "forget" it.
 *
 * Below `md` the sidebar trigger and the account menu are still off (the
 * bottom nav / its "Thêm" sheet cover them), and this bar keeps the area's
 * title — the one place it still shows, since the page's own `<h1>` goes
 * `sr-only` there (`~/components/page/list-page-header.tsx`). Next to it,
 * `#header-action-slot` is where a list screen's mobile create button
 * lands, portalled in from its own template — see
 * `~/components/page/header-action-slot.tsx`.
 */
export default function AppHeader() {
  const { pathname } = useLocation();
  const area = resolveNavigationItem(pathname);

  return (
    <header className="border-border bg-background/80 sticky top-0 z-10 flex h-15 items-center gap-3 border-b px-4 backdrop-blur-md lg:px-6 print:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground hidden md:inline-flex" />
        <Separator orientation="vertical" className="hidden h-5! md:block" />
        <p className="truncate text-sm font-semibold tracking-tight md:hidden">
          {area.title}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div id={HEADER_ACTION_SLOT_ID} className="md:hidden" />
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
