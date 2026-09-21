# Workflow — skills, repo overrides, tracker, authoring

The long form behind `CLAUDE.md` §4. Read this before running any workflow skill: `/research` → design →
`/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review` → `/handoff`. The
human-facing walkthrough (Vietnamese) is [`docs/guides/skills-workflow.md`](../docs/guides/skills-workflow.md).

## §1 · Skills (`.agents/skills/`)

A skill is a scenario-shaped guide — longer than a rule, narrower than a doc — at `skills/<name>/SKILL.md`.
All 38 are **vendored** (real files in the repo). They come from three owners, and only the first is in
[`skills-lock.json`](../skills-lock.json):

| Owner | Skills | Re-sync with | Lock |
|---|---|---|---|
| `mattpocock/skills` (23) + `vercel-labs/agent-skills` (2) | the workflow chain, `tdd`, `vercel-react-best-practices`, `web-design-guidelines`, … | `npx skills@latest update <name>` | pinned by source + content hash |
| GitNexus (6) | `gitnexus-*` | `npx gitnexus analyze` (also rewrites the block at the bottom of `CLAUDE.md`) | none |
| `nextlevelbuilder/ui-ux-pro-max-skill` (7) | `ui-ux-pro-max` + `banner-design` `brand` `design` `design-system` `slides` `ui-styling` | `npx ui-ux-pro-max-cli update` (`init --ai claude` installs, `uninstall --ai claude` removes) | none |

