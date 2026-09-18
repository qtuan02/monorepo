import { useTranslations } from "next-intl";

import { env } from "~/env";

/**
 * The shell's closing bar — one slim row: who owns the app, and which build is
 * running. `mt-auto` is what pins it to the bottom on a short page; the flex
 * column that makes that work is the root layout's `<body>`.
 */
export default function FooterTemplate() {
  const t = useTranslations();

  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="container mx-auto flex flex-col items-center gap-1 px-4 py-2 text-xs sm:h-9 sm:flex-row sm:justify-between sm:gap-4 sm:px-6 sm:py-0 lg:px-8">
        {/* No `new Date().getFullYear()` here, tempting as a copyright line is:
            with `cacheComponents` on, reading the clock during a prerender is
            runtime data, so it would force this shell out of the static shell —
            or fail the build — for a number nobody reads. */}
        <span className="text-muted-foreground">
          © {t("common.brand")} — {t("footer.rights")}
        </span>
        <span className="text-muted-foreground">
          {t("footer.version", { version: env.NEXT_PUBLIC_APP_ENV })}
        </span>
      </div>
    </footer>
  );
}
