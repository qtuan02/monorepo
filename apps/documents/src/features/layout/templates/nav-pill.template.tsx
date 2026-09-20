import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import MobileMenu from "../components/nav/mobile-menu";
import NavActions, {
  roundControlClassName,
} from "../components/nav/nav-actions";
import NavBrand from "../components/nav/nav-brand";
import NavLinks from "../components/nav/nav-links";
import SearchPalette from "../components/nav/search-palette";

/**
 * Read at render, not stored: the label names the modifier the *reader's*
 * keyboard has, and `navigator.platform` is the one string that says which.
 * jsdom reports an empty platform, so tests see `Ctrl K`.
 */
function shortcutLabel() {
  return /mac|iphone|ipad/i.test(navigator.platform) ? "⌘K" : "Ctrl K";
}

/**
 * The site's one navigation surface (glossary: *Nav pill*): a glass capsule
 * stuck 1rem below the top of the viewport, centred, at most 980px wide. It
 * carries the brand, the three sections, the search field that opens the
 * palette, and the four round controls; below `md` it keeps the brand, an
 * icon-only search and a menu button, and the rest moves into the sheet. The
 * search field itself stays icon-only through tablet — it only grows into a
 * labelled field with the `Ctrl K` hint from `lg` — so the pill's three links
 * and four controls still fit one line at 768px.
 *
 * The palette's open state lives here because two things set it — the search
 * button and the keyboard — and the shortcut is one `keydown` listener on
 * `window`, the same shape `sidebar.tsx` uses for ⌘B: `metaKey || ctrlKey`
 * plus `k`, so the one handler serves both platforms.
 */
export default function NavPillTemplate() {
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);

  // A genuine external-system sync: the keyboard lives outside React.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="sticky top-4 z-40 flex justify-center px-4">
      <nav className="glass flex w-full max-w-[980px] items-center gap-1.5 rounded-full py-2 pr-2.5 pl-3">
        <div className="border-foreground/10 mr-1 border-r pr-2.5 md:pr-3">
          <NavBrand />
        </div>

        <div className="hidden md:block">
          <NavLinks layout="pill" />
        </div>

        {/* A button dressed as a search field: the real input is inside the
            palette, so this only has to open it and show the shortcut. */}
        <Button
          type="button"
          variant="ghost"
          aria-label={t("documents.nav.search.label")}
          onClick={() => setSearchOpen(true)}
          className={cn(
            roundControlClassName,
            "text-muted-foreground ml-auto px-0 lg:w-64 lg:justify-start lg:gap-2.5 lg:pr-2 lg:pl-3.5",
          )}
        >
          <SearchIcon className="size-4 shrink-0" />
          <span className="hidden truncate text-[13.5px] font-normal lg:inline">
            {t("documents.nav.search.label")}
          </span>
          <kbd className="bg-card text-foreground/80 border-foreground/15 ml-auto hidden rounded-md border px-1.5 py-0.5 font-mono text-[11px] lg:inline">
            {shortcutLabel()}
          </kbd>
        </Button>

        <div className="hidden md:block">
          <NavActions />
        </div>

        <MobileMenu />

        <SearchPalette open={searchOpen} onOpenChange={setSearchOpen} />
      </nav>
    </div>
  );
}
