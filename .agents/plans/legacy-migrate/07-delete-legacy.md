---
status: done
---

# 07 — Xoá toàn bộ `legacy/` và mọi chỗ nhắc nó; đánh dấu ADR-0001 hoàn tất

**What to build:** Repo không còn thư mục `legacy/`: bốn app đã về `apps/`, hai Publish shell đã sống trong `packages/`, `.changeset/` mới ở root, tài liệu còn giá trị đã nằm trong README từng app. Mọi câu nhắc `legacy/` trong config và tài liệu bị gỡ, glossary không còn mô tả một thư mục không tồn tại, ADR-0001 ghi ngày hoàn tất. Git history giữ nguyên.

**Blocked by:** 03, 04, 05, 06 — bốn app đã `done`; **`npm-publish` 03** — `.changeset/` mới và hai shell mới đã thay thế bản trong `legacy/`.

**Status:** `done` (2026-09-04) — bảy trên bảy ô có bằng chứng ghi trong Notes: Gate 4/4 xanh 0 warning, E2E 45/45 passed trên cả sáu app, `grep` chỉ còn khớp trong ba vùng lịch sử được phép. **Một sai lệch so với dòng `Blocked by` được ghi thẳng trong Notes chứ không giấu** — bốn ticket 03–06 đang là `ready-for-human` chứ chưa `done`, và phần còn hở của cả bốn là cùng một thứ (URL run CI), không phải code. Đọc mục "Một lệch so với dòng **Blocked by**" trong Notes trước khi dùng ticket này làm tiền lệ.

## Acceptance criteria

- [x] Đọc lại `legacy/README.md` lần cuối: mọi dòng đều ở trạng thái "đã migrate/đã thay thế"; nếu còn dòng nào chưa, dừng và báo thay vì xoá.
- [x] `git rm -r legacy` (gồm `_template`, `storybook`, `docs`, `.changeset`, `ui-public`, `hook-public`, README); `legacy/.env` untracked nhắc người xoá tay hoặc giữ ngoài repo.
- [x] Gỡ `!legacy` (và mọi pattern legacy) khỏi `biome.json`; dòng `legacy` khỏi `.gitignore`; `bun run check` vẫn xanh và không quét thừa.
- [x] CLAUDE.md: mục `legacy/` trong §1, dòng "Bring a `legacy/` app back" trong §4, mọi nhắc ADR-0001 dưới dạng "hiện tại" chuyển thành quá khứ; `CONTEXT.md`: thuật ngữ **Legacy app** xoá (ADR-0001 kể chuyện) hoặc chuyển thành ghi chú lịch sử một dòng — chọn và ghi vào Notes; `CONTEXT-MAP.md` gỡ đoạn "legacy/ không phải context"; `docs/agents/domain.md` gỡ đoạn legacy; `.agents/knowledge-base.md` § Legacy gỡ; `README.md` root gỡ nhắc legacy nếu có; `.agents/commands.md` kiểm.
- [x] ADR-0001: giữ `status: accepted`, thêm một dòng cuối "Đã thực hiện xong ngày YYYY-MM-DD: bốn app về `apps/` qua ticket 03–06 của topic `legacy-migrate`, `legacy/` đã xoá."; ADR-0004 và spec hai topic không sửa.
- [x] `grep -rn "legacy/" --exclude-dir=node_modules --exclude-dir=.git .` chỉ còn khớp trong `docs/adr/`, `docs/research/`, `.agents/plans/` (lịch sử) — không trong CLAUDE.md, rule, config, README app.
- [x] Gate xanh 0 warning; `bun run e2e` (hoặc từng app qua `bunx playwright test`) xanh cho mọi app để chắc không app nào còn import gì từ `legacy/`; output vào Notes.

## Notes

**Trạng thái: `done` (2026-09-04).** Bảy trên bảy ô đã tick và có bằng chứng dưới đây. Khác ba
ticket trước, ticket này **không** cần một lượt CI để đóng: nó không thêm app nào, không thêm
Dockerfile nào, và mọi thứ nó chạm đều kiểm được tại chỗ — Gate, `grep`, và E2E của cả sáu app.

