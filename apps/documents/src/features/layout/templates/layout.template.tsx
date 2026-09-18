import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { ROUTES } from "~/constants/routes";
import Backdrop from "../components/backdrop";
import BodyTemplate from "./body.template";
import FooterTemplate from "./footer.template";
import NavPillTemplate from "./nav-pill.template";

/**
 * The app shell, and the public surface of the `layout` slice: the element of
 * the route every page nests under. It composes chrome only — this site is
 * public, so there is no access check anywhere in the tree.
 *
 * DOM order is the reading order: skip link, nav pill, backdrop, `<main>`,
 * footer. The backdrop comes after the pill in the tree but sits behind
 * everything with `-z-10` inside this `isolate` root.
 *
 * `document.title` is deliberately **not** set here. A parent's effect runs
 * after its children's, so a title written by the shell would overwrite the one
 * each page just set; every route calls `useDocumentTitle` itself instead.
 */
export default function LayoutTemplate() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="bg-foreground text-background focus-visible:ring-ring/50 sr-only rounded-full px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus-visible:ring-[3px]"
      >
        {t("documents.nav.skipToContent")}
      </a>

      <NavPillTemplate />

      <Backdrop intensity={pathname === ROUTES.HOME ? "full" : "soft"} />

      <BodyTemplate />
      <FooterTemplate />
    </div>
  );
}
