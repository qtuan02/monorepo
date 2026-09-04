---
status: ready-for-human
---

# 12 — Gate cuối 0 lỗi 0 warning và kiểm tay tổng

**What to build:** Trên một clone mới của Target (máy Windows, symlink bật), `bun install` rồi bốn lệnh Gate xanh với **0 lỗi và 0 warning** (kể cả warning Biome `useImportType`/`useExportType` và warning của Vite/Next build); CI xanh trên commit cuối; ba image Docker build được; Storybook và hai template mở thật và hoạt động; toàn bộ thư mục plan này được đánh dấu xong.

**Blocked by:** 11 — Skills, MCP, GitNexus, docs.

**Status:** `ready-for-human` (chạy 2026-09-04 trên nhánh `feat/upgrade`, commit `0708b4b` → `d964157`; **bảy trong chín ô xong**, hai ô còn lại đều là Docker — nay đã có **đường chạy**, chưa có **kết quả**: xem "Bằng chứng — job `docker` trên CI")

> **Vì sao vẫn chưa phải `done` (cập nhật 2026-09-04, ticket `legacy-migrate/02`).** `docs/agents/triage-labels.md` định nghĩa `done` là "Implemented **and** verified, with the verification recorded in the ticket's own body". Hai vế đó nay tách hẳn nhau:
>
> - **Implemented — xong.** Ticket `legacy-migrate/02` đã thêm job `docker` vào `.github/workflows/ci.yml`: matrix suy ra từ `find apps -mindepth 2 -maxdepth 2 -name Dockerfile`, non-blocking, dựng image cho cả ba app. Lý do "máy này không còn Docker" **không còn chặn** ô này nữa — runner Ubuntu của GitHub Actions có Docker sẵn.
> - **Verified — chưa.** Job chưa chạy lần nào. Không có run nào để dẫn, và ticket này **không được** ghi một URL bịa hay một chữ "xanh" chưa đo. Máy viết ticket này không chạy được `docker` (`command -v docker` trả rỗng) và không đọc được run (không có `gh`).
>
> Nên `ready-for-human` giữ nguyên, nhưng **lý do đã đổi**: không còn là "cần một máy có Docker" mà là "cần một lượt push và một người đọc run". Điều kiện chính xác để lật sang `done` ghi ở "Bằng chứng — job `docker` trên CI" ngay dưới.
>
> `spec.md` giữ cùng trạng thái vì US45 chưa được chứng minh lần nào — xem ghi chú US45 ở cuối mục đó.

