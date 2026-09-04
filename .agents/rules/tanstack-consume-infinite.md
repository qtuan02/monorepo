---
title: Consuming Infinite Query Hooks in Components
impact: MEDIUM
impactDescription: Correct pagination wiring for infinite lists; avoids duplicate request storms.
tags: tanstack-query, react, hooks, infinite-query, pagination
---

## Consuming Infinite Query Hooks in Components

**Impact: MEDIUM (Correct pagination wiring; no request storms)**

An infinite query hook is called like any query hook — data arguments first, `options` last (see [[tanstack-consume-query]]) — but you drive pagination with the extra fields it returns. Because the hook flattens `data.pages` with `select` (see [[tanstack-use-infinite]]), **`data` is already the flat item array** — do not re-flatten it in the component. Advance pages with a **"Load more" button** (or an `IntersectionObserver` sentinel) that calls `fetchNextPage()`, guarded on `hasNextPage && !isFetchingNextPage`.

| Flag | Use it for |
|------|------------|
| `isLoading` | the first-page skeleton (shows once) |
| `isFetchingNextPage` | the "Load more" button's loading state / footer spinner |
| `hasNextPage` | whether to render the button and whether to call `fetchNextPage()` |
| `isFetching` (while not fetching next page) | a subtle background-refresh indicator |

**Incorrect:**

```tsx
// ❌ Re-flattening pages the hook already flattened via `select`
const rows = listQuery.data?.pages.flatMap((p) => p.items) ?? [];

// ❌ Unguarded — fires fetchNextPage on every trigger, stacking duplicate requests
<button onClick={() => listQuery.fetchNextPage()}>Load more</button>
```

**Correct (consume the flat `data`; guard `fetchNextPage` on `hasNextPage` + `isFetchingNextPage`):**

```tsx
const listQuery = usePatientsInfiniteQuery(params, { enabled: !!params });

if (listQuery.isLoading) return <Skeleton className="h-40 w-full" />;

return (
  <div>
    {/* `data` is already flat — one item array, not pages */}
    {listQuery.data?.map((patient) => (
      <PatientRow key={patient.id} patient={patient} />
    ))}

    {listQuery.hasNextPage && (
      <button
        type="button"
        disabled={listQuery.isFetchingNextPage}
        onClick={() => {
          if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
            listQuery.fetchNextPage();
          }
        }}
      >
        {listQuery.isFetchingNextPage ? "Đang tải…" : "Tải thêm"}
      </button>
    )}
  </div>
);
```

To auto-load instead of clicking, render a sentinel `<div ref={ref} />` at the end of the list and call the same guarded `fetchNextPage()` when it scrolls into view:

```tsx
useEffect(() => {
  const node = sentinelRef.current;
  if (!node) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
      listQuery.fetchNextPage();
    }
  });
  observer.observe(node);
  return () => observer.disconnect();
}, [listQuery.hasNextPage, listQuery.isFetchingNextPage, listQuery.fetchNextPage]);
```

Reference: [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
