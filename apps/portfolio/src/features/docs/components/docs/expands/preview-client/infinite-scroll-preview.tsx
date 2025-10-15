"use client";

import InfiniteScrollComp from "@monorepo/ui/shadcn-ui/infinite-scroll";
import { Skeleton } from "@monorepo/ui/shadcn-ui/skeleton";

import { useInfiniteScrollQuery } from "~/hooks/use-infinite-scroll";

const InfiniteScrollPreview = () => {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteScrollQuery();

  return (
    <div className="flex max-h-64 gap-2 overflow-y-auto">
      <div className="flex w-full flex-col gap-y-2">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-10 w-full rounded-lg bg-gray-200 py-8"
            />
          ))}
        {!isLoading &&
          data?.map((item, index: number) => (
            <div
              key={index}
              className="flex w-full flex-col rounded-lg border px-6 py-2"
            >
              <span>{item.title}</span>
              <span>{item.price}</span>
            </div>
          ))}
        <InfiniteScrollComp
          isLoading={isFetchingNextPage}
          hasMore={hasNextPage}
          next={fetchNextPage}
          threshold={0}
        >
          {hasNextPage &&
            Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-10 w-full rounded-lg bg-gray-200 py-8"
              />
            ))}
        </InfiniteScrollComp>
      </div>
    </div>
  );
};

export default InfiniteScrollPreview;
