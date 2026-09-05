---
title: The Access Decision Is Route Middleware on a Pathless Layout That Must Export a Loader
impact: CRITICAL
impactDescription: A guard mounted without a loader silently stops running on client navigations, and a pattern-matched redirectTo turns the app's own sign-in screen into an open redirect.
tags: react-router, middleware, auth, session, cookies, security, open-redirect
---

## The Access Decision Is Route Middleware on a Pathless Layout That Must Export a Loader

**Impact: CRITICAL (Applies to the React Router Runtime — `apps/_template_reactrouter` and clones. The Vite Runtime guards at the route tree with a component, the Next Runtime guards in `proxy.ts` — three homes for one decision, deliberately; see [[routing-route-guards]] and [[next-proxy-guards]].)**

The guard is a **`middleware` export on a pathless `layout()`** — `~/routes/protected` — so the route
table itself is the prefix list, and the decision runs on the server before any loader beneath it and
before a byte of the guarded page is rendered.

| File | Holds |
|---|---|
| `src/routes.ts` | the nesting that **is** the prefix list — `layout("routes/protected.tsx", […])` inside the shell, with the catch-all splat beside it, outside the guard |
| `src/routes/protected.tsx` | the mount: `middleware`, the load-bearing `loader`, an `<Outlet />` |
| `~/features/auth/middleware/` | the decisions — `require-session.ts`, its mirror `guest-only.ts`, and `user-context.ts` |
| `~/features/auth/utils/{safe-redirect-to,request-path}.ts` | narrowing the attacker-controlled `redirectTo`, and the `.data` stripping |

