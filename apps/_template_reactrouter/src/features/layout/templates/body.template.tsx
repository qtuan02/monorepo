import { Outlet } from "react-router";

/**
 * The page column every route renders into. It is its own template so the
 * layout's chrome and its content well can change independently — and so a
 * route-level guard (#84) can sit between the two.
 */
export default function BodyTemplate() {
  // No top margin: `HeaderTemplate` is `sticky`, which still occupies its own
  // space in the document flow — an extra margin here would double it.
  //
  // `flex-1`, not `h-full`: this is the growing track of LayoutTemplate's flex
  // column, which is what leaves the footer at the bottom of a short page.
  return (
    <main className="container mx-auto w-full flex-1 px-4 sm:px-6 lg:px-8">
      <Outlet />
    </main>
  );
}
