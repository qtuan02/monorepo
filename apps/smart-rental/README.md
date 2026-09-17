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
| Shell | `src/features/layout/` | Shell Portal của prototype trên primitive `sidebar` / `command` / `popover` / `dropdown-menu`: `templates/layout.template.tsx` (`SidebarProvider` + `SidebarInset`, chỉ cột nội dung cuộn) · `components/sidebar/` (`app-sidebar` 15 mục ba nhóm, `nav-user` đăng xuất) · `components/header/` (`app-header`, `building-selector`, `notification-panel`, `search-dialog` — ⌘K/Ctrl+K mở) · `constants/navigation.ts` (manifest 15 khu vực: path từ `ROUTES`, title/description header đọc) · `utils/navigation.ts` (`isNavigationItemActive` khớp theo **segment** — `/rooms-x` không phải `/rooms`, chặt hơn `startsWith` của prototype một bậc — và `resolveNavigationItem` cho header). Header **không** render `<h1>` — heading là của màn hình, seam test assert nó. |
| Building scope | `src/stores/use-building-store.ts` | Zustand + `persist` localStorage thường, key `building`; `selectedBuildingId: string | null`, `null` = mọi Toà nhà. Đọc qua selector hẹp. |
| Dữ liệu | `~/hooks/api` | Pha 1 là **Mock** đứng sau hook TanStack Query (`hooks/api/building.ts` là khuôn: key từ `queryKeysFactory`, `queryFn` trả Mock). Mock nằm ở **`~/constants/mock/<entity>.ts`** chứ không trong slice như spec ghi: `~/hooks/api` phục vụ nó và hook không được import `~/features` (`architecture-circular-dependencies`, CRITICAL — rule thắng spec). `~/libs/http-client.ts` chỉ export `httpClient`, chưa có service class — khi `be-motel` có contract, việc nối là đổi `queryFn`. |
| Composite dùng chung | `~/components/<group>/` | Bộ composite mọi slice đứng lên (#133), mỗi cái trên một primitive `@monorepo/ui`. `data-table/data-table.tsx`: tìm kiếm, faceted filter, sort, phân trang + cỡ trang trên **một** instance TanStack từ `useDataTable` của primitive `data-table`; **search/facet/page/size sống trên URL** (`use-table-search-params.ts` qua `useSearchParams`, `replace` history, không `nuqs`), sort và chọn dòng ở trong table; `renderRows` cho một body khác (grid Phòng) trên đúng trang đã lọc. Ô tìm kiếm debounce 300ms qua `@monorepo/hook/use-debounce`; cột facet gắn `filterFn: facetFilterFn`, cột tìm gắn `"includesString"`. `pagination-bar.tsx` là **một** thanh phân trang (gộp hai hệ của prototype); `badge/status-badge.tsx` là **một** badge nhận `StatusConfig` (gộp bốn). Còn `page/` (`list-page-header`, `detail-page-shell` — có `<h1>` sr-only cho seam test), `panel/` (empty/error/loading), `card/` (summary, info + `InfoRow`, entity-list, `stat-item` — cặp `dt`/`dd` mọi màn chi tiết dùng), `dialog/confirm-action-dialog`, `menu/entity-action-menu`, `navigation/page-back-button`. |
| Status config | `~/constants/status.ts` | **Một** nơi cho mọi config trạng thái/hiển thị (tám file của prototype gộp về): `statusTone`, `StatusConfig`, `roomStatusConfig`, `roomTypeConfig`, `toFilterOptions()`. Slice sau thêm config của mình vào đây. |
| Utils | `~/utils/` | `currency.ts` (`Intl` `vi-VN` VND), `date.ts` (`@monorepo/dayjs` + `DATE_FORMAT`), `pagination.ts` (`getTotalPages` ≥ 1, `clampPage` hai phía, `getPageItems`, bảng cỡ trang) — đều có unit test. |
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
| Việc cần làm · Báo cáo · Khai báo lưu trú · Thông báo · Cài đặt | `/tasks` · `/reports` · `/compliance` · `/communications` · `/settings` | — |
| Còn lại | `/reconciliation` | — |
| 404 | `*` | trong shell, **ngoài** guard |

Đã port: **Toà nhà** (`/buildings` grid thẻ + dialog tạo mới trên Zod, `/buildings/:id`)
và **Phòng** (`/rooms` — consumer đầu tiên của `DataTable`, hai view thẻ-theo-tầng/bảng
qua `?view=`, `/rooms/:id` với xoá qua confirm dialog). Hai màn này lọc theo Building
scope: Phòng qua param `buildingId` của `useGetRooms` (như backend sẽ lọc), Toà nhà lọc
tại template trên danh sách không scope mà selector cũng đọc. Ba điểm lệch prototype có chủ
ý: `availableRooms`/`occupancyRate` được **suy ra** khi Mock thiếu (`utils/building-stats.ts`)
thay vì hiện 0; hai bản `roomStatusConfig` khác màu của prototype gộp theo bản badge;
kéo thả hàng, menu ẩn cột và "Ẩn cột" trong header không port. Các nút "Xuất Excel",
"Thêm phòng", "In phòng", "Chỉnh sửa" chưa có flow — giữ như prototype.

**Hoá đơn** (`~/features/invoices`, #139): `/invoices` — bốn thẻ KPI (`SummaryCard`,
consumer đầu tiên) trên `DataTable`, thẻ/bảng qua `?view=`, tìm theo số hoá đơn, facet trạng
thái; `/invoices/:id` — chi tiết với dialog **VietQR** (`components/vietqr-dialog.tsx` trên
primitive `dialog`, mã QR là lưới giả của prototype); `/invoices/batch` — **Đợt hoá đơn**:
`<input type="month">` chọn kỳ (prototype ghi cứng "Tháng 10/2023"), bảng tick Phòng sẽ lập,
Zod `types/batch-invoice-form.ts`, submit là `TODO` nguyên của prototype. Tiền hoá đơn tính ở
`utils/invoice-calculations.ts` (có test). **Chỉ số điện nước** (`~/features/utilities`, code
giữ tên `Utility`/`UtilityType` theo glossary, heading giữ copy "Tiện ích" của prototype):
`/utilities` — ba thẻ KPI trên `DataTable`, facet trạng thái + loại; `/utilities/:id` — chi
tiết kèm xem trước thanh toán giá phẳng (3.500 ₫/kWh, 8.000 ₫/m³ như prototype; bậc thang EVN
là của Cài đặt) và ảnh chứng từ; `/utilities/meter-input` — **nhập chỉ số** nhiều Phòng: mỗi
hàng (`components/meter-input-row.tsx`) `useWatch` đúng hai ô của nó, tiêu thụ = mới − cũ tính
trong render, badge suy ra từ `utils/meter-reading.ts` (`readMeter`: trống → "Chưa nhập", mới ≥
cũ → Nháp, mới < cũ hoặc không phải số → Bất thường — logic thuần, có test), submit là `TODO`
nguyên. Lệch prototype có chủ ý: "Tạo hóa đơn" và "Thêm chỉ số" (hai nút không handler của prototype) dẫn
sang `/invoices/batch` và `/utilities/meter-input`; "Trạng thái" trong khối Thông tin thanh toán
đọc `status` thật thay vì suy từ `paymentDate` (prototype hiện "Đã thanh toán" cho một hoá đơn
`overdue` có ngày thanh toán); `invoice-form.tsx` của prototype không có consumer nên không port;
thẻ Chỉ số bỏ hai icon trạng thái lặp badge (vòng đỏ nhấp nháy khi anomaly, đồng hồ xanh khi verified);
ảnh chứng từ không có fallback SVG — Mock trỏ `/images/meter-*.jpg` không tồn tại nên ảnh vỡ hiện
alt text; hai màn form (batch, meter-input) đọc Mock thẳng làm `defaultValues` chứ không qua hook,
vì form cần data đồng bộ lúc mount — nối BE sẽ gate `isLoading` rồi mới mount form; Mock `utilities.ts` gán `buildingId` (type của prototype khai
mà Mock không set, không có thì Building scope làm rỗng danh sách); tìm kiếm chỉ một cột
(`invoiceNumber`, `roomName`) vì composite tìm một cột; "Xóa" hoá đơn chỉ xác nhận rồi về danh
sách như prototype (không có mutation); các nút "Tải PDF", "Chỉnh sửa", "In hóa đơn", "Xuất
Excel", "Lịch sử chốt", "Xem hồ sơ khách", hai nút xác nhận thanh toán chưa có flow. `MONTH_FORMAT`
(`MM/YYYY`) thêm vào `@monorepo/dayjs/formats` cho kỳ hoá đơn; `~/utils/date.ts` thêm
`formatDateTime`/`formatMonth`.

Đã port (#141) **năm màn đơn**, mỗi màn một route thay placeholder, mỗi entity một Mock trong
`~/constants/mock/` và một hook `~/hooks/api/` (ba repository giả latency của prototype thành Mock
thường — TanStack Query đã có trạng thái loading): **Trung tâm nhiệm vụ** (`/tasks` — ba thẻ đếm
theo loại, lưới thẻ trên `DataTable` với `renderRows`, tìm kiếm trên tiêu đề *và* mô tả, ba facet
priority/status/type trên URL; mỗi việc link tới đúng màn entity qua `taskRelatedPath` →
builder trong `ROUTES`, nhãn hạn qua `formatDueLabel`), **Báo cáo** (`/reports` — ba query song
song thay `Promise.all` của prototype, bốn KPI, tab `?tab=` trên URL, ba Select lọc trong state,
bảng P&L trên primitive `table`, hiệu suất lấp đầy trên `OccupancyBar`; không biểu đồ vì prototype
không có), **Tuân thủ** (`/compliance` — đếm theo trạng thái, hai thẻ theo loại, checklist theo
khách, badge qua `StatusBadge`), **Liên lạc** (`/communications` — tab `?tab=`: mẫu tin theo kênh với
"Gửi ngay" chỉ toast, nhật ký gửi trên `DataTable` với facet kênh/trạng thái và `StatusBadge`,
hai switch tự động tĩnh) và **Cài đặt** (`/settings` — quick link, bốn nhóm read-only trên
`Collapsible`, và **Giá điện bậc thang**: form `useFieldArray` + `Controller` trên schema Zod
`types/electricity-tier-form.ts`, lưu vào Mock qua `useUpdateElectricityTierConfig` — prototype
vẽ form này nhưng chưa mount và không submit). Config hiển thị của task/compliance/send-log/kênh/bậc lấp đầy
gộp vào `~/constants/status.ts` (`domain/*-display-config` + `components/*-ui-config` của
prototype về một chỗ). `OccupancyBar` lên `~/components/progress/` vì Báo cáo là slice thứ hai
dùng nó. Màn nhiều query gate **từng section** qua `~/components/panel/query-section.tsx`
(skeleton / lỗi + Thử lại / dữ liệu), không OR `isLoading` cả màn; tab trên URL qua `~/hooks/use-url-tab.ts`.
Schema bậc thang chỉ chặn `Từ > Đến` trong một bậc — liên tục *giữa* các bậc là rule nghiệp vụ
prototype không có, chờ chủ spec. Các nút "Xuất báo cáo" (toast), "Chọn ngày", "Tạo file CT01", "Thêm yêu cầu",
"Khôi phục mặc định" chưa có flow — giữ như prototype.

Cho tới khi slice tương ứng được port, mỗi route còn lại render một **template placeholder**
chỉ có heading của màn hình (và id của route với màn chi tiết).

## Test

- **Seam duy nhất của spec:** `test/pages/main.test.tsx` mount `AppRoutes` trong
  `createMemoryRouter` tại từng path của `ROUTES` (bảng `it.each`, token giả cho route
  guarded) và assert heading; cộng các ca guard — không token → `/auth/login` với
  `replace` (đọc `router.state.historyAction`), có token mở `/auth/*` → `/`,
  `/onboarding` mở được cả hai trạng thái, URL lạ → 404 trong shell. **Mỗi ticket
  domain thêm hàng của mình vào bảng này.**
- Shell, trên cùng seam: 404 có sidebar quanh nó, mục active theo khu vực (`data-active`), đăng xuất từ nav-user → `/auth/login`. `renderAt` bọc `QueryClientProvider` vì selector Toà nhà đọc `~/hooks/api`; `vitest.setup.ts` stub `matchMedia`, `ResizeObserver`, `scrollIntoView` mà jsdom thiếu (sidebar, cmdk).
- Store: `test/stores/use-building-store.test.ts` (persist + `null`). Search dialog: `test/features/layout/components/header/search-dialog.test.tsx`. Nav: `test/features/layout/utils/navigation.test.ts`.
- Form: `test/features/auth/components/{sign-in,register}-form.test.tsx`; schema tạo Toà nhà `test/features/buildings/types/building-form.test.ts` (trim, message, số nguyên, ngày 1–31).
- Bốn hàng Toà nhà/Phòng của seam test có cột thứ ba — một chuỗi chỉ Mock mới đưa lên màn — nên route nối nhầm placeholder hay Mock ngừng chảy là fail.
- Composite: `test/components/data-table/data-table.test.tsx` mount trong `createMemoryRouter` — đọc page/size/q/facet từ URL, clamp page quá cuối về trang cuối, "Trang sau" ghi `?page=2` với `replace`, gõ tìm kiếm chỉ ghi URL sau debounce và về trang 1, toggle facet + "Xóa bộ lọc", empty panel có nút reset.
- #141: `test/features/tasks/utils/task-due.test.ts` (link entity theo `ROUTES`, nhãn hạn), `test/features/reports/utils/report-filters.test.ts` (bucket lấp đầy, lọc ba chiều), `test/features/settings/types/electricity-tier-form.test.ts` (string → number, «Đến» trống = mở, message, `Từ ≤ Đến`, ≥ 1 bậc, `nextTierFrom`), `test/features/settings/components/electricity-tier-config.test.tsx` (sửa giá → lưu vào Mock; thêm bậc bắt đầu sau «Đến» cuối; hàng sai không vào Mock); năm hàng seam có cột Mock.
- Utils: `test/utils/{currency,date,pagination}.test.ts`; `test/constants/status.test.ts`; `test/features/buildings/utils/building-stats.test.ts`.
- E2E: `e2e/auth.e2e.ts` (guard + form trên bundle thật), `e2e/dashboard.e2e.ts`
  (session sống qua reload, boot không console error), `e2e/shell.e2e.ts` (Building
  scope sống qua reload thật và về `null`, sidebar điều hướng + active, sheet trên
  viewport điện thoại, đăng xuất), `e2e/buildings-rooms.e2e.ts` (filter/facet/page của
  Phòng sống qua reload thật qua URL, bảng + sort, tạo Toà nhà → toast, Building scope
  áp lên danh sách Phòng). Trên Windows chạy
  `bunx playwright test --project=chromium` từ thư mục app.
