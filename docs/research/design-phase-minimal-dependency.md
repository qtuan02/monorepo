# Pha **design** với phụ thuộc tối thiểu — vendor skill `design` bundled, kéo UI UX Pro Max về, hay zero-tooling?

> Ngày kiểm tra: **2026-09-05**, nhánh `dev`, HEAD `a33b350`. Nguồn: chỉ primary sources — file thật trên máy (đường dẫn kèm số dòng: `seed-canvas.mjs` đọc **toàn bộ** 465 dòng, `payload.template.html` chỉ grep, không nạp vào context), text SKILL của skill `design` bundled nạp qua Skill tool trong phiên này (**chỉ đọc**, không seed/không publish gì), docs chính chủ `code.claude.com/docs` (`skills.md`, `artifacts.md`, `whats-new/2026-w34`, `changelog.md`, `legal-and-compliance.md`, `settings-reference.md`), raw GitHub qua `gh api` của `vercel-labs/skills` (HEAD `435076e`) và `nextlevelbuilder/ui-ux-pro-max-skill` (HEAD `f3ac195`), `npm view`, và output thật của các lệnh chạy trong scratchpad: `npx skills@latest --help`, `npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --list`, `node seed-canvas.mjs --check/--extract`, Chromium headless (bản Playwright đã có sẵn ở `~/AppData/Local/ms-playwright`) mở file seeded với DNS bị chặn toàn bộ. **Không cài gì, không sửa `~/.claude`, không tạo Artifact/canvas, không sửa file nào ngoài note này.** Chỗ không xác minh được ghi **"chưa xác minh"** và gom ở §7.
>
> **Phạm vi:** trả lời ý của chủ repo, nguyên văn: *"kéo cài skill đó về, đầu tiên là cài lệnh gì global xong kéo skill về rồi thêm step design vào quy trình trước khi grill-with-docs, không cài thêm gì hết — research lại xem khả thi không"*. "Skill đó" mơ hồ giữa **(A)** skill `design` bundled của Claude Code và **(B)** UI UX Pro Max; note này research cả hai và thêm **(C)** zero-tooling để so. Nền tảng đã có: [`ui-ux-skills-design-workflow.md`](./ui-ux-skills-design-workflow.md) (không lặp lại §1.3/§4/§6/§7/§8 của nó, chỉ cập nhật) và [ADR-0008](../adr/0008-pha-design-canvas-va-working-files.md).

## Tóm tắt kết luận

1. **Câu "khả thi không" — trả lời thẳng theo từng nghĩa của "skill đó":**
   - **Nếu là skill `design` bundled:** không có "lệnh cài global" nào để chạy — nó **đã** nằm trong `claude.exe` và giải nén ra thư mục tạm khi gọi `/design` (§1). "Kéo về" nghĩa là copy hai file + text SKILL vào `.agents/skills/`. **Về kỹ thuật: được** — `seed-canvas.mjs` chỉ cần `node`, không mạng; file seeded chạy **hoàn toàn offline** (screenshot với DNS chặn toàn bộ byte-identical với bản có mạng); một project skill trùng tên `design` **đè** bản bundled theo đúng câu trong docs. **Về điều khoản: chưa xác minh** — hai file không có license header, gói npm ghi `SEE LICENSE IN README.md` mà README qua `npm view` rỗng, docs legal chỉ nói Claude Code chịu Consumer/Commercial Terms, còn SKILL text dặn "Never edit the payload's code" và "Keep the machinery to yourself". Commit 2,5 MB payload minified của Anthropic vào repo **public** là quyết định pháp lý chủ repo phải tự chốt, không phải quyết định kỹ thuật (§2.3).
   - **Nếu là UI UX Pro Max:** việc "cài global rồi kéo về" **đã làm rồi** hôm nay (`~/.agents/.skill-lock.json` ghi `installedAt 2026-09-05T14:08Z`, thư mục 3,8 MB/75 file ở `~/.claude/skills/ui-ux-pro-max`), và **Python 3.13.15 cũng đã được cài** cùng tối (`%LOCALAPPDATA%\Programs\Python\Python313`, mtime 21:07) — tức là "không cài thêm gì" đã bị vượt qua trước khi câu hỏi được đặt. Nhưng nó **không vẽ mockup** (note cũ §1) và skill `design` của họ là bộ sinh logo/CIP/banner qua **Gemini/MuAPI + API key + `pip install`** (§3.2) — không thay được bước "xem và sửa". Vendor vào `.agents/skills/` thì thêm 3,5 MB + hash CRLF không tái lập được (§3.4).
   - **"Thêm step design vào quy trình trước grill-with-docs"**: **đã có** — CLAUDE.md §7a "Pha design — tám bước, đứng trước grill" (`CLAUDE.md:431-446`) và ADR-0008. Không phải việc còn thiếu.
