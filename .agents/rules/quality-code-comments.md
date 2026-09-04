---
title: Code Comment Guidelines
impact: MEDIUM
impactDescription: Excessive comments add noise; missing "why" comments hurt maintainability
tags: comments, documentation, readability
---

## Code Comment Guidelines

**Impact: MEDIUM (Comment the "why"; let clear code carry the "what")**

Keep comments limited and avoid obvious ones. A comment should explain **why** the code is the way it
is — the code itself already says **what** it does. If the function name, parameters, and return type
make the intent clear, skip the comment entirely.

## When to Comment

- A business decision or domain rule that isn't visible in the code.
- A workaround, or a non-obvious ordering, with the reason it's needed.
- A non-obvious performance choice or security consideration.
- Troubleshooting context — why this approach was chosen after another failed.

## When NOT to Comment

```typescript
// ❌ Bad — restates the code
// Get the access token
const accessToken = useAuthStore.getState().accessToken;

// ❌ Bad — narrates the obvious
// Loop through patients
for (const patient of patients) {
  renderRow(patient); // Render the patient
}
```

## Good Examples

These mirror the comment style already in the codebase — each explains a decision the code can't:

```typescript
// ✅ Explains a why, not a what (packages/i18n/src/i18next/create-i18n.ts)
// Inert while ICU is active — i18next's interpolator never runs. Kept so the
// setting is correct again the day ICU is removed, and because React already
// escapes values either way.
interpolation: { escapeValue: false },

// ✅ Documents a load-bearing ordering constraint (packages/dayjs/src/dayjs.ts)
// `timezone` builds on the offset helpers `utc` installs — it must extend after it.
dayjs.extend(utc);
dayjs.extend(timezone);

// ✅ Explains a non-obvious choice the code can't show (header-clock.tsx)
// A timestamp rather than a dayjs instance: an instance freezes the locale it
// was built with, so it would keep rendering the old weekday.
const [now, setNow] = useState(() => Date.now());
```

If none of the "when to comment" cases apply, delete the comment — clear names and types
(see [[quality-simplicity]]) beat narration every time.
