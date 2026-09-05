---
title: The Route Table Is `src/routes.ts`; Route Modules Stay Thin
impact: CRITICAL
impactDescription: One config-based path table typegen can read, and a screen that lives in its slice instead of leaking into the route tree
tags: react-router, framework-mode, routing, vertical-slices, resource-routes
---

## The Route Table Is `src/routes.ts`; Route Modules Stay Thin

**Impact: CRITICAL (Applies to the React Router Runtime — `apps/_template_reactrouter` and clones. A Vite Runtime app declares its tree as JSX in `~/pages/main.tsx` — see [[routing-constants]]; a Next Runtime app has the `src/app/` folder tree instead — see [[next-app-router-structure]].)**

This Runtime is React Router 8 **framework mode**, and its path table is a single **config-based** file:
`src/routes.ts`, built from `index()` / `layout()` / `route()`. `react-router.config.ts` sets
`appDirectory: "src"` (the default is `"app"`) — the one word keeping `~/*`, the mirroring `test/` tree,
Biome's `apps/**` overrides and the Dockerfile's `import './src/env.ts'` check identical across Runtimes.

| File | Owns |
|---|---|
| `src/routes.ts` | every path, and — through its nesting — the access model |
| `src/root.tsx` | `Layout` (the `<html>` document), `App` (the `<Outlet />`), plus root `middleware` / `loader` / `ErrorBoundary` |

## The table is config-based, and its nesting is the access model

**Incorrect (assuming a file-system convention that is not installed):**

```tsx
// ❌ src/routes/reports.tsx with no entry in src/routes.ts. `@react-router/fs-routes` is
//    deliberately not installed, so nothing discovers this file: the route does not exist,
//    and the URL 404s with nothing logged anywhere.
export default function ReportsRoute() { /* … */ }
```

**Correct (`apps/_template_reactrouter/src/routes.ts` — two nested pathless layouts):**

```tsx
// ✅ outer pathless layout = the app shell; inner pathless layout = the session guard. The
//    `*` splat is the guard's SIBLING — inside the shell, outside the guard — so a mistyped
//    URL says 404 with the header around it instead of bouncing an already signed-in visitor
//    to sign-in. Sign-in and sign-out sit outside the shell: one is chromeless, one has no screen.
export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("modules/:slug", "routes/module.tsx"),
    route("about", "routes/about.tsx"),
    layout("routes/protected.tsx", [
      route("dashboard", "routes/dashboard.tsx"),
    ]),
    route("*", "routes/not-found.tsx"),
  ]),
  route("sign-in", "routes/sign-in.tsx"),
  route("sign-out", "routes/sign-out.tsx"),
] satisfies RouteConfig;
```

That nesting is asserted on the config object itself in `test/routes.test.ts`, because no unit test of any
single route module would notice a move — the splat's own assertion is that `routes/protected.tsx` is
*not* among its ancestors. What the inner layout carries is [[reactrouter-middleware-guards]].

## A route module resolves, then hands off

A route module exports only what the framework resolves — `loader`, `meta`, `action`, `middleware`,
`ErrorBoundary` — plus a default export that renders a slice template. Writing the screen into it is
the same failure as writing one into a Next `page.tsx`: none of it is reusable, and none of it renders
in a test without a router around it. Which reads belong in the `loader` is [[reactrouter-loader-vs-query]].

```tsx
// ✅ apps/_template_reactrouter/src/routes/home.tsx — the whole body of the component:
//    hand what only the framework can resolve to the slice's template. Markup, copy and state
//    belong in ~/features/<feat>/ — [[architecture-vertical-slices]], reached through the slice's
//    public surface ([[architecture-feature-boundaries]]). `routes/layout.tsx` is the same one
//    line: `return <LayoutTemplate />`.
export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  return <HomeTemplate appEnv={loaderData.appEnv} modules={loaderData.modules} />;
}
```

