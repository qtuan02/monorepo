import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ROUTES } from "~/constants/routes";

/**
 * The brand mark of the nav pill: a conic sweep through the five aurora stops
 * in a 30px rounded square, then the package scope in the display face.
 */
export default function NavBrand() {
  const { t } = useTranslation();

  return (
    <Link
      to={ROUTES.HOME}
      className="focus-visible:ring-ring/50 flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-[3px]"
    >
      <span
        aria-hidden="true"
        className="block size-7.5 rounded-[10px] bg-[conic-gradient(from_210deg,var(--aurora-indigo),var(--aurora-violet),var(--aurora-cyan),var(--aurora-pink),var(--aurora-amber),var(--aurora-indigo))] shadow-(--sh-3)"
      />
      <span className="font-heading text-[15px] leading-none font-bold tracking-tight">
        {t("documents.meta.brand")}
      </span>
    </Link>
  );
}
