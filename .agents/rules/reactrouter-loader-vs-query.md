---
title: A Loader Owns the First HTML, TanStack Query Owns Everything After Paint
impact: HIGH
impactDescription: Put a value in the wrong path and either a crawler reads nothing or a widget refetch re-runs the whole server render; a module-level QueryClient serves one visitor's cache to the next.
tags: react-router, loader, tanstack-query, ssr, query-client, seo, hydration
---

## A Loader Owns the First HTML, TanStack Query Owns Everything After Paint

**Impact: HIGH (Applies to the React Router Runtime — `apps/_template_reactrouter` and clones. It is the same split [[next-data-fetching]] draws for the Next Runtime, reached through a `loader` instead of `"use cache"`; a Vite SPA app has no server read, so everything there is Query.)**

This Runtime has **two** ways to fetch, and choosing wrong is not a style question:

| Mechanism | Fetches | Because |
|---|---|---|
| a route module's `loader` | what the page's **content and its `meta`** are built from — the thing the URL is about | it runs on the server for the first render, so it is in the HTML before any JavaScript |
| `~/hooks/api` + TanStack Query in a component | everything **after paint** — per-visitor, short-lived, refetchable | React Query does not fetch during a server render, so the server sends the skeleton and nothing private lands in the document |

Both call the **same service singleton**, so there is one mock seam for both paths (see
[[architecture-features-modules]]) — `src/libs/http-client.ts` says so in its own words: *"the service
singleton every layer goes through — a loader on the server and a TanStack Query hook in the browser
alike"*. The test to apply: *would this value be wrong, stale, or private in a search result?* If yes
it is Query; if the URL is **about** it, it is the loader.

