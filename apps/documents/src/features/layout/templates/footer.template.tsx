import { useTranslation } from "react-i18next";

import dayjs from "@monorepo/dayjs";

/**
 * One thin line — who owns the site and which build is running. No glass, no
 * viewport readout: a docs site's reader is not filing a layout bug.
 */
export default function FooterTemplate() {
  const { t } = useTranslation();

  // `.year()` returns a number, so this stays locale-independent — no format
  // string, nothing for a language switch to leave stale.
  const year = dayjs().year();

  return (
    // `mt-auto` is what pins it to the bottom on a short page — LayoutTemplate
    // is the flex column that makes that work.
    <footer className="text-muted-foreground mt-auto px-4 py-4 text-center text-xs">
      © {year} {t("documents.meta.brand")}
      <span aria-hidden="true" className="mx-1.5">
        ·
      </span>
      {t("footer.rights")}
      <span aria-hidden="true" className="mx-1.5">
        ·
      </span>
      <span className="tabular-nums">
        {t("footer.version", { version: __APP_VERSION__ })}
      </span>
    </footer>
  );
}
