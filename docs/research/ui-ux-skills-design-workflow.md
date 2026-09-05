# Thêm pha **design** vào workflow skill — "UI UX Pro Max" và skill `design` (Claude Design canvas) trong repo này

> Ngày kiểm tra: **2026-09-05**, nhánh `dev`, HEAD `bb4baad`. Nguồn: chỉ primary sources — file thật trong repo này (đường dẫn kèm số dòng), GitHub API (`gh api`) và raw file của `nextlevelbuilder/ui-ux-pro-max-skill` (HEAD `main` = `f3ac195`, 2026-09-03) và `vercel-labs/skills` (HEAD `main` = `435076e`, 2026-08-18), `npm view` trên registry, **skill `design` bundled trong `claude.exe` 2.1.261 nạp nguyên văn qua Skill tool trong phiên này** (không tạo canvas nào), thư mục runtime nó giải nén trên máy, docs chính chủ `code.claude.com/docs` (artifacts, skills, whats-new 2026-w34, changelog), `support.claude.com`, `anthropic.com/news`, `claude.com/blog`, và output thật của `npx skills@latest --help` / `npx skills@latest add … --list`. Mọi claim có citation; chỗ chưa verify được ghi rõ **"chưa xác minh"** (danh sách gom ở §8).
>
> **Phạm vi:** trả lời ba câu của chủ repo: (1) "skills của UI UX Pro Max" là gì, ship gì, cài thế nào, có hợp repo này không; (2) skill `design` của Claude Code làm được gì thật — đặc biệt bước "xem design và **chỉnh sửa nhiều lần**"; (3) pha design cắm vào đâu giữa `research` và `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review`, và output của nó đi vào từng bước sau như thế nào. Không sửa file nào ngoài note này. Kết luận là đầu vào cho một phiên `/grill-with-docs`, **không thay thế** nó (câu hỏi mở ở §6.3).

## Tóm tắt kết luận

1. **"UI UX Pro Max" là repo GitHub `nextlevelbuilder/ui-ux-pro-max-skill`** (MIT, 125.136 sao, default branch `main`, release mới nhất `v2.15.0` ngày 2026-08-13; `skill.json` vẫn ghi `"version": "2.13.0"` — drift nội bộ). Nó **không phải một skill mà là bảy**: `ui-ux-pro-max` (skill lõi, 72 file, ≈3,5 MB — chủ yếu CSV/JSON dữ liệu), `design`, `design-system`, `brand`, `banner-design`, `slides`, `ui-styling`. Skill lõi là **một engine tra cứu offline**: `scripts/search.py` (Python 3 stdlib, BM25) trên ~20 CSV (79 style, 192 palette, 74 font pairing, 119 UX guideline, 25 chart, 22 stack), và cờ `--design-system` sinh một `MASTER.md` (palette hex + CSS variable, Google Fonts import, spacing/shadow scale, component spec, anti-pattern, checklist). Nó **không vẽ mockup, không xuất HTML/Tailwind config/shadcn token** — output là markdown quyết định. (§1)
2. **Cài được bằng CLI `skills` repo đang dùng**: `npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --list` chạy trong phiên này liệt kê đúng 7 skill; `--skill ui-ux-pro-max -a claude-code` sẽ vendor vào `.claude/skills/` (= `.agents/skills/` qua symlink) và ghi `skills-lock.json` với `computedHash` = SHA-256 (path + content) toàn thư mục. **Gotcha lớn:** SKILL.md gọi script qua `"${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py"` — biến này chỉ tồn tại khi cài như **plugin** (`/plugin marketplace add …`); test của chính repo nói form đó "only valid in the plugin-only core SKILL.md". Cài qua `npx skills add` thì agent phải tự đổi sang đường dẫn tương đối skill. Cách cài chính chủ khác là `npx ui-ux-pro-max-cli init --ai claude` (viết SKILL.md đã rewrite path vào `.claude/skills/ui-ux-pro-max/`, license `CC-BY-NC-4.0` cho CLI). Cần **Python 3** trên máy (`python` → `python3` → `py -3`). (§1.3, §4)
3. **Skill `design` là skill bundled trong Claude Code ≥ 2.1.234** (máy này 2.1.261), xây trên **Artifacts**: nó seed các artboard `.dc.html` (format "Design Components" của Claude Design: HTML + `{{hole}}`, `<sc-for>`, `data-props` tweak) vào một payload editor 2,49 MB rồi publish thành một Artifact chạy **bản preview** của canvas editor Claude Design. Bước "view + edit nhiều lần" hoạt động theo **hai đường độc lập**: (a) user sửa trực tiếp trong canvas (click-select, properties panel, inline text, undo/redo) và bấm **Save** → publish **một version mới, CAS toàn document**; (b) Claude đọc lại bằng `Artifact action: "read"` → `seed-canvas.mjs --extract` ra working files → sửa → re-seed → republish cùng URL (`contract: "0.1.31"`). Publish cũng đăng ký session **watch**, nên một Save từ canvas báo về session để re-read trước khi sửa. Save chỉ có khi tài khoản có capability artifact-publish (`self`); không có thì canvas **chỉ xem + export PNG/PDF**. Điều kiện: plan Pro/Max/Team/Enterprise, `/login` claude.ai, không dùng API key/Bedrock/Vertex. Không phải parity với claude.ai/design: editor **đóng cứng** vào mỗi canvas, không có design-token color hay "request tweaks" loop, hai người cùng Save thì người sau bị conflict. (§2)
4. **Repo đã có ba mảnh design-adjacent**, không mảnh nào *sinh* design: `web-design-guidelines` là **review** (fetch `command.md` của Vercel rồi soát file → `file:line`), `vercel-react-best-practices` là perf rule, `prototype/UI.md` là **biến thể UI thật trên route thật** (`?variant=`, 3 variant, throwaway branch). Token thật nằm ở `tooling/tailwind/theme.css` (`@theme inline` map `--color-*` → biến `:root`/`.dark` viết bằng **oklch**, port từ palette web-emr có comment truy nguồn hex) và 63 primitive `@monorepo/ui` (`button.tsx`: `cva` với 6 variant × 9 size, class token `bg-primary`, `focus-visible:ring-ring/50`). Đây là **đích** mà mọi output design phải map về; skill `design` bước 0 đã tự yêu cầu "match the existing app pixel-perfectly… `theme.*`… `ui/`… lift EXACT values" — nghĩa là nó sẽ đọc chính `theme.css`/`packages/ui` khi vẽ. (§3)
5. **Đề xuất pipeline 8 bước** (§5): `research` → **design** (skill `design` cho mockup; UI UX Pro Max chỉ cho *style direction* khi app chưa có palette, hoặc để tra stack guidance/UX checklist) → **view + edit** (canvas Save ⇄ `--extract`, lặp; working files `docs/design/<topic>/`, URL Artifact + commit ghi vào một `design-handoff.md`) → `/grill-with-docs` (handoff là input: screen inventory, component map, token delta) → `/to-spec` (spec issue link handoff + URL) → `/to-tickets` → `/implement` (đọc handoff, load `vercel-react-best-practices` + `web-design-guidelines` như §7a; token delta → `theme.css`, component → `@monorepo/ui`) → `/code-review` (trục Spec đọc cả handoff). Mảnh còn thiếu duy nhất là **một skill của repo** (§8 CLAUDE.md, không vào lock) làm bước đóng gói handoff — ≈50 dòng.
6. **Khuyến nghị: phương án (c) nhưng cân theo giá trị** — skill `design` là phần bắt buộc (là thứ duy nhất cho "xem và sửa bằng tay nhiều lần"); UI UX Pro Max **không vendor ngay** vào `.agents/skills/` (3,5 MB dữ liệu + Python + path gotcha + hash drift CRLF trên Windows), mà cài **global** (`~/.claude/skills`) dùng thử qua 2–3 topic, chỉ vendor + pin khi nó thật sự đổi quyết định nào. Lý do: repo đã có brand palette và 63 primitive, nên phần "flagship" (Design System Generator) ít việc để làm; phần đáng giá là `stacks/shadcn.csv` (đã biết Tailwind v4 `@theme inline`, OKLCH, Base UI `render` prop, `cn`/`cva` — khớp rule `architecture-ui-primitives`) và 119 UX guideline làm checklist. (§6)

