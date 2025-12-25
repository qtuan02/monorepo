import { Skeleton } from "@monorepo/ui";

export default function SkeletonDemo() {
  return (
    <div className="flex flex-col gap-6">
      {/* Card Skeleton */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Card Skeleton</h3>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>

      {/* Text Skeleton */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Text Lines</h3>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
      </div>
    </div>
  );
}
