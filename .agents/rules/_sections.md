# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules
(e.g. `architecture-*.md`, `quality-*.md`). Add a section here before introducing a new prefix.

---

## 1. Architecture (architecture)

**Impact:** CRITICAL
**Description:** How each app's `src/` is organized — vertical slices under `~/features`, the one-way import direction (`env → @monorepo/api → ~/libs/http-client → ~/hooks/api → feature → route module`), feature boundaries via public surfaces, the `@monorepo/api` services vs `~/hooks/api` split, and where UI primitives (`@monorepo/ui`) and shared composites (`~/components`) live. The layering is identical in both Runtimes; only the top layer differs (`~/pages/` in a Vite app, `src/app/` in a Next app).

## 2. Routing (routing)

**Impact:** HIGH
**Description:** Routing for the **Vite Runtime** — `_template_vite` and anything cloned from it, on React Router 8 declarative (imports come from `react-router` and `react-router/dom`; there is no `react-router-dom` package any more). Every path comes from the `ROUTES` constant in `~/constants/routes.ts`, and auth/redirect guards live at the route tree as `~/features/auth/provider/` outlets (`<ProtectedRoute>` / `<GuestRoute>`), never inside pages. A **Next Runtime** app does none of this: its path table is the `src/app/` file tree and its guard is `proxy.ts` — see the `next` cluster.

> The reference monorepo also carries a third Runtime (React Router **framework mode**) and two rules for it, `routing-typed-href` and `routing-middleware-guards`, plus `patterns-loader-vs-query`. All three were **deliberately dropped** from this repo: the Skeleton has no `_template_reactrouter`, and a rule describing a shape the repo does not contain is documentation debt. They are recoverable verbatim from the reference (`.agents/rules/` at `E:\MedViet\frontend\medviet`) the day a third Template app arrives — restore them then, and register nothing new here, since they keep the `routing-`/`patterns-` prefixes.

## 3. Next.js App Router (next)

**Impact:** CRITICAL
**Description:** Rules for the **Next Runtime** — `apps/_template_next` and anything cloned from it (Next 16 App Router, `cacheComponents: true`, `reactCompiler: true`, Turbopack, `proxy.ts` on the Node runtime). Covers the thin route module in `src/app/` over a slice that owns the screen, the Server-Component default and where `"use client"` earns its place, the boundary between a cached server read (`"use cache"` + `cacheTag`/`cacheLife`) and TanStack Query, access control as a pure function called from `proxy.ts` over an `HttpOnly` cookie, the next-intl Flavor with its `[locale]` segment and shared ICU catalogue, and the t3-env Flavor with its `server`/`client` split and `NEXT_PUBLIC_` prefix. Each rule states the Runtime it applies to; a Vite app follows the `routing-*` cluster instead and the two shapes never coexist in one app.

## 4. React (react)

**Impact:** HIGH
**Description:** React 19 component conventions — `ref` is a normal prop (no `forwardRef`), never define a component inside another component, and `useEffect` only syncs to external systems (not for derived state or data fetching). React Compiler is on in both Template apps, so these hold in both Runtimes.

## 5. Code Quality (quality)

**Impact:** HIGH
**Description:** Day-to-day standards for readable, maintainable code: clarity over cleverness, `~/` + `@monorepo/*` import and named/default export conventions, avoiding barrel imports (every package is `private`, source-only and subpath-only — there is no `dist/` and no root entry except `@monorepo/dayjs`), comment guidelines, stable list keys, and styling with Tailwind `className` + `cn`.

## 6. Forms (forms)

**Impact:** HIGH
**Description:** Schema-driven forms with Zod + React Hook Form — one Zod schema (`z.infer`) is the source of truth for validation and types, bound to the form with `Controller` + `zodResolver` and composed from the `@monorepo/ui` field primitives; subscribe to live field values with `useWatch`.

## 7. Data & Server State (tanstack)

**Impact:** HIGH
**Description:** TanStack Query v5 conventions — the query-key factory pattern, defining query/mutation/infinite-query hooks in `~/hooks/api/<entity>.ts`, and consuming those hooks correctly in components (loading flags, invalidation) for predictable caching. Both Runtimes use the cluster unchanged; in a Next app it governs only what happens **after** paint, and `next-data-fetching` draws that line.

## 8. Patterns (patterns)

**Impact:** HIGH
**Description:** Data-fetching and rendering patterns for building screens: fetch independent data in parallel, fetch on mount (navigate first; mount-gate hidden parts), let each component fetch its own data and skeleton, build reusable inputs that fetch their own options, use API hooks directly instead of a screen-wide context, and debounce search inputs.

## 9. State Management (zustand)

**Impact:** HIGH
**Description:** Where client state lives and how it is scoped with Zustand v5 — app-wide stores flat in `~/stores/` vs feature-scoped stores at a slice root, when to prefer `useState` for single-component state, and keeping server data in TanStack Query (never a store). A Next app's session is an `HttpOnly` cookie rather than a persisted store, which is why `_template_next` has no `~/stores/` at all.

## 10. Dates (dates)

**Impact:** HIGH
**Description:** Date and time through `@monorepo/dayjs` — the one configured dayjs singleton (plugins extended once at module scope; no default timezone, so it renders on the device's clock), display formats from `@monorepo/dayjs/formats`, the locale registry switched via `setDayjsLocale` and bridged to i18next at `~/libs/dayjs.ts`, and threading the language into render so the React Compiler cannot memoize a stale locale.

## 11. Testing (testing)

**Impact:** HIGH
**Description:** Which runner owns which concern — Vitest 5 + React Testing Library under `apps/<app>/test/` mirroring `src/`, Playwright 1.62 for `.e2e.ts` flows — plus what deserves a test at all (coverage is measured, never gated), the `TZ=UTC` pin that lives in `vitest.config.ts` rather than a shell prefix, and the non-blocking `e2e` job in GitHub Actions. Where a test's seam goes is stated outside this cluster — mock the service singletons in `~/libs/http-client`, never `axios` and never a query hook — by `CLAUDE.md` §7a and `next-data-fetching.md`.
