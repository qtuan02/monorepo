# Issue tracker: GitHub Issues

Specs and tickets for this repo live as **GitHub issues** on
[`qtuan02/monorepo`](https://github.com/qtuan02/monorepo), driven through the `gh` CLI. `gh`
infers the repo from `git remote -v`, so every command below runs from inside a clone with no
`--repo` flag.

> **Setup is done.** `gh` 2.100.0 is installed at `C:\Program Files\GitHub CLI\`, authenticated as
> `qtuan02` with the `repo` scope, and the label set exists — see
> [`triage-labels.md`](./triage-labels.md). Issues are enabled and the repo is **public**, so an
> issue body is world-readable: keep credentials and anything customer-shaped out of one, exactly as
> you would in a committed file.
>
> One Windows gotcha worth knowing: a shell started **before** the install keeps the old `PATH`, so
> `gh` reads as "not recognized" while sitting on disk. Call it by full path, or restart the shell.

## The cut-over: `.agents/plans/` is frozen history

This repo tracked work as markdown under `.agents/plans/` until the switch. Those 3 topics and
25 numbered tickets (plus their specs) **stay exactly where they are, read-only**:

- **All new work goes to GitHub Issues.** `/to-spec`, `/to-tickets`, `/triage` and `/wayfinder`
  never write into `.agents/plans/` again.
- **`.agents/plans/` is still worth reading.** A finished ticket there records how it was
  verified — the commands run and what they returned — and `spec.md` / `decisions.md` carry
  reasoning that never made it into a rule. Cite them by path when they answer a question.
- **Do not migrate them.** Re-creating closed work as issues buys nothing; git history plus the
  files themselves are the record.
- **`.agents/settings.json` still sets `plansDirectory: ".agents/plans"`.** That is unchanged on
  purpose: Claude Code's own plan-mode output has to land somewhere, and it is scratch output —
  not a ticket. A plan file appearing there is not work anyone else can pick up.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line
  bodies.
- **Read an issue**: `gh issue view <number> --comments`.
- **List issues**:
  `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`,
  with `--label` / `--state` filters as needed.
- **Comment**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Issue bodies are written in **Vietnamese**, like every other workflow artifact (`CLAUDE.md` §7a);
technical terms stay English (Runtime, Flavor, Gate, seam, …).

## Spec and tickets — one tracking issue, N children

`/to-spec` and `/to-tickets` used to write `spec.md` + `NN-*.md` into one directory. The GitHub
shape of that same pair:

- **The spec** is one issue labelled `spec`, holding what `spec.md` held: scope, out of scope,
  the decisions already settled.
- **Each ticket** is its own issue, linked to the spec as a **sub-issue**. The endpoint takes the
  child's numeric **database id**, not its `#number`:

  ```bash
  CID=$(gh api repos/qtuan02/monorepo/issues/<child> --jq .id)
  gh api --method POST repos/qtuan02/monorepo/issues/<spec>/sub_issues -F sub_issue_id=$CID
  gh api repos/qtuan02/monorepo/issues/<spec>/sub_issues --jq '[.[].number]'   # verify
  ```

  Sub-issues are **verified working** on this repo (probed 2026-09-04). If that ever changes, the
  fallback is a task list in the spec body plus `Part of #<spec>` at the top of each child.

The issue **number** replaces the `NN-` prefix as a ticket's identity. `/implement 42` means issue
`#42`; there is no per-topic numbering any more, and no ambiguity between topics.

A ticket that is finished stays closed as history — where a closed ticket and a rule in
`.agents/rules/` disagree, **the rule wins**.

## Blocking edges

Use GitHub's **native issue dependencies** — the canonical, UI-visible representation, and the
replacement for the old `**Blocked by:**` prose line. **Verified working** on this repo (probed
2026-09-04). Like sub-issues, the endpoint takes the blocker's numeric **database id**:

```bash
BID=$(gh api repos/qtuan02/monorepo/issues/<blocker> --jq .id)
gh api --method POST repos/qtuan02/monorepo/issues/<child>/dependencies/blocked_by -F issue_id=$BID
gh api repos/qtuan02/monorepo/issues/<child>/dependencies/blocked_by --jq '[.[] | {number, state}]'
```

**Read `blocked_by`, never `total_blocked_by`.** The two live side by side in
`issue_dependencies_summary` and they are not interchangeable:

| Field              | Counts                              | Closing the blocker |
| ------------------ | ----------------------------------- | ------------------- |
| `blocked_by`       | **open** blockers — the live gate   | drops to `0`        |
| `total_blocked_by` | every blocker ever added            | stays `1`           |

A ticket is unblocked when `blocked_by` is `0`. Gating on `total_blocked_by` instead deadlocks
every ticket that ever had a blocker, permanently — it never decreases.

One timing wrinkle: the summary is eventually consistent, and reads `0` for a moment straight after
the POST. Confirm a freshly written edge against the `dependencies/blocked_by` **list** endpoint,
not the summary.

If dependencies ever become unavailable, fall back to a `Blocked by: #<n>, #<n>` line at the top of
the child body.

## When a skill says "publish to the issue tracker"

Create a GitHub issue, labelled per [`triage-labels.md`](./triage-labels.md).

## When a skill says "fetch the relevant ticket"

`gh issue view <number> --comments`. The user normally passes a bare number (`/implement 42`);
resolve it as an issue number. GitHub shares one number space with PRs, so if `gh issue view`
404s, try `gh pr view` before asking.

## When a skill says "comment on an issue"

`gh issue comment <number> --body "..."`. Record verification there — the commands run and what
they returned — before closing, so the next ticket can trust the baseline without re-deriving it.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue; the **children** are ticket issues.

- **Map**: an issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: a sub-issue of the map, labelled `wayfinder:<type>`
  (`research` / `prototype` / `grilling` / `task`).
- **Blocking**: the native dependencies above.
- **Frontier**: the map's open children, minus any with an open blocker
  (`issue_dependencies_summary.blocked_by > 0` — not `total_blocked_by`, see above) or an assignee;
  first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me` — the session's first write, and what stops a
  second session picking up the same ticket.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, `gh issue close <n>`, then append a
  one-line pointer to the map's Decisions-so-far.

## Pull requests as a triage surface

**PRs as a request surface: no.** This repo has no external contributors; PRs are the author's own
branches. `/triage` reads issues only.

_(Set this flag to `yes` if external PRs ever become a request surface; `/triage` reads it.)_
