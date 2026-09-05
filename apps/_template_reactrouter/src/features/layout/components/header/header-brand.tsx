import { HeartPulse } from "lucide-react";
import { useTranslation } from "react-i18next";
import { href, Link } from "react-router";

/**
 * `href("/")` rather than a `ROUTES` constant: this Runtime's path table is
 * `src/routes.ts`, and typegen turns it into a `href()` whose argument is a
 * union of the declared paths — so a renamed route is a compile error here,
 * which is exactly what the SPA's `ROUTES` table buys by hand.
 */
export default function HeaderBrand() {
  const { t } = useTranslation();

  return (
    <Link
      to={href("/")}
      className="group focus-visible:ring-primary-foreground/50 flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2"
    >
      <span className="bg-primary-foreground/15 ring-primary-foreground/25 group-hover:bg-primary-foreground/25 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors">
        <HeartPulse className="size-4.5" />
      </span>
      <span className="text-lg leading-none font-semibold tracking-tight">
        {t("common.brand")}
      </span>
    </Link>
  );
}
