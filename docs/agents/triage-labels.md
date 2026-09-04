# Triage Labels

The skills speak in terms of five canonical triage roles. This repo's tracker is markdown
(see [`issue-tracker.md`](./issue-tracker.md)), so a "label" here is the value of the `status`
key in a ticket's frontmatter — not a tracker object someone has to create first.

| Role in mattpocock/skills | `status:` value in this repo | Meaning                                    |
| ------------------------- | ---------------------------- | ------------------------------------------ |
| `needs-triage`            | `needs-triage`               | Not yet evaluated                          |
| `needs-info`              | `needs-info`                 | Blocked on an answer, not on other tickets |
| `ready-for-agent`         | `ready-for-agent`            | Fully specified, an agent can run it       |
| `ready-for-human`         | `ready-for-human`            | Needs a human (a dashboard, a credential)  |
| `wontfix`                 | `wontfix`                    | Will not be actioned                       |

When a skill mentions a role ("apply the AFK-ready triage label"), set `status` to the value in
the middle column.

## Two values the five roles don't cover

The five roles above all describe work that has **not started**. A tracker needs two more, and
these are the complete set — `status` never takes a value outside this table plus the five above:

| `status:` value | Meaning                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| `in-progress`   | Someone is working on it right now. Set it **before** the first edit, and save — that write is what stops a second session picking up the same ticket. `/wayfinder` calls this claiming a ticket. |
| `done`          | Implemented **and** verified, with the verification recorded in the ticket's own body. |

`done` is what makes a blocking edge expressible at all: a ticket is unblocked when every ticket its
`**Blocked by:**` line names is `done` (see [`issue-tracker.md`](./issue-tracker.md)).

`ready-for-human` is the one worth using deliberately rather than as a fallback. It means the step
genuinely cannot be automated — clicking through a third-party dashboard, entering a credential,
looking at a rendered page with human eyes. A ticket that is merely *hard* is still
`ready-for-agent`.
