import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider } from "@monorepo/ui/components/sidebar";

import BottomNav from "../components/bottom-nav";
import AppHeader from "../components/header/app-header";
import BuildingScope from "../components/header/building-scope";
import AppSidebar from "../components/sidebar/app-sidebar";

/**
 * The Portal shell, and the public surface of the `layout` slice: the element
 * of the route every in-app page nests under. Chrome only — the access check
 * is the `auth` slice's `ProtectedRoute`, wrapped around the routes that need
 * it rather than around the shell, so the 404 stays reachable inside it.
 *
 * `SidebarProvider` is the flex row that gives the sidebar its column and owns
 * open/closed, the mobile sheet and ⌘B; `SidebarInset` is the track beside it.
 * The viewport is the shell's height and only the content column scrolls, as
 * in the prototype. Building scope sits in its own sticky row right below
 * the header (ADR-0011) — a shell row, not a per-page concern, so no screen
 * can render without it above it. `BottomNav` (mobile, `md:hidden`) and the
 * sidebar (desktop) are two faces of the same navigation, never both at once.
 */
export default function LayoutTemplate() {
  return (
    <SidebarProvider className="h-dvh">
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <AppHeader />
        <div className="border-border bg-background/60 sticky top-15 z-10 border-b px-4 py-2 lg:px-6 print:hidden">
          <BuildingScope />
        </div>
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="mx-auto flex max-w-7xl flex-col p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