- [x] Clone mới với `git clone -c core.symlinks=true`; `git ls-files -s .claude` trả mode 120000 và `.claude/rules` đọc được
- [x] `bun install --frozen-lockfile` không thay đổi `bun.lock`
- [x] `bun run check`: 0 error, 0 warning (nâng các rule đang `warn` lên `error` — xem "Quyết định của lượt này" #4); `bun run typecheck`, `bun run test`, `bun run build` xanh, không warning trong log build (bốn nguồn warning đã xử lý — #1–#3)
- [x] `bunx playwright test --project=chromium` xanh cho cả hai template — **7/7 (`_template_vite`) và 6/6 (`_template_next`)** local; job `e2e` trên CI **xanh** ở run #2 (vẫn `continue-on-error`), sau khi sửa một lỗi mà chỉ CI mới lộ — xem "Bằng chứng — CI"
- [ ] `docker build` thành công cho `_template_vite`, `_template_next`, `storybook` — **job CI đã có, chưa có run**: `legacy-migrate/02` thêm job `docker` non-blocking dựng cả ba image; ô này tick khi run đầu tiên xanh (xem "Bằng chứng — job `docker` trên CI")
- [ ] container `_template_vite` trả 404 cho file không tồn tại thay vì index; container `_template_next` trả trang SSR — **tách khỏi ô trên và vẫn treo**: job `docker` dựng image chứ không chạy container (`load: false`), nên nó không chứng minh được hai kiểm này (xem "Còn treo")
- [x] Storybook mở thật: checklist orientation của ticket 06 tick lại; `_template_vite` đổi ngôn ngữ đổi weekday trên clock; `_template_next` đổi `[locale]` đổi nội dung SSR
- [~] `docs/research/personal-monorepo-rebuild.md` (bản research) và thư mục plan này được copy sang Target (`docs/research/`, `.agents/plans/personal-monorepo-rebuild/`) với mọi ticket `status: done`; bản ở reference giữ nguyên làm lịch sử — **copy xong**, ticket 01–11 đều `status: done`; **hai chỗ cố ý lệch chữ của ô này:** ticket này và `spec.md` là `ready-for-human` chứ không `done` (lý do ngay trên), và `adr/` + `CONTEXT.md` **không** được copy vì chúng đã được *chuyển* về `docs/adr/` và root ở ticket 01 (xem `decisions.md` § "Ghi chú khi copy")
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

## Bằng chứng — Gate trên cây làm việc (2026-09-04, commit `0708b4b`, chạy lại sau lượt `/code-review`)

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

## Bằng chứng — CI (2026-09-04, hai run đầu tiên của repo)

`git push -u origin feat/upgrade` là lần đầu nhánh này ra remote, nên đây cũng là lần đầu workflow chạy thật — ô CI treo từ ticket 01.

**Run #1** (commit `2b89265`): bốn job Gate **xanh** (`check` 38s · `typecheck` 28s · `test` 45s · `build` 44s), job `e2e` **đỏ**. Vì `continue-on-error: true` nên cả run vẫn báo `success` — đúng thứ ticket 07 cảnh báo là sẽ che lỗi, và ở đây nó che thật.

Lỗi chỉ CI mới lộ được, không máy local nào gặp:

```
Error: Unable to locate executable file: unzip.
```

`oven-sh/setup-bun` giải nén archive của Bun bằng cách gọi `unzip`, và image `mcr.microsoft.com/playwright:v1.62.1-noble` **không có** `unzip`. Composite action `setup-workspace` chết ở đó, rồi cả hai step E2E chết tiếp với **exit 127** (`bun: command not found`) — một thông báo chỉ tay vào Bun và đổ lỗi sai chỗ. Bốn job Gate không dính vì chúng chạy trên `ubuntu-latest` trần, vốn có `unzip`.

Sửa: một step `apt-get install -y --no-install-recommends unzip` **trước** `setup-workspace` trong job `e2e`, ghi thành ràng buộc thứ tư trong khối comment của job đó (ba cái trước đều đã từng làm hỏng job này). Nhân tiện gỡ luôn annotation deprecation duy nhất còn lại — `actions/upload-artifact@v5` nhắm Node 20, nâng lên `v7`.

**Run #2** (commit `d964157`): **cả sáu job xanh**, và `check-runs` trả về **0 annotation** — không warning nào, kể cả deprecation.

| Job | Kết quả | Thời gian |
|---|---|---|
| `changes` | success | 6s |
| `check` | success | 41s |
| `typecheck` | success | 15s |
| `test` | success | 26s |
| `build` | success | 39s |
| `e2e` (cả hai Template) | success | 132s |

## Bằng chứng — job `docker` trên CI (2026-09-04, ticket `legacy-migrate/02`)

**Trạng thái: đường chạy đã có, bằng chứng thì chưa.** Đọc mục này như một phiếu còn trống chứ không như một kết quả.

### Đã làm

`.github/workflows/ci.yml` có thêm job `docker`, non-blocking, `needs: changes` và `if: needs.changes.outputs.app == 'true'` — dùng lại đúng output `app` mà job `e2e` đang dùng, vì hai danh sách path sẽ là cùng một regex dưới hai cái tên. Matrix **suy ra** từ đĩa chứ không liệt kê tay:

```bash
find apps -mindepth 2 -maxdepth 2 -name Dockerfile \
  | sed -E 's#^apps/([^/]+)/Dockerfile$#"\1"#' | sort | paste -sd, -
# → "_template_next","_template_vite","storybook"
```

Hệ quả cho các ticket migrate sau: **không phải thêm gì cả.** App nào về `apps/` mang theo Dockerfile của Template là tự có image build ở lần push kế tiếp.

Mỗi job matrix chạy `docker/build-push-action@v7` với `context: .` (gốc repo, bắt buộc — mọi stage `pruner` mở bằng `COPY . .` và runner của `_template_vite` đọc `apps/<app>/nginx.conf` từ **context**), `push: false`, `load: false`, cache `type=gha` scope riêng từng app.

### Một chỗ acceptance criteria của ticket 02 sai tiền đề, đã sửa lại

AC của `legacy-migrate/02` viết "build ARG lấy từ `.env.example` (giá trị dev, không secret)". Đọc lại ba Dockerfile thì **không một ARG nào ánh xạ sang một key của `.env.example`**. Env vào image bằng **copy file**, không bằng ARG:

| Dockerfile | ARG có mặt | `.env` vào bằng |
|---|---|---|
| `_template_vite` | `BUN_VERSION`, `APP_DIRNAME`, `PROJECT`, `NODE_ENV`, `BUILD_ENV=example` | `COPY .env.${BUILD_ENV} .env` |
| `_template_next` | như trên + `NODE_VERSION` | `COPY .env.${BUILD_ENV} .env` |
| `storybook` | `BUN_VERSION`, `APP_DIRNAME`, `PROJECT`, `NODE_ENV` | **không có** — Storybook không đọc `PUBLIC_*` nào |

`BUILD_ENV` mặc định đã là `example`, `.dockerignore` cố ý **không** loại `.env.example` khỏi context, còn `APP_DIRNAME`/`PROJECT` được `bun run gen:app` ghi lại đúng cho từng app lúc clone. Nên job truyền **zero `--build-arg`**, và truyền `BUILD_ENV` cho có sẽ đẻ ra warning "build-args were not consumed" ở image Storybook. Đây là sửa tiền đề, không phải bỏ sót.

### Chưa làm được, và vì sao

Máy chạy lượt này **không có Docker** (`command -v docker` trả rỗng, `/c/Program Files/Docker/Docker/resources/bin` không tồn tại) và **không có `gh`**, nên không có cách nào chạy thử một build hay đọc một run. YAML đã được kiểm bằng thứ duy nhất có sẵn offline — `Bun.YAML.parse` của Bun 1.4.0 — xem "Cách đã kiểm YAML" dưới. Đó là kiểm **cú pháp**, không phải kiểm schema của GitHub Actions: nó không nói gì về việc `docker/setup-buildx-action` và `docker/build-push-action` có đúng tên input hay không. *(Cập nhật 2026-09-04: khoảng trống này đã được lấp — xem ghi chú ngay dưới đoạn "Không kiểm được".)*

### Cách đã kiểm YAML

Trên máy này **không có** `actionlint`, không có `yq`, `python3` chỉ là stub của Microsoft Store, và không có package `yaml`/`js-yaml` nào trong `node_modules`. Thứ duy nhất còn lại là `Bun.YAML.parse` của Bun 1.4.0:

```bash
bun -e 'const d = Bun.YAML.parse(await Bun.file(".github/workflows/ci.yml").text());
        console.log(Object.keys(d.jobs).join(", "))'
# → check, typecheck, test, build, changes, e2e, docker
```

Đã kiểm được, tự động: file parse sạch; bảy job đúng tên (con số đo lúc đó — session npm-publish chạy song song sau đó thêm `changeset-status` và `publish-smoke`, nên chạy lại bây giờ đếm chín; không job nào của lượt này bị đụng); mọi cạnh `needs` trỏ tới job có thật; `changes` phát cả hai output `app` và `apps`; `docker` có `continue-on-error: true`, `fail-fast: false` và `matrix.app` là `${{ fromJSON(needs.changes.outputs.apps) }}`; 20 biểu thức `${{ … }}` đều đóng cân; ba step của `docker` đúng shape. Đoạn shell sinh matrix cũng được chạy **thật** trên cây làm việc và output của nó parse ra một mảng JSON ba phần tử, mỗi phần tử ứng với một `apps/<app>/Dockerfile` có thật.

**Không** kiểm được: schema của GitHub Actions nói chung, cú pháp biểu thức theo đúng nghĩa Actions, và tất nhiên là bản thân lượt build.

**Đã lấp một phần (2026-09-04).** `action.yml` của hai action được tải thẳng từ `raw.githubusercontent.com` (HTTP 200 cả hai): `docker/setup-buildx-action@v4` và `docker/build-push-action@v7` **có tồn tại**, cả sáu input đang dùng (`context`, `file`, `push`, `load`, `cache-from`, `cache-to`) đều có mặt trên v7, và cả hai khai `runs.using: node24` — trong khi `v3`/`v6` khai `node20`, thứ mà runner dán một deprecation annotation lên **mỗi** leg matrix. Vì vậy hai pin đã nâng lên `@v4`/`@v7`, đúng lý do `actions/upload-artifact` được nâng lên `v7` ở lượt này. Đó là thứ giữ cho câu "0 annotation" ở trên không thành sai ngay ở lần push đầu tiên có job `docker`. Một lưu ý của `Bun.YAML`: nó giữ `on:` làm key chuỗi thay vì ép sang boolean `true` như YAML 1.1 — không ảnh hưởng gì ở đây, nhưng đừng dựa vào nó để so sánh với output của một parser khác.

### Điều kiện chính xác để lật ticket này sang `done`

Ô `docker build` (ô 5) tick, và frontmatter đổi `ready-for-human` → `done`, **khi và chỉ khi** cả bốn điều dưới đây đúng và được ghi lại ngay tại đây:

1. Nhánh đã push, workflow đã chạy trên commit chứa job `docker`.
2. Cả ba job matrix — `docker (_template_next)`, `docker (_template_vite)`, `docker (storybook)` — báo **success**. Nhớ: `continue-on-error: true` làm cả workflow báo `success` kể cả khi ba job này đỏ, nên phải mở từng job chứ không nhìn dấu tick của run.
3. URL run được dán vào đây thay cho dòng dưới:

   > **Run URL:** _(chưa có — điền `https://github.com/<owner>/<repo>/actions/runs/<id>` sau lượt push đầu tiên)_
   >
   > | Job matrix | Kết quả | Thời gian |
   > |---|---|---|
   > | `docker (_template_next)` | _(chưa chạy)_ | — |
   > | `docker (_template_vite)` | _(chưa chạy)_ | — |
   > | `docker (storybook)` | _(chưa chạy)_ | — |

4. Ô 6 (hai kiểm container) đã được xử lý — hoặc chứng minh, hoặc chuyển sang một ticket có tên. Job này **không** chứng minh nó: xem "Còn treo".

Nếu một image đỏ: sửa Dockerfile đó, ghi nguyên nhân vào đây và vào `legacy-migrate/02` § Notes — đó chính là việc ô này chờ từ đầu. Một ứng viên đã biết trước: `apps/_template_next/Dockerfile:1` ghim `ARG BUN_VERSION=1` (tag trôi) trong khi hai file kia ghim `1.4.0`, nên một bản Bun mới có thể làm đúng một image đỏ mà hai image kia xanh.

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

> **Ba khoản dưới đây đã được giao cho [ticket 13](./13-khoan-treo-cua-07-08.md).** Ticket 07 viết bản sửa port "thuộc ticket này", ticket 08 viết bản sửa `next start`/standalone "thuộc ticket này" — nhưng cả hai đã `status: done`, và ticket 12 chỉ liệt kê lại chứ không nhận, nên ba khoản đó có một lúc không ticket nào sở hữu. Ticket 13 nhận cả ba (cộng `<html lang>`), `status: ready-for-agent`. Phần mô tả bên dưới giữ nguyên làm bối cảnh của lượt này.

- **Ba ô `docker build` — đã có đường chạy (cập nhật 2026-09-04).** Đoạn dưới giữ nguyên làm bối cảnh của lượt gốc; phần "hoặc để job CI dựng image" nay **đã làm**, xem "Bằng chứng — job `docker` trên CI". Còn lại đúng một việc: push và đọc run.

  > **Ba ô `docker build` và hai kiểm container (404 của `_template_vite`, trang SSR của `_template_next`) không chạy được:** máy này **không còn Docker**. `C:\Program Files\Docker` rỗng, `%LOCALAPPDATA%\Programs\DockerDesktop` chỉ còn `tmp-delete`, `Get-Command docker/podman` không trả gì, `wsl -l -v` báo không có distribution nào. Không suy đoán thay: ba Dockerfile đã được đọc và đúng hình (ticket 06/07/08 ghi từng dòng), nhưng "đúng hình" không phải "build được". Cần chạy lại ô này trên một máy có Docker, hoặc để job CI dựng image.

- **Hai kiểm container vẫn treo, và job `docker` không gỡ được chúng.** Job dựng image với `push: false` + `load: false` — nó không bao giờ khởi động một container, nên nó chứng minh "image build được" chứ không chứng minh "container trả 404 cho file không tồn tại" hay "container trả trang SSR". Đó là lý do ô cũ được tách làm hai ô ở đầu ticket: một ô CI đóng được, một ô thì không.

  Hai đường đi tiếp, chọn một và ghi vào ticket nhận:

  1. **Mở rộng job `docker`**: `load: true` cho riêng hai Template (buộc build single-platform), rồi `docker run -d -p` + `curl` — một lượt cho 404 của nginx, một lượt cho HTML SSR của Next. Đắt hơn (phải export mọi layer sang daemon của runner) nhưng khép kín trong CI.
  2. **Chạy tay một lần trên máy có Docker** và dán kết quả vào đây — đúng nghĩa `ready-for-human` của `triage-labels.md`, và cũng là thứ US45 của `spec.md` viết ("bằng tay").

  Chưa chọn trong lượt này vì AC của `legacy-migrate/02` viết thẳng `load: false`, nên đổi sang `load: true` sẽ là làm khác ticket chứ không phải làm đúng nó. Khoản này cần một ticket riêng — nó **chưa** có chủ.

  Có thử đường vòng gần nhất — chạy thẳng `node .next/standalone/apps/_template_next/server.js` (đúng binary image sẽ chạy) sau khi copy `public` + `.next/static` vào — và nó **chết trên Windows** với `EPERM: operation not permitted, stat …\.next\standalone\node_modules\.bun\next@…\node_modules\react`: Node không stat được symlink mà `next build` sinh trong standalone. Đây là giới hạn của Windows, không phải của image (runner là `node:24-alpine`), nên nó cũng không thay thế được lượt Docker.

- **Job `e2e` vẫn `continue-on-error: true`.** Nó đã xanh một lần (run #2) — nhưng run #1 cho thấy đúng cái giá của cờ đó: job đỏ mà cả workflow vẫn báo `success`, và nếu không đi đọc từng job thì không ai biết. Xoá dòng đó biến E2E thành gate thật; nên làm sau vài run nữa để chắc suite không flaky, và đó là một quyết định, không phải một khoản treo kỹ thuật.

- **`next start` với `output: "standalone"`** — khoản treo của ticket 08 vẫn nguyên. Log e2e in `⚠ "next start" does not work with "output: standalone"`, và hệ quả thật vẫn đúng như ticket 08 viết: e2e không kiểm thứ Docker ship. Không sửa trong lượt này vì (a) nó nằm ngoài ô của ticket 12 — warning ở log e2e, không ở log build — và (b) bản sửa cần thêm một bước copy `public` + `.next/static` vào standalone **chạy được trên cả Windows và Linux**, tức là một script chứ không phải một dòng `cp`. Script `start` trong `package.json` dính cùng vấn đề.

- **Đã sửa 2026-09-04 bởi `legacy-migrate/01`** — `_template_vite` khai cặp port ở `apps/_template_vite/ports.env`, `vite.config.ts` và `playwright.config.ts` cùng đọc qua `ports.ts`; e2e đi 3000 → **3100**, và `gen:app` gán cặp trống thấp nhất cho app clone. Văn bản gốc của khoản treo, giữ làm bối cảnh:

  > **Port 3000 ghi cứng ở hai chỗ của `_template_vite`** (`vite.config.ts` `server.port`, `playwright.config.ts` `PORT` + `--port 3000 --strictPort`) — khoản treo của ticket 07, chưa sửa. Generator clone nguyên văn, nên app đầu tiên sinh từ template này va port với chính template.

- **`<html lang>` của `_template_vite` không theo ngôn ngữ** (xem phần kiểm tay ở trên).

- **Không có story Slider dọc** trong `apps/storybook` (xem phần kiểm tay ở trên).

- **Thư mục plan ở reference (`E:\MedViet\frontend\medviet\.agents\plans\personal-monorepo-rebuild\`) và `docs/research/personal-monorepo-rebuild.md` ở reference vẫn untracked và cố ý không commit vào medviet.** Bản chính thức từ nay là bản trong Target. Xoá bản ở reference khi không cần đối chiếu nữa.
