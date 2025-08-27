import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export const useInfiniteScrollQuery = () => {
  return useInfiniteQuery({
    queryKey: ["key-infinite-scroll"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        `https://dummyjson.com/products?limit=5&skip=${5 * pageParam}&select=title,price`
      );
      return res.json();
    },
    getNextPageParam: (lastPage, pages) => {
      const nextPage = lastPage.skip + lastPage.limit;
      return nextPage < lastPage.total ? pages.length : undefined;
    },
    initialPageParam: 0,
    select: useCallback((data: any) => {
      return data.pages.flatMap((page: any) => page.products);
    }, []),
  });
};
