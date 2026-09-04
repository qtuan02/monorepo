import { Skeleton } from "@monorepo/ui/components/skeleton";

import { THREAD_WIDTH_STYLE } from "../constants/layout";

/**
 * What the prerendered shell shows where the chat surface will be.
 *
 * It is not decoration: the runtime behind `ChatTemplate` mints message ids with
 * `Math.random()` during render, and under `cacheComponents` a Client Component
 * that reads an unstable value while prerendering fails the build outright
 * ("Next.js encountered the unstable value `Math.random()`"). A `<Suspense>`
 * boundary is the sanctioned answer — it moves that subtree out of the prerender
 * and into the client — and this is its fallback.
 *
 * Shaped like what replaces it: the model selector's bar, the welcome block, and
 * the composer, at the same widths, so nothing jumps when the runtime mounts.
 */
export function ChatSkeleton() {
  return (
    <div
      aria-hidden
      className="mx-auto flex min-h-0 w-full max-w-(--thread-max-width) flex-1 flex-col gap-4 px-4 py-2"
      style={THREAD_WIDTH_STYLE}
    >
      <Skeleton className="h-8 w-[13rem] self-end rounded-md" />

      <div className="flex flex-1 flex-col justify-center gap-3 px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-72" />
      </div>

      <div className="grid gap-2 @md:grid-cols-2">
        {["first", "second", "third", "fourth"].map((slot) => (
          <Skeleton key={slot} className="h-[4.5rem] rounded-2xl" />
        ))}
      </div>

      <Skeleton className="h-28 rounded-3xl" />
    </div>
  );
}