---

## §1. UI UX Pro Max — nguồn thật, ship gì, chạy thế nào

### 1.1 Danh tính

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| Repo | `github.com/nextlevelbuilder/ui-ux-pro-max-skill`, MIT, default `main`, 125.136 sao, `pushed_at` 2026-09-03 | `gh api repos/nextlevelbuilder/ui-ux-pro-max-skill` |
| HEAD `main` | `f3ac195` (2026-09-03) — "docs: remove unimplemented openclaw install command (#483)" | `gh api …/commits/main` |
| Release mới nhất | `v2.15.0`, 2026-08-13; npm `ui-ux-pro-max-cli@2.15.0` cùng ngày (`bin: { uipro }`) | `gh api …/releases/latest`; `npm view ui-ux-pro-max-cli` |
| Drift version nội bộ | `skill.json` và `.claude-plugin/plugin.json` ghi `"version": "2.13.0"`; `skill.json` mô tả "84 UI styles… 98 UX guidelines" trong khi SKILL.md nói "79 (50 active)… 119" | raw `skill.json`, `.claude-plugin/plugin.json`, `.claude/skills/ui-ux-pro-max/SKILL.md` |
| Có README tiếng Việt | `README.vi.md` (40.937 byte) cùng `README.{id,ko,zh}.md` | `gh api …/contents/README.vi.md` |
| Cách tổ chức source | `src/ui-ux-pro-max/` là **source of truth** cho data + script; `.claude/skills/ui-ux-pro-max/` và `cli/assets/` là **bản copy thật** (không symlink) đồng bộ bằng `cli/scripts/sync-assets.mjs` (`npm run sync:assets` / `check:assets`) | raw `CLAUDE.md` của repo đó |

### 1.2 Ship gì — bảy skill, không phải một

`gh api git/trees/main?recursive=1` đếm blob dưới `.claude/skills/`: `ui-ux-pro-max` **72**, `ui-styling` 98 (trong đó nhiều `.ttf` canvas-fonts), `design` 36, `design-system` 27, `brand` 18, `slides` 6, `banner-design` 2. `npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --list` (chạy trong scratchpad, 2026-09-05) in "Found **7** skills" với đúng bảy tên trên và description từng cái.

Skill lõi `.claude/skills/ui-ux-pro-max/` (kích thước từ tree API, byte):

```text
SKILL.md                       15.969
references/pro-rules.md        10.909   quick-reference.md 24.526
scripts/search.py               9.123   core.py 41.234   design_system.py 70.937
        reasoning_contract.py   5.824   validate_data.py 52.230   tests/ (15 file + fixtures)
data/styles.csv               149.478   colors.csv 37.940   typography.csv 49.997
     ux-guidelines.csv         27.516   ui-reasoning.csv 77.360   products.csv 75.623
     landing.csv 25.449  charts.csv 23.365  icons.csv 57.945  motion.csv 14.679
     app-interface.csv 11.046  react-performance.csv 15.080
     google-fonts.csv         747.241   google-font-licenses.json 433.127
     phosphor-icons-upstream.json 823.933   data-provenance.json 36.686
     stacks/*.csv (22 file: angular astro avalonia flutter html-tailwind javafx
       jetpack-compose laravel nextjs nuxt-ui nuxtjs react-native react shadcn
       svelte swiftui threejs uno uwp vue winui wpf)        ≈ 476.000
```

Cộng lại **≈ 3,5 MB cho 72 file** (tính tay từ cột size; ba file lớn nhất — phosphor upstream, google-fonts CSV, license JSON — chiếm ≈ 2 MB). Đây là con số quan trọng khi cân nhắc vendor vào `.agents/skills/` và tính `computedHash` (§4).

