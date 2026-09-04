---
status: done
---

# 08 — `_template_next`: app mẫu Next 16 App Router, kèm `@monorepo/sentry`

**What to build:** `bun run dev:template-next` mở app Next 16.3 với route `[locale]` (vi/en qua next-intl, đổi ngôn ngữ giữ URL), một trang public có nội dung SSR và `meta` từ data, một trang guarded qua `proxy.ts` (Node runtime), một section client-side dùng TanStack Query qua service singleton, exception pages, `cacheComponents` + `reactCompiler` bật, env qua Flavor `next` nạp từ `.env` root bằng dotenv-cli, Sentry bật bằng một import từ `@monorepo/sentry`. Vitest 5 test page/route với provider next-intl; Playwright fetch raw HTML thấy nội dung SSR và nhận 404 thật; `docker build` Bun builder → `node:24-alpine` standalone thành công; Vercel vẫn deploy được zero-config.

**Blocked by:** 03 — env; 04 — i18n; 05 — ui.

> Chạy từ session ở reference (`E:\MedViet\frontend\medviet`), ghi sang `D:\Personal\monorepo` bằng đường dẫn tuyệt đối, lệnh dùng `--cwd`/`git -C` — xem "Cách chạy ticket" trong `decisions.md`. Không sửa gì ở reference.

