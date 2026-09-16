import type { ReactNode } from "react";

import { cn } from "@monorepo/ui/utils/cn";

interface PageHeaderProps {
  title: string;
  /** The title is a slug — a code identifier — so it is set in mono. */
  mono?: boolean;
  description?: string;
  /** Anything that identifies the page beside its title — a subpath badge. */
  meta?: ReactNode;
}

/** The title band every page in this site opens with. */
export function PageHeader({
  title,
  mono,
  description,
  meta,
}: PageHeaderProps) {
  return (
    <header className="border-border border-b pt-8 pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight",
            mono ? "font-mono" : "font-heading",
          )}
        >
          {title}
        </h1>
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
