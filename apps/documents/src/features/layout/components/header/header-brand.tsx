import { Boxes } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "~/constants/routes";

export default function HeaderBrand() {
  const { t } = useTranslation();

  return (
    <Link
      to={ROUTES.HOME}
      className="group focus-visible:ring-primary-foreground/50 flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2"
    >
      <span className="bg-primary-foreground/15 ring-primary-foreground/25 group-hover:bg-primary-foreground/25 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors">
        <Boxes className="size-4.5" />
      </span>
      <span className="font-mono text-base leading-none font-semibold tracking-tight">
        {t("documents.meta.brand")}
      </span>
    </Link>
  );
}
