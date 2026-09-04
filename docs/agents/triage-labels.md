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

## One value the five roles don't cover

`done` — the ticket has been implemented **and** verified, with the verification recorded in its
own body. The five roles above all describe work that has not started; nothing in them says
"finished", and a tracker that cannot say so cannot express a blocking edge
(see `**Blocked by:**` in [`issue-tracker.md`](./issue-tracker.md)).

`ready-for-human` is the one worth using deliberately rather than as a fallback. It means the step
genuinely cannot be automated — clicking through a third-party dashboard, entering a credential,
looking at a rendered page with human eyes. A ticket that is merely *hard* is still
`ready-for-agent`.
