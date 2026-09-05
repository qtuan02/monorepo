---
title: Organize Code by Domain Using Vertical Slices
impact: CRITICAL
impactDescription: Improves discoverability and reduces cross-team conflicts — one folder holds a whole feature
tags: architecture, vertical-slices, organization, features
---

## Organize Code by Domain Using Vertical Slices

**Impact: CRITICAL (Everything a feature needs lives in one folder; unrelated features stop colliding)**

Feature code is organized by **domain**, not by technical layer. `~/features` holds one slice per
domain, named for the domain in plain kebab-case — `home`, `patient`, `auth` — with **no** code
suffix. Each slice is a complete vertical: the screen, its pieces, its types, and its client state
all live inside it. A page under `~/pages/*` is a thin wrapper that renders the slice's template
and nothing more.

**Incorrect (one feature scattered across technical folders):**

```
src/
  components/patient-list.tsx     // ❌ pieces of "patient" spread across four folders
  templates/patient.tsx
  types/patient-filters.ts
  components/home-dashboard.tsx
```

Changing one feature forces edits across many folders, its pieces are hard to find, and unrelated
features churn the same directories.

**Correct (a self-contained slice per domain):**

```
src/features/patient/            // ✅ everything "patient" in one place
  templates/     # full-screen compositions, <name>.template.tsx — DEFAULT export (pages render these)
  components/    # UI used only by this slice
  provider/      # route wrappers / context providers this slice exposes upward (see [[routing-route-guards]])
  types/         # this slice's types + form schemas, one NAMED file each — never types/index.ts
  stores/        # feature-scoped Zustand stores, use-<name>-store.ts (see [[zustand-feature]])
  guard/         # Next Runtime only: the access decision this slice exposes to src/proxy.ts
                 # (see [[next-proxy-guards]]) — the Next counterpart of provider/
  middleware/    # React Router Runtime only: the route middleware this slice exposes to
                 # src/routes.ts (see [[reactrouter-middleware-guards]]) — that Runtime's
                 # counterpart of provider/ and guard/
  server/        # Next Runtime only: cached server loaders (see [[next-data-fetching]])
  actions/       # Next Runtime only: Server Actions ("use server"), one per file
  hooks/         # feature-only hooks (server-data hooks stay in ~/hooks/api)
  utils/         # feature-only helpers
```

Create a subfolder only when the slice needs it — a read-only screen may have just `templates/` +
`components/`.

## Templates are the public surface; pages stay thin

- `templates/<name>.template.tsx` is **default-exported** (`export default function PatientTemplate()`).
  The page in `~/pages` renders it and nothing else reaches inside the slice (see
  [[architecture-feature-boundaries]]). The `.template.tsx` **dot** suffix is deliberate: it sorts
  every template together in a folder listing and makes the file's role greppable
  (`**/*.template.tsx`) independent of the domain name in front of it.
- A page is glue only: `~/pages/patient-page.tsx` renders `<PatientTemplate />` and wires route
  params — no feature logic.
- A template may itself be composed from smaller templates in the same slice —
  `layout.template.tsx` renders `header.template.tsx` + `body.template.tsx` + `footer.template.tsx`,
  each backed by pieces under `components/<area>/` (`components/header/`, `components/footer/`).
  Reach for that split only when the shell has genuinely separate regions; a single-screen slice keeps
  one template.

## Types and form schemas — named files, never a barrel

- Feature-local types go in `types/<descriptive-name>.ts` (e.g. `types/patient-list-filters.ts`).
  **Never `types/index.ts`** — that is a barrel (see [[quality-avoid-barrel-imports]]).
- Form schemas live next to them as `types/<form>-form.ts`: the Zod schema and its `z.infer` type
  together (see [[forms-schema-driven]]). There is no separate `schemas/` folder.
- Types shared **beyond** the slice (imported by an `@monorepo/api` service or a `~/hooks/api` hook)
  are domain types — put them in the foundation layer `~/types/<entity>.ts` so lower layers import
  them without pointing upward (see [[architecture-circular-dependencies]]).

```typescript
// ❌ src/features/patient/types/index.ts — a barrel, imported through the folder
export type PatientListFilters = { /* ... */ };
import type { PatientListFilters } from "../types";

// ✅ src/features/patient/types/patient-list-filters.ts — a named file, concrete path
export type PatientListFilters = { /* ... */ };
import type { PatientListFilters } from "~/features/patient/types/patient-list-filters";
```

## Conventions

- Slice folder: `~/features/<domain>/` in kebab-case; no `.FuncID` suffix, no PascalCase folders.
- Subfolders (all optional, add on demand): `templates/ components/ provider/ guard/ middleware/
  server/ actions/ types/ stores/ hooks/ utils/`.
- In a **Next Runtime** app the consumer above the slice is an App Router segment under `src/app/`
  rather than a page in `~/pages/`, and the slice may expose `guard/`, `server/` and `actions/`
  instead of `provider/`. Nothing else about the slice changes (see [[next-app-router-structure]]).
- In a **React Router Runtime** app the consumer above the slice is a route module under `src/routes/`,
  declared in the route config `src/routes.ts`, and the slice may expose `middleware/` instead of
  `provider/` (see [[reactrouter-route-modules]]). It has no `server/` and no `actions/`: a route
  module's own `loader` / `action` is where server work lives, so the slices in
  `apps/_template_reactrouter` carry only `components/ constants/ middleware/ templates/ types/
  utils/`.
- Template files carry the `.template.tsx` dot suffix (`home.template.tsx`, `sign-in.template.tsx`);
  every other file in a slice stays plain kebab-case.
- One standalone component → `components/<name>.tsx`; several interdependent parts → a
  `components/<group>/` folder with descriptively named files, **never** an `index.tsx` entry.
- No `~/features/*.tsx` files and no `index.ts` re-export barrels anywhere in a slice — export each
  symbol from its own file and import it by that path (see [[quality-avoid-barrel-imports]]).

Reference: [Feature-Sliced Design — Architectural Principles](https://feature-sliced.design/docs/get-started/overview)
