import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned controls for the page — a primary action, a filter. */
  actions?: ReactNode;
}

/**
 * The title band every in-shell page opens with. Shared rather than repeated so
 * two screens cannot disagree about where a page title sits.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
