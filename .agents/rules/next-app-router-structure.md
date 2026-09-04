---
title: Route Modules Stay Thin; the Slice Owns the Screen
impact: CRITICAL
impactDescription: Keeps `src/app/` a wiring layer — a screen lives in one slice folder instead of leaking into the route tree
tags: next, app-router, routing, vertical-slices, metadata
---

## Route Modules Stay Thin; the Slice Owns the Screen

**Impact: CRITICAL (Applies to Next Runtime apps — `apps/_template_next` and clones. A Vite Runtime app has no `src/app/`; its top layer is `~/pages/` — see [[routing-constants]].)**

`src/app/` is the App Router's **path table plus its framework wiring**, and nothing else. A `page.tsx`
is the Next spelling of the SPA's `~/pages/<feat>-page.tsx`: it resolves what only the framework can
give it — `params`, `searchParams`, `generateMetadata` — and renders the slice's template. The screen
itself (markup, state, copy, its own components) lives in `~/features/<feat>/` per
[[architecture-vertical-slices]], reached through that slice's public surface
([[architecture-feature-boundaries]]).

The whole route tree of `_template_next`, and what each kind of file owns:

| File | Owns |
|---|---|
| `app/[locale]/layout.tsx` | the root layout — `<html>`/`<body>`, `generateStaticParams`, the title template, the providers. There is **no** `app/layout.tsx` above it. |
| `app/[locale]/(shell)/layout.tsx` | the app shell — `<HeaderTemplate />` + `<main>` + `<FooterTemplate />`, composed from the `layout` slice |
| `app/[locale]/(shell)/page.tsx` | one screen: `generateMetadata`, the data resolution, and the slice's template |
| `app/[locale]/(shell)/not-found.tsx` | the localized 404 body — reached only when `notFound()` is actually called inside the segment |
| `app/[locale]/(shell)/[...rest]/page.tsx` | the catch-all whose entire body is `notFound()` — it exists to call it |
| `app/[locale]/error.tsx` | the segment error boundary; Next accepts only a Client Component here |
| `app/[locale]/sign-in/page.tsx` | the guest screen, **outside** `(shell)` so it renders chromeless |

**Incorrect (the screen written into the route module):**

```tsx
// ❌ app/[locale]/(shell)/page.tsx
export default async function HomePage() {
  const t = await getTranslations();
  const modules = await getHomeCatalogue();

  // ❌ markup and copy in the route tree: none of it can be reused, moved, or
  //    rendered in a test without a running App Router around it — and the
  //    literal path drifts silently, since the folder tree is not importable
  return <section><h1>{t("home.title")}</h1><a href="/vi/dashboard">…</a></section>;
}
```

**Correct (resolve, then hand off to the slice):**

```tsx
// ✅ app/[locale]/(shell)/page.tsx — metadata and the component read the SAME
//    cached loader, so the catalogue is resolved once per render
export async function generateMetadata(): Promise<Metadata> {
  const [modules, t] = await Promise.all([getHomeCatalogue(), getTranslations()]);

  return {
    title: t("home.title"),
    description: t("home.description"),
    keywords: modules.map((module) => t(`home.modules.${module.id}.title`)),
  };
}

// ✅ the whole body: resolve the data, render the slice's template
export default async function HomePage() {
  const modules = await getHomeCatalogue();

  return <HomeTemplate modules={modules} />;
}
```

## Route groups replace the SPA's guard nesting

`(shell)` is chrome, not a path segment. Sign-in sits **outside** it and therefore renders with no
header or footer — the same split the SPA makes by mounting `GuestRoute` outside `LayoutTemplate`
(see [[routing-route-guards]]). Access control is not here at all: `dashboard/page.tsx` carries no auth
check, because `proxy.ts` already decided (see [[next-proxy-guards]]). And `[locale]` wraps every route,
so its layout **is** the root layout: it owns `<html>` and validates the locale itself, which is why an
unknown locale falls back to Next's own 404 — `(shell)/not-found.tsx` is a child of the layout that threw.

## Conventions

- A `page.tsx` body is a handful of lines: awaits, then one slice template. Anything longer belongs in
  `~/features/<feat>/templates/<name>.template.tsx`.
- `params` and `searchParams` are **Promises**. Await `params` where you need the value; hand
  `searchParams` down **unawaited** so the page stays in the static shell and the slice awaits it inside
  its own `<Suspense>` (see [[next-server-vs-client-components]]).
- Every screen exports `generateMetadata`, built from the same cached loader the component uses rather
  than a second fetch (see [[next-data-fetching]]); a guarded one sets `robots: { index: false }`.
- Paths come from `~/constants/routes.ts` and are navigated with next-intl's `Link` / `redirect` /
  `getPathname`, which add the locale prefix — never a literal `/vi/...` (see [[quality-imports]]).
- `not-found.tsx` renders only when `notFound()` is called, so a tree that should 404 on unmatched paths
  needs the `[...rest]` catch-all that calls it.
- A route module never imports another route module, and `~/features` never imports from `src/app/`
  (see [[architecture-circular-dependencies]]).

Reference: [`apps/_template_next/src/app/[locale]/layout.tsx`](../../apps/_template_next/src/app/%5Blocale%5D/layout.tsx), [`apps/_template_next/src/app/[locale]/(shell)/page.tsx`](../../apps/_template_next/src/app/%5Blocale%5D/%28shell%29/page.tsx), [Next.js — Project structure](https://nextjs.org/docs/app/getting-started/project-structure), [Next.js — `layout.js`](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
