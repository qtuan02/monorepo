import { Outlet } from "react-router";

/**
 * The public surface of the `layout` slice, and the element of the route
 * every in-app page nests under. Deliberately empty for now — the real shell
 * (sidebar + bottom nav, per the source app) lands with the Session/layout
 * ticket; this skeleton only needs to give guarded and catch-all routes
 * somewhere to render.
 */
export default function LayoutTemplate() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Outlet />
    </div>
  );
}