Never hand-edit a vendored skill: a locked one drifts its hash and `skills experimental_install` can no
longer restore it; the other two owners overwrite on the next sync. `biome.json` excludes the seven
ui-ux-pro-max directories (~1.4 MB of JSON and `.cjs` that is not this repo's source). Vercel renamed
`react-best-practices` upstream; the installed directory is `vercel-react-best-practices`.

The main chain, in order:

1. `/research` — only when outside sources are needed.
2. **design** (`ui-ux-pro-max`, §2) — only when there is UI. Always **before** grill, never in parallel.
3. `/grill-with-docs` → `/to-spec` in the **same session** (to-spec synthesizes, it does not interview).
4. `/to-tickets`.
5. `/implement` per ticket; it ends by calling `/code-review` on that ticket.
6. `/code-review main` over the whole branch → `/handoff`.

| Skill | Read when |
|---|---|
| `grill-with-docs` | Stress-testing a feature idea while building the domain model (drives `domain-modeling` → `CONTEXT.md` + ADRs) |
| `grill-me` / `grilling` | Stress-testing a plan or decision without touching the domain docs |
| `to-spec` | Turning a settled decision into a written spec |
| `to-tickets` | Splitting a spec into tickets (§3) |
| `implement` | Implementing from a spec or tickets (invoke explicitly) |
| `code-review` | Reviewing a branch / PR / WIP diff on two axes — Standards and Spec |
| `handoff` | Writing the context dump when passing work to someone else or a fresh session |
| `diagnosing-bugs` | A hard bug or perf regression — hypothesis loop, not guess-and-patch |
| `research` | Investigating a question against primary sources → a file in `docs/research/` |
| `prototype` | A throwaway spike to answer a design question |
| `codebase-design` | Designing or improving a module's interface; the deep-module vocabulary |
| `domain-modeling` | Pinning domain terminology or recording an ADR (usually via `grill-with-docs`) |
| `triage` | Sorting incoming issues into the labels in `docs/agents/triage-labels.md` |
| `wayfinder` | Navigating a large, foggy piece of work via a map ticket + child tickets |
| `resolving-merge-conflicts` | An in-progress merge/rebase conflict |
| `improve-codebase-architecture` | Scanning for deepening opportunities → an HTML report (invoke explicitly) |
| `writing-for-agents` | Authoring a skill, a rule, `CLAUDE.md`, or any file in `.agents/*.md` |
| `ask-matt` / `teach` | Which skill fits, or a taught walkthrough of a concept |
| `wizard` | A bash wizard for steps only a human can do (a dashboard, a credential) |
| `setup-matt-pocock-skills` | Re-scaffolding `docs/agents/*` — already run; only needed to switch trackers |
| `tdd` | Red-green-refactor on Vitest + RTL — read the `testing-*` rules first (§2) |
| `vercel-react-best-practices` | Re-renders, data fetching, bundle, async perf |
| `web-design-guidelines` | Visual polish, hierarchy, spacing, accessibility |
| `gitnexus-*` (six) | Exploring architecture, impact analysis before an edit, debugging, safe refactors, the CLI |
| `ui-ux-pro-max` | The **design step**: UX guidelines by category, stack guidance (`data/stacks/shadcn.csv`, `nextjs.csv`), style/palette reasoning for an app with no brand yet, the pre-delivery checklist. Read the CSVs with `Grep`/`Read`; never run `scripts/search.py` (§2) |
| `design` `design-system` `brand` `banner-design` `slides` `ui-styling` | The six siblings of `ui-ux-pro-max`. Logo/CIP/banner/slide generation and token scaffolding; most need a Gemini/MuAPI key or `pip`. None is part of the chain. `design` overrides Claude Code's bundled `/design` in this project |

## §2 · Repo overrides for the workflow skills (tiếng Việt)

### Ngôn ngữ

- LUÔN trao đổi với user bằng tiếng Việt — kể cả khi đang chạy skill (grill, implement, code-review, …):
  câu hỏi phỏng vấn, báo cáo review, giải thích đều bằng tiếng Việt. Thuật ngữ kỹ thuật giữ tiếng Anh
  (Runtime, Flavor, Gate, query key, seam, tracer bullet, …).
- Artifact của workflow skill (spec, ticket, `CONTEXT.md`, ADR, plan): tiếng Việt, thuật ngữ tiếng Anh.
- Code, tên biến, commit message, `.agents/rules/*`: tiếng Anh. Rule giữ tiếng Anh để còn diff được với
  bản upstream ở Reference monorepo.

### Skill bổ trợ khi viết code

Trong `/implement` (hoặc `prototype`):

- Trước khi viết/sửa React component hay hook: load `vercel-react-best-practices`.
- Đụng UI/layout/accessibility: load thêm `web-design-guidelines`.
- Mâu thuẫn với `.agents/rules/` → **rules của repo thắng**.
- Skill của Vercel viết cho Next.js. Phần server components / RSC **chỉ** áp dụng cho app Runtime Next.
  App Vite (SPA) bỏ qua. App React Router (SSR, không RSC) cũng bỏ qua — nửa server-render của nó nằm ở
  `reactrouter-loader-vs-query.md` và `reactrouter-server-modules.md`.

### Bước design — `ui-ux-pro-max` là kho dữ liệu tĩnh, không Python, local-only

Bước design đứng giữa `/research` và `/grill-with-docs`, chạy bằng skill `ui-ux-pro-max`. Trong repo này nó
là **dữ liệu để đọc**, không phải engine:

- **Không chạy `scripts/search.py`.** Script cần Python 3; repo không cài và sẽ không cài (ràng buộc của
  chủ repo: không thêm phụ thuộc runtime). SKILL.md có dòng "If the user prefers not to install Python,
  skip the CLI searches and rely on the Quick Reference sections above" — đó là đường đi. Không hỏi cài
  Python, không thử `py -3`.
- **Đọc bằng `Grep`/`Read`** trên `.agents/skills/ui-ux-pro-max/data/`: `ux-guidelines.csv` (theo
  `Category`/keyword), `stacks/shadcn.csv` · `stacks/nextjs.csv` · `stacks/react.csv`,
  `react-performance.csv`. Mỗi CSV một dòng một record, nên một hàng grep là một record trọn vẹn. Quick
  Reference và Pre-Delivery Checklist nằm ngay trong SKILL.md.
- `products.csv` → `ui-reasoning.csv` → `colors.csv` (join bằng `No`) **chỉ** cho app chưa có brand. App đã
  có `tooling/tailwind/theme.css` thì brand và font là của theme, không dùng `colors.csv`/`typography.csv`.
- Không `--design-system`, không `--persist`. Sáu sub-skill anh em không nằm trong chuỗi.
- **Đầu ra** là một brief tiếng Việt cho grill: ràng buộc UX đã chọn (mỗi cái trỏ `No` của hàng CSV), style
  direction (chỉ khi app chưa có theme), component map lên `@monorepo/ui` / `~/components`, token delta so
  với `theme.css`, state list, copy cần dịch, câu hỏi mở. Lưu ở `docs/design/<app>-<round>.md`.
- **Mockup HTML tĩnh đi kèm brief và commit trong repo** (quyết định của chủ repo 2026-09-16):
  `docs/design/<app>-<round>/mockup-*.html`, mỗi file tự chứa (inline CSS, không script, không font ngoài),
  mỗi hướng một frame để chọn bằng mắt trước grill. `biome.json` bỏ qua `docs/design/**/*.html`. Mockup và
  brief là bản ghi *tại thời điểm chọn*, không phải nguồn sự thật cho code; cần nhìn bố cục trên route thật
  thì dùng `prototype/UI.md` sau khi đã có ticket.
- Ở `/implement`, khi đụng primitive/theme, đọc hàng `stacks/shadcn.csv` tương ứng làm gợi ý; rule của repo
  (`architecture-ui-primitives`, `quality-styling-tailwind`) thắng khi mâu thuẫn. Ở `/code-review`,
  Pre-Delivery Checklist bổ sung trục Standards cho UI, không thay `.agents/rules/`.
- Mọi thứ local: không publish gì lên web/app.

### Runtime nào — xác định trước khi viết dòng đầu tiên

Repo có **ba Runtime**, và gần như mọi rule gắn với đúng một. Trước khi sửa code trong `apps/`, nhìn
`package.json` của app, theo thứ tự này:

1. Có `next` → **Next** Runtime → đọc cluster `next-*`.
2. Có `@react-router/dev` (kèm `react-router.config.ts` ở gốc app) → **React Router** Runtime → `reactrouter-*`.
3. Có `vite` + `react-router` mà **không** có `@react-router/dev` → **Vite** Runtime → `routing-*`.

Thứ tự quan trọng vì app React Router cũng có cả `vite` lẫn `react-router`. Ba hình dạng cố ý khác nhau —
đừng bê pattern từ app này sang app kia, đó không phải drift cần "đồng bộ".

### TDD — có test runner, dùng bình thường

- Runner: **Vitest 5 + React Testing Library** (jsdom) cho unit/component, **Playwright 1.62** cho E2E.
  `/tdd` và nhánh TDD trong `/implement` chạy bình thường. Đọc `.agents/rules/testing-*.md` trước khi viết test.
- Hai quy ước không nằm trong cluster đó: test nằm trong **`apps/<app>/test/`**, soi gương đường dẫn dưới
  `src/`; mock đặt ở **service singleton** trong `~/libs/http-client`, không mock `axios` hay query hook.
- Vòng verify:
  - Trong lúc code: `bun run typecheck`, và `bun run --filter @monorepo/<app> test:watch` trên đúng một file.
  - Trước khi xong: `bun run check && bun run typecheck && bun run test && bun run build` — đúng bốn job
    chặn merge trong `.github/workflows/ci.yml`.
  - **Không** thêm tiền tố `TZ=UTC`: pin nằm trong `vitest.config.ts`; cú pháp đó hỏng trên PowerShell.
- E2E (`bun run e2e`) **chỉ chạy local** — CI không có job E2E (bỏ 2026-09-19). Chạy khi đụng route, guard,
  `proxy.ts` (Next), `src/routes.ts` / `loader` / `action` / middleware / `entry.server.tsx` (React Router),
  hoặc đường boot. Trên Windows: `bunx playwright test` với cwd là thư mục app (gọi qua `bun run` script treo
  lúc launch Chromium).
- Coverage được **đo chứ không gate**: `bun run test:coverage` có báo cáo, không có ngưỡng nào fail CI.

### Nguồn Standards cho `/code-review`

Trục **Standards** đối chiếu diff với `.agents/rules/` (index: [`README.md`](README.md), registry:
`rules/_sections.md`) — đây là "documented coding standards" của repo, thay cho `CODING_STANDARDS.md` /
`CONTRIBUTING.md` mà skill mặc định tìm. Ưu tiên rule impact **CRITICAL** và **HIGH**; rule của repo thắng
smell baseline khi xung đột. Bỏ qua mọi thứ Biome đã tự enforce (format, import sorting, `noProcessEnv`, …).
Đọc rule **đúng Runtime** của diff đang review.

## §3 · Tracker — GitHub Issues

Work is tracked as **GitHub Issues** on [`qtuan02/monorepo`](https://github.com/qtuan02/monorepo), through
the `gh` CLI. The full write-up the skills read is [`docs/agents/issue-tracker.md`](../docs/agents/issue-tracker.md).

- `/to-spec` opens one tracking issue labelled `spec`; `/to-tickets` opens its tickets as **sub-issues**;
  `/implement` claims one by assigning it and closes it once the verification is in a comment.
- The issue **number is the ticket's identity**: `/implement 42` means `#42`.
- Blocking is GitHub's native issue dependencies, not a prose line.
- Labels are a closed set in [`docs/agents/triage-labels.md`](../docs/agents/triage-labels.md): the five
  triage roles as real repository labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
  `wontfix`), plus two states GitHub expresses without a label — an **assignee** means in-progress, a
  **closed** issue means done.
- The repo is **public**: an issue body is world-readable, the same discipline as a committed file.
- On Windows a shell started before the `gh` install keeps the old `PATH`; call
  `C:\Program Files\GitHub CLI\gh.exe` by full path or restart the shell. Setup is done: `gh` 2.100.0 as
  `qtuan02` with the `repo` scope, Issues enabled, labels created.
- **`.agents/plans/` is the former tracker, frozen read-only.** Its 3 topics (`spec.md` + `NN-*.md`, each
  with a `status` front-matter) stay as history — a finished ticket records how it was verified, and its
  `decisions.md` carries reasoning that never became a rule. Cite by path. Where a finished ticket and a rule
  disagree, **the rule wins**. `settings.json` still points `plansDirectory` there so plan-mode scratch has a
  home; that output is scratch, not a ticket.
- Architecture and design docs go to `docs/`, not into an issue: ADRs in `docs/adr/`, research in
  `docs/research/`, design briefs in `docs/design/`. Glossary terms go to `CONTEXT.md` (root) or a
  workspace's own `CONTEXT.md`, registered in `CONTEXT-MAP.md`; [`docs/agents/domain.md`](../docs/agents/domain.md)
  tells the `domain-modeling` skill where to read and write.

## §4 · Authoring new material

- **Rule** — copy `rules/_template.md`. File name `kebab-case-topic.md` with an existing cluster prefix
  (register a new prefix in `rules/_sections.md` first). English, ~40–110 lines, `❌`/`✅` blocks, every
  example grounded in code that exists in this repo, and the Runtime it applies to stated when it is only
  one. Then add its row to the index in `README.md`.
- **ADR** — `docs/adr/NNNN-<slug>.md`, Vietnamese, `status` + `date` front-matter, Considered Options and
  Consequences. Link it from the rule or the `CONTEXT.md` term it settles.
- **Skill** — copy an existing `skills/<name>/SKILL.md` for shape and load `writing-for-agents` first. A
  skill written here is yours: no entry in `skills-lock.json`, and `npx skills@latest update` neither
  touches nor restores it. Never edit a vendored skill instead — fork it under a new name.

When adding cross-cutting content (a new workspace package, a Flavor of an existing one), also update:

1. `project-structure.md` and the top-level map in `CLAUDE.md` §1 — add the folder, mark it `**Flavor**` if
   it splits by Runtime.
2. `CLAUDE.md` §3 "Where do I put X?" — a lookup row, split per Runtime only where the three differ.
3. `CLAUDE.md` §5 "Đọc gì khi nào" — a task row if a new rule appears.
4. `rules/architecture-vertical-slices.md` / `architecture-feature-boundaries.md` — the placement guidance.
5. `README.md` — the rule's index row.
6. `CONTEXT.md` — if the change introduces a word the team will now use.
