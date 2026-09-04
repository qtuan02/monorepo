---
title: Consuming Query Hooks in Components
impact: HIGH
impactDescription: Correct loading UX and cache-friendly refetching when reading server state.
tags: tanstack-query, react, hooks, components
---

## Consuming Query Hooks in Components

**Impact: HIGH (Correct loading UX and cache-friendly refetching)**

Read server state **only** through the `useXxxQuery` hooks in `~/hooks/api/<entity>.ts` — never by calling a service or `useQuery` directly (see [[tanstack-use-query]], [[architecture-features-modules]]). A query hook takes its **data arguments first and the `options` object last**. The hook already wires `queryKey`/`queryFn`, so `options` can only tune behaviour (`enabled`, `staleTime`, `select`, …) and can never override that wiring — this is what `UseQueryOptionsWrapper` guarantees (see [[tanstack-key-factory]]).

### Calling the hook

```tsx
const patientsQuery = usePatientsQuery(params);           // data argument
const detailQuery = usePatientQuery(id, { enabled: !!id }); // data argument + options (always last)
```

Gate dependent queries with `enabled` — never by calling the hook conditionally.

**Incorrect (conditional hook / bypassing the hook):**

```tsx
// ❌ A conditional or early-returned hook breaks the Rules of Hooks
if (id) {
  const { data } = usePatientQuery(id);
}

// ❌ Rebuilding the key and calling the service by hand — drifts from the factory,
//    shares no cache, no request dedupe
const { data } = useQuery({
  queryKey: ["patient", "detail", id],
  queryFn: () => patientService.getPatient(id),
});
```

**Correct (always call the hook; disable it with `enabled`):**

```tsx
const patientQuery = usePatientQuery(id, { enabled: !!id });
```

> Many hooks already AND a required id with your flag (`enabled: !!id && (options?.enabled ?? true)`), so a missing id keeps the query disabled even if you pass `enabled: true`.

### Reading state — `isLoading` vs `isFetching`

The v5 flags do not mean what they did in v4. Pick the flag that matches the UI:

| Flag | `true` when | Use it for |
|------|-------------|------------|
| `isPending` | no data is cached yet | first-ever empty state |
| `isLoading` | `isPending && isFetching` — the **first** fetch only | the initial skeleton (shows once) |
| `isFetching` | **any** fetch is in flight, incl. background refetches | a subtle "refreshing…" indicator |
| `isError` / `error` | the query failed | the error state |

**Incorrect (wrong flag for a first-load skeleton):**

```tsx
// ❌ isFetching turns true on EVERY background refetch, so the skeleton flashes each refresh
if (patientsQuery.isFetching) return <Skeleton className="h-40 w-full" />;
```

**Correct (skeleton once on first load; light indicator on later refreshes):**

```tsx
if (patientsQuery.isLoading) return <Skeleton className="h-40 w-full" />;

return (
  <>
    {patientsQuery.isFetching && <RefreshingBadge />}
    <PatientList data={patientsQuery.data} />
  </>
);
```

> `patientsQuery.data` is the typed response body the service returned — read it directly.

### Refetching — prefer `invalidateQueries` over `refetch`

After data changes, re-run a query by **invalidating its key** through the entity's `<entity>QueryKeys` factory. `invalidateQueries` marks every query matching the key stale: mounted views refetch immediately, unmounted ones refetch lazily on their next mount — so you never fire requests for views nobody is looking at.

```tsx
// ✅ Inside components, get the client from the hook
const queryClient = useQueryClient();

// ✅ Refetch everything for the entity (narrower levels exist — see [[tanstack-key-factory]])
queryClient.invalidateQueries({ queryKey: patientQueryKeys.all });
```

Use `patientQuery.refetch()` only to re-run the **single** query instance you are holding — e.g. a manual "Retry" button. It ignores staleness and touches nothing else.

**Incorrect:**

```tsx
// ❌ Inline key array drifts from the factory and silently misses the cache
queryClient.invalidateQueries({ queryKey: ["patient", "list"] });

// ❌ refetch() to refresh data other views also render — those stay stale
await patientQuery.refetch();
```

**Correct:**

```tsx
queryClient.invalidateQueries({ queryKey: patientQueryKeys.all });
```

> Get the client from `useQueryClient()` inside components. The module singleton exported from `~/libs/query-client` is only for non-React code (helpers, callbacks outside the tree).

Reference: [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation), [Background Fetching Indicators](https://tanstack.com/query/latest/docs/framework/react/guides/background-fetching-indicators)
