---
title: Each Component Fetches Its Own Data
impact: HIGH
impactDescription: Independent sections each fetch and skeleton themselves; a single-entity page fetches once and prop-drills — never a global spinner either way.
tags: patterns, tanstack-query, components, rendering
---

## Each Component Fetches Its Own Data

**Impact: HIGH (Progressive rendering and isolated failures instead of one all-or-nothing page)**

Build a data-heavy page from components that each own their data. There are **two shapes**, and picking
the right one per page is the whole skill:

- **Shape A — compose self-fetching sections** when a page shows *independent* slices (a feed, a
  dashboard, a settings list). The parent is almost pure layout; each section calls its own query hook and
  renders its own skeleton, so slices appear progressively and fail in isolation.
- **Shape B — one fetch for one entity** when the *whole* page is about a single record (a detail page).
  The parent fetches that entity once, gates the page with one co-located skeleton/error, and prop-drills
  the loaded entity into presentational children.

Wrong in **both** shapes: a **global** loading flag or overlay, and hoisting many *independent* reads into
the parent just to prop-drill them.

**Shape A — compose self-fetching sections:**

```tsx
// ✅ the page composes — no fetching, no prop-drilling
function HomePage() {
  return (<><FunctionGrid /><UserPanel /><PermissionPanel /></>);
}

// ✅ each section fetches on mount and renders its own states
function FunctionGrid() {
  const functionsQuery = useFunctionListQuery();
  if (functionsQuery.isLoading) return <FunctionGridSkeleton />;
  if (functionsQuery.isError) return <InlineError onRetry={functionsQuery.refetch} />;
  return <Grid items={functionsQuery.data} />;
}

// ✅ a dependent section gates with `enabled` and skeletons until its data exists — never blocks siblings
function PermissionPanel() {
  const userQuery = useUserInfoQuery();
  const permissionQuery = usePermissionByEmployeeQuery(userQuery.data?.employeeId, {
    enabled: !!userQuery.data?.employeeId,
  });
  if (permissionQuery.isLoading) return <PermissionSkeleton />;
  return <Permissions data={permissionQuery.data} />;
}
```

Sibling sections may call the same hook: React Query dedupes by key, so three sections each calling
`useUserInfoQuery()` share **one** request and **one** cache entry — do not hoist a read into the parent to
"avoid duplicate calls" (see [[patterns-parallel-fetching]]).

**Shape B — one fetch for one entity:**

```tsx
// ✅ single-entity page: one fetch, one gate, presentational children
function AdmissionDetailPage({ admissionId }: { admissionId: string }) {
  const admissionQuery = useAdmissionInfoQuery(admissionId);
  if (admissionQuery.isLoading) return <AdmissionDetailSkeleton />;
  if (admissionQuery.isError) return <InlineError onRetry={admissionQuery.refetch} />;

  const admission = admissionQuery.data;
  return (
    <>
      <PatientHeader admission={admission} />   {/* presentational — takes the loaded entity */}
      <AdmissionSummary admission={admission} />
    </>
  );
}
```

This is **not** prop-drilling to avoid — the children are pure presentation of one shared payload.
Splitting them into three queries for the *same* record would be worse.

**Incorrect (Shape A done wrong — parent fetches every slice, gates on one OR-ed flag, prop-drills):**

```tsx
// ❌ all-or-nothing: nothing renders until every independent query is done, and one slow call blanks all
function HomePage() {
  const functionsQuery = useFunctionListQuery();
  const userQuery = useUserInfoQuery();
  const permissionQuery = usePermissionByEmployeeQuery(userQuery.data?.employeeId);
  if (functionsQuery.isLoading || userQuery.isLoading || permissionQuery.isLoading) {
    return <FullScreenSkeleton />;
  }
  return (<><FunctionGrid items={functionsQuery.data} /><UserPanel user={userQuery.data} /></>);
}
```

- **Choosing:** independent slices arriving at different times → Shape A. One record the entire page is a
  view of → Shape B. A page may nest both (a Shape-B header over a Shape-A list of sub-sections).
- **Never a global loading flag or overlay** — one `isLoading` OR-ed across the page, or an app-wide
  spinner context, throws away progressive render and re-renders everything (see
  [[patterns-hooks-over-context]]). Loading is per-section (A) or one co-located gate (B), never global.
- **Decoupled children** take an `id`, a loaded entity, or nothing — so they move and reuse freely (see
  [[architecture-feature-boundaries]], [[patterns-loading-skeletons]]).

Reference: [Background Fetching Indicators](https://tanstack.com/query/latest/docs/framework/react/guides/background-fetching-indicators), [Parallel Queries](https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries)
