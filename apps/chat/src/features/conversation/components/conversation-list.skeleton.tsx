import { Skeleton } from "@monorepo/ui/components/skeleton";

// Named rows rather than `Array.from((_, i) => …)`: a placeholder has no id
// of its own, and a key derived from the array index is the one shape the
// list-key rule bans outright.
const SKELETON_ROWS = ["first", "second", "third", "fourth", "fifth", "sixth"];

/** Matches the `Item` row's anatomy (T2) — avatar, title/time, one preview line. */
export function ConversationListSkeleton() {
  return (
    <div className="flex flex-col">
      {SKELETON_ROWS.map((row) => (
        <div
          key={`conversation-row-${row}`}
          className="mx-2 my-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-8 shrink-0" />
            </div>
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
