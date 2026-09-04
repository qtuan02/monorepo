---
title: Use and Extend Shared Composites in `~/components`
impact: CRITICAL
impactDescription: One place for cross-feature composites — no headers/empty-states/pickers re-built inside every feature
tags: architecture, components, shared, composition
---

## Use and Extend Shared Composites in `~/components`

**Impact: CRITICAL (One place for every cross-feature composite — no duplicate headers/pickers/empty-states re-built inside features)**

`apps/<app>/src/components/*` (`~/components`) holds **app-specific shared components that are more
than a style primitive** — composites that call a query hook, own state, or compose several
`@monorepo/ui` primitives into a reusable unit. What the Template apps ship there today:

| Folder | Holds | Export style | In |
|---|---|---|---|
| `exception/` | `not-found`, `coming-soon`, `internal-server-error` — plus `exception-state.tsx`, the shared anatomy, where more than one of them exists | default | both Templates |
| `select/` | `select-language.tsx` — the language switcher | named | both Templates |
| `page/` | `page-header.tsx`, `page-content.tsx` — the title band + content well every in-shell page opens with | named | `_template_next` |

This is the composite half of [[architecture-feature-boundaries]]; it sits below the feature layer so
every slice can depend on it (see [[architecture-circular-dependencies]]).

The app **shell** is not here: the header bar, the body column, the footer and the route guard around
them are one slice's worth of chrome and live in `~/features/layout/` (see
[[architecture-vertical-slices]], [[routing-route-guards]]). What lands in `~/components` is what more
than one slice reuses — `SelectLanguage` is here because both the header *and* the sign-in screen
render it, and `page/` is here because an exception screen renders the same title band a real page
does, and a shared component may never import from `~/features`.

`page/` and the shell line their left edges up through the same Tailwind container utilities written
at each call site (`container mx-auto px-4 sm:px-6 lg:px-8`). Neither Template app lifts that string
into a constant, and neither should you until a **third** element has to line up with the other two —
a shared measurement earns a `~/constants/layout.ts` only once separate files would otherwise have to
agree by hand (see [[quality-styling-tailwind]]).

`~/components` may import `@monorepo/ui`, `~/hooks/api`, `~/libs`, `~/types` — but **never
`~/features`** (that would be an upward import). Before building an empty state or a picker inside a
feature, check this folder first.

## Finding and using shared components

Import from the concrete file and match its real export style (see [[quality-imports]]) — grouped
folders have no barrel entry (see [[quality-avoid-barrel-imports]]):

```tsx
import NotFound from "~/components/exception/not-found";              // default export
import { SelectLanguage } from "~/components/select/select-language"; // named export
import { PageContent } from "~/components/page/page-content";         // named export
import { PageHeader } from "~/components/page/page-header";           // named export
```

An in-shell screen opens with the two `page/` composites and nothing else — the container lives
inside each region rather than around both, so the title band's fill still reaches the viewport edges:

```tsx
// ✅ the shape every page under the shell layout takes
<>
  <PageHeader title={t("patient.title")} description={t("patient.subtitle")} actions={<Button …/>} />
  <PageContent>{/* … */}</PageContent>
</>
```

## Building a new shared component

Add a component here when it is reused by **more than one feature** and does more than style — it
fetches, owns state, or composes primitives. A data-driven composite **owns its `~/hooks/api` call
and its own skeleton**: it exposes `value`/`onChange`-style props, never prop-drilled data or a
loading flag.

```tsx
// ✅ src/components/select/select-code-list.tsx — owns its query and loading state
export function SelectCodeList({ codeKey, deptId, onChange }: SelectCodeListProps) {
  const { data: options = [], isFetching } = useCodeListQuery({ key: codeKey, deptId }, { enabled: !!deptId });
  return <Combobox options={options} loading={isFetching} onChange={onChange} />;
}
```

**Incorrect (a shared input that takes prop-drilled data/loading instead of fetching itself):**

```tsx
// ❌ every caller has to duplicate the query and pass options + isLoading down
export function DoctorSelect({ doctors, isLoading, onChange }: Props) { /* ... */ }
```

**Correct (the shared input owns its own fetch):**

```tsx
// ✅ owns the query internally; the query cache dedupes across call sites
export function DoctorSelect({ deptId, onChange }: { deptId?: string; onChange: (v: string) => void }) {
  const { data: doctors = [], isFetching } = useCodeListQuery({ key: "TreatmentDoctor", deptId }, { enabled: !!deptId });
  return <Combobox options={doctors} loading={isFetching} onChange={onChange} />;
}
```

## Conventions

- One standalone component → one file (`not-found.tsx`); several parts of one concern → a folder
  named for it (`exception/`, `page/`, `select/`) — no `index.tsx` entry (see
  [[quality-avoid-barrel-imports]]).
- A shared layout measurement (a container class, a bar height) becomes a constant in `~/constants/`
  the moment a **third** separate file has to line up with the other two — not before. Below that,
  the utilities stay inline at the call site (see [[quality-styling-tailwind]]).
- Compose from `@monorepo/ui` primitives; don't reach for raw markup when a primitive exists (see
  [[architecture-ui-primitives]]).
- Data-driven components own their `~/hooks/api` call and a matching `Skeleton`
  (`@monorepo/ui/components/skeleton`) for loading — never a bare spinner, never prop-drilled
  data/loading.
- **Never import from `~/features`** — that is an upward import (see
  [[architecture-circular-dependencies]]).

Reference: [`apps/_template_vite/src/components/select/select-language.tsx`](../../apps/_template_vite/src/components/select/select-language.tsx)
