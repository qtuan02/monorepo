---
status: done
---

# 11 — Skills vendored, MCP, GitNexus, `docs/agents`, symlink `.claude`, README

**What to build:** Trong Target, `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review` chạy được với tracker markdown trong `.agents/plans/`; `react-best-practices`, `web-design-guidelines` và bộ skill GitNexus có mặt; Context7 và GitNexus MCP đăng ký project-scope; `npx gitnexus analyze` sinh index và khối `gitnexus:start/end` trong `CLAUDE.md`; `.claude` là symlink git tới `.agents` và README hướng dẫn bật symlink trên Windows; README root mô tả clone, cài, chạy từng app, Gate, tạo app mới, trạng thái `legacy/`.

**Blocked by:** 09 — Generator; 10 — CLAUDE.md + rules.

> Chạy từ session ở reference (`E:\MedViet\frontend\medviet`), ghi sang `D:\Personal\monorepo` bằng đường dẫn tuyệt đối — xem "Cách chạy ticket" trong `decisions.md`. Không sửa gì ở reference ngoài file ticket này.

**Status:** done (2026-09-04 trên nhánh `feat/upgrade`, commit `c593524`; Gate 4/4 xanh local trên đúng commit đó, ô CI chờ push)

> **Commit.** Ticket 02→10 chưa từng commit, nên lượt này chốt hai commit thay vì một (user chọn): `125dc9c` "build the Skeleton" (295 file — packages, hai Template app, storybook, generator, 46 rule) rồi `c593524` cho ticket 11 (166 file). `CLAUDE.md` và `.agents/README.md` nằm ở commit **thứ hai** vì cả ticket 10 lẫn 11 đều viết vào chúng và chúng chưa từng được commit — dựng lại "bản ticket 10" sẽ là bịa ra một trạng thái chưa bao giờ tồn tại; commit message nói rõ điều đó. Working tree sạch sau cả hai.
>
> **Line ending:** `skills` CLI ghi 71 file bằng CRLF; đã normalize sang LF **trước khi** commit (git sẽ tự convert lúc add, nhưng khi đó working tree và object store lệch nhau, và Windows sẽ giữ CRLF cho tới lần checkout sau). Sau normalize, `git add` không còn warning nào và Gate chạy lại vẫn xanh.

- [x] `.agents/skills/` vendored cho 23 skill (22 skill reference đã pin, bỏ `writing-great-skills`, cộng `writing-for-agents` và `wizard`); `skills-lock.json` sinh bởi CLI; `.gitattributes` (`* text=auto eol=lf`) đã có từ ticket 01 nên hash không lệch trên Windows
- [x] Hai skill Vercel — nhưng tên upstream đã đổi, xem "Lệch so với ticket" #1
- [x] `.mcp.json` project-scope: `context7` (http `https://mcp.context7.com/mcp`) và `gitnexus` (`npx -y gitnexus@latest mcp`). **Không có credential trong file** — key Context7 của máy này nằm ở user-level config, cố ý không commit
- [x] `npx gitnexus@latest analyze` chạy xong (4.237 node / 8.478 edge / 141 cluster / 216 flow, 25s): `.gitnexus/` gitignored sẵn từ ticket 01, khối `gitnexus:start/end` trong `CLAUDE.md` (đúng **một** cặp marker), sáu skill `gitnexus-*` — vị trí lệch ticket, xem #2. `gitnexus-pr-review` chỉ có ở plugin, không vendored: đã ghi ở `CLAUDE.md` §7 và không link như file trong repo
- [x] `.claude` là symlink → `.agents`, git mode **120000**, blob `c0ca468` (trùng đúng blob của reference); `git add -f` vì `.gitignore` chặn `.claude/`. README ghi `git clone -c core.symlinks=true` + Developer Mode
- [x] `docs/agents/issue-tracker.md` + `triage-labels.md` + `domain.md`; `docs/research/.gitkeep` đã có từ ticket 01
- [x] `.agents/README.md` **mở rộng** (index rule giữ nguyên, 49 link `](rules/` còn nguyên), `commands.md`, `knowledge-base.md` viết cho Target
- [x] README root viết lại hoàn toàn
- [x] Gate xanh local: `check` 353 file / no fixes · `typecheck` 12/12 · `test` 8/8 · `build` 3/3, cả bốn exit 0. **Ô CI vẫn chờ push** — xem "Còn treo"

