# Triage Labels

The skills speak in terms of five canonical triage roles. This repo's tracker is **GitHub Issues**
(see [`issue-tracker.md`](./issue-tracker.md)), so a label here is a real repository label that
has to exist before it can be applied.

| Role in mattpocock/skills | Label in this repo | Meaning                                    |
| ------------------------- | ------------------ | ------------------------------------------ |
| `needs-triage`            | `needs-triage`     | Not yet evaluated                          |
| `needs-info`              | `needs-info`       | Blocked on an answer, not on other issues  |
| `ready-for-agent`         | `ready-for-agent`  | Fully specified, an agent can run it       |
| `ready-for-human`         | `ready-for-human`  | Needs a human (a dashboard, a credential)  |
| `wontfix`                 | `wontfix`          | Will not be actioned                       |

The label string equals the role name, so when a skill mentions a role ("apply the AFK-ready
triage label"), use it verbatim: `gh issue edit <n> --add-label ready-for-agent`.

Exactly one of the five is on an open issue at a time — moving an issue means adding the new one
and removing the old (`--add-label` … `--remove-label` …).

`ready-for-human` is the one worth using deliberately rather than as a fallback. It means the step
genuinely cannot be automated — clicking through a third-party dashboard, entering a credential,
looking at a rendered page with human eyes. An issue that is merely *hard* is still
`ready-for-agent`.

## The two states that are not labels

The five roles all describe work that has **not started**. A tracker needs two more, and on
GitHub they are built in — do **not** create labels for them:

| State         | How it is expressed on GitHub                                                             |
| ------------- | ----------------------------------------------------------------------------------------- |
| `in-progress` | The issue has an **assignee**. `gh issue edit <n> --add-assignee @me`, as the session's first write — that write is what stops a second session picking up the same issue. `/wayfinder` calls this claiming a ticket. |
| `done`        | The issue is **closed**, with the verification recorded in a comment first (the commands run and what they returned). |

Closed-state is what makes a blocking edge expressible: GitHub's
`issue_dependencies_summary.blocked_by` counts open blockers only, so an issue is unblocked when
every blocker is closed (see [`issue-tracker.md`](./issue-tracker.md)).

> Under the previous markdown tracker these two were `status:` values in a ticket's front-matter.
> The frozen files under `.agents/plans/` still carry them; read them as history, not as a shape
> to reproduce.

## Two labels the workflow also uses

Not triage roles — structural, applied by `/to-spec` and `/wayfinder`:

| Label            | Applied to                                                     |
| ---------------- | -------------------------------------------------------------- |
| `spec`           | The tracking issue a `/to-spec` run produces; its tickets are sub-issues |
| `wayfinder:map`  | A `/wayfinder` map issue                                        |
| `wayfinder:research` · `wayfinder:prototype` · `wayfinder:grilling` · `wayfinder:task` | A wayfinder child ticket, one per type |

## Creating them

**Already created** on `qtuan02/monorepo` — this section is the reproduction recipe, not a to-do.

The color and description are part of the definition: `gh label create` with a bare name picks a
**random** color and leaves the description empty, so re-running the short form would silently
repaint the set and drop every description. Keep the triples.

```bash
while IFS='|' read -r name color desc; do
  [ -z "$name" ] && continue
  gh label create "$name" --color "$color" --description "$desc" --force
done <<'LABELS'
needs-triage|d4c5f9|Not yet evaluated
needs-info|fbca04|Blocked on an answer, not on other issues
ready-for-agent|0e8a16|Fully specified, an agent can run it
ready-for-human|1d76db|Needs a human (a dashboard, a credential)
wontfix|ffffff|Will not be actioned
spec|5319e7|Tracking issue from /to-spec; its tickets are sub-issues
wayfinder:map|b60205|A /wayfinder map issue
wayfinder:research|006b75|Wayfinder child ticket: research
wayfinder:prototype|bfd4f2|Wayfinder child ticket: prototype
wayfinder:grilling|d93f0b|Wayfinder child ticket: grilling
wayfinder:task|c2e0c6|Wayfinder child ticket: task
LABELS
```

`--force` updates a label that already exists rather than failing, which is what makes the block
re-runnable — `wontfix` ships with every new GitHub repo and is updated in place here. Verify with
`gh label list`.
