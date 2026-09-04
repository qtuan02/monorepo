# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the
codebase.

This is a **multi-context** repo: contexts are the Bun/Turborepo **workspaces**
(`apps/*`, `packages/*`, `tooling/*`), not `src/<context>` folders.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it points at one `CONTEXT.md` per context. Read each one
  relevant to the topic.
- The **`CONTEXT.md`** of any workspace you are about to work in (e.g.
  `apps/_template_next/CONTEXT.md`, `packages/ui/CONTEXT.md`).
- **`docs/adr/`** at the repo root for system-wide decisions, plus the workspace's own `docs/adr/`
  for context-scoped ones.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest
creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and
`/improve-codebase-architecture`) creates them lazily, when a term or a decision actually gets
resolved.

## File structure

```
/
├── CONTEXT-MAP.md                     ← points at each context (grown lazily)
├── CONTEXT.md                         ← the root context: Runtime, Flavor, Template app, Gate, …
├── docs/adr/                          ← system-wide decisions
├── apps/
│   └── _template_vite/
│       ├── CONTEXT.md
│       └── docs/adr/                  ← app-specific decisions
└── packages/
    └── <pkg>/
        ├── CONTEXT.md
        └── docs/adr/                  ← package-specific decisions
```

## Use the glossary's vocabulary

When your output names a domain concept (a ticket title, a refactor proposal, a hypothesis, a test
name), use the term as the relevant `CONTEXT.md` defines it, and avoid the synonyms it lists under
_Avoid_. The root glossary is load-bearing here: **Runtime**, **Flavor**, **Template app**,
**Skeleton** and **Gate** each mean something narrower than their everyday reading, and the whole
repo is organised around those distinctions.

If the concept you need isn't in a glossary yet, that's a signal — either you're inventing language
the project doesn't use (reconsider), or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-NNNN (its title) — but worth reopening because…_
