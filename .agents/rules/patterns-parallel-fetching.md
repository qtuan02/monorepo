---
title: Fetch Independent Data in Parallel
impact: HIGH
impactDescription: Independent reads run concurrently and render as they resolve; only genuinely dependent reads wait, gated by `enabled`.
tags: patterns, tanstack-query, data-fetching, parallel
---

## Fetch Independent Data in Parallel

**Impact: HIGH (A page is as slow as its slowest call, not the sum of all calls)**

When a page needs several pieces of data, fetch everything that is **independent** at the same time. Two
reads are independent when neither needs the other's result. TanStack Query runs side-by-side `useQuery`
hooks in parallel automatically — you never orchestrate them with `await` or `Promise.all`. Only a read
that genuinely **depends** on another should wait, and it waits by being gated with `enabled`, never by an
imperative `await` chain (see [[patterns-fetch-on-mount]]).

**Incorrect (serial `await` chain — total time is the *sum* of all calls, nothing shows until the last):**

```tsx
// ❌ each call waits for the previous; the page is frozen through all of them
const token = await authService.signIn(payload);
setAccessToken(token);
const user = await userService.getInfo();
const functions = await functionService.getList();
const permission = await permissionService.getByEmployee(user.employeeId);
```

**Correct (independent reads are parallel queries; dependent ones gate with `enabled`):**

```tsx
// ✅ both need only the token → both fire immediately, in parallel
const userQuery = useUserInfoQuery();
const functionsQuery = useFunctionListQuery();

// ✅ needs user.employeeId → stays disabled until it exists, then fires on its own (still parallel)
const employeeId = userQuery.data?.employeeId;
const permissionQuery = usePermissionQuery(employeeId, { enabled: !!employeeId });
const departmentQuery = useDepartmentQuery(employeeId, { enabled: !!employeeId });
```

A **variable** number of parallel reads → `useQueries`, one request per id, all in flight at once:

```tsx
// ✅ keys from the query-key factory, service singleton from ~/libs/http-client (see [[tanstack-key-factory]])
const results = useQueries({
  queries: ids.map((id) => ({
    queryKey: exampleQueryKeys.detail(id),
    queryFn: () => exampleService.getById(id),
  })),
});
```

- **Don't collapse independent reads into one `Promise.all` query** — a single cache entry gated on the
  slowest call, and any refetch re-fetches all of them. Give each read its own `useQuery`.
- **Don't hoist a shared query into the parent "to avoid duplicate calls."** React Query dedupes by query
  key: N siblings each calling the same hook make **one** request and share **one** cache entry. Hoisting
  it to prop-drill trades that dedupe for all-or-nothing coupling (see [[patterns-self-fetching-components]]).
- **Don't `await` a dependent read before rendering** — render now; each dependent panel skeletons itself
  until its query is enabled (see [[patterns-loading-skeletons]]).

Reference: [Parallel Queries](https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries), [Dependent Queries](https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries)
