---
title: useEffect Is Only For Syncing To External Systems
impact: CRITICAL
impactDescription: Misused effects are the leading cause of infinite loops, stale UI, and double-renders.
tags: react, useeffect, side-effects, derived-state
---

## useEffect Is Only For Syncing To External Systems

**Impact: CRITICAL (Most `useEffect`s shouldn't exist; the ones that should are easy to spot)**

`useEffect` exists to synchronize React with an **external system**: the DOM, a `window`/media listener, a timer, a WebSocket, `localStorage`, the document title. It is **not** for computing values, fetching data, resetting state, or notifying a parent. If the effect body could run from an event handler or during render, it should not be an effect. Fetching in particular goes through TanStack Query — see [[tanstack-consume-query]], [[patterns-self-fetching-components]].

**Incorrect (effects doing work the render phase / cache / event handler already does):**

```tsx
// ❌ deriving state in an effect → two renders, drifting copy
const [fullName, setFullName] = React.useState("");
React.useEffect(() => setFullName(`${p.first} ${p.last}`), [p]);

// ❌ fetching in an effect → no cache, no dedupe, races
const [items, setItems] = React.useState<Patient[]>([]);
React.useEffect(() => { patientService.list().then(setItems); }, []);

// ❌ notifying the parent from an effect → fires a render late
React.useEffect(() => { if (selectedId) onSelect?.(selectedId); }, [selectedId]);
```

**Correct (compute in render; data via the query hook; notify in the handler):**

```tsx
// ✅ derived value is a plain const
const fullName = `${p.first} ${p.last}`;

// ✅ server state via TanStack Query
const { data: items = [] } = usePatientsQuery();

// ✅ notify in the event that produced the change
const handleSelect = (next: string) => {
  setSelectedId(next);
  onSelect?.(next);
};
```

- Legitimate effects: connecting/disconnecting a socket or listener, focusing an input after navigation, setting `document.title`, subscribing to a `window` event. Every subscription effect must return a cleanup.
- Reset state on prop change with a `key` prop, not an effect (`<Detail key={patientId} />`).
- Never declare an `async` effect callback directly — use an inner IIFE: `useEffect(() => { void (async () => { … })(); }, [])`.

Reference: [React docs — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
