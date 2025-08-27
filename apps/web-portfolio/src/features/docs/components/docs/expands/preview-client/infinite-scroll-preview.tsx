"use client";

import InfiniteScrollComp from "@web/web-ui/shadcn-ui/infinite-scroll";
import { Skeleton } from "@web/web-ui/shadcn-ui/skeleton";
import { useInfiniteScrollQuery } from "~/hooks/use-infinite-scroll";

const InfiniteScrollPreview = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteScrollQuery();

  return (
    <div className="flex gap-2 max-h-56 overflow-y-auto">
      <div className="flex flex-col gap-y-2 w-full">
        {data?.map((item: any, index: number) => (
          <div
            key={index}
            className="flex flex-col border w-full rounded-lg px-6 py-2"
          >
            <span>{item.title}</span>
            <span>{item.price}</span>
          </div>
        ))}
        <InfiniteScrollComp
          isLoading={isFetchingNextPage}
          hasMore={hasNextPage}
          next={fetchNextPage}
          threshold={1}
        >
          {hasNextPage &&
            Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-full h-10 bg-gray-200 rounded-lg py-8"
              />
            ))}
        </InfiniteScrollComp>
      </div>
    </div>
  );
};

export default InfiniteScrollPreview;
