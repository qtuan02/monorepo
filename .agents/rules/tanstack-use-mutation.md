---
title: TanStack Query v5 useMutation Object Arguments & Type-Safe Options
impact: HIGH
impactDescription: Prevents runtime crashes and accidental override of mutationFn; the global toast surfaces every write failure.
tags: tanstack-query, react, mutation
---

## TanStack Query v5 useMutation Object Arguments & Type-Safe Options

**Impact: HIGH (Prevents runtime errors, silent option overrides, and swallowed failures)**

In TanStack Query v5, `useMutation` takes a single object argument. The `mutationFn` must be a function reference — never an immediately-invoked call. Type the `options` parameter with `UseMutationOptionsWrapper` (it omits `mutationFn`/`mutationKey` so callers cannot override them) and spread `...options` **after** `mutationFn`.

A **global** `MutationCache.onError` in [`~/libs/query-client.ts`](../../apps/_template_vite/src/libs/query-client.ts) already toasts **every** mutation failure once — `toast.add({ title: error instanceof HttpError ? error.message : "Đã có lỗi xảy ra, vui lòng thử lại.", type: "error" })` (`toast` from `@monorepo/ui/components/toast`, `HttpError` from `@monorepo/api`). So a mutation hook must **not** add its own error-toast `onError` — that double-toasts. Give a hook an `onError` only for extra recovery (rolling back an optimistic update paired with `onMutate`, focusing a field), never to re-toast. Refresh affected queries from `onSuccess` via the entity's `<entity>QueryKeys` factory (see [[tanstack-consume-mutation]]).

**Incorrect:**

```typescript
// ❌ v4 style: separate positional arguments — throws at runtime in v5
useMutation(patientService.create, {
  onSuccess: () => queryClient.invalidateQueries({ queryKey: patientQueryKeys.all }),
});

// ❌ mutationFn called immediately — returns a Promise value, not a function
useMutation({ mutationFn: patientService.create(payload), ...options });

// ❌ ...options spread BEFORE mutationFn — caller options can silently override mutationFn
useMutation({ ...options, mutationFn: patientService.create });

// ❌ Raw UseMutationOptions exposes mutationFn — callers can override it
export function useCreatePatientMutation(
  options?: UseMutationOptions<Patient, Error, CreatePatientPayload>,
) {
  return useMutation({ mutationFn: patientService.create, ...options });
}

// ❌ Re-toasting in the hook — the global MutationCache.onError already toasted this failure
export function useCreatePatientMutation() {
  return useMutation({
    mutationFn: patientService.create,
    onError: (error) =>
      toast.add({
        title: error instanceof HttpError ? error.message : "…",
        type: "error",
      }), // duplicate toast
  });
}
```

**Correct:**

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UseMutationOptionsWrapper } from "~/libs/query-key-factory";
import { patientService } from "~/libs/http-client";

// UseMutationOptionsWrapper omits mutationFn/mutationKey — callers cannot override them.
// No error toast here — the global MutationCache.onError surfaces every failure once.
export function useCreatePatientMutation(
  options?: UseMutationOptionsWrapper<CreatePatientPayload, Patient>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.all }),
    ...options,
  });
}

// Explicit generics + lifecycle hooks for optimistic updates.
// onError is for ROLLBACK only (paired with onMutate) — the global handler already toasted.
export function useUpdatePatientMutation(
  options?: UseMutationOptionsWrapper<
    { id: string; payload: UpdatePatientPayload },
    Patient,
    Error,
    PatientMutationContext
  >,
) {
  return useMutation<Patient, Error, { id: string; payload: UpdatePatientPayload }, PatientMutationContext>({
    mutationFn: ({ id, payload }) => patientService.update(id, payload),
    onMutate: async (vars) => {
      // snapshot the current cache + apply the optimistic update → return it as context
    },
    onError: (_error, _vars, context) => {
      // ✅ roll back from context; do NOT toast — the global MutationCache.onError did
    },
    ...options,
  });
}
```

Reference: [TanStack Query v5 — useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/useMutation)