Sáu skill còn lại là **sinh asset marketing/brand** (logo qua Gemini/MuAPI, CIP mockup, slide Chart.js, banner, social photo, brand guideline) — nằm ngoài câu hỏi của repo này; `design/SKILL.md` của họ (13.415 byte) trùng tên với skill `design` bundled của Claude Code — nếu cài cả bảy vào `.claude/skills/` thì theo docs Claude Code, **project skill cùng tên override bundled skill** ("A skill at any of these levels also overrides a bundled skill with the same name" — [skills.md](https://code.claude.com/docs/en/skills.md)). Tức cài nguyên bộ sẽ **che mất** `/design` canvas của Anthropic. Chỉ cài `--skill ui-ux-pro-max`.

### 1.3 Cài đặt — ba đường, ba hình dạng đường dẫn

| Đường | Lệnh | Ghi vào đâu | Path trong SKILL.md |
|---|---|---|---|
| Plugin marketplace (README) | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` → `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` | plugin cache của Claude Code; `.claude-plugin/plugin.json` `source: "./"` | `"${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py"` — **đúng** vì biến do plugin runtime cấp |
| CLI riêng `uipro` | `npm i -g ui-ux-pro-max-cli` → `uipro init --ai claude` (`--global` cho `~/`; `--ai universal` cho `~/.agents/skills/`; `--offline` dùng template bundled) | `cli/assets/templates/platforms/claude.json`: `root: ".claude"`, `skillPath: "skills/ui-ux-pro-max"`, `scriptPath: "skills/ui-ux-pro-max/scripts/search.py"`, `installType: "full"` → `.claude/skills/ui-ux-pro-max/{SKILL.md,data,scripts}` + các sub-skill làm sibling | `template.ts` **rewrite** script path: project → tương đối, global → `~/…` |
| CLI `skills` (repo đang dùng) | `npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -a claude-code` | `.claude/skills/ui-ux-pro-max/` (symlink tới canonical `.agents/skills/` — trong repo này hai chỗ là một vì `.claude → .agents`) + entry trong `skills-lock.json` | **copy nguyên** SKILL.md của `.claude/skills/` → path `${CLAUDE_PLUGIN_ROOT}` **không resolve** khi không phải plugin |

Bằng chứng cho ô cuối: `scripts/tests/test_skill_script_paths.py` khẳng định "the `${CLAUDE_PLUGIN_ROOT}` form is only valid in the plugin-only core SKILL.md" và mọi invocation khác phải là `scripts/<file>` hoặc `../<skill>/scripts/<file>`; SKILL.md cũng dặn "If `python` is unavailable, try `python3` or `py -3`". Trên máy này cài qua `npx skills add` thì Claude sẽ phải tự suy ra `.agents/skills/ui-ux-pro-max/scripts/search.py` — **chưa xác minh bằng cách cài thật** (chỉ chạy `--list`).

**Yêu cầu runtime:** README: "Python 3.x (standard library only; no external dependencies or network calls)"; `search.py` `#!/usr/bin/env python3`, import `argparse, json, sys, io` + module nội bộ `core`, `design_system`; ép UTF-8 stdout/stderr "to handle emojis on Windows". Node chỉ cần cho CLI `uipro`. Repo này không pin Python ở đâu (`.nvmrc`, `engines` chỉ Node/Bun — `package.json:5`).

### 1.4 SKILL.md bảo agent làm gì

Nguyên văn theo raw SKILL.md (frontmatter `name: ui-ux-pro-max`, description như bảng `claude.json` ở trên):

1. **Analyze requirements** — rút product type, audience, style keyword; **detect stack** từ `package.json`/`pubspec.yaml`, "Never assume a stack".
2. **Generate design system** (bắt buộc cho page/project mới): `search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]`; tuỳ chọn `--persist --output-dir <root>` → `design-system/<project-slug>/MASTER.md` + `pages/<page>.md`; ba "dial" `--variance/--motion/--density 1-10`.
3. **Targeted search** — `--domain <product|style|color|typography|google-fonts|ux|icons|chart|landing|gsap>` `-n <1-20>`.
4. **Stack guidance** — `--stack <react|nextjs|shadcn|html-tailwind|…>`.
5. Bảng **10 priority category** (Accessibility CRITICAL 4.5:1 / 44×44 touch / performance / style / layout / typography / animation / forms / navigation / charts) với anti-pattern; quy tắc search "one dominant intent, 2–5 terms, retry once, never fabricate"; trước khi giao đọc `references/pro-rules.md` (checklist ≈40 mục: "No emojis used as icons (use SVG instead)", "Primary text contrast >=4.5:1 in both light and dark mode", "4/8dp spacing rhythm…").

### 1.5 Output thật của `--design-system`

`design_system.py` (raw) sinh markdown với heading: `# Design System Master File` → `## Global Rules` (`### Color Palette` bảng `| Role | Hex | CSS Variable |` ví dụ `` `#2563EB` `` / `` `--color-primary` ``; `### Typography` với link Google Fonts + block `@import`; `### Spacing Variables`; `### Shadow Depths`) → `## Component Specs` (CSS template cho button/card/input/modal) → `## Style Guidelines` (`### Page Pattern`) → `## Motion` (GSAP, chỉ khi có dial) → `## Anti-Patterns (Do NOT Use)` → `## Pre-Delivery Checklist`. Header có "LOGIC: When building a specific page, first check `design-system/pages/[page-name].md`… its rules **override** this Master file". **Không** emit Tailwind config, `@theme`, shadcn token, hay oklch — màu là **hex**. Với repo này, hai section `Component Specs` và `Spacing/Shadow` **đối đầu trực diện** với `@monorepo/ui` và `theme.css` (§3.3) nên phải bị bỏ; phần dùng được là palette/typography/style/anti-pattern/checklist.

### 1.6 Nó biết stack của repo này đến đâu

`data/stacks/shadcn.csv` (68 dòng, header `No, Category, Guideline, Description, Do, Don't, Code Good, Code Bad, Severity, Docs URL, Applies To, Status, Verified At`) có: row 4 "Define semantic OKLCH variables in globals.css and expose them to Tailwind v4 with `@theme inline`" + `@theme inline { --color-primary: var(--primary); }`; row 57–58 `cva` / "Use cn() and cva for custom components"; row 59/61/68 "Base UI is the new-project default", "Base UI components compose another element through the render prop", "Pass the Radix-only asChild prop to a Base UI component" (Don't). **Không** có `data-slot`. Tức là guidance của nó **khớp** với `architecture-ui-primitives.md` (render prop thay `asChild`, bare data-attribute) và `theme.css` (oklch + `@theme inline`) — không xung đột, nhưng cũng không thêm gì rule của repo chưa nói; rule repo vẫn thắng theo CLAUDE.md §7a.

---

## §2. Skill `design` của Claude Code — Claude Design canvas trong Artifact

### 2.1 Nguồn và điều kiện

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| Là gì | "The `/design` skill brings Claude Design's artboard workflow into the CLI and Claude Code Desktop, built on artifacts… Requires v2.1.234 or later", pill **research preview**, "Available on Pro, Max, Team, and Enterprise" | [whats-new/2026-w34](https://code.claude.com/docs/en/whats-new/2026-w34) |
| Docs artifacts nói | "run `/design` with a brief. Claude drafts the design as artboards on one canvas and publishes the canvas as an artifact that runs a research preview of Claude Design's editor… Where saving is enabled for your account, select an element on an artboard, change it, and save to publish a new version; otherwise you view the draft and export it as PNG or PDF." | [artifacts.md § Draft a design canvas](https://code.claude.com/docs/en/artifacts) |
| Trên máy này | Claude Code **2.1.261**; `claude.exe` (218 MB) chứa chuỗi SKILL (grep `.dc.html` ra đúng description); **không có** `SKILL.md` rời ở `~/.claude/skills/` hay plugins; khi nạp, runtime giải nén vào `%LOCALAPPDATA%\Temp\claude\bundled-skills\2.1.261\<hash>\design\` gồm **`payload.template.html` 2.488.483 byte** và **`seed-canvas.mjs` 40.699 byte** — không có SKILL.md trên disk (text skill nằm trong binary) | `ls` thư mục trên; `grep -a` binary; `claude --version` |
| Trang docs skills không liệt kê `design` trong bundled skills (`/doctor /code-review /batch /debug /loop /claude-api …`) | docs chưa cập nhật hoặc `design` là bundled kiểu khác — **chưa xác minh** | [skills.md](https://code.claude.com/docs/en/skills.md) |
| Điều kiện Artifacts | Plan Pro/Max/Team/Enterprise; session `/login` claude.ai (API key, gateway, Bedrock/Vertex/Foundry **không** publish được); không CMEK/HIPAA/ZDR; CLI ≥ 2.1.183 | [artifacts.md § Availability](https://code.claude.com/docs/en/artifacts) |
| `DesignSync` / `/design-sync` | Skill text nhắc `/design consent|revoke|login|sync` và `/design-sync <project>` "need a first-party claude.ai login and an org policy permitting Claude Design"; `import/export/status` "not available while this preview is on… point at claude.ai/design". Support article: "`/design-sync` command in Claude Code" để kéo design system. `ToolSearch select:DesignSync` trong phiên này trả "No matching deferred tools found" — **chưa xác minh** tool này có trên máy | SKILL text; [support.claude.com](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) |

Claude Design (sản phẩm đầy đủ tại claude.ai/design) ra mắt 2026-04-17 ("research preview", Pro/Max/Team/Enterprise, Enterprise off-by-default), có "Handoff to Claude Code" bundle, export "Canva, PDF, PPTX, or standalone HTML", và onboarding "builds a design system for your team by reading your codebase and design files" ([anthropic.com/news](https://www.anthropic.com/news/claude-design-anthropic-labs)). Skill bundled nói thẳng: "It is not at parity with claude.ai/design and the editor baked into each canvas does not update after publish".

### 2.2 Cơ chế — theo chính SKILL text (nạp 2026-09-05)

- **Một file `.html` chứa cả editor và nội dung.** Editor là `payload.template.html` (~2 MiB minified, "never read it into context"); nội dung là record `files` trong `<script type="application/json" id="appifact-doc">`: `path → raw .dc.html`. **Mỗi `.dc.html` là một artboard** (iframe sandbox riêng); `Main.dc.html` là entry; `canvas.json` là layout manifest (`artboards[{file,x,y,w,h,title,expand,print,page,is_interactive}]`, `annotations` sticky-note, `pages` ≤ 40, `launch`); ảnh là entry base64 **bare** (khuyên < ~70 KB/ảnh; editor drop entry > 2 MiB; ≤ 200 entry; trang ≤ 16 MiB).
- **Workflow 5 bước:** (0) *match app hiện có pixel-perfect mặc định* — tìm `tokens.css`/`theme.*`/`tailwind.config.*`/`design-system/`/`ui/`/Storybook, "Lift EXACT values… never rounding to a 4/8px grid", nói một dòng đã match gì; (1) viết artboard `.dc.html` ra **working files** trong working tree ("Keep these working files - every later change re-seeds from them"), hỏi *static mockup hay clickable prototype* nếu brief không rõ; (2) `node "<base>/seed-canvas.mjs" --template … --out <tên-nội-dung>.html --title "…" --artboard Main.dc.html [--artboard X.dc.html] [--image …] [--canvas canvas.json]` (helper từ chối tên generic `design.html`/`index.html`, title có `< > & "`); (3) `--check`; (4) publish bằng tool `Artifact`, **luôn** `contract: "0.1.31"`, lần đầu load skill `artifact-capabilities` để đọc roster và khai `capabilities: {self: {}, downloads: {}}` nếu roster có (`self` = artifact-publish, cái cho phép **Save**; `downloads` = export PNG/PDF); (5) đưa link, nói ít.
- **Format `.dc.html`** ("Design Components"): `<script src="./support.js">` giữ nguyên, `<x-dc><helmet><style>…</style></helmet>…</x-dc>`, `{{hole}}` từ `renderVals()` của `class Component extends DCLogic`, `<sc-for>`/`<sc-if>`, `data-props` (`editor: text|color|int|range|boolean|enum`) → **tweak chip** trên artboard, `<dc-import name="Card">` mount sibling; inline `style` là thứ properties panel sửa; flex/grid + `gap` để sống qua drag-reorder; icon = inline SVG, không emoji.

### 2.3 Vòng lặp "xem design và chỉnh sửa nhiều lần" — chính xác cái gì được hỗ trợ

```text
   Claude (session)                         Canvas (Artifact trên claude.ai)
   ─────────────────                        ─────────────────────────────────
   working files  ──seed──► out.html ──Artifact publish──► version N  (URL cố định)
        ▲                                                    │
        │  Artifact action:"read" url  ◄── user mở, click-select, properties panel,
        │  → file đầy đủ                    inline text, undo/redo, tweak chip;
        │  → seed-canvas.mjs --extract      bấm Save  → version N+1 (CAS toàn doc)
        │     --to <dir mới>                              │
        └── sửa file → re-seed → republish (contract 0.1.31, no capabilities) → N+2
   (publish đăng ký watch: một Save từ nơi khác báo về session "re-read before editing")
```

Từng mảnh có nguồn:

| Khả năng | Có/Không | Nguồn |
|---|---|---|
| User sửa bằng tay trong browser | **Có** khi roster có `self`: "click-to-select, a properties panel bound to the focused artboard…, inline text editing, undo/redo, edits local until the explicit **Save** publishes the page for everyone". Không có `self`: "Save is refused and the view is read-only - viewing plus PNG/PDF export" | SKILL text |
| Save = version mới | **Có**: "A save hands the platform a complete replacement document; it commits a new immutable version for EVERYONE, and every open view… reloads to it"; edit chưa Save nằm ở sessionStorage stash, có banner Restore | SKILL text § Foundation |
| Claude đọc lại bản user đã sửa | **Có**: "read the artifact with the Artifact tool (`action: "read"`, `url`)… the result names a file holding the full page. Run `seed-canvas.mjs --extract "<that saved file>" --to <a FRESH, empty directory>`… Edit the extracted files, re-seed… republish to the same artifact with `contract: "0.1.31"` and NO `capabilities`" | SKILL text § Updating |
| Session được báo khi có Save | **Có**: tool `Artifact` — "publishing an artifact starts subscribing this session to its live changes… a later republish from elsewhere… arrives as a notification telling you to re-read it before editing"; `action: "watch"`/`status`/`unwatch` | mô tả tool `Artifact` trong phiên |
| Conflict | Republish bị từ chối "stale or conflicting" → đọc lại, `--extract` mới, redo, republish; `force: true` chỉ sau khi hỏi "anyone still editing?". Hai người cùng Save: "whoever saves second gets a conflict… nothing is merged" | SKILL text |
| URL lifecycle | URL cố định theo artifact; mỗi publish = version; **Share** chọn version viewer thấy; `/artifacts` liệt kê lại từ tài khoản; session mới muốn update phải có URL (không thì tạo artifact mới) | [artifacts.md § Update / Find / Share](https://code.claude.com/docs/en/artifacts) |
| Export | PNG **per artboard** (toolbar Export; per element từ properties panel khi có save); PDF gom mọi artboard đang hiện — fixed = 1 trang, flow = phân trang, "pages are rasterized JPEGs with selectable text"; Google Fonts **không** embed khi export → chọn fallback cùng metrics | SKILL text § Known limits |
| Comments | Chỉ khi share **trong org** (Team/Enterprise, CLI ≥ 2.1.221); public link → "Comments aren't available"; Pro/Max: chỉ share bằng public link → **không có comment** | [artifacts.md § Collect comments / Share](https://code.claude.com/docs/en/artifacts) |
| Riêng tư | "A new artifact is visible only to you"; nội dung trên hạ tầng Anthropic; Pro/Max không có admin management | [artifacts.md](https://code.claude.com/docs/en/artifacts) |
| Không có | Design-system color token và "request tweaks" agent loop ("depend on the claude.ai/design backend"); cross-artboard multi-select; state chia sẻ giữa artboard; editor không tự cập nhật sau publish | SKILL text § Known limits |

Hai hệ quả cho pipeline: (i) **working files `.dc.html` + `canvas.json` là nguồn thật của design về phía repo** — file seeded 2,5 MB chỉ là bao bì, không commit; (ii) phía canvas, **version của Artifact** là lịch sử chỉnh tay; muốn repo giữ được cái user đã sửa thì phải `--extract` về và commit lại working files sau mỗi vòng.

---

## §3. Tài sản design-adjacent sẵn có trong repo — input/output từng skill

| Skill (đường dẫn) | Trigger | INPUT | OUTPUT | Ghi chú |
|---|---|---|---|---|
| `research` (`.agents/skills/research/SKILL.md:1-13`) | model-invoked | một câu hỏi | **một** Markdown trong `docs/research/`, mỗi claim có nguồn, chạy bằng background agent | chính note này |
| `grill-with-docs` (`grill-with-docs/SKILL.md:1-7`) | `disable-model-invocation: true` | plan/idea + conversation | = gọi `grilling` (design tree theo round, `❓ Q / ➡️ recommended`, "Finding facts is your job") + `domain-modeling` (cập nhật `CONTEXT.md` inline, ADR chỉ khi hard-to-reverse + surprising + real trade-off) | `grilling/SKILL.md:6-28`, `domain-modeling/SKILL.md:44-74` |
| `to-spec` (`to-spec/SKILL.md:7-75`) | manual | conversation (không interview) | GitHub issue label `spec` + `ready-for-agent`, template Problem / Solution / User Stories (dài) / Implementation Decisions / Testing Decisions / Out of Scope / Further Notes; "Do NOT include specific file paths or code snippets", ngoại lệ snippet từ **prototype** | bước 2 "Sketch out the seams" — design canvas không phải seam |
| `to-tickets` (`to-tickets/SKILL.md:9-105`) | manual | spec (issue #/URL) | sub-issue tracer-bullet, native `blocked_by`, `ready-for-agent`; "avoid specific file paths or code snippets" | `docs/agents/issue-tracker.md:48-101` cho `gh api … sub_issues` / `dependencies/blocked_by` |
| `implement` (`implement/SKILL.md:7-15`) | manual | issue # | `/tdd` tại seam đã thoả thuận, typecheck, test, `/code-review`, commit | CLAUDE.md §7a: **load `vercel-react-best-practices` trước khi viết component, `web-design-guidelines` khi đụng UI; rule repo thắng** (`CLAUDE.md:397-415`) |
| `code-review` (`code-review/SKILL.md`) | manual | fixed point + spec source (issue ref trong commit / path / `docs/`) | hai trục Standards (`.agents/rules/`) + Spec, song song | trục Spec đọc issue → nếu issue link handoff, review sẽ đối chiếu được design |
| `prototype` → `UI.md` (`prototype/UI.md:1-112`) | model-invoked | "what should this look like?" | **3 variant thật trên route thật** (`?variant=`, floating switcher, ẩn ở production), commit lên **throwaway branch**, kết luận ghi vào issue | "A throwaway route on its own is a vacuum: every variant looks fine in isolation" — đúng là điểm yếu của mockup rời |
| `web-design-guidelines` (`web-design-guidelines/SKILL.md:14-39`) | "review my UI" | file/pattern | fetch `raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` → findings `file:line` | **review-only**, không sinh design; cần network mỗi lần |
| `vercel-react-best-practices` (`…/SKILL.md:12-149`) | viết/sửa React | — | 70 rule perf, 8 nhóm; `rules/*.md`, `AGENTS.md` | phần RSC chỉ cho Runtime Next (§7a) |

**Token đích** (`tooling/tailwind/theme.css`): `@theme inline` (dòng 1–60) map `--color-{background,foreground,card,popover,primary,secondary,muted,accent,destructive,success,warning,info,border,input,ring,chart-1..5,sidebar-*,surface,code*,selection*}` và `--radius-{sm..4xl}` từ `--radius`, `--font-{sans,heading,mono}`; `:root` (67–129) viết **oklch**, mỗi dòng comment truy hex web-emr ("`--primary: oklch(0.6591 0.1012 181.55); /* --primary-brand #38a696 */`"); `.dark` (138–) "derived rather than ported… status colors… deliberately identical to light". `packages/ui/src/components/button.tsx:7-42`: `cva` 6 variant (`default outline secondary ghost destructive link`) × 9 size (`default h-9`, `xs h-6`, `sm h-8`, `lg h-10`, `icon*`), class token (`bg-primary text-primary-foreground hover:bg-primary/80`, `focus-visible:ring-3 focus-visible:ring-ring/50`, `aria-invalid:border-destructive`). `grep font-sans|fontsource` trong `tooling/tailwind/globals.css` và `apps/_template_vite/src/globals.css` **không** ra kết quả — nơi định nghĩa `--font-sans` thật **chưa xác minh** (theme chỉ tham chiếu).

Ý nghĩa: bước 0 của skill `design` sẽ tìm đúng `theme.css` + `packages/ui/src/components/*` và copy giá trị oklch/radius/height vào `.dc.html` (inline style). Khi implement, đường ngược lại là: **mọi màu trong mockup phải quy về token đã có**; màu mới = sửa `theme.css` (rule `quality-styling-tailwind.md`: "Add a token there, never a per-app Tailwind config"); component = `@monorepo/ui` (`architecture-ui-primitives.md`). Không có bước nào ở đó cần MASTER.md dạng hex + `--color-primary` của UI UX Pro Max.

---

## §4. Vendor một skill bên thứ ba vào repo này — cơ chế thật

### 4.1 CLI `skills` (vercel-labs/skills 1.5.23)

`npm view skills` → `1.5.23` (`latest`), repo `vercel-labs/skills`. `npx -y skills@latest --help` (chạy 2026-09-05) liệt kê: `add <package>` với `-g`, `-a <agents>`, `-s/--skill <skills>`, `-l/--list`, `-y`, `--copy`, `--full-depth`; `update`; `list`; `find`; `remove`; **`experimental_install` — "Restore skills from skills-lock.json"**; `experimental_sync` (node_modules); `init`.

Lock file **project-level** đúng là file repo đang có: `src/local-lock.ts` — `LOCAL_LOCK_FILE = 'skills-lock.json'`, `getLocalLockPath(cwd) = join(cwd, 'skills-lock.json')`; interface

```ts
export interface LocalSkillLockFile { version: number; skills: Record<string, LocalSkillLockEntry>; }
export interface LocalSkillLockEntry {
  source: string; sourceUrl?: string; ref?: string; sourceType: string;
  skillPath?: string; computedHash: string; subagents?: string[]; wellKnownDigest?: string;
}
```

`computeSkillFolderHash()` = "SHA-256 hash from all files in a skill directory… sorts them by relative path… `hash.update(file.relativePath); hash.update(file.content);`", bỏ `.git`/`node_modules`, **không** normalize line ending. Khớp từng field với `skills-lock.json` của repo (`version: 1`, 25 entry `source/sourceType/skillPath/computedHash`, ví dụ `"web-design-guidelines": { "source": "vercel-labs/agent-skills", "skillPath": "skills/web-design-guidelines/SKILL.md", "computedHash": "f3bc47…" }`). (Còn `src/skill-lock.ts` là lock **global** `~/.agents/.skill-lock.json` với `skillFolderHash` = GitHub tree SHA — khác file, đừng nhầm.)

`experimental_install` (`src/install.ts`): đọc `skills-lock.json` ở cwd, gom theo source, gọi `runAdd()` **chỉ vào `.agents/skills/`** ("installing only to `.agents/skills/` (project-level universal agents), not agent-specific directories"); log "Cannot restore [skillName]: skills-lock.json is missing sourceUrl for this generic Git source" khi thiếu `sourceUrl`. Code đọc được **không** thấy so `computedHash` khi restore — **chưa xác minh** hash lệch thì fail hay chỉ warn (note `personal-monorepo-rebuild.md:578` từng dẫn issue #806/#781 nói CLI đối chiếu hash và bug CRLF; hai issue đó không đọc lại lần này).

Repo này `.claude → .agents` (CLAUDE.md đầu file) nên `-a claude-code` (đích `.claude/skills/`) và `.agents/skills/` là **một** thư mục — không có lớp symlink thứ hai như máy khác.

### 4.2 Lệnh cụ thể cho UI UX Pro Max

```bash
# chỉ skill lõi, project scope, vào .agents/skills/ui-ux-pro-max + skills-lock.json
npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -a claude-code -y
# hoặc dùng thử global trước, không đụng repo
npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -a claude-code -g -y
```

`--list` đã chứng minh CLI phát hiện đúng 7 skill (mục 1.2), nên đường này **đi được**; điều **chưa xác minh** là (a) sau khi add, agent có tự tìm ra `search.py` dù SKILL.md ghi `${CLAUDE_PLUGIN_ROOT}` không, (b) `computedHash` có ổn định trên Windows với 72 file CSV (cần `.gitattributes` `*.csv -text` hoặc `core.autocrlf=false` — repo đã có `.gitattributes`, nội dung chưa đọc lại).

### 4.3 Skill "written here" vs vendored — CLAUDE.md §8

`CLAUDE.md:486`: "**New skill** — copy an existing `.agents/skills/<name>/SKILL.md` for shape, and load `writing-for-agents` first. A skill written here is **yours**: it gets no entry in `skills-lock.json`, and `npx skills@latest update` neither touches nor restores it. Never hand-edit a vendored skill instead — that drifts its hash and breaks `skills experimental_install`; re-sync it from upstream, or fork it under a new name." Và `§7` (`CLAUDE.md:362-364`): 25 skill mattpocock/vercel trong lock, 6 `gitnexus-*` không. Hệ quả cho pha design: **wrapper của repo** (bước handoff, §5) là skill "yours" — không vào lock; UI UX Pro Max nếu vendor thì **không sửa SKILL.md của nó** để vá path — thay vào đó ghi hướng dẫn path trong skill wrapper hoặc CLAUDE.md §7a.

---

## §5. Pipeline đề xuất — 8 bước, input/output/nơi lưu/hand-off

Quy ước lưu trữ đề xuất (cần chốt ở grill): thư mục **`docs/design/<topic>/`** — chỗ duy nhất trong repo giữ design, cạnh `docs/research/` và `docs/adr/`. Bên trong: `brief.md` (đề bài + hướng đã chọn), `artboards/*.dc.html` + `canvas.json` (**working files**, commit), `design-handoff.md` (§5.3), tuỳ chọn `style/MASTER.md` nếu dùng UI UX Pro Max; **gitignore** `docs/design/**/*.canvas.html` (file seeded 2,5 MB). URL Artifact ghi ở `design-handoff.md` và trong spec issue.

| # | Bước | Chạy bằng | INPUT | OUTPUT | Lưu ở | Hand-off sang bước sau |
|---|---|---|---|---|---|---|
| 1 | research | skill `research` (vendored) | câu hỏi | `docs/research/<topic>.md` | repo | brief cho design: constraint kỹ thuật, Runtime, primitive sẵn có |
| 2 | design | **skill `design`** (bundled) — brief nêu Runtime + app + screen; *tuỳ chọn* `ui-ux-pro-max` trước đó cho style direction (`--design-system -f markdown`) khi app **chưa có palette** (portfolio/marketing), hoặc `--stack shadcn|nextjs` và `--domain ux` để lấy checklist | research note + `theme.css` + `packages/ui` (bước 0 của skill tự đọc) | 2–4 artboard direction low-fi (`DirectionA.dc.html`…) rồi `Main.dc.html` + sibling; publish → URL | working files `docs/design/<topic>/artboards/`; URL + version trong `brief.md` | user mở URL |
| 3 | view + edit (lặp) | canvas **Save** (user) ⇄ `Artifact read` → `seed-canvas.mjs --extract --to <dir mới>` → sửa → re-seed → republish (Claude); session watch báo Save | version N | version N+k; sau **mỗi vòng** copy working files extract về `docs/design/<topic>/artboards/` và commit (message ghi version) | repo giữ bản cuối user đã duyệt; Artifact giữ lịch sử version | khi user nói "chốt": bước 3b |
| 3b | **handoff** (mảnh mới) | **skill của repo** `design-handoff` (≈50 dòng, không vào lock) | working files đã chốt + `theme.css` + `packages/ui` | `docs/design/<topic>/design-handoff.md`: **screen inventory** (route/Runtime từng màn), **component map** (mỗi vùng → primitive `@monorepo/ui` có sẵn / composite `~/components` / cần thêm), **token delta** (màu/radius/font trong `.dc.html` không quy được về `theme.css` — mỗi cái là một quyết định), **state list** (loading/empty/error/guarded), **copy** cần vào `packages/i18n/src/locales/*.json`, câu hỏi mở | repo | là INPUT của grill |
| 4 | grill-with-docs | `grilling` + `domain-modeling` | `design-handoff.md` + research | design tree đã đóng; term mới → `CONTEXT.md`; ADR nếu có (vd. token mới đổi brand) | `CONTEXT.md`, `docs/adr/0008-…` | conversation |
| 5 | to-spec | `to-spec` | conversation | issue `spec`; **Implementation Decisions** dẫn `docs/design/<topic>/design-handoff.md` + URL Artifact + version; user story theo screen inventory; Testing Decisions nêu seam (mock `~/libs/http-client`, E2E raw HTML) | GitHub issue | `#<spec>` |
| 6 | to-tickets | `to-tickets` | `#<spec>` | sub-issue tracer-bullet — mỗi ticket = một screen/section trong inventory, prefactor token trước (ticket "token delta → `theme.css`" chặn các ticket UI) | GitHub | `#<n>` |
| 7 | implement | `implement` + `/tdd`; **load `vercel-react-best-practices` + `web-design-guidelines`** (§7a); mở `design-handoff.md` + artboard tương ứng; nếu màn hình đã tồn tại và còn nghi ngờ bố cục → `prototype/UI.md` (3 variant trên route thật) trước khi viết thật | ticket + handoff | code theo rule cluster của Runtime; token vào `theme.css`; primitive từ `@monorepo/ui`; copy vào i18n ICU | branch | `/code-review` |
| 8 | code-review | `code-review` | fixed point; spec = issue (link handoff) | trục Standards (rules) + trục Spec (**đối chiếu handoff**: screen đủ chưa, token có lọt hex/inline style không, component có bypass `@monorepo/ui` không) | comment issue | đóng ticket |

### 5.1 Vì sao design đứng **trước** grill mà không ngược lại

Chính skill `design` đã có vòng hỏi của nó: "Settle the aesthetic with the user, not for them… sketch 2-4 genuinely different low-fi direction artboards and let them pick"; "Ask before adding material". Cái grill cần là **một artefact cụ thể để stress-test** — screen inventory và token delta của handoff cho `grilling` frontier thật (data mỗi màn từ đâu: loader/`"use cache"` hay Query? guard ở đâu? ICU key nào?), thay vì hỏi trừu tượng. `domain-modeling` cũng cần term: một mockup đặt tên cho vùng UI ("Dock", "Module card") là chỗ `CONTEXT.md` phải ghi.

### 5.2 Design → `/to-spec`: cái gì được phép vào spec

`to-spec` cấm "specific file paths or code snippets" trừ snippet từ prototype. Nên spec **không** dán `.dc.html`; nó dẫn **đường link** (`docs/design/<topic>/design-handoff.md` là doc, không phải code path; URL Artifact + số version) và diễn đạt quyết định bằng lời: "Dashboard dùng `PageHeader` + `PageContent` hiện có; thêm token `--color-brand-2`; không thêm primitive". Nếu đã chạy `prototype/UI.md`, kết luận variant thắng được inline theo đúng ngoại lệ của template.

### 5.3 `/implement` tiêu thụ design ra sao — map lên `@monorepo/tailwind-config` và `@monorepo/ui`

| Trong `.dc.html` (mockup) | Trong code | Rule |
|---|---|---|
| màu inline `oklch(0.6591 0.1012 181.55)` / hex tương ứng | class token `bg-primary`… — nếu không có token khớp → thêm vào `theme.css` `:root` **và** `.dark`, không inline | `quality-styling-tailwind.md` |
| nút `height 36px; radius 6px` | `<Button size="default">` (`h-9`, `rounded-md`) — không viết `<button>` | `architecture-ui-primitives.md` |
| card/dialog/select | primitive `@monorepo/ui/components/*`; composite dùng ≥ 2 slice → `~/components` | `architecture-shared-components.md` |
| text tiếng Việt trong mockup | key ICU trong `packages/i18n/src/locales/{vi,en}.json` | ADR-0002 |
| icon SVG stroke 20px | `lucide-react` size-5 | `button.tsx` `[&_svg:not([class*='size-'])]:size-4` |
| bố cục trang có header | `PageHeader`/`PageContent` (Next) hoặc `layout` slice của Runtime | `architecture-shared-components.md` |
| màn cần crawler đọc | loader / `"use cache"`; còn lại Query | `next-data-fetching.md` / `reactrouter-loader-vs-query.md` |

Đây là việc **thủ công có kỷ luật** — không có bước máy nào chuyển `.dc.html` → TSX trong repo (Claude Design bản đầy đủ có "Handoff to Claude Code" bundle, nhưng bản preview trong CLI không có `export`: skill nói `import/export/status` "not available while this preview is on"). `design-handoff.md` là thứ làm việc đó có thể review được.

### 5.4 UI UX Pro Max đứng ở đâu (nếu dùng)

Chỉ ở **bước 2, trước khi vẽ**, và chỉ hai việc: (a) app chưa có palette (portfolio, landing) → `search.py "<product>" --design-system -f markdown -p "<App>"` → đọc phần Color/Typography/Style/Anti-pattern, **bỏ** Component Specs/Spacing/Shadow, ghi quyết định vào `docs/design/<topic>/brief.md` (không `--persist` vào root repo — nó tạo `design-system/<slug>/MASTER.md` ở cwd); (b) mọi topic → `--stack shadcn`/`nextjs` + `--domain ux "<intent>"` để lấy checklist vào handoff. Với app đã có brand (`theme.css` port từ web-emr) thì (a) là **không cần** — tự sinh palette mới là đi ngược ADR/token đã có.

---

## §6. Ba phương án, khuyến nghị, câu hỏi mở

### 6.1 So sánh

| | (a) UI UX Pro Max **only** | (b) skill `design` **only** | (c) cả hai, phân vai |
|---|---|---|---|
| Có "xem và sửa tay nhiều lần"? | **Không** — output là markdown + CSV search; không mockup, không canvas | **Có** — canvas Save/version, Claude đọc lại được | Có (từ `design`) |
| Có "style direction" cho app mới? | Có (192 palette/74 pairing, BM25) | Có nhưng bằng lời + 2–4 direction artboard; skill dặn "Vary themes… NEVER converge" | Có, hai nguồn |
| Bám token/primitive của repo? | Không tự động — MASTER.md hex + component spec riêng, phải lọc | **Có**, bước 0 bắt buộc đọc `theme.*`/`ui/` | Có |
| Chi phí | Python 3 + ≈3,5 MB dữ liệu; path gotcha; hash drift CRLF nếu vendor | Cần plan claude.ai + `/login`; nội dung lên hạ tầng Anthropic (private mặc định); publish ≈ 2,5 MB/lần; editor không cập nhật | Cộng hai cột |
| Xung đột với `.agents/rules/` | Có tiềm năng (spacing 4/8dp, font Google, component CSS) — rule thắng theo §7a | Thấp — skill tự bám design system; vẫn có craft rule riêng (no Inter/Roboto, no emoji) | như (a)+(b) |
| Review UX | 119 guideline + pro-rules checklist offline | không — dùng `web-design-guidelines` (online) | bù nhau |

### 6.2 Khuyến nghị

**(c) — nhưng `design` là xương sống, UI UX Pro Max là phụ và cài global trước.**

1. Bước "view + edit nhiều lần" chỉ có một công cụ đáp ứng trong phạm vi khảo sát: skill `design` + Artifact version + `--extract`. Không có nó thì yêu cầu cốt lõi của chủ repo không thành.
2. UI UX Pro Max **không vendor vào `.agents/skills/` ngay**: cài `-g` (hoặc `uipro init --ai claude --global`) dùng thử 2–3 topic. Vendor + pin trong `skills-lock.json` chỉ khi nó thật sự đổi một quyết định; lúc đó thêm `*.csv -text` vào `.gitattributes` và ghi path thật của `search.py` vào CLAUDE.md §7a (không sửa SKILL.md của nó). Không bao giờ cài cả 7 skill vào project — `design` của họ sẽ **override** `/design` bundled (§1.2).
3. Viết **một skill của repo** `design-handoff` (theo §8 CLAUDE.md, load `writing-for-agents`): đọc working files (hoặc `--extract` từ URL), sinh `docs/design/<topic>/design-handoff.md` theo mẫu §5.3b, nhắc load `web-design-guidelines`. Đây là chỗ duy nhất phải viết code mới; phần còn lại là quy ước.
4. Cập nhật CLAUDE.md §7 (bảng skill: thêm `design` bundled + `design-handoff`), §7a (pipeline 8 bước, ngôn ngữ: brief/handoff viết tiếng Việt), §1 (`docs/design/`), `.gitignore` (`*.canvas.html`), `CONTEXT.md` (term "Design canvas", "Handoff" nếu team dùng).

### 6.3 Câu hỏi mở — đầu vào cho `/grill-with-docs`

1. **Commit `.dc.html` + `canvas.json` hay chỉ URL?** Commit thì repo public đọc được mockup (repo `qtuan02/monorepo` là public — `issue-tracker.md:10`); không commit thì mất nguồn khi Artifact bị retention/xoá và `to-tickets` không có gì để cite.
2. **Vòng lặp kết thúc bằng gì?** Đề xuất: user nói "chốt" → Claude `--extract` lần cuối, commit, ghi version vào handoff. Có cần cơ chế ngăn sửa canvas sau khi spec đã mở?
3. **Ai quyết token mới?** Token delta trong handoff → ADR hay chỉ ticket? (Brand hiện port từ web-emr — đổi là hard-to-reverse.)
4. **UI UX Pro Max: global, plugin, hay vendor?** Ba đường có ba path (§1.3). Nếu vendor, chấp nhận 3,5 MB + Python vào repo?
5. **Python trên máy dev/CI** — chưa pin; CI không cần vì skill không chạy trong Gate.
6. **Plan/tài khoản**: phiên này có tool `Artifact` (nghĩa là artifacts khả dụng), nhưng **roster có `self` (Save) hay không chưa xác minh** — phải chạy `/design` thử một lần trên brief nhỏ; nếu không có `self` thì bước 3 thu về "xem + export PNG/PDF + nói cho Claude sửa", vẫn lặp được nhưng không "sửa tay".
7. **`prototype/UI.md` đứng đâu?** Bắt buộc cho màn hình đã tồn tại (mockup rời là "vacuum") hay tuỳ ticket?
8. **Storybook/documents có vai gì?** `apps/storybook` đã preview 63 primitive; design canvas có nên embed screenshot primitive (ảnh < 70 KB) để mockup không vẽ lại nút?
9. **Comment trên canvas** không có với plan Pro/Max (public-link only) — feedback ngoài Claude đi đường nào (issue comment)?

---

## §7. Rủi ro / gotcha

| Rủi ro | Chi tiết | Giảm nhẹ |
|---|---|---|
| Python trên Windows | `search.py` cần Python 3; SKILL.md tự fallback `python → python3 → py -3`; repo không pin | pin trong CLAUDE.md §7a hoặc bỏ UI UX Pro Max |
| Path `${CLAUDE_PLUGIN_ROOT}` | chỉ đúng khi cài plugin; vendor qua `skills` CLI thì path hỏng (test của chính repo xác nhận) | cài plugin/global, hoặc ghi path thật trong skill wrapper; **không** sửa SKILL.md vendored (§8) |
| Hash drift `skills-lock.json` | hash = SHA-256 path+content, không normalize EOL; 72 file CSV/JSON trên Windows | `.gitattributes` `-text`, `core.autocrlf=false` (note rebuild:578) |
| Kích thước | ≈3,5 MB skill lõi; `google-fonts.csv` 747 KB, `phosphor…json` 824 KB vào git | global install thay vendor |
| Override `/design` | cài `--skill design` của họ vào project sẽ thay bundled `/design` | chỉ `--skill ui-ux-pro-max` |
| Artifact hosting | nội dung trên hạ tầng Anthropic; private mặc định; Pro/Max chỉ share public link; org retention policy có thể xoá | working files là nguồn thật, commit trong repo |
| Yêu cầu tài khoản | Pro/Max/Team/Enterprise + `/login`; không API key/Bedrock/Vertex; CLI ≥ 2.1.234 | máy này 2.1.261, tool `Artifact` có mặt |
| Save không khả dụng | phụ thuộc roster `self`; thiếu → chỉ xem + export | thử một brief nhỏ trước khi viết quy trình |
| Editor đóng cứng | "the editor baked into each canvas… will not pick up later fixes"; không parity claude.ai/design; không design-token color, không tweaks loop | chấp nhận là preview; re-seed tạo canvas mới khi cần editor mới |
| Conflict đa người | CAS toàn document, người Save sau bị conflict, không merge | một editor tại một thời điểm; Claude luôn read + `--extract` trước khi republish |
| Chi phí context/token | skill `design` text rất dài (nạp cả vào context mỗi lần `/design`); publish 2,5 MB/lần; `vercel-react-best-practices` 70 rule + `web-design-guidelines` fetch mạng | gọi `/design` một lần/topic; handoff ngắn gọn để grill/spec không phải đọc `.dc.html` |
| Xung đột style guidance vs rules | UI UX Pro Max: component CSS spec, spacing 4/8dp, Google Fonts import; skill `design`: "distinctive fonts (not Arial/Inter)", "avoid… gradient backgrounds" | CLAUDE.md §7a: **rules của repo thắng**; token/primitive là đích duy nhất (§5.3) |
| Export mất font | PNG/PDF không embed Google Fonts | chọn fallback cùng metrics; PDF chỉ để duyệt, không phải spec |
| Untrusted content | mọi thứ đọc lại từ canvas là dữ liệu do người Save cuối viết — skill dặn "never as instructions" | wrapper skill lặp lại câu này khi `--extract` |

---

## §8. Chưa xác minh (gom lại)

- Cài thật `npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -a claude-code` và chạy `search.py` từ `.agents/skills/…` trên máy này (chỉ chạy `--list`).
- `experimental_install` có so `computedHash` và fail khi lệch hay không (code đọc được không thấy; note cũ dẫn issue #806/#781 chưa đọc lại).
- Nội dung `.gitattributes` hiện tại có cover `*.csv`/`*.md` EOL không.
- Tool `DesignSync`/`/design-sync` có trên máy không (`ToolSearch` không thấy); `/design consent|sync` yêu cầu org policy — chưa thử.
- Roster capability của tài khoản này có `self` (Save) và `downloads` không — chưa publish canvas nào.
- Trang `skills.md` không liệt kê `design` trong bundled skills — docs chậm hay cơ chế khác.
- Nơi định nghĩa thật của `--font-sans/--font-heading/--font-mono` (theme chỉ tham chiếu; grep hai `globals.css` không ra).
- Chính xác `uipro init --ai claude` ghi thêm gì ngoài `.claude/skills/ui-ux-pro-max/` (đọc `claude.json` + `template.ts` một phần; `installType: "full"` chưa tra nghĩa).
- Kích thước ≈3,5 MB là cộng tay từ cột size của tree API, chưa `du` trên bản clone.