2. **Phụ thuộc thật của pha design hôm nay là năm thứ** (§1): skill bundled có mặt ở phiên đang chạy (đường dẫn tạm theo version Claude Code), `node`, payload 2,49 MB, Skill tool để lấy text, và — chỉ cho vai phụ — Python cho UI UX Pro Max. `npx`/mạng chỉ dính khi vendor thêm skill. **Không** còn phụ thuộc Artifact/claude.ai từ bản cập nhật ADR-0008.
3. **Phát hiện làm đổi cán cân:** ở chế độ local-only, **`--extract` là nghi thức thừa** — không ai Save được (canvas mở từ `file://` hiện badge "Read-only"), nên extract luôn trả về đúng bản đã commit (7/7 `.dc.html` `cmp` giống hệt, §4.2). Bước 1–2 của `design-handoff/SKILL.md` (tìm `seed-canvas.mjs`, `--check`, `--extract`, so ba loại file) đang bảo vệ một trường hợp không thể xảy ra.
4. **Bảy `.dc.html` đang commit đã là HTML tĩnh** (0 `{{hole}}`, 0 `<sc-for>`, 0 `data-props`, 0 `DCLogic`; chỉ có `<x-dc>`, `<helmet>`, dòng `support.js`) và **mở thẳng bằng browser được** (§4.1, hai ảnh chụp). Cái duy nhất hỏng là logo, vì `src="fptis.jpg"` tương đối mà ảnh không nằm cạnh file. Nghĩa là phương án (C) không phải viết lại gì — chỉ bỏ lớp seed.
5. **Khuyến nghị: (C) zero-tooling, giữ format `.dc.html` tương thích.** Artboard là file HTML tĩnh Claude viết, CSS lift từ `theme.css` inline (như hiện tại), ảnh trỏ tương đối sang asset của app; `canvas.json` và file seeded bỏ; `design-handoff/SKILL.md` rút từ 8 bước còn 5; ADR-0008 thêm một mục "Cập nhật". Phụ thuộc còn lại: **một browser**. Vẫn giữ đuôi `.dc.html` + dòng `support.js` để nếu một ngày muốn xem trên canvas pan/zoom thì skill bundled (còn nguyên trong Claude Code, không cần cài) seed được ngay từ cùng file — tuỳ chọn, không phải điều kiện. Chi tiết và cái mất: §4, §5, §6.
6. **Phát hiện phụ đáng ghi:** `skills-lock.json` hiện có **25/25 `computedHash` không tái lập được** từ working tree; 23/25 khớp lại khi đổi nội dung sang CRLF — lock được tính trên bản clone CRLF (`core.autocrlf=true`) trước khi `.gitattributes` chuẩn hoá về LF (§3.4). Không chặn gì hôm nay (note cũ §4.1: `experimental_install` không so hash), nhưng là lý do thêm để không vendor thêm 72 file CSV.

---

## §1. Bảng phụ thuộc hiện tại của pha design

