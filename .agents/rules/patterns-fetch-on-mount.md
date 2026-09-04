---
title: Fetch on Mount, Never Before
impact: HIGH
impactDescription: A component fetches its own data when it mounts — never pre-loaded in a parent, a navigation handler, or while it is still hidden.
tags: patterns, react-router, tanstack-query, navigation, rendering
---

## Fetch on Mount, Never Before

**Impact: HIGH (Instant navigation and work paid only where it renders — no frozen pages, no wasted requests)**

A component's data is fetched **when that component mounts** — not earlier. Nothing pre-loads another
component's data: not a parent, not the handler that navigates to it, not code that runs while the
component is still hidden. A TanStack Query hook fires on mount, dedupes against the cache, and the
component renders its own skeleton until the data lands. Three consequences, in order of how often they bite:

1. **Navigate first, let the destination fetch on mount** — a page hands off the moment its own job is
   done; it never fetches the next page's data before routing.
2. **Inside a page, each part fetches on its own mount** — never hoist every read into the parent (see
   [[patterns-self-fetching-components]]).
3. **Defer a hidden part's fetch by mount-gating it** — a dialog/dropdown/tab body only mounts when it
   opens (`{open && <Body/>}`), so its on-mount query fires exactly then. Gate the *mounting*, not with
   `enabled: isOpen`.

**Incorrect (fetch the next page's data before navigating — the user waits on the *current* page):**

```tsx
// ❌ sign-in awaits getInfo + more APIs, THEN navigates — Home appears only after all calls finish
const token = await authService.signIn(payload);
setAccessToken(token);
const user = await userService.getInfo();
await Promise.all([functionService.getList(), permissionService.getByEmployee(user.employeeId)]);
navigate(ROUTES.home, { replace: true });
```

**Correct (navigate the moment the token is stored; the destination fetches on mount):**

```tsx
// ✅ sign-in handler — authenticate, store token, navigate. Nothing else.
const navigate = useNavigate();
async function onSignIn(payload: SignInPayload) {
  const token = await signInMutation.mutateAsync(payload); // the button shows loading
  if (!token) return;
  setAccessToken(token);
  navigate(ROUTES.home, { replace: true }); // Home fetches everything else on mount
}
```

Mount-gate a hidden part — a picker's list should load when the user opens it, not while the form first
renders. Only mount the body when open; its own on-mount query then fires exactly once, on open:

```tsx
// ✅ the body (and its query) only exists while the dialog is open
function DoctorPicker({ deptId }: { deptId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Chọn bác sĩ</Button>
      {open && <DoctorPickerBody deptId={deptId} onClose={() => setOpen(false)} />}
    </>
  );
}

function DoctorPickerBody({ deptId }: { deptId?: string }) {
  // fires on mount = the moment it opened; `enabled` is for the data dependency, not open/closed
  const { data = [] } = useCodeListQuery({ key: "TreatmentDoctor", deptId }, { enabled: !!deptId });
  return <ul>{data.map((d) => <li key={d.value}>{d.label}</li>)}</ul>;
}
```

- **`enabled` is for data dependencies** (`enabled: !!deptId` — wait for an id), never for open/closed
  state. Reach for mount-gating to defer work until something is shown (see [[patterns-self-fetching-inputs]]).
- **Optional — warm the cache without blocking:** if a navigation is known to be slow, prefetch into the
  same cache as fire-and-forget; never `await` it before navigating.

```tsx
// ✅ prefetch (do NOT await) then navigate immediately
const queryClient = useQueryClient();
queryClient.prefetchQuery({ queryKey: userQueryKeys.info(), queryFn: () => userService.getInfo() });
navigate(ROUTES.home, { replace: true });
```

Reference: [Prefetching](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching), [React Router — `useNavigate`](https://reactrouter.com/api/hooks/useNavigate)
