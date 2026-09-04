---
title: Access Control Lives in proxy.ts, and the Decision Is a Pure Function
impact: CRITICAL
impactDescription: A guard that decides while rendering has already let the server send the bytes; a redirect target that is pattern-matched instead of parsed is an open redirect.
tags: next, proxy, auth, session, cookies, security, open-redirect
---

## Access Control Lives in `proxy.ts`, and the Decision Is a Pure Function

**Impact: CRITICAL (Applies to the Next Runtime — `apps/_template_next` and clones. A Vite SPA app guards at the route tree instead, see [[routing-route-guards]]; the two shapes never coexist in one app.)**

In a server-rendered app the access decision must happen **before** anything renders — a component
that checks a token while rendering has already streamed the guarded page by the time it objects.
Next 16 renamed `middleware.ts` to `proxy.ts` and the export `middleware` to `proxy`; the proxy runs
on the **Node** runtime and cannot be configured back to edge, which is what lets the guard import
the same modules as the rest of the app instead of living in a second, edge-shaped world.

| File | Holds |
|---|---|
| `src/proxy.ts` | the HTTP adapter — reads the cookie, turns a decision into a redirect, hands the rest to next-intl |
| `src/features/auth/guard/session-guard.ts` | `decideSessionRedirect` — the decision as a pure function of `{ pathname, search, hasSession }` |
| `src/features/auth/guard/safe-redirect-to.ts` | narrows the attacker-controlled `redirectTo` before `redirect()` sees it |

**Incorrect (the matcher as an identifier, and the decision welded into the proxy):**

```ts
// ❌ Next extracts `config` by statically analysing the file, so an identifier it cannot evaluate
//    counts as a dynamic value and is silently ignored — the proxy then runs on EVERY request.
export const config = { matcher: I18N_PROXY_MATCHER };

// ❌ inlined here the decision is untestable: a `NextRequest` cannot be constructed in a unit test
//    without a running Next, and which paths are gated has nothing to do with HTTP.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/dashboard") && !request.cookies.has(SESSION_COOKIE_NAME))
    return NextResponse.redirect(new URL("/sign-in", request.url));
}
```

**Correct (`src/proxy.ts` — a thin adapter over the pure decision, matcher copied as a literal):**

```ts
export function proxy(request: NextRequest) {
  // Guard first, locale second: bouncing a signed-out visitor is cheaper than negotiating a
  // locale for a page they never see, and the redirect keeps the prefix the request carried.
  const redirect = decideSessionRedirect({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    hasSession: request.cookies.has(SESSION_COOKIE_NAME),
  });

  if (redirect) {
    const url = request.nextUrl.clone();
    url.pathname = redirect.pathname;
    url.search = ""; // the guarded URL's own query must not ride along — it is in `redirectTo`
    if (redirect.redirectTo) url.searchParams.set(SIGN_IN_REDIRECT_PARAM, redirect.redirectTo);
    return NextResponse.redirect(url); // a 307
  }

  return negotiateLocale(request);
}

// ✅ a literal copied from `I18N_PROXY_MATCHER`; `test/proxy.test.ts` reads this file as TEXT and
//    asserts the two are equal, because a wrong-but-valid regex fails open and stays green.
export const config = { matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)" };
```

That matcher skips `/api`, `/trpc`, Next's assets and **any path containing a dot** — and a skipped
path reaches the app with no guard and no locale negotiation. So a protected route may never carry a
dot in a segment, and `/foo.bar` lands on the root layout with `foo.bar` as its `[locale]` segment,
which is how the unknown-locale 404 is reached in ordinary use (see [[next-i18n-next-intl]]).

The session is an `HttpOnly` cookie minted by the `signInAction` Server Action — `httpOnly: true`,
`sameSite: "lax"`, `path: "/"`, an eight-hour `maxAge`, and `secure: env.NEXT_PUBLIC_APP_ENV !==
"local"` (validated config, never `process.env.NODE_ENV`: a `secure` cookie is never sent over plain
http, so a hard-coded `true` breaks local development — see [[next-env-t3]]). No script can read it,
which is why this app has no token store; a persisted one would undo exactly that (contrast
[[zustand-global]], still correct for other client state). Sign-out is a **POST** action — a GET
would let a prefetcher or an `<img src>` sign a visitor out.

## `redirectTo` is attacker-controlled end to end

The proxy writes it, the form copies it verbatim into a hidden field, and the action hands it to
`redirect()` — which Next embeds in the `Location` header without normalising it.

**Incorrect (pattern-matching the target):**

```ts
// ❌ `/\evil.example` passes both tests. The URL spec says a backslash in a special-scheme URL is
//    a `/`, so every browser resolves the header this produces to https://evil.example/.
if (value.startsWith("/") && !value.startsWith("//")) redirect(value);
```

**Correct (parse it, and demand the origin come back unchanged):**

```ts
// ✅ `.invalid` is reserved by RFC 2606, so no host resolves to it. Resolving against an
//    unreachable base catches the whole family at once — protocol-relative, backslash authority,
//    absolute — and rebuilding from the parsed parts returns what was actually parsed.
const RESOLUTION_BASE = "http://redirect.invalid";

export function safeRedirectTo(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/")) return undefined; // a bare `dashboard` cannot ride in as relative
  let url: URL;
  try {
    url = new URL(value, RESOLUTION_BASE);
  } catch {
    return undefined;
  }
  if (url.origin !== RESOLUTION_BASE) return undefined;
  return `${url.pathname}${url.search}${url.hash}`;
}
```

## Conventions

- `src/proxy.ts`, a **named** `export function proxy` — not `middleware.ts`, not a default export,
  and never `export const runtime = "edge"` (the proxy runtime is `nodejs` and is not configurable).
  `config.matcher` is a string **literal**: copy `I18N_PROXY_MATCHER` by value, never import it.
- Keep `proxy.ts` an adapter — every "which paths are gated" question belongs to
  `decideSessionRedirect`, which the auth slice exposes upward the way an SPA slice exposes
  `provider/` (see [[architecture-vertical-slices]]).
- Protected paths come from `PROTECTED_ROUTE_PREFIXES` in `~/constants/routes`, prefix-matched on the
  locale-stripped path, so `/dashboards-public` does not match `/dashboard`.
- A guarded page carries **no** page-level auth check: `dashboard/page.tsx` is one line rendering its
  template, with `robots.index: false` in its metadata (see [[next-server-vs-client-components]]).
- Every value reaching `redirect()` from user input goes through `safeRedirectTo` first, and the seam
  that proves the guard is E2E, not jsdom: fetch `/dashboard` with `maxRedirects: 0` and assert the
  status plus a `location` carrying `/sign-in` and `redirectTo` (see [[testing-playwright]]).

Reference: [`apps/_template_next/src/proxy.ts`](../../apps/_template_next/src/proxy.ts), [`session-guard.ts`](../../apps/_template_next/src/features/auth/guard/session-guard.ts), [`safe-redirect-to.ts`](../../apps/_template_next/src/features/auth/guard/safe-redirect-to.ts), [`redirect-param.ts`](../../apps/_template_next/src/features/auth/guard/redirect-param.ts), [`packages/i18n/src/next-intl/proxy-matcher.ts`](../../packages/i18n/src/next-intl/proxy-matcher.ts), [Next.js — `proxy.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy), [Next.js 16 — `middleware` to `proxy`](https://nextjs.org/docs/app/guides/upgrading/version-16), [URL Standard — special schemes](https://url.spec.whatwg.org/#special-scheme)
