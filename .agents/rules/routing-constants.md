---
title: Centralized Route Constants
impact: HIGH
impactDescription: Single source of truth for paths; renaming a route is a one-file edit.
tags: routing, routes, constants, navigation, react-router
---

## Centralized Route Constants

**Impact: HIGH (Inline path strings drift; one canonical table prevents broken links forever)**

Every route path — both as a **definition** in `<Route path={…}>` and as a **navigation target** in
`<Link to={…}>`, `useNavigate()`, or `<Navigate to={…} />` — must come from the single `ROUTES`
constant in `~/constants/routes.ts`. String literals for routes are banned anywhere else. For dynamic
segments, add a builder function next to its template constant.

**Two of the three Runtimes keep this table**, for the same reason from two directions: the Vite
Runtime declares its tree by hand in `~/pages/main.tsx`, and the Next Runtime's App Router folder tree
is not importable at all, so a literal path in a component would drift the moment a folder is renamed
(see [[next-app-router-structure]] for what the Next Runtime hands `ROUTES` values to).

The **React Router Runtime** keeps no such table — `apps/_template_reactrouter/src/constants/` holds
only `cookies.ts`. Its path table is the route config in `src/routes.ts`, and `react-router typegen`
turns that file into a typed `href()` whose argument is checked against it, so the guarantee this rule
buys by convention that Runtime gets from the compiler instead (see [[reactrouter-typed-href]]).

## The router is React Router 8, and `react-router-dom` no longer exists

**Two** Runtimes are on React Router 8, in different modes — the rest of this section is the Vite one.
The Vite Runtime is on **declarative mode**: it mounts a `BrowserRouter` and declares `<Routes>` /
`<Route>` by hand in `~/pages/main.tsx`. The React Router Runtime (`apps/_template_reactrouter`) is
the same major in **framework mode**: there is no `BrowserRouter` to mount, the route table is
`src/routes.ts`, and links go through typed `href()` — so do not reach for the shapes below there
(see [[reactrouter-route-modules]], [[reactrouter-typed-href]]). What both share is the package layout:
exactly one package, and two entry points:

| Import from | Holds |
|---|---|
| `react-router` | everything a declarative app touches — `BrowserRouter`, `Routes`, `Route`, `Link`, `Navigate`, `Outlet`, `useNavigate`, `useLocation`, `useParams`, `useSearchParams` |
| `react-router/dom` | the data/framework entry points only — `RouterProvider`, `HydratedRouter` |

`react-router-dom` was folded into `react-router` and is **not installed**; an import from it fails to
resolve rather than falling back. A v7-era snippet that imports `Link` from `react-router-dom` is the
single most common thing to get wrong when copying code in.

```tsx
// ❌ the package does not exist in this workspace — the import fails to resolve
import { Link, useNavigate } from "react-router-dom";

// ✅ one package, one entry point for declarative routing
import { Link, useNavigate } from "react-router";
```

**Incorrect (hard-coded paths everywhere):**

```tsx
// ❌ literal path strings drift the moment a route is renamed; window.location bypasses the router
<Route path="/patients/:patientId" element={<PatientPage />} />
<Link to={`/patients/${patient.id}`}>Open</Link>
navigate("/dashboard");
window.location.href = "/sign-in";
```

**Correct (paths flow from `ROUTES`):**

```ts
// ~/constants/routes.ts
export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  DASHBOARD: "/dashboard",
  PATIENTS: "/patients",
  PATIENT_BY_ID: "/patients/:patientId",

  // The `:patientId` placeholder lives in exactly one place — the template
  // above — and no caller interpolates a path by hand.
  patientByIdPath: (patientId: string) => `/patients/${patientId}`,
} as const;
```

```tsx
// ✅ definitions use the template; links/navigation use the constant or builder
<Route path={ROUTES.PATIENT_BY_ID} element={<PatientPage />} />
<Link to={ROUTES.patientByIdPath(patient.id)}>Open</Link>
navigate(ROUTES.DASHBOARD);
```

## Conventions

- Static paths use `SCREAMING_SNAKE_CASE` keys (`HOME`, `PATIENT_BY_ID`); dynamic-segment builders
  stay `camelCase` with a `Path` suffix (`patientByIdPath(id)`).
- `as const` is not optional here — it keeps each value a literal type, so a typo fails to compile
  instead of resolving to a 404 at runtime, and it is what lets a consumer narrow against the table.
- Never read/write `window.location` for routing decisions — use `useNavigate`, `useLocation`,
  `useParams`, `useSearchParams`.
- Adding a route = add the `ROUTES` entry, add the `<Route>` under the correct guard (see
  [[routing-route-guards]]), then reference the constant from every link and navigation.
- E2E specs address the app the way a visitor does, but they route through `ROUTES` too, so a renamed
  route fails to compile rather than 404-ing at runtime (see [[testing-playwright]]). In the React
  Router Runtime that same compile-time guarantee comes from typed `href()` over the generated
  `+types`, not from importing a constant (see [[reactrouter-typed-href]]).

Reference: [`apps/_template_vite/src/constants/routes.ts`](../../apps/_template_vite/src/constants/routes.ts), [`apps/_template_vite/src/pages/main.tsx`](../../apps/_template_vite/src/pages/main.tsx), [React Router — Routing](https://reactrouter.com/start/declarative/routing)
