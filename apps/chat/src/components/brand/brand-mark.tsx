import { MessageCircle } from "lucide-react";

import { cn } from "@monorepo/ui/utils/cn";

/** The one brand mark: the Rail and the boot Island both open with it. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-xl",
        className,
      )}
    >
      <MessageCircle className="size-5" />
    </span>
  );
}
