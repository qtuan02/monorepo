import { TooltipProvider } from "@monorepo/ui/components/tooltip";

import { SelectLanguage } from "~/components/select/select-language";
import HeaderAuthButton from "../components/header/header-auth-button";
import HeaderBrand from "../components/header/header-brand";
import HeaderClock from "../components/header/header-clock";
import HeaderNotificationButton from "../components/header/header-notification-button";

export default function HeaderTemplate() {
  return (
    // `text-primary-foreground` sits here so every control inherits it and none
    // has to restate it.
    <header className="bg-primary text-primary-foreground sticky top-0 right-0 left-0 z-50 shadow-sm">
      {/* Padding must match BodyTemplate's <main> exactly, or the header's left/
          right edge drifts from the page content's at sm/lg breakpoints. */}
      <div className="container mx-auto flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <HeaderBrand />

        {/* The clock takes the middle as its own flex zone: on a wide screen it
            fills the gap that a brand-left / controls-right bar would otherwise
            leave empty, and it collapses to nothing on mobile. */}
        <div className="flex flex-1 justify-center">
          <HeaderClock />
        </div>

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

            <HeaderNotificationButton />
            <HeaderAuthButton />
          </nav>
        </TooltipProvider>
      </div>
    </header>
  );
}
