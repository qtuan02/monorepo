---
title: Consuming Mutation Hooks in Components
impact: HIGH
impactDescription: Reliable writes, correct cache invalidation, and every failure surfaced exactly once.
tags: tanstack-query, react, hooks, mutations
---

## Consuming Mutation Hooks in Components

**Impact: HIGH (Reliable writes, correct invalidation, no swallowed or duplicate error toasts)**

Writes go through the `useXxxMutation` hooks in `~/hooks/api/<entity>.ts` — never a raw service call inside a handler (see [[tanstack-use-mutation]]). Trigger a mutation with `mutate` (fire-and-forget + callbacks) or `mutateAsync` (awaitable — when you need the result inline or must sequence calls), and read `isPending` for the in-flight state.

### Triggering the mutation

```tsx
const createPatient = useCreatePatientMutation();

// ✅ Fire-and-forget + callbacks — the usual form submit
createPatient.mutate(payload);

// ✅ Awaitable — read the result inline or chain several writes
const result = await createPatient.mutateAsync(payload);
```

**Incorrect:**

```tsx
// ❌ Calling the service directly — no isPending state, no cache integration,
//    and it never reaches the global mutation-error toast
async function onSubmit(values) {
  await patientService.create(values);
}

// ❌ v4 flag — a mutation's in-flight flag is `isPending` in v5, not `isLoading`
<Button disabled={createPatient.isLoading} />;

// ❌ mutateAsync rejects on failure; unawaited/uncaught it becomes an unhandled rejection
createPatient.mutateAsync(payload);
```

**Correct (disable while pending; await inside try/catch when you need the result):**

```tsx
const createPatient = useCreatePatientMutation();

<Button
  disabled={createPatient.isPending}
  onClick={() => createPatient.mutate(payload)}
/>;

try {
  const result = await createPatient.mutateAsync(payload);
} catch {
  // The failure was already toasted by the global MutationCache handler — keep the dialog open, etc.
}
```

### Success / error handling + invalidation

A **global** `MutationCache.onError` in [`~/libs/query-client.ts`](../../apps/_template_vite/src/libs/query-client.ts) toasts **every** mutation failure once — you never call `toast.add(...)` for a write yourself. Add an `onError` (in the hook or at the call site) **only** for custom recovery: rolling back an optimistic update you started in `onMutate`, or focusing the field that failed. Refresh affected queries from `onSuccess` via the entity's `<entity>QueryKeys` factory (see [[tanstack-consume-query]], [[tanstack-key-factory]]).

Call-site callbacks passed to `mutate(payload, { onSuccess, onError })` fire **alongside** the hook's callbacks in v5 — and the global toast fires regardless — so use them for view-local logic (close a dialog, reset the form), never to re-toast.

**Incorrect:**

```tsx
// ❌ Re-toasting a failure the global MutationCache.onError already showed — duplicate toast
createPatient.mutate(payload, {
  onError: (error) =>
    toast.add({
      title: error instanceof HttpError ? error.message : "Lỗi",
      type: "error",
    }),
});

// ❌ Inline key array drifts from the factory
onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patient", "list"] });
```

**Correct (invalidate in the hook; the global handler toasts; `onError` only for recovery):**

```tsx
// In ~/hooks/api/patient.ts — invalidate in onSuccess; NO error toast, the global handler owns it
export function useCreatePatientMutation(
  options?: UseMutationOptionsWrapper<CreatePatientPayload, Patient>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientService.create,
    // ✅ Refresh the entity's cache so its lists/details reflect the write
    onSuccess: () => queryClient.invalidateQueries({ queryKey: patientQueryKeys.all }),
    ...options,
  });
}

// In the component — call-site logic fires alongside the hook's callbacks (still no re-toast)
createPatient.mutate(payload, { onSuccess: () => setOpen(false) });

// ✅ onError only for recovery — roll back an optimistic update (the global toast already fired)
updatePatient.mutate(payload, { onError: () => rollbackOptimisticRow() });
```

Reference: [Invalidation From Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations), [useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation)
