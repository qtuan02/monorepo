# `@monorepo/portfolio`

Site CV cá nhân — một màn hình public, không đăng nhập, không gọi backend. Chạy
Runtime **Next.js 16 App Router**, clone từ `apps/_template_next` bằng
`bun run gen:app` (ticket `legacy-migrate/03`), thay cho app `portfolio` của bản
trước khi dựng lại repo — đã xoá, còn đọc được trong git history.

Lý do nó là Next chứ không phải Vite: toàn bộ giá trị của trang này nằm ở **HTML
đầu tiên**. Nhà tuyển dụng mở link, LinkedIn unfurl thẻ social, Google index —
cả ba đọc byte đầu và không chạy JavaScript của trang. Nội dung CV vì vậy phải
render trên server, và `e2e/server-rendering.e2e.ts` là chỗ chứng minh điều đó.

```bash
bun run dev:portfolio     # http://localhost:3002
```

## Hình dạng app

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Nội dung CV | `src/features/home/` | Một slice. `templates/home.template.tsx` (default-export) xếp 7 section theo thứ tự đọc; `constants/resume.ts` giữ **cấu trúc** (id, thứ tự, logo, tech stack, bullet nào thuộc role nào), còn **mọi chuỗi người đọc thấy** nằm ở `@monorepo/i18n` dưới namespace `portfolio.*`. Hai nửa nối nhau bằng `id`. |
| Chrome | `src/features/layout/` | Dock nổi ở đáy viewport (`components/dock.tsx` + `templates/navbar.template.tsx`) và `provider/theme-provider.tsx` (next-themes). Không có header/footer — một CV không cần. |
| Route module | `src/app/[locale]/(shell)/page.tsx` | Đúng một dòng `return <HomeTemplate />`. Không `generateMetadata` riêng: title/description của root layout đã mô tả chính trang này, thêm một bản nữa chỉ tạo chỗ cho hai bên lệch nhau. |
| Metadata routes | `src/app/{manifest,robots,sitemap}.ts` | Theo convention App Router, nằm **ngoài** `[locale]`. Thay cho `robot.ts` (thiếu chữ `s`, nên Next chưa bao giờ nhận ra) và `sitemap.xml/route.ts` (trỏ vào endpoint không tồn tại) của bản cũ. Vì thế `public/robots.txt` của Template đã bị xoá — một URL chỉ được có một nguồn. |
| `proxy.ts` | `src/proxy.ts` | Chỉ còn `negotiateLocale`. Không route nào bị guard: đây là site public, nên slice `features/auth` + màn `sign-in` + nhóm route `dashboard` của Template bị bỏ hẳn thay vì giữ với danh sách prefix rỗng. Cơ chế guard không mất — nó vẫn nằm trong `apps/_template_next` và quay lại cùng `gen:app` cho app nào thật sự cần. |
| Ảnh | `src/assets/` | Reach bằng **import**, không phải URL string trỏ `public/` — bundler resolve, hash và báo lỗi build khi đổi tên. `public/` chỉ còn `favicon.ico` và `og-image.jpg`, hai file cần URL cố định. |
| Không có | — | `~/libs/`, `~/hooks/api/`, `~/stores/`, TanStack Query, `"use cache"`. Site không gọi API nào; nội dung là hằng số của slice, và `"use cache"` chỉ trả giá trị serializable trong khi cấu trúc CV mang `StaticImageData` cùng component icon. |

## i18n

`/` là tiếng Việt **không prefix**, `/en` có prefix (`localePrefix: "as-needed"`
của `@monorepo/i18n`). Đổi ngôn ngữ là **điều hướng**, không phải mutate một
singleton: `SelectLanguage` gọi `router.replace(pathname, { locale })` với
`usePathname` của next-intl, cái trả path **không** kèm prefix.

Chuỗi của app nằm dưới namespace riêng `portfolio.*` trong
`packages/i18n/src/locales/{vi,en}.json`, viết bằng ICU MessageFormat, để không
đụng namespace dùng chung của Template. Thêm một dòng CV = sửa hai file JSON đó,
cộng `id` trong `src/features/home/constants/resume.ts` nếu là một mục mới.

## Env

Đọc qua Flavor `next` của `@monorepo/env` trong `src/env.ts`. `.env` nằm ở
**root repo** (ADR-0003), nạp bằng `dotenv -e ../../.env --` vì Next chỉ đọc
`.env` nằm trong thư mục app.

