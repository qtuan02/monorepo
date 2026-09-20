import { cn } from "@monorepo/ui/utils/cn";

interface NavBadgeProps {
  count: number;
  className?: string;
}

/** The one unread-count pill, positioned differently by `NavRail` and `BottomNav` via `className`. */
export function NavBadge({ count, className }: NavBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground grid place-items-center rounded-full text-[10px] font-medium",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
