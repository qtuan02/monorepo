# Hướng dẫn dùng AI trong repo — quy trình, skill, rule

> Tài liệu cho **người**: cách làm việc với Claude Code trong repo này, quy trình chuẩn một feature đi qua,
> toàn bộ skill hiện có (nguồn gốc và việc từng cái làm), và 52 rule mà AI phải tuân theo. Nguồn thật là
> chính các file được dẫn — `CLAUDE.md` (§7, §7a, §7b, §8), `.agents/README.md`, từng `SKILL.md`, từng rule —
> tài liệu này chỉ xếp chúng theo thứ tự đọc. Nếu hai bên lệch nhau, **file gốc thắng** và tài liệu này cần sửa.
>
> Ngày viết: 2026-09-06, nhánh `dev`. Tiếng Việt, thuật ngữ kỹ thuật giữ English theo `CLAUDE.md` §7a.

## Mục lục

1. [Cách dùng — những điều cần biết trước khi gõ lệnh đầu tiên](#1-cách-dùng--những-điều-cần-biết-trước-khi-gõ-lệnh-đầu-tiên)
2. [Quy trình chuẩn — bảy bước](#2-quy-trình-chuẩn--bảy-bước)
3. [Ngoài chuỗi — bug, câu hỏi nhanh, refactor, bàn giao](#3-ngoài-chuỗi--bug-câu-hỏi-nhanh-refactor-bàn-giao)
4. [Tất cả skill hiện có — nguồn và giải thích](#4-tất-cả-skill-hiện-có--nguồn-và-giải-thích)
5. [UI UX Pro Max — cài, dùng không Python, giới hạn](#5-ui-ux-pro-max--cài-dùng-không-python-giới-hạn)
6. [52 rule — 12 cluster nói gì](#6-52-rule--12-cluster-nói-gì)
7. [Quy ước bao trùm](#7-quy-ước-bao-trùm)

---

## 1. Cách dùng — những điều cần biết trước khi gõ lệnh đầu tiên

**Mở Claude Code ở repo root.** `CLAUDE.md` (và `AGENTS.md`, symlink tới nó) được nạp tự động: cấu trúc,
ba Runtime, quy ước, và mọi override của repo. Claude đọc `.agents/rules/` khi cần và thấy skill ở
`.claude/skills/` (symlink tới `.agents/skills/`).

**Trao đổi bằng tiếng Việt.** Claude đã được dặn trong `CLAUDE.md` §7a: hỏi, báo cáo, giải thích đều tiếng
Việt; thuật ngữ kỹ thuật (Runtime, Flavor, seam, query key…) giữ English; code, commit message, rule giữ
tiếng Anh.

**Gọi skill bằng hai cách:**

| Cách | Khi nào | Ví dụ |
|---|---|---|
| Gõ `/tên-skill <đối số>` | Luôn chạy đúng skill đó. **Bắt buộc** với các skill workflow (`grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `code-review`, `improve-codebase-architecture`) vì chúng đặt `disable-model-invocation: true` — Claude không tự bật | `/implement 42` |
| Nhắn tự nhiên | Claude khớp câu của bạn với dòng `description` của từng SKILL.md và tự load skill. Hợp với skill hỗ trợ (`diagnosing-bugs`, `tdd`, `ui-ux-pro-max`, `gitnexus-*`) | "debug lỗi này" → `diagnosing-bugs` |

Khi nhiều skill có description gần nhau (chữ "design" nằm trong cả `ui-ux-pro-max`, `design`,
`design-system`), gõ `/` tường minh để không bị bắt nhầm.

**Chạy lệnh tay trong hội thoại:** gõ `! <lệnh>` — output rơi vào hội thoại để Claude đọc. Dùng cho việc
Claude bị chặn (cài package global, login).

**Tracker là GitHub Issues** của `qtuan02/monorepo`, thao tác qua `gh`. Spec là issue nhãn `spec`, ticket là
sub-issue; số issue là danh tính (`/implement 42` = `#42`). Repo public nên nội dung issue là công khai.

**Hai ràng buộc cứng của repo:** local-only (không publish gì lên web/app ngoài GitHub Issues) và không thêm
phụ thuộc runtime (không Python — vì thế UI UX Pro Max dùng ở chế độ đọc dữ liệu tĩnh, §5).

---

## 2. Quy trình chuẩn — bảy bước

```text
/research ──► /ui-ux-pro-max ──► /grill-with-docs ──► /to-spec ──► /to-tickets ──► /implement ──► /code-review main
 (khi cần)     (khi có UI)          (bắt buộc)        (cùng phiên)                   (từng ticket,     (cả nhánh)
                                                                                     tự review)
```

| # | Bước | Lệnh | Bắt buộc? | Vai trò của Claude | Để lại gì |
|---|---|---|---|---|---|
| 1 | Research | `/research <câu hỏi>` | Không — chỉ khi cần đọc nguồn ngoài | **Đọc** primary sources qua agent nền | `docs/research/<slug>.md` |
| 2 | Design | `/ui-ux-pro-max <màn hình>` | Chỉ khi có UI | **Sản xuất** tài liệu design, bạn duyệt | Tài liệu design (nơi lưu chốt ở grill đầu tiên) |
| 3 | Grill | `/grill-with-docs` | Có | **Phỏng vấn** bạn để tìm chỗ hở | Term trong `CONTEXT.md`, ADR trong `docs/adr/` |
| 4 | Spec | `/to-spec` | Có — **cùng phiên** với grill | **Tổng hợp** hội thoại, không hỏi lại | Issue nhãn `spec` |
| 5 | Tickets | `/to-tickets #N` | Có | Rã spec, hỏi bạn duyệt độ mịn | Sub-issue có blocking |
| 6 | Implement | `/implement #M` | Có, từng ticket | Code + TDD + Gate; **tự gọi** `/code-review` cuối ticket | Commit trên nhánh, issue đóng |
| 7 | Review tổng | `/code-review main` | Có, trước khi merge | Hai sub-agent: Standards + Spec | Báo cáo `file:line` |

Ba điều quyết định hình dạng chuỗi:

- **Design đứng trước grill, không song song.** `ui-ux-pro-max` sinh ra một tài liệu; grill cần một tài liệu
  cụ thể để hỏi vào. Việc "tổng hợp" không phải của grill mà của `to-spec`. Bản pha design cũ (canvas
  `.dc.html`, skill `design`/`design-handoff`, ADR-0008) đã bị revert ở `a094d18` và **không dựng lại** khi
  chưa có spec mới.
- **`to-spec` không phỏng vấn.** Nó chỉ tổng hợp những gì đã nói, nên chạy ngay trong phiên grill. Nếu phải
  sang phiên khác, `/handoff` trước rồi dán tài liệu bàn giao vào phiên mới.
- **Review có hai tầng.** `implement/SKILL.md` kết thúc bằng "use /code-review to review the work", nên mỗi
  ticket đã được review khi đóng. `/code-review main` ở cuối là tầng thứ hai: cả nhánh so với spec.

### Bước 1 · `/research <câu hỏi>`

| | |
|---|---|
| Làm gì | Spin up một **background agent** đọc primary sources (docs chính chủ, source, spec, API), viết một note Markdown, cite từng claim |
| Đầu vào | Câu hỏi + ràng buộc của bạn (ví dụ "không cài thêm gì", "local-only") |
| Đầu ra | `docs/research/<slug>.md` — header ghi ngày, nhánh, HEAD, nguồn, những gì **không** làm; `## Tóm tắt kết luận`; các §; cuối cùng `## Chưa xác minh` |
| Bạn làm gì | Đọc "Tóm tắt kết luận" và "Chưa xác minh"; quyết hướng |
| Ví dụ thật | [`ui-ux-pro-max-project-install-no-python.md`](../research/ui-ux-pro-max-project-install-no-python.md), [`react-router-framework-template.md`](../research/react-router-framework-template.md) |

Agent research **chỉ đọc**: không cài, không sửa file ngoài note, không publish.

### Bước 2 · `/ui-ux-pro-max <màn hình>` — chỉ khi có UI

| | |
|---|---|
| Làm gì | Rút ra quyết định design trước khi có TSX: ràng buộc UX theo category (navigation, forms, accessibility…), style direction nếu app chưa có brand, guideline theo stack (shadcn / Next / React), checklist pre-delivery |
| Đầu vào | Yêu cầu của bạn; `tooling/tailwind/theme.css` (`:root` và `.dark`, oklch); `packages/ui/src/components/` (63 primitive); `~/components/` của app; dữ liệu của skill (`data/*.csv`, `data/stacks/*.csv`) đọc bằng `Grep`/`Read` — **không** chạy `scripts/search.py` |
| Đầu ra | Một tài liệu tiếng Việt: ràng buộc UX đã chọn (mỗi cái trỏ `No` của hàng CSV), style direction (chỉ khi app chưa có theme), component map lên `@monorepo/ui` / `~/components`, token delta so với `theme.css`, state list, copy cần dịch, câu hỏi mở |
| Bạn làm gì | Duyệt bằng lời; tài liệu này là input của grill |

Skill **không vẽ mockup**. Cần nhìn bố cục thật thì dùng `/prototype` trên route thật sau khi có ticket.

### Bước 3 · `/grill-with-docs`

| | |
|---|---|
| Làm gì | Gọi hai skill: `grilling` (phỏng vấn dồn dập, một câu một lần, cho tới khi kế hoạch hết chỗ hở) + `domain-modeling` (ghi term vào `CONTEXT.md`, quyết định hệ thống thành ADR) |
| Đầu vào | Tài liệu design (nếu có) + note research + code hiện tại |
| Đầu ra | Term mới trong `CONTEXT.md` (root) hoặc `CONTEXT.md` của workspace (đăng ký ở `CONTEXT-MAP.md`); ADR trong `docs/adr/NNNN-<slug>.md` (tiếng Việt, `status` + `date`) |
| Bạn làm gì | Trả lời ngắn, thẳng, từng câu. Xong khi không còn câu nào chưa trả lời |

`/grill-me` là bản không ghi docs; `/grilling` là lõi phỏng vấn cả hai dùng chung.

### Bước 4 · `/to-spec`

| | |
|---|---|
| Làm gì | Tổng hợp hội thoại thành spec, đề xuất seam để test (ưu tiên seam có sẵn, càng cao càng tốt, lý tưởng là một), mở issue |
| Đầu ra | Issue nhãn `spec` + `ready-for-agent`: Problem · Solution · User Stories · Implementation Decisions · Testing Decisions · Out of Scope. Spec **dẫn tới** tài liệu design (đường dẫn + commit), không dán vào |
| Bạn làm gì | Xác nhận seam khi Claude hỏi; nhớ số issue |

### Bước 5 · `/to-tickets #N`

| | |
|---|---|
| Làm gì | Cắt spec thành **tracer-bullet** ticket — mỗi ticket một lát dọc hoàn chỉnh qua mọi layer, verify được một mình, vừa một context window; khai báo ticket nào chặn nó |
| Đầu ra | Sub-issue của spec, blocking bằng issue dependency native của GitHub |
| Bạn làm gì | Duyệt bảng ticket (độ mịn, quan hệ chặn) trước khi Claude publish |

Token delta loại **thêm** (token mới trong `theme.css`) thành một ticket chặn các ticket UI; **đổi** token brand
hiện có cần ADR trước vì ảnh hưởng mọi app.

### Bước 6 · `/implement #M` — từng ticket

| | |
|---|---|
| Làm gì | Assign ticket cho mình, xác định Runtime của app, implement theo TDD ở seam đã thoả thuận, typecheck + test file thường xuyên, full suite một lần cuối, commit lên nhánh hiện tại, **tự gọi `/code-review`** cho ticket, comment verification rồi đóng issue |
| Skill kèm | Trước khi viết/sửa React component hay hook: `vercel-react-best-practices`; đụng UI/layout/a11y: thêm `web-design-guidelines`; đụng primitive/theme: hàng tương ứng trong `data/stacks/shadcn.csv` của `ui-ux-pro-max`. Rule của repo **thắng** khi mâu thuẫn |
| Runtime | `package.json` có `next` → Next; có `@react-router/dev` + `react-router.config.ts` → React Router; có `vite` + `react-router` mà không có `@react-router/dev` → Vite. Đọc đúng cluster `next-*` / `reactrouter-*` / `routing-*` |
| Gate | `bun run check && bun run typecheck && bun run test && bun run build` — đúng bốn job chặn merge trong CI. E2E không chặn nhưng chạy local khi đụng route/guard/proxy/loader/middleware/entry; trên Windows `bunx playwright test` từ thư mục app |
| Không làm | Tiền tố `TZ=UTC` (hỏng trên PowerShell; pin đã ở `vitest.config.ts`); mock `axios` hay query hook (mock ở service singleton `~/libs/http-client`) |
| Bạn làm gì | Đọc comment verification trên issue; chạy tiếp ticket sau |

### Bước 7 · `/code-review main` — cả nhánh

| | |
|---|---|
| Làm gì | Diff `git diff main...HEAD`, hai sub-agent song song: **Standards** (đối chiếu `.agents/rules/`, ưu tiên CRITICAL/HIGH, cộng baseline 12 smell của Fowler mà rule repo luôn đè) và **Spec** (đối chiếu issue gốc) |
| Đầu ra | Báo cáo tiếng Việt, `file:line` cho từng phát hiện |
| Bỏ qua | Mọi thứ Biome đã enforce |
| Bạn làm gì | Sửa hoặc chấp nhận từng phát hiện, rồi merge |

---

## 3. Ngoài chuỗi — bug, câu hỏi nhanh, refactor, bàn giao

| Tình huống | Gõ | Ghi chú |
|---|---|---|
| Bug khó, regression hiệu năng | `/diagnosing-bugs <mô tả>` | Vòng giả thuyết → thí nghiệm → kết luận, không đoán-vá |
| Sửa nhỏ, không cần spec | `/tdd <việc>` | Red-green-refactor; vẫn qua Gate |
| Muốn nhìn bố cục thật | `/prototype` | Biến thể UI trên route thật (`?variant=`), branch bỏ đi |
| Đổi tên / tách / chuyển module | nhắn "rename X", "extract Y" | `gitnexus-refactoring` + `gitnexus_impact` trước khi sửa |
| "Cái này hoạt động thế nào?" | nhắn tự nhiên | `gitnexus-exploring`; Claude dùng call graph thay vì grep |
| Sửa gì thì vỡ gì? | nhắn "what breaks if…" | `gitnexus-impact-analysis` |
| Kẹt merge/rebase | `/resolving-merge-conflicts` | |
| Dừng giữa chừng, tiếp ở phiên khác | `/handoff` | Dán tài liệu bàn giao vào phiên mới |
| Không biết nên dùng skill nào | `/ask-matt` | |
| Việc quá lớn cho một phiên | `/wayfinder` | Map ticket + child ticket trên tracker |
| Xếp issue mới vào nhãn | `/triage` | Nhãn trong `docs/agents/triage-labels.md` |
| Viết skill / rule mới, sửa `CLAUDE.md` | `/writing-for-agents` | Theo `CLAUDE.md` §8 |

---

## 4. Tất cả skill hiện có — nguồn và giải thích

38 skill trong `.agents/skills/`, bốn chủ sở hữu. Cột **Gọi**: `/` = phải gõ tường minh
(`disable-model-invocation: true`); `tự` = Claude tự load khi câu của bạn khớp description, gõ `/` vẫn được.

### 4.1 `mattpocock/skills` — 23 skill, pin trong `skills-lock.json`

Nguồn: [github.com/mattpocock/skills](https://github.com/mattpocock/skills), đường dẫn trong repo đó ghi ở
cột Nguồn. Cập nhật bằng `npx skills@latest update <name>`; **không sửa tay** (hash trong lock sẽ lệch).

| Skill | Nguồn (`skills/…`) | Gọi | Làm gì |
|---|---|---|---|
| `research` | `engineering/research` | tự | Spin up agent nền đọc primary sources, viết note có citation vào `docs/research/` |
| `grill-with-docs` | `engineering/grill-with-docs` | `/` | Gọi `grilling` + `domain-modeling`: phỏng vấn để tìm chỗ hở **và** ghi term/ADR trong lúc đó |
| `grilling` | `productivity/grilling` | tự | Lõi phỏng vấn: hỏi dồn dập, một câu một lần, cho tới khi kế hoạch hết chỗ hở |
| `grill-me` | `productivity/grill-me` | tự | Phỏng vấn như trên nhưng **không** ghi docs domain |
| `domain-modeling` | `engineering/domain-modeling` | tự | Chốt thuật ngữ vào `CONTEXT.md`, ghi ADR; đọc `docs/agents/domain.md` để biết viết ở đâu |
| `to-spec` | `engineering/to-spec` | `/` | Tổng hợp hội thoại thành spec (không phỏng vấn), chọn seam test, mở issue `spec` |
| `to-tickets` | `engineering/to-tickets` | `/` | Rã spec thành tracer-bullet ticket có blocking, hỏi duyệt rồi mở sub-issue |
| `implement` | `engineering/implement` | `/` | Làm một ticket/spec: TDD ở seam, typecheck/test thường xuyên, commit, tự gọi `code-review` |
| `code-review` | `engineering/code-review` | `/` | Review diff từ một mốc theo hai trục Standards (rules) và Spec (issue), hai sub-agent song song |
| `tdd` | `engineering/tdd` | tự | Red-green-refactor; đọc cluster `testing-*` trước |
| `diagnosing-bugs` | `engineering/diagnosing-bugs` | tự | Vòng chẩn đoán cho bug khó / regression hiệu năng |
| `prototype` | `engineering/prototype` | tự | Spike bỏ đi để trả lời một câu hỏi thiết kế; `UI.md` = biến thể UI trên route thật |
| `codebase-design` | `engineering/codebase-design` | tự | Từ vựng deep-module; thiết kế/đào sâu interface một module, tìm seam |
| `improve-codebase-architecture` | `engineering/improve-codebase-architecture` | `/` | Quét cơ hội deepening → báo cáo HTML → grill một cái |
| `triage` | `engineering/triage` | tự | Đưa issue/PR qua máy trạng thái nhãn (`needs-triage` → `ready-for-agent` …), viết brief cho agent |
| `wayfinder` | `engineering/wayfinder` | tự | Kế hoạch cho khối việc lớn hơn một phiên: map ticket quyết định + child ticket |
| `resolving-merge-conflicts` | `engineering/resolving-merge-conflicts` | tự | Giải conflict đang dở của merge/rebase |
| `wizard` | `engineering/wizard` | tự | Sinh wizard bash dẫn người làm bước chỉ người làm được (dashboard, credential, cutover) |
| `setup-matt-pocock-skills` | `engineering/setup-matt-pocock-skills` | tự | Cấu hình tracker, nhãn triage, domain doc — **đã chạy**, chỉ cần lại nếu đổi tracker |
| `ask-matt` | `engineering/ask-matt` | tự | Router: hỏi skill/flow nào hợp tình huống |
| `handoff` | `productivity/handoff` | tự | Nén hội thoại thành tài liệu bàn giao cho phiên/người khác |
| `teach` | `productivity/teach` | tự | Dạy một khái niệm/kỹ năng ngay trong workspace |
| `writing-for-agents` | `productivity/writing-for-agents` | tự | Cách viết tài liệu cho agent: skill, rule, `CLAUDE.md` |

### 4.2 `vercel-labs/agent-skills` — 2 skill, pin trong `skills-lock.json`

Nguồn: [github.com/vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills). Cập nhật như trên.

| Skill | Nguồn (`skills/…`) | Gọi | Làm gì |
|---|---|---|---|
| `vercel-react-best-practices` | `react-best-practices` | tự | Bộ guideline hiệu năng React/Next của Vercel: re-render, data fetching, bundle, async. Load trong `/implement` trước khi viết component/hook. Phần RSC chỉ áp cho Runtime Next; rule repo thắng khi mâu thuẫn |
| `web-design-guidelines` | `web-design-guidelines` | tự | Soát UI code theo Web Interface Guidelines (a11y, focus, contrast, hit target…); fetch checklist của Vercel mỗi lần chạy. Load trong `/implement` khi đụng UI |

### 4.3 GitNexus — 6 skill, không trong lock

Nguồn: `npx gitnexus analyze` ghi chúng vào `.agents/skills/gitnexus-*/` (và một bản mirror dưới
`.agents/skills/gitnexus/` mà khối GitNexus cuối `CLAUDE.md` link tới). Chạy lại `analyze` khi index cũ.
Chúng làm việc trên knowledge graph của repo (call graph, execution flow) qua MCP server `gitnexus`.

| Skill | Gọi | Làm gì |
|---|---|---|
| `gitnexus-exploring` | tự | "Cái này hoạt động thế nào?", trace execution flow, hiểu kiến trúc |
| `gitnexus-impact-analysis` | tự | Blast radius trước khi sửa một symbol — `CLAUDE.md` bắt buộc chạy trước mọi edit |
| `gitnexus-debugging` | tự | Trace bug/lỗi theo call graph |
| `gitnexus-refactoring` | tự | Rename/extract/split/move an toàn; `gitnexus_rename` thay find-and-replace |
| `gitnexus-guide` | tự | Tool, resource, schema của GitNexus |
| `gitnexus-cli` | tự | `analyze`, `status`, `clean`, `wiki` |

### 4.4 `nextlevelbuilder/ui-ux-pro-max-skill` — 7 skill, không trong lock

Nguồn: [github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
(MIT), cài bằng `npx ui-ux-pro-max-cli init --ai claude`, cập nhật bằng `npx ui-ux-pro-max-cli update`.
Cả bảy đều tự kích hoạt được. Chi tiết cài và cách dùng không Python ở §5.

| Skill | Gọi | Làm gì | Trong chuỗi? |
|---|---|---|---|
| `ui-ux-pro-max` | tự / `/` | Skill lõi: tra cứu UX guideline (119), style (79), palette + reasoning theo product type (192), font pairing (74), icon, chart, và guideline theo stack (22, có `shadcn`, `nextjs`, `react`). Trong repo này đọc CSV bằng Grep, không chạy `search.py` | **Có** — bước design |
| `design` | tự / `/` | Sinh logo (Gemini), CIP mockup, icon, social photo, banner, slide — cần API key. **Đè** `/design` bundled của Claude Code trong project này | Không |
| `design-system` | tự / `/` | Token ba lớp (primitive → semantic → component), CSS variables, spacing/typography scale, component spec; script `.cjs` sinh token từ JSON | Không — token của repo là `theme.css` |
| `brand` | tự / `/` | Brand voice, visual identity, messaging framework, asset management | Không |
| `banner-design` | tự / `/` | Banner cho social/ads/hero/print với ảnh AI | Không |
| `slides` | tự / `/` | Slide HTML với Chart.js, design token | Không |
| `ui-styling` | tự / `/` | shadcn/ui + Tailwind + canvas design. Lưu ý: viết cho shadcn trên **Radix**; repo này dùng shadcn `base-vega` trên **Base UI** (`render` thay `asChild`, `data-open` thay `data-[state=…]`) — rule `architecture-ui-primitives` thắng | Không |

---

## 5. UI UX Pro Max — cài, dùng không Python, giới hạn

Nguồn: [`docs/research/ui-ux-pro-max-project-install-no-python.md`](../research/ui-ux-pro-max-project-install-no-python.md)
(2026-09-06, upstream HEAD `314307f`, release `v2.15.0`).

### 5.1 Cài — không global bin

```bash
npx ui-ux-pro-max-cli init --ai claude   # ghi vào .claude/skills/ → vật lý là .agents/skills/ (symlink)
```

(Tương đương `npm install -g ui-ux-pro-max-cli && uipro init --ai claude` nếu muốn có bin `uipro`; repo này
không dùng.) Không cần Python để cài; không cần mạng sau khi có gói. Không có cờ chọn skill — luôn ghi lõi
**cộng sáu sub-skill**; thư mục đã có thì bỏ qua (`--force` để đè); `uninstall --ai claude` xoá cả bảy.

Lần cài 2026-09-06 ghi: `ui-ux-pro-max` 68 file / 3,6 MB (SKILL.md 55 KB có quick-reference và pre-delivery
checklist inline; `data/`; `scripts/` 35 file `.py`, phần lớn là test), `design` 35 / 317 KB, `design-system`
27 / 252 KB, `ui-styling` 16 / 202 KB, `brand` 18 / 132 KB, `slides` 6 / 29 KB, `banner-design` 2 / 20 KB.

Ba việc dọn đã làm ngay sau khi cài:

1. `biome.json` `files.includes`: loại cả bảy thư mục — không thì `bun run check` format lại ≈ 1,4 MB JSON
   và mấy file `.cjs` của skill.
2. `.gitignore`: `__pycache__/` — phòng ngày nào đó có Python và `search.py` đẻ `.pyc` vào thư mục vendored.
3. Override vào `CLAUDE.md` §7a mục "Bước design" (không sửa SKILL.md vendored).

### 5.2 Dùng không Python — grep-fallback

`scripts/search.py` **bắt buộc Python 3** và upstream không có port Node/Bun; máy dev không có Python thật;
ràng buộc "không cài thêm phụ thuộc" ⇒ **không chạy script**. Chính SKILL.md cho phép: "If the user prefers
not to install Python, skip the CLI searches and rely on the Quick Reference sections above."

| Muốn | Làm |
|---|---|
| Rule UX theo chủ đề | `Grep` `data/ux-guidelines.csv` theo `Category` hoặc keyword — mỗi hàng: `No,Category,Issue,Platform,Description,Do,Don't,Code Example Good,Code Example Bad,Severity` |
| Guideline theo stack | `Grep` `data/stacks/shadcn.csv` / `nextjs.csv` / `react.csv` — có `Do`, `Don't`, `Code Good`, `Code Bad`, `Docs URL` |
| Style direction cho app **chưa có** brand | Join tay ba CSV cùng `No` theo product type: `products.csv` → `ui-reasoning.csv` → `colors.csv` |
| Checklist trước khi giao | Quick Reference / Pre-Delivery Checklist trong SKILL.md |

Bảy CSV chính đều một dòng một record, nên một hàng grep là một record trọn vẹn. Cái mất: BM25 ranking,
auto-detect domain, và `--design-system` end-to-end — với repo này phần đó vốn không có việc: palette là
`theme.css`, spacing là scale Tailwind.

### 5.3 Không dùng

`--design-system`, `--persist` (tạo `design-system/<slug>/` ở cwd), `colors.csv`/`typography.csv` cho app đã
có `theme.css`, và sáu sub-skill (cần API key hoặc `pip`, không sinh gì repo cần).

### 5.4 Còn phải quyết ở vòng grill đầu tiên

1. ~~Tài liệu design ở bước 2 lưu ở đâu, theo mẫu nào (sau revert không còn `docs/design/`).~~
   **Đã chốt** ở hai vòng portfolio: `docs/design/<app>-<chủ đề>.md`, mẫu là chính hai brief
   `portfolio-rebuild.md` (v1) và `portfolio-redesign-v2.md` (v2) — header ghi ngày, bước, đầu vào,
   đầu ra, cách đọc trích dẫn CSV; khi spec đã implement, thêm blockquote "Đã implement, spec #N"
   trỏ về README của app, CLAUDE.md §1 và ADR (nếu có). Brief là bản ghi *tại thời điểm quyết*,
   không sửa lại cho khớp app hiện tại.
2. Có giữ sáu sub-skill trong repo không (xoá tay thì `update` ghi lại).
3. Muốn gõ `/design` cho bước design thì đặt tên khác (ví dụ `/design-brief`) để không va với thư mục
   `design` mà CLI ghi đè.

---

## 6. 52 rule — 12 cluster nói gì

Mỗi rule là một file `.agents/rules/<prefix>-<topic>.md`, **tiếng Anh** (để diff được với upstream), front-matter
`impact: CRITICAL | HIGH | MEDIUM`, thân là cặp `❌ Incorrect` / `✅ Correct` lấy từ code thật của repo.
**CRITICAL và HIGH là không thương lượng** cho code mới; `/code-review` trục Standards ưu tiên hai mức đó.
Registry cluster: [`.agents/rules/_sections.md`](../../.agents/rules/_sections.md); index từng rule:
[`.agents/README.md`](../../.agents/README.md); khuôn rule mới: `_template.md`.

Ba cluster gắn với đúng **một Runtime** và không bao giờ trộn trong một app: `routing-*` (Vite),
`reactrouter-*` (React Router framework), `next-*` (Next). Chín cluster còn lại áp cho cả ba.

### 6.1 `architecture-*` — CRITICAL — cách `src/` của mỗi app được tổ chức

| Rule | Một câu |
|---|---|
| `architecture-vertical-slices` | Code theo domain dưới `~/features/<domain>/` — `templates/` (default export, `.template.tsx`) · `components/` · `provider/` (Vite) / `guard/` (Next) / `middleware/` (React Router) · `types/` (file đặt tên, không `index.ts`) · `stores/` · `server/`/`actions/` (Next) |
| `architecture-circular-dependencies` | Import chỉ **đi xuống**: `~/types,constants,utils` → `@monorepo/*` → `~/libs` → `~/hooks/api`, `~/stores` → `~/components` → `~/features` → tầng trên cùng (`~/pages` / `src/app` / `src/routes`). Cần giá trị tầng trên thì đọc **lazily** (`useAuthStore.getState()`) |
| `architecture-feature-boundaries` | Dùng slice qua **public surface** (template, provider/guard/middleware, component cố ý expose); không với vào internals của slice khác; shared code lên `~/components`, `~/libs`, `@monorepo/*` |
| `architecture-features-modules` | Service là **class** trong `@monorepo/api/src/<system>/<domain>-service.ts`, không React; singleton ở `~/libs/http-client.ts`; TanStack Query **chỉ** trong `~/hooks/api`; params đặt tên theo endpoint trong `@monorepo/types`; không envelope; lỗi thành `HttpError`, toast bởi `MutationCache.onError` toàn cục. Ngoại lệ: API bên thứ ba **một app** gọi → `~/features/<feat>/server/` |
| `architecture-ui-primitives` | Primitive ở `@monorepo/ui/components/*` (shadcn `base-vega` trên **Base UI**): thêm bằng `ui-add`, compose bằng `render` (không `asChild`), link-trông-như-button = `Link` + `buttonVariants`, state là `data-open`/`data-checked` (không `data-[state=…]`), orientation qua hai `@custom-variant` trong `globals.css` |
| `architecture-shared-components` | `~/components/` giữ composite dùng bởi **hơn một** slice (`exception/`, `select/`, `page/`); tự fetch, tự skeleton; không bao giờ import `~/features` |

### 6.2 `routing-*` — HIGH — **Vite Runtime**

| Rule | Một câu |
|---|---|
| `routing-constants` | Mọi path từ `ROUTES` trong `~/constants/routes.ts` (`as const`, builder `xxxPath()`); import từ `react-router` / `react-router/dom` — không còn `react-router-dom` |
| `routing-route-guards` | Guard là route wrapper `<ProtectedRoute>` / `<GuestRoute>` ở `~/features/auth/provider/`, mount **trong** layout route (404 ngoài guard); page không tự check token |

### 6.3 `reactrouter-*` — CRITICAL — **React Router framework Runtime**

| Rule | Một câu |
|---|---|
| `reactrouter-route-modules` | Bảng path là `src/routes.ts` (config-based, không fs-routes); nesting là access model; route module mỏng; `root.tsx` tách `Layout` (html + providers) khỏi `App` (Outlet); resource route không có default export |
| `reactrouter-typed-href` | Không `~/constants/routes.ts`; mọi path qua `href()` typegen sinh từ bảng; `./+types/<route>` resolve qua `rootDirs`; `typecheck` chạy typegen trước; `prerender` là ngoại lệ literal duy nhất |
| `reactrouter-middleware-guards` | Guard = `middleware` trên pathless `layout("routes/protected.tsx")`, **phải** export `loader`; `throw replace(...)`; `redirectTo` qua `normalizeRequestPath` + `safeRedirectTo`; `userContext` không default |
| `reactrouter-loader-vs-query` | `loader` cho thứ crawler đọc và `meta` dựng từ; TanStack Query cho sau paint; cùng service singleton; không `dehydrate`/`HydrationBoundary`; `QueryClient` per render tree qua `useState(getQueryClient)` trong `Layout` |
| `reactrouter-server-modules` | Đuôi `.server.ts` là build contract (chỉ tên được kiểm); mọi thứ khác compile vào **cả hai** graph — không `window` ở module scope trong `~/libs`; giá trị browser-only bắt đầu `null`; Vitest swap `reactRouter()` bằng `@vitejs/plugin-react` |
| `reactrouter-i18n-env` | Ngôn ngữ = cookie + `Accept-Language`, quyết một lần trong root `middleware`; một `cloneInstance` i18next mỗi request, **không** `changeLanguage` phía server; `meta` dùng `getFixedT`; env Flavor `react-router` có `server` block, `runtimeEnv` đầy đủ, secret guard `typeof process` |

### 6.4 `next-*` — CRITICAL — **Next Runtime**

| Rule | Một câu |
|---|---|
| `next-app-router-structure` | `src/app/[locale]/` chỉ là path table + wiring; `page.tsx` vài dòng: await rồi render template của slice; `(shell)` là chrome, `sign-in` ngoài shell; `[...rest]` gọi `notFound()` |
| `next-server-vs-client-components` | Server Component mặc định; `"use client"` ở lá nhỏ nhất cần browser (5 file trong template); function/class/component không qua boundary; async Server Component dùng `getTranslations`, đặt trong `<Suspense>` |
| `next-data-fetching` | `"use cache"` + `cacheTag`/`cacheLife` dưới `~/features/<feat>/server/` cho thứ crawler đọc và `generateMetadata` dựng từ; TanStack Query cho sau paint; **một giá trị một nhà**; `revalidateTag(tag, profile)` từ Server Action; `getQueryClient()` không singleton |
| `next-proxy-guards` | Guard trong `src/proxy.ts` (named export `proxy`, Node runtime), quyết định là **pure function** `decideSessionRedirect` ở `~/features/auth/guard/`; `config.matcher` là string literal; session là cookie `HttpOnly`; `redirectTo` parse qua `safeRedirectTo`, không pattern-match |
| `next-i18n-next-intl` | Locale là URL segment; ba file `~/i18n/{routing,request,navigation}.ts`; `Link`/`redirect`/`usePathname`/`useRouter` từ `~/i18n/navigation`; đổi ngôn ngữ = `router.replace(pathname, { locale })`; catalogue ICU dùng chung |
| `next-env-t3` | `createEnv({ server, client, clientRuntimeEnv })` từ `@monorepo/env/next/create-env`; key `NEXT_PUBLIC_` phải ở `client` và có literal read trong `clientRuntimeEnv`; `.env` root qua dotenv-cli; Dockerfile validate bằng import `src/env.ts` |

### 6.5 `react-*` — HIGH — React 19, React Compiler bật ở cả ba template

| Rule | Một câu |
|---|---|
| `react-no-forwardref` | `ref` là prop thường (`React.Ref<T>`), bỏ `forwardRef` |
| `react-no-inline-components` | Không khai báo component bên trong component/hook/callback/`.map()` — identity đổi mỗi render, subtree remount |
| `react-effects-sync-only` | `useEffect` chỉ để sync với hệ ngoài (DOM, listener, timer, socket); không derive state, không fetch (TanStack Query), không notify parent; reset bằng `key` |

### 6.6 `quality-*` — HIGH — chuẩn hằng ngày

| Rule | Impact | Một câu |
|---|---|---|
| `quality-simplicity` | HIGH | Rõ ràng hơn khéo léo; vòng lặp thường thay cho `reduce` lồng spread |
| `quality-imports` | MEDIUM | Chỉ `~/*` và `@monorepo/<pkg>/<subpath>`; bảng named/default (page, template, component, guard = default; hook, service, store, constant, type = named); `#components/*` chỉ trong `packages/ui`; ảnh **import** từ `~/assets/`, không string `public/` |
| `quality-avoid-barrel-imports` | MEDIUM | Không import qua barrel và **không viết** `index.ts`; mọi package subpath-only, trừ `@monorepo/dayjs` có root entry |
| `quality-code-comments` | MEDIUM | Comment cái "why" (quyết định, workaround, thứ tự bắt buộc), không narrate cái "what" |
| `quality-list-keys` | MEDIUM | `key={item.id}`; không có id thì `` `<list>-${index}` ``, không bao giờ index trần |
| `quality-styling-tailwind` | HIGH | Tailwind `className` + `cn()` + `cva`, token từ `@monorepo/tailwind-config`; `style` chỉ cho giá trị runtime; không hex, không `w-[137px]` |

### 6.7 `forms-*` — HIGH — Zod v4 + React Hook Form v7

| Rule | Một câu |
|---|---|
| `forms-schema-driven` | Một schema Zod ở `~/features/<feat>/types/<form>-form.ts`, type bằng `z.infer`; `import * as z from "zod"`; `{ error }` (v4) cho mọi validator; `.trim().min(1)`; `defaultValues` luôn có; `zodResolver` |
| `forms-field-components` | `Controller` + `Field`/`FieldLabel`/`FieldError`/`FieldContent`/`FieldGroup` từ `@monorepo/ui/components/field` (không có family `Form/FormField`); `data-invalid` + `aria-invalid`; action ngoài `<form>` nối bằng `form="<id>"`; `type="button"` cho nút không submit |
| `forms-use-watch` | Đọc giá trị live bằng `useWatch({ control, name })` ở component nhỏ nhất; trong handler dùng `getValues`; không `watch()` |

### 6.8 `tanstack-*` — HIGH — TanStack Query v5, chỉ trong `~/hooks/api`

| Rule | Một câu |
|---|---|
| `tanstack-key-factory` | Key qua `queryKeysFactory("<entity>")` (suy tên, không type argument): `all` / `lists()` / `list(q)` / `details()` / `detail(id)`; export `<entity>QueryKeys`; options typed bằng `UseQueryOptionsWrapper` & co. |
| `tanstack-use-query` | `useQuery({ queryKey: [...], queryFn: () => …, ...options })` — object argument, key mảng, `queryFn` là function reference, `...options` **cuối** |
| `tanstack-use-mutation` | `useMutation({ mutationFn, onSuccess: invalidate, ...options })`; **không** toast lỗi trong hook (global `MutationCache.onError` đã làm); `onError` chỉ để rollback |
| `tanstack-use-infinite` | `initialPageParam` + `getNextPageParam` bắt buộc; `queryFn({ pageParam })`; generic tường minh; `select` flatten pages |
| `tanstack-consume-query` | Gọi hook, không `useQuery` trực tiếp; gate bằng `enabled`; `isLoading` cho skeleton lần đầu, `isFetching` cho chỉ báo nhẹ; `invalidateQueries` qua factory thay vì `refetch()` |
| `tanstack-consume-mutation` | `mutate` / `mutateAsync`, `isPending`; không re-toast; call-site callback cho logic view (đóng dialog) |
| `tanstack-consume-infinite` | `data` đã flat; `fetchNextPage()` guard `hasNextPage && !isFetchingNextPage` |

Trong app server-rendered, cluster này chỉ quản **sau paint**; ranh giới nằm ở `next-data-fetching` /
`reactrouter-loader-vs-query`.

### 6.9 `patterns-*` — HIGH — dựng màn hình

| Rule | Một câu |
|---|---|
| `patterns-parallel-fetching` | Đọc độc lập → nhiều `useQuery` cạnh nhau (tự song song); phụ thuộc → `enabled`; nhiều id → `useQueries`; không `await` chuỗi, không gộp `Promise.all` một query |
| `patterns-fetch-on-mount` | Fetch khi component mount, không sớm hơn; navigate trước, đích tự fetch; phần ẩn thì **mount-gate** (`{open && <Body/>}`), không `enabled: isOpen` |
| `patterns-self-fetching-components` | Shape A: section tự fetch, tự skeleton, fail riêng; Shape B: một entity một fetch rồi prop-drill; không global loading flag |
| `patterns-self-fetching-inputs` | Input có option từ backend tự gọi hook, `select` → `{label,value}[]`, loading trên chính control; chỉ expose `value`/`onChange` |
| `patterns-hooks-over-context` | Gọi hook API ngay trong component; không god-context; Zustand đọc qua selector hẹp; không global loading overlay |
| `patterns-loading-skeletons` | `if (isLoading) return <XSkeleton />` — file `<name>.skeleton.tsx` riêng, khớp layout thật; `isFetching` cho badge refresh |
| `patterns-debounce-search-input` | `useDebounce` từ `@monorepo/hook/use-debounce` (~300 ms filter client, ~500 ms query); input bind giá trị tức thời |

### 6.10 `zustand-*` — HIGH — client state

| Rule | Một câu |
|---|---|
| `zustand-global` | `~/stores/use-<name>-store.ts` cho state app-wide client-owned (token, theme); `interface XxxStore` + `create<XxxStore>()`; `persist` khi cần; selector hẹp. Server data **không** vào store. App Next / React Router không có `~/stores/` — session là cookie |
| `zustand-feature` | State chung trong một slice → `~/features/<feat>/stores/`; một component → `useState`; draft giữ local, commit vào store khi "Áp dụng" |

### 6.11 `dates-*` — HIGH — dayjs

| Rule | Một câu |
|---|---|
| `dates-dayjs-singleton` | Import `dayjs` từ `@monorepo/dayjs` (plugin extend một lần), format từ `@monorepo/dayjs/formats`, locale qua `setDayjsLocale`; không default timezone; bridge i18n↔dayjs ở `~/libs/dayjs.ts` của app |
| `dates-locale-render-input` | Token nhạy locale (`dddd`, `MMMM`, `.fromNow()`) phải `.locale(i18n.resolvedLanguage ?? defaultLanguage)` — React Compiler không thấy locale global đổi; giữ timestamp trong state, không giữ dayjs instance |

### 6.12 `testing-*` — MEDIUM

| Rule | Một câu |
|---|---|
| `testing-coverage` | Coverage đo, **không** gate; test cái mình đổi (pure logic, branch user chạm được, bug vừa fix, mọi thứ có date/locale/tz); `queryBy*` cho absence; `TZ=UTC` pin trong `vitest.config.ts` |
| `testing-playwright` | `apps/<app>/e2e/*.e2e.ts`; `webServer` tự build + serve trên port E2E riêng (3100+n); hai project `chromium` (CI) / `watch` (headed); Runtime server-rendered assert **raw document** qua `request` fixture với `Accept-Language`; CI job `e2e` tự chạy, `continue-on-error`; Windows: `bunx playwright test` từ thư mục app |

---

## 7. Quy ước bao trùm

- **Ngôn ngữ**: trao đổi và artefact workflow (spec, ticket, `CONTEXT.md`, ADR, tài liệu design, note research)
  bằng **tiếng Việt**, thuật ngữ English giữ nguyên. Code, tên biến, commit message, `.agents/rules/*` bằng
  **tiếng Anh**. Skill của repo (nếu viết) bằng tiếng Việt, `description` song ngữ (`CLAUDE.md` §8).
- **Local-only**: không publish gì lên web/app ngoài GitHub Issues; artefact là file commit trong repo.
- **Không thêm phụ thuộc runtime**: không Python; skill nào cần thì dùng ở chế độ đọc dữ liệu tĩnh.
- **Không sửa skill vendored**: `npx skills@latest update <name>` cho 25 skill trong lock,
  `npx ui-ux-pro-max-cli update` cho bảy skill UI UX Pro Max, `npx gitnexus analyze` cho sáu `gitnexus-*`;
  muốn khác thì viết override vào `CLAUDE.md` §7a hoặc fork dưới tên mới.
- **Docs kiến trúc vào `docs/`**, không vào issue: ADR ở `docs/adr/`, research ở `docs/research/`, hướng dẫn ở
  `docs/guides/`; term vào `CONTEXT.md` / `CONTEXT-MAP.md`.
- **Gate** = `check` · `typecheck` · `test` · `build`, chạy local y hệt CI. E2E, docker, changeset-status,
  publish-smoke chạy trong CI nhưng không chặn.
- **GitNexus**: chạy `gitnexus_impact` trước khi sửa một symbol và `gitnexus_detect_changes` trước khi commit
  (khối GitNexus cuối `CLAUDE.md`); index cũ thì `npx gitnexus analyze`.
