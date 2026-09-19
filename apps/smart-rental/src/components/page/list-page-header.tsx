import type { ReactNode } from "react";

import { cn } from "@monorepo/ui/utils/cn";

import { HeaderActionPortal } from "./header-action-slot";

interface ListPageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
  /**
   * A list screen's create action, icon-only — portalled into `AppHeader`'s
   * slot below `md`, where the row this used to sit in is gone (round 4
   * §10 Q12). Omit it on a screen with no create action of its own.
   */
  mobileAction?: ReactNode;
}

/**
 * The title band of a list screen: `<h1>` + one line, actions on the right.
 * `AppHeader` no longer names the area from `md` up (round 4 §10 Q2), so
 * this `<h1>` is the one heading a visitor sees there; below `md` the
 * header keeps the area title instead, so the whole band goes `sr-only` —
 * still in the DOM for a screen reader, painting nothing twice.
 */
export function ListPageHeader({
  title,
  description,
  actions,
  mobileAction,
}: ListPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-md:sr-only">
        <h1 className="text-[20px] font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {actions && (
        // Below `md`, only a screen with a `mobileAction` loses this row —
        // it has the header's icon as a substitute. A screen with no
        // substitute (a month picker, "Khôi phục dữ liệu mẫu", …) keeps its
        // actions visible at every width, same as before this round.
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            mobileAction && "hidden md:flex",
          )}
        >
          {actions}
        </div>
      )}
      {mobileAction && <HeaderActionPortal>{mobileAction}</HeaderActionPortal>}
    </div>
  );
}
