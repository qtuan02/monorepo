---
status: done
---

# 09 — Generator `package` / `tooling` / `app` với prompt Runtime

**What to build:** Developer chạy `bun run gen:app`, chọn tên và Runtime (`next` hoặc `vite`), và nhận một app mới trong `apps/` là bản clone của đúng Template app với tên/scope đã thay, Dockerfile ARG đã sửa, root scripts `dev:<app>`/`build:<app>` đã thêm, dependency đã cài và Biome đã format — Gate xanh ngay sau khi sinh. `gen:package` và `gen:tooling` sinh workspace mới đúng shape source-only. Không còn generator `init` hay chữ "Acme".

**Blocked by:** 07 — `_template_vite`; 08 — `_template_next`.

> Chạy từ session ở reference (`E:\MedViet\frontend\medviet`), ghi sang `D:\Personal\monorepo` bằng đường dẫn tuyệt đối, lệnh dùng `--cwd`/`git -C` — xem "Cách chạy ticket" trong `decisions.md`. Không sửa gì ở reference.

**Status:** done (smoke test chạy 2026-09-04 trên nhánh `feat/upgrade`; `turbo/` nay đã commit và ô CI đã chứng minh bằng CI run #2 `d964157` — xem "Còn treo")

- [x] `turbo/generators/config.ts` port từ reference: `libraryGenerator` cho `package`/`tooling` với template `.hbs` (package.json, tsconfig), generator `app` thêm prompt `runtime` (`next` | `vite`). Đúng ba generator `package`/`tooling`/`app`, không còn `init`, `grep -rn 'Acme'` không trả kết quả nào trong `turbo/`. Prompt `list` chạy thật với inquirer bundled trong `@turbo/gen` 2.10.12
- [x] `app` clone `_template_next` hoặc `_template_vite` bằng `cpSync` loại trừ `node_modules`/`dist`/`.next`/`.cache`/`.turbo`, sửa `package.json` name, Dockerfile ARG (`APP_DIRNAME`/`PROJECT`), root scripts theo Runtime, rồi `bun install` + `biome check --write`. Kiểm trên hai app sinh thật: `"name": "@monorepo/smoke-vite"` / `"@monorepo/smoke-next"`, `ARG APP_DIRNAME=smoke-*` + `ARG PROJECT=@monorepo/smoke-*` ở đầu cả hai Dockerfile (các dòng `ARG` khai lại trong stage builder/runner đúng là không bị đụng), và trong `apps/smoke-*` chỉ còn `node_modules` — không `.next`, `.turbo`, `.cache`, `dist`, `test-results`. **Lệch ticket:** `APP_ARTIFACTS` liệt 9 mục chứ không 5, và sinh thêm root script thứ ba `e2e:headed:<app>` — xem "Lệch so với ticket" #1, #2
- [x] Root scripts `gen:package`/`gen:tooling`/`gen:app` gọi binary `gen` trực tiếp (không `bunx turbo gen`), có ghi chú lý do Windows. Ghi chú nằm ở block comment đầu `turbo/generators/config.ts` và ở `CLAUDE.md:82`, không trong `package.json` (JSON không mang được comment mà `bun install` và chính generator vẫn `JSON.parse` được)
- [x] Kiểm: sinh thử một app mỗi Runtime, Gate xanh, `bun run dev:<app>` mở được, rồi xoá cả hai và revert root scripts; ghi kết quả vào ticket — xem "Kết quả smoke test" bên dưới
- [x] Gate xanh local và trên CI — **local xanh** (4/4, exit 0); hai lý do treo cũ đều đã hết: `feat/upgrade` đã lên remote, và `turbo/` đã được commit nên workflow **có** nhìn thấy generator. **CI run #2 (`d964157`) xanh cả sáu job, 0 annotation**: `check` 41s · `typecheck` 15s · `test` 26s · `build` 39s (xem ticket 12 § "Bằng chứng — CI"). Lưu ý phạm vi: run đó chạy Gate trên repo **có** `turbo/generators/`, chứ không chạy chính `gen:app` — không job CI nào sinh app, và `turbo/generators` vẫn không phải workspace nên `turbo run typecheck` vẫn không đụng `config.ts` (xem "Lệch so với ticket" #4)

---

## Kết quả smoke test (2026-09-04)

### Generator chạy được non-interactive

Ticket giả định generator chỉ chạy tương tác. Thực tế plop nhận **bypass args** theo thứ tự prompt, và `@turbo/gen` chuyển tiếp qua `-a`:

```bash
cd /d/Personal/monorepo
./node_modules/.bin/gen run app -a smoke-vite vite
./node_modules/.bin/gen run app -a smoke-next next
```

Cả hai chạy trọn không hỏi gì. Output của lượt `vite` (đã lược màu):

```
>>> Modify "monorepo" using custom generators
bun install v1.4.0 (34cbb9a40)
Checked 585 installs across 809 packages (no changes) [1119.00ms]
Checked 55 files in 18s. Fixed 1 file.
>>> Changes made:
  • Config sanitized (function)
  • apps/smoke-vite cloned from apps/_template_vite (function)
  • apps/smoke-vite/package.json renamed (function)
  • apps/smoke-vite/Dockerfile renamed (function)
  • apps/smoke-vite/Dockerfile renamed (function)
  • \package.json (modify)
  • apps/smoke-vite scaffolded (function)
  • NEXT: apps/smoke-vite still holds apps/_template_vite's ports. …
>>> Success!
```

`bunx biome check --write` bên trong `installAndFormat` resolve đúng binary workspace (2.5.12) — "Fixed 1 file" là root `package.json` mà `JSON.stringify(pkg, null, 2)` vừa ghi lại, không phải một no-op như bẫy `npx biome` 0.3.3.

### Gate với hai app sinh còn nằm trong `apps/`

| Lệnh | Kết quả |
|---|---|
| `bun run check` | `Checked 470 files in 18s. No fixes applied.` (350 → 470 file, đúng phần hai app thêm vào) |
| `bun run typecheck` | `Tasks: 14 successful, 14 total` — `smoke-vite` và `smoke-next` đều cache miss và chạy thật; `smoke-next` qua `next typegen && tsc` |
| `bun run test` | `Tasks: 10 successful, 10 total`; `smoke-vite` 4 file / 11 test, `smoke-next` 6 file / 39 test |
| `bun run build` | `Tasks: 5 successful, 5 total`; `smoke-next` prerender đủ 15 trang tĩnh, route `[locale]`/`dashboard`/`sign-in`/`[...rest]` hiện đúng trong bảng |

### `bun run dev:<app>`

```
$ bun run dev:smoke-vite     →  VITE v8.2.2 ready in 1755 ms, Local: http://localhost:3000/
$ curl -o - -w "%{http_code}" http://localhost:3000/    →  200, <html lang="vi">

$ bun run dev:smoke-next     →  ▲ Next.js 16.3.4 (Turbopack), Ready in 453ms, - Local: http://localhost:3001
$ curl -L http://localhost:3001/                        →  200, <title>Phân hệ · Template Web</title>
```

Hai app chạy **lần lượt**, không song song: clone giữ nguyên port của Template app (xem "Còn treo").

### Guard trùng tên

Chạy lại `gen run app -a smoke-vite vite` khi `apps/smoke-vite` đã tồn tại:

```
>>> Error - Target already exists: cp returned EEXIST (…\apps\smoke-vite\.gitattributes already exists)
>>> Error - Aborted due to previous action failure. Unable to modify to "package.json"
>>> Failed to run "root/app" generator
```

Đúng thứ cần: `cpSync({ errorOnExist: true, force: false })` ném trước khi đụng file nào, plop bật `abortOnFail` nên **mọi** action sau đó bị bỏ — root `package.json` không bị thêm script lần hai (`grep -c smoke-vite package.json` vẫn = 3).

### Dọn sạch

```bash
rm -rf apps/smoke-vite apps/smoke-next
cp <bản snapshot trước smoke test> package.json
bun install     # → "2 packages removed"
```

- `md5sum package.json` khớp bản chụp trước smoke test.
- `md5sum bun.lock` = `a55f4700600d6846928771b7e125a5e4`, **byte-identical** với trước smoke test.
- `git -C /d/Personal/monorepo status --short` trở lại đúng danh sách đầu phiên: `M .env.example .github/workflows/ci.yml biome.json bun.lock package.json tooling/typescript/base.json turbo.json` + `?? .agents/ .dockerignore CLAUDE.md apps/_template_next/ apps/_template_vite/ apps/storybook/ packages/sentry/ turbo/`.

### Gate sau khi dọn (bản ghi chính thức của ticket)

| Lệnh | Exit | Đuôi log |
|---|---|---|
| `bun run check` | 0 | `Checked 350 files in 18s. No fixes applied.` |
| `bun run typecheck` | 0 | `Tasks: 12 successful, 12 total` |
| `bun run test --force` | 0 | `Tasks: 8 successful, 8 total`, `Cached: 0 cached` — 310 test qua |
| `bun run build --force` | 0 | `Tasks: 3 successful, 3 total`, `Cached: 0 cached` |

`--force` ở hai lệnh cuối là cố ý: chạy thường thì Turbo cache hit toàn bộ và "xanh" không chứng minh gì.

---

## Lệch so với ticket (và vì sao)

1. **`APP_ARTIFACTS` có 9 mục, không phải 5.** Ticket liệt `node_modules`/`dist`/`.next`/`.cache`/`.turbo`; code thêm `.vitest`, `coverage`, `test-results`, `playwright-report`. Cả hai Template app **đang có** `test-results` trên đĩa cạnh `.turbo`/`.cache`, nên loại trừ 5 mục là chưa đủ; bốn mục thêm đều nằm trong root `.gitignore` và đều có thể xuất hiện sau một lần chạy test/e2e.

2. **Sinh thêm root script `e2e:headed:<app>`.** Ticket (và user story 33) chỉ nêu `dev:<app>`/`build:<app>`. Nhưng root `package.json` hiện tại khai đủ bộ ba cho cả hai Template app (`dev:template-vite`, `build:template-vite`, `e2e:headed:template-vite`, và tương tự cho next), và cả hai Template app đều có script `e2e:headed` — thiếu dòng thứ ba thì app sinh ra là app duy nhất không gọi được e2e headed theo tên. Bỏ đi rất rẻ nếu muốn đọc ticket theo nghĩa đen.

3. **Ba action `modify` của reference đổi thành custom action `renameInApp`.** Plop resolve mảng action *trước* khi hỏi prompt, nên với hai Template app thì `pattern` không còn là literal được. Quan trọng hơn: plop coi một `pattern` không khớp gì là **thành công**, tức là sẽ trả về một app mà Dockerfile vẫn `ARG PROJECT=@monorepo/_template_vite` — image build ra chính là Template app. `renameInApp` ném lỗi khi không tìm thấy needle, và nhận **một** hàm `line` gọi hai lần (một lần dựng needle từ tên Template, một lần dựng bản thay thế từ tên app mới) nên needle và replacement không thể mô tả hai shape khác nhau.

4. **`turbo/generators` không có `package.json`, nên `turbo run typecheck` không đụng tới `config.ts`.** Giống reference. Biome vẫn lint/format nó (nằm trong `files.includes`), và file được typecheck bằng tay: `tsc -p turbo/generators/tsconfig.json --noEmit` exit 0. Muốn Gate phủ luôn thì phải biến nó thành workspace private — thay đổi lớn hơn ticket này.

5. **Sau review đối kháng, `readRuntime` được viết lại.** Bản đầu lặp lại literal `"next" | "vite"` lần thứ hai bên cạnh `TEMPLATE_APPS`, nên Runtime thứ ba (`_template_reactrouter`, CONTEXT.md đã dự trù) sẽ **compile sạch** rồi trả `null` lúc chạy: action clone trả về một string thay vì ném, còn action sửa root `package.json` chỉ guard theo tên — kết quả là `dev:<app>`/`build:<app>` được ghi cho một app chưa từng được clone, rồi `biome check --write` chạy vào thư mục không tồn tại. Đã gộp `TEMPLATE_APPS` + `RUNTIME_CHOICES` thành một record `RUNTIMES` (`as const satisfies Record<Runtime, RuntimeSpec>` — thiếu hoặc thừa key đều fail compile), thay việc kiểm tra literal bằng type predicate `isRuntime()` đọc chính `RUNTIMES`, và cho action clone **ném** thay vì trả message.

## Còn treo

- **Ô CI đã tick (2026-09-04).** Cả hai lý do treo đều hết: `feat/upgrade` đã push, và `turbo/` đã được commit — nên workflow run đầu tiên đã nhìn thấy generator. Bằng chứng là **CI run #2** (`d964157`): sáu job xanh, **0 annotation**. Không trích **run #1** (`2b89265`), nơi job `e2e` **đỏ** mà `continue-on-error: true` che mất. Chi tiết ở ticket 12 § "Bằng chứng — CI". Cái CI **vẫn chưa** chứng minh: không job nào chạy `gen:app`, nên độ phủ của generator trên CI vẫn là 0 — và `gen` exit 0 kể cả khi generator thất bại (xem khoản cuối mục này) nên script hoá nó trong CI cũng chưa an toàn.

- **Generator không đổi port — đã sửa ở `legacy-migrate` 01 (2026-09-04).** Mỗi app khai cặp port đúng **một** chỗ ở `apps/<app>/ports.env`, `apps/<app>/ports.ts` là reader chung, và generator không còn chỉ *cảnh báo*: `assignPorts()` (`turbo/generators/config.ts:191-219`) ghi lại hai dòng số trong `ports.env` của bản clone từ `nextFreePortPair()` (`config.ts:153-176`) — cặp trống thấp nhất, dev `3000 + n` và e2e `3100 + n`. Trường `RuntimeSpec.portFiles` đã **bị xoá** (`RuntimeSpec` nay chỉ còn `template` và `description`), và action cuối in đúng cặp port app vừa nhận, thay cho dòng `NEXT: … still holds …` cũ. Smoke test của `legacy-migrate` 01 xác nhận: bốn dev server 3000/3001/3002/3003 lên cùng lúc, mỗi cái trả 200 trên đúng port của nó. Văn bản gốc của khoản treo, giữ làm bối cảnh:

  > **Generator không đổi port, và đây là bẫy im lặng.** Clone là `cpSync` nguyên văn nên app mới giữ nguyên port của Template app: `_template_vite` ghi cứng 3000 trong `vite.config.ts` (`server.port`) và trong `playwright.config.ts` (`const PORT = 3000` + `--port 3000 --strictPort`); `_template_next` ghi 3001 trong script `dev`/`start` và 3101 trong `playwright.config.ts`. Va chạm `dev` thì ồn ào, va chạm e2e thì không: cả hai `playwright.config.ts` để `reuseExistingServer: !CI`, và root `"e2e": "turbo run e2e"` fan-out song song — nên spec của app mới chạy vào server của app cũ và **run vẫn xanh**. Đã áp dụng mức tối thiểu: action cuối của generator in dòng `NEXT: apps/<name> still holds apps/<template>'s ports…` kèm đúng tên file theo Runtime (trường `portFiles` trên chính record `RUNTIMES`, nên không lệch được), và `CLAUDE.md` §3 dòng "A whole new app" đã ghi phải cấp port trống. Bản sửa thật — mỗi Template app khai **một** port mà cả dev config lẫn Playwright config cùng đọc — là việc của **ticket 07/08**, không phải một patch trong generator: các literal port đang nằm giữa những comment giải thích chính chúng (`playwright.config.ts` của next viết "Deliberately not the dev port (3001) and not the Vite template's (3000)"), regex thay số sẽ biến comment thành lời nói dối.

- **Job `e2e` trên CI không phủ app sinh ra.** job `e2e` trong `.github/workflows/ci.yml` liệt đích danh hai Template app thành hai step (trích theo tên job vì số dòng đã trôi khi job `docker` được thêm) và upload đúng đường dẫn report của chúng; generator không đụng workflow. Bộ lọc `changes` khớp `^apps/` nên job **vẫn chạy** khi diff chạm app mới — chỉ là chạy hai template, đọc như một độ phủ không có thật. Fix là gọi fan-out (`bun run e2e` + truyền `PLAYWRIGHT_BROWSERS_PATH` qua Turbo) và đổi artifact path sang `apps/*/playwright-report/` + `apps/*/junit.xml`, **nhưng chỉ an toàn sau khi port đã tách** — fan-out song song trên cùng port 3000 còn tệ hơn khoảng trống hiện tại. Thuộc **ticket 01/08**.

- **README và comment không được rewrite.** Ticket chỉ nêu ba chỗ đổi tên (package name + hai Dockerfile ARG) và generator làm đúng ba chỗ đó. Còn sót ở app sinh ra: `apps/<app>/README.md` của bản Next vẫn tự xưng `# @monorepo/_template_next` và hướng dẫn `bun run --filter @monorepo/_template_next …` (4 dòng), và `apps/<app>/test/env.test.ts` của bản Vite có một comment nêu đường dẫn `apps/_template_vite`. Đều là prose, không ảnh hưởng build/lint/test. Thêm `renameInApp` thứ tư cho README là một dòng, nhưng nằm ngoài phạm vi ticket nên để lại đây để quyết.

- **`gen` exit 0 kể cả khi generator thất bại.** Lượt thử trùng tên in `>>> Failed to run "root/app" generator` nhưng process vẫn `EXIT=0`. Nghĩa là không script hoá được `gen:app` trong CI mà dựa vào exit code. Bug của `@turbo/gen`/plop, không phải của `config.ts`; ghi lại để không ai giả định ngược.

- **`next-env.d.ts` cố ý **không** nằm trong `APP_ARTIFACTS`** nên được clone theo. Nó gitignored và được `next typegen` sinh lại (script `typecheck` của app chạy typegen trước `tsc`), và smoke test xác nhận `typecheck` + `build` của `smoke-next` đều xanh — nên nó vô hại như dự đoán.
