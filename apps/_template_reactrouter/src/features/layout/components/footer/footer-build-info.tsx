import { useTranslation } from "react-i18next";

import { env } from "~/env";
import FooterViewportSize from "./footer-viewport-size";

/**
 * What a support call actually needs: which build the user is on, and how large
 * their window is when they describe what they see.
 *
 * The build is named by `PUBLIC_APP_ENV` rather than by the Vite Template's
 * `__APP_VERSION__`, which exists only because that app declares a `define` for
 * it. Reading `env` here also proves something end to end: a `PUBLIC_*` that
 * failed to parse throws while `src/env.ts` loads, so a value that reaches this
 * line is a value the schema accepted.
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
        {t("footer.version", { version: env.PUBLIC_APP_ENV })}
      </span>

      <FooterViewportSize />
    </div>
  );
}
