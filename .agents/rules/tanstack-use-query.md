---
title: TanStack Query v5 Object Arguments & Explicit Query Keys
impact: HIGH
impactDescription: Prevents runtime crashes and ensures predictable caching behavior in React 19.
tags: tanstack-query, react, fetch
---

## TanStack Query v5 Object Arguments & Explicit Query Keys

**Impact: HIGH (Prevents syntax errors and caching bugs)**

In TanStack Query v5, every `useQuery` call takes a single object argument — the v4 positional form throws at runtime. The `queryKey` must be an **array** so the cache engine can track dependencies structurally, and `queryFn` must be a **function reference** (`() => service.get(...)`), never an immediately-invoked call. Spread `...options` **last** so caller options can never replace `queryKey`/`queryFn`. Never fetch server state by hand with `useState` + `useEffect` — that skips caching, dedupe, and stale handling.

**Incorrect (legacy v4 syntax or manual fetching):**

```typescript
// ❌ v4 style: separate positional arguments — throws at runtime in v5
useQuery(patientQueryKeys.getPatients(params), () => patientService.getPatients(params), {
  staleTime: 1000,
});

// ❌ queryKey is a string, not an array — breaks cache invalidation
useQuery({ queryKey: "patients", queryFn: () => patientService.getPatients(params) });

// ❌ queryFn invoked immediately — this runs now and returns a Promise, not a
//    () => Promise, so TanStack Query can never re-invoke it
useQuery({
  queryKey: patientQueryKeys.getPatients(params),
  queryFn: patientService.getPatients(params),
  ...options,
});

// ❌ ...options spread BEFORE queryKey/queryFn — options can silently override them
useQuery({
  ...options,
  queryKey: patientQueryKeys.getPatients(params),
  queryFn: () => patientService.getPatients(params),
});

// ❌ Manual fetch with useEffect — no caching, dedupe, or stale handling
const [data, setData] = useState<Patient[] | null>(null);
useEffect(() => {
  patientService.getPatients(params).then(setData);
}, [params]);
```

**Correct (v5 object syntax, array queryKey, function reference for queryFn, options last):**

```typescript
const patientQueryKeyFactory = queryKeysFactory("patient");

export const patientQueryKeys = {
  ...patientQueryKeyFactory,
  getPatients: (params: PatientListParams) => patientQueryKeyFactory.list(params),
};

export function usePatientsQuery(
  params: PatientListParams,
  options?: UseQueryOptionsWrapper<Patient[]>,
) {
  return useQuery<Patient[], Error>({
    queryKey: patientQueryKeys.getPatients(params),
    queryFn: () => patientService.getPatients(params),
    ...options,
  });
}
```

Keys come from the entity's factory (see [[tanstack-key-factory]]); consumers call the hook, never `useQuery` directly (see [[tanstack-consume-query]]).

Reference: [TanStack Query v5 — Migrating to Object Arguments](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
