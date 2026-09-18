# UI UX Pro Max cài vào **project** này, không Python — upstream hôm nay, câu Python trả lời dứt điểm, và lệnh cài đúng theo docs

> Ngày kiểm tra: **2026-09-06**, nhánh `dev`, HEAD `69bfa23`. Nguồn: chỉ primary sources — `gh api` và raw file của `nextlevelbuilder/ui-ux-pro-max-skill` tại HEAD `main` = **`314307f`** (2026-09-06 04:31Z) và tag `v2.15.0` (= `a38d04c`), source của `vercel-labs/skills` HEAD `435076e`, `npm view` trên registry, docs chính chủ [`code.claude.com/docs/en/skills.md`](https://code.claude.com/docs/en/skills.md), file thật trong repo này và trên máy này (đường dẫn kèm số dòng), và output thật của hai lệnh **chỉ đọc** chạy trong scratchpad: `npx -y skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --list` và `npm view ui-ux-pro-max-cli`. **Không cài gì (không `npm i -g`, không `uipro init`, không `npx skills add` thật, không Python), không sửa `~/.claude`/`~/.agents`, không publish gì, không sửa file nào ngoài note này.** Chỗ không xác minh được ghi **"chưa xác minh"** và gom ở §6.
>
> **Phạm vi — chỉ phần delta so với hai note trước.** [`ui-ux-skills-design-workflow.md`](./ui-ux-skills-design-workflow.md) (HEAD `f3ac195`, v2.15.0) đã tả bảy skill, engine BM25 `scripts/search.py`, ba đường cài, gotcha `${CLAUDE_PLUGIN_ROOT}`, 3,5 MB, hash drift; [`design-phase-minimal-dependency.md`](./design-phase-minimal-dependency.md) đã chốt pha design zero-tooling và ghi nhận Python 3.13 + skill global từng có trên máy. Note này trả lời năm câu mới: (1) upstream đổi gì từ `f3ac195`; (2) **Python — có bắt buộc không, máy này còn gì, không Python thì còn dùng được gì**; (3) lệnh cài **theo docs** vào project và nó ghi đúng cái gì; (4) cắm vào chuỗi research → design → grill → spec → tickets → implement → code-review ở đâu; (5) khuyến nghị.

## Tóm tắt kết luận

1. **Upstream từ `f3ac195` đến `314307f` chỉ có hai commit, không đổi gì về data hay SKILL.md**: `b2ac9b2` sửa `cli/README.md` license `CC-BY-NC-4.0` → `MIT` (đóng câu "chưa xác minh" của note trước — CLI nay MIT ở cả ba chỗ), và `314307f` thêm 6 dòng vào `search.py` in cảnh báo `--stack` bị bỏ qua khi `--design-system` + một test. Release vẫn `v2.15.0` (2026-08-13), npm `ui-ux-pro-max-cli@2.15.0` cùng ngày. (§1)
2. **Python: bắt buộc cho `search.py`, và không có bản Node/Bun nào cả.** `cli/src/` chỉ có `init/versions/update/uninstall`; file JS duy nhất chạm `search.py` là `cli/scripts/run-python.mjs` — một wrapper `spawnSync('python')`. Mấy file `.cjs`/`.mjs` khác trong repo là script của sub-skill `brand`/`design-system` (sinh CSS từ JSON token) và một audit Playwright, không phải search. **Máy này hôm nay không còn Python thật**: thư mục `Programs\Python` đã bị gỡ, registry không còn `PythonCore`, `python`/`python3` trên PATH là **stub Microsoft Store** (0 byte, in "Python was not found"), `py` không có; `~/.claude/skills/ui-ux-pro-max` cũng **không còn**. (§2.1–2.2)
3. **Không Python vẫn dùng được ≈ toàn bộ giá trị tra cứu, mất phần tổng hợp.** Bảy CSV chính đều **một dòng một record** (số dòng bắt đầu bằng số = số record), grep ra đúng hàng; ba CSV theo product type (`products` / `ui-reasoning` / `colors`) **cùng số thứ tự và cùng tên** nên join bằng một string; `references/quick-reference.md:3` tự nói mọi rule UX "also present verbatim in `data/ux-guidelines.csv`… a static index for quick scanning **without a search round-trip**". Cái mất: BM25 ranking + auto-detect domain + gợi ý khi không khớp, và `--design-system` (chọn palette theo light/dark bằng luminance/contrast, derive dark palette, bảng spacing theo dial, đổ vào template `MASTER.md`) — với repo này phần đó vốn bị loại vì `theme.css` đã có brand. Upstream **không** có câu nào về fallback không-Python; ngược lại template CLI dặn agent "do not install it yourself… Stop and ask the user". (§2.3)
4. **Cài theo docs = `npm install -g ui-ux-pro-max-cli` rồi `uipro init --ai claude`** — nhưng nó **không có cờ chọn skill**: luôn ghi core (SKILL.md render lại, 39 file data, 31 file scripts kể cả 26 test; **không** có `references/`) **cộng sáu sub-skill anh em** (`banner-design brand design design-system slides ui-styling`, +69 file/477 KB ngoài `design`). Với `.agents/skills/design/` đã có của repo: **không `--force` thì bỏ qua**, có `--force` thì **đè**; và **`uipro uninstall` xoá luôn thư mục `design`** vì nó xoá theo danh sách `['ui-ux-pro-max', ...listBundledSubSkills()]`. Đường an toàn duy nhất là `npx skills@latest add … --skill ui-ux-pro-max -a claude-code -y` (chỉ một skill, `--list` hôm nay vẫn đúng 7), ghi vào `skills-lock.json` **version 1** của repo (CLI `CURRENT_VERSION = 1`, không migrate), 73 file / 3,57 MB, và SKILL.md giữ nguyên 11 chỗ `${CLAUDE_PLUGIN_ROOT}` — docs nói biến này "Substituted **only** in plugin skills". Cả hai đường đều cần mạng và `npx`; không đường nào cần global bin. (§3)
5. **Cắm vào workflow**: chỉ ba chỗ, đều là **đọc file** — `brief.md` §4 (ràng buộc) ở `/design`, bước 2 "soát" của `/design-handoff` (thay/bổ sung `web-design-guidelines` vốn phải fetch mạng), và `/implement` khi đụng `stacks/shadcn.csv`/`nextjs.csv`. Không dùng `--design-system` cho app đã có `theme.css`, không `--persist` (tạo `design-system/` ở cwd), không cài `design` của họ. Cài lại là **đảo** bullet "UI UX Pro Max bỏ hẳn" của ADR-0008 mục 2026-09-06 → cần một mục "Cập nhật" nữa. (§4)
6. **Khuyến nghị**: nếu chủ repo vẫn muốn có nó trong project thì (a) `npx skills@latest add … --skill ui-ux-pro-max -a claude-code -y`, (b) thêm `!.agents/skills/ui-ux-pro-max` vào `biome.json` và `__pycache__/` vào `.gitignore`, (c) **không** sửa SKILL.md vendored — viết hướng dẫn "đọc CSV/references bằng grep, không chạy `search.py`" vào CLAUDE.md §7a, (d) quyết Python: **grep-fallback** (khớp "không cài thêm gì") hay cài Python (đảo quyết định vừa gỡ). Nếu cân theo giá trị thật cho repo này — brand đã có, 63 primitive đã có, rule repo thắng — thì **không cài** vẫn là phương án nhẹ nhất; hai file `references/*.md` + `ux-guidelines.csv` + `stacks/shadcn.csv` (≈ 90 KB) là phần đáng giữ, và có thể lấy về theo cách khác nếu chỉ cần chúng. (§5)

---

## §1. Upstream hôm nay và delta từ `f3ac195`

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| HEAD `main` | **`314307f`**, 2026-09-06T04:31Z — "fix(search): warn that --stack is ignored in --design-system mode (#484) (#487)" | `gh api …/commits/main` |
| Release / tag mới nhất | `v2.15.0`, 2026-08-13T17:10Z; tag trỏ commit `a38d04c` | `gh api …/releases/latest`, `…/git/ref/tags/v2.15.0` |
| npm `ui-ux-pro-max-cli` | `latest` = `2.15.0`, `time.modified` 2026-08-13T17:10Z, `license = MIT`, `bin { uipro: dist/index.js }`, tarball 196 file / 4.656.556 B unpacked | `npm view ui-ux-pro-max-cli`, `npm view …@2.15.0 dist` |
| Repo | 125.317 sao, license MIT, `pushed_at` 2026-09-06 | `gh api repos/…` |
| Commit từ `f3ac195` (không tính nó) | **2**: `b2ac9b2` (2026-09-06 03:59Z) `cli/README.md` `-CC-BY-NC-4.0` `+MIT`; `314307f` `search.py` +6/-0 ở ba bản copy + `scripts/tests/test_design_system_stack.py` +61 | `gh api …/compare/f3ac195...314307f` (`total_commits: 2`, 7 file) |
| SKILL.md lõi đổi không | **Không** — vẫn 15.969 B, đúng số note trước ghi | raw `.claude/skills/ui-ux-pro-max/SKILL.md`, `wc -c` |
| Data đổi không | **Không** — compare không liệt kê file nào dưới `data/` | compare ở trên |
| Drift version nội bộ | `skill.json:5` `"version": "2.13.0"`; `cli/package.json:3` `"version": "2.5.0"` (bump khi publish qua `scripts/sync-release-version.mjs`) — không ảnh hưởng gì | raw hai file |

Diff `search.py` nguyên văn (chèn sau `if args.design_system:`):

```python
if args.stack:
    print(f"note: --stack {args.stack} is ignored in --design-system mode; "
          "run a separate --stack query for stack-specific guidelines", file=sys.stderr)
```

Tức là **mọi phân tích của hai note trước về nội dung skill vẫn đúng nguyên** ở HEAD hôm nay; cái mới duy nhất đáng ghi là license CLI đã MIT rõ ràng (đóng mục "lịch sử license" ở §7 note trước).

---

## §2. Python — trả lời dứt điểm

### 2.1 Skill lõi vẫn cần Python; không có bản Node/Bun

| Kiểm | Kết quả | Bằng chứng |
|---|---|---|
| SKILL.md nói gì | `python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" …`; "If `python` is not found, try `python3`, then `py -3`. **Requires Python 3.x**, no external dependencies" | SKILL.md:42, :45; `${CLAUDE_PLUGIN_ROOT}` xuất hiện **11** lần |
| README | "Python 3.x is required for the search script"; "These install steps are for **you, the human user** — AI agents… should never install software on your machine; they are instructed to ask you instead" | README.md:290-298, :643-645; `README.vi.md:284-292` cùng ý |
| Template SKILL.md của CLI | "If Python is not installed, **do not install it yourself**. Stop and ask the user…"; "On Windows, use `python` instead of `python3`" | `cli/assets/templates/base/skill-content.md:10-17` |
| `cli/src/` có search không | **Không.** `index.ts` khai đúng bốn lệnh `init` / `versions` / `update` / `uninstall` | `cli/src/index.ts:25-88` |
| File JS nào chạm `search.py` | Chỉ `cli/scripts/run-python.mjs` (429 B): `spawnSync(platform()==='win32' ? 'python' : 'python3', args)` — wrapper cho `npm run validate:*`/`test:python` của dev, không phải port | raw file; `cli/package.json:18-25` |
| JS khác trong repo | `.claude/skills/{brand,design-system}/scripts/*.cjs` (sinh CSS/Tailwind từ JSON token, validate token — thuộc sub-skill, không phải search), `stack/scripts/design-audit.mjs` (audit Playwright chụp màn hình, cần `playwright`), `gallery/` (site Next.js) | tree `314307f` lọc `\.(js|mjs|cjs|ts)$` |
| `search.py` import gì | `argparse, json, sys, io` + `core` (BM25 thuần Python, `csv.DictReader`) + `design_system` | `search.py:28-33`; `core.py:7-12`, `:282-303` |

Kết luận: **không có đường nào chạy engine mà không có Python 3**, và upstream chủ ý để agent **hỏi user** thay vì tự cài.

### 2.2 Máy này hôm nay

| Kiểm | Kết quả |
|---|---|
| `~/.claude/skills/ui-ux-pro-max` | **Không tồn tại** (`ls`: No such file); `~/.claude/skills` chỉ còn `context7-mcp`, `find-skills` (symlink → `~/.agents/skills`), sáu `gitnexus-*` |
| `~/.agents/.skill-lock.json` | `version: 3`, một entry `find-skills` — **không** còn entry `ui-ux-pro-max` mà note trước thấy |
| `%LOCALAPPDATA%\Programs\Python\Python313\python.exe` | `Test-Path` = **False**; cả `Programs\Python` lẫn `Launcher` không còn |
| Registry | `HKCU/HKLM\Software\Python\PythonCore` rỗng; không entry Uninstall nào có "Python" |
| `Get-Command python,python3,py` | `python.exe`/`python3.exe` → `…\Microsoft\WindowsApps\` — **stub Store**, `Length: 0`, version `0.0.0.0`; `py` "not recognized" |
| `python --version` | "Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut…" → là stub, không phải Python thật |
| PATH | Process PATH của phiên này vẫn còn 3 entry `…\Python313\…` **rác** (thư mục không tồn tại); PATH User/Machine trong registry **không** có → rác chỉ ở shell kế thừa từ trước khi gỡ |
| `npm ls -g` | không có `ui-ux-pro-max-cli` lẫn `skills`; `uipro`/`skills` không trên PATH |
| Runtime sẵn có | Claude Code 2.1.263, Node v24.17.0, Bun 1.4.0 |

Tức là trạng thái note trước tả (skill global + Python 3.13 cài tối 2026-09-05) **đã được đảo lại** — máy đang đúng nghĩa "không có Python". Bất kỳ đường nào chạy `search.py` đều đòi cài lại nó.

### 2.3 Fallback không Python: grep CSV + đọc `references/*.md`

**Hình dạng data — một dòng một record**, kiểm trên bản fetch từ `314307f`:

| File | `wc -l` | dòng bắt đầu bằng số | Header |
|---|---|---|---|
| `data/ux-guidelines.csv` | 120 | **119** | `No,Category,Issue,Platform,Description,Do,Don't,Code Example Good,Code Example Bad,Severity` |
| `data/stacks/shadcn.csv` | 69 | **68** | `No,Category,Guideline,Description,Do,Don't,Code Good,Code Bad,Severity,Docs URL,Applies To,Status,Verified At` |
| `data/styles.csv` | 89 | **88** (50 `Status=active`) | 29 cột: `…Keywords,Primary Colors,…,Implementation Checklist,Design System Variables,Style ID,Aliases,Status,…` |
| `data/colors.csv` | 193 | **192** | `No,Product Type,Primary,On Primary,…,Ring,Notes` (hex) |
| `data/typography.csv` | 75 | **74** | `…Heading Font,Body Font,…,Google Fonts URL,CSS Import,Tailwind Config,Notes` |
| `data/ui-reasoning.csv` / `products.csv` | 193 / 193 | 192 / 192 | `No,UI_Category,Recommended_Pattern,Style_Priority,…,Decision_Rules,Anti_Patterns,…` / `No,Product Type,Keywords,Primary Style Recommendation,…` |

Số dòng = số record + 1 ở cả bảy file → **không có field xuống dòng**, `grep`/`rg` một dòng trả về đúng một record (CR = 0 byte, LF thuần). Hai demo đã chạy:

```text
grep -iE '^[0-9]+,[^,]*,[^,]*focus' ux-guidelines.csv   → 5 hàng: No 28 Focus States, 100/101 Focus Not Obscured (WCAG 2.2 AA/AAA), 102 Focus Appearance, 109 Focusable Error Summary
grep -inE 'render prop|asChild|oklch|@theme' stacks/shadcn.csv → No 4 (@theme inline + OKLCH), 6 (.dark), 59 (asChild chỉ Radix), 61 (Base UI là default), 68 (render prop thay asChild)
```

Và **join giữa ba CSV theo product type là một string**: `grep '^[0-9]+,[^,]*Portfolio'` ra cùng **No 11 `Portfolio/Personal`** ở `products.csv` (style "Motion-Driven + Minimalism & Swiss Style", pattern "Storytelling-Driven"), `ui-reasoning.csv` (`Decision_Rules` JSON, `Anti_Patterns`) và `colors.csv` (`#18181B` primary, `#2563EB` accent, "Monochrome + blue accent"). Đó chính là bước 1–3 của `DesignSystemGenerator.generate()` làm bằng tay.

**`search.py --design-system` tính gì ngoài retrieval** (`design_system.py:449-610`): (1) `search(query,"product",1)` lấy category; (2) `_apply_reasoning(category)` đọc hàng `ui-reasoning.csv` cùng tên; (3) `_multi_domain_search` BM25 trên style/color/typography/landing với `style_priority` từ reasoning; (4) `_select_best_match` chấm điểm keyword (10/3/1); (5) `_resolve_color_mode` + `_select_palette_for_mode` — **tính luminance/contrast** (`_relative_luminance:129`, `_contrast_ratio:153`) để palette khớp light/dark của style, `_derive_dark_palette:193` khi cần; (6) dial `--variance/--motion/--density` (`DIAL_TIERS:71`) đổi keyword ưu tiên, kéo một hàng `motion.csv`, và **thay bảng spacing**; (7) `format_master_md:1076-1380` đổ dict đó vào template heading cố định (`# Design System Master File` → `## Global Rules` → `## Component Specs` → …). Tức **MASTER.md là template fill từ hàng CSV**, cộng ba phép tính nhỏ (chọn mode, derive dark, spacing theo dial). Với repo này ba phép đó không có việc: palette light/dark là `theme.css` (`:root`/`.dark` oklch), spacing là scale Tailwind — note trước §1.5 đã loại `Component Specs`/`Spacing`/`Shadow`.

| Mất khi không Python | Còn nguyên |
|---|---|
| BM25 ranking, `detect_domain` tự đoán domain, rewrite query theo domain, ngưỡng abstain + `suggestions` khi không khớp (`core.py:755-847`) | mọi hàng của mọi CSV — grep theo `Category`/`Issue`/keyword; hàng `stacks/*.csv` có cả `Code Good`/`Code Bad`/`Docs URL` |
| `--design-system` end-to-end (chọn mode, derive dark, dial) và `--persist` ra `design-system/<slug>/MASTER.md` | join product → reasoning → colors bằng một tên (cùng `No`); `styles.csv` có sẵn `Implementation Checklist` + `Design System Variables` từng style |
| `--json` untruncated (bản in ASCII cắt 300 ký tự) | `references/quick-reference.md` (24,5 KB, 10 mục = 119 rule dạng `slug - câu`) và `references/pro-rules.md` (10,9 KB, 6 mục + "Pre-Delivery Checklist (canonical — the only one)") — SKILL.md:18/:33 vốn bảo **đọc file** chứ không search |

Upstream **không có** câu nào về fallback không Python (grep `fallback|without|manually|grep` trên SKILL.md chỉ ra dòng 57 "label any general guidance as a fallback" — nghĩa khác). Nhưng `quick-reference.md:3` là bằng chứng chính chủ rằng phần UX **được thiết kế** để đọc tĩnh.

---

## §3. Cài theo docs vào project — lệnh, cái gì ghi vào đâu

### 3.1 Đường A — `uipro` (README:233-246 "Using CLI (Recommended)")

```bash
npm install -g ui-ux-pro-max-cli     # README:236 — global bin `uipro`; hoặc npx ui-ux-pro-max-cli init --ai claude (README:639-640)
cd D:/Personal/monorepo
uipro init --ai claude               # README:242
```

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| Cờ của `init` | `-a/--ai`, `-f/--force`, `-o/--offline`, `-g/--global`, `-t/--token`. **Không có cờ chọn skill** | `cli/src/index.ts:25-46` |
| Cần mạng? | `init` mặc định đi `templateInstall` — đọc **asset bundled** trong gói npm, không `fetch`. Nhánh GitHub release chỉ chạy khi `options.legacy`, mà `index.ts` **không bao giờ set** → `--offline` là no-op đúng như mô tả "Compatibility flag" | `init.ts:169-193`, `:35`, `index.ts:39-45`, `cli/README.md:31` |
| Ghi gì (core) | `.claude/skills/ui-ux-pro-max/SKILL.md` **render từ template** (`skill-content.md` 26,5 KB + `quick-reference.md` 27,4 KB inline ≈ 54 KB; `{{SCRIPT_PATH}}` → `.claude/skills/ui-ux-pro-max/scripts/search.py` project, `~/…` global) + copy `data/` (39 file, 3.085.588 B) + `scripts/` (31 file, 435.621 B; **26 là test**). **Không** copy `references/` — `cli/assets/` chỉ có `data scripts skills templates` | `template.ts:132-164`, `:186-206`, `:240-280`; tree `cli/assets/` |
| Ghi gì (thêm) | **Sáu sub-skill anh em** vào `.claude/skills/`: `banner-design brand design design-system slides ui-styling` — "so a single `uipro init` delivers all 7 skills"; ngoài `design` là 69 file / 477.462 B (`ui-styling` bản CLI 16 file, không có 54 `.ttf`) | `template.ts:219-233`, `:282-294`; tree |
| Đụng `design` của repo? | `copySubSkills`: `if (await exists(target) && !force) continue;` → **không `--force`: bỏ qua, giữ nguyên**; **`--force`: `cp` đè lên** (SKILL.md của repo bị thay). SKILL.md lõi đã có → "Skipped (already exists)… use --force" | `template.ts:229`, `:266-270` |
| `uipro uninstall --ai claude` | Xoá theo danh sách `['ui-ux-pro-max', ...listBundledSubSkills()]` bằng `rm(recursive)` → **xoá luôn `.claude/skills/design/` của repo** | `uninstall.ts:25`, `:69` |
| Đụng CLAUDE.md / AGENTS.md / settings? | Không — `init.ts`/`template.ts`/`detect.ts` không grep ra `CLAUDE.md`/`settings`/`AGENTS` | grep ba file |
| Ghi lock? | Không có khái niệm lock; `uipro update` chỉ `npm i -g …@latest` rồi render lại | `cli/README.md:66-75` |
| License | **MIT** ở `cli/package.json:49`, `cli/README.md:101` (sau `b2ac9b2`), `npm view`. Với repo public cá nhân không có ràng buộc gì thêm | — |
| Symlink `.claude → .agents` | `mkdir(recursive)` qua symlink → file rơi vật lý vào `.agents/skills/` (mode `120000`, `core.symlinks=true`) — **chưa chạy thật** | `git ls-files -s .claude`; `git config` |

Tóm lại đường A **không thể** cài "chỉ core", và hai thao tác thường gặp (`--force`, `uninstall`) đều **phá skill `design` của repo**.

### 3.2 Đường B — `skills` CLI (đường repo đang dùng cho 25 skill)

```bash
npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -a claude-code -y
```

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| `--list` hôm nay | "Found **7** skills": `banner-design brand design design-system slides ui-styling ui-ux-pro-max` — y hệt note trước; agent detect `claude-code_2-1-261_agent` | output `list-output.txt` (2026-09-06) |
| Cờ | `-g/--global`, `-a/--agent`, `-s/--skill`, `-l/--list`, `-y/--yes`, `--copy`, `--all` (= `--skill '*' --agent '*' -y` → **cài cả 7, kể cả `design`**) | `vercel-labs/skills` `src/cli.ts:136-144` |
| Ghi vào đâu | `agents['claude-code'].skillsDir = '.claude/skills'` (project) / `~/.claude/skills` (global); installer resolve symlink cha, nên ở repo này là `.agents/skills/ui-ux-pro-max/` | `src/agents.ts:152-160`; `src/installer.ts:114-150`, `:173-258` |
| Lock nào | Project (không `-g`): `addSkillToLocalLock(…, cwd)` → **`<cwd>/skills-lock.json`**, entry `{source, sourceType:"github", skillPath:".claude/skills/ui-ux-pro-max/SKILL.md", computedHash}`; `CURRENT_VERSION = 1` — khớp `"version": 1` của repo, **không migrate**, chỉ thêm key và sort. `-g`: `addSkillToLock` → `~/.agents/.skill-lock.json` (version 3, `skillFolderHash` = tree SHA) | `src/add.ts:800`, `:1901-1930`, `:1884`; `src/local-lock.ts:5-6`, `:65-66`, `:86`, `:189-197` |
| Footprint | **73 file / 3.572.613 B** — gồm `references/` (2 file, 35.435 B) và `scripts/tests/` (26 file, 256.023 B); ba file lớn nhất `phosphor-icons-upstream.json` 823.933, `google-fonts.csv` 747.241, `google-font-licenses.json` 433.127 | tree `314307f` |
| Path trong SKILL.md | **Copy nguyên** → 11 chỗ `${CLAUDE_PLUGIN_ROOT}`. Docs: biến này "Substituted **only in plugin skills**"; project skill chỉ được thay `${CLAUDE_SKILL_DIR}` và `${CLAUDE_PROJECT_DIR}`. Test của chính upstream: "the `${CLAUDE_PLUGIN_ROOT}` form is only valid in the plugin-only core SKILL.md" | [skills.md](https://code.claude.com/docs/en/skills.md) bảng biến (`${CLAUDE_SKILL_DIR}`, `${CLAUDE_PLUGIN_ROOT}`) + đoạn "Claude Code substitutes…"; `scripts/tests/test_skill_script_paths.py:1-18`, `:53-55` |
| Mạng / dấu vết | `git clone --depth 1` vào temp (owner không thuộc blob-allowlist), telemetry POST trừ `DISABLE_TELEMETRY`/`DO_NOT_TRACK`; không global bin | note trước §3.1 (không lặp) |

### 3.3 Va tên `design` — form nào an toàn

Docs: "A skill at any of these levels also overrides a bundled skill with the same name" và project = `.claude/skills/<skill-name>/SKILL.md` ([skills.md](https://code.claude.com/docs/en/skills.md) "Where skills live"). Repo đã dùng đúng cơ chế đó cho `.agents/skills/design/SKILL.md:16-18` ("cố ý trùng tên"). Bảng rủi ro:

| Lệnh | `design` của repo |
|---|---|
| `uipro init --ai claude` | giữ (skip) — nhưng 5 sub-skill khác vẫn vào |
| `uipro init --ai claude --force` | **bị đè** |
| `uipro uninstall --ai claude` | **bị xoá** |
| `npx skills add … --all` hoặc không `--skill` (chọn hết) | **bị đè** (skill `design` của họ: logo/CIP qua Gemini/MuAPI, `pip install` — note trước §3.2) |
| `npx skills add … --skill ui-ux-pro-max` | **an toàn** — chỉ một thư mục |

### 3.4 Kích thước và git

- **Biome**: `biome.json:10-23` `files.includes` = `**` trừ danh sách, **không** loại `.agents/skills`. Thư mục này mang 5 file `.json` (≈1,4 MB, `phosphor…`, `google-font-licenses`, `data-provenance`, `catalog-summary`, `relevance-baseline`) → `bun run check` sẽ format lại → hash trong lock lệch ngay. Cần `!.agents/skills/ui-ux-pro-max` cùng hình dạng `!docs/design` (dòng 20).
- **`.gitignore`**: `.claude/` (dòng 59) không đụng vì file nằm vật lý ở `.agents/`; **không có `__pycache__`** — nếu có Python, chạy `search.py` sẽ đẻ `scripts/__pycache__/*.pyc` vào thư mục vendored (note trước §3.3 thấy đúng thế ở bản global) → tree bẩn + hash lệch. `cli/.npmignore` của upstream cũng phải loại `**/__pycache__/`.
- **`.gitattributes:6`** `* text=auto eol=lf`: file upstream đã LF (CR = 0) nên không đổi byte; nhưng hash trong `skills-lock.json` tính ở clone tạm (máy `core.autocrlf=true`) — vấn đề "25/25 hash không tái lập" của note trước §3.4 sẽ có thêm entry thứ 26.
- **Git**: +3,57 MB, 73 file, trong đó ≈2 MB là ba file font/icon mà không bước nào của repo đọc.

---

## §4. Cắm vào workflow — chỉ phần delta

Chuỗi hiện tại là `CLAUDE.md:422-441` (tám bước) và ADR-0008; **`CLAUDE.md` hôm nay không còn một chữ nào về UI UX Pro Max hay Python** (grep rỗng), vì ADR-0008:85 đã ghi "**UI UX Pro Max bỏ hẳn** — không còn vai phụ, không còn phụ thuộc Python nào repo phải nhớ". Cài lại là **đảo** bullet đó → phải thêm mục "Cập nhật" thứ ba vào ADR, nói rõ vai mới là **đọc file, không chạy script**.

| Bước | Dùng | File nào, câu hỏi nào | Không dùng |
|---|---|---|---|
| 2 `/design` — viết `brief.md` | §4 "ràng buộc", §5 "vấn đề cần giải" | `data/ux-guidelines.csv` grep theo `Category` của màn hình (Navigation/Forms/Accessibility…) → 3–8 hàng `Do`/`Don't` thành ràng buộc; `quick-reference.md` mục 1–2 (CRITICAL) làm checklist mặc định | `--design-system`, `colors.csv`, `typography.csv` — app đã có `theme.css`/stack font; chỉ cân nhắc cho app mới **chưa có** brand, và khi đó join tay `products`→`ui-reasoning`→`colors` theo `No` |
| 6 `/design-handoff` — bước 2 "soát" | bổ sung/thay `web-design-guidelines` (skill đó **fetch mạng mỗi lần**, note trước §3) | `references/pro-rules.md` § Pre-Delivery Checklist (Visual Quality / Interaction / Light-Dark / Layout / Accessibility) + hàng `ux-guidelines.csv` tương ứng → mục 4 và 6 của handoff | mục Icons/Interaction (App) viết cho native — bỏ như skill hiện đã bỏ phần "chỉ code thật mới trả lời" |
| 8 `/implement` | khi đụng primitive/theme | `stacks/shadcn.csv` (No 4/6/59/61/68: `@theme inline` + OKLCH, `.dark`, `render` thay `asChild`), `stacks/nextjs.csv`, `react-performance.csv` — **rule repo thắng** (`CLAUDE.md:413-419`) | `--stack` search; `Component Specs` của MASTER.md |
| 1 research · 3 Direction · 4–5 artboard · 7 grill · `/to-spec` · `/to-tickets` · `/code-review` | **không** | — | nó không vẽ, không có vòng sửa (ADR-0008:15); trục Standards của review đối chiếu `.agents/rules/`, không phải CSV |

Điều kiện dùng ở cả ba chỗ: đọc bằng `Read`/`Grep` trên `.agents/skills/ui-ux-pro-max/{data,references}/`, không gọi `search.py`, không `--persist` (nó tạo `design-system/<slug>/` ở cwd — repo hiện không có thư mục đó và không nên có).

---

## §5. Khuyến nghị

- **Câu Python, dứt điểm**: engine cần Python 3 và không có port JS; máy đang **không** có Python thật; "không cài thêm gì" ⇒ **không chạy `search.py`** ⇒ chỉ có **grep-fallback**. Phần mất (BM25 + `--design-system`) là phần repo này vốn không dùng; phần còn (CSV một dòng một record, hai `references/*.md`) là phần đáng giá.
- **Nếu cài**: dùng đường B, đúng một lệnh — `npx skills@latest add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -a claude-code -y` (thêm `DISABLE_TELEMETRY=1` nếu muốn). **Không** `npm i -g ui-ux-pro-max-cli`, **không** `uipro init/uninstall` trong repo này — cả hai đường đó đụng `.agents/skills/design/`.
- **Trước khi cài**: thêm `!.agents/skills/ui-ux-pro-max` vào `biome.json` `files.includes` và `__pycache__/` vào `.gitignore`; chấp nhận entry thứ 26 trong `skills-lock.json` có hash không tái lập (như 25 entry kia).
- **Không sửa SKILL.md vendored** (CLAUDE.md §8:520). Path `${CLAUDE_PLUGIN_ROOT}` và câu "Requires Python 3.x" cứ để nguyên; ghi override vào **CLAUDE.md §7a**, một đoạn ngắn: "skill `ui-ux-pro-max` trong repo này là **kho dữ liệu đọc tĩnh** — grep `data/*.csv`, đọc `references/*.md`; không chạy `scripts/search.py` (repo không có Python); dùng ở ba chỗ §4; `--design-system`/`--persist` không dùng". Nếu một ngày muốn gọi script, cách sạch là một skill wrapper **của repo** dùng `${CLAUDE_SKILL_DIR}` (docs cho phép thay biến này ở project skill) trỏ sang `../ui-ux-pro-max/scripts/search.py` — chỉ khi đã có Python.
- **ADR-0008**: thêm mục "Cập nhật" thứ ba đảo bullet dòng 85, ghi vai mới (đọc tĩnh) và ba bước dùng; `CONTEXT.md` không cần term mới.
- **Phương án nhẹ hơn để cân nhắc**: nếu thứ cần chỉ là `ux-guidelines.csv` + `stacks/shadcn.csv` + `stacks/nextjs.csv` + hai `references/*.md` (≈ 90 KB, MIT), thì vendor **3,57 MB** để lấy chúng là mua cả kho font/icon không ai đọc. Lấy riêng năm file đó về (một thư mục dưới `docs/research/` hoặc một skill của repo ghi rõ nguồn + commit `314307f`) là cách "không cài gì" đúng nghĩa đen và không đụng lock — nhưng nó **không** đi qua `skills` CLI nên không `update` được; chủ repo chọn giữa "đúng chuẩn vendored, nặng" và "nhẹ, tự tay".
- **Chủ repo phải quyết**: (1) Python — cài lại vs grep-fallback vs không cài skill; (2) cài cả thư mục qua `skills` CLI vs lấy năm file; (3) có đảo ADR-0008 không. Note này khuyến nghị **grep-fallback + lấy năm file**, hoặc **không cài** nếu `web-design-guidelines` đang đủ dùng.

---

## §6. Chưa xác minh (gom lại)

- `npx skills@latest add … --skill ui-ux-pro-max -a claude-code` và `uipro init --ai claude` **chưa chạy thật** trong repo này (chỉ `--list` và đọc source); hành vi `mkdir` qua symlink `.claude → .agents` của `uipro` suy từ code, chưa quan sát.
- `experimental_install` có so `computedHash` hay không — vẫn mở từ hai note trước.
- Thời gian `--list` lần này không đo (note trước ghi >180 s vì clone cả repo).
- Có bị Biome đụng thật không khi để `.agents/skills/ui-ux-pro-max` trong `files.includes` — suy từ việc thư mục có `.json`; chưa chạy `bun run check` với thư mục đó.
- `stack/scripts/design-audit.mjs` (11 KB, Playwright) là gì trong bức tranh sản phẩm của họ — chỉ đọc header, không thuộc skill nào trong bảy.
- `${CLAUDE_SKILL_DIR}` có được thay trong SKILL.md của project skill trên bản 2.1.263 này không — đọc từ docs, chưa thử một skill mẫu.
- Vì sao npx cache trên máy không có entry `skills` dù `--list` vừa chạy (danh sách `_npx` đọc trước khi lệnh xong) — không quan trọng, không kiểm lại.
- Registry Uninstall rỗng và `PythonCore` rỗng đọc là "đã gỡ", nhưng ai/khi nào gỡ Python 3.13 và skill global — không có log nào trên máy nói.
