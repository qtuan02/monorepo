import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { ROUTES } from "~/constants/routes";

/**
 * Placeholder for a route the template declares but does not implement yet.
 * It exists so the home launcher's cards land somewhere honest: without it every
 * card falls through to `*` and the user reads "not found" for a screen that was
 * never missing, only unbuilt. An app copied from this template replaces each
 * entry in `~/pages/main.tsx` with its real page and deletes this file.
 */
export default function ComingSoon() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 max-md:px-4">
      <h1 className="text-foreground text-3xl font-bold md:text-4xl">
        {t("comingSoon.title")}
      </h1>
      <p className="text-muted-foreground max-w-lg text-center">
        {t("comingSoon.message")}
      </p>
      <code className="bg-muted text-muted-foreground rounded px-2 py-1 text-sm">
        {location.pathname}
      </code>
      {/* A <Link> styled with `buttonVariants`, not wrapped in `Button`: Base
          UI's Button assumes a native <button>, and telling it otherwise
          (`nativeButton={false}`) stamps role="button" over the anchor's own
          link role. This navigates, so it stays a link. */}
      <Link to={ROUTES.HOME} className={cn(buttonVariants(), "mt-4")}>
        {t("comingSoon.backToHome")}
      </Link>
    </div>
  );
}
