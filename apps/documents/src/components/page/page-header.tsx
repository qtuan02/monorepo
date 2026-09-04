import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Anything that identifies the page beside its title — a subpath badge. */
  meta?: ReactNode;
}

/** The title band every page in this site opens with. */
export function PageHeader({ title, description, meta }: PageHeaderProps) {
  return (
    <header className="border-border border-b pt-8 pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {meta}
      </div>
      {description ? (
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
          {description}
        </p>
      ) : null}
    </header>
  );
}
