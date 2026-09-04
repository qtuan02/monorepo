import { Suspense } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Skeleton } from "@monorepo/ui/components/skeleton";

import brandMark from "~/assets/brand-mark.png";
import { SelectLanguage } from "~/components/select/select-language";
import { ROUTES } from "~/constants/routes";
import { Link } from "~/i18n/navigation";

/**
 * The shell's top bar. A Server Component: the only interactive part is the
 * language switcher, which is its own client island.
 */
export default function HeaderTemplate() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 right-0 left-0 z-50 bg-primary text-primary-foreground shadow-sm">
      {/* Padding must match PageHeader and PageContent exactly, or the bar's
          left/right edge drifts from the page content's at sm/lg breakpoints. */}
      <div className="container mx-auto flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          {/* A static import, not a `/public` URL string: Next reads the file's
              real dimensions at build time, so this needs no width/height and
              cannot silently 404 after a rename. */}
          <Image
            src={brandMark}
            alt=""
            aria-hidden="true"
            className="size-7 rounded-md"
            priority
          />
          <span className="font-semibold">{t("assistantAi.meta.title")}</span>
        </Link>

        <nav className="flex flex-1 items-center gap-4 text-sm">
          <Link href={ROUTES.HOME} className="hover:underline">
            {t("assistantAi.nav.chat")}
          </Link>
          <Link href={ROUTES.DASHBOARD} className="hover:underline">
            {t("assistantAi.nav.dashboard")}
          </Link>
        </nav>

        {/* The switcher reads `usePathname()` — URL data, which under
            `cacheComponents` a Client Component may only touch inside a
            `<Suspense>`. Without this the header is unprerenderable on any route
            whose URL is not fully known at build time (the catch-all 404), and
            Next answers those with an empty shell it resumes on the client. The
            fallback is the trigger's exact footprint, so nothing shifts. */}
        <Suspense fallback={<Skeleton className="h-8 w-[4.5rem] rounded-md" />}>
          <SelectLanguage triggerClassName="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/15" />
        </Suspense>
      </div>
    </header>
  );
}
