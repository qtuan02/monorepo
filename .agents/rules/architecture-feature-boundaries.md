---
title: Keep Features Behind Their Public Surface
impact: CRITICAL
impactDescription: Prevents architectural erosion and keeps feature slices loosely coupled
tags: architecture, boundaries, imports, coupling, features
---

## Keep Features Behind Their Public Surface

**Impact: CRITICAL**

Each folder under `~/features/<domain>` is a self-contained slice (see
[[architecture-vertical-slices]]). Pages and other features consume a slice through its **public
surface** — never by reaching into its internals.

A slice's public surface is:

- its `templates/<name>.template.tsx` (default-exported, full-screen compositions),
- its `provider/<name>.tsx` route wrappers, which `~/pages/main.tsx` mounts around groups of routes
  (see [[routing-route-guards]]), and
- any component it deliberately exposes under `components/`.

**Incorrect (reaching into internals / wrong layer):**

```tsx
// ❌ a page importing a feature's internal component instead of its template
// src/pages/sign-in-page.tsx
import { SignInForm } from "~/features/auth/components/sign-in-form";

// ❌ one feature reaching into another feature's internals
import { usePatientListCache } from "~/features/patient/hooks/use-list-cache";
```

**Correct (consume the public surface):**

```tsx
// ✅ a page renders the feature's template
// src/pages/sign-in-page.tsx
import SignInTemplate from "~/features/auth/templates/sign-in.template";

// ✅ cross-feature reuse goes through a deliberately exposed component
import { PatientCard } from "~/features/patient/components/patient-card";
```

## Where shared code goes instead

When something is needed by more than one slice it does **not** belong inside a slice — place it by
kind:

| Need | Home |
|---|---|
| Style-only UI primitive (Button, Input, Card) | `@monorepo/ui/components/*` (see [[architecture-ui-primitives]]) |
| App-specific shared composite (empty state, self-fetching select) | `~/components/*` (see [[architecture-shared-components]]) |
| The app shell itself (header, body, page chrome) | `~/features/layout/*` — it is a slice like any other |
| Cross-cutting infra (http client, query client, `cn`, helpers, constants) | `~/libs`, `@monorepo/ui/utils/cn`, `~/utils`, `~/constants` |
| Data access shared across features | a service in `@monorepo/api` + a hook in `~/hooks/api` (see [[architecture-features-modules]]) |

**Benefits:**

- Discoverability: looking for the auth screen? It is all in `~/features/auth`.
- Loose coupling: `import SignInTemplate from "~/features/auth/templates/..."` tells you exactly
  which slice you depend on, and the slice's internals stay free to change.
