import LayoutTemplate from "~/features/layout/templates/layout.template";

/**
 * The shell as a route module — this Runtime's spelling of the SPA's
 * `<Route element={<LayoutTemplate />}>`, and of the Next Runtime's
 * `(shell)/layout.tsx`. It is a pathless parent, so it adds no segment: every
 * child renders into `BodyTemplate`'s `<Outlet />` while the chrome around it
 * stays mounted across navigations.
 *
 * As thin as every route module here: what the screen looks like is the `layout`
 * slice's business.
 */
export default function LayoutRoute() {
  return <LayoutTemplate />;
}
