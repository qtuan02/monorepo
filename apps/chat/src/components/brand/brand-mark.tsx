import { TreePalm } from "lucide-react";

import { cn } from "@monorepo/ui/utils/cn";

/** The one brand mark: the Rail and the boot Island both open with it. A palm
 * for the Islands shape — not `MessageCircle`, which is already the Chats nav icon. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-xl",
        className,
      )}
    >
      <TreePalm className="size-5" />
    </span>
  );
}
