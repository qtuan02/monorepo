import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import BodyTemplate from "./body.template";
import FooterTemplate from "./footer.template";
import HeaderTemplate from "./header.template";

/**
 * The app shell, and the public surface of the `layout` slice: the element of
 * the route every in-app page nests under. It composes chrome only — the access
 * check is the `auth` slice's `ProtectedRoute`, wrapped around the routes that
 * need it rather than around the whole shell.
 */
export default function LayoutTemplate() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t("app.title");
  }, [t]);

  return (
    // A full-height flex column so the footer's `mt-auto` reaches the bottom of
    // the viewport on a short page instead of riding up under the content.
    <div className="flex min-h-dvh flex-col">
      <HeaderTemplate />
      <BodyTemplate />
      <FooterTemplate />
    </div>
  );
}
