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

import { Dock, DockIcon } from "~/features/layout/components/dock";
import ThemeToggleButton from "~/features/layout/components/theme-toggle-button";
import { NAVBAR_ITEMS } from "~/features/layout/constants/navbar";
import { Link } from "~/i18n/navigation";

/**
 * A link inside the dock is styled with `buttonVariants`, never rendered
 * through `Button`: Base UI's Button assumes a native `<button>` and logs on
 * every render when handed an anchor, and its `nativeButton={false}` escape
 * hatch fixes that by stamping `role="button"` over the anchor's link role.
 */
const dockLinkClassName = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "size-12 rounded-full",
);

/**
 * The floating dock pinned to the bottom of the viewport — this app's entire
 * chrome, since a CV has no header or footer bar.
 *
 * `"use client"` covers the **whole file**, which is the deliberate exception to
 * pushing the directive down to a leaf: the dock's magnification reads the
 * pointer, the tooltips open on hover, and the theme button writes to the
 * document. There is no server half left to protect, and `DockIcon` has to sit
 * inside the same client tree as the `Dock` whose context it reads.
 */
export default function NavbarTemplate() {
  const t = useTranslations();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-4 flex h-full max-h-14 origin-bottom">
      {/* The fade the dock floats over: a fixed band masked to transparent at
          its top edge, so the page scrolls out of view rather than under a
          hard line. */}
      <div className="fixed inset-x-0 bottom-0 h-16 w-full bg-white/50 to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background" />

      <TooltipProvider>
        <Dock className="pointer-events-auto relative z-50 mx-auto flex h-full min-h-full transform-gpu items-center bg-white/50 px-1 backdrop-blur-xs [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]">
          {NAVBAR_ITEMS.map((item) => {
            const label = t(`portfolio.navbar.${item.id}`);
            const Icon = item.icon;

            return (
              <DockIcon key={item.id}>
                <Tooltip>
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
              </DockIcon>
            );
          })}

          {/* The separator the legacy dock drew with a literal "|" character. */}
          <div
            aria-hidden="true"
            className="mx-1 h-8 w-px self-center bg-border"
          />

          <DockIcon>
            <Tooltip>
              <TooltipTrigger
                render={
                  <ThemeToggleButton label={t("portfolio.navbar.theme")} />
                }
              />
              <TooltipContent>{t("portfolio.navbar.theme")}</TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </TooltipProvider>
    </div>
  );
}
