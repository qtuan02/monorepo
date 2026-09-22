import { MessagesSquare } from "lucide-react";

import { cn } from "@monorepo/ui/utils/cn";

/** The one brand mark: the Rail, the boot Island, 404 and auth all open with
 * it. Two overlapping bubbles read as "chat" on sight — distinct from
 * `MessageCircle`, which is already the Chats nav icon. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-xl",
        className,
      )}
    >
      <MessagesSquare className="size-5" />
    </span>
  );
}
