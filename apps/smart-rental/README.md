# `@monorepo/smart-rental`

Portal quản lý phòng trọ cho chủ nhà — port từ prototype `fe-motel-rsbuild`
(`D:\Personal\smart-rental\frontend`, Rsbuild + shadcn trên Radix, chạy trên dữ liệu
mẫu). Spec [#127](https://github.com/qtuan02/monorepo/issues/127), glossary
[`CONTEXT.md`](./CONTEXT.md) — dùng đúng từ vựng đó (Portal, Mock, Toà nhà, Building
scope, Chỉ số điện nước…).

App chạy Runtime **Vite client SPA** (clone từ `apps/_template_vite` bằng `gen:app`):
mọi màn hình nằm sau đăng nhập, không crawler nào cần đọc, nginx phục vụ một bundle
tĩnh.

```bash
bun run dev:smart-rental     # http://localhost:3006
```

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Port | `ports.env` | Dev **3006**, E2E **3106** — do generator cấp, khai đúng một chỗ; `vite.config.ts` đọc cả hai qua `ports.ts`, `playwright.config.ts` đọc `E2E_PORT`. |
| Env | `src/env.ts` | Flavor `vite` của `@monorepo/env`, `baseEnvSchema` nguyên của Template — pha 1 **không** thêm key riêng. `.env` ở root repo. |
| Router | `src/pages/main.tsx` | `react-router` 8 declarative; `AppRoutes` (cây route) tách khỏi `MainApp` (provider + `BrowserRouter`) để test mount được ở bất kỳ path nào. Mọi path lấy từ `~/constants/routes.ts`. |
| Guard | `src/features/auth/provider/` | `ProtectedRoute` bọc mọi route trong shell, `GuestRoute` bọc `/auth/*` ngoài shell, `/onboarding` ngoài cả hai — đúng cây của prototype. Catch-all 404 **trong** shell, ngoài guard. |
| Session | `src/stores/use-auth-store.ts` | Zustand + `persist` (localStorage) của Template. Đăng nhập là **giả**: form qua được Zod là set một token giả và về `/`; bỏ lớp mã hoá `crypto-js` của prototype (key nằm trong bundle, chỉ là obfuscation) và bỏ `role` (chưa nơi nào enforce). Store giữ thêm `user` (`{ name, email }`) cho nav-user: `signIn(token, user)` / `logout()`. |
| Shell | `src/features/layout/` | Shell Portal của prototype trên primitive `sidebar` / `command` / `popover` / `dropdown-menu`: `templates/layout.template.tsx` (`SidebarProvider` + `SidebarInset`, chỉ cột nội dung cuộn) · `components/sidebar/` (`app-sidebar` 15 mục ba nhóm, `nav-user` đăng xuất) · `components/header/` (`app-header`, `building-selector`, `notification-panel`, `search-dialog` — ⌘K/Ctrl+K mở) · `constants/navigation.ts` (manifest 15 khu vực: path từ `ROUTES`, title/description header đọc, `isNavigationItemActive` khớp theo segment). Header **không** render `<h1>` — heading là của màn hình, seam test assert nó. |
| Building scope | `src/stores/use-building-store.ts` | Zustand + `persist` localStorage thường, key `building`; `selectedBuildingId: string | null`, `null` = mọi Toà nhà. Đọc qua selector hẹp. |
| Dữ liệu | `~/hooks/api` | Pha 1 là **Mock** đứng sau hook TanStack Query (`hooks/api/building.ts` là khuôn: key từ `queryKeysFactory`, `queryFn` trả Mock). Mock nằm ở **`~/constants/mock/<entity>.ts`** chứ không trong slice như spec ghi: `~/hooks/api` phục vụ nó và hook không được import `~/features` (`architecture-circular-dependencies`, CRITICAL — rule thắng spec). `~/libs/http-client.ts` chỉ export `httpClient`, chưa có service class — khi `be-motel` có contract, việc nối là đổi `queryFn`. |
| Runner | `Dockerfile` · `nginx.conf` | Như Template: builder Bun → `nginx:stable-alpine`. |

## Ba khác biệt có chủ ý so với `_template_vite`

Pha 1 là **port**, pha 2 (redesign) là spec riêng đi qua bước design trước grill.
Mọi thứ redesign sẽ viết lại đều hoãn, nên bản clone cố ý bỏ ba thứ — không phải
drift cần "đồng bộ" ngược:

1. **Không i18n.** Đã gỡ `~/libs/i18n.ts`, bridge `~/libs/dayjs.ts`, `select-language`,
   `header-clock`, và `@monorepo/i18n` + `react-i18next` khỏi deps. Mọi copy hardcode
   tiếng Việt như prototype; `@monorepo/dayjs` set locale `vi` **một lần** ở `src/index.tsx`.
2. **Không dark mode.** Light only; theme dùng chung của `@monorepo/tailwind-config`
   không đổi.
3. **Không slice `home`.** `/` là dashboard (`~/features/dashboard`), không có launcher.

## Bảng route

Chép từ `routes` + `routePathBuilders` của prototype, bỏ splat `<segment>/*` (không
route con nào dưới chúng), bỏ manifest `isImplemented`, bỏ mười wrapper `*Route` chỉ
để đọc `useParams` — page đọc params trực tiếp. `SCREAMING_SNAKE` cho path tĩnh,
`camelCase…Path` cho builder.

| Nhóm | Path | Guard |
| --- | --- | --- |
| Guest | `/auth/login` · `/auth/register` | `GuestRoute`, ngoài shell (`AuthLayoutTemplate`) |
| Onboarding | `/onboarding` | không guard |
| Dashboard | `/` | `ProtectedRoute` trong shell |
| Toà nhà | `/buildings` · `/buildings/:buildingId` | — |
| Phòng | `/rooms` · `/rooms/:roomId` | — |
| Người thuê | `/tenants` · `/tenants/create` · `/tenants/:tenantId` | — |
| Hợp đồng | `/contracts` · `/contracts/create` · `/contracts/:contractId` · `…/renew` · `…/liquidation` | — |
| Hoá đơn | `/invoices` · `/invoices/batch` · `/invoices/:invoiceId` | — |
| Chỉ số điện nước | `/utilities` · `/utilities/meter-input` · `/utilities/:utilityId` | — |
| Hoá đơn NCC | `/supplier-bills` · `/supplier-bills/:billId` | — |
| Chi phí | `/expenses` · `/expenses/:expenseId` | — |
| Còn lại | `/reconciliation` · `/tasks` · `/reports` · `/compliance` · `/communications` · `/settings` | — |
| 404 | `*` | trong shell, **ngoài** guard |

Cho tới khi slice tương ứng được port, mỗi route render một **template placeholder**
chỉ có heading của màn hình (và id của route với màn chi tiết).

## Test

- **Seam duy nhất của spec:** `test/pages/main.test.tsx` mount `AppRoutes` trong
  `createMemoryRouter` tại từng path của `ROUTES` (bảng `it.each`, token giả cho route
  guarded) và assert heading; cộng các ca guard — không token → `/auth/login` với
  `replace` (đọc `router.state.historyAction`), có token mở `/auth/*` → `/`,
  `/onboarding` mở được cả hai trạng thái, URL lạ → 404 trong shell. **Mỗi ticket
  domain thêm hàng của mình vào bảng này.**
- Shell, trên cùng seam: 404 có sidebar quanh nó, mục active theo khu vực (`data-active`), đăng xuất từ nav-user → `/auth/login`. `renderAt` bọc `QueryClientProvider` vì selector Toà nhà đọc `~/hooks/api`; `vitest.setup.ts` stub `matchMedia`, `ResizeObserver`, `scrollIntoView` mà jsdom thiếu (sidebar, cmdk).
- Store: `test/stores/use-building-store.test.ts` (persist + `null`). Search dialog: `test/features/layout/components/header/search-dialog.test.tsx`.
- Form: `test/features/auth/components/{sign-in,register}-form.test.tsx`.
- E2E: `e2e/auth.e2e.ts` (guard + form trên bundle thật), `e2e/dashboard.e2e.ts`
  (session sống qua reload, boot không console error), `e2e/shell.e2e.ts` (Building
  scope sống qua reload thật và về `null`, sidebar điều hướng + active, sheet trên
  viewport điện thoại, đăng xuất). Trên Windows chạy
  `bunx playwright test --project=chromium` từ thư mục app.
