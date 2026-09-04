---
title: Test What You Touch — Coverage Is Measured, Not Gated
impact: MEDIUM
impactDescription: Judgment about what deserves a test, instead of a percentage that rewards meaningless tests
tags: testing, coverage, vitest
---

## Test What You Touch — Coverage Is Measured, Not Gated

**Impact: MEDIUM**

Coverage is reported here, **not enforced**. `bun run test:coverage` prints a v8 report and writes an
HTML one; no CI job fails on a threshold. That is a deliberate divergence from the rule set this one
descends from, which gates at 80%: that number works on a large product surface, but this workspace is
mostly **Template apps meant to be copied**, and a percentage gate on scaffolding buys you tests
written to satisfy the gate rather than to catch a bug.

What replaces the gate is a rule of judgment: **when you change behaviour, cover the behaviour you
changed.** A reviewer asking "what would have caught this if it regressed?" should get an answer.

## Worth a test

- **Pure logic** — a `~/utils` helper, a Zod schema's `.refine()`, a date/format helper. Cheap, fast,
  and the highest-value thing in the repo per line.
- **A branch a user can reach** — an empty state, an error state, a permission-gated control, a
  conditional field driven by `useWatch`.
- **A bug you just fixed** — write the failing test first, watch it go red, then fix. This is the
  single most valuable test you will write, because you have proof it catches the real thing.
- **Anything with a date, a locale, or a timezone** — the failure modes are invisible in review and
  reproduce only on certain days. `TZ=UTC` is pinned inside each `vitest.config.ts` (never as a shell
  prefix, which is not valid syntax on the Windows dev box), so an assertion on a formatted date reads
  the same on every machine and in CI.

## Not worth a test

- **Markup with no logic** — a component that destructures props and renders them. The test would
  restate the JSX and break on every styling change.
- **A `@monorepo/ui` primitive's own behaviour** — that is shadcn's/Base UI's suite, not yours.
- **Anything the type system or Biome already guarantees.** A test asserting a function returns a
  `string` duplicates the compiler (see [[quality-simplicity]]).
- **A query hook's plumbing in isolation** — assert it through the component that uses it, or the test
  just re-describes TanStack Query.

**Incorrect (a test that only restates the implementation):**

```tsx
// ❌ asserts the same literals the component renders; passes even if every prop
//    is wired to the wrong field, and fails on a harmless copy change
it("renders", () => {
  render(<PatientCard patient={patient} />);
  expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
  expect(screen.getByText("1990-01-01")).toBeInTheDocument();
  expect(screen.getByText("Nam")).toBeInTheDocument();
});
```

**Correct (asserts a decision the component makes):**

```tsx
// ✅ covers the branch — the thing that can actually be wrong
it("shows the discharge action only for an admitted patient", () => {
  render(<PatientCard patient={{ ...patient, status: "admitted" }} />);
  expect(screen.getByRole("button", { name: "Cho ra viện" })).toBeInTheDocument();
});

it("hides the discharge action once discharged", () => {
  render(<PatientCard patient={{ ...patient, status: "discharged" }} />);
  expect(screen.queryByRole("button", { name: "Cho ra viện" })).not.toBeInTheDocument();
});
```

`queryBy*` returns `null` instead of throwing — it is the only correct query for asserting absence;
`getBy*` throws before your `expect` ever runs.

## Reading the report

```bash
bun run test:coverage        # every workspace, through Turbo
bun run --filter @monorepo/_template_vite test:coverage   # one of them
```

Each package or app writes its own `coverage/` directory (a text summary plus `coverage/index.html`)
next to its `vitest.config.ts`. On **Vitest 5** that path is unchanged, but the runner also writes
`.vitest/` for blob reports and test attachments — both directories are gitignored, and neither is
something to commit or point a tool at.

Read the report to **find gaps you did not know about** — a whole branch never exercised, a util
nothing touches. Do not read it as a score to raise. A file at 40% covering the two branches that
matter beats one at 95% covering getters.

## Conventions

- No threshold in `vitest.config.ts` and no coverage job in CI — keep it that way unless the team
  agrees to change the policy in a rule edit, not a config tweak.
- New behaviour, changed behaviour, or a fixed bug → a test. Pure presentation → usually not.
- Assert absence with `queryBy*`, presence with `getBy*`, and something that arrives later with
  `findBy*` (awaited).
- If a test is hard to write, treat it as a design signal before a testing problem — see the
  `codebase-design` skill and [[patterns-self-fetching-components]].

Reference: [Vitest — Coverage](https://vitest.dev/guide/coverage), [Testing Library — Appearance and Disappearance](https://testing-library.com/docs/guide-disappearance)
