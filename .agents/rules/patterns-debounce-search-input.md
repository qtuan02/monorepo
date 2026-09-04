---
title: Debounce Search Inputs with `@monorepo/hook`
impact: HIGH
impactDescription: Without it, every keystroke re-filters a list or re-fires a query — janky typing and request storms on server-backed search.
tags: patterns, performance, search, debounce, tanstack-query
---

## Debounce Search Inputs with `@monorepo/hook`

**Impact: HIGH (Without it, every keystroke re-filters a list or re-fires a query)**

Any search/filter text input — a list's search box, a combobox's query field — must not drive filtering or
an API call on **every keystroke**. Debounce it with `useDebounce` from
[`@monorepo/hook/use-debounce`](../../packages/hook/src/use-debounce.ts): `useDebounce<T>(value, delay)`
returns the value `delay`ms after it last changed. Never hand-roll a `setTimeout` / `lodash.debounce` in a
component — the hook already cleans up its pending timer on unmount. The visible input **always binds to
the immediate value**; only the value used for filtering/fetching is debounced.

## Shape A — debounce the value feeding a client-side filter (~300ms)

When the input filters data **already in memory**, keep the raw value in `useState` for instant typing, and
debounce the value used in the `useMemo` filter so it only recomputes after typing pauses:

```tsx
// ✅ the <Input> binds to `search` (never lags); the filter recomputes on the debounced value
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 300);

const filtered = useMemo(
  () => list.filter((i) => (i.fullName ?? "").includes(debouncedSearch)),
  [list, debouncedSearch],
);

<Input value={search} onChange={(e) => setSearch(e.target.value)} />;
```

## Shape B — debounce the value feeding a query (~500ms)

When typing should eventually call a query hook (see [[tanstack-consume-query]]), keep the input's text in
local state so it never lags, and feed the **debounced** value into the query params:

```tsx
// ✅ `debouncedSearch` — not `search` — goes into the query key, so a request only fires once typing settles
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);

const listQuery = useCodeListQuery({ key: "TreatmentDoctor", search: debouncedSearch });

<Input value={search} onChange={(e) => setSearch(e.target.value)} />;
```

**Incorrect (no debounce — filters or fetches on every keystroke):**

```tsx
// ❌ recomputes the filter mid-word on every keystroke
const filtered = useMemo(() => list.filter((i) => i.fullName?.includes(search)), [list, search]);

// ❌ a request per keystroke — a storm while the user is still typing
const listQuery = useCodeListQuery({ key: "TreatmentDoctor", search }); // search updates every onChange
```

**Incorrect (hand-rolled debounce instead of the shared hook):**

```tsx
// ❌ bespoke setTimeout — reinvents use-debounce, easy to leak the timer
useEffect(() => {
  const t = setTimeout(() => setQuerySearch(search), 500);
  return () => clearTimeout(t);
}, [search]);
```

**Incorrect (binding the input to the debounced value — typing itself lags):**

```tsx
// ❌ the field is bound to the debounced value, so keystrokes visibly trail typing
const debounced = useDebounce(search, 300);
<Input value={debounced} onChange={(e) => setSearch(e.target.value)} />; // should bind to `search`
```

- **Import from `@monorepo/hook/use-debounce`** — value form only; there is no `useDebouncedCallback`
  on web, so debounce the value rather than the callback (see [[quality-avoid-barrel-imports]]).
- **Typical delay:** ~300ms for a client-side filter, ~500ms for a network-triggered search — tune per
  page, don't default to `0`.
- **The debounced value still goes through the query hook's normal `queryKey`** (see
  [[tanstack-key-factory]]) — don't bypass the hook to fetch imperatively.
- **Self-fetching inputs** with a search box own this debounce internally; the caller never re-implements
  it (see [[patterns-self-fetching-inputs]]).

Reference: [`packages/hook/src/use-debounce.ts`](../../packages/hook/src/use-debounce.ts)
