import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { BrandMark } from "~/components/brand/brand-mark";
import { ROUTES } from "~/constants/routes";

/**
 * The catch-all route's own screen (main.tsx — outside the guard, inside the
 * Islands shell), so it already sits on `LayoutTemplate`'s Island; this is
 * its content, not a second Island.
 */
export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <BrandMark />
      <h1 className="text-2xl font-bold">{t("chat.common.notFoundTitle")}</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        {t("chat.common.notFoundDescription")}
      </p>
      {/* A navigation link styled as a button — never `Button` itself, which
          assumes a native <button> (see .agents/rules/architecture-ui-
          primitives.md, "A link that looks like a button"). */}
      <Link
        to={ROUTES.HOME}
        className={cn(buttonVariants(), "mt-2 h-11 gap-1.5")}
      >
        {t("chat.common.backToChats")}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