**Incorrect (the page's own data behind a hook, and a refetchable widget hoisted into the loader):**

```tsx
// ❌ the catalogue is what a crawler is here to read. Behind a query hook the server
//    sends an empty list and `meta` has nothing to build its keywords from — the one
//    property this Runtime was chosen for is gone.
const catalogueQuery = useGetHomeCatalogue();

// ❌ the opposite mistake: a loader's data is part of the document, so "refresh the
//    list" re-runs the server render and every other loader on the route. And on a
//    PRERENDERED route it also breaks `react-router build`, which executes a loader
//    when it prerenders — `react-router.config.ts` lists `prerender: ["/about"]`.
export async function loader() {
  return { templates: await templateService.getTemplates({ limit: 6 }) };
}
```

**Correct (`src/routes/home.tsx` — the crawler's half, in a loader that touches no backend):**

```tsx
// ✅ "a `loader` for what a crawler must read and what `meta` is built from, TanStack
//    Query in a client component for what happens after paint. One value never lives
//    in both." — the module's own comment. `HOME_CATALOGUE` is local data because a
//    Template's screens must resolve with no server running.
export function loader() {
  return { appEnv: env.PUBLIC_APP_ENV, modules: HOME_CATALOGUE };
}
```

**Correct (`src/features/dashboard/components/template-list.tsx` — the after-paint half):**

```tsx
// ✅ the same `templateService` a loader would use — one seam, two callers. It server
//    renders too (everything here does) but with no data, so the server sends the
//    skeleton and the browser fetches once it hydrates.
export default function TemplateList() {
  const { t } = useTranslation();
  const templatesQuery = useGetTemplates({ limit: 6 });

  // `isLoading`, not `isFetching`: the skeleton belongs to the first load only.
  if (templatesQuery.isLoading) return <TemplateListSkeleton />;
```

`dashboard.template.tsx` puts both on one screen on purpose: `SessionCard` is loader data because the
page is about the session, `TemplateList` fetches itself. `e2e/dashboard.e2e.ts` proves it on the raw
document — `"Nguyễn Văn A"` present, the section's static heading present, `data-slot="skeleton"`
present, and the query's **error text** absent. Not the rows' absence: with no backend in an E2E run
they would be missing from any implementation, so what tells the two paths apart is where the failure
lands — in these bytes if the read were a loader, only after the browser tries if it is a query (see
[[testing-playwright]]).

## One value, one home — no `dehydrate`, no `HydrationBoundary`

This Template ships neither, deliberately. Prefetching into a client inside a loader and hydrating it
in the component gives one value two owners and two staleness rules, and the next edit refetches on
the client something already in the HTML. Loader data is also **serialized** into the hydration
payload, so it must be serializable: `moduleIcons` is a separate `Record<HomeModuleId, IconComponent>`
joined by id, never carried in the loader's return.

## One QueryClient per render tree — `useState(getQueryClient)`, in `Layout`

`src/libs/query-client.ts` exports a **factory**, not the module-level client the Vite Template
exports, and `src/root.tsx`'s `Layout` is its only caller in `src/`.

**Incorrect (the Vite reflex, and the two ways of holding it that undo the fix):**

```tsx
// ❌ correct in the Vite Template, wrong here: on the server this module is loaded once
//    per Node process and shared by every request being rendered, so one visitor's cache
//    reaches the next visitor's HTML. Nothing fails at runtime — the symptom is data in
//    someone else's page. `test/root.test.ts` bans `new QueryClient(` anywhere in `src/`
//    except the factory, by reading every source file as text.
export const queryClient = new QueryClient({ /* … */ });

// ❌ a client built in a render body: a fresh empty cache on every re-render, so a
//    component that re-renders while fetching restarts its query forever.
function Providers({ children }) {
  const queryClient = new QueryClient();

// ❌ the provider hoisted into `App`: React Router renders `Layout` around whichever of
//    `App`, `ErrorBoundary` and `HydrateFallback` is current, so this unmounts the
//    moment a route throws and comes back with an empty cache.
export default function App() {
  const [queryClient] = useState(getQueryClient);
```

**Correct (`src/root.tsx`, inside `Layout`):**

```tsx
// ✅ the server builds one per request and throws it away, the browser keeps the one it
//    hydrated with for the life of the tab, and neither is lost when React re-runs the
//    first render after a suspend.
const [queryClient] = useState(getQueryClient);
```

## Conventions

- A loader returns serializable data only, reads server-side config freely (the build eliminates the
  export from the client bundle — see [[reactrouter-server-modules]]), and resolves with no backend
  running; the route module around it stays thin (see [[reactrouter-route-modules]]).
- Query hooks stay in `~/hooks/api/<entity>.ts` behind the key factory, unchanged from the other
  Runtimes (see [[tanstack-key-factory]], [[tanstack-consume-query]], [[patterns-loading-skeletons]]).
- `staleTime` stays **non-zero** — zero marks every query stale on mount and throws away what the
  server already resolved. `test/libs/query-client.test.ts` asserts `queries?.staleTime` is above 0.
- Writes that belong to a route (`sign-in`, `sign-out`) are `action`s and never reach the client's
  `MutationCache`; everything else goes through `~/hooks/api` and is toasted once by its global
  `onError` (see [[tanstack-use-mutation]]).
- Mock the service singleton — `vi.mock("~/libs/http-client")` — never axios and never a query hook. A
  jsdom test rendering a query-driven component uses `test/support/render.tsx`, which supplies the
  provider `Layout` gives it in the real app, with `retry: false` so an error branch is reachable.

Reference: [`src/routes/home.tsx`](../../apps/_template_reactrouter/src/routes/home.tsx), [`src/libs/query-client.ts`](../../apps/_template_reactrouter/src/libs/query-client.ts), [`src/root.tsx`](../../apps/_template_reactrouter/src/root.tsx), [`template-list.tsx`](../../apps/_template_reactrouter/src/features/dashboard/components/template-list.tsx), [`e2e/dashboard.e2e.ts`](../../apps/_template_reactrouter/e2e/dashboard.e2e.ts), [React Router — Data Loading](https://reactrouter.com/start/framework/data-loading), [TanStack Query — Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
