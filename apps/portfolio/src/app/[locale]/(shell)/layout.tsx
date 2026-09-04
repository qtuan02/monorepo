import type { ReactNode } from "react";
import { Suspense } from "react";

import { Skeleton } from "@monorepo/ui/components/skeleton";

import { SelectLanguage } from "~/components/select/select-language";
import NavbarTemplate from "~/features/layout/templates/navbar.template";

interface ShellLayoutProps {
  children: ReactNode;
}

/**
 * The app shell: one narrow reading column, a language switcher in the corner,
 * and the dock pinned to the bottom of the viewport.
 *
 * The column lives here rather than on the root layout's `<body>`, which stays a
 * plain flex column — a route outside this group (an OG image, a future
 * full-bleed screen) should not inherit a 2xl-wide well and 26 units of bottom
 * padding meant for the dock.
 */
export default function ShellLayout({ children }: ShellLayoutProps) {
  return (
    <>
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 pb-26 sm:pt-24">
        <div className="mb-6 flex justify-end">
          {/* The switcher reads `usePathname()` — URL data, which under
              `cacheComponents` a Client Component may only touch inside a
              `<Suspense>`. Without this the shell is unprerenderable on any
              route whose URL is not fully known at build time (the catch-all
              404), and Next answers those with an empty shell it resumes on the
              client. The fallback is the trigger's exact footprint, so nothing
              shifts. */}
          <Suspense
            fallback={<Skeleton className="h-8 w-[4.5rem] rounded-md" />}
          >
            <SelectLanguage />
          </Suspense>
        </div>
        {children}
      </main>
      <NavbarTemplate />
    </>
  );
}
