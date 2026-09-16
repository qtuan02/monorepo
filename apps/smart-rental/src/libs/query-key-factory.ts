import type {
  InfiniteData,
  QueryKey,
  QueryOptions,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

export interface QueryKeyDefinition<
  TKey,
  TListQuery = unknown,
  TDetailQuery = string,
> {
  all: readonly [TKey];
  lists: () => readonly [...QueryKeyDefinition<TKey>["all"], "list"];
  list: (
    query?: TListQuery,
  ) =>
    | readonly [...ReturnType<QueryKeyDefinition<TKey>["lists"]>]
    | readonly [
        ...ReturnType<QueryKeyDefinition<TKey>["lists"]>,
        { query: TListQuery },
      ];
  details: () => readonly [...QueryKeyDefinition<TKey>["all"], "detail"];
  detail: (
    id: TDetailQuery,
    query?: TListQuery,
  ) =>
    | readonly [
        ...ReturnType<QueryKeyDefinition<TKey>["details"]>,
        TDetailQuery,
      ]
    | readonly [
        ...ReturnType<QueryKeyDefinition<TKey>["details"]>,
        TDetailQuery,
        { query: TListQuery },
      ];
}

export type UseQueryOptionsWrapper<
  // Return type of queryFn
  TQueryFn = unknown,
  // Type thrown in case the queryFn rejects
  E = Error,
  TQueryFnResult = TQueryFn,
  // Query key type
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  UseQueryOptions<TQueryFn, E, TQueryFnResult, TQueryKey>,
  "queryKey" | "queryFn"
>;

export type UseOptionsWrapper<
  // Return type of queryFn
  TQueryFn = unknown,
  // Type thrown in case the queryFn rejects
  E = Error,
  // Query key type
  TQueryKey extends QueryKey = QueryKey,
> = QueryOptions<TQueryFn, E, TQueryFn, TQueryKey>;

export type UseMutationOptionsWrapper<
  TVariables = void,
  TData = unknown,
  TError = Error,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationFn" | "mutationKey"
>;

export type UseInfiniteQueryOptionsWrapper<
  // Type of a single page returned by queryFn
  TQueryFnData = unknown,
  // Type thrown in case the queryFn rejects
  TError = Error,
  // Type the hook exposes (usually the flattened list after `select`)
  TData = InfiniteData<TQueryFnData>,
  // Query key type
  TQueryKey extends QueryKey = QueryKey,
  // Type of the page-param cursor
  TPageParam = unknown,
> = Omit<
  UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>,
  "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
>;

/**
 * `const T` infers the literal type from the argument, so the entity name is
 * written once: `queryKeysFactory("patient")`, not
 * `queryKeysFactory<"patient">("patient")` — a spelling where the two halves can
 * drift apart and silently split the cache in two.
 */
export const queryKeysFactory = <
  const T extends string,
  TListQueryType = unknown,
  TDetailQueryType = string,
>(
  globalKey: T,
) => {
  const queryKeyFactory: QueryKeyDefinition<
    T,
    TListQueryType,
    TDetailQueryType
  > = {
    all: [globalKey],
    lists: () => [...queryKeyFactory.all, "list"],
    list: (query?: TListQueryType) =>
      query === undefined
        ? queryKeyFactory.lists()
        : [...queryKeyFactory.lists(), { query }],
    details: () => [...queryKeyFactory.all, "detail"],
    detail: (id: TDetailQueryType, query?: TListQueryType) =>
      query === undefined
        ? [...queryKeyFactory.details(), id]
        : [...queryKeyFactory.details(), id, { query }],
  };
  return queryKeyFactory;
};
