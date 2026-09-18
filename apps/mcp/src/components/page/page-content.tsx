import type { ReactNode } from "react";

import { cn } from "@monorepo/ui/utils/cn";

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * The content well under `PageHeader`. The container lives inside each region
 * rather than around both, so the header band's fill still reaches the viewport
 * edges while the text lines up with the content below it.
 */
export function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={cn("container mx-auto px-4 py-8 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
