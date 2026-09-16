"use client";

import { useTranslations } from "next-intl";

import { buttonVariants } from "@monorepo/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

import { Dock } from "~/features/layout/components/dock";
import ThemeToggleButton from "~/features/layout/components/theme-toggle-button";
import { NAVBAR_ITEMS } from "~/features/layout/constants/navbar";
import { Link } from "~/i18n/navigation";

/**
 * What every control in the dock shares: a 48px square — a tap target with
 * margin over the 44px floor — and a hover that changes the background to the
 * accent wash and nothing else. `--accent` is the token `src/globals.css`
 * declares for exactly this role; the ghost variant's own `bg-muted` hover is
 * the grey it replaces. The `dark:` entry is not a repeat: ghost also sets
 * `dark:hover:bg-muted/50`, which the plain `hover:bg-accent` does not
 * out-merge, so without it the dark theme would hover grey.
 */
const dockControlClassName =
  "size-12 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent";

/**
 * A link inside the dock is styled with `buttonVariants`, never rendered
 * through `Button`: Base UI's Button assumes a native `<button>` and logs on
 * every render when handed an anchor, and its `nativeButton={false}` escape
 * hatch fixes that by stamping `role="button"` over the anchor's link role.
 */
const dockLinkClassName = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  dockControlClassName,
);

/**
 * The dock pinned to the bottom of the viewport — this app's entire chrome,
 * since a CV has no header or footer bar.
 *
 * `"use client"` covers the **whole file**, which is the deliberate exception to
 * pushing the directive down to a leaf: the tooltips open on hover and the
 * theme button writes to the document, and there is no server half left to
 * protect. The dock itself is plain markup now — see `components/dock.tsx` for
 * what it stopped doing.
 *
 * The bar is one solid block over the page. The v1 dock floated over a blurred
 * fade band; a soft edge under a hard-edged page read as the one macOS remnant
 * left, so the band went with the magnification.
 */
export default function NavbarTemplate() {
  const t = useTranslations();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mb-4 flex justify-center print:hidden">
      <TooltipProvider>
        <Dock className="pointer-events-auto">
          {NAVBAR_ITEMS.map((item) => {
            const label = t(`portfolio.navbar.${item.id}`);
            const Icon = item.icon;

            return (
              <Tooltip key={item.id}>
                {/* `render`, not `asChild`: Base UI dropped Radix's Slot, and
                    an `asChild` prop here would be silently ignored — the
                    trigger would then render its own button around the link. */}
                <TooltipTrigger
                  render={
                    item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        className={dockLinkClassName}
                      >
                        <Icon className="size-4" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        aria-label={label}
                        className={dockLinkClassName}
                      >
                        <Icon className="size-4" />
                      </Link>
                    )
                  }
                />
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            );
          })}

          {/* The separator the legacy dock drew with a literal "|" character —
              a hairline of the same ink as the frame. */}
          <div
            aria-hidden="true"
            className="mx-1 h-8 w-0.5 self-center bg-border"
          />

          <Tooltip>
            <TooltipTrigger
              render={
                <ThemeToggleButton
                  label={t("portfolio.navbar.theme")}
                  className={dockControlClassName}
                />
              }
            />
            <TooltipContent>{t("portfolio.navbar.theme")}</TooltipContent>
          </Tooltip>
        </Dock>
      </TooltipProvider>
    </div>
  );
}
