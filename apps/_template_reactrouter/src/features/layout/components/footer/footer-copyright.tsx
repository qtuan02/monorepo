import { useTranslation } from "react-i18next";

import dayjs from "@monorepo/dayjs";

export default function FooterCopyright() {
  const { t } = useTranslation();

  // `.year()` returns a number, so this stays locale-independent — no format
  // string, nothing for a language switch to leave stale. It is also stable
  // enough to server-render: unlike the header clock, the server and the
  // browser only disagree about it for a few hours every New Year's Eve, and
  // the value is not what the page is about.
  const year = dayjs().year();

  return (
    <p className="text-muted-foreground text-center sm:text-left">
      © {year} {t("common.brand")}
      <span aria-hidden="true" className="mx-1.5">
        ·
      </span>
      {t("footer.rights")}
    </p>
  );
}
