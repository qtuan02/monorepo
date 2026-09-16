"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { buttonVariants } from "@monorepo/ui/components/button";
import { Skeleton } from "@monorepo/ui/components/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

import { SelectLanguage } from "~/components/select/select-language";
import { Dock } from "~/features/layout/components/dock";
import ThemeToggleButton from "~/features/layout/components/theme-toggle-button";
import { NAVBAR_ITEMS } from "~/features/layout/constants/navbar";
import { Link } from "~/i18n/navigation";

/**
 * What every control in the dock shares: a 48px square — a tap target with
 * margin over the 44px floor — a hover that changes the background to the
 * accent wash, and a press that answers the *click*, not the cursor: the bar
 * around it sinks on hover (`dock.tsx`), so a control that sank too would
 * move twice; instead it drops one pixel while the pointer is down. `--accent`
 * is the token `src/globals.css` declares for exactly this role; the ghost
 * variant's own `bg-muted` hover is the grey it replaces. The `dark:` entry
 * is not a repeat: ghost also sets `dark:hover:bg-muted/50`, which the plain
 * `hover:bg-accent` does not out-merge, so without it the dark theme would
 * hover grey.
 */
const dockControlClassName =
  "size-12 transition-[translate,background-color] duration-100 hover:bg-accent hover:text-accent-foreground active:translate-x-px active:translate-y-px motion-reduce:transition-none dark:hover:bg-accent";

/**
 * The language switcher, drawn as a dock control: 48px tall like its
 * neighbours, no edge or shadow of its own inside a bar that has both, the
 * same accent hover and one-pixel press, monospace like every label. It
 * overrides the Select trigger's `data-[size=sm]:h-8`, `border`, `shadow-xs`
 * and the dark `bg-input` wash by the same variants, which is what lets
 * `twMerge` replace rather than stack them.
 */
const dockSelectClassName =
  "rounded-none border-0 bg-transparent px-3 font-mono text-xs shadow-none transition-[translate,background-color] duration-100 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0 active:translate-x-px active:translate-y-px data-[size=sm]:h-12 motion-reduce:transition-none dark:bg-transparent dark:hover:bg-accent";

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
 *
 * The language switcher is the fifth control (#124): it used to sit alone in
 * the top-right corner of the shell, the one piece of chrome not in the bar.
 * It reads `usePathname()` — URL data, which under `cacheComponents` a Client
 * Component may only touch inside a `<Suspense>` — so the boundary that was
 * in the shell moved here with it, fallback the trigger's footprint so the
 * bar does not resize when it resolves.
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

          <div
            aria-hidden="true"
            className="mx-1 h-8 w-0.5 self-center bg-border"
          />

          <Suspense fallback={<Skeleton className="h-12 w-28 rounded-none" />}>
            <SelectLanguage
              label={t("language.placeholder")}
              triggerClassName={dockSelectClassName}
            />
          </Suspense>
        </Dock>
      </TooltipProvider>
    </div>
  );
}
