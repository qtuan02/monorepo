import { useTranslation } from "react-i18next";

import { GlassPanel } from "~/components/panel/glass-panel";
import { componentCatalogue, hookCatalogue } from "~/constants/docs-catalogue";

/**
 * The centred hero of the landing page, on the full backdrop: the version
 * tag, the two-line headline with the gradient second line, the lead that
 * counts both catalogues. The install capsule sits in each package's own
 * guide below, not here — the two guides are kept apart. The `<h1>` is the
 * headline — the page's name, "Bắt đầu", is the nav item and the document
 * title, not a heading a visitor reads twice.
 */
export default function Hero() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center pt-12 pb-8 text-center sm:pt-16">
      <GlassPanel className="text-muted-foreground inline-flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2 text-[13px] font-medium">
        <span
          aria-hidden="true"
          className="size-4.5 rounded-full bg-[linear-gradient(135deg,var(--aurora-cyan),var(--aurora-indigo))]"
        />
        {t("documents.home.hero.tag", { version: __APP_VERSION__ })}
      </GlassPanel>

      <h1 className="font-heading mt-5 max-w-[15ch] text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-6xl">
        {/* The space before the break is the accessible name's word gap — a
            `<br>` alone joins the two lines into one word for a reader. */}
        {t("documents.home.hero.title")} <br />
        <span className="prism-text">
          {t("documents.home.hero.titleAccent")}
        </span>
      </h1>

      <p className="text-muted-foreground mt-4 max-w-[52ch] text-lg text-pretty">
        {t("documents.home.hero.lead", {
          components: componentCatalogue.items.length,
          hooks: hookCatalogue.items.length,
        })}
      </p>
    </div>
  );
}
