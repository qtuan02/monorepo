import { Card, CardContent, CardHeader } from "@monorepo/ui/components/card";
import { Skeleton } from "@monorepo/ui/components/skeleton";

/**
 * The Suspense fallback for `SessionCard`. Same card, same rows, same heights —
 * so the swap when the session resolves causes no layout shift.
 */
export function SessionCardSkeleton() {
  return (
    <Card>
      <CardHeader className="gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-28" />
      </CardContent>
    </Card>
  );
}
