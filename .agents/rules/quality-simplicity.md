---
title: Prioritize Clarity Over Cleverness
impact: HIGH
impactDescription: Reduces cognitive load and keeps the codebase quick to read and change
tags: quality, simplicity, readability
---

## Prioritize Clarity Over Cleverness

**Impact: HIGH (Simple, readable code lowers cognitive load for everyone who touches it)**

The goal is code that is easy to read and understand quickly, not elegant complexity. Simple systems
reduce the cognitive load for every engineer — favour the obvious version over the terse one, even when
the terse one is fewer characters.

**Questions to ask yourself:**

- Am I actually solving the problem at hand?
- Am I thinking too much about possible future use cases?
- Have I considered at least one other alternative? How does it compare?

**Incorrect (clever but hard to parse):**

```typescript
// ❌ a spread inside reduce — allocates a fresh object per item and buries the intent
const result = data.reduce((a, b) => ({ ...a, [b.id]: (a[b.id] || []).concat(b) }), {});
```

**Correct (clear, step-by-step):**

```typescript
// ✅ a plain loop — obvious what it builds, and O(n) instead of O(n²)
const groupedById: Record<string, Item[]> = {};

for (const item of data) {
  if (!groupedById[item.id]) {
    groupedById[item.id] = [];
  }
  groupedById[item.id].push(item);
}
```

Simple does not mean anemic — ship the full feature, just express it in the most direct way. Clear code
also needs fewer comments to explain itself (see [[quality-code-comments]]).