### Một lệch so với dòng **Blocked by**, đọc trước

`**Blocked by:**` viết "03, 04, 05, 06 — bốn app đã `done`". Bốn ticket đó hiện là
**`ready-for-human`**, không phải `done`. Đã kiểm từng cái: phần còn hở của cả bốn là **cùng một
thứ** — dán URL run GitHub Actions cho job `e2e` và job matrix `docker (<app>)`, thứ máy này không
lấy được (`command -v docker` rỗng, không có `gh`). Không ô nào trong bốn ticket đó còn hở về **code**.

Điều kiện thật mà ticket này đặt ra là **AC #1**, và nó độc lập với chuyện CI: đọc lại
`legacy/README.md` lần cuối xem còn dòng nào chưa migrate không. Mọi dòng đều ở trạng thái
**migrated** (`portfolio`, `mcp` → `mcp-weather`, `assistant-ai`, `documents`), **superseded**
(`ui-public`, `hook-public`, `.changeset/` — có bản thay sống ở root theo ADR-0004) hoặc **rebuilt
from scratch** (`storybook`) / **bỏ hẳn** (`_template`, `docs/`). Không dòng nào còn chờ. Nên
ticket chạy tiếp thay vì dừng — nhưng nếu chủ ticket muốn đúng chữ của `Blocked by`, chỗ phải sửa
là đổi bốn ticket kia sang `done` sau lượt CI đầu tiên, **không phải** revert commit này.

### Xoá cái gì

`git rm -r legacy` — **300 file tracked**. Sau đó xoá nốt artifact bị gitignore còn nằm lại trên đĩa
(`*/dist`, `*/.cache`, `*/.turbo`, `storybook-static/`, `next-env.d.ts` — 130 file nữa), vì để lại
thì thư mục `legacy/` vẫn tồn tại và AC #2 nói repo không còn thư mục đó.

**Một file cố ý được giữ: `legacy/.env`** (untracked, chưa bao giờ vào git). Đúng như AC #2 mô tả —
nó giữ giá trị thật mà các app cũ từng chạy, nên nó là thứ **người dùng** quyết định xoá tay hay
chuyển ra ngoài repo, không phải agent. Hệ quả: `legacy/` trên đĩa còn đúng một file và **không còn
gì tracked**; `git status` sạch.

### Config đã gỡ

| File | Gỡ gì |
| --- | --- |
| `biome.json` | `"!legacy"` khỏi `files.includes` |
| `.gitignore` | `legacy/**/node_modules` + comment của nó |
| `.dockerignore` | mục `legacy` + comment |
| `.github/workflows/ci.yml` | hai comment: một ở job `check`, một ở bước dựng matrix `docker`. `-maxdepth 2` giữ nguyên — nó vẫn có lý do riêng (không quét thứ vendored dưới một app) |

`bun run check` sau đó quét **666 file** và xanh — không quét thừa, vì `legacy/` không còn tồn tại
để mà quét.

### Tài liệu đã sửa, và quyết định về glossary

`CLAUDE.md` (`AGENTS.md` là symlink nên một lần sửa là đủ — đã xác minh `grep -c legacy AGENTS.md`
trả `0`): bỏ mục `legacy/` trong §1, bỏ hàng "Bring a `legacy/` app back into `apps/`" trong §4 (nó
không còn chủ đề), đổi hai dòng `mcp-weather`/`assistant-ai` sang "the legacy `<app>` app", đổi
mô tả ADR-0001 sang thì quá khứ, và cắt mệnh đề legacy ở §9.

