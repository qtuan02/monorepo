# Design brief — redesign UI/UX `apps/smart-rental` (pha 2 của spec #127)

> **Đã implement, spec #153** (14 ticket #154–#167 merge vào `dev` 2026-09-17 → 2026-09-18; #167 là tổng kiểm + cập nhật tài liệu). Bản ghi *tại thời điểm quyết* của bước design. Grill 2026-09-17 chốt hướng **C với bề mặt A** — §10; ADR-0011, ADR-0012. Tài liệu này giữ nguyên nội dung quyết định, không phải mô tả app hiện tại; hình dạng app sau khi ship đọc ở `apps/smart-rental/README.md` § Hình dạng pha 2 và CLAUDE.md §1, tổng kết 37 quyết định (cái nào ship, cái nào lệch và vì sao) ở comment trên spec [#153](https://github.com/qtuan02/monorepo/issues/153).

- **Ngày:** 2026-09-17
- **Bước:** design, chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`, không `--persist`. Dùng cả `colors.csv`/`typography.csv` vì app **chưa có brand** (theme dùng chung hiện là shadcn neutral mặc định, app chưa override gì — đúng trường hợp §7a `CLAUDE.md`).
- **Đầu vào:** [`docs/research/smart-rental-rebuild.md`](../research/smart-rental-rebuild.md) (2026-09-17, HEAD `ea20143`) — §C.1 27 defect có ảnh, §C.2 audit nhất quán, §C.3 hàng CSV đã trích, §C.4 primitive chưa dùng, §A.8 entity model + bảng enum; `apps/smart-rental/CONTEXT.md` (glossary); `tooling/tailwind/theme.css`; `packages/ui/src/components/*`; ADR-0008/0009 (cách một app override theme).
- **Đầu ra:** tài liệu này + một mockup HTML tĩnh [`smart-rental-redesign/mockup-v1-ba-huong.html`](./smart-rental-redesign/mockup-v1-ba-huong.html) — ba hướng, mỗi hướng ba frame (Tổng quan 1440 · Hoá đơn 1440 · Hoá đơn 390). Tự chứa, không script, không font ngoài.
- **Cách đọc trích dẫn:** `ux#NN`, `shadcn#NN`, `react#NN`, `products#NN`, `ui-reasoning#NN`, `colors#NN`, `typography#NN`, `styles#NN` = hàng `No=NN` trong file cùng tên dưới `.agents/skills/ui-ux-pro-max/data/` (`ux` = `ux-guidelines.csv`, `shadcn`/`react` = `stacks/*.csv`). Grep bằng `^NN,`. Mọi FACT về code trỏ `path:line` trong research note; brief không lặp lại bằng chứng.
- **Giả định nền (CẦN GRILL XÁC NHẬN, §9.1):** mockup vẽ trên **entity model đích** của research §A.8 — tham chiếu bằng id, enum của `fe-api-integration/*.md` (Hợp đồng `DRAFT/ACTIVE/EXPIRING/EXPIRED/TERMINATED` + `deposit_status`; Hoá đơn `DRAFT/UNPAID/PARTIAL/PAID/OVERDUE/CANCELLED`), một kiểu kỳ `YYYY-MM`. Nếu grill giữ Mock rời của pha 1, một nửa §3 (Đối soát/Báo cáo/Việc cần làm suy ra) không vẽ được.

---

## 1. Chẩn đoán — vì sao Portal trông "xấu và nhiều lỗi vặt"

Research §C.1 liệt 27 defect; brief gom thành **tám nguyên nhân**, mỗi cái là một quyết định design phải ra. Tất cả là FACT (ảnh + `path:line` trong research), không cảm tính.

### 1.1 Thẻ KPI sai bố cục và chiếm nửa màn mobile

`SummaryCard` đặt `flex items-center` lên `CardContent` mà primitive đã là `flex flex-col` (C.1 #1) → icon trên, chữ giữa, 130 px cho một con số. Trên 390 px, 3–4 thẻ xếp dọc chiếm 520–700 px trước khi tới bảng (C.1 #2). `ux#19` (Content Jumping — *stable container*), `ux#64` (Mobile First — *core content first*), `ui-reasoning#7` (*"Clarity > aesthetics"*). Quyết định: **một KPI, hai cỡ** — desktop là *dải* liền (không phải 4 card rời), mobile là dải cuộn ngang hoặc 2×2 compact.

### 1.2 Màn chi tiết nói cùng một điều 2–3 lần, theo 3 bố cục khác nhau

Phòng hiện giá thuê ba lần; Hợp đồng hiện ngày bắt đầu/kết thúc ba lần, cột phải bốn card lặp cột trái (C.1 #5–6, #9, #16, #26). Ba bố cục chi tiết cùng tồn tại (C.2). `ux#39` (Heading Hierarchy), `ux#84` (Truncation). Quyết định: **một bố cục chi tiết** — header entity (tên · badge · 3 meta · actions) + tabs, mỗi dữ kiện đúng một chỗ; cột phải chỉ cho *hành động và liên kết*, không cho dữ liệu.

### 1.3 Sáu kiểu header trang, ba toolbar, tám anatomy thẻ, bốn bố cục form

C.2 đếm từ code. Người dùng đi từ `/rooms` sang `/contracts/create` là đổi ngữ pháp màn hình. `ux#3` active state đúng, nhưng `styles#1` (*"clear type hierarchy"*), `products#105` anti-pattern *"Excessive decoration"*. Quyết định: **một** `ListPageHeader`, **một** toolbar (`DataTable`), **một** thẻ thực thể, **một** bố cục form + **một** vị trí submit.

### 1.4 Màu trạng thái viết bằng palette Tailwind thô, không qua token

20+ chỗ `emerald-100`/`blue-600`/`red-50` (research B.3); "Đã thuê" dùng `statusTone.primary` = xám trên theme neutral (C.1 #4); avatar 14 màu ngẫu nhiên (C.1 #15); `CheckCircle2` cho "Nợ cước" (C.1 #15). `ux#37` (Color Only), `ux#36` (Contrast), `colors#102` mood *"status traffic-light (green/amber/red)"*. Quyết định: trạng thái đi qua **`--success/--warning/--info/--destructive` của theme** (giữ nguyên nghĩa giữa các app — ADR-0009), icon đi theo nghĩa, avatar một tone.

### 1.5 Ngày/tháng nhập bằng `<input type="date|month">` theo locale trình duyệt

`mm/dd/yyyy` và "September 2026" trong app đọc `DD/MM/YYYY` (C.1 #10–11). `ux#85` (Date Formatting — locale-aware), `ux#57` (Input Types). Quyết định: `date-picker`/`calendar` của `@monorepo/ui` cho ngày, một `MonthPicker` nhỏ (dựng từ `popover` + lưới 12 ô) cho kỳ.

### 1.6 Lưới Phòng nhóm tầng sau khi phân trang; bảng mobile cắt cột không dấu hiệu

C.1 #3, #10, #12. `ux#71` (Table Handling — *horizontal scroll or card layout*), `ux#116` (Compact Label Overflow). Quyết định: view lưới **không phân trang** (nhóm tầng cần trọn tập; 45 Phòng không cần trang — `react#37` virtualize chỉ >100); bảng mobile là **card layout** (mỗi dòng một `Item`), không cuộn ngang.

### 1.7 Header mobile cắt selector Toà nhà và chuông; stepper chiếm trọn màn đầu

C.1 #20–21. `ux#69` (Horizontal Scroll), `ux#64`. Quyết định: header mobile chỉ còn trigger sidebar · tiêu đề (truncate) · ⋯; Building scope và chuông vào sheet/⋯; stepper ngang thu gọn (`ux#… multi-step-progress` Quick Reference §8).

### 1.8 Copy lệch glossary và icon lệch nghĩa

"Tiện ích", "Khách thuê", "Tuân thủ", "Liên lạc", "Trung tâm nhiệm vụ" (C.2 Copy); `ReceiptPoundSterling` (£) cho Hoá đơn NCC, `Droplet` cho điện+nước, `Activity` cho tiêu thụ (C.2 Icon); emoji `⚡💧` trong Báo cáo (C.1 #22, `no-emoji-icons`). Quyết định: §7 bảng copy, §4 bảng icon — rẻ, làm trước, không chờ hướng.

### Những chỗ nhỏ hơn, ghi để ticket không bỏ sót

- Nút "Đăng nhập" dính ô mật khẩu; `FieldError` không `aria-describedby` (C.1 #17–18; `ux#55`).
- Hai lỗi React key ngoài console (`/`, `/reports`; `react#10`).
- Cột chọn dòng mà không có action bar (`ux#91`).
- `text-[10px]`/`[11px]` 11 chỗ ngoài thang (`ux#74`).
- Không breadcrumb cho route 3 cấp (`/contracts/:id/renew`; `ux#6`).
- `LoadingPanel` một hình cho mọi footprint (`shadcn#40–41`, `ux#10`).
- ~45 control chết: quyết định ở grill là **bỏ** hay **"sắp có"** (research §D.12) — design vẽ theo phương án bỏ.

---

## 2. Ba hướng — cùng một lớp nền, khác ở bề mặt và ở cách tổ chức công việc

Mockup: [`smart-rental-redesign/mockup-v1-ba-huong.html`](./smart-rental-redesign/mockup-v1-ba-huong.html). Ba hướng **cùng** giữ §3 (lớp nền: một header, một toolbar, một KPI hai cỡ, một thẻ, một chi tiết, một form, skeleton theo footprint, token trạng thái). Chúng khác nhau ở **palette + chất bề mặt** (A/B) và ở **IA** (C đổi cách vào việc).

Cả ba đều từ ba hàng back-office gần nhất trong `products.csv` (research C.3.c: #105 Invoice & Billing, #102 Inventory, #101 CRM — cùng `Key_Effects` *"Color shift hover + Fast 150ms transitions + No shadows"*, cùng nền `#F8FAFC`/chữ `#0F172A`/muted `#475569`/destructive `#DC2626`). Không có hàng "property management" trong 192 hàng; `products#36` Real Estate là marketing listing, loại.

### Hướng A — Sổ cái (Ledger)

`products#105` Invoice & Billing → `ui-reasoning#105` *"Minimalism & Swiss Style + Flat Design"*, dashboard *"Financial Dashboard"*; `styles#1` Minimalism & Swiss (*"high contrast, grid-based, sharp shadows if any"*); `colors#105` **navy `#1E3A5F` + paid green `#059669`**; `typography#31` Financial Trust (IBM Plex Sans — *"Excellent for data"*) hoặc `#21` Vietnamese Friendly (Be Vietnam Pro) — chọn ở §9.3.

| Ý | Hàng CSV | Lấy gì |
|---|---|---|
| Dải KPI liền, hairline chia ô, số `tabular-nums` 28px, trend là chữ nhỏ có mũi tên | `ux#…number-tabular` (Quick Ref §6), `ui-reasoning#7` | không card, không icon tile — số là nhân vật chính |
| Bảng là bề mặt chính: hàng 40px, hairline `--border`, không zebra, cột số căn phải | `shadcn#24–26`, `styles#50` (*"mathematical spacing"*) | mật độ cao, in ra đẹp |
| Sidebar sáng, chữ navy, active = gạch trái 2px navy + nền `--sidebar-accent` | `ux#3` | không tile màu |
| Badge trạng thái: nền 10% + chữ 100% của token, chấm tròn trái | `ux#37` | một hình cho 6 enum |
| Radius `0.375rem`, bóng **không** (chỉ `popover`/`dialog` có) | `products#105` anti *"Complex shadows"* | phẳng như sổ kế toán |

- **Tổng quan**: dải KPI 4 ô → hai cột: doanh thu 12 tháng (bar) + dòng tiền (line) trái, phải là *Việc cần làm* suy từ dữ liệu (Hoá đơn quá hạn / Hợp đồng sắp hết / Chỉ số bất thường) dạng danh sách `Item`.
- **Giá phải trả:** nghiêm, "ngân hàng"; chủ nhà nhỏ có thể thấy lạnh. Navy override `--primary` + `--ring` + `--sidebar-primary` (5–6 token) → **cần ADR** (ADR-0011, xem §9.2). Ít khác biệt nhất so với shadcn mặc định → rủi ro "vẫn như cũ".

### Hướng B — Bảng điều khiển (Console)

`products#7` Analytics Dashboard → `ui-reasoning#7` *"Data-Dense Dashboard"*, rule `must_have: data-export`, anti *"Ornate design + No filtering"*; `colors#7` **blue `#1E40AF` + amber `#D97706`** highlights; `styles#39` Bento Box Grid **chỉ cho Tổng quan** (*"Dashboards"* Best For; *"Dense data tables"* Do-Not → mọi màn danh sách vẫn là bảng); `typography#72` Plus Jakarta Sans (*"admin dashboards"*, weight scale 800/700/600/400).

| Ý | Hàng CSV | Lấy gì |
|---|---|---|
| **Sidebar tối** (`.dark` token của sidebar) trên canvas sáng `#F8FAFC` — chrome tách khỏi nội dung | `products#102` *"Functional neutral"* | app "có mặt", không chìm vào trang trắng |
| Tổng quan là **bento**: ô KPI 1×1 có sparkline, ô doanh thu 2×2, ô lấp đầy donut 1×2, ô việc 2×1 | `styles#39` (*"varied spans, rounded-xl 16px, subtle shadows, hover scale 1.02"*) | ấn tượng màn đầu |
| Amber cho *cảnh báo và số cần nhìn* (quá hạn, sắp hết), blue cho hành động | `colors#7` "Blue data + amber highlights" | hai màu, hai nghĩa |
| Card 1px `--border` + bóng một lớp rất nhẹ `0 1px 2px` — trừ bento có bóng hai lớp | `ux#…elevation-consistent` | thang bóng 2 bậc, không hơn |
| Radius `0.75rem`; số 30px weight 800 | `typography#72` | |

- **Danh sách/chi tiết** giống A về cấu trúc, chỉ đổi token và bóng nhẹ.
- **Giá phải trả:** sidebar tối cần kiểm contrast riêng (`ux#36`, Quick Ref *dark-mode-pairing*) và là bước nửa đường tới dark mode (§9.4). Bento chỉ đẹp ở một màn, 29 màn còn lại là A với radius to hơn. Override `--primary/--ring/--warning`… → **cần ADR**.

### Hướng C — Hôm nay (Today-first)

`products#101` CRM → `ui-reasoning#101` *"Activity timeline. Quick-log. Mobile quick-actions"*; `colors#101` **blue `#2563EB` + deal green `#059669`**; `typography#21` Be Vietnam Pro + Noto Sans (*"Vietnamese sites"*); `ux#…adaptive-navigation` (*"≥1024 sidebar; small screens bottom/top nav"*), `ux#…bottom-nav-limit` (≤5), `ux#…nav-hierarchy`.

Khác A/B ở **IA**, không chỉ ở vỏ:

| Ý | Hàng CSV | Lấy gì |
|---|---|---|
| **Building scope thành tabs** dưới header (Tất cả · Lê Duẩn · Cầu Giấy · …) thay `Select` ở góc phải — scope là *nơi đang đứng*, không phải bộ lọc | glossary Building scope (*Avoid: bộ lọc toà nhà*), `ux#3` | 7 màn quên scope không thể quên nữa: tabs là của shell |
| Tổng quan = **"Hôm nay"**: dải KPI 3 ô + cột *Cần làm* suy từ dữ liệu, mỗi mục là một `Item` có **hành động ngay** ("Gửi nhắc", "Gia hạn", "Xem chỉ số"); biểu đồ xuống dưới | `ui-reasoning#101` *"Quick-log"*, `ux#79` empty state có action | dashboard là hàng đợi việc, không phải poster |
| Mobile: **bottom nav 5 ô** (Hôm nay · Phòng · Người thuê · Hoá đơn · Thêm), sidebar còn lại vào "Thêm" | `ux#…bottom-nav-limit`, `#…adaptive-navigation` | chủ nhà đi kiểm phòng bằng điện thoại |
| Thẻ thực thể có avatar/monogram một tone (`Avatar` primitive), tên 15px 600, một dòng meta, một badge | `ui-reasoning#101` *"Contact card list with avatar"* | tenant-first |
| Radius `1rem`, bóng nhẹ, nền `#F8FAFC` | | mềm hơn A, không bento |

- **Giá phải trả:** đổi IA = đổi `AppHeader`, `BuildingSelector`, thêm bottom nav (`~/features/layout`), test shell đổi; Việc cần làm phải **suy ra** (research §A.5 điều kiện 1–4) — không chốt entity model thì C chỉ là A đội mũ. Tabs scope không scale quá ~6 Toà nhà (chuyển sang `Select` khi >6 — thiết kế sẵn ngưỡng).

### So nhanh

| | A Sổ cái | B Bảng điều khiển | C Hôm nay |
|---|---|---|---|
| Palette (`colors#`) | #105 navy + green | #7 blue + amber | #101 blue + green |
| Font (`typography#`) | #31 IBM Plex / #21 | #72 Plus Jakarta | #21 Be Vietnam Pro |
| Token delta | 6 token + font | 8 token + sidebar dark + font | 6 token + `--radius` + font |
| Việc ngoài §3 | không | bento Tổng quan, sidebar tối | tabs scope, "Hôm nay", bottom nav |
| Cần entity model đích | KPI/Việc cần làm | như A | **bắt buộc** (Việc cần làm là trục) |
| Mobile | KPI cuộn ngang, sidebar sheet | như A | bottom nav |
| Rủi ro | "vẫn như cũ" | bento một màn, contrast sidebar | scope tabs >6, đổi shell |
| ADR | có | có | có |

**Khuyến nghị của bước design: C**, với bề mặt của A (phẳng, hairline, không bento). Lý do: cả ba hàng CSV gần nhất đều nói *"No shadows + Fast 150ms"* — bề mặt không phải chỗ tạo khác biệt; thứ làm Portal "chuẩn" là **scope không quên được** và **dashboard là hàng đợi việc** — đúng hai lỗ hổng lớn nhất research tìm ra (§A.5, §A.6). B nếu chủ repo ưu tiên ấn tượng màn đầu; A nếu muốn ít rủi ro nhất.

---

## 3. Lớp nền dùng chung — bố cục từng màn

Áp cho cả ba hướng. Mỗi mục: wireframe → primitive → hàng CSV.

### 3.1 Shell

```
┌──────────┬──────────────────────────────────────────────────────────────┐
│ ▣ Portal │ [≡] Hoá đơn                     [Toà nhà ▾] [⌘K] [🔔] [Avatar]│  ← header 56px, KHÔNG h1
│──────────│  (C: tabs scope thay Select:  Tất cả · Lê Duẩn · Cầu Giấy )   │
│ Chính    ├──────────────────────────────────────────────────────────────┤
│ Tổng quan│ h1 Hoá đơn                                   [+ Lập hoá đơn] │  ← ListPageHeader
│ Toà nhà  │ Tháng này 30 Hoá đơn · 4 quá hạn                              │
│ Phòng    │ ┌─ KPI strip ───────────────────────────────────────────────┐ │
│ Người thuê│ │ Đã thu 412tr ▲8% │ Chưa thu 133tr │ Quá hạn 4 │ Đợt: 09/2026│ │
│ Việc     │ └────────────────────────────────────────────────────────────┘ │
│ Quản lý  │ [🔍 Tìm số/phòng] [Trạng thái ▾] [Kỳ ▾] [Xoá lọc]  [Thẻ|Bảng] │  ← DataTable toolbar
│ …        │ ┌ bảng / lưới ───────────────────────────────────────────────┐ │
└──────────┴──────────────────────────────────────────────────────────────┘
```

- `SidebarProvider`/`SidebarInset` giữ (`shadcn#44–46`); 15 mục ba nhóm giữ, **đổi copy** theo §7.
- Header mobile: `[≡] Tiêu đề (truncate, min-w-0) [⋯]` — scope + chuông + ⌘K vào `⋯` (`DropdownMenu`) hoặc bottom nav (C). `ux#69`.
- Breadcrumb (`breadcrumb.tsx`) thay "Quay lại" ở route ≥ 3 cấp (`ux#6`): `Hợp đồng › HĐ-001 › Gia hạn`.

### 3.2 Tổng quan

```
A/B:  [KPI strip 4]                      C:  [KPI strip 3: Cần thu · Quá hạn · Sắp hết HĐ]
      ┌ Doanh thu 12 th ┐ ┌ Cần làm ────┐     ┌ Cần làm hôm nay ─────────────┐ ┌ Lấp đầy ┐
      │ bar chart       │ │ • HĐ quá hạn│     │ ● Hoá đơn 204 quá hạn 2 ngày │ │ 42/48   │
      ├ Dòng tiền 6 th ─┤ │ • HĐ sắp hết│     │   [Gửi nhắc] [Xem]           │ │ donut   │
      │ line chart      │ │ • Chỉ số lệch│    │ ● HĐ 302 Lê Thị C hết 3 ngày  │ └─────────┘
      └─────────────────┘ └─────────────┘     │   [Gia hạn]                   │ ┌ Doanh thu┐
                                              └──────────────────────────────┘ │ bar 12 th│
```

- KPI **suy** từ Hoá đơn/Hợp đồng của scope (research §A.5), không `mockDashboardShare`.
- Việc cần làm **suy** từ dữ liệu (§D.10), mỗi mục trỏ đúng một entity bằng id; empty = `Empty` "Không có việc nào hôm nay" (`ux#79`).
- Chart: `chart.tsx` + `chartConfig`, legend có `nameKey` (fix key trùng), màu `--chart-1..5` (`shadcn#47–49`).
- Bento (B): `grid-cols-4 auto-rows-[140px]`, ô doanh thu `col-span-2 row-span-2`; dưới `md` xếp một cột.

### 3.3 Danh sách (10 màn)

- `ListPageHeader` (title · description = **số đếm của scope** · actions) — **một** vị trí cho nút tạo.
- KPI strip **chỉ khi** số có nghĩa cho scope (Hoá đơn, Chỉ số, Chi phí); Phòng/Toà nhà không cần.
- `DataTable` toolbar: search (debounce 300ms `ux#89`) · facets (`ux#115` chip wrap) · Xoá lọc · `ToggleGroup` thẻ/bảng (thay `Tabs`, đúng semantics) · actions phụ.
- Bảng: cột số `tabular-nums text-right`; badge `StatusBadge`; ⋯ = `EntityActionMenu`; **action bar** khi có dòng chọn (`ux#91`) — sticky dưới, "Đã chọn 3 · [Gửi nhắc] [Xuất]".
- Thẻ (view lưới): **một** anatomy — header (tên 15/600 + badge), body 2–4 `StatItem`, footer (meta xám + ⋯). Phòng: header **không** tô màu theo trạng thái; badge đủ.
- Lưới Phòng: nhóm tầng, **không phân trang**, `h2` tầng sticky.
- Mobile (`< md`): bảng → danh sách `Item` (`item.tsx`: media · title · description · actions), không cuộn ngang (`ux#71`).

### 3.4 Chi tiết (10 màn) — một bố cục

```
Hợp đồng › HĐ-001                                            [Gia hạn] [Thanh lý] [⋯]
HĐ-001 · ● Đang hiệu lực            Phòng 101 · Nguyễn Văn A · 01/03/2026 → 28/02/2027
──────────────────────────────────────────────────────────────────────────────────────
[Tổng quan] [Hoá đơn (12)] [Chỉ số] [Lịch sử]
┌ Điều khoản ─────────────────────────┐ ┌ Cọc ────────────────────────┐
│ Tiền thuê     4.500.000 đ / tháng   │ │ 9.000.000 đ · Đang giữ      │
│ Chu kỳ thu    ngày 5 hằng tháng     │ │ Hoàn khi thanh lý           │
│ Báo trước     30 ngày               │ └─────────────────────────────┘
└─────────────────────────────────────┘ ┌ Vòng đời ──────────────────┐
                                        │ ○ Nháp → ● Hiệu lực → ○ …  │
                                        └────────────────────────────┘
```

- Header entity: tên + `StatusBadge` + **tối đa 3 meta** + actions (`buttonVariants` link cho điều hướng). Mỗi dữ kiện xuất hiện **một lần** — hoặc ở header, hoặc trong tab, không cả hai.
- `Tabs` thật (có panel) cho quan hệ (Hoá đơn của Hợp đồng, Chỉ số của Phòng). Cột phải (`lg:` 1/3) chỉ: cọc/số dư, vòng đời (`LifecycleStepper` — trạng thái đã hết **không** tick xanh), liên kết. Không "Hành động nhanh" chết.
- Cặp nhãn–giá trị: **một** — `InfoRow` (ngang) trong card, `StatItem` (dọc) trong strip/thẻ; bỏ `dl` tự vẽ.
- Ảnh chứng từ: `attachment.tsx` có fallback.

### 3.5 Form — một bố cục, một vị trí submit

- **Tạo/sửa ngắn** (Toà nhà, Phòng, Chi phí, Hoá đơn NCC): `Sheet` bên phải (`sheet.tsx`), form `FieldGroup`, submit ở `SheetFooter`. Không rời trang.
- **Wizard** (Hợp đồng, Onboarding): stepper **ngang** trên form (mobile thu thành "Bước 2/4 · Điều khoản"), form một cột `max-w-2xl`, nút Quay lại/Tiếp tục ở footer sticky. Không cột phải trống (C.1 #7): xác nhận là **bước cuối**.
- **Form-in-table** (Đợt hoá đơn, Nhập chỉ số): `DataTable` với ô nhập inline, một submit ở footer sticky "Lưu 12 chỉ số". Kỳ chọn bằng `MonthPicker`.
- Ngày: `DatePicker` (`date-picker.tsx`), hiển thị `DATE_FORMAT`. Tiền: `InputGroup` với suffix "đ" (`input-group.tsx`). Chọn Phòng: `Combobox` tìm được (`combobox.tsx`, `patterns-self-fetching-inputs`).
- Lỗi: `FieldError` + `aria-describedby`; form dài có error summary focusable (`ux#109`); required `*` nhất quán (`ux#59`); validate on blur (`ux#56`).

### 3.6 Trạng thái, skeleton, empty

- `QuerySection` (loading/error/empty/data) cho mọi màn; skeleton **theo footprint**: `KpiStripSkeleton`, `TableSkeleton(rows)`, `DetailSkeleton` (`shadcn#40–41`, `ux#19`).
- Empty có action khi có bộ lọc, có hướng dẫn khi thật sự rỗng (`ux#79`, `#90`).
- Confirm xoá: `AlertDialog` (`ux#35`); xoá thật hoặc không có nút.

---

## 4. Component map — không thêm dependency

| Việc | Primitive `@monorepo/ui` | `~/components` |
|---|---|---|
| KPI strip 2 cỡ | `Card` (một card, `divide-x`) | **sửa** `card/summary-card.tsx` → `kpi-strip.tsx` + `KpiItem`; xoá cách dùng 4 card |
| Thẻ thực thể một anatomy | `Card`, `Badge`, `Avatar` | **sửa** `card/entity-list-card.tsx` thành slot header/body/footer; 8 file `*-card.tsx` chỉ còn điền slot |
| Bảng → Item trên mobile | `Item`, `ItemMedia`, `ItemTitle`, `ItemDescription`, `ItemActions` (`item.tsx`) | `data-table/data-table.tsx` thêm `renderMobileRow` |
| View switch | `ToggleGroup` | **sửa** `data-table/list-view.tsx`; xoá 2 bản copy tay |
| Action bar chọn dòng | `Button`, `Kbd` | **mới** `data-table/selection-bar.tsx` |
| Breadcrumb | `Breadcrumb*` | **sửa** `page/detail-page-shell.tsx` |
| Header entity + tabs | `Tabs`, `Badge`, `buttonVariants` | **sửa** `page/detail-page-shell.tsx` (title · badge · meta · actions · tabs) |
| Cặp nhãn–giá trị | — | giữ `card/info-row.tsx` + `card/stat-item.tsx`; xoá `dl` tự vẽ |
| Ngày · Kỳ | `DatePicker`, `Calendar`, `Popover` | `form/date-field.tsx` (sửa), **mới** `form/month-field.tsx` |
| Tiền | `InputGroup`, `InputGroupAddon` | **mới** `form/currency-field.tsx` |
| Chọn Phòng/Người thuê | `Combobox` | **mới** `select/select-room.tsx`, `select-tenant.tsx` (self-fetching) |
| Form ngắn | `Sheet*` | **mới** `sheet/form-sheet.tsx` |
| Wizard | `Progress` hoặc `Item` ngang | **sửa** `stepper/lifecycle-stepper.tsx` thêm `orientation` |
| Ảnh chứng từ | `Attachment` | thay `<img>` 3 chỗ |
| Skeleton | `Skeleton` | **sửa** `panel/loading-panel.tsx` → 3 footprint |
| Avatar một tone | `Avatar`, `AvatarFallback` | thay `tenant-avatar.tsx` |
| Bottom nav (C) | `Button`/`Link` + `buttonVariants` | **mới** `~/features/layout/components/bottom-nav.tsx` |
| Tabs scope (C) | `Tabs` hoặc `ToggleGroup` | **sửa** `header/building-selector.tsx` |
| Bento (B) | `Card` + grid utilities | chỉ ở `dashboard` slice |

**Icon ↔ nghĩa** (lucide, không đổi bộ): Hoá đơn NCC `FileText`/`Receipt` (bỏ `ReceiptPoundSterling`); Chỉ số điện nước `Gauge` (bỏ `Droplet`); điện `Zap`, nước `Droplets` (bỏ `Activity`); Nợ cước `AlertCircle` (bỏ `CheckCircle2`); Toà nhà `Building2`, Phòng `DoorOpen`; Khai báo lưu trú `ShieldCheck`; Việc cần làm `ListChecks`.

---

## 5. Token delta

`tooling/tailwind/theme.css` **giữ nguyên**. Mọi override nằm **unlayered** trong `apps/smart-rental/src/globals.css` (`:root` + `.dark`; ADR-0008: *"viết trong `@layer base` thì compile, ship và thua"*), `--radius` **có đơn vị**, **giữ** status/chart/sidebar token nghĩa của theme (ADR-0009). Hợp đồng là `apps/smart-rental/test/globals.test.ts` (copy `contrast.ts` của portfolio, không import chéo app). Cần **ADR-0011** (ADR-0010 đã dùng cho hook Derived) — §9.2.

| Token | A Sổ cái (`colors#105`) | B Bảng điều khiển (`colors#7`) | C Hôm nay (`colors#101`) |
|---|---|---|---|
| `--primary` | `#1E3A5F` navy | `#1E40AF` | `#2563EB` |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| `--ring` | = primary | = primary | = primary |
| `--background` | `#F8FAFC` | `#F8FAFC` | `#F8FAFC` |
| `--foreground` | `#0F172A` | `#1E3A8A` (hàng #7 fg) → **đề nghị giữ `#0F172A`** | `#0F172A` |
| `--muted-foreground` | `#475569` | `#475569` | `#475569` |
| `--accent`/`--accent-foreground` | `#EFF6FF`/navy | `#FEF3C7`/`#92400E` (amber) | `#EFF6FF`/blue |
| `--sidebar-*` | theme (sáng) | `.dark` sidebar: `--sidebar: #0F172A`, `--sidebar-foreground: #E2E8F0`, `--sidebar-accent: #1E293B`, `--sidebar-primary: #60A5FA` | theme (sáng) |
| `--radius` | `0.375rem` | `0.75rem` | `1rem` |
| `--success/--warning/--info/--destructive` | **theme** (không đổi nghĩa) | theme | theme |
| `--chart-1..5` | theme | theme | theme |
| Font | `--font-sans: "IBM Plex Sans"` qua `@fontsource-variable` **hoặc** system stack | `"Plus Jakarta Sans"` | `"Be Vietnam Pro"` |

- Số: `font-variant-numeric: tabular-nums` trên bảng, KPI, tiền (`utilities` class `tabular-nums`) — không cần token.
- Font: pha 1 không có webfont; `documents` đã đi `@fontsource-variable` (ADR-0009) nên có tiền lệ. **Chưa xác minh** Be Vietnam Pro có bản `@fontsource-variable` (Google Fonts có variable; cần kiểm `fontsource.org` lúc ticket). Fallback: system stack như `portfolio`.
- Không dark mode trong vòng này trừ sidebar của B — §9.4.

---

## 6. State list

| Màn | State | Hiển thị |
|---|---|---|
| Shell | scope = `null` | header/tabs "Tất cả Toà nhà"; description của list = tổng |
| Shell | scope = b1 | mọi list, KPI, Tổng quan, Việc cần làm lọc theo b1 — **kể cả 7 màn đang quên** (research §A.6) |
| Shell (C) | > 6 Toà nhà | tabs → `Select` (ngưỡng thiết kế sẵn) |
| Shell mobile | header tràn | không xảy ra: chỉ `[≡] title [⋯]` |
| Tổng quan | không việc nào | `Empty` "Hôm nay không có việc cần làm" + link Hoá đơn |
| Tổng quan | đang tải | `KpiStripSkeleton` + 2 `Skeleton` chart footprint |
| List | tải lần đầu | `TableSkeleton(8)`; KPI strip skeleton cùng lúc (`ux#19`) |
| List | refetch nền | không skeleton; `isFetching` → chấm nhỏ ở toolbar |
| List | lọc rỗng | `Empty` + "Xoá bộ lọc" |
| List | thật sự rỗng | `Empty` + action tạo (mở `Sheet`) |
| List | chọn n dòng | `SelectionBar` sticky dưới |
| List mobile | view bảng | tự chuyển `Item` list; nút thẻ/bảng ẩn dưới `md` |
| Phòng lưới | nhóm tầng | trọn tập, `h2` sticky; badge trạng thái đủ, không tô header |
| Chi tiết | id không có | `NotFound` trên `Empty`, giữ `h1` (test pin) |
| Chi tiết | Hợp đồng `EXPIRED/TERMINATED` | stepper bước hiện tại là **kết thúc**, không tick xanh; actions chỉ còn "Xem Hoá đơn" |
| Chi tiết | Hoá đơn `PARTIAL` | badge warning + dòng "Đã trả 2.000.000 / 4.500.000 đ" + progress |
| Chi tiết | Hoá đơn `OVERDUE` | badge destructive + "Quá hạn n ngày" suy từ `dueDate` |
| Form | lỗi nhiều ô | error summary focusable + inline; submit disabled khi `isPending` |
| Form Sheet | đóng khi dirty | `AlertDialog` "Bỏ thay đổi?" (`sheet-dismiss-confirm`) |
| Wizard | mobile | stepper "Bước 2/4 · Điều khoản" một dòng |
| VietQR | Cài đặt chưa có tài khoản | `Alert` + link Cài đặt, không QR giả |
| VietQR | có tài khoản | ảnh `img.vietqr.io` (Quick Link) + số tiền + nội dung không dấu |
| Toàn app | `prefers-reduced-motion` | chỉ `transition-colors` 150ms (`products#105` *"Fast 150ms"*) → không nhánh riêng; bento hover scale (B) tắt |
| Toàn app | keyboard focus | ring primitive; skip link tới `<main>` |

---

## 7. Copy — đổi về glossary (không i18n trong pha này, §9.5)

| Đang có | Đổi thành | Nguồn |
|---|---|---|
| Tiện ích (sidebar, heading, KPI) | **Chỉ số điện nước** | `CONTEXT.md` § Chỉ số điện nước (*Avoid: tiện ích*) |
| Khách thuê / khách | **Người thuê** | § Người thuê (*Avoid: khách*) |
| Trung tâm nhiệm vụ | **Việc cần làm** (heading) / **Trung tâm việc** (nếu giữ tên khu vực) | § Việc cần làm |
| Tuân thủ | **Khai báo lưu trú** | § Khai báo lưu trú |
| Liên lạc | **Thông báo** | README bảng route |
| Phòng trọ (sidebar) | **Phòng** | § Phòng |
| Tòa nhà / Toà nhà (lẫn) | **Toà nhà** (một cách viết) | glossary |
| Đối soát chi phí | **Đối soát** | § Đối soát |
| Chi phí vận hành | **Chi phí** | § Chi phí |
| Hóa đơn / Hoá đơn (lẫn) | **Hoá đơn** | glossary |
| "Xóa" Hợp đồng | bỏ — không có huỷ Hợp đồng | § Gia hạn / Thanh lý |
| "Nhanh chóng" (card) | bỏ card | C.1 #26 |
| "Khoá phòng" | **Phòng** | C.1 #16 |
| Trạng thái Hợp đồng: Chờ xử lý / Đang hoạt động / Sắp hết hạn / Đã kết thúc | **Nháp · Đang hiệu lực · Sắp hết hạn · Đã hết hạn · Đã thanh lý** (map `DRAFT/ACTIVE/EXPIRING/EXPIRED/TERMINATED`) | §A.8 |
| Trạng thái Hoá đơn: Chờ thanh toán / Đã thanh toán / Quá hạn / Đã huỷ | **Chưa thu · Thu một phần · Đã thu · Quá hạn · Đã huỷ** (+ Nháp) | §A.8 |
| Cọc | **Đang giữ · Đã hoàn · Hoàn một phần · Không hoàn** | `deposit_status` |

---

## 8. Những gì không đổi

- Runtime Vite, `ROUTES` table + `AppRoutes`/`MainApp` tách, `ProtectedRoute`/`GuestRoute`, Building scope là store app-wide `persist` (chỉ đổi *cách hiển thị* ở C).
- `DataTable` trên URL params (search/facet/page/size), `useDataTable` primitive, `queryKeysFactory`, Mock sau `~/hooks/api`.
- `StatusBadge` + `StatusConfig` là **một** home (`~/constants/status.ts`) — chỉ gom 6 chỗ lạc về.
- Không dark mode toàn app (trừ sidebar B), không i18n (trừ khi §9.5 lật lại), không nối BE.
- Không thêm primitive vào `@monorepo/ui`, không thêm dependency ngoài `@fontsource-variable/*` nếu chọn webfont.
- Test seam `test/pages/main.test.tsx` (mount mọi path, assert `h1`).

---

## 9. Câu hỏi mở — cần chủ repo trả lời ở grill

### 9.0 Chọn hướng — **CẦN CHỦ REPO**

A / B / C, hay C với bề mặt A (khuyến nghị)? Mockup có ba frame mỗi hướng.

### 9.1 Entity model đích trước design — **CẦN CHỦ REPO**

Brief vẽ trên enum BE + tham chiếu id + kỳ `YYYY-MM` (research §D.1–3). Chốt viết lại Mock thành **một Toà nhà đầy đủ quan hệ** trước ticket UI (research §E)? Nếu không, Tổng quan/Việc cần làm/Đối soát của §3.2 phải vẽ lại thành "ảnh" như pha 1.

### 9.2 ADR-0011 — `smart-rental` override palette — **CẦN CHỦ REPO**

Cả ba hướng đổi `--primary` (+ 5–7 token). Lý do đề xuất: *"Portal vận hành cho chủ nhà, không phải sản phẩm EMR; back-office cần một accent hành động tách khỏi neutral"*. Hay giữ neutral shadcn (không ADR, chỉ làm §3) — khi đó A gần như là lựa chọn duy nhất.

### 9.3 Font — **CẦN CHỦ REPO**

Webfont qua `@fontsource-variable` (tiền lệ `documents`) hay system stack (tiền lệ `portfolio`)? Nếu webfont: IBM Plex Sans (`#31`) / Plus Jakarta (`#72`) / Be Vietnam Pro (`#21`). Tiếng Việt có dấu: cả ba có glyph đủ (Google Fonts subset `vietnamese`) — **chưa xác minh** với fontsource.

### 9.4 Dark mode — **CẦN CHỦ REPO**

Pha 1 nói không. Token trạng thái qua theme (§1.4) là điều kiện đủ để bật sau; B đã có sidebar tối. Vào vòng này hay để vòng sau?

### 9.5 i18n — **CẦN CHỦ REPO**

Pha 1 bỏ. §7 viết copy hardcode. Nếu bật lại (`@monorepo/i18n` i18next Flavor) thì §7 thành `smartRental.*` trong `vi.json` và ticket copy đổi hình.

### 9.6 Control chết — **CẦN CHỦ REPO**

~45 nút/menu không handler: **bỏ hẳn** (mockup vẽ theo phương án này) hay giữ "sắp có" (disabled + tooltip)? Ít nhất bỏ: "Tải PDF" lặp, "Xóa" Hoá đơn giả, hai submit Nhập chỉ số, card "Hành động nhanh".

### 9.7 KPI mobile

Dải cuộn ngang (mockup) hay 2×2 compact? Ẩn hẳn dưới `md`?

### 9.8 Hướng C — ngưỡng tabs scope

Tabs tới 6 Toà nhà rồi chuyển `Select`? Hay `Select` luôn nhưng đặt ở header trái, to hơn?

### 9.9 Sheet cho form ngắn

Toà nhà/Phòng/Chi phí/Hoá đơn NCC tạo trong `Sheet` (không rời trang) — đồng ý? Prototype dùng dialog cho Toà nhà và trang cho phần còn lại.

---

## 10. Chốt ở vòng grill — 2026-09-17 (hướng C với bề mặt A)

Grill cùng session, 37 quyết định qua ba vòng. Glossary sửa cùng lúc (`apps/smart-rental/CONTEXT.md`); hai ADR: [ADR-0011](../adr/0011-smart-rental-ledger-palette-override.md) (hình dạng + override accent) và [ADR-0012](../adr/0012-smart-rental-derived-state-mock-by-contract.md) (trạng thái dẫn xuất, Mock theo contract).

| # | Quyết định | Chốt |
|---|---|---|
| 1 | Hướng | **C với bề mặt A** — IA của C, bề mặt phẳng/hairline/không bóng của A, `--radius 0.375rem` |
| 2 | Mock đích trước ticket UI | Có — 3 Toà nhà (6/8/4 Phòng), tham chiếu id, enum BE, kỳ `YYYY-MM`, ngày ISO |
| 3 | Palette | Override ở app, `colors#105` navy + green; giữ status/chart token của theme — ADR-0011 |
| 4 | Building scope | `buildingId` bắt buộc; mọi màn theo scope; Cài đặt toàn cục; Báo cáo theo scope, `null` = bảng so sánh Toà nhà; Đợt hoá đơn/Nhập chỉ số đòi đúng một Toà nhà |
| 5 | Hợp đồng | `DRAFT/ACTIVE/EXPIRING/EXPIRED/TERMINATED`; `EXPIRING` = 30 ngày suy ra; Cọc `HELD/RETURNED/PARTIAL_RETURNED/FORFEITED`; Thanh lý quyết toán cọc + trừ nợ thật; Gia hạn có lịch sử, chỉ từ ACTIVE/EXPIRING; chỉ DRAFT xoá được; báo trước 30 ngày và chu kỳ thu là trường, không enforce phạt |
| 6 | Hoá đơn | line items theo loại; Thanh toán là bản ghi (ngày, tiền, kênh); `PARTIAL`/`OVERDUE` suy ra; Đợt hoá đơn chỉ cho Phòng có Chỉ số xác nhận của kỳ — flow Nhập chỉ số → Đợt |
| 7 | Giá điện nước | Đơn giá phẳng theo Toà nhà (Bảng giá: điện, nước, dịch vụ cố định); `Alert` khi điện > trần; bỏ màn bậc thang |
| 8 | Khai báo lưu trú | Hai loại gắn Người thuê: Thông báo lưu trú + Đăng ký tạm trú; bỏ an toàn/giấy tờ; checklist + link ngoài |
| 9 | Việc cần làm | Suy hoàn toàn từ 5 nguồn; màn chỉ đọc; bỏ `mockTasks` + `pendingTasks` |
| 10 | Người thuê | Không có status; badge suy từ Hợp đồng + cờ có Hoá đơn quá hạn |
| 11 | Đối soát / Báo cáo | Tính từ Hoá đơn + Hoá đơn NCC + Chi phí; xoá Mock riêng; bỏ tab Lợi nhuận dịch vụ và Cảnh báo thất thoát; Báo cáo trên `DataTable` + URL |
| 12 | VietQR | Tài khoản nhận tiền theo Toà nhà; Quick Link `img.vietqr.io`; `addInfo` không dấu ≤ 25 ký tự; chưa có tài khoản → `Alert`, không QR giả |
| 13 | Onboarding / đăng ký | Bỏ cả hai; giữ `/auth/login` |
| 14 | Control chết | Bỏ hẳn; Gửi nhắc / Gia hạn / Thanh lý / Ghi nhận thanh toán làm thật; Xuất = CSV client + `window.print` |
| 15 | Form | Form ngắn (Toà nhà, Phòng, Chi phí, Hoá đơn NCC, Người thuê) trong `Sheet`; wizard chỉ Hợp đồng, stepper ngang, xác nhận là bước cuối; đóng khi dirty → `AlertDialog` |
| 16 | KPI mobile | Dải cuộn ngang, ô 150 px, tối đa 4 |
| 17 | Dark mode | Để sau; `.dark` block viết sẵn trong override, không toggle |
| 18 | i18n | Vẫn hardcode tiếng Việt; bật là ticket riêng sau redesign |
| 19 | Copy | Đổi hết theo §7; khu vực và heading đều "Việc cần làm"; glossary bỏ "Trung tâm việc" |
| 20 | Font | IBM Plex Sans variable (`@fontsource-variable/ibm-plex-sans`, subset `vietnamese`), import từ `globals.css` |
| 21 | Tabs scope | ≤ 6 Toà nhà là tabs; từ 7 đổi `Select` |
| 22 | Bottom nav | Hôm nay · Phòng · Người thuê · Hoá đơn · Thêm (sheet 11 khu vực còn lại) |
| 23 | Ghi lên Mock | In-memory, mất khi reload |
| 24 | Phép suy | Hàm thuần `~/utils`, có test, gọi từ `queryFn` — ADR-0012 |
| 25 | Hạn thu | Toà nhà có ngày thu trong tháng; Đợt hoá đơn đặt `dueDate` theo đó |
| 26 | Gửi nhắc / Thông báo | Gửi nhắc = nhật ký trên Hoá đơn (đã nhắc n lần, lần cuối); slice Thông báo giữ mẫu + nhật ký, bỏ tab con; không gửi thật |
| 27 | Chỉ số bất thường | Suy ra: tiêu thụ > 2× kỳ trước hoặc mới < cũ; trạng thái chỉ Nháp / Đã xác nhận; bất thường chặn xác nhận tới khi duyệt |
| 28 | Trần giá điện | Hằng số có nguồn trong `~/constants/tariff.ts` (Thông tư 60/2025) |
| 29 | Báo cáo + tabs | Theo tabs shell; scope `null` = so sánh Toà nhà; chọn một = chi tiết theo tầng/tháng |
| 30 | Thứ tự ticket | Mock đích → token + ADR + lớp nền §3 → shell C → từng slice (song song) |
| 31 | E2E | Mỗi ticket tự sửa spec nó chạm |
| 32 | Cài đặt Toà nhà | Ngày thu, Bảng giá, Tài khoản nhận tiền ở tab "Cài đặt" của `/buildings/:id`; `/settings` toàn cục chỉ còn hồ sơ + reset Mock |
| 33 | Kỳ Mock | 6 kỳ Hoá đơn 04–09/2026, Chỉ số 08–09; kỳ 09/2026 chưa lập Đợt |
| 34 | Slice Hôm nay | Giữ slice `dashboard`, route `/`, heading "Hôm nay" |
| 35 | Chi tiết | Một bố cục: header entity + tabs; cột phải chỉ hành động/liên kết (§3.4) |
| 36 | Skeleton | Theo footprint: KPI strip / bảng / chi tiết (§3.6) |
| 37 | Xoá | Chỉ Hợp đồng DRAFT, Hoá đơn DRAFT, Phòng không có Hợp đồng hiệu lực; `AlertDialog` |

## 11. Bước tiếp

> Spec pha 2: [#153](https://github.com/qtuan02/monorepo/issues/153) (2026-09-17).

1. `/to-spec` cùng session → issue `spec` pha 2 (redesign) trên GitHub, từ §10 + hai ADR + glossary.
2. `/to-tickets` theo thứ tự §10 hàng 30: Mock đích (ADR-0012) → token + ADR-0011 + lớp nền §3 → shell C (tabs scope, Hôm nay, bottom nav) → từng slice song song; mỗi ticket tự sửa E2E nó chạm.
3. Sau khi ship: README của app mô tả hình dạng mới; tài liệu này và mockup đóng băng như bản ghi.
