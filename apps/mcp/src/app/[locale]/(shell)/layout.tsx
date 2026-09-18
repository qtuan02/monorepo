import type { ReactNode } from "react";

import FooterTemplate from "~/features/layout/templates/footer.template";
import HeaderTemplate from "~/features/layout/templates/header.template";

interface ShellLayoutProps {
  children: ReactNode;
}

/**
 * The app shell. It is a route **group** layout, so the sign-in screen — which
 * lives outside `(shell)` — renders without a header or footer, the same split
 * the SPA template makes by mounting `GuestRoute` outside `LayoutTemplate`.
 */
export default function ShellLayout({ children }: ShellLayoutProps) {
  return (
    <>
      <HeaderTemplate />
      <main className="flex flex-1 flex-col">{children}</main>
      <FooterTemplate />
    </>
  );
}
