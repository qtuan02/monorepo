---
title: Paths Come From the Typed href(), Not a ROUTES Constant
impact: HIGH
impactDescription: typegen turns the route table into a compile-time contract — a renamed route fails typecheck at every link site instead of 404-ing at runtime.
tags: react-router, routing, typegen, href, typecheck, turbo
---

## Paths Come From the Typed `href()`, Not a `ROUTES` Constant

**Impact: HIGH (Applies to the React Router Runtime — `apps/_template_reactrouter` and clones. A Vite SPA app keeps a hand-written `ROUTES` table instead, see [[routing-constants]]; a Next app has the `src/app/` folder tree. The three never coexist in one app.)**

This app has **no `~/constants/routes.ts`** — `src/constants/` holds only `cookies.ts`. Every path is
declared once in [`src/routes.ts`](../../apps/_template_reactrouter/src/routes.ts), and
`react-router typegen` turns that table into a `href()` whose first argument is a **union of the
declared paths**. So the guarantee the SPA's `ROUTES` constant buys by hand — rename a route, break
the build rather than the link — is here produced by the compiler from the table itself, with no
second copy to keep in step.

**Incorrect (a literal path, or the SPA's table ported over):**

```tsx
// ❌ nothing checks either string. Rename `modules/:slug` in `src/routes.ts` and both still
//    compile, ship, and 404 on the visitor — the exact failure href() exists to make impossible.
<Link to={`/modules/${module.id}`}>{title}</Link>
<Link to="/dashboard">Dashboard</Link>

// ❌ ~/constants/routes.ts ported from the Vite Runtime: a SECOND path table nothing checks
//    against `src/routes.ts`. The two drift, and the builder's output is an unchecked string again.
export const ROUTES = {
  MODULE_BY_SLUG: "/modules/:slug",
  moduleBySlugPath: (slug: string) => `/modules/${slug}`,
} as const;
```

**Correct (the typed call, static and dynamic — `header-brand.tsx` and `module-card.tsx`):**

```tsx
// ✅ src/features/layout/components/header/header-brand.tsx
<Link to={href("/")} className="group …">

// ✅ src/features/home/components/module-card.tsx — params are an OBJECT keyed by segment name
<Link
  to={href("/modules/:slug", { slug: id })}
  className="focus-visible:border-ring focus-visible:ring-ring/50 block h-full rounded-xl outline-none focus-visible:ring-[3px]"
>
```

`href()` is not a `<Link to>` helper: **every** path in the app comes from it — a redirect target
(`throw redirect(href("/"))` in `src/routes/sign-out.tsx`), a form's post target
(`<Form method="post" action={href("/sign-out")}>` in `session-card.tsx`), a middleware's bounce:

```ts
// ✅ src/features/auth/middleware/require-session.ts — the query rides along, the path does not
throw replace(`${href("/sign-in")}?${search}`);
```

So a path is **built in the module that renders it, never carried through a loader as data** — the
catalogue in `home-catalogue.ts` holds an id and a `comingSoon` flag, no path at all, and the slice
joins an id to a path on the way out for the reason `module.template.tsx` states: "a path copied into
the catalogue as data would be a string nothing checks (contrast the Next Template, whose catalogue
carries `href` because its `ROUTES` constant is plain data too)."

```ts
// ✅ src/features/home/templates/module.template.tsx
const moduleScreens: Partial<Record<HomeModuleId, string>> = {
  dashboard: href("/dashboard"),
};
```

## `./+types/<route>` resolves through `rootDirs`, and typegen must run first

Route-module types come from the same generator: `Route.LoaderArgs`, `Route.ActionArgs`,
`Route.ComponentProps`, `Route.MetaArgs`, `Route.ErrorBoundaryProps`, `Route.LinksFunction`,
`Route.MiddlewareFunction` — all off `import type { Route } from "./+types/<route>"` (see
[[reactrouter-route-modules]]). That import is not a `paths` alias:

```jsonc
// ✅ apps/_template_reactrouter/tsconfig.json — two trees merged into one virtual directory
"rootDirs": [".", "./.react-router/types"],
```

```jsonc
// ❌ on a clean clone `.react-router/types` does not exist, so EVERY `./+types/…` import is
//    unresolved and the whole app fails to typecheck
"typecheck": "tsc --noEmit"

// ✅ apps/_template_reactrouter/package.json — the order is the point
"typecheck": "react-router typegen && tsc --noEmit --emitDeclarationOnly false",
```

Because typegen is the first half of that task, its output belongs to the task's cache entry — the
app's `turbo.json` lists `".react-router/**"` beside `".cache/tsbuildinfo.json"` in `typecheck.outputs`.
Drop it and a cache hit restores the tsbuildinfo without the `+types` files it was built from.

Typegen also emits `Matches` as a **tuple**, so `matches[0].loaderData` is statically root's return
type — but typed as possibly `undefined`. That is why all six `meta` exports write
`matches[0].loaderData?.language ?? defaultLanguage`: a type-level obligation, not a branch a visitor
reaches, since on an error render the framework stops running `meta` at the boundary that caught it.

## The one literal-path exception is `prerender`

```ts
// ❌ react-router.config.ts runs BEFORE typegen exists — there is nothing typed to call yet
import { href } from "react-router";
export default { prerender: [href("/about")] } satisfies Config;

// ✅ apps/_template_reactrouter/react-router.config.ts — "the ONE place in this app a path is
//    written as a literal rather than through `href()`"
prerender: ["/about"],
```

## Conventions

- `import { href, Link } from "react-router"` — one package, no `react-router-dom` (see
  [[quality-imports]]). Adding a route = an entry in `src/routes.ts`, then `href()` at every link,
  redirect and form action; nothing else records the path.
- `href()` is **compile-time only** — at runtime it returns a plain string, which is why
  `test/routes.test.ts` pins the guarantee with a `@ts-expect-error` case (`href("/khong-ton-tai")`)
  rather than a runtime assertion: `typecheck` fails the day that stops being an error.
- A route module's own `middleware` export is typed `Route.MiddlewareFunction[]` (`routes/protected.tsx`,
  `routes/sign-in.tsx`); the guard it mounts is typed with the package's `MiddlewareFunction<Response>`,
  so it stays mountable on any route module (see [[reactrouter-middleware-guards]]).
- E2E specs are the honest exception: `page.goto("/about/")` addresses the app as a visitor types it,
  and the literal **is** the assertion (see [[testing-playwright]]).

Reference: [`src/routes.ts`](../../apps/_template_reactrouter/src/routes.ts), [`module-card.tsx`](../../apps/_template_reactrouter/src/features/home/components/module-card.tsx), [`tsconfig.json`](../../apps/_template_reactrouter/tsconfig.json), [`react-router.config.ts`](../../apps/_template_reactrouter/react-router.config.ts), [`test/routes.test.ts`](../../apps/_template_reactrouter/test/routes.test.ts), [ADR-0005](../../docs/adr/0005-runtime-react-router-framework-mode.md), [React Router — Type Safety](https://reactrouter.com/explanation/type-safety), [React Router — `href`](https://reactrouter.com/api/utils/href)
