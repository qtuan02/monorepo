import { Outlet } from "react-router";

/**
 * The page column every route renders into.
 *
 * A `<div>`, not a `<main>`: the shell's `SidebarInset` already is the page's
 * `<main>` landmark, and a second one nested inside it would be invalid.
 */
export default function BodyTemplate() {
  // No top margin: `HeaderTemplate` is `sticky`, which still occupies its own
  // space in the document flow — an extra margin here would double it.
  //
  // `flex-1`, not `h-full`: this is the growing track of the shell's flex
  // column, which is what leaves the footer at the bottom of a short page.
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 lg:px-8">
      <Outlet />
    </div>
  );
}