**Incorrect (either other Runtime's guard, ported):**

```tsx
// ❌ this Runtime has no token store to read — `src/` holds no `stores/`, the session
//    is an HttpOnly cookie — and deciding while rendering has already let the server
//    stream the guarded page. A ported `proxy.ts` fails more quietly still: no such
//    file convention exists here, so the module is never loaded and NOTHING is guarded.
if (!useAuthStore((s) => s.token)) return <Navigate to={ROUTES.SIGN_IN} replace />;
```

**Correct (`src/routes/protected.tsx` — the whole guard route):**

```tsx
export const middleware: Route.MiddlewareFunction[] = [requireSession];

// Not optional, even though nothing below reads its value directly: server middleware
// runs only on a `.data` request, and the client router makes one only when a matched
// route has a `loader`.
export function loader({ context }: Route.LoaderArgs) {
  return { user: context.get(userContext) };
}
// … plus a default export that renders <Outlet />, and nothing else.
```

So that `loader` is what keeps the guard running for **any** child added under this layout, including a
static page with no loader of its own. Deleting it as "unused" stops the guard on client navigations
**only** — a hard refresh still bounces, so the hole is invisible in review.

## `throw` the bounce, and `replace` — not `redirect`

```tsx
// ❌ `redirect` sets no `X-Remix-Replace`, so the client router PUSHES the bounce
//    onto the history stack and Back from sign-in walks straight into it again
if (!(await getSessionUser(request))) throw redirect(href("/sign-in"));
```

```tsx
// ✅ ~/features/auth/middleware/require-session.ts
export const requireSession: MiddlewareFunction<Response> = async (
  { request, url, context },
  next,
) => {
  const user = await getSessionUser(request);

  if (!user) {
    const search = new URLSearchParams({
      [SIGN_IN_REDIRECT_PARAM]: normalizeRequestPath(url),
    });
    throw replace(`${href("/sign-in")}?${search}`);
  }

  context.set(userContext, user);
  return next();
};
```

`throw` is the shape React Router's middleware docs give a guard, and unwinds the chain from any depth
with `next()` never called; `replace` sets the `X-Remix-Replace: true` the client router reads to swap the
history entry instead of pushing one. `test/features/auth/middleware/require-session.test.ts` pins both.

## `redirectTo` is normalized on the way in and narrowed on the way out

```tsx
// ❌ built from the raw request: on a client navigation the server receives
//    `/dashboard.data?tab=1&_routes=routes%2Fdashboard`, so the visitor is sent back
//    to a `.data` URL and the browser paints a turbo-stream payload as the page
redirectTo: `${new URL(request.url).pathname}${new URL(request.url).search}`,

// ❌ pattern-matching the target: `/\evil.example` passes both tests (the URL spec
//    reads a backslash in a special-scheme URL as `/`)
if (value.startsWith("/") && !value.startsWith("//")) redirect(value);
```

The guard reads the framework's normalized `url` through `normalizeRequestPath`, which strips the
`.data` / `_.data` suffix, the `_routes` param and a **bare** `index` param. Every value reaching
`redirect()` from user input goes through `safeRedirectTo` — the check `_template_next` carries verbatim,
the threat being the Runtime-independent half of a sign-in screen. It parses against
`http://redirect.invalid`, demands the origin come back unchanged, then rejects a **rebuilt** pathname
starting with `//`: normalisation collapses `..` but keeps the empty segment after it, so
`/..//evil.example` parses on this origin and comes back out protocol-relative. `~/routes/sign-in` calls it
**twice** — in the `loader`, so the hidden field is safe in the server-rendered HTML, and again in the
`action`, because a hidden field is still an editable form value.

## Conventions

- A guarded route carries **no** check of its own — `~/routes/dashboard`'s loader just reads `userContext`.
  Public routes stay outside the layout, so a mistyped URL 404s at the catch-all instead of bouncing a
  signed-out visitor to sign-in.
- `userContext` is created with **no** default — `createContext<SessionUser>()`, never
  `createContext<SessionUser | null>(null)`. `get()` throws when a context was never set and has no
  default, and that throw is the feature: a loader reading it outside the guarded group is a real
  misconfiguration in `src/routes.ts` that a friendly default would turn into a page quietly rendering
  with no user. `languageContext` in `~/libs` inverts the call for the inverse reason — a render that ran
  with no middleware should degrade to the default language, not 500 (see [[reactrouter-i18n-env]]).
- The decision is a function in `~/features/auth/middleware/`, typed `MiddlewareFunction<Response>` so it
  mounts on any route module; the route module only mounts it (see [[architecture-vertical-slices]],
  [[reactrouter-route-modules]]). `guestOnly` is the mirror half, and middleware runs before the sign-in
  `action` too — so a POST from a stale tab is bounced rather than minting a second cookie.
- The session is an `HttpOnly`, signed cookie from `~/libs/session.server`, `secure` decided by
  `env.PUBLIC_APP_ENV !== "local"` — validated config, never `NODE_ENV` (see [[reactrouter-server-modules]]).
  That is why this app has no `~/stores/` (contrast [[zustand-global]]), and every path a guard redirects
  to comes from the typed `href()` (see [[reactrouter-typed-href]]).
- Sign-out is the `action` of a resource route, so it is a POST — and the framework's `Origin` check runs
  only for document and `.data` actions, so that action compares `Origin`'s **host** to `url.host` itself
  and answers 403 on a mismatch. `allowedActionOrigins` in `react-router.config.ts` covers the two the
  framework does check, behind a TLS-terminating proxy.
- Test a guard by calling it as the plain function it is, with a hand-built `{ request, url, params,
  pattern, context: new RouterContextProvider() }` on the **node** environment — it reaches
  `~/libs/session.server`, whose `env` server half throws by name under jsdom. `createRoutesStub` is no
  substitute: it builds a memory router, so anything it runs is the client half. The end-to-end seam is a
  raw `maxRedirects: 0` fetch in `e2e/auth.e2e.ts` (see [[testing-playwright]]).

Reference: [`src/routes/protected.tsx`](../../apps/_template_reactrouter/src/routes/protected.tsx), [`require-session.ts`](../../apps/_template_reactrouter/src/features/auth/middleware/require-session.ts), [`user-context.ts`](../../apps/_template_reactrouter/src/features/auth/middleware/user-context.ts), [`safe-redirect-to.ts`](../../apps/_template_reactrouter/src/features/auth/utils/safe-redirect-to.ts), [ADR-0007](../../docs/adr/0007-ssr-auth-cookie-session-middleware.md), [React Router — Middleware](https://reactrouter.com/how-to/middleware), [URL Standard — special schemes](https://url.spec.whatwg.org/#special-scheme)
