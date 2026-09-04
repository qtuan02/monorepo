---
title: Server Component by Default, `"use client"` as a Deliberate Boundary
impact: CRITICAL
impactDescription: A `"use client"` too high in the tree ships the whole screen to the browser and takes it out of the prerendered HTML — the page stops being the thing a crawler reads
tags: next, react, rsc, server-components, boundary
---

## Server Component by Default, `"use client"` as a Deliberate Boundary

**Impact: CRITICAL (Applies to the Next Runtime — `apps/_template_next` and clones. A Vite SPA app is client-only end to end and none of this applies there.)**

Every module under `apps/_template_next/src` is a **Server Component** until something writes
`"use client"`. That directive is not a per-file preference: it marks the point where the server
stops rendering and the browser takes over, and **everything imported below it goes with it**. So it
belongs on the smallest leaf that genuinely needs a browser API — state, an effect, an event handler,
a router hook — and nowhere above it.

The whole app needs it in **five** files, each with a reason it can state: `error.tsx` and the
`internal-server-error` it renders (Next only accepts a client module as an `error.tsx`),
`select-language.tsx` (`useLocale`/`usePathname`/`useRouter`), `template-list.tsx` (TanStack Query
after paint), and `query-provider.tsx` (the boundary `QueryClientProvider` needs).

**Incorrect (the directive hoisted to a template to reach one hook):**

```tsx
// ❌ features/home/templates/home.template.tsx — the launcher is the page a crawler reads.
//    Marking it client sends the grid, its cards and lucide to the browser, drops it out of
//    the prerendered HTML, and pulls every child across the boundary with it.
"use client";

export default function HomeTemplate({ modules }: HomeTemplateProps) {
  const [query, setQuery] = useState("");
  // …
}

// ❌ and a function prop across that boundary — Next serializes props into the flight
//    payload and a function has no serialization, so it fails at render, not at build
<TemplateList onRetry={() => refetch()} />;
```

**Correct (the server renders; a client island is the leaf, and a provider wraps *around* server output):**

```tsx
// ✅ features/home/templates/home.template.tsx — a Server Component that ships no JavaScript.
//    `useTranslations()` is a hook, but a synchronous one with no browser state, so it runs
//    here; only an interactive leaf would need its own "use client".
export default function HomeTemplate({ modules }: HomeTemplateProps) {
  const t = useTranslations();
  return modules.map((module) => (
    <ModuleCard key={module.id} title={t(`home.modules.${module.id}.title`)} … />
  ));
}
```

```tsx
// ✅ features/layout/provider/query-provider.tsx — the island takes `children` as a prop, so
//    everything inside stays a Server Component unless it says otherwise. The provider is a
//    client boundary wrapped AROUND server output, not a switch that turns the tree client.
"use client";

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
```

## What may not cross, and where it has to live instead

Props are serialized into the flight payload, so a **function**, a **class instance** and a
**component reference** cannot be handed across. Two shapes in the app exist for that reason:
`moduleIcons` lives in `home.template.tsx` rather than in the cached catalogue, because
`getHomeCatalogue()` is a `"use cache"` function and a lucide component is not serializable — the
catalogue carries ids and the template joins each id to its icon (see [[next-data-fetching]]); and
`I18nProvider` is a `"use client"` module in `@monorepo/i18n` so `onError` / `getMessageFallback` —
functions — have somewhere they can be set from (see [[next-i18n-next-intl]]).

## An async Server Component cannot call a hook

`SessionCard` awaits `cookies()`, so it is `async`, so `useTranslations()` is illegal in it — use the
awaitable `getTranslations` / `getLocale` from `next-intl/server`. And because it reads the request,
`cacheComponents` requires it inside a `<Suspense>`; the boundary lives one level up, in
`dashboard.template.tsx`, with a skeleton that matches its footprint (see
[[patterns-loading-skeletons]]).

```tsx
// ✅ features/dashboard/components/session-card.tsx — awaitable APIs, not the hook
const [t, locale, cookieStore] = await Promise.all([getTranslations(), getLocale(), cookies()]);
```

## Conventions

- No `"use client"` unless the module itself needs state, an effect, an event handler, a browser API
  or a client-only hook. Reaching for one to silence an error means the boundary is in the wrong place.
- Push it **down**: extract the interactive part into its own component under the slice's
  `components/`, and leave the template a Server Component (see [[architecture-vertical-slices]]).
- A provider takes `children`; props across the boundary are data. A callback belongs inside the
  client component; a mutation belongs in a Server Action invoked by `<form action={…}>`, never an
  `onClick` (see [[next-app-router-structure]]).
- Anything reading the request or the URL — `cookies()`, `searchParams`, `usePathname()` — sits inside
  a `<Suspense>` so the rest of the screen still prerenders. Server state in a Client Component comes
  from `~/hooks/api`, never a `useEffect` fetch (see [[tanstack-consume-query]],
  [[react-effects-sync-only]]).

Reference: [`query-provider.tsx`](../../apps/_template_next/src/features/layout/provider/query-provider.tsx), [`session-card.tsx`](../../apps/_template_next/src/features/dashboard/components/session-card.tsx), [`template-list.tsx`](../../apps/_template_next/src/features/dashboard/components/template-list.tsx), [`packages/i18n/src/next-intl/provider.tsx`](../../packages/i18n/src/next-intl/provider.tsx), [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Next.js — `"use client"`](https://nextjs.org/docs/app/api-reference/directives/use-client), [next-intl — Server & Client Components](https://next-intl.dev/docs/environments/server-client-components)
