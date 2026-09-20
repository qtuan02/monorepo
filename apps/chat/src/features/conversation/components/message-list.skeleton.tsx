import { Skeleton } from "@monorepo/ui/components/skeleton";
import { cn } from "@monorepo/ui/utils/cn";

// Named rows rather than a `.map((_, i) => …)` index — see conversation-list.skeleton.tsx.
const ROWS = [
  { name: "first", own: false, width: "w-40" },
  { name: "second", own: false, width: "w-56" },
  { name: "third", own: true, width: "w-32" },
  { name: "fourth", own: false, width: "w-48" },
  { name: "fifth", own: true, width: "w-44" },
  { name: "sixth", own: true, width: "w-24" },
  { name: "seventh", own: false, width: "w-52" },
] as const;

export function MessageListSkeleton() {
  return (
    <div className="flex h-full flex-col justify-end gap-3 p-3">
      {ROWS.map((row) => (
        <div
          key={`message-row-${row.name}`}
          className={cn("flex", row.own ? "justify-end" : "justify-start")}
        >
          <Skeleton className={cn("h-9 rounded-2xl", row.width)} />
        </div>
      ))}
    </div>
  );
}
