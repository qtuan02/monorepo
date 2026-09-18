import type { ReactNode } from "react";

interface ListHeaderProps {
  title: string;
  description: string;
  /** The filter row — sits beside the title from `md`, under it below. */
  children?: ReactNode;
}

/**
 * The head of both list pages (mockup frame 2): a display h1 over its lead,
 * with the filter and the count aligned to the same baseline on the right.
 * No border-band — the tiles below sit straight on the backdrop.
 */
export function ListHeader({ title, description, children }: ListHeaderProps) {
  return (
    <header className="flex flex-col gap-5 pt-10 pb-6 md:flex-row md:items-end md:justify-between sm:pt-14">
      <div>
        <h1 className="font-heading text-[clamp(2rem,10.5vw,2.5rem)] leading-none font-extrabold tracking-[-0.04em] sm:text-[2.75rem]">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-[48ch] text-sm sm:text-base">
          {description}
        </p>
      </div>
      {children}
    </header>
  );
}
