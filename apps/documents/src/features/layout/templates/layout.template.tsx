import { SidebarInset, SidebarProvider } from "@monorepo/ui/components/sidebar";

import DocsSidebar from "../components/sidebar/docs-sidebar";
import BodyTemplate from "./body.template";
import FooterTemplate from "./footer.template";
import HeaderTemplate from "./header.template";

/**
 * The app shell, and the public surface of the `layout` slice: the element of
 * the route every page nests under. It composes chrome only — this site is
 * public, so there is no access check anywhere in the tree.
 *
 * `document.title` is deliberately **not** set here. A parent's effect runs
 * after its children's, so a title written by the shell would overwrite the one
 * each page just set; every route calls `useDocumentTitle` itself instead.
 */
export default function LayoutTemplate() {
  return (
    // SidebarProvider is the flex row that gives the sidebar its own column and
    // owns the open/closed state, the mobile sheet and the ⌘B shortcut —
    // SidebarInset is the growing track beside it.
    <SidebarProvider>
      <DocsSidebar />
      <SidebarInset className="flex min-h-dvh flex-col">
        <HeaderTemplate />
        <BodyTemplate />
        <FooterTemplate />
      </SidebarInset>
    </SidebarProvider>
  );
}
