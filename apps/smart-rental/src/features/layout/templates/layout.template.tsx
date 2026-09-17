import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider } from "@monorepo/ui/components/sidebar";

import AppHeader from "../components/header/app-header";
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
 * in the prototype.
 */
export default function LayoutTemplate() {
  return (
    <SidebarProvider className="h-dvh">
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <AppHeader />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex max-w-7xl flex-col p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