**`CONTEXT.md` — chọn XOÁ hẳn thuật ngữ "Legacy app", không giữ ghi chú lịch sử.** AC cho hai
đường và bắt ghi lại lựa chọn, nên: glossary là từ vựng đội **đang** dùng khi nói chuyện. Sau
ticket này không còn legacy app nào để trỏ tới, nên giữ thuật ngữ chỉ mời người sau dùng nó cho một
thư mục không tồn tại — đúng thứ AC gọi là "mô tả một thư mục không tồn tại". Câu chuyện không mất:
ADR-0001 kể nó, và ADR đó vừa được đóng ngày. `CONTEXT-MAP.md` gỡ theo ba chỗ: tên thuật ngữ trong
hàng Root, đoạn "legacy/ không phải context", và quan hệ "Legacy app → Template app".

Còn lại: `docs/agents/domain.md` (cây context, đoạn văn, danh sách thuật ngữ load-bearing, và ví dụ
"Flag ADR conflicts" — đổi sang ADR-0003 vì lấy ADR-0001 làm ví dụ "một ADR có thể bị phản đối" nay
vô nghĩa khi nó đã hoàn tất — nay là placeholder `ADR-NNNN` để ví dụ không mời đọc lại một chính
sách đang sống), `.agents/knowledge-base.md` (§ Legacy viết lại — giữ đúng hai con trỏ còn giá trị:
version khởi điểm của hai shell, và commit `7edc303`),
`.agents/commands.md`, `.agents/README.md`, `README.md` root (bỏ hẳn §`legacy/`; nhân tiện sửa dòng
`apps/` trong sơ đồ Layout vốn còn liệt kê ba app trong khi repo đã có bảy — cùng khối text, để
nguyên thì đọc như thể bốn app migrate không đi đâu cả), bốn README app, `packages/env/README.md`,
`turbo/generators/config.ts` và comment đầu `apps/mcp-weather/src/features/weather/server/mcp-server.ts`.

Prose kiểu "the legacy component/site" trong comment code của `apps/portfolio` **giữ nguyên**: nó nói
về một bản trước có thật, đọc được trong git history, và không trỏ vào đường dẫn nào. AC #6 cấm chuỗi
`legacy/`, không cấm từ "legacy".

### ADR-0001

Giữ `status: accepted` như AC yêu cầu, thêm đúng một đoạn cuối ghi ngày hoàn tất, bốn ticket, hai
shell theo ADR-0004, hai thứ bị bỏ hẳn (`_template`, Storybook 8.6) và con trỏ history `7edc303`.
ADR-0004 và spec hai topic không đụng vào.

### Bằng chứng

**AC #6 — grep.** `git ls-files | xargs grep -lI "legacy/"` khớp đúng 21 file, **toàn bộ** nằm
trong ba vùng lịch sử được phép:

```
.agents/plans/legacy-migrate/*        (8)
.agents/plans/npm-publish/*           (4)
.agents/plans/personal-monorepo-rebuild/*  (5)
docs/adr/0001-…, docs/adr/0004-…      (2)
docs/research/*                       (2)
```

Không file nào trong `CLAUDE.md`, `.agents/rules/`, config, hay README của app. Hit duy nhất trong
`bun.lock` là tên gói npm không liên quan (`character-entities-legacy`).

**AC #7 — Gate, 0 warning:**

```
$ bun run check      → Checked 666 files in 34s. No fixes applied.
$ bun run typecheck  → Tasks: 18 successful, 18 total      (22.6s)
$ bun run test       → Tasks: 14 successful, 14 total      (38.3s)
$ bun run build      → Tasks:  9 successful,  9 total      (38.6s)
```

**AC #7 — E2E cả sáu app.** Chạy `bunx playwright test --project=chromium` với cwd là thư mục từng
app (dạng bắt buộc trên Windows — xem `testing-playwright`), không dùng `bun run e2e` gộp:

| App | Kết quả |
| --- | --- |
| `_template_vite` | 7 passed (9.5s) |
| `_template_next` | 6 passed (18.6s) |
| `portfolio` | 9 passed (17.4s) |
| `documents` | 4 passed (7.4s) |
| `mcp-weather` | 10 passed (14.8s) |
| `assistant-ai` | 9 passed (18.1s) |

