---
title: Loading States as Layout-Matching Skeletons
impact: HIGH
impactDescription: Progressive, jank-free loading — a skeleton that matches the real UI instead of a spinner that shifts layout.
tags: patterns, loading, skeleton, tanstack-query, ux
---

## Loading States as Layout-Matching Skeletons

**Impact: HIGH (Progressive, jank-free loading — the page never jumps when data lands)**

A component that reads server state shows a **skeleton while it loads first**, then swaps to the real UI.
Two things make this correct: reading the right TanStack Query flag, and making the skeleton a separate
component whose shape matches the real one so nothing shifts on load.

## `isLoading` vs `isFetching` — pick the flag per UI

| Flag | `true` when | Drives |
|------|-------------|--------|
| `isLoading` | the **first-ever** fetch (no cached data yet) — fires **once** | the full skeleton |
| `isFetching` | **any** fetch, including every background refetch — fires often | a subtle "refreshing" indicator (a small spinner or badge) |

Use `isLoading` for the skeleton so it appears once on first load; using `isFetching` flashes the whole
skeleton back on every background refetch (see [[tanstack-consume-query]]).

**Incorrect (`isFetching` drives the skeleton — flashes on every refetch, blanking loaded content):**

```tsx
// ❌ the full skeleton reappears whenever the list refetches in the background
if (query.isFetching) return <SignListSkeleton />;
return <SignList data={query.data} />;
```

**Correct (`isLoading` → skeleton once; `isFetching` → a subtle, non-blocking refresh indicator):**

```tsx
if (query.isLoading) return <SignListSkeleton />;
return (
  <div>
    {query.isFetching && <RefreshingBadge />} {/* subtle — not the skeleton */}
    {rows.map((row) => <SignRow key={row.id} row={row} />)}
  </div>
);
```

## The skeleton is a separate component, early-returned

Return the skeleton **instead of** the real component — not by wrapping the real one or threading an
`isLoading` prop into it. Keep it in its own `<name>.skeleton.tsx` next to the component.

**Incorrect (skeleton woven into the component; a centered spinner that resizes the layout):**

```tsx
// ❌ one component is both loader and content; a centered spinner differs in size from the loaded UI,
//    so the page jumps when data lands
function SignList() {
  const { data = [], isLoading } = useFileSignQuery(params);
  return <div>{isLoading ? <Loader2 className="m-auto animate-spin" /> : data.map(renderRow)}</div>;
}
```

**Correct (early-return a matching, standalone skeleton built from `@monorepo/ui/components/skeleton`):**

```tsx
// ~/features/treatment/components/sign-list.tsx
function SignList() {
  const { data = [], isLoading } = useFileSignQuery(params, { enabled: !!empId });
  if (!empId || isLoading) return <SignListSkeleton />;
  return <div>{data.map((row) => <SignRow key={row.id} row={row} />)}</div>;
}

// ~/features/treatment/components/sign-list.skeleton.tsx — same rows/sizes as the real list
import { Skeleton } from "@monorepo/ui/components/skeleton";

export function SignListSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-6 pt-2">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={`sign-row-${i}`} className="flex gap-2.5 rounded-lg p-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

`Skeleton` is a `div` with `bg-accent animate-pulse rounded-md`, sized purely with `className` — so the
placeholder mirrors the loaded layout (same container, row count, and element sizes) and the swap causes
**no layout shift**.

- **File:** `<name>.skeleton.tsx`, co-located in the slice's `components/`; export a named `<Name>Skeleton`.
- **Gate with `isLoading`** (plus any data dependency, e.g. `!empId`): `if (isLoading) return <XSkeleton />`.
- **Drive background refresh with `isFetching`**, never the skeleton.
- **Never a global loading overlay/spinner** — loading is per-component, its own skeleton, never a
  page-wide flag (see [[patterns-hooks-over-context]], [[patterns-self-fetching-components]]).

Reference: [`packages/ui/src/components/skeleton.tsx`](../../packages/ui/src/components/skeleton.tsx), [Background Fetching Indicators](https://tanstack.com/query/latest/docs/framework/react/guides/background-fetching-indicators)