**Status:** done (implement xong từ trước; xác minh lại + sửa một lỗ hổng open redirect 2026-09-04 — Gate 4/4 xanh, Playwright 6/6 xanh; ô CI đã chứng minh bằng CI run #2 `d964157`, ô docker build vẫn treo ở ticket 12 — xem "Còn treo")

- [x] `@monorepo/sentry`: wrapper `@sentry/nextjs` 10.7x (client/server/edge config + `withSentryConfig`), chỉ Flavor Next, source-only — `packages/sentry/src/` có `client.ts`, `server.ts`, `edge.ts`, `options.ts`, `next-config.ts`, `capture-request-error.ts`; `exports: { "./*": "./src/*.ts" }`, `private: true`, không build step; `next` là peerDependency
- [x] `next.config.ts`: `output: "standalone"`, `cacheComponents: true`, `reactCompiler: true`, plugin next-intl, `withSentryConfig`; Turbopack mặc định, không webpack config. Sentry bọc ngoài cùng (`withSentry(withNextIntl(nextConfig))`) để instrument config đã lắp xong; next-intl trỏ đường dẫn tường minh `./src/i18n/request.ts`. Thêm `outputFileTracingRoot` và `transpilePackages` — xem "Lệch so với ticket" #1
- [x] Scripts `dev`/`build`/`start` nạp `.env` root qua `dotenv-cli` 11.x (`dotenv -e ../../.env -- next dev --port 3001`, và tương tự cho `build`/`start` — *hình dạng lúc ticket này đóng; `legacy-migrate` 01 sau đó bỏ cờ `--port` và thêm `-e ./ports.env` cho `dev`/`start`, xem "Còn treo"*); `env.ts` dùng Flavor `next` với `.extend` ví dụ một key `server` — `TEMPLATE_API_TOKEN` trong khối `server`, không mang tiền tố `NEXT_PUBLIC_` nên không lọt vào bundle client
- [x] `proxy.ts` (không `middleware.ts`) gộp next-intl locale detection + guard cookie session cho nhóm route protected; không dùng Edge runtime — `src/proxy.ts` tồn tại, `src/middleware.ts` **không**; file tự ghi rằng proxy chạy trên **Node** runtime và không cấu hình ngược lại được; matcher `"/((?!api|trpc|_next|_vercel|.*\\..*).*)"`
- [x] Cấu trúc thư mục: `app/[locale]/…` route module thin, `features/<feat>/{components,templates,hooks}` giữ tinh thần slice, `components/{exception,page}`, `hooks/api`, `libs/{http-client,query-client,query-key-factory}`; data crawler cần → server component/`use cache`, data tương tác → TanStack Query. Tám route module dưới `app/[locale]/` (root layout, `(shell)` group + layout, `page`, `dashboard`, `sign-in` ngoài `(shell)`, `[...rest]` catch-all, `not-found`, `error`); slice `auth`/`dashboard`/`home`/`layout` với các thư mục Next-only `actions/`, `server/`, `guard/`, `provider/`; ranh giới data đúng như mô tả — `features/home/server/home-catalogue.ts` mang `"use cache"`, `features/dashboard/components/template-list.tsx` là `"use client"` gọi `useGetTemplates`
- [x] `revalidateTag` dùng dạng hai tham số; route song song (nếu có) có `default`; `next/image` theo default mới của 16 — `refresh-home-catalogue.ts:17` là `revalidateTag(HOME_CATALOGUE_TAG, "hours")`; **không có** route song song nào (`find src/app -name '@*' -type d` rỗng) nên khoản `default` không phát sinh; `next/image` dùng ở `header.template.tsx` và `next.config.ts` khai `images.qualities: [75]` theo yêu cầu mới của 16
- [x] Vitest 5 + RTL + jsdom, `test/` soi gương `src/`, `TZ=UTC` pin, setup pin locale `vi` qua provider next-intl; test page public, page guarded (proxy logic tách thành hàm thuần để test), `env.ts`. `bun run test --force` → `Test Files 6 passed (6), Tests 39 passed (39)`. Logic proxy đúng là đã tách thành hàm thuần: `test/proxy.test.ts` đọc `src/proxy.ts` **dưới dạng text** để đối chiếu literal matcher với `I18N_PROXY_MATCHER`, nên một lần sửa matcher mà quên nơi kia là đỏ
- [x] Playwright 1.62.x với `webServer` = `next build` + `next start` port riêng; spec dùng `request` fixture: raw HTML có nội dung SSR + `meta`, URL không tồn tại trả 404, route guarded redirect 302/307 trong response; chạy bằng `bunx playwright test --project=chromium`. Chạy thật 2026-09-04 → **6 passed (11.5s)** trên port 3101: `server-rendering.e2e.ts` (nội dung + `meta` có trước JS; URL lạ trả 404 thật; render 404 bản địa hoá; route guarded redirect ngay trong response; locale `en` phục vụ ở prefix riêng) và `locale-switch.e2e.ts` (đổi ngôn ngữ giữ nguyên trang). **Có một warning của Next trong log** — xem "Còn treo"
- [~] Dockerfile: `oven/bun` builder → `node:24-alpine` runner copy `public`, `.next/standalone`, `.next/static`, user `node`, `CMD node server.js`; `docker build` thành công và container trả trang (kiểm tay, ghi log) — **file đúng hình từng dòng** (`base` → `pruner` `turbo prune` → `builder` `ARG BUILD_ENV=example` + validate env bằng `bun -e "import './src/env.ts';"` → `node:${NODE_VERSION}-alpine` runner; ba `COPY --from=builder --chown=node:node` đúng thứ tự standalone/static/public; `USER node`; `CMD ["node", "server.js"]`), **nhưng chưa có log `docker build` nào được ghi**; chuyển sang ticket 12
- [x] Root scripts `dev:template-next`/`build:template-next`; Biome domain `next` không báo lỗi — cả hai script có; domain khai trong `biome.json` `overrides` scope `apps/_template_next/**` (đã kiểm bằng probe: `<img>` trong app này bật `lint/performance/noImgElement`, cùng file dưới `_template_vite` thì không), và `bun run check` sạch
- [x] Gate xanh local và trên CI; job `e2e` chạy cả hai template — **local xanh** (4/4, exit 0); **job `e2e` có chạy cả hai template** (hai step `bun run --filter @monorepo/_template_vite e2e` và `… @monorepo/_template_next e2e` trong job `e2e` của `.github/workflows/ci.yml` — trích theo tên step vì số dòng đã trôi khi job `docker` được thêm; step thứ hai để `if: always()` nên template thứ hai vẫn chạy khi cái đầu đỏ); và **CI run #2 (`d964157`) chứng minh cả hai nửa**: sáu job xanh, 0 annotation — `check` 41s · `typecheck` 15s · `test` 26s · `build` 39s, `e2e` (cả hai Template) 132s (xem ticket 12 § "Bằng chứng — CI")

---

## Bằng chứng (2026-09-04)

Chạy trên Target sau khi dọn sạch smoke test của ticket 09.

| Lệnh | Exit | Phần liên quan tới app này |
|---|---|---|
| `bun run check` | 0 | `Checked 350 files in 18s. No fixes applied.` |
| `bun run typecheck` | 0 | `next typegen && tsc --noEmit --emitDeclarationOnly false` → `✓ Types generated successfully` |
| `bun run test --force` | 0 | `Test Files 6 passed (6), Tests 39 passed (39)` |
| `bun run build --force` | 0 | `✓ Compiled successfully`, prerender 15 trang; bảng route hiện `[locale]`, `/vi`, `/en`, `dashboard`, `sign-in`, `[...rest]`, `ƒ Proxy (Middleware)` |
| `bunx playwright test --project=chromium` | 0 | `6 passed (11.5s)` |

Chạy `bun run dev:template-next` cũng được kiểm trong smoke test của ticket 09: `▲ Next.js 16.3.4 (Turbopack), Ready in 453ms`, `curl -L http://localhost:3001/` → 200 với `<title>Phân hệ · Template Web</title>`.

## Review đối kháng (2026-09-04) — sửa một lỗ hổng open redirect

Một lượt review đối kháng đã chạy trên toàn bộ diff của Skeleton. Finding nặng nhất của cả lượt nằm ở app này và **đã được sửa**:

**Hàm lọc `redirectTo` của màn sign-in là một open redirect.** `redirectTo` đến từ query string và được chép nguyên vào form sign-in, rồi đưa thẳng cho `redirect()`. Phép kiểm cũ là một prefix check kiểu `startsWith("//")` — chặn được `//evil.example` nhưng **không** chặn `/\evil.example`: spec URL quy định backslash trong URL scheme đặc biệt tương đương `/`, nên mọi trình duyệt resolve header `Location` sinh ra thành `https://evil.example/`. Next nhúng thẳng thứ được đưa cho `redirect()` vào header mà không chuẩn hoá, nên hàm này là thứ duy nhất đứng giữa. Hệ quả: một link `/sign-in?redirectTo=/\evil.example` khiến người dùng gõ mật khẩu trên domain thật rồi đáp xuống domain của kẻ khác.

**Bản sửa** (`src/features/auth/guard/safe-redirect-to.ts`): thôi pattern-match, chuyển sang **parse** — resolve giá trị vào một base không host nào tới được (`http://redirect.invalid`, dùng TLD dành riêng của RFC 2606), đòi `url.origin` quay về đúng base đó, rồi **dựng lại** giá trị trả về từ `pathname` + `search` + `hash` đã parse, nên thứ caller nhận đúng là thứ đã được parse. Bắt trọn cả họ lỗi thay vì từng biến thể.

**Test** (`test/features/auth/guard/safe-redirect-to.test.ts`): 7 case, gồm một case đặt tên thẳng vào bẫy — *"rejects a backslash-authority URL, which a prefix check waves through"* — phủ `/\evil.example`, `/\/evil.example`, `\\evil.example`, cộng URL tuyệt đối, protocol-relative, đường dẫn tương đối, và giá trị không phải string (một `File` upload).

Hai finding nhỏ khác chạm vào app này, đều đã sửa: hai chỗ trỏ đích danh `.agents/rules/patterns-loader-vs-query.md` (một rule cố ý không tồn tại trong Target — xem ticket 10) trong `src/features/home/server/home-catalogue.ts` và `README.md`, nay trỏ `next-data-fetching.md`; và hai comment còn dùng từ vựng "loader-vs-query" cho một cơ chế không Runtime nào của repo này có (`template-list.tsx`, `e2e/server-rendering.e2e.ts`), nay là "server-cache-vs-Query". Một finding bị **bác**: `biome.json` không thiếu domain `next`, nó nằm trong `overrides` (chi tiết ở ticket 10).

## Lệch so với ticket (và vì sao)

1. **`next.config.ts` thêm `outputFileTracingRoot` và `transpilePackages`** — không có trong ticket, cả hai bắt buộc ở monorepo này. `outputFileTracingRoot` khai thẳng workspace root vì Next tự đoán từ lockfile gần nhất, cảnh báo khi đoán mơ hồ trong monorepo, và **cái đoán đó quyết định layout bên trong `.next/standalone`** — tức là quyết định các đường `COPY` của Dockerfile. `transpilePackages` phải liệt đủ 7 package `@monorepo/*` vì decision 3 làm mọi package **source-only** (`exports` trỏ `.ts`/`.tsx`, không dist): Next không compile thứ gì trong `node_modules` trừ khi được nêu tên, và workspace package thì được symlink vào đó — bỏ sót một cái là **parse error ngay lần import đầu**, không phải lỗi resolve.

2. **`sign-in` nằm ngoài route group `(shell)`, và guard là `proxy.ts` chứ không phải wrapper route.** Ticket nói "guard qua `proxy.ts`" nên đây là đúng ý; ghi lại vì nó là chỗ hai Runtime **cố tình** phân kỳ với `_template_vite` (ở đó guard là component route wrapper). Trong SSR, quyết định truy cập phải xảy ra trước khi render bất cứ gì — một wrapper quyết định lúc render thì server đã stream xong trang được bảo vệ rồi. `.agents/rules/next-proxy-guards.md` (ticket 10) viết ra ranh giới này.

## Còn treo

- **`next start` + `output: "standalone"` — Next 16 cảnh báo, và e2e đang chạy sai server.** Log Playwright in:

  ```
  ⚠ "next start" does not work with "output: standalone" configuration.
    Use "node .next/standalone/server.js" instead.
  ```

  Cả 6 spec vẫn xanh (Next hiện vẫn phục vụ được), nhưng hệ quả thật là: **e2e không kiểm thứ mà Docker ship**. Container chạy `node server.js` từ `.next/standalone`; `webServer` của Playwright chạy `next start`. Ticket này tự nêu `next start` nên ô đã tick theo đúng chữ, nhưng nên đổi `webServer.command` sang `next build && node .next/standalone/apps/_template_next/server.js` (đường dẫn phụ thuộc `outputFileTracingRoot`) — vừa hết warning, vừa khiến spec raw-HTML chứng minh đúng binary sẽ chạy trên production. Script `start` trong `package.json` cũng đang là `next start` và dính cùng vấn đề.

- **Build log có warning của Turbo**, và ticket 12 đòi *0 warning trong log build*:

  ```
  WARNING IO error: provided value is too long when setting link name for
  apps/_template_next/.next/node_modules/import-in-the-middle-35b636c439c16d9a
  ```

  Đã truy nguyên: `.next/node_modules/` chứa hai **symlink tuyệt đối** trỏ vào `node_modules/.bun/…` (`import-in-the-middle`, `require-in-the-middle` — dependency OpenTelemetry của `@sentry/nextjs`), và target dài 100 và 118 ký tự, vượt trường `linkname` 100 byte của định dạng tar mà Turbo dùng để ghi cache. Xuất hiện **mỗi lần** `_template_next:build` chạy thật (đã kiểm bằng `--force`; các báo cáo "Gate xanh" trước đây trúng cache hit nên không thấy). Không phải do generator: `apps/smoke-next` cũng có, và app template có trước.

  **Không tự sửa trong lượt này** vì bản sửa nằm ngoài file set của phiên Gate và cần một quyết định thật: thêm `"!.next/node_modules/**"` vào `outputs` của `apps/_template_next/turbo.json` là một dòng và xoá được warning — hai symlink kia là con trỏ vào `node_modules` của chính máy, `next build` sinh lại mỗi lần, và thứ duy nhất tham chiếu chúng là `.next/server/instrumentation.js.nft.json` (manifest trace, chỉ dùng lúc build). Nhưng cần xác nhận một lần rằng bản `.next` khôi phục từ cache mà **thiếu** hai symlink đó vẫn `next start`/`node server.js` được, trước khi chốt. Thuộc **ticket này**; chặn ô "0 warning" của **ticket 12**.

- **Ô docker build** để nguyên chưa tick, chuyển sang **ticket 12**, ticket đó đòi thêm: container `_template_next` phải trả trang SSR.

- **Ô CI đã tick (2026-09-04)** — **CI run #2** (`d964157`) xanh cả sáu job với **0 annotation**. Nó chứng minh **cả hai** nửa của ô: bốn job Gate xanh, và job `e2e` chạy cả hai Template hết 132s. Không trích **run #1** (`2b89265`): bốn job Gate xanh nhưng `e2e` **đỏ** (image Playwright thiếu `unzip`) và bị `continue-on-error: true` che. Chi tiết ở ticket 12 § "Bằng chứng — CI". Lưu ý: `e2e` xanh trên CI **không** đồng nghĩa với việc nó đã thành merge gate (`continue-on-error: true` vẫn còn), và cũng không nói gì về `docker build`.

- **Đã xử lý ở `legacy-migrate` 01 (2026-09-04).** Cặp port của app khai đúng **một** chỗ ở `apps/_template_next/ports.env` (dev 3001, e2e 3101): `dev`/`start` đưa file đó cho dotenv-cli nên `--port` biến mất khỏi mọi script, còn `playwright.config.ts` đọc `E2E_PORT` qua `ports.ts` rồi ép vào `webServer.env.PORT`. Generator ghi cặp trống thấp nhất vào `ports.env` của bản clone. Văn bản gốc của khoản treo, giữ làm bối cảnh:

  > **Port 3001 (dev/start) và 3101 (e2e) ghi cứng**, generator clone nguyên văn — xem "Còn treo" của ticket 09. Bản sửa (một port khai một chỗ, cả hai config cùng đọc) thuộc ticket này.

- **`README.md` của app vẫn là prose của Template app** — hợp lý ở đây, nhưng generator không rewrite nó nên app clone ra cũng tự xưng `@monorepo/_template_next`. Xem "Còn treo" của ticket 09.
