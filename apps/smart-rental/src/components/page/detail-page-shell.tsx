import type { ReactNode } from "react";

import { PageBackButton } from "~/components/navigation/page-back-button";

interface DetailPageShellProps {
  /**
   * The screen's name. The prototype's detail screens carry no visible heading
   * (the entity's own name is the title), so this one is for screen readers and
   * for the route-tree seam test, which asserts an `<h1>` per route.
   */
  title: string;
  /** Where "Quay lại" goes; defaults to one step back in history. */
  backTo?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DetailPageShell({
  title,
  backTo,
  actions,
  children,
}: DetailPageShellProps) {
  return (
    <div className="space-y-6">
      <h1 className="sr-only">{title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PageBackButton to={backTo} />
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
