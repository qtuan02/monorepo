---
title: Route Guards Live At The Route Tree
impact: HIGH
impactDescription: Auth checks are centralized; pages stay unaware of authentication; no duplicate redirects.
tags: routing, auth, guards, protected-route, navigation
---

## Route Guards Live At The Route Tree

**Impact: HIGH (Auth-in-page logic gets duplicated across every page and is impossible to keep consistent)**

> **Scope: the Vite Runtime** — `_template_vite` and anything cloned from it. Each of the other two
> Runtimes answers the same question somewhere the server reaches first, because a guard that decides
> while rendering has already let the server send the guarded page:
>
> - the **Next Runtime** guards in `src/proxy.ts` over an `HttpOnly` cookie, with the decision as a
>   pure function under a slice's `guard/` — see [[next-proxy-guards]];
> - the **React Router Runtime** guards with route middleware under `~/features/auth/middleware/`
>   (`require-session.ts`, `guest-only.ts` in `apps/_template_reactrouter`), mounted on the pathless
>   `layout()` that wraps the guarded group in `src/routes.ts` — see [[reactrouter-middleware-guards]].
>
> All three divergences are deliberate. Do not "synchronise" any one of the three onto another, and
> never mix two shapes inside one app.

Authentication and redirect decisions belong in **wrapper routes** — `<ProtectedRoute>` (requires a session) and `<GuestRoute>` (requires *no* session) — declared once at the route tree in `~/pages/main.tsx`. A guard renders `<Outlet />` (allow), `<Navigate to={…} replace />` (block), or a loading shell while the session check is in flight. Pages never check `token`, never redirect in a `useEffect`, and never render a login redirect themselves — they render their template and trust the hierarchy.

**Where the guard files live — in the Vite Runtime:** `~/features/auth/provider/`, each
**default-exported** (the other two Runtimes file the same decision under `guard/` and `middleware/`
respectively, one home per app, never two):

| File | Guards | Blocks by redirecting to |
|---|---|---|
| `~/features/auth/provider/protected-route.tsx` → `ProtectedRoute` | every route that needs a session | `ROUTES.SIGN_IN` |
| `~/features/auth/provider/guest-route.tsx` → `GuestRoute` | the signed-out-only screens (sign-in, later forgot-password) | `ROUTES.HOME` |

Both guards read the same token and are two halves of one rule, so they belong to the slice that owns authentication — not to `layout` (which owns chrome, and whose shell hosts public routes too) and not to a shared `~/components/guard/` (which would file the `auth` slice's own access rule outside the slice). A slice's `provider/` is part of its **public surface**, alongside `templates/` (see [[architecture-feature-boundaries]]) — `~/pages/main.tsx` sits at the top of the layering, so importing one is a downward import exactly like importing a template.

**Incorrect (every page reinvents the guard):**

```tsx
// ❌ auth logic copy-pasted into each page; drifts and double-redirects
export default function PatientsPage() {
  const token = useAuthStore((s) => s.token);
  React.useEffect(() => {
    if (!token) navigate(ROUTES.SIGN_IN, { replace: true });
  }, [token]);
  if (!token) return null;
  return <PatientsTemplate />;
}
```

**Correct (guard at the route; page is one line):**

```tsx
// ✅ ~/features/auth/provider/protected-route.tsx — one guard for the whole subtree
export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to={ROUTES.SIGN_IN} replace />;
  return <Outlet />;
}
```

```tsx
// ~/pages/main.tsx — guards wrap groups of routes
<Routes>
  <Route element={<GuestRoute />}>
    <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
  </Route>

  <Route path={ROUTES.HOME} element={<LayoutTemplate />}>
    <Route element={<ProtectedRoute />}>
      <Route index element={<HomePage />} />
      <Route path={ROUTES.PATIENTS} element={<PatientsPage />} />
    </Route>

    {/* Outside the guard on purpose — a mistyped URL should say so, not bounce
        an already-signed-in user to sign-in. */}
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

## The guard is a route wrapper, not a wrapper around the layout template

`ProtectedRoute` renders `<Outlet />` and is mounted **inside** the layout route — not around `LayoutTemplate`. Wrapping the template would put the entire shell behind the check, including routes that are deliberately public (the catch-all 404). Keeping it a sibling route lets each route opt in:

```tsx
// ❌ the whole shell is now gated — even the 404 redirects to sign-in
<Route path={ROUTES.HOME} element={<ProtectedRoute><LayoutTemplate /></ProtectedRoute>}>

// ✅ the shell renders for everyone; only the routes nested under the guard are gated
<Route path={ROUTES.HOME} element={<LayoutTemplate />}>
  <Route element={<ProtectedRoute />}>
    <Route index element={<HomePage />} />
    …
  </Route>
  <Route path="*" element={<NotFound />} />
</Route>
```

- File location is fixed: `~/features/auth/provider/<name>-route.tsx`, default export, no props — the guard reads the store itself.
- `replace` is mandatory on auth redirects so the user cannot "Back" into a route they were kicked out of.
- Role-based gating adds another wrapper (`<RoleRoute allow={[…]} />`) nested inside `ProtectedRoute` — never inline `if (user.role !== "admin") return null` in a page. Permissions are **server state** read through `~/hooks/api`, never mirrored into a store.
- `LayoutTemplate` renders `<Outlet />` for shared chrome; guards for its routes mount **inside** it, and `GuestRoute` — whose screens have no chrome — mounts outside it entirely. See [[routing-constants]].

> In the template app every route inside the shell — the launcher included — sits behind `ProtectedRoute`; only the catch-all 404 is left outside it, which is what keeps the guard a route *inside* `LayoutTemplate` rather than a wrapper around it.

Reference: [`apps/_template_vite/src/features/auth/provider/protected-route.tsx`](../../apps/_template_vite/src/features/auth/provider/protected-route.tsx), [`apps/_template_vite/src/pages/main.tsx`](../../apps/_template_vite/src/pages/main.tsx), [React Router — Nested Routes](https://reactrouter.com/start/declarative/routing#nested-routes)
