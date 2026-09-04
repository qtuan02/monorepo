---
title: TanStack Query v5 useInfiniteQuery Required Fields & Page Flattening
impact: HIGH
impactDescription: Prevents runtime crashes from missing initialPageParam and stale/broken pagination.
tags: tanstack-query, react, infinite-query, pagination
---

## TanStack Query v5 useInfiniteQuery Required Fields & Page Flattening

**Impact: HIGH (Prevents runtime errors and broken pagination)**

In TanStack Query v5, `useInfiniteQuery` requires two fields that were optional in v4: `initialPageParam` and `getNextPageParam`. The `queryFn` receives a `{ pageParam }` context — always destructure it and pass it to the service call. Provide explicit generic type parameters so TypeScript can infer `InfiniteData` correctly, and use the `select` option to flatten `data.pages` (handled internally by TanStack Query — no manual `useMemo`). Accept an `options` parameter so callers can tune `enabled`, `staleTime`, etc.

> Type the `options` param with `UseInfiniteQueryOptionsWrapper<TPage, Error, TFlat>` from `~/libs/query-key-factory` — it omits `queryKey`/`queryFn`/`getNextPageParam`/`initialPageParam` (the wiring the hook owns), so callers can only tune `enabled`, `staleTime`, `select`, … It mirrors `UseQueryOptionsWrapper` / `UseMutationOptionsWrapper` (see [[tanstack-key-factory]]). Still declare the explicit `useInfiniteQuery` generics so `InfiniteData` is inferred correctly.

**Incorrect:**

```typescript
// ❌ Missing initialPageParam — required in v5, throws at runtime
useInfiniteQuery({
  queryKey: patientQueryKeys.listInfinite(params),
  queryFn: ({ pageParam }) => patientService.getPatients({ query: { cursor: pageParam } }),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

// ❌ queryFn ignores pageParam — always fetches the first page, pagination is broken
useInfiniteQuery({
  queryKey: patientQueryKeys.listInfinite(params),
  queryFn: () => patientService.getPatients({}),
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  initialPageParam: undefined,
});

// ❌ getNextPageParam missing — fetchNextPage can never advance
useInfiniteQuery({
  queryKey: patientQueryKeys.listInfinite(params),
  queryFn: ({ pageParam }) => patientService.getPatients({ query: { cursor: pageParam } }),
  initialPageParam: undefined,
});

// ❌ Manual useMemo to flatten pages — unnecessary boilerplate, use `select` instead
export function usePatientsInfiniteQuery(params = {}) {
  const query = useInfiniteQuery({ /* … */ });
  const patients = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );
  return { ...query, patients };
}
```

**Correct:**

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";

import type { UseInfiniteQueryOptionsWrapper } from "~/libs/query-key-factory";

type PatientPage = { items: Patient[]; nextCursor?: number };

export const patientQueryKeys = {
  ...patientQueryKeyFactory,
  listInfinite: (params: PatientListParams = {}) => patientQueryKeyFactory.list(params),
};

// Explicit generics: <TQueryFnData, TError, TData, TQueryKey, TPageParam>
export function usePatientsInfiniteQuery(
  params: PatientListParams = {},
  options?: UseInfiniteQueryOptionsWrapper<PatientPage, Error, Patient[]>,
) {
  return useInfiniteQuery<PatientPage, Error, Patient[], readonly unknown[], number | undefined>({
    queryKey: patientQueryKeys.listInfinite(params),
    queryFn: ({ pageParam }) =>
      patientService.getPatients({ query: { ...params.query, cursor: pageParam } }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    // `select` flattens pages so the component consumes one flat array (see [[tanstack-consume-infinite]])
    select: (data) => data.pages.flatMap((page) => page.items),
    ...options,
  });
}
```

Reference: [TanStack Query v5 — Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
