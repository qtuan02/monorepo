import { useTranslation } from "react-i18next";

import { SidebarTrigger } from "@monorepo/ui/components/sidebar";
import { TooltipProvider } from "@monorepo/ui/components/tooltip";

import { SelectLanguage } from "~/components/select/select-language";
import HeaderBrand from "../components/header/header-brand";
import HeaderExternalLinks from "../components/header/header-external-links";

export default function HeaderTemplate() {
  const { t } = useTranslation();

  return (
    // `text-primary-foreground` sits here so every control inherits it and none
    // has to restate it.
    <header className="bg-primary text-primary-foreground sticky top-0 right-0 left-0 z-50 shadow-sm">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* The catalogue lives in the sidebar, so its trigger is the first
            control in the bar — on mobile it is the only way to reach it. */}
        <SidebarTrigger
          aria-label={t("documents.nav.toggleSidebar")}
          className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
        />

        <HeaderBrand />

        <div className="flex-1" />

        {/* One provider for every tooltip in the bar — the controls are
            icon-only, so each carries its label here rather than inline. */}
        <TooltipProvider delay={200}>
          <nav className="flex items-center gap-0.5">
            <SelectLanguage
              compact
              triggerClassName="text-primary-foreground hover:bg-primary-foreground/15 focus-visible:ring-primary-foreground/50 size-9 justify-center rounded-md border-0 bg-transparent px-0 shadow-none"
            />

            <span
              aria-hidden="true"
              className="bg-primary-foreground/20 mx-1.5 h-5 w-px"
            />

            <HeaderExternalLinks />
          </nav>
        </TooltipProvider>
      </div>
    </header>
  );
}
