import { Outlet } from "react-router";

/**
 * The app shell, and the public surface of the `layout` slice: the element of
 * the route every in-app page nests under. A bare content column for now — the
 * Portal shell (sidebar, header, Building scope) is ticket #130.
 */
export default function LayoutTemplate() {
  return (
    <main className="container mx-auto p-6">
      <Outlet />
    </main>
  );
}
