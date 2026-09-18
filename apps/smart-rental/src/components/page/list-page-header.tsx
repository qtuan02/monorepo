import type { ReactNode } from "react";

interface ListPageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

/** The title band of a list screen: heading + one line, actions on the right. */
export function ListPageHeader({
  title,
  description,
  actions,
}: ListPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
