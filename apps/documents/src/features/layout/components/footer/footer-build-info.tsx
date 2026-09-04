import { useTranslation } from "react-i18next";

import FooterViewportSize from "./footer-viewport-size";

/**
 * What a support call actually needs: which build the user is on, and how large
 * their window is when they describe what they see.
 */
export default function FooterBuildInfo() {
  const { t } = useTranslation();

  return (
    <div className="text-muted-foreground flex items-center gap-2">
      <span className="hidden sm:inline">{t("footer.support")}</span>

      <span
        aria-hidden="true"
        className="bg-border hidden h-3 w-px sm:inline-block"
      />

      <span className="tabular-nums">
        {t("footer.version", { version: __APP_VERSION__ })}
      </span>

      <span aria-hidden="true" className="bg-border h-3 w-px" />

      <FooterViewportSize />
    </div>
  );
}
