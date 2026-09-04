# `@monorepo/_template_vite`

Template app cho Runtime **Vite client SPA**. Clone app này khi màn hình nằm sau
login và không crawler nào cần đọc — không SSR, không server read, nginx phục vụ
một bundle tĩnh. Màn hình cần nội dung nằm sẵn trong HTML đầu tiên thì clone
`apps/_template_next`.

```bash
bun run dev:template-vite     # http://localhost:3000
```

## Những quyết định đã cắm sẵn

| Thứ | Ở đâu | Vì sao |
| --- | --- | --- |
| Port | `ports.env` | Dev 3000 và E2E 3100 khai đúng **một** chỗ: `vite.config.ts` đọc cả hai qua `ports.ts` (`server.port` và `preview.port`), `playwright.config.ts` đọc `E2E_PORT`. `bun run gen:app` gán cho app mới cặp còn trống thấp nhất — dev `3000 + n`, e2e `3100 + n` — và ghi thẳng vào `ports.env` của app đó. Generator **không** viết lại README này (như nó không viết lại H1 ở trên), nên một app clone vẫn mang tên Template và hai con số ở đây — trong app đó, `ports.env` của chính nó là chỗ đúng để đọc. |
| `strictPort` cả dev lẫn preview | `vite.config.ts` | Mặc định Vite trôi sang port trống kế tiếp, mà port đó chính là dev port của Template Next; va port phải kêu chứ không được im. |
| React Compiler | `vite.config.ts` | `@rolldown/plugin-babel` chạy như một pass Babel riêng **sau** `plugin-react`, vì `plugin-react` đẩy JSX qua oxc và không nhận Babel plugin nữa. |
| Một chunk `vendor` | `vite.config.ts` | React, router, Query, Base UI, i18n đều nạp ở first paint, nên tách nhỏ không dời được byte nào khỏi critical path; vậy nên `chunkSizeWarningLimit` dời lên 800, cách chunk giữ nguyên. |
| Env | `src/env.ts` | Flavor `vite` của `@monorepo/env`; `.env` **ở root repo**, tới qua `envDir: "../../"` + `envPrefix: "PUBLIC_"` nên Runtime này không cần dotenv-cli. Giá trị được bake vào bundle lúc build — đọc thêm cảnh báo ở cuối file. |
| Router | `src/pages/main.tsx` | `react-router` 8 declarative, một package duy nhất — không còn `react-router-dom`; mọi path lấy từ `~/constants/routes.ts`. |
| Guard | `src/features/auth/provider/` | `ProtectedRoute` / `GuestRoute` chặn ở route tree chứ không trong page, và nằm **trong** `LayoutTemplate` để catch-all 404 vẫn tới được khi chưa đăng nhập. |
| Session = store persist | `src/stores/use-auth-store.ts` | Zustand + `persist` (localStorage): token đọc được bằng script và sống qua reload. Đây là chỗ khác `_template_next` nhiều nhất — bên đó session là cookie `HttpOnly` mà `proxy.ts` đọc trước khi render. SPA này chỉ chặn được lúc render, chấp nhận được đúng vì không có gì render phía server. |
| i18n | `src/libs/i18n.ts` | Flavor `i18next` của `@monorepo/i18n`, đọc catalogue ICU dùng chung qua `i18next-icu`: placeholder là `{name}`, không phải `{{name}}`. |
| dayjs | `src/libs/dayjs.ts` | `@monorepo/dayjs` cố ý không phụ thuộc `@monorepo/i18n`, nên app là tầng duy nhất biết cả hai và là chỗ giữ locale của dayjs bám theo ngôn ngữ đang chọn. |
| Runner | `Dockerfile` · `nginx.conf` | Builder Bun → `nginx:stable-alpine`, không Node trong runner; `/assets/` immutable một năm còn `index.html` `no-store`, để deploy mới có hiệu lực ngay lần tải sau. |

## Ranh giới dữ liệu

Runtime này chỉ có **một** đường dữ liệu, và đó chính là lý do nó không dành cho
crawler. Ranh giới viết đầy đủ ở `.agents/rules/architecture-features-modules.md`:

- Mọi lần đọc server state → **TanStack Query** trong `~/hooks/api/<entity>.ts`,
  trên service singleton `templateService` của `~/libs/http-client.ts`. Không có
  server read, không có `"use cache"`, không có gì nằm sẵn trong HTML đầu tiên.
- `~/libs/http-client.ts` là **seam mock duy nhất**. `getAuthToken` và
  `onUnauthorized` đọc store qua `useAuthStore.getState()` **lúc gọi**, không
  phải giá trị bắt sẵn — nhờ vậy `~/libs` vẫn nằm dưới `~/stores` trong đồ thị
  import.
- Mutation hỏng được `MutationCache.onError` trong `~/libs/query-client.ts`
  toast đúng một lần, nên hook và component không tự toast lại.

## Chạy kiểm

```bash
bun run --filter @monorepo/_template_vite typecheck   # tsc --noEmit
bun run --filter @monorepo/_template_vite test        # Vitest 5 + RTL (jsdom)
bunx playwright test --project=chromium               # từ trong thư mục app

# Docker chạy TỪ ROOT repo — context phải là root (Dockerfile mở bằng
# `COPY . .` + `bunx turbo prune`, và còn `COPY apps/${APP_DIRNAME}/nginx.conf`
# lấy thẳng từ context), thư mục app làm context sẽ đỏ ở bước prune.
docker build -f apps/_template_vite/Dockerfile -t template-vite .   # builder Bun → runner nginx
```

E2E dựng bản production thật rồi `vite preview` trên E2E port 3100, nên
`bun run dev` và `bun run e2e` lên cùng lúc được, và thứ được kiểm đúng là cấu
hình `PUBLIC_*` đã bake lúc build. Spec định tuyến qua chính `ROUTES` của app,
assert text tiếng Việt người dùng thấy, và lấy session bằng `signIn(page)` —
`addInitScript` ghi thẳng entry mà `persist` sinh ra, thay vì bấm qua form.

Một cảnh báo thật, ghi lại từ ticket 12 của topic `personal-monorepo-rebuild`:
`bun run build` của Runtime này **không** đỏ khi thiếu `.env`. Vite bake
`import.meta.env.PUBLIC_*` lúc build nhưng `createEnv` chỉ chạy trong browser,
nên thiếu biến cho ra một bundle hỏng chứ không phải một build hỏng — App Next
thì đỏ ngay lúc build. Thứ duy nhất bắt được ở phía build là bước validate tường
minh trong `Dockerfile` (`bun -e "import './src/env.ts';"`), tức là chỉ trên
đường image; nửa còn lại do spec `e2e/home.e2e.ts` bắt, bằng cách assert app boot
không có console error nào.
