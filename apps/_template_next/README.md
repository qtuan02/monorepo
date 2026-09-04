# `@monorepo/_template_next`

Template app cho Runtime **Next.js 16 App Router**. Clone app này khi màn hình
cần SEO/SSR — nội dung phải có trong HTML đầu tiên trước khi JS chạy. App nội bộ
nằm sau login, không cần crawler thì clone `apps/_template_vite`.

```bash
bun run dev:template-next     # http://localhost:3001
```

## Những quyết định đã cắm sẵn

| Thứ | Ở đâu | Vì sao |
| --- | --- | --- |
| `cacheComponents: true` | `next.config.ts` | Route prerender mặc định; thứ gì đọc runtime data (`cookies()`, `searchParams`) phải nằm trong `<Suspense>`, thứ gì cần cache thì `"use cache"`. |
| `reactCompiler: true` | `next.config.ts` | Memo hoá tự động, cần devDep `babel-plugin-react-compiler`. |
| `output: "standalone"` | `next.config.ts` | Runner Docker là `node:24-alpine` + `node server.js`; Vercel vẫn deploy zero-config. |
| `transpilePackages` | `next.config.ts` | Mọi package `@monorepo/*` là source-only TS. Thêm dep nào thì thêm vào danh sách đó cùng lúc. |
| `proxy.ts` (không `middleware.ts`) | `src/proxy.ts` | Next 16 đổi tên file và export; proxy chạy **Node runtime**, không cấu hình về edge được. |
| Guard = hàm thuần | `src/features/auth/guard/session-guard.ts` | Quyết định chặn/không chặn không dính gì tới HTTP, nên test được không cần `NextRequest`. |
| Session = cookie `HttpOnly` | `src/features/auth/actions/sign-in.ts` | Không có auth store, không token trong `localStorage`. |
| Locale = segment `[locale]` | `src/i18n/*` | next-intl + `next/root-params`; đổi ngôn ngữ = điều hướng, giữ nguyên URL. |
| Port | `ports.env` | Dev 3001 và E2E 3101 khai đúng **một** chỗ. Next không có option port ở tầng config, nên `dev`/`start` đưa thẳng file này cho dotenv-cli (`PORT` là kênh duy nhất còn lại ngoài cờ `--port`), còn `playwright.config.ts` import `E2E_PORT` từ `./ports.ts` rồi ép qua `webServer.env.PORT`. `bun run gen:app` gán cho app mới cặp còn trống thấp nhất — dev `3000 + n`, e2e `3100 + n` — và ghi thẳng vào `ports.env` của app đó. Generator **không** viết lại README này (như nó không viết lại H1 ở trên), nên một app clone vẫn mang tên Template và hai con số ở đây — trong app đó, `ports.env` của chính nó là chỗ đúng để đọc. |
| Env | `src/env.ts` | Flavor `next` của `@monorepo/env`; `.env` **ở root repo**, nạp bằng `dotenv -e ./ports.env -e ../../.env --` vì Next chỉ đọc `.env` trong thư mục app. `./ports.env` đứng **trước** là cố ý: dotenv-cli không bao giờ ghi đè biến đã có sẵn, nên file đầu tiên thắng — và một `PORT` đã nằm sẵn trong môi trường (Playwright truyền vào) thắng cả hai. `build` không cần port nên chỉ có `dotenv -e ../../.env --`. |

## Ranh giới dữ liệu

Ranh giới này viết đầy đủ ở `.agents/rules/next-data-fetching.md`:

- Crawler cần đọc → **Server Component + `"use cache"`**
  (`src/features/home/server/home-catalogue.ts`). `generateMetadata` của trang
  public dựng từ đúng dữ liệu đó, nên nó là hàm cache chứ không phải fetch trong
  component.
- Tương tác sau khi paint (lọc, phân trang, mutate) → **TanStack Query**
  (`src/features/dashboard/components/template-list.tsx`).
- Cả hai đi qua **cùng một service singleton** `~/libs/http-client`, nên chỉ có
  một seam để mock. Một giá trị không bao giờ sống ở cả hai nơi.

## Chạy kiểm

```bash
bun run --filter @monorepo/_template_next typecheck   # next typegen && tsc
bun run --filter @monorepo/_template_next test        # Vitest 5 + RTL (jsdom)
bunx playwright test --project=chromium               # từ trong thư mục app

# Docker chạy TỪ ROOT repo — context phải là root (Dockerfile mở bằng
# `COPY . .` + `bunx turbo prune`), thư mục app làm context sẽ đỏ ở bước prune.
docker build -f apps/_template_next/Dockerfile -t template-next .   # builder Bun → runner Node
```

E2E dựng bản production thật rồi chạy **chính script `start` của app**, với
`PORT` do `webServer.env` truyền vào (E2E port khai ở `ports.env`) — không còn
cờ `--port` ở đâu cả. Rồi assert trên **HTML thô** qua fixture `request`: nội
dung SSR + `meta` có mặt trước khi có JS, URL không tồn tại trả 404 thật, route
guarded trả 307 ngay trong response.
