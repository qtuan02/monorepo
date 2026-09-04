import type { ReactNode } from "react";

interface DocsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * One numbered-in-spirit block of a documentation page: a heading, an optional
 * sentence, and whatever renders the point — a snippet, a table, a grid. Every
 * page here is a stack of these, which is what keeps the templates readable.
 */
export function DocsSection({
  title,
  description,
  children,
}: DocsSectionProps) {
  return (
    <section className="border-border border-b py-8 last:border-b-0">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-muted-foreground mt-1.5 max-w-3xl text-sm">
          {description}
        </p>
      ) : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
