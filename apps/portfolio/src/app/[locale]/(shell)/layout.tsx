import type { ReactNode } from "react";
import { Suspense } from "react";

import { Skeleton } from "@monorepo/ui/components/skeleton";

import { SelectLanguage } from "~/components/select/select-language";
import NavbarTemplate from "~/features/layout/templates/navbar.template";

interface ShellLayoutProps {
  children: ReactNode;
}

/**
 * The app shell: one centred well, a language switcher in the corner, and the
 * dock pinned to the bottom of the viewport.
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 pb-26 sm:pt-24">
        <div className="mb-6 flex justify-end print:hidden">
          {/* The switcher reads `usePathname()` — URL data, which under
              `cacheComponents` a Client Component may only touch inside a
              `<Suspense>`. Without this the shell is unprerenderable on any
              route whose URL is not fully known at build time (the catch-all
              404), and Next answers those with an empty shell it resumes on the
              client. The fallback is the trigger's exact footprint, so nothing
              shifts. */}
          <Suspense fallback={<Skeleton className="h-8 w-[4.5rem]" />}>
            <SelectLanguage />
          </Suspense>
        </div>
        {children}
      </main>
      <NavbarTemplate />
    </>
  );
}