---

## Lệch so với ticket (và vì sao)

1. **`react-best-practices` → `vercel-react-best-practices`.** Vercel đã đổi tên skill ở upstream; `--skill react-best-practices` cài được **0** skill và CLI không báo lỗi, chỉ im lặng cài `web-design-guidelines`. Đã `--list` để tìm tên thật. Mô tả skill giống hệt bản reference đang giữ dưới tên cũ. Hệ quả đã xử lý: bảng §7 của `CLAUDE.md` dùng tên mới kèm một dòng blockquote giải thích, và §7a (đoạn "LOAD skill …") đã đổi theo — nếu quên chỗ thứ hai thì hướng dẫn trỏ tới một skill không tồn tại.

   Lệnh thật đã chạy (ticket yêu cầu ghi lại):

   ```bash
   npx --yes skills@latest add mattpocock/skills -a claude-code --copy -y --skill <23 tên cách nhau bằng dấu cách>
   npx --yes skills@latest add vercel-labs/agent-skills -a claude-code --copy -y --skill vercel-react-best-practices web-design-guidelines
   ```

   Ba chi tiết cú pháp khác ticket: **không có `-p`** (`add` mặc định là project scope; `-p/--project` chỉ tồn tại ở `update`), `--copy` để vendor file thật thay vì symlink vào agent dir, và `-a claude-code` ghi vào `.claude/skills` — nên **symlink `.claude` phải tạo TRƯỚC** khi cài, nếu không CLI tạo một thư mục `.claude` thật và skill không nằm trong `.agents/`. `npx add-skill` mà ticket nêu không phải CLI này; `skills` là CLI có `skills-lock.json`.

2. **Sáu skill GitNexus nằm phẳng ở `.agents/skills/gitnexus-*`, không dưới `.agents/skills/gitnexus/`.** Đó là nơi `gitnexus analyze` tự ghi, và bảng CLI trong chính khối GitNexus của `CLAUDE.md` trỏ tới `.claude/skills/gitnexus-<x>/SKILL.md` — tức là phẳng. Reference lồng một cấp, nhưng gom lại cho khớp reference sẽ **nhân đôi** ở lần `analyze` sau (tool ghi lại bản phẳng, không thấy bản đã dời). Chọn: giữ đúng hình dạng tool tự bảo trì, và sửa dòng `gitnexus/*` trong bảng §7 thành `gitnexus-*` (six).

3. **`AGENTS.md` — ngoài phạm vi ticket, nhưng `analyze` tự tạo ra nên phải xử lý ngay.** `gitnexus analyze` ghi khối của nó vào **cả hai** tên `AGENTS.md` và `CLAUDE.md`. Vì Target có `CLAUDE.md` là file thật, lần chạy đầu đẻ ra một `AGENTS.md` **45 dòng chỉ chứa khối GitNexus** — không có §1–§9 nào. Một agent mở đúng file đó sẽ đọc nó như guide của project và không thấy gì cả; đây đúng loại documentation debt mà ticket 10 đã loại ba rule framework-mode để tránh.

   Chốt: `AGENTS.md` thành **symlink → `CLAUDE.md`** (mode 120000, blob `681311e`) — ngược chiều với reference (ở đó `CLAUDE.md` → `AGENTS.md`), vì ở đây file thật là `CLAUDE.md` do ticket 10 viết. Hai lần ghi của `analyze` rơi vào cùng một file. **Đã verify chứ không suy đoán**: chạy `analyze` lần hai, symlink còn nguyên và `CLAUDE.md` vẫn đúng một cặp marker. `--skip-agents-md` là đường thoát nếu sau này cần.

