import { Outlet } from "react-router";

import { GlassPanel } from "~/components/panel/glass-panel";

/**
 * The page column every route renders into, and the `<main>` landmark the
 * skip link targets.
 *
 * Every page sits in one shared glass panel for now — enough to read the
 * Template-era screens on the aurora until #134–#136 redraw each of them in
 * their own panels, at which point this wrapper goes.
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
      <GlassPanel className="px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </GlassPanel>
    </main>
  );
}
