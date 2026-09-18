import { Skeleton } from "@monorepo/ui/components/skeleton";

/**
 * Named rows rather than `Array.from((_, i) => …)`: a placeholder has no id of
 * its own, and a key derived from the array index is the one shape the list-key
 * rule bans outright.
 */
const SKELETON_ROWS = ["first", "second", "third", "fourth", "fifth", "sixth"];

/** Six rows at the real row height, so the list does not jump when data lands. */
export function TemplateListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {SKELETON_ROWS.map((row) => (
        <Skeleton
          key={`template-row-${row}`}
          className="h-10 w-full rounded-md"
        />
      ))}
    </div>
  );
}
