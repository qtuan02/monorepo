---
title: Query Key Factory Pattern
impact: HIGH
impactDescription: Prevents cache key drift; makes invalidation surgical; keeps query keys typed.
tags: tanstack-query, query-key, cache, factory
---

## Query Key Factory Pattern

**Impact: HIGH (Reliable cache invalidation and typed query keys)**

Every query key must be built through `queryKeysFactory` from [`~/libs/query-key-factory`](../../apps/_template_vite/src/libs/query-key-factory.ts). Never assemble query-key arrays inline — drift between the call site and the invalidation site silently breaks caching. Extend the factory in the same file as the hooks for that entity (`~/hooks/api/<entity>.ts`, the only layer that imports `@tanstack/react-query` — see [[architecture-features-modules]]) and re-export it as `<entity>QueryKeys`.

The factory exposes a four-level hierarchy:

| Level            | Returns                                | Use for                                |
| ---------------- | -------------------------------------- | -------------------------------------- |
| `all`            | `[entity]`                             | Invalidate everything for the entity   |
| `lists()`        | `[entity, "list"]`                     | Invalidate all list queries            |
| `list(q?)`       | `[entity, "list"]` or `[…, {query}]`   | Read/invalidate one parameterised list |
| `details()`      | `[entity, "detail"]`                   | Invalidate all detail queries          |
| `detail(id, q?)` | `[entity, "detail", id, …]`            | Read/invalidate one record             |

Custom wrappers (`getPatients`, `listInfinite`, …) **extend** the factory and forward their arguments as a single object to `factory.list({...})` / `factory.detail(id, {...})` so the cache-key shape stays stable regardless of how the hook is called.

**Incorrect:**

```typescript
// ❌ Inline key at the call site vs. a differently-shaped key at the invalidation site
//    ("patient" vs "patients") — the invalidation never matches, so the cache goes stale
useQuery({
  queryKey: ["patient", "list", page, type],
  queryFn: () => patientService.getPatients({ query: { page, type } }),
});
queryClient.invalidateQueries({ queryKey: ["patients", "list"] });

// ❌ String key instead of an array — breaks TanStack's structural key matching
useQuery({ queryKey: "patients", queryFn: fetchPatients });

// ❌ Hand-assembled detail key — drifts from the factory's detail() shape
const queryKey = ["patient", "detail", patientId, { query: { include: "profile" } }];

// ❌ Ad-hoc factory that bypasses the shared hierarchy (all / lists / details)
export const patientQueryKeys = {
  list: (page: number) => ["patient", "list", page],
};
```

**Correct:**

```typescript
import { useQuery } from "@tanstack/react-query";

import type { Patient, PatientListParams } from "@monorepo/types/patient";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import { patientService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";

// `queryKeysFactory` infers the entity name from the argument (`const T`), so it
// is written once. The explicit-generic spelling `queryKeysFactory<"patient">("patient")`
// repeats it, and the two halves can drift apart and silently split the cache.
const patientQueryKeyFactory = queryKeysFactory("patient");

export const patientQueryKeys = {
  ...patientQueryKeyFactory,
  getPatients: (params: PatientListParams) =>
    patientQueryKeyFactory.list(params),
};

// The service returns the RAW response body, so the hook is generic over the
// PAYLOAD (Patient[]) and callers read `query.data` directly.
export const usePatientsQuery = (
  params: PatientListParams,
  options?: UseQueryOptionsWrapper<Patient[]>,
) =>
  useQuery<Patient[], Error>({
    queryKey: patientQueryKeys.getPatients(params),
    queryFn: () => patientService.getPatients(params),
    ...options,
  });

queryClient.invalidateQueries({ queryKey: patientQueryKeys.all });
queryClient.invalidateQueries({ queryKey: patientQueryKeys.lists() });
queryClient.invalidateQueries({ queryKey: patientQueryKeys.detail(patientId) });
```

- One factory per entity, declared at the top of `~/hooks/api/<entity>.ts`. Naming: the variable is `<entity>QueryKeyFactory`, the public export is `<entity>QueryKeys`.
- Call it as `queryKeysFactory("<entity>")` — the entity name is inferred, never restated as an explicit type argument.
- The exported `<entity>QueryKeys` is the **only** source of query keys for that entity — components and other hooks import from it.
- Always type caller options with the wrappers from `~/libs/query-key-factory`. The file exports four: `UseQueryOptionsWrapper<T>`, `UseMutationOptionsWrapper<TVariables, TData, TError, TContext>`, `UseInfiniteQueryOptionsWrapper<…>`, and `UseOptionsWrapper` (a bare `QueryOptions` alias, rarely needed). Each omits the wiring the hook owns — `queryKey`/`queryFn`/`mutationFn`/`mutationKey` — so caller options can never override it.
- Infinite-query hooks take `UseInfiniteQueryOptionsWrapper<TPage, TError, TData, TQueryKey, TPageParam>` from the same file — it omits `queryKey`/`queryFn`/`getNextPageParam`/`initialPageParam`. Still declare the explicit `useInfiniteQuery` generics so `InfiniteData` infers correctly (see [[tanstack-use-infinite]]).
- Invalidate through the built-in levels: `all` → `lists()` / `details()` → `list(...)` / `detail(...)`. When in doubt, pick the highest level that still scopes correctly — e.g. invalidate `lists()` after a create, not `all`.
- `query.data` is the raw payload the service returns — read it directly. The HTTP client returns `response.data` as-is; there is no envelope to unwrap.

Reference: [`query-key-factory.ts`](../../apps/_template_vite/src/libs/query-key-factory.ts), [`hooks/api/template.ts`](../../apps/_template_vite/src/hooks/api/template.ts), [`packages/api/src/template/template-service.ts`](../../packages/api/src/template/template-service.ts), [TkDodo — Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