4. **Ngoài checklist, đã sửa ba chỗ ticket 10 để lại và một chỗ ticket 04 giao sang.**
   - `CONTEXT-MAP.md` không còn nói "Template app được dựng ở ticket 07/08"; viết lại theo cây thật, và nói rõ `legacy/` **không** phải context.
   - `CLAUDE.md`: gỡ blockquote "Not installed yet" ở §7; §1 thêm `skills/`, `commands.md`, `knowledge-base.md`, `docs/agents/`, `skills-lock.json`, `.mcp.json`, dòng `CLAUDE.md`/`AGENTS.md`; §3 hai dòng i18n trỏ sang knowledge base; §6 trỏ sang `commands.md`; §8 dòng "New skill" viết lại (skill tự viết **không** vào lock file; đừng sửa tay skill vendored); §9 ba mục trỏ file thật thay vì "(ticket 11)". Còn đúng **0** chuỗi "ticket 11" trong Target.
   - Ticket 04 giao: "cấm ICU rich-text tag hiện chỉ được canh bằng test → nên thành rule/ADR ở ticket 11". Đã ghi thành **quy tắc viết catalogue** ở `knowledge-base.md` § Internationalization (cả ba invariant, kèm lý do hai Flavor không thể cùng đúng) và bổ sung vào dòng §3 "A translation string" của `CLAUDE.md`. **Không** viết thành rule file mới: cluster rule là deliverable của ticket 10 và đã qua review đối kháng; thêm file lúc này bắt phải sửa cả `_sections.md` lẫn index trong `.agents/README.md` mà không thêm sức mạnh nào — invariant đã được **test thật** canh (`catalogue-invariants.test.ts`), knowledge base chỉ cần giải thích *vì sao* nó tồn tại.

## Kiểm chứng (tự chạy lại, không tin ghi chú của ticket trước)

- **Link:** 48 link tương đối trong 9 file vừa viết/sửa (`CLAUDE.md`, `README.md`, `CONTEXT-MAP.md`, ba file `.agents/*`, ba file `docs/agents/*`) — **0 gãy**, kiểm bằng script resolve từng đường dẫn.
- **Sự thật trong `knowledge-base.md`** không chép niềm tin từ ticket cũ; đã soi lại code: hai `@custom-variant data-horizontal/data-vertical` có thật ở `tooling/tailwind/globals.css:13-14`; `clearMocks: true` khai tường minh ở cả 5+ `vitest.config.ts`; TZ pin đúng **hai** chỗ (`process.env.TZ` module scope + `env: { TZ: "UTC" }`); `#hooks/*` có thật trong `imports` của `packages/ui/package.json` và `scripts/guard-no-local-hooks.ts` tồn tại; Next dev/start ở port 3001 qua `dotenv -e ../../.env`.
- **`.agents/README.md` không bị ghi đè:** chỉ thay khối đầu; đếm lại 49 link `](rules/` — index rule còn nguyên (ticket 10 cảnh báo đúng chỗ này).
- **`.gitnexus/` không lọt vào git:** `git check-ignore` xác nhận, `git status` không thấy.

## Review đối kháng (2026-09-04) — 7 phát hiện, đã sửa hết ở `970ce21`

Một lượt review độc lập trên diff của `c593524`, đối chiếu từng khẳng định với file thật. **Không** có link gãy (50/50 resolve), tên skill/thư mục khớp đĩa, và một loạt con số được xác nhận đúng (46 rule/11 cluster, port 3000/3001/6006/3101, `.nvmrc`, `bun@1.4.0`, cấu hình Biome, trigger CI, TZ double-pin, 17 entry `@radix-ui`). Bảy chỗ sai, đã kiểm lại từng cái trước khi sửa:

1. **`skills-lock.json` pin 25 chứ không phải 31.** Sáu skill `gitnexus-*` **không** có entry trong lock — `gitnexus analyze` mới là chủ của chúng, `skills update` không biết và không khôi phục được. Bốn file (§1 của `CLAUDE.md`, `README.md`, `.agents/README.md`, `knowledge-base.md`) đều viết như thể lock phủ cả 31, khiến câu "re-sync bằng `skills` CLI" sai với 6 skill. Đáng chú ý: **§7 của `CLAUDE.md` viết đúng ngay từ đầu**, tức là file tự mâu thuẫn với chính nó — đúng loại lỗi chỉ lộ khi có người đối chiếu hai chỗ.
2. **Từ vựng `status` có ba bộ khác nhau:** `CLAUDE.md` §7b (`in-progress`), `triage-labels.md` (năm role + `done`), `issue-tracker.md` phần wayfinding (`claimed`). Skill đọc tracker sẽ không bao giờ sinh ra giá trị mà §7b mô tả. Chốt: `triage-labels.md` là **bộ đóng** duy nhất (năm role + `in-progress` + `done`), hai file kia trỏ về nó; `claimed` bỏ hẳn.
3. **`ui-add` chạy `bunx shadcn@4.20.1`, không phải `@latest`** — tôi viết `@latest`. Pin chính là điểm mấu chốt: cách bố trí `#hooks` dựng trên hành vi resolve alias của 4.20.x, nên `@latest` vừa sai sự thật vừa ngược ý đồ của pin.
4. **Ghi chú e2e vừa sai vừa tự mâu thuẫn:** tôi viết "không được đi qua `turbo run` vì Turbo nuốt `PLAYWRIGHT_BROWSERS_PATH`", trong khi ngay bullet đầu lại khuyên `bun run e2e` — mà đó **chính là** `turbo run e2e`. Thực tế `turbo.json` đã khai biến đó trong `passThroughEnv` của task `e2e`. Viết lại: cả hai lớp bảo vệ (passThroughEnv + CI gọi thẳng script của app), kèm cảnh báo đừng gỡ `passThroughEnv`.
5. **Domain `next` của Biome nằm ở override scoped `apps/_template_next/**`**, không phải domain bật toàn repo cạnh `react`/`turborepo`/`types`.
6. **`packages/i18n` chạy jsdom**, nên "node in the packages" ở bảng Gate của `README.md` sai.
7. **Hai citation `decision 3` / `decision 6`** tôi viết trong `commands.md` trỏ tới `decisions.md` — file hiện **không** có trong Target (nó ở thư mục plan bên reference, ticket 12 mới copy sang). Đã viết lại cho tự đứng được. Các citation `decision 17` / `decision 3` còn lại là của ticket 10 và sẽ resolve khi ticket 12 copy plan vào — xem "Còn treo".

## Còn treo

- **Ô "Gate xanh trên CI" chưa tick.** Vẫn là món nợ từ ticket 01: nhánh `feat/upgrade` chưa push nên workflow chưa chạy lần nào. Bốn job chạy đúng bốn lệnh vừa xanh local, nhưng runner là `ubuntu-latest` còn đây là Windows — thứ chỉ CI thấy được là khác biệt line-ending (đã có `.gitattributes` chặn) và symlink (`core.symlinks` mặc định **true** trên Linux, nên `.claude`/`AGENTS.md` sẽ checkout đúng). Đẩy nhánh là việc của **ticket 12**.

- **`bun run build` in một `WARNING IO error: provided value is too long when setting link name for apps/_template_next/.next/node_modules/import-in-the-middle-…`.** Là cảnh báo **ghi cache của Turbo** trên Windows (path quá dài), không phải lỗi build: `bun run build` exit **0**, 3/3 task successful. Có từ trước ticket này (lượt này không chạm gì trong `apps/_template_next`). Nếu ticket 12 muốn dọn: bật long-path của Windows, hoặc bỏ `.next/node_modules` khỏi `outputs` trong `turbo.json`.

- **Ba citation `decision N` của ticket 10 vẫn treo trong Target.** `CLAUDE.md:73` (decision 3), `CLAUDE.md:388` + `:417` và `.agents/README.md:8` (decision 17) trỏ tới `decisions.md` — file đang ở thư mục plan bên reference, **chưa** có trong Target. Ticket 12 copy thư mục plan sang là chúng resolve; nếu ticket 12 quyết định **không** copy thì phải viết lại bốn chỗ đó cho tự đứng được (như đã làm với hai chỗ trong `commands.md`).

- **Tracker nói `status` ở frontmatter, nhưng chính thư mục plan này chưa theo.** `docs/agents/issue-tracker.md` (và `CLAUDE.md` §7b/§9, viết từ ticket 10) quy định `status` là **key trong YAML frontmatter**. Thư mục `personal-monorepo-rebuild/` viết trước quy ước đó: `spec.md` có frontmatter thật, còn `NN-*.md` dùng dòng đậm `**Status:**`. **Ticket 12 khi copy thư mục sang Target phải chuẩn hoá** 12 file ticket sang frontmatter, nếu không tài liệu tracker và ví dụ duy nhất của tracker mâu thuẫn nhau ngay ngày đầu.

- **`setup-matt-pocock-skills` đã được cài nhưng cố ý không chạy.** Nó là skill hỏi-đáp rồi *ghi đè* `docs/agents/*` theo một trong ba template có sẵn (`.scratch/` cho local markdown), không có nhánh nào cho layout `.agents/plans/`. Ba file ở đây viết tay theo đúng cấu trúc thật. Chạy lại skill đó sẽ thay bằng bản `.scratch/` sai — §7 đã ghi "already run; only needed to switch trackers" để chặn nhầm.