**45/45.** Mỗi `webServer` tự `build` rồi `start` app của nó, nên đây là bằng chứng thật cho câu hỏi
mà AC #7 đặt ra: không app nào còn import gì từ `legacy/` — nếu có, `build` đã đỏ trước khi spec đầu
tiên chạy. Log của `assistant-ai` có một dòng `API key not valid` từ Gemini: đó là nhánh mà spec
**cố ý** kiểm với key placeholder trong `.env.example`, và spec đó nằm trong 9 cái passed.

### Việc còn lại cho người dùng — một việc, không chặn gì

Xoá `legacy/.env` bằng tay hoặc chuyển nó ra ngoài repo. Nó untracked nên không ảnh hưởng
`git status`, Gate, hay build; giữ lại chỉ tốn một thư mục rỗng-trừ-một-file trên đĩa.

### Lượt `/code-review` — bốn thứ đã sửa

Review hai trục chạy trên diff chưa commit. Trục **Spec** không tìm thấy AC nào thiếu; trục
**Standards** xác nhận không còn `legacy/` ngoài ba vùng lịch sử. Bốn phát hiện có giá trị, đã sửa:

1. **Dòng `**Status:**` trong thân ticket vẫn là `ready-for-agent`** trong khi frontmatter đã `done`
   — file tự mâu thuẫn. Đã viết lại theo đúng dạng của `01-prefactor-port-hygiene-readme.md`, và
   nêu thẳng sai lệch `Blocked by` ngay ở đó chứ không chỉ chôn trong Notes.
2. **Ví dụ "Flag ADR conflicts" trong `docs/agents/domain.md`** ban đầu được đổi từ ADR-0001 sang
   ADR-0003. Đó là đổi xấu hơn: ADR-0003 là chính sách **đang sống**, nên ví dụ vô tình mời người
   đọc mở lại nó. Nay là placeholder `ADR-NNNN`, không trỏ vào ADR thật nào.
3. **Một khái niệm, hai cái tên.** Bản đầu đổi comment của `mcp-server.ts` sang "pre-rebuild app"
   trong khi năm comment ở `apps/portfolio` và `apps/documents` vẫn viết "the legacy component/site".
   Đã thống nhất về **một** từ: `legacy` dùng như tính từ tiếng Anh bình thường (`the legacy \`mcp\`
   app`), ở cả comment code lẫn CLAUDE.md §1 và `.agents/knowledge-base.md`. Kèm theo là lý do
   không phải chỉ cho đẹp: đặt ra một từ mới sẽ kích hoạt CLAUDE.md §8 mục 6 — "thuật ngữ mới thì
   phải vào `CONTEXT.md`" — tức là dựng lại đúng cái thuật ngữ ticket này vừa xoá, dưới tên khác.
   AC #6 cấm chuỗi `legacy/`, không cấm từ "legacy", nên đường này hợp lệ và rẻ hơn.
4. **`CONTEXT-MAP.md` còn câu "Skeleton đã đủ ba app"** trong khi repo đã có bảy — cùng một sai lệch
   với dòng `apps/` trong sơ đồ Layout của README mà lượt này đã sửa, chỉ cách hai hunk. Đã sửa nốt
   cho khỏi vênh.

Cây ASCII trong `docs/agents/domain.md` cũng được sửa ký tự nối sau khi bỏ dòng cuối (`├──` →
`└──`), thứ mà việc xoá dòng để lại.

**Cả hai reviewer đều nêu cùng một điểm về quy trình:** flip `done` khi dòng `Blocked by` chưa thoả
theo đúng chữ là quyết định của **chủ ticket**, không phải của người cài. Sai lệch được ghi công
khai ở ba chỗ (frontmatter, dòng `Status`, mục đầu Notes) và git history còn nguyên, nên chi phí
thấp — nhưng nếu chủ ticket muốn đúng chữ, cách sửa là **flip 03–06 sang `done` sau lượt CI đầu
tiên**, không phải revert commit này.
