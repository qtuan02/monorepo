import type { ReactNode } from "react";

import { Card } from "@monorepo/ui/components/card";
import { cn } from "@monorepo/ui/utils/cn";

interface EntityListCardProps {
  /** The hover accent strip along the top edge. */
  accentClassName?: string;
  header: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** One tile of a card grid: lifts on hover and shows a coloured top edge. */
export function EntityListCard({
  accentClassName = "from-primary/60 via-primary to-primary/60",
  header,
  content,
  footer,
  className,
}: EntityListCardProps) {
  return (
    <Card
      className={cn(
        "group relative transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-linear-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          accentClassName,
        )}
      />
      {header}
      {content}
      {footer}
    </Card>
  );
}
