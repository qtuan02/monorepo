---
status: done
---

# 12 — Gate cuối 0 lỗi 0 warning và kiểm tay tổng

**What to build:** Trên một clone mới của Target (máy Windows, symlink bật), `bun install` rồi bốn lệnh Gate xanh với **0 lỗi và 0 warning** (kể cả warning Biome `useImportType`/`useExportType` và warning của Vite/Next build); CI xanh trên commit cuối; ba image Docker build được; Storybook và hai template mở thật và hoạt động; toàn bộ thư mục plan này được đánh dấu xong.

**Blocked by:** 11 — Skills, MCP, GitNexus, docs.

**Status:** done (chạy 2026-09-04 trên nhánh `feat/upgrade`, commit `0708b4b` + commit của lượt docs này; **hai ô Docker không chạy được** vì máy không còn Docker, và **ô CI chờ push** — xem "Còn treo")

- [x] Clone mới với `git clone -c core.symlinks=true`; `git ls-files -s .claude` trả mode 120000 và `.claude/rules` đọc được
- [x] `bun install --frozen-lockfile` không thay đổi `bun.lock`
- [x] `bun run check`: 0 error, 0 warning (nâng các rule đang `warn` lên `error` — xem "Quyết định của lượt này" #4); `bun run typecheck`, `bun run test`, `bun run build` xanh, không warning trong log build (bốn nguồn warning đã xử lý — #1–#3)
- [~] `bunx playwright test --project=chromium` xanh cho cả hai template — **7/7 (`_template_vite`) và 6/6 (`_template_next`)**; job `e2e` trên CI **chưa chứng minh** (`feat/upgrade` chưa push, cùng lý do ticket 01)
- [ ] `docker build` thành công cho `_template_vite`, `_template_next`, `storybook`; container `_template_vite` trả 404 cho file không tồn tại thay vì index; container `_template_next` trả trang SSR — **không chạy được: máy này không còn Docker** (xem "Còn treo")
- [x] Storybook mở thật: checklist orientation của ticket 06 tick lại; `_template_vite` đổi ngôn ngữ đổi weekday trên clock; `_template_next` đổi `[locale]` đổi nội dung SSR
- [x] `docs/research/personal-monorepo-rebuild.md` (bản research) và thư mục plan này được copy sang Target (`docs/research/`, `.agents/plans/personal-monorepo-rebuild/`) với mọi ticket `status: done`; bản ở reference giữ nguyên làm lịch sử
- [x] Ghi vào `decisions.md` mọi chỗ version thực tế khác số ngày 2026-09-03

---

## Bằng chứng — clone mới (2026-09-04)

```bash
git clone -c core.symlinks=true --branch feat/upgrade D:/Personal/monorepo D:/Personal/_ticket12_clone
```

| Kiểm | Kết quả |
|---|---|
| `git ls-files -s .claude` | `120000 c0ca468… 0 .claude` — mode symlink, đúng |
| `ls -la .claude` | `.claude -> .agents` |
| `ls .claude/rules` | đọc được, **48 file** |
| `md5sum bun.lock` trước/sau `bun install --frozen-lockfile` | `a55f4700600d6846928771b7e125a5e4` cả hai lần; `git status` rỗng |
| `bun install --frozen-lockfile` | `558 packages installed [14.02s]` |

### Gate trên clone mới

| Lệnh | Exit | Kết quả |
|---|---|---|
| `bun run check` | 0 | `Checked 353 files. No fixes applied.` |
| `bun run typecheck` | 0 | `12 successful, 12 total` (0 cached) |
| `bun run test` | 0 | `8 successful, 8 total` (0 cached) |
| `bun run build` | **1** | đỏ **trước** khi copy `.env` — xem ngay dưới |
| `cp .env.example .env` rồi `bun run build --force` | 0 | `3 successful, 3 total`, không một dòng warning |

**Lần `build` đỏ là đúng thiết kế, không phải lỗi.** `.env` gitignore theo ADR-0003/0004, nên clone mới không có nó, và `@monorepo/env` Flavor `next` chặn build với đúng câu cần thiết:

```
✖ NEXT_PUBLIC_APP_ENV: Invalid input: expected string, received undefined
…
Copy .env.example to .env at the repo root and fill in the values; a Next app reads
that file through `dotenv -e ../../.env --` (ADR-0003).
```

`README.md` đã ghi `cp .env.example .env` là bước 2 của Getting started, nên thứ tự đúng của một clone mới là **clone → `bun install` → `cp .env.example .env` → Gate**, và như vậy Gate xanh 4/4 với 0 warning.

> **Một chỗ bất đối xứng đáng ghi, không sửa trong lượt này:** ở cùng lần chạy thiếu `.env` đó, `_template_vite` và `storybook` **build xanh**. Vite nướng `import.meta.env.PUBLIC_*` lúc build nhưng `createEnv` của app chỉ chạy trong **browser**, nên thiếu `.env` sinh ra một bundle hỏng chứ không phải một build đỏ. Thứ duy nhất bắt được là bước validate tường minh trong Dockerfile (`bun -e "import './src/env.ts';"`), tức là chỉ ở đường image. App Next thì đỏ ngay lúc build vì `env.ts` của nó bị import từ một server action. Nếu muốn hai Runtime hành xử giống nhau thì `_template_vite` cần một bước validate trong script `build`, và đó là một ticket riêng.

## Bằng chứng — Gate trên cây làm việc (2026-09-04, commit `0708b4b`)

| Lệnh | Exit | Đuôi log |
|---|---|---|
| `bun run check` | 0 | `Checked 353 files in 23s. No fixes applied.` |
| `bun run typecheck --force` | 0 | `12 successful, 12 total` · `0 cached` |
| `bun run test --force` | 0 | `8 successful, 8 total` — 169 test: ui 17 · env 17 · dayjs 13 · api 22 · i18n 43 · `_template_next` 39 · `_template_vite` 11 · storybook 148 |
| `bun run build --force` | 0 | `3 successful, 3 total` |

`grep -i "warn|(!)|⚠|▲"` trên cả bốn log chỉ còn dòng logo `▲ Next.js 16.3.4`. Chạy `build --force` hai lần liên tiếp để loại khả năng một warning phụ thuộc tải máy (PLUGIN_TIMINGS) trốn được.

## Bằng chứng — Playwright (2026-09-04)

Chạy `bunx playwright test --project=chromium` với cwd là thư mục app (không qua `bun run`, xem §7a của `CLAUDE.md`):

- `apps/_template_vite` → **7 passed (7.2s)** — `auth.e2e.ts` (5) + `home.e2e.ts` (2).
- `apps/_template_next` → **6 passed (15.6s)** — `server-rendering.e2e.ts` (5) + `locale-switch.e2e.ts` (1).

Ghi chú: log của `_template_next` vẫn in `⚠ "next start" does not work with "output: standalone" configuration`. Đây là warning của **e2e**, không phải của `build`, nên không chặn ô "0 warning trong log build" — nhưng nó vẫn là khoản treo của ticket 08 (xem "Còn treo").

## Bằng chứng — kiểm tay (2026-09-04)

Cả ba lượt chạy bằng Chromium thật (Playwright driver dưới Node), trên **bản build** chứ không phải dev server; screenshot lưu ngoài repo.

### Storybook — checklist orientation + z-index của ticket 06

Phục vụ `apps/storybook/dist` qua một static server, mở từng story bằng `iframe.html?id=…`, đọc **computed style** chứ không nhìn bằng mắt — vì đúng thứ cần chứng minh là hai `@custom-variant data-horizontal/data-vertical` trong `tooling/tailwind/globals.css` có sinh ra CSS thật hay không, và jsdom không tính layout.

| Kiểm | Kỳ vọng | Đo được |
|---|---|---|
| Separator dọc (`storybook-separator--default`) | `data-vertical:w-px` + `self-stretch` | `width=1px height=20px align-self=stretch` ✅ |
| Separator ngang (`storybook-scrollarea--default`) | `data-horizontal:h-px w-full` | `width=158px height=1px` ✅ |
| ScrollArea thanh cuộn dọc | `data-vertical:w-2.5` = 10px | `width=10px height=286px` ✅ |
| Slider ngang (`storybook-slider--default`) | track `data-horizontal:h-1.5` = 6px | `width=1200px height=6px` ✅ |
| Tabs ngang (`storybook-tabs--default`) | `data-horizontal:flex-col` | `data-orientation=horizontal flex-direction=column` ✅ |
| Dialog trên cùng | `elementFromPoint` ở tâm nằm trong content | trúng `DIV.group/field-group…`, `z-index=50` ✅ |
| Popover trên cùng | như trên | trúng `INPUT…`, `z-index=50` ✅ |
| Tooltip trên cùng | như trên | trúng `P`, `z-index=50` ✅ |

**8/8.** Không có story Slider dọc trong bộ hiện tại, nên chiều dọc của Slider được chứng minh gián tiếp qua Separator + ScrollArea (cùng hai `@custom-variant`); nếu muốn phủ trực tiếp thì thêm một story `Vertical` cho Slider.

> Quan sát phụ (không thuộc checklist): trong `slider.stories.tsx`, `className="w-[60%]"` không có tác dụng — `cn("data-horizontal:w-full …", className)` để `w-full` sau một variant prefix nên tailwind-merge không coi hai class là xung khắc, và ở orientation ngang thì `data-horizontal:w-full` thắng. Track đo được 1200px (full viewport trừ padding) chứ không phải 60%. `packages/ui` là core và không sửa trong lượt này.

### `_template_vite` — đổi ngôn ngữ đổi weekday trên clock

Chạy trên `vite preview` của bản build, seed session bằng đúng entry `persist` của `useAuthStore` (như `e2e/support/auth-session.ts`), rồi đổi ngôn ngữ **qua chính control** trong header:

```
before (vi): Thứ sáu, 04/09/2026
after  (en): Friday, 04/09/2026
```

Đúng thứ rule `dates-locale-render-input` tồn tại để bảo vệ: weekday đổi ngay mà không cần thứ gì khác re-render.

> Quan sát phụ (không thuộc ô kiểm): `<html lang>` **vẫn là `vi`** sau khi chuyển sang English — `_template_vite` không đồng bộ `document.documentElement.lang` với i18next. `_template_next` thì đúng (`<html lang="vi">` ở `/`, `<html lang="en">` ở `/en`). Là một khoản a11y/SEO nhỏ của template Vite, để lại thành ticket riêng.

### `_template_next` — đổi `[locale]` đổi nội dung SSR

Đọc **HTML thô** bằng `curl` (không browser, không hydration) từ `next start` port 3101:

| URL | `<html lang>` | `<title>` | `<h1>` |
|---|---|---|---|
| `/` | `vi` | `Phân hệ · Template Web` | `Phân hệ` |
| `/en` | `en` | `Modules · Template Web` | `Modules` |

`/vi` trả **307 → `/`**: `localePrefix` để mặc định không gắn prefix cho ngôn ngữ mặc định. Đúng thiết kế, không phải lỗi.

## Quyết định của lượt này (chi tiết trong `decisions.md` #19–#22)

1. **Turbo tar warning trên `_template_next:build` → `"cache": false`.** Warning này **không** cosmetic: ghi cache thất bại nên task chưa bao giờ được cache (ba lần chạy liên tiếp đều `0 cached`). Giả thuyết của ticket 08 (loại `.next/node_modules/**` khỏi `outputs`) đã **kiểm và sai**: Turbopack phát `externalRequire("require-in-the-middle-<hash>")` và resolve qua đúng thư mục đó, nên bản restore từ cache chết với `Cannot find module 'require-in-the-middle-33b9b380c3ed9e62'`. Hai symlink kia là artifact **runtime**, không phải rác của file trace.
2. **`chunkSizeWarningLimit`** 800 cho `_template_vite`, 1500 cho `storybook` (đặt trong `viteFinal` của `.storybook/main.ts`).
3. **`checks.pluginTimings: false`** cho `storybook` — phải đặt dưới `rolldownOptions`, không phải `rollupOptions`.
4. **Biome `useImportType`/`useExportType`: `warn` → `error`.**

---

## Còn treo

- **Ba ô `docker build` và hai kiểm container (404 của `_template_vite`, trang SSR của `_template_next`) không chạy được:** máy này **không còn Docker**. `C:\Program Files\Docker` rỗng, `%LOCALAPPDATA%\Programs\DockerDesktop` chỉ còn `tmp-delete`, `Get-Command docker/podman` không trả gì, `wsl -l -v` báo không có distribution nào. Không suy đoán thay: ba Dockerfile đã được đọc và đúng hình (ticket 06/07/08 ghi từng dòng), nhưng "đúng hình" không phải "build được". Cần chạy lại ô này trên một máy có Docker, hoặc để job CI dựng image.

  Có thử đường vòng gần nhất — chạy thẳng `node .next/standalone/apps/_template_next/server.js` (đúng binary image sẽ chạy) sau khi copy `public` + `.next/static` vào — và nó **chết trên Windows** với `EPERM: operation not permitted, stat …\.next\standalone\node_modules\.bun\next@…\node_modules\react`: Node không stat được symlink mà `next build` sinh trong standalone. Đây là giới hạn của Windows, không phải của image (runner là `node:24-alpine`), nên nó cũng không thay thế được lượt Docker.

- **Ô CI:** `feat/upgrade` vẫn chưa có trên remote (`origin` = `github.com/qtuan02/monorepo`), nên chưa workflow run nào nhìn thấy Skeleton. Cần `git push -u origin feat/upgrade` để bốn job Gate + job `e2e` chạy lần đầu trên commit cuối. Đây là ô cuối cùng còn thiếu ngoài Docker.

- **`next start` với `output: "standalone"`** — khoản treo của ticket 08 vẫn nguyên. Log e2e in `⚠ "next start" does not work with "output: standalone"`, và hệ quả thật vẫn đúng như ticket 08 viết: e2e không kiểm thứ Docker ship. Không sửa trong lượt này vì (a) nó nằm ngoài ô của ticket 12 — warning ở log e2e, không ở log build — và (b) bản sửa cần thêm một bước copy `public` + `.next/static` vào standalone **chạy được trên cả Windows và Linux**, tức là một script chứ không phải một dòng `cp`. Script `start` trong `package.json` dính cùng vấn đề.

- **Port 3000 ghi cứng ở hai chỗ của `_template_vite`** (`vite.config.ts` `server.port`, `playwright.config.ts` `PORT` + `--port 3000 --strictPort`) — khoản treo của ticket 07, chưa sửa. Generator clone nguyên văn, nên app đầu tiên sinh từ template này va port với chính template.

- **`<html lang>` của `_template_vite` không theo ngôn ngữ** (xem phần kiểm tay ở trên).

- **Không có story Slider dọc** trong `apps/storybook` (xem phần kiểm tay ở trên).

- **Thư mục plan ở reference (`E:\MedViet\frontend\medviet\.agents\plans\personal-monorepo-rebuild\`) và `docs/research/personal-monorepo-rebuild.md` ở reference vẫn untracked và cố ý không commit vào medviet.** Bản chính thức từ nay là bản trong Target. Xoá bản ở reference khi không cần đối chiếu nữa.
