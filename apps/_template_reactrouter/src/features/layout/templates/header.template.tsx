import { SelectLanguage } from "~/components/select/select-language";
import HeaderBrand from "../components/header/header-brand";
import HeaderClock from "../components/header/header-clock";

/**
 * The shell's top bar. The language switcher is the one control here, and it
 * needs no `<Suspense>` around it (contrast `_template_next`): this Runtime
 * negotiates the language on the server and hands it to the tree, so the trigger
 * renders with its real value in the first HTML instead of reading the URL from
 * a client hook.
 *
 * No auth control yet — ticket #84 owns the session cookie and the guard, and
 * the Vite Template's `HeaderAuthButton` reads a store this app deliberately
 * does not have. The `TooltipProvider` that wrapped that bar went with it: it
 * existed for icon-only buttons, and the switcher carries its own label.
 */
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
            leave empty, and it collapses to nothing on mobile — and to nothing
            at all until it has mounted, which is what keeps it out of the first
            HTML. */}
        <div className="flex flex-1 justify-center">
          <HeaderClock />
        </div>

        <nav className="flex items-center gap-0.5">
          <SelectLanguage
            compact
            triggerClassName="text-primary-foreground hover:bg-primary-foreground/15 focus-visible:ring-primary-foreground/50 size-9 justify-center rounded-md border-0 bg-transparent px-0 shadow-none"
          />
        </nav>
      </div>
    </header>
  );
}