## `root.tsx` splits `Layout` from `App`; a resource route has no default export

React Router renders `Layout` around whichever of `App`, `ErrorBoundary` or `HydrateFallback` is
current, so a thrown error swaps the content without remounting `<html>`. That is why the providers
live in `Layout`: inside `App` the `QueryClientProvider` and the `Toaster` would unmount the moment a
route threw, and come back with an empty cache.

```tsx
// ✅ src/root.tsx — Layout owns the document AND the providers; App is the Outlet
export function Layout({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  // One client per render tree: on the server this module is shared by every request at
  // once, so a module-level one would serve one visitor's cache to the next. `language`
  // comes off the live i18next instance, never loaderData (see [[reactrouter-i18n-env]]).
  const [queryClient] = useState(getQueryClient);
  const language = i18n.resolvedLanguage ?? defaultLanguage;

  return (
    <html lang={language}>
      {/* … <head> with <Meta /> and <Links /> … */}
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <QueryClientProvider client={queryClient}>
          <Toaster>{children}</Toaster>
        </QueryClientProvider>
        {/* … <ScrollRestoration /> + <Scripts /> … */}
      </body>
    </html>
  );
}

// … `App` is `return <Outlet />` plus the `languageChanged` revalidation effect, because
//   only the router can re-run the loader a `meta` function reads ([[reactrouter-i18n-env]]).
```

`src/routes/sign-out.tsx` is a **resource route**: it exports `action` and `loader` and **no default
export**, so nothing renders and the module answers with a `Response` alone — `throw redirect(href("/"),
{ headers: { "Set-Cookie": await destroySession(session) } })`.

```tsx
// ❌ a default export turns this into a document route: the framework renders a page instead of
//    the action's Response alone, and test/routes/sign-out.test.ts's `"default" in signOut` fails.
export default function SignOutRoute() { return <p>Đang đăng xuất…</p>; }
```

## Conventions

- Every route is an entry in `src/routes.ts`. `appDirectory: "src"` and the absence of
  `@react-router/fs-routes` are both load-bearing — do not add the package to "tidy up" the table.
- The two 404 shapes are not interchangeable. The catch-all **returns** `data(null, { status: 404 })` — its
  component *is* the 404 screen, so the loader only stamps the status. `/modules/:slug` **throws** it, the
  component there being a real page; it keeps a route-level `ErrorBoundary` so the shell survives, where
  root's boundary would replace it.
- `prerender` in `react-router.config.ts` is a literal list (`["/about"]`), never `true`: `true` also emits
  an `index.html` for `/`, which `react-router-serve`'s static middleware answers before the request
  handler ever runs — the home page would silently stop being server rendered.
- A route module never imports another route module, and `~/features` / `~/libs` never import from
  `src/routes/` — `languageContext` lives in `~/libs` precisely so `entry.server` can read it without
  importing one (see [[architecture-circular-dependencies]]).
- Links and redirects go through the typed `href()` typegen builds from this table — never a literal path,
  and never a second `~/constants/routes.ts` copy, which drifts silently: a renamed route becomes a runtime
  404, not a compile error. `prerender` is the one exception, running before typegen exists (see
  [[reactrouter-typed-href]]).

Reference: [`apps/_template_reactrouter/src/routes.ts`](../../apps/_template_reactrouter/src/routes.ts), [`src/root.tsx`](../../apps/_template_reactrouter/src/root.tsx), [`src/routes/home.tsx`](../../apps/_template_reactrouter/src/routes/home.tsx), [`src/routes/sign-out.tsx`](../../apps/_template_reactrouter/src/routes/sign-out.tsx), [`test/routes.test.ts`](../../apps/_template_reactrouter/test/routes.test.ts), [ADR-0005](../../docs/adr/0005-runtime-react-router-framework-mode.md), [React Router — Routing](https://reactrouter.com/start/framework/routing), [React Router — Route Module](https://reactrouter.com/start/framework/route-module)
