# `@monorepo/smart-rental`

Portal quản lý phòng trọ cho chủ nhà. Phase 1 (spec [#127](https://github.com/qtuan02/monorepo/issues/127))
port 1:1 prototype `fe-motel-rsbuild` (`D:\Personal\smart-rental\frontend`, Rsbuild + shadcn trên Radix)
chạy trên dữ liệu mẫu. Phase 2 (spec [#153](https://github.com/qtuan02/monorepo/issues/153)) là bản
redesign **"Hôm nay"**: Building scope là một hàng tabs, mọi con số/danh sách/trạng thái suy
từ Mock có quan hệ thật, một ngữ pháp màn hình cho cả 15 khu vực. Round 3 (spec
[#179](https://github.com/qtuan02/monorepo/issues/179)), đã ship — **"dễ hơn"**: chuỗi tháng chốt
chỉ số → lập Đợt hoá đơn → Thu tiền gộp vào một màn Kỳ (`/cycles/:month`), Hôm nay gộp Hoá đơn quá
hạn theo Toà nhà và sắp theo hạn, IA sidebar theo chuỗi việc, wizard Hợp đồng còn 2 bước, Thu tiền
một chạm. Glossary [`CONTEXT.md`](./CONTEXT.md) — dùng đúng từ vựng đó (Portal, Mock, Toà nhà,
Building scope, Kỳ, Ngày thu, Chỉ số điện nước, Việc cần làm…).

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
| Shell "Hôm nay" | `src/features/layout/` | `templates/layout.template.tsx` (`SidebarProvider` + `SidebarInset`) · `components/sidebar/` (`app-sidebar` 14 mục bốn nhóm theo chuỗi việc — Tháng này · Người & phòng · Sổ sách · Hệ thống, `nav-user` đăng xuất + Cài đặt) · `components/header/` (`app-header`, hàng tabs Building scope, `notification-panel` đọc hàng đợi Việc cần làm đã gộp, `search-dialog` Ctrl K/⌘K theo platform) · `components/bottom-nav.tsx` — mobile (`< md`): 4 ô cố định Hôm nay · Phòng · Người thuê · Thu tiền (cùng route `/invoices`, lọc còn phải thu sắp theo hạn) + "Thêm" mở Sheet (hàng tài khoản + Đăng xuất tách riêng + lưới khu vực còn lại), header chỉ còn tiêu đề + tìm + chuông, tabs scope thành pill cuộn ngang · `constants/navigation.ts` là manifest 14 khu vực, `utils/navigation.ts` khớp theo **segment**. Header **không** render `<h1>` — heading là của màn hình, seam test assert nó. |
| Dữ liệu | `~/hooks/api` | Mock đứng sau hook TanStack Query, viết theo contract `be-motel` (ADR-0012) — `buildingId` bắt buộc trên mọi entity, một kiểu kỳ `YYYY-MM`, enum khớp `fe-api-integration/*.md`. Mock nằm ở **`~/constants/mock/<entity>.ts`**: `~/hooks/api` phục vụ nó và hook không được import `~/features` (`architecture-circular-dependencies`, CRITICAL). **World** (ADR-0015 §1) là seam đọc duy nhất — `buildWorld` (`~/utils/world.ts`) là hàm thuần ghép + scope + suy trạng thái mọi mảng Mock theo một Building scope; `readWorld` (`~/libs/mock-world.ts`) bind nó vào Mock sống và là hàm **duy nhất** ngoài `mutationFn` được chạm `~/constants/mock`. Mọi `queryFn` derived đọc qua `readWorld`, không tự ghép mảng. Seam ghi là **invalidate-tất-cả**: một dòng `MutationCache.onSuccess` trong `~/libs/query-client.ts` invalidate mọi query sau mọi mutation thành công — không hook nào tự liệt kê key để invalidate, không hook nào import `*QueryKeys` của hook khác (test quét text `test/hooks/api/world-write-seam.test.ts`). `~/libs/http-client.ts` chỉ export `httpClient`, chưa có service class — khi `be-motel` có contract, việc nối là đổi `readWorld`/`queryFn`. Ghi lên Mock in-memory, mất khi reload; Cài đặt có "Khôi phục dữ liệu mẫu" (`useResetMockData`, gọi `resetMock<Entity>` của từng slice qua `trackMockReset`). |
| Trạng thái dẫn xuất | ADR-0012, ADR-0015 §2 | Không trạng thái nào lưu tay: `EXPIRING` (Hợp đồng, ≤ 30 ngày), `PARTIAL`/`OVERDUE` (Hoá đơn, từ `dueDate` + Thanh toán), bất thường (Chỉ số, > 2× kỳ trước hoặc giảm), trạng thái hiển thị Người thuê (từ Hợp đồng + cờ quá hạn), Việc cần làm (năm nguồn), Đối soát/Báo cáo/KPI (từ Hoá đơn + Hoá đơn NCC + Chi phí của scope + kỳ) — mỗi phép suy là một hàm thuần trong `~/utils`, có test, gọi từ `World`. Ba họ bản sao lưu sẵn không còn trong type/Mock — `Room.tenant`, `Tenant.room/floor/rentAmount/depositAmount/moveInDate/contractEnd`, `Building.totalRooms/activeContracts/availableRooms/occupancyRate` — World tính lại **dưới cùng tên** trên `RoomView`/`TenantView`/`BuildingView` từ Hợp đồng đang có hiệu lực (`ACTIVE`/`EXPIRING`) mỗi lần đọc, nên Thanh lý/Gia hạn/tạo Hợp đồng thấy ngay trên mọi màn hình mà không đổi tên field. Tên trên **chứng từ** (`Invoice`/`Contract.tenant/room/floor`) giữ nguyên — Hoá đơn và Hợp đồng là văn bản, tên lúc lập là đúng nghiệp vụ. |
| Composite dùng chung | `~/components/<group>/` | Bộ composite mọi slice đứng lên (#133, deepened ở pha 2). `data-table/data-table.tsx`: tìm kiếm, faceted filter, sort, phân trang + cỡ trang trên **một** instance TanStack, search/facet/page/size trên **URL**, thanh hành động hàng loạt sticky khi chọn dòng, `renderMobileRow` (mỗi hàng một `Item` trên điện thoại), `ToggleGroup` đổi thẻ/bảng. `card/kpi-strip.tsx` — một dải KPI hai cỡ (desktop liền, mobile cuộn ngang), thay `SummaryCard` cũ. `page/detail-page-shell.tsx` — header entity + tabs thật + cột phải chỉ hành động, `Breadcrumb` ở route ≥ 3 cấp thay nút Quay lại, và nhận `query` + `notFound(id)` + `children(entity)` để tự lo skeleton/"không tìm thấy" — 8 màn chi tiết không còn tự viết hai nhánh đó. `page/relation-tab.tsx` — một tab quan hệ (Hợp đồng của Phòng, Hoá đơn của Người thuê…): lưới thẻ hay `EmptyPanel`, nhận `items` + `children(item)`. `~/hooks/use-delete-entity.ts` — `useDeleteEntity({ mutation, id, label, entity?, successMessage, redirectTo })` gói cả nghi thức xoá (hỏi xác nhận "không thể hoàn tác", mutate → toast → `navigate(redirectTo, { replace: true })`), sáu màn có xoá dùng chung. `form/` — `Sheet` cho form ngắn, `DateField`/`MonthField` (+ `month-picker`), `InputGroup` hậu tố "đ", `Combobox` tự tải, `Attachment`. `menu/entity-action-menu.tsx` — mục không có `link` lẫn `onClick` tự disable; đừng ship một mục vĩnh viễn như vậy. Còn `badge/status-badge.tsx`, `panel/` (empty/error/loading theo footprint), `dialog/confirm-action-dialog`, `queue/task-queue.tsx` (hàng đợi gộp theo loại, sắp theo hạn — Hôm nay và chuông dùng chung, round 3 bỏ `/tasks`), `chart/revenue-chart.tsx` (nay ở slice `reports`), `navigation/page-back-button`. |
| Status config | `~/constants/status.ts` | **Một** nơi cho mọi config trạng thái/hiển thị: `statusTone`, `StatusConfig`, và một config theo mỗi entity (Phòng, Hợp đồng, Cọc, Hoá đơn, kênh thanh toán, Chỉ số, Hoá đơn NCC, Việc cần làm, kênh liên lạc…), `toFilterOptions()`. |
| Utils | `~/utils/` | Chỉ hàm thuần, mỗi cái một test: `world.ts` (`buildWorld`, ADR-0015 §1), `tenant-status.ts` (`toTenantView`/`buildTenantViews`/`findTenantContract`, ADR-0015 §2), `contract-status.ts`, `invoice-status.ts`, `utility-anomaly.ts`, `residence-declaration.ts`, `currency.ts`, `date.ts`, `pagination.ts`, `csv.ts` (`toCsv`, RFC 4180 — dùng cho Xuất CSV Hoá đơn), `vietqr.ts` (link `img.vietqr.io` + cắt `addInfo`), `invoice-payments.ts`, `room-delete.ts`, `task-due.ts`, `task-derivation.ts`, `report-rows.ts`, `reconciliation-items.ts`, `mock-reset.ts` (`trackMockReset`). |
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
4. **Không nhập tay Task bảo trì, không có màn "Việc cần làm" riêng.** Việc cần làm suy hoàn toàn từ
   năm nguồn dữ liệu (Hoá đơn quá hạn, Hợp đồng sắp hết hạn, Chỉ số bất thường, Thông báo lưu trú
   chưa gửi, Kỳ chưa lập Đợt) và sống ở Hôm nay + chuông — `/tasks` không còn tồn tại (404) từ round
   3. Một ticket bảo trì nhập tay chờ `maintenance-service` thật.
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

Round 3 thêm bốn token **chữ** riêng cho badge trạng thái (spec #179 §"Token") — nền `/10`, icon,
viền, chart vẫn đọc token gốc ở trên, bốn token này chỉ đổi lớp *chữ* của `statusTone` để đạt
WCAG AA (≥ 4,5:1) trên nền `/10`, kiểm cùng trong `test/globals.test.ts`:

| Token | Giá trị (light) | Dùng cho |
| --- | --- | --- |
| `--success-foreground-strong` | `#016630` | chữ badge "Đã thu" |
| `--warning-foreground-strong` | `#973c00` | chữ badge "Sắp hết hạn" |
| `--info-foreground-strong` | `#193cb8` | chữ badge thông tin |
| `--destructive-foreground-strong` | `#9f0712` | chữ badge "Quá hạn" |

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
| Hoá đơn | `/invoices` · `/invoices/:invoiceId` | — |
| Kỳ điện nước & hoá đơn (ADR-0013) | `/cycles/:month` | — |
| Chỉ số điện nước | `/utilities` · `/utilities/:utilityId` — không còn sidebar row, vào từ tab Chỉ số của Phòng và từ màn Kỳ | — |
| Hoá đơn nhà cung cấp | `/supplier-bills` · `/supplier-bills/:billId` | — |
| Chi phí | `/expenses` · `/expenses/:expenseId` | — |
| Đối soát · Báo cáo · Khai báo lưu trú · Thông báo · Cài đặt | `/reconciliation` · `/reports` · `/compliance` · `/communications` · `/settings` | — |
| 404 | `*` — bao gồm `/tasks` (đã bỏ ở round 3) | trong shell, **ngoài** guard |

## Hình dạng round 3

**"Hôm nay"** (`/`, slice `dashboard`) vẫn là màn đầu sau đăng nhập, nay là một hàng đợi thật: ba
KPI theo Building scope (còn phải thu tháng này, Hợp đồng sắp hết hạn, tiến độ Chỉ số của Kỳ hiện
tại), rồi hàng đợi Việc cần làm — Hoá đơn quá hạn của cùng một Toà nhà **gộp thành một mục** (tổng
tiền, "Nhắc tất cả" ghi nhật ký thật, mở rộng ra từng Hoá đơn với "Ghi nhận thu"/"VietQR" ngay trên
dòng), mọi loại việc khác giữ một mục một hành động — cả hai sắp chung theo **hạn**, không theo
nguồn. Hai card số "Tháng này" (lấp đầy, đã lập, đã thu, còn phải thu) và "Vừa xong" (3 sự kiện gần
nhất) thay cho donut + biểu đồ cũ, nay chuyển hẳn sang **Báo cáo**. `/tasks` không còn tồn tại
(404) — chuông đọc đúng hàng đợi đã gộp của Hôm nay, không có màn riêng nào khác.

**Kỳ điện nước & hoá đơn** (`/cycles/:month`, slice `cycles`, ADR-0013) là màn gánh cả chuỗi tháng
cho một Toà nhà: một hàng/Phòng — chỉ số cũ (đọc), chỉ số mới điền sẵn từ Nháp đã lưu, tiêu thụ, tiền
phòng (prorate theo ngày ở nếu Hợp đồng bắt đầu giữa Kỳ)/điện/nước/tổng tính tại chỗ theo Bảng giá,
bất thường đánh dấu từng đồng hồ, rồi "Lưu nháp chỉ số" và "Lập *n* hoá đơn". Lập chỉ mở từ ngày
chốt (cuối tháng Kỳ); một Kỳ đã lập hoặc một Kỳ tương lai render read-only, không có action bar.
Thay hẳn hai màn Đợt hoá đơn + Nhập chỉ số cũ — `/utilities` (list + detail) vẫn còn nhưng không
còn nút nhập, chỉ vào từ tab Chỉ số của Phòng hoặc từ chính màn Kỳ.

Mỗi slice domain vẫn đứng trên đúng một bố cục: **danh sách** = `ListPageHeader` + toolbar
tìm/lọc/đổi thẻ-bảng + `DataTable` (mặc định **bảng** trên desktop, dòng gọn `renderMobileRow` dưới
`md`; Phòng giữ lưới theo tầng, và ở Building scope `null` nhóm thêm một lớp theo Toà nhà); **chi
tiết** = `DetailPageShell` (header entity + tabs thật, tab lên URL + cột phải chỉ hiện khi có nội
dung). **Hợp đồng** tạo mới còn **2 bước** (Phòng & Người thuê → Điều khoản & xác nhận, điền sẵn từ
giá Phòng/Toà nhà, tóm tắt sống cột phải); vòng đời là một dải ngang nhỏ trong header thay cột phải
520px. **Thu tiền** điền sẵn số tiền = phần còn lại, "Đã nhận" ngay trong dialog VietQR. **Chi phí**
+ **Hoá đơn nhà cung cấp** + **Đối soát** đứng trên cùng lớp nền, Đối soát không có Mock riêng —
tính thẳng từ hai loại kia. **Báo cáo** theo Building scope: một Toà nhà thì biểu đồ 6 tháng, `null`
thì bảng so sánh. **Khai báo lưu trú**: "Đã gửi" hỏi mã hồ sơ + ngày gửi thật; Đăng ký tạm trú suy
từ hạn, có việc "sắp hết hạn" riêng. **Cài đặt** toàn cục chỉ còn hồ sơ + "Khôi phục dữ liệu mẫu";
cài đặt riêng một Toà nhà (Ngày thu, Bảng giá, Tài khoản nhận tiền) có **một** lối vào — tab Cài đặt
của Toà nhà đó, nút "Chỉnh sửa".

Bốn token chữ badge mới (`--success-foreground-strong`, `--warning-foreground-strong`,
`--info-foreground-strong`, `--destructive-foreground-strong`) đạt AA trên nền `/10` — xem §
Token/accent.

Chi tiết từng quyết định — 24 quyết định của vòng grill round 3, cái nào ship đúng, cái nào lệch và
vì sao — nằm ở comment tổng kết trên spec [#179](https://github.com/qtuan02/monorepo/issues/179);
37 quyết định pha 2 vẫn ở comment trên spec [#153](https://github.com/qtuan02/monorepo/issues/153).
Không lặp lại ở đây để khỏi có hai nguồn.

## Hình dạng spec #227 — deepening trong slice

Bốn ticket độc lập, chạm sâu vào một slice mỗi cái thay vì thêm màn mới:

- **C1 — MeterCell** (`~/features/cycles/components/meter-cell.tsx`, #228): `meterGates(row, type,
  readOnly)` là hàm thuần chung cho bảng **và** thẻ mobile — trước đây hai nơi tự suy gate riêng và
  lệch nhau (thẻ mobile chỉ đòi có `anomalyReason`, bảng đòi cả `anomalyReason` lẫn `status ===
  "ANOMALY"`). `MeterCell` gộp ô chỉ số cũ + input chỉ số mới + nút Duyệt + gate hiển thị thành một
  component, `CycleTableRow`/`CycleMobileCard` chỉ còn đặt hai `MeterCell` (điện, nước) cạnh các ô tiền.
- **C2 — `contractActions` + `TermPicker`** (#229): `contractActions(contract)` trong
  `~/utils/contract-status.ts` thay `isContractLive`/`canDeleteContract` rải rác ở bốn consumer
  (row-actions, chi tiết, Gia hạn, Thanh lý) bằng một object — `canRenew`/`canLiquidate`/`canDelete` +
  một `blockedReason` duy nhất, in nguyên văn ở nơi bị chặn. `TermPicker`
  (`~/features/contracts/components/term-picker.tsx`) dùng chung cho "Tạo hợp đồng" (`mode="fresh"`,
  mặc định 12 tháng) và "Gia hạn" (`mode="extend"`, mặc định 6 tháng), thay hai bản
  preset/`recompute*` từng viết trùng trong hai template.
- **C3 — bảng Task trong `status.ts`** (#230): `taskTypeConfig` (icon + `actionLabel`) chuyển vào
  `~/constants/status.ts` thay cho hai bản cục bộ ở `TaskQueue` và `notification-panel`; bấm một Việc
  "contract_expiring" ở chuông giờ đi thẳng tới Gia hạn (`contractRenewPath`), đúng nơi bấm ở Hôm nay
  đi — trước đây chuông đưa tới chi tiết Hợp đồng, một nơi khác. "bảo trì" bị bỏ khỏi `TaskType` —
  glossary chưa từng có task này.
- **C4 — một encoding ngày: ISO** (#231): Mock chỉ còn lưu ngày `YYYY-MM-DD`/mốc thời gian ISO
  timestamp/kỳ `YYYY-MM` — không còn `DD/MM/YYYY` hay `MM/YYYY` sống trong Mock, `mutationFn`, hay một
  type comment nào. Mọi màn hình hiển thị vẫn `DD/MM/YYYY`/`MM/YYYY` như cũ, nhưng đọc qua
  `formatDate`/`formatMonth`/`formatOptionalDate` (ba hàm còn lại của `~/utils/date.ts`) đúng lúc
  render — không còn `compareDisplayDates` hay `toIsoDate` (hai hàm đảo encoding qua lại đã xoá cùng
  các "already display-formatted" trên type). `Invoice.month` (bản MM/YYYY viết sẵn) cũng xoá —
  màn hình tự `formatMonth(billingMonth)`. `test/constants/mock-integrity.test.tsx` quét mọi field tên
  `*Date`/`*At`/`*Updated`/`month`/`period` trên mọi entity Mock và đỏ ngay khi ai seed một ngày hiển
  thị.

Chi tiết đầy đủ (kể cả những chỗ lệch khỏi kế hoạch ban đầu) nằm ở comment tổng kết trên spec
[#227](https://github.com/qtuan02/monorepo/issues/227); không lặp lại ở đây.

## Hình dạng round 4

Round 4 "gọn hơn" (spec #241, brief `docs/design/smart-rental-round4.md`, 22 quyết định) không đổi
IA/flow/token — chỉ đổi **số thứ trên một màn** và **cỡ của chúng**, cắt theo composite thành 7 ticket
+ một tổng kiểm (#242–#249).

**Shell (T1, #242):** mỗi màn giờ chỉ còn **một** tiêu đề. Từ `md` lên, `AppHeader` bỏ hẳn tên + mô tả
mục sidebar — chỉ còn trigger sidebar · ô tìm ⌘K · chuông · avatar; `h1` của `ListPageHeader` /
`DetailPageShell` là tiêu đề duy nhất. Dưới `md`, header giữ tên mục (nơi duy nhất nó còn hiện), `h1`
của trang thành `sr-only` — vẫn trong DOM cho trình đọc màn hình, không in hai lần. Nút tạo của một màn
danh sách không còn nằm ở một hàng riêng dưới tiêu đề trên điện thoại: nó là một nút navy tròn
icon-only cạnh ô tìm/chuông trên `AppHeader`, tới đó qua **`#header-action-slot`** — một DOM id
`AppHeader` mở, `ListPageHeader` portal `mobileAction` vào
(`~/components/page/header-action-slot.tsx`). Không phải context xuyên `~/features/layout` ↔ một
feature khác: hai bên chỉ cùng import một module ở `~/components`, giữ
[[architecture-circular-dependencies]] nguyên vẹn — `AppHeader` không cần biết feature nào đang mở, và
không feature nào import `~/features/layout`. Dải Toà nhà dưới `md` có một fade mép phải
(`BuildingScope`) làm dấu hiệu còn cuộn được.

**Bốn nấc chữ** (thay bảy cỡ đậm cũ của ba round trước): trang 20/600 · mục 15/600 · thân 14/400 · meta
12/400 — chỉ **tiền** được 600 ngoài "thân". "Trang" và "mục" không khớp thang mặc định của Tailwind
(`text-xl` là 20px, nhưng round 4 cấm chính lớp đó; 15px không có lớp mặc định nào), nên viết bằng giá
trị tuỳ ý `text-[20px]`/`text-[15px]` thay vì `text-2xl`/`text-xl`/`font-bold` — ba lớp cấm đó là dấu
vết còn lại của bảy cỡ cũ, nên một test quét văn bản phân biệt được "nấc mới" khỏi "thang cũ" mà không
cần đọc weight. `test/text-tier-guard.test.ts` quét `src/components/**` + `src/features/**/templates/**`
như văn bản thô, chặn ba lớp trên, và chặn `lucide-react` trong một `*-columns.tsx` (ô bảng không icon
trang trí — round 4 §1.3). T1 mở guard với một allowlist liệt kê mọi file còn vi phạm tại thời điểm mở
(cả hai chiều); mỗi ticket sau đó rút file của mình khi chuyển, và T8 (#249) xoá hẳn allowlist — quét
toàn phạm vi, không ngoại lệ nào còn lại.

**`DataTable` là chủ con số (T2, #243):** toolbar tự in "N `entityLabel`" hoặc, khi có lọc/tìm, "M / N
`entityLabel`" — `h1`/`ListPageHeader` không còn in số đếm riêng (tránh nói hai lần, §1.1). Ô tìm **và**
`PaginationBar` cùng tự ẩn khi `total ≤ pageSize` (12) — Đối soát (3 dòng) hết ô tìm/lật trang mà không
cần rời `DataTable`. Hàng bảng `h-11` (44 px, target chạm HIG), header `h-9`; cột tiền căn phải cả header
lẫn ô. Dưới `md`, toolbar gộp một hàng — ô tìm · nút facet icon-only · một `⋯` gom Xuất CSV và chuyển
Dạng thẻ/Dạng bảng (thay vì mỗi thứ một hàng).

**`DetailPageShell` + `InfoCard` (T3, #244):** `h2` tên thực thể 20/600; cột phải chỉ mở khi màn có ≥ 1
hành động **ngoài** header — không có thì nội dung rộng `max-w-3xl`. Ô "Liên kết" bỏ hẳn ở mọi màn chi
tiết (Phòng, Hợp đồng, …) — link thuộc-về đã nằm ở dòng meta dưới tên. `InfoRow` flex-between (nhãn sát
trái, giá trị sát phải, cách nhau tới 600 px) đổi thành `dl` hai cột `[140px_1fr]` — giá trị đứng ngay
cạnh nhãn. Phòng: "Người thuê hiện tại" (từng là một card riêng cho một dòng) gộp vào một `dt`/`dd` của
"Thông tin phòng"; phòng trống đọc "— (trống)" kèm link "Tạo hợp đồng" khi `contractActions` cho phép.
Hợp đồng: alert "sẽ hết hạn trong N ngày" bỏ — badge tự mang số ngày ("Sắp hết hạn · 11 ngày"), nút "Gia
hạn" đã ở header. `ContractCreate` vào một card `max-w-2xl` (640 px) như mọi form khác.

**`KpiStrip` + thẻ thực thể (T4, #245):** `KpiStrip` xuống `p-3`, số `text-lg font-semibold` (18/600);
mobile lưới 2×2, ô cuối full-width nếu số KPI lẻ. Bỏ hẳn ở danh sách Người thuê (ba số "5 / 5 / 0" là
hằng của Mock, không phải trạng thái). Thẻ Phòng ≈ 96 px — tên + `⋯` một hàng, meta sentence-case một
dòng `truncate` ("Phòng đơn · 22 m² · Nguyễn Văn A"), giá; badge chỉ khi trạng thái **khác** "Đã thuê".
Thẻ Toà nhà bỏ khối ảnh `h-32` (Mock chưa có ảnh thật) — chờ `imageUrl` thật mới thêm avatar 40 px cạnh
tên, chiều cao thẻ không đổi.

**10 file `*-columns.tsx` + `TaskQueue` (T5, #246):** bỏ icon `lucide-react` trong ô (hộp biên lai,
người, nhà, lịch, điện thoại, …) — header cột đã nói đó là gì, mã hoá đơn về `font-mono` không hộp. Tiền
`text-foreground font-semibold tabular-nums text-right`, không còn `text-primary` (navy dành cho hành
động, không phải mọi con số). Tên + phòng gộp một dòng "Nguyễn Văn A · Phòng 102". Hoá đơn: desktop giữ
cột Hạn (sort được), badge tự mang số ngày quá hạn; mobile bỏ cột, chỉ còn badge. `TaskQueue`: hành động
theo dòng ("Nhắc tất cả", "Xem N hoá đơn", "Sửa chỉ số") về `outline`/`ghost` `size="sm"` — không còn
`Button` mặc định (navy đặc) theo dòng.

**Màn Kỳ (T6, #247):** bảng có header hai tầng — "Điện (kWh)"/"Nước (m³)" ở trên, "Cũ · Mới · Dùng" ở
dưới, mỗi giá trị một `td` căn phải thay vì một `flex` riêng mỗi ô (ba số giờ thẳng cột giữa các dòng).
`MeterCell` (#228) vẫn một gate, chỉ đổi **hình**: 3 `td` cho bảng, một khối như cũ cho thẻ mobile. Nhãn
"Điện"/"Nước" lặp trong từng dòng bỏ; ✎ sửa chỉ số cũ chuyển vào `⋯` cuối dòng; bất thường đọc badge
"Điện ×2,2" + nút "Duyệt" `sm` ngay trong ô Trạng thái. Action bar ("Lưu nháp chỉ số" `outline` + "Lập N
hoá đơn" — primary duy nhất của màn) chuyển thành một hàng ngay trên bảng, helper text điều kiện + tiến
độ cùng hàng bên trái.

**Báo cáo + Đối soát (T7, #248):** biểu đồ đổi màu qua `chartConfig` của từng chart sang `var(--primary)`
(navy của app, không đụng `--chart-*` — ADR-0011); nửa donut "Lấp đầy theo tầng" bỏ hẳn, thay bằng cột
một màu kèm nhãn % trực tiếp, sắp giảm dần; "Doanh thu theo tháng" thêm nhãn giá trị. "Xuất báo cáo" lên
hàng `h1`, bộ chọn "Kỳ" vào hàng toolbar của bảng — mỗi thứ không còn chiếm một hàng 50 px riêng. Đối
soát về `Table` thường (Q4/Q5 đã làm `DataTable` đủ gọn cho 3 dòng); badge "Lỗ/Lãi" giữ tone, số tiền +
chênh lệch về màu chữ thường, mũi tên bỏ hẳn.

**Tổng kiểm (T8, #249):** đo lại 14 route ở 1440×900/390×844 (scope null + `b1`), so với đích của brief
§1 — hàng bảng 53→44 px, thẻ Phòng 235→≈96 px, 9→0 icon trang trí trong ô, 6→≤1 nút navy đặc mỗi màn đều
đạt; dòng đầu mobile Phòng ≤ 360 px đạt, nhưng Hoá đơn dừng ở **402 px** (525 px trước round) — `KpiStrip`
(145 px của khối này) là quyết định đã ship của T4, và phần còn lại cần nén `space-y-6`/`space-y-4` dùng
chung bởi 17 template + `DataTable`, vượt phạm vi sửa nhỏ của T8 — theo dõi ở
[#250](https://github.com/qtuan02/monorepo/issues/250). T8 cũng thu nhỏ nút `⋯` (`EntityActionMenu`) từ
`icon-sm` (32 px) xuống `icon-xs` (24 px, vẫn trên sàn WCAG 2.2 AA) — ở `icon-sm`, ô "Trạng thái"/"⋯" đẩy
hàng bảng lên 49 px, vượt đích 44 px của chính T2.

Chi tiết đầy đủ 22 quyết định + việc từng ticket ship (kể cả những chỗ lệch khỏi kế hoạch ban đầu) — comment
tổng kết trên spec [#241](https://github.com/qtuan02/monorepo/issues/241); không lặp lại ở đây.

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