| Key | Bắt buộc | Dùng ở |
| --- | --- | --- |
| `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` | **Có** | `metadataBase`, `app/robots.ts`, `app/sitemap.ts` |
| `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN` | Không | `instrumentation.ts`, `instrumentation-client.ts` |

Hai key đều **mang tên app**, và đó là quy ước chứ không phải sở thích: `.env` ở
root là **một** file dùng chung cho mọi app, nên mượn `NEXT_PUBLIC_SENTRY_DSN`
sẽ đẩy lỗi của site này sang project Sentry của Template. Giá trị dùng
chung thì giữ key chung; giá trị của riêng một app thì `NEXT_PUBLIC_<APP>_…`
(Next), `PUBLIC_<APP>_…` (Vite), `<APP>_…` cho secret server.

`NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` cố ý **không** `.optional()`: thiếu nó thì
`next build` đỏ ngay và gọi đúng tên biến, thay vì ship một sitemap toàn URL
tương đối — mà sitemap URL tương đối thì không phải sitemap.

Không có biến server-only: site này không giữ secret nào.

## Port

Khai đúng **một** chỗ: `ports.env`.

| | Port |
| --- | --- |
| Dev (`next dev`) | **3002** |
| E2E (`next start` do Playwright dựng) | **3102** |

Next không có option port ở tầng config, nên `dev`/`start` đưa thẳng `ports.env`
cho dotenv-cli (`PORT` là kênh duy nhất còn lại ngoài cờ `--port`), còn
`playwright.config.ts` import `E2E_PORT` từ `./ports.ts` rồi ép qua
`webServer.env.PORT`. E2E cách dev đúng 100 để một `next dev` bị bỏ quên không
bao giờ trả lời được cho E2E — `reuseExistingServer` sẽ nhận nhầm nó và cả run
vẫn xanh.

## Lệnh

```bash
bun run dev:portfolio                                   # dev server, cổng 3002
bun run build:portfolio                                 # build production

bun run --filter @monorepo/portfolio typecheck          # next typegen && tsc
bun run --filter @monorepo/portfolio test               # Vitest 5 + RTL (jsdom)
bun run --filter @monorepo/portfolio test:coverage      # báo cáo v8, không có ngưỡng

bunx playwright test --project=chromium                 # E2E — chạy TỪ TRONG thư mục app
bun run e2e:headed:portfolio                            # cùng spec, một cửa sổ thật

# Docker chạy TỪ ROOT repo — context phải là root (Dockerfile mở bằng
# `COPY . .` + `bunx turbo prune`); lấy thư mục app làm context sẽ đỏ ở bước prune.
docker build -f apps/portfolio/Dockerfile -t portfolio .
```

Runner copy thêm `.env` (bản `.env.<BUILD_ENV>` mà builder đã dùng) vào cạnh
`server.js`: `NEXT_PUBLIC_*` đã được inline lúc build, nhưng một biến **server**
không tiền tố thì không nằm trong bundle nào — nó phải có mặt trong `process.env`
lúc chạy. Standalone server gọi `loadEnvConfig` trên cwd của nó nên đọc được file
này; dotenv không ghi đè biến đã set, nên `docker run -e KEY=…` vẫn thắng.

Trên Windows gọi E2E bằng `bunx playwright test` với cwd là thư mục app: chạy
runner qua một `bun run` script có thể treo lúc launch Chromium.

## Test

`test/` soi gương đường dẫn dưới `src/`; `e2e/` là hàng xóm của nó, đuôi
`.e2e.ts` để Vitest không bao giờ nhặt phải.

Cái được test là **quyết định**, không phải markup:

- `test/features/home/constants/resume.test.ts` — mối nối giữa cấu trúc CV và
  catalogue. next-intl render một key thiếu thành **chính đường dẫn key**, nên
  một dòng dịch bị rớt sẽ hiện ra màn hình dưới dạng `portfolio.work.…` mà không
  ném ở đâu cả; hai nửa typecheck độc lập và không nửa nào biết nửa kia.
- `test/features/home/components/resume-card.test.tsx` — nhánh duy nhất của một
  hàng CV: có thân thì là accordion header (`<h3>` bọc `<button aria-expanded>`),
  không có thì là một `<a>` thật ra ngoài.
- `test/features/layout/components/theme-toggle-button.test.tsx` — theme kế tiếp,
  hướng wipe, và nhánh trình duyệt không có `startViewTransition`.
- `test/features/layout/constants/navbar.test.ts` — item internal đi qua `ROUTES`
  và **không** tự viết prefix locale; item external là URL tuyệt đối.
