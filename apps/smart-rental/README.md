# `@monorepo/smart-rental`

Portal quản lý phòng trọ cho chủ nhà. Phase 1 (spec [#127](https://github.com/qtuan02/monorepo/issues/127))
port 1:1 prototype `fe-motel-rsbuild` (`D:\Personal\smart-rental\frontend`, Rsbuild + shadcn trên Radix)
chạy trên dữ liệu mẫu. Phase 2 (spec [#153](https://github.com/qtuan02/monorepo/issues/153)) là bản
redesign **"Hôm nay"** — đã ship: Building scope là một hàng tabs, mọi con số/danh sách/trạng thái suy
từ Mock có quan hệ thật, một ngữ pháp màn hình cho cả 15 khu vực. Glossary
[`CONTEXT.md`](./CONTEXT.md) — dùng đúng từ vựng đó (Portal, Mock, Toà nhà, Building scope, Chỉ số
điện nước, Đợt hoá đơn, Việc cần làm…).

App chạy Runtime **Vite client SPA** (clone từ `apps/_template_vite` bằng `gen:app`):
mọi màn hình nằm sau đăng nhập, không crawler nào cần đọc, nginx phục vụ một bundle
tĩnh.

```bash
bun run dev:smart-rental     # http://localhost:3006
```

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Port | `ports.env` | Dev **3006**, E2E **3106** — do generator cấp, khai đúng một chỗ; `vite.config.ts` đọc cả hai qua `ports.ts`, `playwright.config.ts` đọc `E2E_PORT`. |
| Env | `src/env.ts` | Flavor `vite` của `@monorepo/env`, `baseEnvSchema` nguyên của Template — app không thêm key riêng. `.env` ở root repo. |
| Router | `src/pages/main.tsx` | `react-router` 8 declarative; `AppRoutes` (cây route) tách khỏi `MainApp` (provider + `BrowserRouter`) để test mount được ở bất kỳ path nào. Mọi path lấy từ `~/constants/routes.ts`. |
| Guard | `src/features/auth/provider/` | `ProtectedRoute` bọc mọi route trong shell, `GuestRoute` bọc `/auth/login` ngoài shell. Không còn route đăng ký/onboarding — pha 2 bỏ cả hai (spec #153 §10 hàng 56). Catch-all 404 **trong** shell, ngoài guard. |
| Session | `src/stores/use-auth-store.ts` | Zustand + `persist` (localStorage) của Template. Đăng nhập là **giả**: form qua được Zod là set một token giả và về `/`. Store giữ thêm `user` (`{ name, email }`) cho nav-user: `signIn(token, user)` / `logout()`. |
| Building scope | `src/stores/use-building-store.ts` | Zustand + `persist` localStorage, key `building`; `selectedBuildingId: string \| null`, `null` = mọi Toà nhà. Sống ở một hàng tabs dưới header (≤ 6 Toà nhà; từ 7 đổi thành `Select`) chứ không phải bộ lọc bảng — mọi danh sách, KPI và Việc cần làm đọc nó qua selector hẹp. Hai ngoại lệ: Cài đặt (toàn cục) và Báo cáo (`null` = bảng so sánh giữa các Toà nhà thay vì tổng). |
| Shell "Hôm nay" | `src/features/layout/` | `templates/layout.template.tsx` (`SidebarProvider` + `SidebarInset`) · `components/sidebar/` (`app-sidebar` 15 mục ba nhóm, `nav-user` đăng xuất + Cài đặt) · `components/header/` (`app-header`, hàng tabs Building scope, `notification-panel` đọc Việc cần làm, `search-dialog` ⌘K/Ctrl+K) · `components/bottom-nav.tsx` — mobile (`< md`): 5 ô Hôm nay · Phòng · Người thuê · Hoá đơn · Thêm (Thêm mở Sheet 11 khu vực còn lại), header chỉ còn tiêu đề + tìm + chuông, tabs scope thành pill cuộn ngang · `constants/navigation.ts` là manifest 15 khu vực, `utils/navigation.ts` khớp theo **segment**. Header **không** render `<h1>` — heading là của màn hình, seam test assert nó. |
| Dữ liệu | `~/hooks/api` | Mock đứng sau hook TanStack Query, viết theo contract `be-motel` (ADR-0012) — `buildingId` bắt buộc trên mọi entity, một kiểu kỳ `YYYY-MM`, enum khớp `fe-api-integration/*.md`. Mock nằm ở **`~/constants/mock/<entity>.ts`**: `~/hooks/api` phục vụ nó và hook không được import `~/features` (`architecture-circular-dependencies`, CRITICAL). `~/libs/http-client.ts` chỉ export `httpClient`, chưa có service class — khi `be-motel` có contract, việc nối là đổi `queryFn`. Ghi lên Mock in-memory, mất khi reload; Cài đặt có "Khôi phục dữ liệu mẫu" (`useResetMockData`, gọi `resetMock<Entity>` của từng slice qua `trackMockReset`). |
| Trạng thái dẫn xuất | ADR-0012 | Không trạng thái nào lưu tay: `EXPIRING` (Hợp đồng, ≤ 30 ngày), `PARTIAL`/`OVERDUE` (Hoá đơn, từ `dueDate` + Thanh toán), bất thường (Chỉ số, > 2× kỳ trước hoặc giảm), trạng thái hiển thị Người thuê (từ Hợp đồng + cờ quá hạn), Việc cần làm (năm nguồn), Đối soát/Báo cáo/KPI (từ Hoá đơn + Hoá đơn NCC + Chi phí của scope + kỳ) — mỗi phép suy là một hàm thuần trong `~/utils`, có test, gọi từ `queryFn`. |
| Composite dùng chung | `~/components/<group>/` | Bộ composite mọi slice đứng lên (#133, deepened ở pha 2). `data-table/data-table.tsx`: tìm kiếm, faceted filter, sort, phân trang + cỡ trang trên **một** instance TanStack, search/facet/page/size trên **URL**, thanh hành động hàng loạt sticky khi chọn dòng, `renderMobileRow` (mỗi hàng một `Item` trên điện thoại), `ToggleGroup` đổi thẻ/bảng. `card/kpi-strip.tsx` — một dải KPI hai cỡ (desktop liền, mobile cuộn ngang), thay `SummaryCard` cũ. `page/detail-page-shell.tsx` — header entity + tabs thật + cột phải chỉ hành động, `Breadcrumb` ở route ≥ 3 cấp thay nút Quay lại. `form/` — `Sheet` cho form ngắn, `DateField`/`MonthField` (+ `month-picker`), `InputGroup` hậu tố "đ", `Combobox` tự tải, `Attachment`. `menu/entity-action-menu.tsx` — mục không có `link` lẫn `onClick` tự disable; đừng ship một mục vĩnh viễn như vậy. Còn `badge/status-badge.tsx`, `panel/` (empty/error/loading theo footprint), `dialog/confirm-action-dialog`, `queue/task-queue.tsx` (Hôm nay và `/tasks` dùng chung), `chart/revenue-chart.tsx`, `navigation/page-back-button`. |
| Status config | `~/constants/status.ts` | **Một** nơi cho mọi config trạng thái/hiển thị: `statusTone`, `StatusConfig`, và một config theo mỗi entity (Phòng, Hợp đồng, Cọc, Hoá đơn, kênh thanh toán, Chỉ số, Hoá đơn NCC, Việc cần làm, kênh liên lạc…), `toFilterOptions()`. |
| Utils | `~/utils/` | Chỉ hàm thuần, mỗi cái một test: `currency.ts`, `date.ts`, `pagination.ts`, `csv.ts` (`toCsv`, RFC 4180 — dùng cho Xuất CSV Hoá đơn), `vietqr.ts` (link `img.vietqr.io` + cắt `addInfo`), `invoice-payments.ts`, `room-delete.ts`, `task-due.ts`, `report-rows.ts`, `reconciliation-items.ts`, `mock-reset.ts` (`trackMockReset`). |
| Deploy | `vercel.json` · `Dockerfile` · `nginx.conf` | Vercel rewrite `/(.*)` → `/index.html` cho SPA (§ Deploy Vercel); image thì builder Bun → `nginx:stable-alpine` như Template, giữ cho job `docker` của CI. |

## Những gì cố ý không có

Ghi ở đây để không ai đọc nhầm thành thiếu sót cần "hoàn thiện" — mỗi thứ có lý do và **không** phải
drift cần đồng bộ ngược từ `_template_vite` hay từ một app khác:

1. **Không i18n.** Đã gỡ `~/libs/i18n.ts`, bridge `~/libs/dayjs.ts`, `select-language`, `header-clock`,
   và `@monorepo/i18n` + `react-i18next` khỏi deps. Mọi copy hardcode tiếng Việt; `@monorepo/dayjs` set
   locale `vi` **một lần** ở `src/index.tsx`.
2. **Không có công tắc dark mode.** `src/globals.css` viết sẵn đủ token `.dark` (xem § Token/accent
   dưới đây) nhưng không có `ThemeProvider`/toggle nào bật nó — Portal luôn render light.
3. **Không đăng ký, không onboarding.** Pha 2 bỏ cả hai route: đăng nhập giả là toàn bộ bề mặt auth,
   không có màn "chào mừng" không làm gì.
4. **Không nhập tay Task bảo trì.** Việc cần làm ở `/tasks` là màn **đọc**, suy hoàn toàn từ năm nguồn
   dữ liệu (Hoá đơn quá hạn, Hợp đồng sắp hết hạn, Chỉ số bất thường, Thông báo lưu trú chưa gửi, kỳ
   chưa lập Đợt) — không có form tạo việc. Một ticket bảo trì nhập tay chờ `maintenance-service` thật.
5. **Không nối `be-motel`, không service class.** Toàn bộ Portal chạy trên Mock in-memory (ADR-0012);
   nối backend là đổi `queryFn` trong `~/hooks/api`, không đổi gì ở tầng trên.
6. **Không gửi thông báo thật, không xuất PDF/Excel thật.** "Gửi nhắc" chỉ ghi nhật ký; "Xuất" là CSV
   sinh ở client (`~/utils/csv.ts`); in là hộp thoại in của trình duyệt.

## Token/accent (ADR-0011)

Pha 2 override accent ở **tầng app** — [ADR-0011](../../docs/adr/0011-smart-rental-ledger-palette-override.md),
cùng hình dạng `apps/portfolio` (ADR-0008) và `apps/documents` (ADR-0009) đã làm: khối
`:root`/`.dark` **unlayered** trong `src/globals.css`, đứng ngoài mọi `@layer` nên thắng
`theme.css` mà không cần `!important`.

| Token | Giá trị | Ghi chú |
| --- | --- | --- |
| `--primary`, `--ring`, `--sidebar-primary` | `#1E3A5F` | Navy, `colors#105` (Invoice & Billing) — màu hành động duy nhất app này mang |
| `--background` | `#F8FAFC` | Nền |
| `--foreground` | `#0F172A` | Chữ |
| `--muted-foreground` | `#475569` | Chữ phụ |
| `--accent` / `--accent-foreground` | `#EFF6FF` / `#1E3A5F` | Nền hover/chọn |
| `--radius` | `0.375rem` | Bề mặt phẳng, hairline `--border` (hướng "Sổ cái") |

`--success`/`--warning`/`--info`/`--destructive`, `--chart-*` và mọi `--sidebar-*` khác
**giữ nguyên của theme** — một trạng thái không đổi nghĩa giữa các app (điều kiện
ADR-0009 áp cho ADR-0011). `~/constants/status.ts`'s `statusTone` chỉ còn đọc các token
này (`bg-success/10 text-success`, …) — không còn class palette Tailwind thô
(`emerald-*`, `blue-*`, …) cho trạng thái hay icon trong `src/`, kiểm bằng
`test/globals.test.ts`. Chữ là `@fontsource-variable/ibm-plex-sans` (subset
`vietnamese`), import trong `globals.css`.

## Bảng route

`SCREAMING_SNAKE` cho path tĩnh, `camelCase…Path` cho builder. Mọi route dưới đây đã có màn thật —
không còn placeholder.

| Nhóm | Path | Guard |
| --- | --- | --- |
| Guest | `/auth/login` | `GuestRoute`, ngoài shell |
| Hôm nay | `/` | `ProtectedRoute` trong shell |
| Toà nhà | `/buildings` · `/buildings/:buildingId` | — |
| Phòng | `/rooms` · `/rooms/:roomId` | — |
| Người thuê | `/tenants` · `/tenants/:tenantId` | — |
| Hợp đồng | `/contracts` · `/contracts/create` · `/contracts/:contractId` · `…/renew` · `…/liquidation` | — |
| Hoá đơn | `/invoices` · `/invoices/batch` · `/invoices/:invoiceId` | — |
| Chỉ số điện nước | `/utilities` · `/utilities/meter-input` · `/utilities/:utilityId` | — |
| Hoá đơn nhà cung cấp | `/supplier-bills` · `/supplier-bills/:billId` | — |
| Chi phí | `/expenses` · `/expenses/:expenseId` | — |
| Đối soát · Việc cần làm · Báo cáo · Khai báo lưu trú · Thông báo · Cài đặt | `/reconciliation` · `/tasks` · `/reports` · `/compliance` · `/communications` · `/settings` | — |
| 404 | `*` | trong shell, **ngoài** guard |

## Hình dạng pha 2

**"Hôm nay"** (`/`, slice `dashboard`) là màn đầu sau đăng nhập: một KPI strip theo Building scope
(cần thu tháng này, quá hạn, Hợp đồng sắp hết hạn) và hàng đợi Việc cần làm — mỗi việc mang một nút
hành động thật (Gửi nhắc, Gia hạn, Thanh lý, Xem chỉ số, Khai báo, Lập đợt) và biến mất khi xử lý
xong. Hàng đợi này là `~/components/queue/task-queue.tsx`, dùng lại nguyên bởi `/tasks` (bản đọc đầy
đủ, có lọc).

Mỗi slice domain đứng trên đúng một bố cục: **danh sách** = `ListPageHeader` + toolbar tìm/lọc/đổi
thẻ-bảng + `DataTable`; **chi tiết** = `DetailPageShell` (header entity + tabs + cột hành động).
**Hợp đồng** thêm Cọc và vòng đời năm trạng thái, wizard bốn bước tạo mới. **Hoá đơn** có dòng theo
loại, Thanh toán, VietQR thật, và **Đợt hoá đơn** chỉ lập được cho Phòng đã có Chỉ số xác nhận của
kỳ. **Chỉ số điện nước** nhập nhiều Phòng một submit, bất thường (> 2× kỳ trước) chặn xác nhận cho
tới khi duyệt. **Chi phí** + **Hoá đơn nhà cung cấp** + **Đối soát** đứng trên cùng lớp nền, Đối soát
không có Mock riêng — tính thẳng từ hai loại kia. **Báo cáo** theo Building scope: một Toà nhà thì
biểu đồ 6 tháng, `null` thì bảng so sánh. **Thông báo** chỉ còn mẫu + nhật ký gửi (không gửi thật).
**Cài đặt** toàn cục chỉ còn hồ sơ + "Khôi phục dữ liệu mẫu"; cài đặt riêng một Toà nhà (ngày thu,
Bảng giá, Tài khoản nhận tiền) nằm ở tab Cài đặt của chính Toà nhà đó.

Chi tiết từng quyết định — 37 quyết định của vòng grill, cái nào ship đúng, cái nào lệch và vì sao —
nằm ở comment tổng kết trên spec [#153](https://github.com/qtuan02/monorepo/issues/153), không lặp
lại ở đây để khỏi có hai nguồn.

## Deploy Vercel

`vercel.json` chép nguyên mẫu của `apps/documents`, chỉ đổi filter: install/build trỏ về
root repo và gọi bun qua `npx --yes bun@1.4.0` chứ không phải `bun` trần — builder của
Vercel mang bun của nó và không đọc nổi `bun.lock` do bun 1.4 ghi
(`UnknownLockfileVersion`); lý do đầy đủ ở README của `documents` § Deploy Vercel. Rewrite
`/(.*)` → `/index.html` là bắt buộc: không có nó, refresh giữa `/rooms/R-B1-101` 404 ở tầng
hosting chứ không tới được router.

Trên Vercel **không có `.env` ở root** — biến đến từ Environment Variables trong dashboard,
Vite gộp `process.env` khớp tiền tố `PUBLIC_` vào `import.meta.env` lúc build. App
không thêm key riêng, nên dashboard chỉ cần **ba** key của `baseEnvSchema`, cho cả
Production lẫn Preview — `documents` khai **bốn** vì key thứ tư (`PUBLIC_DOCUMENTS_STORYBOOK_URL`)
là của riêng nó (ở local ba key này nằm sẵn trong `.env` root nên không ai thấy):

| Key | Nguồn | Bắt buộc |
| --- | --- | --- |
| `PUBLIC_APP_ENV` | base schema | **Có** — `production` |
| `PUBLIC_BASE_DOMAIN` | base schema | **Có** — URL Vercel của chính app |
| `PUBLIC_BASE_DOMAIN_API` | base schema | **Có** — chưa gọi API thật, đặt tạm cùng URL |

Tạo project Vercel: Root Directory `apps/smart-rental`, framework Vite (đọc từ
`vercel.json`), không cần Build/Install override — hai lệnh đã nằm trong file. Chạy thử
đúng lệnh Vercel sẽ chạy: `npx --yes bun@1.4.0 x turbo run build --filter=@monorepo/smart-rental`
từ root.

Source cũ (`qtuan02/fe-motel-rsbuild`, Rsbuild) được **archive** sau khi URL sống, README
đầu trang trỏ sang `qtuan02/monorepo` `apps/smart-rental`; bản checkout local của nó
không đụng.

## Test

Ba seam, chốt ở spec #153 — một test tốt assert điều người dùng thấy hoặc một phép tính có đầu ra,
không assert cấu trúc component hay hook nào được gọi; không mock gì ngoài store token vì dữ liệu là
Mock hằng số nên render thật.

- **Route tree** (cao nhất): `test/pages/main.test.tsx` mount `AppRoutes` trong `createMemoryRouter`
  tại từng path của `ROUTES` (bảng `it.each`), assert `h1` **và một dữ kiện suy ra** của màn đó (Hôm
  nay hiện việc "Hoá đơn quá hạn"; Hoá đơn hiện badge "Quá hạn n ngày"; Người thuê hiện "Đang thuê") —
  với scope `null` và với một Toà nhà, cộng các ca guard (không token → `/auth/login` với `replace`,
  route bỏ → 404). Mỗi slice domain thêm hàng của mình vào bảng này.
- **Utils thuần**: `test/utils/*.test.ts` — trạng thái Hợp đồng theo ngày, trạng thái Hoá đơn theo
  Thanh toán, bất thường Chỉ số, Việc cần làm từ Mock, Đối soát/KPI theo scope + kỳ, VietQR URL, trần
  giá điện, dòng Hoá đơn từ tiêu thụ × Bảng giá, CSV, `pagination`, `currency`, `date`.
- **Token**: `test/globals.test.ts` (copy `contrast.ts` của `portfolio`) — mỗi cặp nền/chữ của khối
  override đạt AA, `--radius` có đơn vị, `.dark` có đủ token của `:root`.

Component test riêng chỉ cho composite có branch thật (dải KPI hai cỡ, thanh chọn hàng loạt,
`MonthField`, stepper ngang…). E2E theo route + mobile 390px (bottom nav, danh sách thẻ, KPI cuộn) và
theo tabs scope. Trên Windows chạy `bunx playwright test --project=chromium` từ thư mục app. Coverage
đo, không gạt (`bun run test:coverage`, không ngưỡng).
