---
title: Feature-Scoped State Management with Zustand
impact: HIGH
impactDescription: Keeps client state inside its slice and prevents over-engineering component state.
tags: state-management, zustand, feature, architecture
---

## Feature-Scoped State Management with Zustand

**Impact: HIGH (Keeps state inside its slice; prevents over-engineering isolated component state)**

State shared across several components **within one feature** — complex filters, a multi-step wizard, a
current selection — goes in a feature-scoped store at the slice root:
`~/features/<feat>/stores/use-<name>-store.ts`. Do **not** nest stores deeper under a feature's
`components/` subfolder, and do **not** reach for Zustand when the state lives in a single component —
that is `useState`. App-wide client state (auth, theme, locale) is global instead (see [[zustand-global]]).
This is [[architecture-vertical-slices]] applied to client state.

**Incorrect (store buried in a component subtree, or a store for single-component state):**

```typescript
// ❌ Nested inside a component's subtree — stores scatter and become undiscoverable.
//    A feature's stores all live at its slice root, not under components/.
// src/features/appointment/components/schedule/stores/use-schedule-store.ts
export const useScheduleStore = create<ScheduleStore>((set) => ({ /* ... */ }));
```

```typescript
// ❌ Over-engineering: this flag is read by one component only → useState, not a store.
// src/features/patient/components/filter-sheet/stores/use-tab-state.ts
export const useTabState = create<{ activeTab: string; setActiveTab: (t: string) => void }>((set) => ({
  activeTab: "details",
  setActiveTab: (activeTab) => set({ activeTab }),
}));
```

**Correct (feature-root store for shared state; local `useState` for component drafts):**

```typescript
// ✅ Shared by the patient-list page (list + charts + filter sheet) → one store at the slice root.
// src/features/patient/stores/use-patient-list-store.ts
import { create } from "zustand";

interface PatientListStore {
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
}

export const usePatientListStore = create<PatientListStore>((set) => ({
  params: {},
  setParams: (params) => set({ params }),
}));
```

```tsx
// ✅ Draft inputs stay in local useState; commit to the store only on "Áp dụng".
// src/features/patient/components/filter-sheet.tsx
import { useState } from "react";
import { Button } from "@monorepo/ui/components/button";
import { usePatientListStore } from "~/features/patient/stores/use-patient-list-store";

export function FilterSheet() {
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  // Narrow selector — selects only the setter, so committed-params changes never re-render this input.
  const setParams = usePatientListStore((s) => s.setParams);

  return <Button onClick={() => setParams(draft)}>Áp dụng</Button>;
}
```

**Conventions:**
- Location: `~/features/<feat>/stores/use-<name>-store.ts` — at the slice root, never under `components/`
  (see [[architecture-vertical-slices]]).
- Scope decides the home: shared across the feature → feature store; used by one component → `useState`;
  needed app-wide → a global store in `~/stores/` (see [[zustand-global]]).
- Declare a typed `interface XxxStore` above `create<XxxStore>()`, export a named `use<Name>Store`, and
  read it through the narrowest selector.
- Keep draft/edit values in local `useState`; write to the store only on commit.

Reference: [Feature-Sliced Design — Architectural Principles](https://feature-sliced.design/docs/get-started/overview)