- `test/proxy.test.ts` — `config.matcher` phải là literal khớp từng ký tự với
  `I18N_PROXY_MATCHER`. Một regex sai vẫn build xanh và fail-open, nên không có
  gì khác bắt được lỗi này.
- `test/env/env.test.ts` — key bắt buộc thiếu thì ném có tên biến; DSN optional
  vắng thì không.

E2E assert trên **HTML thô** qua fixture `request` (không browser, không
hydration): lời chào, một **bullet mô tả công việc** — heading có thể đến từ
shell, bullet thì chỉ có nếu slice thật sự render trên server — `<title>`,
`lang`, `og:image` tuyệt đối, `robots.txt` / `sitemap.xml` /
`manifest.webmanifest`, 404 trả status thật, và `/en` phục vụ bản tiếng Anh.
Fixture `request` **không** kế thừa `locale` của project, nên các spec đó tự gửi
header `Accept-Language`.

## Deploy Vercel

`vercel.json` trỏ install/build về root repo và gọi script **`build:vercel`**:

```jsonc
"installCommand": "cd ../.. && npx --yes bun@1.4.0 install --frozen-lockfile",
"buildCommand":   "cd ../.. && npx --yes bun@1.4.0 run --filter @monorepo/portfolio build:vercel",
```

Cả hai lệnh gọi bun qua `npx --yes bun@1.4.0` chứ không phải `bun` trần: image
build của Vercel mang bun **của nó** (1.3.14 tại thời điểm viết) và không có cách
nào ghim — `packageManager` chỉ được đọc khi bật `ENABLE_EXPERIMENTAL_COREPACK`,
còn `bunVersion` trong `vercel.json` chọn runtime của Function chứ không phải
builder. Bun đó không đọc nổi `bun.lock` của repo (`lockfileVersion: 2`, do bun
1.4 ghi) và deploy đỏ ngay ở bước install với `UnknownLockfileVersion`. Ghim ở
lệnh là chỗ duy nhất còn lại.

`build:vercel` là `next build` **trần**, không có tiền tố `dotenv -e ../../.env`
như script `build` chuẩn của Template. Lý do: trên Vercel **không có `.env` ở
root** — biến môi trường đến từ Environment Variables trong dashboard của
project và đã nằm sẵn trong `process.env` lúc build, nên tiền tố dotenv ở đó vừa
thừa vừa rủi ro (nó đỏ vì không tìm thấy file).

Nghĩa là dashboard Vercel phải khai **bốn** key cho cả Production lẫn Preview —
không phải chỉ hai key riêng của app ở mục **Env**. Hai key còn lại đến từ
`baseClientSchema` của `@monorepo/env/next/schema`, mà mọi app Next đều kế thừa;
ở local chúng nằm sẵn trong `.env` ở root nên không ai thấy, còn trên Vercel thì
không có file nào để kế thừa:

| Key | Nguồn | Bắt buộc |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | base schema | **Có** |
| `NEXT_PUBLIC_BASE_DOMAIN_API` | base schema | **Có** |
| `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` | app | **Có** |
| `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN` | app | Không |

`NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` phải là **origin thật của deploy** — không
phải `http://localhost:3002` — nếu không sitemap và `og:image` sẽ trỏ về
localhost.

`output: "standalone"` trong `next.config.ts` bị Vercel **bỏ qua** (Vercel dùng
Build Output API riêng), nên nó không cản deploy zero-config; nó ở đó cho runner
Docker `node:24-alpine` + `node server.js`. Điều này còn phải xác nhận trên một
deploy thật trước khi coi ticket là đóng.

## Sentry

Wrap ở `next.config.ts` qua `@monorepo/sentry/next-config` với
`{ org: "sentry", project: "portfolio_v1" }` (kế thừa từ bản cũ); DSN
đọc từ `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN` và truyền vào `initSentryClient`
trong `src/instrumentation-client.ts`, cùng `initSentryForRuntime` trong
`src/instrumentation.ts` — hàm này ở `src/sentry-runtime.config.ts` là chỗ
duy nhất được đọc `process.env.NEXT_RUNTIME` để chọn SDK server hay edge. DSN
rỗng nghĩa là
SDK vẫn cài nhưng tắt — không gọi mạng, không log rác (xem
`packages/sentry/src/options.ts`). Còn phải đối chiếu lại `org` / `project` với
Sentry thật trước khi đóng ticket.
