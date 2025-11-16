import { useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

const LIMIT = 5;

interface Item {
  id: number;
  price: number;
  title: string;
}

interface PaginationItem {
  limit: number;
  skip: number;
  total: number;
  products: Item[];
}

interface TypeInfiniteScroll {
  pageParams: number[];
  pages: PaginationItem[];
}

export const useInfiniteScrollQuery = () => {
  return useInfiniteQuery({
    queryKey: ["key-infinite-scroll"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        `https://dummyjson.com/products?limit=${LIMIT}&skip=${LIMIT * pageParam}&select=title,price`,
      );
      return res.json();
    },
    getNextPageParam: (lastPage, pages) => {
      const nextPage = lastPage.skip + lastPage.limit;
      return nextPage < lastPage.total ? pages.length : undefined;
    },
    initialPageParam: 0,
    select: useCallback((data: TypeInfiniteScroll) => {
      return data.pages.flatMap((page: PaginationItem) => page.products);
    }, []),
  });
};
