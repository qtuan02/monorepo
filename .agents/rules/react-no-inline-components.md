---
title: Never Define Components Inside Other Components
impact: CRITICAL
impactDescription: Inline component declarations remount on every parent render — state is lost, inputs flicker, effects refire.
tags: react, components, render, performance, lifecycle
---

## Never Define Components Inside Other Components

**Impact: CRITICAL (Inline component definitions break component identity; every render mounts a fresh tree)**

A component declared inside the render body of another component is a **new function reference every render**. React identifies components by reference, so a new reference means React tears down the whole subtree (unmount → mount) and throws away its local state, refs, effects, and animations. This does not error — it just makes everything subtly broken (inputs lose focus, lists reset, transitions restart). Lift the inner component to module scope and pass what it needs as props.

**Incorrect (every render of `PatientTemplate` remounts `Header` and `EmptyState`):**

```tsx
// ❌ Header/EmptyState are re-created each render → their state/refs are destroyed each render
export function PatientTemplate() {
  const [search, setSearch] = React.useState("");

  function Header() {
    return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
  }
  const EmptyState = () => <p className="text-muted-foreground">No patients yet</p>;

  return <div><Header />{list.length ? <List /> : <EmptyState />}</div>;
}
```

**Correct (components at module scope; parent state passed in as props):**

```tsx
// ✅ Stable identity across renders — state/refs survive
type HeaderProps = { search: string; onSearchChange: (next: string) => void };

function Header({ search, onSearchChange }: HeaderProps) {
  return <input value={search} onChange={(e) => onSearchChange(e.target.value)} />;
}

function EmptyState() {
  return <p className="text-muted-foreground">No patients yet</p>;
}

export function PatientTemplate() {
  const [search, setSearch] = React.useState("");
  return (
    <div>
      <Header search={search} onSearchChange={setSearch} />
      {list.length ? <List /> : <EmptyState />}
    </div>
  );
}
```

- A component is anything that returns JSX and starts with a capital letter — declare every one at module scope, never inside another component, hook, callback, conditional, or `.map()`.
- A one-off JSX snippet assigned to a variable (`const headerNode = <h1>{title}</h1>`) is fine — that is JSX, not a component.
- If a helper needs `useState`/`useEffect` or takes props and is reused, it is a component — promote it to module scope.
- Render list items via JSX (`<Row item={item} />`), never by invoking the function (`Row({ item })`).

Reference: [React docs — Defining a component](https://react.dev/learn/your-first-component#nesting-and-organizing-components)
