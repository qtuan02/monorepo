---
title: Reusable Inputs Fetch Their Own Options
impact: HIGH
impactDescription: A data-backed form field owns its query, shows loading on its own control, and is dropped in with only value/onChange — never prop-drilled options.
tags: patterns, tanstack-query, forms, components
---

## Reusable Inputs Fetch Their Own Options

**Impact: HIGH (Drop-in form fields with no prop-drilled options, no form-wide fetch, no full-screen spinner)**

A form field whose choices come from the backend — a doctor picker, a department dropdown, a code-list
select — is a **self-fetching input**. It lives in `~/components/`, calls its **own** query hook from
`~/hooks/api`, transforms the response into `{ label, value }[]` via the query `select`, and shows loading
**on its own control**. To the parent it exposes only `value` / `onChange`: drop it in and it handles its
own data. This is the leaf-level form of [[patterns-self-fetching-components]] — the same principle on a
single input. The consumer never passes the option list or a loading flag.

**Correct (the input owns its query; loading shows on the control; only value/onChange leak out):**

```tsx
// ✅ ~/components/select-department.tsx — built on @monorepo/ui/components/select
type SelectDepartmentProps = { value?: string; onChange: (value: string) => void };

export function SelectDepartment({ value, onChange }: SelectDepartmentProps) {
  const { data: options = [], isFetching } = useDepartmentListQuery(undefined, {
    select: (res) => res.map((d) => ({ label: d.name, value: d.id })), // → { label, value }[]
  });

  return (
    <Select value={value} onValueChange={onChange} disabled={isFetching}>
      <SelectTrigger>
        {isFetching ? <Loader2 className="size-4 animate-spin" /> : <SelectValue placeholder="Chọn khoa" />}
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

```tsx
// ✅ any form drops it in — no options prop, no loading prop, no query in the page
<SelectDepartment value={deptId} onChange={setDeptId} />
```

A field whose options **depend** on another value gates with `enabled` (the data dependency, not
open/closed) and transforms in the same `select`:

```tsx
const { data: options = [], isFetching } = useCodeListQuery(
  { key: "TreatmentDoctor", deptId },
  { enabled: !!deptId, select: (res) => res.map((d) => ({ label: d.name, value: d.id })) },
);
```

**Incorrect (imperative fetch inside the input — bypasses the cache, no dedupe, refetches every mount):**

```tsx
// ❌ raw service call in an effect; the dropdown shows nothing until it resolves, and never caches
const [list, setList] = useState<{ label: string; value: string }[]>([]);
useEffect(() => {
  lookupService.getList({ key: "TreatmentDoctor", deptId }).then(setList);
}, [deptId]);
```

**Incorrect (parent fetches the list and prop-drills `options` + `loading` — couples every consumer):**

```tsx
// ❌ turns the input back into a dumb <Select> and ties every page that uses it to the fetch
const { data: doctors, isFetching } = useCodeListQuery({ key: "TreatmentDoctor", deptId });
<SelectDoctor options={doctors} loading={isFetching} value={value} onChange={onChange} />;
```

- **Transform to options in the hook**, via `select`, so every consumer shares the `{ label, value }[]`
  shape and the page holds no query (see [[tanstack-consume-query]]).
- **Loading shows on the control**, not the page — a spinner in the trigger while `isFetching`; the rest
  of the form stays interactive. Never a full-screen spinner for one field's request.
- **No form-wide context or god-hook that loads every lookup up front** — one provider fetching doctors +
  departments + rooms re-renders the whole form on any change (see [[patterns-hooks-over-context]]). Each
  input fetches itself, on its own mount.
- **A searchable/server-paginated lookup** uses `@monorepo/ui/components/combobox` over `useInfiniteQuery`
  with the search box debounced (see [[patterns-debounce-search-input]], [[tanstack-consume-infinite]]).
- **A picker that opens to choose** defers its fetch by **mount-gating** the body (see
  [[patterns-fetch-on-mount]]).

Reference: [TanStack Query — `select`](https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations#select), [`packages/ui/src/components/select.tsx`](../../packages/ui/src/components/select.tsx)
