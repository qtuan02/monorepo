import type { ReactNode } from "react";

import NavbarTemplate from "~/features/layout/templates/navbar.template";

interface ShellLayoutProps {
  children: ReactNode;
}

/**
 * The app shell: one centred well and the dock pinned to the bottom of the
 * viewport — which since #124 also holds the language switcher, so the shell
 * draws no chrome of its own above the content.
 *
 * `max-w-6xl` (72 rem) where v1 had the 2xl reading column. The well is no
 * longer the measure of any prose: from `lg` the template splits it into a
 * 2/3 column and a 1/3 rail (`~/features/home/templates/home.template.tsx`),
 * so the wide column is ~46 rem — still under 75 characters at 15 px — and
 * below `lg` the viewport, not this cap, is what bounds the single column. A
 * 2xl well on a 1440 px screen left a margin on each side as wide as the
 * content, and squeezed three project cards into ~200 px each (#123).
 *
 * The well lives here rather than on the root layout's `<body>`, which stays a
 * plain flex column — a route outside this group (an OG image, a future
 * full-bleed screen) should not inherit the cap and 26 units of bottom padding
 * meant for the dock.
 */
export default function ShellLayout({ children }: ShellLayoutProps) {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 pb-26 md:pt-24">
        {children}
      </main>
      <NavbarTemplate />
    </>
  );
}
