import { Outlet } from "react-router";

/**
 * The page column every route renders into, and the `<main>` landmark the
 * skip link targets. Each page draws its own glass panels on the backdrop —
 * there is no shared panel here.
 *
 * `flex-1`, not `h-full`: this is the growing track of the shell's flex
 * column, which is what leaves the footer at the bottom of a short page.
 */
export default function BodyTemplate() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 sm:px-6 lg:px-8"
    >
      <Outlet />
    </main>
  );
}
