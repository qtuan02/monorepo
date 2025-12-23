// Loading skeleton components for Story 8.4 AC3

export function ComponentCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-gray-100 p-4 shadow-sm dark:bg-gray-800">
      {/* Thumbnail */}
      <div className="mb-3 aspect-video w-full rounded-md bg-gray-200 dark:bg-gray-700" />

      {/* Title */}
      <div className="mb-2 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />

      {/* Description */}
      <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export function HookCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-gray-100 p-4 shadow-sm dark:bg-gray-800">
      {/* Title */}
      <div className="mb-2 h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />

      {/* Description */}
      <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export function CodeBlockSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-gray-100 p-4 dark:bg-gray-800">
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export function GenericSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className || ""}`}
    />
  );
}
