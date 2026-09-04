---
title: Server Cache for What a Crawler Reads, TanStack Query for What a Visitor Does
impact: HIGH
impactDescription: In a Next app the server read owns SEO/first-paint data and TanStack Query owns everything after paint — one value never lives in both.
tags: next, app-router, cache-components, use-cache, tanstack-query, seo
---

## Server Cache for What a Crawler Reads, TanStack Query for What a Visitor Does

**Impact: HIGH (Applies to the Next Runtime — `apps/_template_next` and clones. A Vite SPA app has no server read; everything there is TanStack Query.)**

A Next app has **two** ways to fetch, and picking wrong is not a style question — it decides
whether a page is indexable, and whether a filter click re-runs the SEO fetch:

| Mechanism | Fetches | Because |
|---|---|---|
| a `"use cache"` function under `~/features/<feat>/server/` | what decides the page's **content and its `metadata`** — the entity the URL names | it must be in the HTML the server sends, before any JavaScript runs |
| `~/hooks/api` + TanStack Query in a `"use client"` component | everything **after paint** — filter, paginate, mutate, poll, anything per-visitor or short-lived | a crawler must not read it, and re-fetching it must not re-run the server read |

Both call the **same service singleton** from `~/libs/http-client`, so there is one mock seam for both
paths (see [[architecture-features-modules]]). Everything the `tanstack-*` cluster says holds
unchanged for the Query half; this rule only says **which half a given read belongs in**. The test to
apply: *would this value be wrong, stale, or private in a search result?* A per-visitor list, a
session, anything true for minutes — that is Query. The thing the URL is *about* — that is the server
read.

**Incorrect (the public page's own data behind a client hook, and a per-visitor list cached into the shell):**

```tsx
// ❌ the launcher's modules now arrive after hydration, so the server sends an
//    empty list and `generateMetadata` has nothing to build keywords from
"use client";
const modulesQuery = useGetHomeCatalogue();

// ❌ the opposite mistake: a signed-in visitor's list put in the static shell,
//    where it is prerendered once at build and served to everyone
export async function getTemplates() {
  "use cache";
  return templateService.getTemplates({ limit: 6 });
}

// ❌ Next 16 deprecated the bare one-argument form — it is a TypeScript error,
//    and it expires the entry outright instead of serving it stale-while-revalidate
revalidateTag(HOME_CATALOGUE_TAG);
```

**Correct (the page's entity is a cached server function; the interactive section owns its query):**

```ts
// ✅ src/features/home/server/home-catalogue.ts — read once per render by BOTH
//    generateMetadata() and the page component, off one cache entry
export const HOME_CATALOGUE_TAG = "home-catalogue";

export async function getHomeCatalogue(): Promise<HomeModule[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(HOME_CATALOGUE_TAG);
  return [{ id: "dashboard", href: ROUTES.DASHBOARD } /* … */];
}
```

```ts
// ✅ src/features/home/actions/refresh-home-catalogue.ts — the second argument names
//    the same `cacheLife` profile the entry was written with, which is what gives
//    stale-while-revalidate instead of a blocking cache miss
"use server";
export async function refreshHomeCatalogue(): Promise<void> {
  revalidateTag(HOME_CATALOGUE_TAG, "hours");
}
```

```tsx
// ✅ src/features/dashboard/components/template-list.tsx — arrives after paint,
//    through the same `templateService` singleton the server side uses
"use client";
export default function TemplateList() {
  const templatesQuery = useGetTemplates({ limit: 6 });
  // `isLoading`, not `isFetching`: the skeleton belongs to the first load only
  if (templatesQuery.isLoading) return <TemplateListSkeleton />;
  // …error branch, empty branch, then the list — see [[patterns-loading-skeletons]]
}
```

## One value, one home — never both

Do **not** mirror a server read into the query cache. `dehydrate` / `<HydrationBoundary>` is the shape
that does it, and this template deliberately ships neither: it would give one value two owners and two
staleness rules, and the next edit would refetch on the client something already in the HTML.

## Conventions

- A `"use cache"` function lives in `~/features/<feat>/server/<name>.ts`, calls `cacheLife` and
  `cacheTag` from `next/cache`, and returns **serializable** data only — an icon or any component
  reference is joined in by id in the slice's template, never put in the cached payload. Its result
  must also be reachable with no backend running: `next build` executes it.
- Invalidate from a `"use server"` action with `revalidateTag(tag, profile)`, passing the profile the
  entry was written with.
- Request-scoped data (`cookies()`, `searchParams`, `headers()`) is neither of the two — an async
  Server Component reads it inside a `<Suspense>` boundary, so the rest of the page still prerenders
  (see [[next-server-vs-client-components]]).
- Query hooks stay in `~/hooks/api/<entity>.ts` behind the key factory, exactly as in a Vite app (see
  [[tanstack-key-factory]], [[tanstack-consume-query]]).
- `~/libs/query-client.ts` exports `getQueryClient()`, never a module-level client: on the server the
  module is shared by every request, so one visitor's cache would be served to the next.
- The seam that proves the split is E2E: fetch the raw HTML with Playwright's `request` fixture and
  assert the server read's content is in it and the query's data is not (see [[testing-playwright]]).

Reference: [`apps/_template_next/src/features/home/server/home-catalogue.ts`](../../apps/_template_next/src/features/home/server/home-catalogue.ts), [`apps/_template_next/src/features/dashboard/components/template-list.tsx`](../../apps/_template_next/src/features/dashboard/components/template-list.tsx), [Next.js — `use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache), [Next.js — `revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
