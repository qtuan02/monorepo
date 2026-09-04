# Issue tracker: local markdown in `.agents/plans/`

Specs and tickets for this repo live as markdown files under `.agents/plans/`. There is no
GitHub Issues, no GitLab Issues, and no `gh`/`glab` CLI in this workflow — this is a solo repo,
and a tracker that lives in the same commit as the code is one less service to keep in sync.

> `.agents/plans/` is also what `.agents/settings.json` sets as Claude Code's `plansDirectory`,
> so plan-mode output and the tracker land in the same tree by construction.

## Layout

One **topic** per directory. Everything about that piece of work stays inside it:

```
.agents/plans/
└── <topic-slug>/                 ← one effort: a spec and the tickets that implement it
    ├── spec.md                   ← the spec (written by /to-spec)
    ├── 01-<slug>.md              ← tickets (written by /to-tickets), numbered from 01
    ├── 02-<slug>.md
    ├── …
    ├── CONTEXT.md                ← optional: glossary drafted while grilling, before it
    │                               moves to the workspace it belongs to
    ├── decisions.md              ← optional: what /grill-with-docs settled, and why
    └── adr/                      ← optional: ADRs drafted here, moved to docs/adr/ when the
                                    first ticket runs
```

The number prefix is the ticket's identity. "Ticket 07" means `07-<slug>.md` in the topic
directory currently being worked on; a skill invoked as `/implement 07` resolves it that way.

## Frontmatter

Every `spec.md` and every `NN-*.md` opens with YAML frontmatter carrying at least `status`:

```markdown
---
status: ready-for-agent
---

# 07 — Template app on Vite
```

[`triage-labels.md`](./triage-labels.md) holds the complete set of `status` values — the five
canonical triage roles plus `in-progress` and `done` — and `status` never takes a value outside it.
A ticket that is `done` records **how** it was verified in its own body: the commands run and what
they returned, so the next ticket can trust the baseline without re-deriving it.

A spec may carry more frontmatter keys when they are useful (`date`, `adr`, `research`,
`decisions`, `glossary`); only `status` is required.

## Blocking edges

A ticket names its blockers in the body, as prose under a `**Blocked by:**` line:

```markdown
**Blocked by:** 05 — the UI package; 06 — Storybook.
```

A ticket is unblocked when every ticket it names is `status: done`. There is no tooling that
enforces this — the numbers are the whole mechanism, which is why they are stable.

## When a skill says "publish to the issue tracker"

Write a new file under `.agents/plans/<topic-slug>/`, creating the directory if it does not exist.
A spec goes to `spec.md`; tickets go to `NN-<slug>.md` numbered from `01`.

## When a skill says "fetch the relevant ticket"

Read the file. The user normally passes a number (`/implement 07`) or a path. With a bare number,
resolve it against the topic directory the conversation is already working in; if more than one
topic directory could match, ask rather than guess.

## When a skill says "comment on an issue"

Append to the file, under a `## Notes` (or `## Còn treo`) heading at the bottom. Commit the edit
with the work it describes — the file's history *is* the comment thread.

## Wayfinding operations

Used by `/wayfinder`. The **map** is one file; the **children** are tickets beside it.

- **Map**: `.agents/plans/<topic-slug>/map.md`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: `NN-<slug>.md` in the same directory, with `status` in frontmatter and a
  `type` key recording `research` / `prototype` / `grilling` / `task`.
- **Blocking**: the `**Blocked by:**` line above.
- **Frontier**: the lowest-numbered ticket that is unblocked and still `ready-for-agent`.
- **Claim**: set `status: in-progress` and save it before doing any work — that write is what stops
  a second session picking up the same ticket.
- **Resolve**: append the answer under an `## Answer` heading, set `status: done`, then append a
  one-line pointer to the map's Decisions-so-far.

## Merge requests / PRs as a triage surface

**No.** This repo has no external contributors; PRs are the author's own branches. `/triage` reads
only the files under `.agents/plans/`.
