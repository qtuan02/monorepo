---
title: Use API Hooks Directly, Not a Page-Wide Context
impact: HIGH
impactDescription: Server state and business logic live in the component via query/mutation hooks — not a wrapping Context that re-renders every child.
tags: patterns, architecture, state-management, context, tanstack-query, zustand
---

## Use API Hooks Directly, Not a Page-Wide Context

**Impact: HIGH (A context change re-renders every consumer, even components whose data never changed)**

Call the API hooks in the component that needs the data, and handle that component's business logic right
there. Do **not** wrap a page in a Context provider — or a "context + `useLogic`" orchestrator — that
fetches, holds server state, and runs CRUD for all its children. Every child that reads the context
re-renders whenever **any** value in it changes, so one mutation or an unrelated field edit re-renders the
whole subtree. Prefer explicit and clear over "tidy": a few hook calls in each component beat one big
context nobody can trace.

**Correct (the component uses the hooks directly and owns its logic):**

```tsx
// ✅ no wrapping context — server state from TanStack Query, invalidation right where the write happens
function VitalsPanel({ admissionId }: { admissionId: string }) {
  const queryClient = useQueryClient();
  const vitalsQuery = useVitalsQuery(admissionId);
  const saveVitals = useSaveVitalsMutation({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vitalsQueryKeys.all }),
  });
  if (vitalsQuery.isLoading) return <VitalsSkeleton />;
  return <VitalsForm data={vitalsQuery.data} onSave={saveVitals.mutate} />;
}
```

Genuinely shared client state goes to Zustand — read through a **narrow selector** so a component only
re-renders when *its* slice changes, one call per value:

```tsx
// ✅ re-renders only when the value this component reads changes
const mode = useTreatmentProcessStore((s) => s.mode);
const setMode = useTreatmentProcessStore((s) => s.setMode);
const search = usePatientListStore((s) => s.filters.search);
```

**Incorrect (a "god context" that fetches, stores server data, and exposes CRUD):**

```tsx
// ❌ any setState here re-renders every consumer; it also mirrors server data into React state that drifts
const PageContext = createContext<PageVM>(null!);
function PageProvider({ children, id }: { children: ReactNode; id: string }) {
  const [patient, setPatient] = useState<Patient>();
  const [vitals, setVitals] = useState<Vitals>();
  useEffect(() => {
    /* fetch patient + vitals + meds, setState each */
  }, [id]);
  const saveVitals = async (v: Vitals) => {
    await vitalService.save(v); /* then manually refetch all */
  };
  return <PageContext.Provider value={{ patient, vitals, saveVitals }}>{children}</PageContext.Provider>;
}
```

**Incorrect (selecting a whole object out of Zustand — a fresh reference every change):**

```tsx
// ❌ re-renders whenever ANYTHING on the store / in that object changes
const { mode, setMode } = useTreatmentProcessStore();
const filters = usePatientListStore((s) => s.filters);
```

**Incorrect (a global loading overlay driven by a context):**

```tsx
// ❌ one emit re-renders all consumers and blanks the whole app; it hides TanStack's per-query loading
const { setLoading } = useGlobalLoading();
setLoading(true);
await saveVitals(payload);
setLoading(false);
```

```tsx
// ✅ the mutation's own isPending drives just this control; no global spinner (see [[patterns-loading-skeletons]])
const saveVitals = useSaveVitalsMutation();
<Button disabled={saveVitals.isPending} onClick={() => saveVitals.mutate(payload)}>Lưu</Button>;
```

- **Keep CRUD in the component that triggers it** — don't drill a component's save/cancel logic down from
  a far-away orchestration hook as a `vm` object (see [[architecture-features-modules]]).
- **Reserve Context for small, near-static values** (theme, config, current user) that rarely change.

Reference: [React — Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context), [Zustand — prevent re-renders with selectors](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)
