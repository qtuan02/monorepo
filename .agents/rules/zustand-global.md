---
title: Global State Management with Zustand
impact: HIGH
impactDescription: Prevents global scope pollution and keeps app-wide client state in one place.
tags: state-management, zustand, global, architecture
---

## Global State Management with Zustand

**Impact: HIGH (Prevents global scope pollution and centralizes app-wide client state)**

A global store is for **app-wide client state that several independent features must read** — the auth
token, theme, locale, app settings. It lives flat in `~/stores/` as `use-<name>-store.ts`, declares a
typed `interface XxxStore` above `create<XxxStore>()`, and is read through the **narrowest selector**.
State scoped to one feature belongs in that feature's slice instead (see [[zustand-feature]]); data the
backend owns is **server state** and belongs in TanStack Query via `~/hooks/api/*`, never a store (see
[[tanstack-consume-query]]).

**Belongs in `~/stores/`:** auth token, theme, locale, app settings — small, app-wide, client-owned.
**Does _not_ belong here:** user profile, permissions, code-lists and other server data (read them through
`~/hooks/api/*`); one feature's filters, wizard steps, or selection (→ [[zustand-feature]]); state used by
a single component (→ `useState`).

**Incorrect (feature-only state, and mirrored server state, in the global dir):**

```typescript
// ❌ Only the patient-list page uses these filters — this is feature state, not global.
//    It belongs in ~/features/patient/stores/ (see [[zustand-feature]]).
// src/stores/use-patient-filter-store.ts
import { create } from "zustand";

export const usePatientFilterStore = create<{ keyword: string; setKeyword: (k: string) => void }>(
  (set) => ({ keyword: "", setKeyword: (keyword) => set({ keyword }) }),
);
```

```typescript
// ❌ User profile is SERVER state — read it via a data hook in ~/hooks/api/*. Mirroring it into a store
//    makes it drift from the backend and forces manual refetching (see [[tanstack-consume-query]]).
// src/stores/use-user-store.ts
export const useUserStore = create<{ user: UserInfo | null }>(() => ({ user: null }));
```

**Correct (app-wide client state, typed, flat in `~/stores/`; persisted to `localStorage`):**

```typescript
// ✅ The auth token is read by the route guard, the http client, and many features → app-wide.
// src/stores/use-auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: "auth" }, // persist middleware defaults its storage to localStorage
  ),
);
```

```tsx
// ✅ Subscribe with the narrowest selector — re-renders only when `token` changes.
const token = useAuthStore((s) => s.token);
// ❌ const store = useAuthStore(); — subscribes to the whole store; re-renders on every field change.
```

**Conventions:**
- Location: `~/stores/use-<name>-store.ts`, flat — never a global store nested inside a feature.
- Declare a typed `interface XxxStore` above `create<XxxStore>()` and export a named `use<Name>Store`.
- Read through the **narrowest selector** (`useAuthStore((s) => s.token)`) so a component re-renders only
  when its slice changes — never destructure the whole store.
- Reserve global stores for genuinely app-wide client state (auth token, theme, locale). Server data →
  TanStack Query via `~/hooks/api/*`, not a store (see [[tanstack-consume-query]]).
- Persist across reloads with the `persist` middleware backed by `localStorage` (its default storage).

Reference: [Zustand Documentation](https://zustand-demo.pmnd.rs/)