| # | Phụ thuộc | Bằng chứng | Bị gì nếu mất |
|---|---|---|---|
| 1 | **Skill `design` bundled** — không có SKILL.md trên disk; text nằm trong `claude.exe`, chỉ đọc được qua Skill tool; runtime giải nén **hai file** vào `%LOCALAPPDATA%\Temp\claude\bundled-skills\2.1.261\<hash>\design\` | `ls` hai thư mục hash `1d492af…` và `afa7e9c…`: mỗi cái đúng 2 file `payload.template.html` (2.488.483 B) + `seed-canvas.mjs` (40.699 B); `cmp` hai cặp: identical. Skill tool phiên này in `Base directory … 1d492af…` | Đường dẫn đổi theo version Claude Code; `design-handoff/SKILL.md:24-39` phải `find` mỗi lần; Claude Code update đổi payload là canvas cũ và mới khác editor |
| 2 | **`node`** (hoặc `bun`) | `seed-canvas.mjs:17-18` import `node:fs`, `node:path`; dòng 5 "Runs on node or bun, no dependencies"; SKILL text: "With neither `node` nor `bun`, stop" | Không seed được; repo đã có Node 24 + Bun nên phụ thuộc này là **miễn phí** |
| 3 | **Payload 2,49 MB** — editor Claude Design minified | SKILL text: "the skill ships a **precompiled payload**… ~2 MiB minified — never read it into context" | Cần cho **seed** (dòng 372); **không** cần cho `--check` (323–347) và `--extract` (282–320), hai nhánh này chỉ đọc file seeded |
| 4 | **Skill tool** — để lấy text hướng dẫn format `.dc.html` | SKILL text: "The full format spec is not on the machine running this skill; the essentials are here" (Quick syntax card) | Không có Skill tool thì mất cả spec format lẫn đường dẫn base |
| 5 | **Python 3** — chỉ cho vai phụ UI UX Pro Max | `CLAUDE.md:422-428`; `~/.claude/skills/ui-ux-pro-max/SKILL.md:45` "Requires Python 3.x" | §3.3: Python có thật nhưng không trên PATH |
| 6 | **`npx` + mạng + git** — chỉ khi vendor thêm skill | §3.1 | Không dính vào vòng design hằng ngày |
| — | ~~Artifact / claude.ai / capability `self`~~ | ADR-0008 "Cập nhật 2026-09-05": local-only | Đã bỏ |

Hai điều về file seeded đáng ghi vì chúng quyết định (C):

- **Mở offline hoàn toàn.** Chromium headless (Chrome for Testing 151, bản Playwright đã có sẵn) mở `docs/design/portfolio-work-section/portfolio-work-section.html` (2,64 MB, gitignored) với `--host-resolver-rules="MAP * ~NOTFOUND"` (chặn mọi DNS): screenshot **byte-identical** với lần mở có mạng; stderr không có `ERR_`/`Refused`. Payload có 9 chỗ `fetch(` (font-face của webfont, `_blob/` same-origin, index file), 1 chỗ dựng URL `fonts.googleapis.com` chỉ khi artboard khai webfont (`ensureWebfontLink`), 0 `import(`, 0 `WebSocket`/`XMLHttpRequest`/`sendBeacon`; ba chuỗi `unpkg.com` và `<script src="./vendor/react.js">` nằm trong string của JS, không phải thẻ load. Canvas hiện badge **"Read-only"** và "2 pages" ngay trên `file://` (ảnh chụp).
- **README trong head của template mô tả một model khác** ("The design does not live in this file. It lives in this artifact's store (Frame "db")…"), nhưng `seed-canvas.mjs` **ghi đè** README đó (dòng 40–41, 448–450) và **xoá `state.store`** (dòng 455–456: "No db capability in this preview: drop the live-store marker so the page boots as the page-is-the-document model with Save"). Tức bản seed là model "file là document", đúng thứ repo đang dùng.

---

## §2. Phương án (A) — copy skill `design` bundled vào `.agents/skills/`

### 2.1 `seed-canvas.mjs` — đọc toàn bộ, những gì quyết định

| Câu hỏi | Trả lời | Dòng |
|---|---|---|
| Import gì | chỉ `mkdirSync, readFileSync, writeFileSync` từ `node:fs` và `basename, extname, join, resolve` từ `node:path` | 17–18 |
| Gọi mạng | **không** — không có `fetch`, `http`, `child_process`, `net` | toàn file |
| `--extract` cần payload? | **không**: đọc trang seeded (`read(extractPath)`), parse state block bằng `DOC_RE`, ghi từng entry ra `--to` (từ chối ghi đè trừ `--force`) | 282–320 |
| `--check` cần payload? | **không**: đọc trang seeded, fail nếu còn placeholder/không parse/không có `.dc.html`, còn lại là warning | 323–347 |
| Seed cần gì | `--template` là **chính** `payload.template.html` — kiểm bằng placeholder `<title>APPIFACT-TITLE-PLACEHOLDER</title>`, `DOC_RE`, hai regex README trong head; sai thì fail "that is not the skill's payload.template.html" | 372–376 |
| Chấp nhận template ở path bất kỳ? | **có** — chỉ kiểm nội dung, không kiểm đường dẫn | 350, 372 |
| CRLF | mọi text read đều `.replace(/\r\n/g, '\n')` — "a Windows checkout or editor must not change what gets seeded" | 256–261 |
| Ràng buộc tên | artboard `/^[A-Za-z0-9_][A-Za-z0-9 _.-]{0,80}\.dc\.html$/`; file out lowercase, từ chối `design.html`/`index.html`/…; title từ chối `< > & "` và tên generic | 48, 244–245, 358–369 |
| Giới hạn editor | ≤ 200 entry, mỗi entry ≤ 2 MiB, canvas.json chỉ 4 khoá `artboards/annotations/launch/pages` | 62–63, 93 |
| Kiểm `support.js` | chỉ **warn** nếu artboard thiếu dòng `<script src="./support.js"></script>` | 390 |
| License header | **không có** — 16 dòng đầu là usage comment | 1–16 |

Chạy thử trên máy: `--check` file seeded của pilot → `ok: … 12 files (7 .dc.html + 4 ảnh + canvas.json)`; `--check` trên chính template → fail đúng thông điệp placeholder; `--extract` ra scratchpad → 12 file, **7/7 `.dc.html` `cmp` identical** với `artboards/` đã commit.

### 2.2 Payload — grep, không nạp

- Không có thẻ `<script src>`/`<link href>` nào trỏ ra ngoài ở mức trang; 8 thẻ script đầu đều inline (`appifact-doc`, `appifact-app`, …). Các chuỗi `https://unpkg.com/react@18.3.1/…`, `https://tailwindcss.com`, `https://fonts.googleapis.com/css2?family=${n}…` đều nằm **trong string JS** (grep ngữ cảnh 200 ký tự), không phải tag.
- License trong payload: chỉ block "Bundled license information" của bên thứ ba — React (`@license React … Copyright (c) Meta Platforms, Inc … MIT`), `tailwindcss … MIT License`. **Không** có dòng nào của Anthropic về license/redistribution của chính editor. Chuỗi nhận diện: `contract 0.1.31`, "Editor source: appifacts/design-editor (bun build.ts)" trong README head.
- Kích thước tính vào repo: 2.488.483 B **một lần** (payload) + 40.699 B; file seeded từng topic (≈2,64 MB) vẫn gitignore như hiện tại.

### 2.3 Điều khoản redistribution — cái không tìm thấy

| Nguồn | Nói gì |
|---|---|
| `npm view @anthropic-ai/claude-code license` | `SEE LICENSE IN README.md`; `npm view … readme` trả về **0 byte** trong phiên này → **chưa xác minh** nội dung license |
| [legal-and-compliance.md](https://code.claude.com/docs/en/legal-and-compliance.md) | "Your use of Claude Code is subject to: Commercial Terms of Service … Consumer Terms of Service"; "**The Claude Code binary must not be modified.**" (điều kiện cho khách preinstall — không nói về copy file skill ra ngoài) |
| [skills.md](https://code.claude.com/docs/en/skills.md) | **Không** có câu nào về license/redistribution của bundled skill (WebFetch trả "No statements about license, redistribution, or copying bundled skills"); trường `license` frontmatter "Claude Code accepts the field but doesn't act on it" |
| SKILL text (nạp phiên này) | "Keep the machinery to yourself - helper, payload, state block, capabilities, contracts, versions"; "Never edit the payload's code"; "You do NOT build or modify the editor" — là chỉ dẫn cho **agent** khi nói với user, không phải điều khoản pháp lý, nhưng cho thấy Anthropic coi payload là hộp kín |

Kết luận cho câu (3): **không có nguồn chính chủ nào cho phép hay cấm** copy hai file này vào một repo public. Đây là mục **chưa xác minh** lớn nhất của note, và là thứ cần chủ repo quyết (hoặc hỏi Anthropic) trước khi commit — vì `qtuan02/monorepo` là public (`docs/agents/issue-tracker.md:10`).

### 2.4 Đặt tên gì — override hay sống chung

Docs, nguyên văn ([skills.md](https://code.claude.com/docs/en/skills.md)): *"A skill at any of these levels also overrides a bundled skill with the same name, but not the bundled skill's aliases."* và ví dụ *"a `code-review` skill in your project's `.claude/skills/` replaces the bundled `/code-review`, and typing the bundled alias `/review` never runs your skill."* Project skill nằm ở *"`.claude/skills/<skill-name>/SKILL.md`"* — trong repo này là `.agents/skills/` qua symlink.

| Tên | Hệ quả |
|---|---|
| `design` | `/design` chạy bản trong repo, bản bundled bị che; Skill tool vẫn in "Base directory" cho project skill nên câu "`<base directory>/seed-canvas.mjs`" trong SKILL text giữ nguyên nghĩa. **Nhưng** mất luôn bản bundled mới hơn khi Claude Code update (chủ ý pin — tốt hay xấu tuỳ mục tiêu) |
| `design-canvas` | `/design` bundled **vẫn còn**, hai skill cùng mô tả "design canvas" → model có thể chọn nhầm. Che bundled bằng `skillOverrides: {"design": "off"}` trong settings (docs: `"off"` = "Hidden / Hidden"; "Invoking a hidden skill by its full name still returns the `skillOverrides` error") — phải ghi vào `.agents/settings.json` (= `.claude/settings.json`). `disableBundledSkills` thì **quá tay**: "disables every bundled skill except `/doctor`" — mất cả `/code-review`, `/loop`, … |

### 2.5 2,5 MB trong repo public — đụng đâu

- **Biome:** `biome.json:10-23` `files.includes` = `**` trừ danh sách; `.agents/skills/**` **không** bị loại. `seed-canvas.mjs` viết single-quote, không semicolon, dòng dài — `bun run check` sẽ đỏ hoặc format lại (làm lệch bản copy). Phải thêm `!.agents/skills/<tên>` — cùng hình dạng `!docs/design` đã dùng ở dòng 20.
- **`.gitattributes:6`** `* text=auto eol=lf`: không đụng — cả `payload.template.html` lẫn `seed-canvas.mjs` đều **0 byte CR** (`tr -cd '\r' | wc -c`), nên commit vào repo vẫn byte-identical với bản Anthropic ship; `seed-canvas.mjs:259` còn tự normalize CRLF→LF khi đọc.
- **`.gitignore:63-64`** không đụng (chỉ `docs/design/`).
- **`skills-lock.json`**: theo `CLAUDE.md:486` (§8) skill copy tay là "yours", **không** vào lock — nghĩa là không có hash nào bảo vệ payload khỏi bị sửa tay; chỉ có git.

### 2.6 Claude Code update đổi format — bản copy có hỏng không

- Bản copy là **một cặp** helper + payload cùng version; chúng chỉ nói chuyện với nhau qua `DOC_RE`/placeholder/README regex (dòng 29–39, 375). Update Claude Code không đụng cặp trong repo → **không hỏng**; nó chỉ **cũ đi** (SKILL text: "the editor is baked into each published canvas and will not pick up later fixes").
- Trộn helper mới + payload cũ (hoặc ngược lại) → seed fail **ồn ào** ở dòng 375–376 ("that is not the skill's payload.template.html"), không fail im.
- `.dc.html` là HTML thường; điều duy nhất editor cần là dòng `support.js` (helper chỉ warn — dòng 390). Format có thể được mở rộng ở version sau nhưng file cũ vẫn là HTML hợp lệ.
- Cách kiểm: `node <repo>/seed-canvas.mjs --check <seeded>` trên file seeded bằng cặp trong repo; và nếu muốn biết bundled đã đổi chưa: `cmp` hai file ở `bundled-skills/<version mới>/…` với bản repo (đúng cách note này đã làm giữa hai thư mục hash).
- Changelog 2.1.234→2.1.261 **không** có entry nào về `/design`/artboard/`.dc.html` (WebFetch changelog.md); whats-new w34 là nguồn duy nhất ("research preview", "Requires v2.1.234 or later"). Tức format chưa đổi lần nào kể từ khi ra — nhưng cũng chưa có cam kết ổn định nào.

### 2.7 (A) trả lời gì cho "không cài thêm gì"

Đúng nghĩa đen: **không cài gì** (Claude Code đã có; `node` đã có). Cái nó thêm là **2,5 MB code của bên thứ ba vào repo public với điều khoản chưa rõ**, một dòng exclude Biome, và một quyết định tên. Cái nó bớt: phụ thuộc vào đường dẫn tạm và vào việc skill bundled còn tồn tại/không đổi. Cái nó **không** bớt: `node`, payload, và text SKILL (vẫn phải copy ≈30 KB text ra `SKILL.md` — con số ước lượng, **chưa đo**).

---

## §3. Phương án (B) — UI UX Pro Max: "cài lệnh gì global xong kéo skill về"

### 3.1 Ba đường, cái gì thật sự được "cài"

Xác minh bằng `npx -y skills@latest --help` (phiên bản `1.5.23`, MIT, bin `skills`/`add-skill`) và `npx -y skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --list` (output: "`claude-code_2-1-261_agent` Agent detected — installing non-interactively … Cloning repository… Found **7** skills" với đúng bảy tên; lệnh chạy >180 s trên máy này vì clone cả repo), cộng source `vercel-labs/skills` HEAD `435076e`:

| Đường | Cái gì lên máy | Ghi lock? | Path trong SKILL.md | Thoả "không cài thêm gì"? |
|---|---|---|---|---|
| **`npx skills@latest add … --skill ui-ux-pro-max -a claude-code`** | (1) npx tải `skills@1.5.23` vào cache `%LOCALAPPDATA%\npm-cache\_npx\<hash>` (thư mục có sẵn, không phải global bin); (2) `git clone --depth 1` vào `os.tmpdir()/skills-*` (`git.ts:235-241`) — repo nextlevelbuilder **không** thuộc `BLOB_ALLOWED_OWNERS = ['vercel','vercel-labs','heygen-com']` (`add.ts:1186`) nên luôn clone; (3) copy vào `.agents/skills/<name>` (canonical, `installer.ts:291`), rồi symlink/junction sang `.claude/skills/<name>` (`installer.ts:255-258`; ở repo này hai chỗ là một); (4) **telemetry** POST `https://add-skill.vercel.sh/t` trừ khi `DISABLE_TELEMETRY`/`DO_NOT_TRACK` (`telemetry.ts:1,87`; `add.ts:903`) | Project: `skills-lock.json` với `computedHash` (`add.ts:947-960`). `-g`: `~/.agents/.skill-lock.json` (`add.ts:922`) — đúng file đã có entry `ui-ux-pro-max` hôm nay | **Copy nguyên** — bản global trên máy vẫn ghi `"${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py"` ở 10 chỗ (`~/.claude/skills/ui-ux-pro-max/SKILL.md:42,78,85,93,116,131,137,160,180,183`) | Không cài global bin; nhưng có network, git clone, npx cache, telemetry, và +3,5 MB vào repo nếu project scope |
| **`npm i -g skills` → `skills add …`** | Global bin `skills`/`add-skill` trong `%APPDATA%\npm` (hiện **không** có — `which skills`: not found) | như trên | như trên | **Không** — đúng nghĩa "cài thêm một thứ", và không được gì hơn `npx` |
| **`npx ui-ux-pro-max-cli init --ai claude`** | npx cache gói `ui-ux-pro-max-cli@2.15.0` (**MIT** theo `npm view` và `cli/package.json:49` — note cũ §1.3 ghi CC-BY-NC-4.0 là **sai/đã đổi**, **chưa xác minh** lịch sử); bin `uipro` không cài global | **Không** ghi `skills-lock.json` | Rewrite path tương đối (note cũ §1.3, `template.ts` — **chưa chạy thật**) | Không global bin; nhưng cũng là npx + mạng |

Kết luận cho câu (1): "cài lệnh gì global" **không có lệnh nào cần thiết** — `npx` là đường ít dấu vết nhất và là đường repo đang dùng cho 25 skill kia. Và nó **đã được chạy** với `-g` hôm nay.

### 3.2 Skill `design` của họ làm gì — đọc raw `.claude/skills/design/SKILL.md` (13.415 B, HEAD `f3ac195`)

- Frontmatter: `name: design`, `license: MIT`, `author: claudekit`, description bắt đầu bằng "Comprehensive design skill: brand identity, design tokens, UI styling, **logo generation (55 styles, Gemini, Atlas Cloud, or MuAPI AI)**, corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design…, icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML→screenshot…)".
- Cây file (36 blob): `scripts/{logo,cip,icon}/*.py` (generate.py 27 KB/19 KB/17 KB), `data/{logo,cip,icon}/*.csv`, `references/*.md` — **không có gì về mockup màn hình app**.
- Yêu cầu vận hành, nguyên văn mục Setup: `export GEMINI_API_KEY="your-key"`, `pip install google-genai pillow`, `export MUAPI_API_KEY="your-key"`; mục Prerequisites: "This skill uses Python scripts". Banner/social photos dựa vào các skill **không có ở đây** (`frontend-design`, `ai-artist`, `ai-multimodal`, `chrome-devtools`, `project-management`, `assets-organizing`) và "browse Pinterest for references".
- Không vẽ mockup HTML cho UI: phần "UI styling" là route sang sub-skill `ui-styling` (shadcn/Tailwind code), không phải artboard.
- **Trùng tên `design`** → cài vào project sẽ **đè** `/design` bundled theo đúng câu docs ở §2.4 — đúng như `CLAUDE.md:428` đã cảnh báo.

Kết luận cho câu (2): vendor nó thay bundled `/design` là **đổi một công cụ vẽ mockup offline lấy một bộ sinh logo/banner cần API key và mạng** — mất cái cốt lõi (xem + sửa nhiều vòng), được cái repo này không cần (logo/CIP/slide). Loại.

### 3.3 Python trên máy này — có thật, nhưng không trên PATH

| Kiểm | Kết quả |
|---|---|
| `which -a python python3` | `…/AppData/Local/Microsoft/WindowsApps/python`, `…/python3` — cả hai là symlink tới `AppInstallerPythonRedirector.exe` (Store stub) |
| `python --version` | "Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut…" |
| `py -3 --version` | `py: command not found` |
| `%LOCALAPPDATA%\Programs\Python\` | **có** `Python313\python.exe` → `Python 3.13.15`, và `Launcher\py.exe`; cả hai thư mục mtime **2026-09-05 21:07** — cùng tối với lần cài UI UX Pro Max global (21:08) |
| PATH có `Programs\Python`? | **không** (grep PATH: chỉ WindowsApps) |
| `__pycache__/*.cpython-313.pyc` (mtime 21:10) | magic `f30d0d0a` = CPython 3.13 → `search.py` đã chạy thành công ít nhất một lần bằng bản thật |
| `"%LOCALAPPDATA%\Programs\Python\Python313\python.exe" ~/.claude/skills/ui-ux-pro-max/scripts/search.py --help` | in đủ usage (`--domain`, `--stack`, `--design-system`, `--variance/--motion/--density`…) |

Nghĩa là: câu "không cài thêm gì" **đã không còn đúng với Python** — nó được cài hôm nay, có lẽ cho chính pilot này. Để dùng được phải gọi bằng **đường dẫn đầy đủ** (như `CLAUDE.md:424` đã gợi ý cho `search.py`), hoặc tắt App execution alias / đưa `Programs\Python\Python313` lên trước `WindowsApps` trong PATH (**chưa làm, chưa xác minh** cách nào ít xâm lấn hơn). Với phương án (C) thì Python **không cần** cho gì cả.

### 3.4 Vendor 3,5 MB + hash CRLF — kiểm trên chính repo

`.gitattributes:6` là `* text=auto eol=lf`; máy `core.autocrlf=true`, `core.symlinks=true`. Tái lập `computeSkillFolderHash` (`local-lock.ts:145-160`: sort `localeCompare`, `hash.update(relativePath); hash.update(content)`) trên `.agents/skills/<name>` của 25 entry hiện có:

- Working tree LF (0 file có CR): **0/25 khớp** `computedHash` trong `skills-lock.json`.
- Đổi nội dung text sang CRLF rồi hash lại: **23/25 khớp** — 2 cái lệch là `vercel-react-best-practices` và `web-design-guidelines`, đúng hai skill từ `vercel-labs`, tức đi đường "blob" (không clone; `BLOB_ALLOWED_OWNERS` gồm `vercel-labs`) — vì sao vẫn lệch: **chưa xác minh**.

Đọc ra: lock được viết (commit `c593524`, 2026-09-04) từ bản **clone tạm CRLF** trước khi file vào repo và bị chuẩn hoá LF; hash trong lock **không tái lập được** từ checkout, trên Windows lẫn Linux. Hôm nay không ai bị chặn (note cũ §4.1: `experimental_install` không so hash), nhưng vendor thêm 72 file CSV/JSON của UI UX Pro Max chỉ nhân thêm số hash vô nghĩa. `.gitattributes` **không** sửa được — hash tính ở thư mục tạm, ngoài tầm của nó.

---

## §4. Phương án (C) — zero-tooling: artboard là HTML tĩnh, chủ repo mở bằng browser

### 4.1 Cái đã có sẵn: bảy `.dc.html` của pilot mở thẳng được

Đếm marker trên `docs/design/portfolio-work-section/artboards/*.dc.html` (7 file, 7,8–14,6 KB):

```text
                 {{  sc-for  sc-if  data-props  dc-import  DCLogic  <script>  <x-dc>  <helmet>  support.js  <img>
mọi file          0       0      0           0          0        0         1       1         1           1     4–5
```

Tức chúng là **HTML + inline style thuần**: `<script src="./support.js">` (404 trên `file://`, vô hại vì không có logic), `<x-dc>`/`<helmet>` là custom element chưa định nghĩa (browser render như inline box, `<style>` bên trong vẫn áp dụng). Chromium headless mở thẳng `artboards/Main.dc.html`: render đúng bố cục (rail thời gian, pill "02/2026 – Hiện tại", chip công nghệ, `+7 công nghệ`), chỉ **logo vỡ** vì `src="fptis.jpg"` tương đối mà ảnh không nằm cạnh; copy 4 ảnh (extract từ file seeded) vào cạnh → render **đủ**. Hai ảnh chụp nằm trong scratchpad phiên này. Màu đã là oklch literal lift từ `theme.css` (`brief.md:41-63`), font là system stack — không có Tailwind, không có webfont, **không có gì cần CDN**.

### 4.2 `--extract` là thừa trong local-only

Không có Save (badge "Read-only" trên `file://`; SKILL text: "Without it Save is refused and the view is read-only"), nên file seeded luôn được sinh từ `artboards/` đã commit, và extract luôn trả về đúng nó — đã chứng minh 7/7 `cmp` identical (§2.1). `design-handoff/SKILL.md` bước 1 (`--check` + `--extract`, dòng 43–46) và bước 2 (so ba loại file, dòng 47–61) đang giải bài toán "canvas có thể khác repo" — bài toán **không tồn tại** khi canvas không hosted. Cả mục "Tìm `seed-canvas.mjs` ở phiên hiện tại" (dòng 24–39) cũng chỉ phục vụ hai bước đó.

### 4.3 (C) trông thế nào

- `docs/design/<topic>/artboards/<Name>.dc.html` — Claude viết **như đang viết**, một file một artboard, inline style lift từ `tooling/tailwind/theme.css` (8,5 KB, 195 dòng — nhỏ, lift tay là đủ; hoặc một `artboards/theme.css` chung khai `:root`/`.dark` copy từ theme, `<link rel="stylesheet" href="./theme.css">` chạy trên `file://`). **Không Tailwind CDN** — nó cần mạng, phá "offline".
- Ảnh: `<img src="../../../../apps/portfolio/src/assets/logos/fptis.jpg">` — trỏ thẳng asset app sở hữu bằng đường dẫn tương đối, **không copy** (giải luôn mối lo "bản sao thứ hai trôi khỏi bản gốc" ở `design-handoff/SKILL.md:55-58`). **Chưa xác minh** đường dẫn `../../../../` chạy trên `file://` — Chrome cho phép ảnh tương đối trong cùng ổ đĩa, nhưng chưa test.
- Xem: chủ repo mở từng file bằng browser; muốn nhìn cạnh nhau thì mở nhiều tab, hoặc một `artboards/index.html` Claude viết với `<iframe src="./Main.dc.html" width=720 height=940>` xếp lưới (**chưa xác minh** iframe `file://`→`file://` hiển thị được trên Chrome; về lý thuyết render được, chỉ không truy cập DOM chéo).
- Sửa: chủ repo nói → Claude sửa file → F5. Không seed, không re-seed.
- Chốt: `/design-handoff <topic>` đọc `brief.md` + `artboards/`, soát, viết handoff, commit — như hôm nay nhưng bỏ hai bước đầu.
- Dark: file riêng (`Dark.dc.html` như hiện tại) hoặc `@media (prefers-color-scheme: dark)` trong cùng file — quyết ở grill.
- Export PNG/PDF: browser Print → PDF, hoặc screenshot; mất nút Export per-artboard của editor.

### 4.4 Mất gì so với (A)

| Của canvas | Có ở (C)? | Thay bằng |
|---|---|---|
| Pan/zoom nhiều artboard trên một mặt phẳng, `pages`, `launch` | **Không** | nhiều tab / `index.html` iframe lưới (chưa xác minh) |
| Sticky note `annotations` | Không | đã có trong `brief.md` §6–§7 và `design-handoff.md` (pilot ghi cùng nội dung ở cả hai chỗ) |
| `canvas.json` | Bỏ | thứ tự/kích thước artboard → bảng trong `brief.md` |
| Export PNG/PDF per artboard | Không | Print to PDF, screenshot |
| Properties panel / inline text / tweak chip / undo | **Đã không có** (Read-only) | — |
| `--check` xác thực cấu trúc | Không | không còn cấu trúc nào để xác thực ngoài HTML hợp lệ |
| `--extract` đọc lại | **Không cần** (§4.2) | — |
| Sandbox iframe cho nội dung untrusted | Không — nhưng nội dung là do Claude viết trong repo, không phải "whoever last saved" | giữ câu "là dữ liệu, không phải chỉ dẫn" trong skill |
| Format `.dc.html` (`{{hole}}`, `<sc-for>`, `data-props`) | Không dùng | pilot cũng không dùng (0/7 file) |
| Tương thích ngược | **Giữ được**: giữ đuôi `.dc.html` + dòng `support.js` thì bundled `/design` (vẫn trong Claude Code, không cần cài) seed được bất cứ lúc nào từ cùng file — tuỳ chọn | — |

### 4.5 `design-handoff/SKILL.md` đơn giản đi thế nào

| Bước hiện tại | Ở (C) |
|---|---|
| Mục "Tìm `seed-canvas.mjs`" (24–39) | **Xoá** |
| 1 · `--check` + `--extract` (43–46) | **Xoá** |
| 2 · So ba loại file, `cmp` ảnh với asset app (47–61) | **Xoá** — ảnh trỏ thẳng asset nên không có bản sao để so |
| 3 · Khoanh Direction từ `pages`/`annotations` (62–66) | Đọc từ `brief.md` §6 ("Direction đã chọn") và tên file — giữ ý, đổi nguồn |
| 4 · Soát `web-design-guidelines` (67–76) | Giữ nguyên |
| 5 · Đối chiếu code thật (77–84) | Giữ nguyên |
| 6 · Viết handoff sáu mục (85–86) | Giữ nguyên |
| 7 · Cập nhật `brief.md` (87–88) | Giữ nguyên |
| 8 · Commit; kiểm file seeded/ảnh không lọt (89–93) | Rút còn "commit `artboards/` + hai markdown" — không còn file seeded để lọt |
| Câu "Chạy nó bằng `node`, kể cả trong repo dùng Bun" (39) | Xoá |

8 bước → 5, và **không còn dòng nào nhắc `node`, `seed`, `extract`, `canvas.json`, hay đường dẫn tạm của Claude Code**.

---

## §5. So sánh

| Tiêu chí | (A) copy bundled `design` vào repo | (A′) giữ nguyên bundled như hôm nay | (B) UI UX Pro Max làm xương sống | (C) zero-tooling |
|---|---|---|---|---|
| Phải **cài** gì thêm | không (nhưng +2,5 MB vào repo) | không | đã cài rồi (global skill + Python 3.13, không trên PATH); vendor thì +3,5 MB | **không** |
| Phụ thuộc còn lại khi vẽ/xem/sửa | `node`, cặp payload+helper trong repo, Skill tool cho text (hoặc copy text) | `node`, skill bundled ở đúng version, đường dẫn tạm, Skill tool | Python (full path), CSV; **không có bước xem/sửa** | **browser** |
| Có "xem + sửa nhiều vòng"? | có (xem; sửa qua Claude) | có | **không** | có (xem; sửa qua Claude) — như hai cột trái vì Save vốn không có local |
| Pan/zoom, pages, export | có | có | — | không (§4.4) |
| Rủi ro pháp lý / repo public | **chưa xác minh** license payload; SKILL text coi nó là hộp kín | không | MIT | không |
| Sống sót Claude Code update | pin cứng; bundled mới không ảnh hưởng | đường dẫn/format có thể đổi; `find` mỗi lần | không liên quan | **không liên quan** |
| Việc phải sửa trong repo | thêm `.agents/skills/<name>/{SKILL.md,seed-canvas.mjs,payload.template.html}`; `biome.json` thêm `!.agents/skills/<name>`; `design-handoff/SKILL.md:24-39` trỏ vào repo thay vì `find`; CLAUDE.md §7 bảng skill; quyết tên/`skillOverrides`; ADR-0008 mục mới | không | ADR-0008 phải đảo (nó đã loại phương án này ở dòng 15); mất bước xem | ADR-0008 mục "Cập nhật" thứ hai; `CLAUDE.md:143,233,372,435-444`; `CONTEXT.md:59` (term **Design canvas** → đổi nghĩa hoặc bỏ); `.gitignore:58-64` (giữ được nếu vẫn đuôi `.dc.html`; nếu đổi sang `.html` thì dòng 63 sẽ ignore nhầm artboard — phải sửa); `biome.json:20` giữ; `design-handoff/SKILL.md` rút 8→5 bước |
| Hợp với "giảm phụ thuộc tối đa" | trung bình — bớt temp path, thêm 2,5 MB blob | thấp nhất — không đổi gì | không | **cao nhất** |

---

## §6. Khuyến nghị và câu hỏi mở cho `/grill-with-docs`

**Khuyến nghị: (C), giữ artboard ở dạng "static HTML tương thích DC".** Lý do gom lại: (i) bảy artboard đang có đã là HTML tĩnh mở được bằng browser — không viết lại gì; (ii) `--extract` đã là nghi thức thừa từ khi chuyển local-only, nên hai bước và một mục của `design-handoff` biến mất mà không mất bảo đảm nào; (iii) phụ thuộc còn lại là browser; (iv) giữ đuôi `.dc.html` + dòng `support.js` thì canvas pan/zoom vẫn gọi được từ skill bundled khi cần, **không cài gì** — nó là tuỳ chọn chứ không phải điều kiện vận hành; (v) không phải chốt câu hỏi license của (A) và không phải mang Python/CSV của (B).

Không khuyến nghị (A) trừ khi chủ repo hỏi được Anthropic về redistribution — vì lợi ích của nó (pin version) nhỏ hơn rủi ro commit 2,5 MB code hộp kín vào repo public. Không khuyến nghị (B) làm xương sống — ADR-0008 dòng 15 đã loại, và note này chỉ củng cố (skill `design` của họ là bộ sinh logo cần API key). UI UX Pro Max vai phụ: giữ hay bỏ là quyết định riêng; nếu giữ, `CLAUDE.md:424` nên ghi đường dẫn Python thật (`%LOCALAPPDATA%\Programs\Python\Python313\python.exe`) vì `python` trên PATH là stub.

Câu hỏi mở — đầu vào cho grill, mỗi câu kèm đề xuất:

1. **Đuôi file**: giữ `.dc.html` (tương thích bundled, `.gitignore` không đổi) hay đổi `.html` (thật thà hơn, phải sửa `.gitignore:63`)? → đề xuất **giữ `.dc.html`**.
2. **Xem nhiều artboard cạnh nhau**: nhiều tab, hay một `index.html` iframe lưới do Claude viết? Cần test `file://` iframe trước khi hứa. → đề xuất thử một lần trên pilot; không được thì nhiều tab.
3. **Ảnh**: đường dẫn tương đối sang `apps/<app>/src/assets/` (không bản sao) hay copy vào `artboards/`? → đề xuất tương đối, sau khi test `file://`.
4. **CSS**: inline oklch literal như hiện tại, hay một `artboards/theme.css` lift từ `tooling/tailwind/theme.css`? Lift tay thì drift khi theme đổi; nhưng handoff mục 3 vốn đã đối chiếu lại từng giá trị. → đề xuất inline như pilot, giữ bước 0 "lift EXACT values".
5. **Dark**: file riêng hay `prefers-color-scheme` cùng file? → file riêng, vì handoff soát dark như một artboard.
6. **Term `Design canvas` trong `CONTEXT.md:58-60`**: đổi nghĩa thành "tập artboard tĩnh mở bằng browser" hay bỏ term? → đổi nghĩa; term **Direction**, **Design brief**, **Design handoff** không đổi.
7. **ADR-0008**: mục "Cập nhật" thứ hai hay ADR mới supersede? Quyết định gốc (design trước grill, working files là nguồn thật, phân loại token delta) **không đổi** — chỉ đổi cách xem. → mục "Cập nhật".
8. **Vai phụ UI UX Pro Max**: bỏ hẳn khỏi `CLAUDE.md:422-428` (và gỡ global) để "không cài thêm gì" đúng nghĩa, hay giữ với đường dẫn Python đầy đủ? → hỏi chủ repo; note này không có bằng chứng nó đã đổi quyết định nào trong pilot (`brief.md:74` nói rõ vai (a) không dùng).
9. **Bước "xem" có cần export PNG/PDF không** (để đính vào issue)? Nếu có, browser Print/screenshot đủ chưa? → đủ; issue #95 pilot đã không đính ảnh nào (**chưa xác minh** — không đọc lại issue).

---

## §7. Chưa xác minh (gom lại)

- **License/redistribution** của `payload.template.html` + `seed-canvas.mjs`: không có header; `npm view @anthropic-ai/claude-code license` = `SEE LICENSE IN README.md` nhưng `npm view … readme` trả về rỗng; docs `skills.md`/`legal-and-compliance.md` không nói gì về copy bundled skill. Không tìm được câu trả lời từ nguồn chính chủ.
- Kích thước text SKILL của skill `design` bundled (ước ≈30 KB từ bản nạp; không có file trên disk để `wc`).
- Vì sao hai entry `vercel-labs` trong `skills-lock.json` không khớp hash cả ở LF lẫn CRLF (đường "blob" có thể bao gồm/loại file khác).
- `experimental_install` có so `computedHash` hay không — vẫn là chưa xác minh từ note cũ §8.
- `npx skills@latest add … --skill ui-ux-pro-max -a claude-code` (project scope) **chưa chạy thật** — chỉ `--list`; `npx ui-ux-pro-max-cli init` chưa chạy.
- Lịch sử license của `ui-ux-pro-max-cli` (note cũ ghi CC-BY-NC-4.0; `npm view 2.15.0` và `cli/package.json:49` hôm nay ghi MIT).
- Cách đưa Python 3.13 thật lên trước Store stub trong PATH mà không đụng settings máy (tắt App execution alias vs. sửa PATH) — chưa thử.
- (C): `<img src="../../../../apps/…">` và `<iframe src="./X.dc.html">` trên `file://` trong Chrome/Edge — chưa test.
- Issue #95 có đính ảnh export nào không — không đọc lại issue.
- Có tồn tại thư mục `~/.cache/claude/bundled-skills` trên macOS/Linux như `design-handoff/SKILL.md:33` ghi hay không — máy này là Windows, không kiểm được.
