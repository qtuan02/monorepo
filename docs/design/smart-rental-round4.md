# Design brief — round 4 "gọn hơn" cho `apps/smart-rental` (sau spec #227)

> **Đã implement, spec [#241](https://github.com/qtuan02/monorepo/issues/241)** (8 ticket #242–#249 merge vào `dev` 2026-09-19; #249 là tổng kiểm + cập nhật tài liệu). Bản ghi *tại thời điểm quyết* của bước design, viết cho grill. Ba round trước dựng ngữ pháp màn hình (pha 2, spec #153), thứ tự việc (round 3, spec #179), rồi shell (#221) và bốn slice (#227). Round này **không đổi IA, không đổi flow, không đổi token** — nó đổi *số thứ trên một màn* và *cỡ của chúng*. Yêu cầu của chủ repo 2026-09-19: "design lại UI đẹp hơn, gọn gàng hơn". Tài liệu này giữ nguyên nội dung quyết định, không phải mô tả app hiện tại; hình dạng app sau khi ship đọc ở `apps/smart-rental/README.md` § Hình dạng round 4 và CLAUDE.md §1, tổng kết 22 quyết định (cái nào ship, cái nào lệch và vì sao) ở comment trên spec [#241](https://github.com/qtuan02/monorepo/issues/241).

- **Ngày:** 2026-09-19
- **Bước:** design, chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`, không `--persist`. **Không** dùng `colors.csv`/`typography.csv`: app đã có brand (ADR-0011 — navy `#1e3a5f`, radius `0.375rem`, IBM Plex Sans, bề mặt phẳng). Không có research note riêng cho round này: đầu vào là **28 ảnh chụp app đang chạy** (`dev` HEAD `1599d5f`, 1440×900 và 390×844, scope null và scope `b1`, 14 route) cộng số đo DOM qua Playwright — ảnh ở scratchpad phiên làm việc, không commit; mọi số trong §1 là số đo, ghi kèm cách đo.
- **Đầu vào khác:** `apps/smart-rental/src/globals.css`, `components/{card/kpi-strip,card/info-card,data-table/data-table,page/list-page-header,page/detail-page-shell}.tsx`, `features/layout/components/header/app-header.tsx`, `features/*/components/*-columns.tsx`, `features/reports/components/*`, `tooling/tailwind/theme.css`; brief pha 2 [`smart-rental-redesign.md`](./smart-rental-redesign.md) §10 và round 3 [`smart-rental-round3.md`](./smart-rental-round3.md) §11 (quyết định nào round này chạm tới thì ghi rõ); `apps/smart-rental/CONTEXT.md`; ADR-0011.
- **Đầu ra:** tài liệu này + một mockup HTML tĩnh [`smart-rental-round4/mockup-v1-gon.html`](./smart-rental-round4/mockup-v1-gon.html) — **hai hướng, cùng một danh sách "bỏ đi" (§2), khác nhau đúng một chiều là mật độ (§3)**: hướng A "Bớt" (5 frame: Hoá đơn 1240 · Kỳ 1240 · Hoá đơn 390 · chi tiết Hợp đồng · lưới Phòng), hướng B "Nén" (3 frame: Hoá đơn 1240 · Kỳ 1240 · Hoá đơn 390). Tự chứa, không script, không font ngoài.
- **Cách đọc trích dẫn:** `ux#NN` / `shadcn#NN` / `styles#NN` / `charts#NN` = hàng `No=NN` trong `ux-guidelines.csv` / `stacks/shadcn.csv` / `styles.csv` / `charts.csv` dưới `.agents/skills/ui-ux-pro-max/data/` (grep `^NN,`). Tên id trong Quick Reference của SKILL.md (`primary-action`, `icon-context`, `whitespace-balance`, `number-tabular`…) ghi nguyên tên khi CSV không có hàng riêng — SKILL.md là nguồn.
- **Giả định nền:** Mock giữ nguyên (`b1` 6 Phòng, 30 Hoá đơn, kỳ 09/2026 có 1 bất thường). Mọi frame vẽ trên scope `b1` với đúng số của Mock; không bịa số.

---

## 1. Chẩn đoán — vì sao Portal "đúng và dễ" mà vẫn chưa "gọn"

Ba round trước làm đúng việc của chúng: một `DataTable`, một `KpiStrip`, một `DetailPageShell`, một `StatusBadge`, một hàng đợi. Cái còn lại là **cùng một thứ được nói hai lần, và mọi thứ đều to bằng nhau**. Sáu chỗ có tên, mỗi chỗ là một quyết định.

### 1.1 Mỗi màn nói tên mình ba lần, đếm số hai lần

`AppHeader` in *tiêu đề + mô tả* của mục sidebar ("Hoá đơn / Theo dõi thanh toán và công nợ"); mục sidebar đang active in cùng tên; `ListPageHeader` in `h1` "Hoá đơn" + mô tả lần nữa — ba lần trong 180 px đầu (ảnh `invoices-1440`). Dưới `h1` là "30 hoá đơn", dưới KPI là "30 hoá đơn được tìm thấy" (`data-table.tsx:344`) — cùng con số, cách nhau 150 px. Trên mobile còn tệ hơn: header 52 px in "Hoá đơn", `h1` ở y = 125 in "Hoá đơn" lần nữa (đo DOM).
`ux#39` (Heading Hierarchy), `ux#77` (Heading Clarity — *headings should stand out*, tức là phải *khác*, không phải *nhiều*), `ui-reasoning#105` anti-pattern *"Excessive decoration"*.
**Quyết định:** một màn = một tiêu đề. Desktop: `AppHeader` bỏ tiêu đề/mô tả (giữ trigger · search · chuông · avatar), `h1` của trang là tiêu đề duy nhất. Mobile: `AppHeader` giữ tiêu đề (đang là thứ duy nhất trên đó), `h1` của trang thành `sr-only` dưới `md`. Dòng "N … được tìm thấy" chỉ hiện **khi có filter/search đang áp** và đọc "12 / 30 hoá đơn"; không lọc thì tổng số nằm ở subtitle của `h1` như hiện tại.

### 1.2 Màn chi tiết vẫn có ô "Liên kết" và ô một-dòng

`DetailPageShell` mở cột phải cho "Hành động" + "Liên kết"; ở Phòng, cột phải chỉ có "Xem toà nhà" — mà tên Toà nhà đã là link ngay dưới `h2` (ảnh `room-detail-1440`); ở Hợp đồng, "Xem phòng" / "Xem người thuê" lặp hai link meta y hệt (`contract-detail-1440`). "Người thuê hiện tại" là một card 120 px cho **một** dòng "Tên Người thuê: Nguyễn Văn A". Hợp đồng sắp hết hạn nói ba lần: badge cạnh tên, bước 3 của stepper, và một alert vàng 50 px "sẽ hết hạn trong 11 ngày". `InfoRow` đặt nhãn sát mép trái và giá trị sát mép phải của card 750 px — mắt phải đi 600 px để nối "Diện tích" với "22m²" (`ux#21` Container Width — 65–75ch; `ux#73`).
**Quyết định:** cột phải chỉ mở khi có ≥ 1 hành động *không* nằm trên header; "Liên kết" bỏ hẳn (meta dưới `h2` đã là link — pha 2 §10 dòng 8 giữ nguyên, chỉ bỏ bản sao). `InfoCard` đổi `InfoRow` flex-between thành **`dl` hai cột, nhãn 140 px** — giá trị đứng ngay cạnh nhãn (mockup A4). Card một dòng gộp vào card bên cạnh (Người thuê hiện tại → một `dt/dd` trong "Thông tin phòng"). Alert "sắp hết hạn" bỏ: badge và stepper đã nói, nút "Gia hạn" đã ở header — alert chỉ giữ khi nó mang *bước tiếp theo* mà header không có (§8 hỏi lại).

### 1.3 Ô bảng đeo icon trang trí, dòng 53 px, tiền chữ đậm màu navy

Chín chỗ trong `features/*/components/*-columns.tsx` đặt icon `size-3`/`size-3.5`/`size-4` cạnh chữ (đếm grep): hộp `ReceiptText` 32 px trước mỗi số hoá đơn, `User` trước tên, `Home` trước phòng, `Calendar` trước ngày, `Phone` trước số điện thoại (`invoice-columns.tsx:31–76`, `tenant-columns`). Không icon nào mang trạng thái — header cột đã nói đó là gì. Dòng cao 53 px (đo DOM) vì hộp icon 32 px + hai dòng chữ. "Tổng tiền" in `text-primary font-bold` — navy là màu *hành động* của app (ADR-0011), đem tô số tiền thì cột tiền trông như 30 cái link.
`icon-context` (Quick Reference §1: *decorative icons beside visible text are hidden from the a11y tree* — nếu phải giấu thì đừng vẽ), `number-tabular`, `styles#1` checklist *"No unnecessary decorations"*, `styles#28` `--table-row-height: 36px`.
**Quyết định:** ô bảng **không icon** trừ khi icon *là* trạng thái (đã nằm trong `StatusBadge`); số hoá đơn mono không hộp; tiền `font-semibold tabular-nums text-foreground` căn phải, header cột tiền cũng căn phải (hiện header trái, số phải — `invoices-1440`); tên + phòng gộp một dòng "Nguyễn Văn A · Phòng 102" (`ux#116` nowrap). Dòng 44 px (A) hoặc 40 px (B).

### 1.4 Nút primary lặp theo dòng — sáu cái navy đặc trên một màn

Hôm nay: mỗi mục "Hoá đơn quá hạn" có "Nhắc tất cả" primary + "Xem n hoá đơn" outline; mỗi mục "Chỉ số bất thường" có "Sửa chỉ số" primary → 3 + 3 nút navy đặc trước khi cuộn (`home-1440`). Màn Kỳ: "Lưu nháp chỉ số" + "Lập 3 hoá đơn" nổi giữa alert và bảng, kèm một dòng helper riêng — ba hàng cho một cụm hành động (`cycle-1440`). Đối soát: badge "Lỗ" đỏ + số tiền đỏ + mũi tên đỏ — ba lần mã hoá một trạng thái (`reconciliation-1440`; `ux#37` chiều ngược: *thêm* icon/text vào màu, không phải *nhân ba* màu). Báo cáo: doanh thu xanh, chi phí đỏ, "0 ₫" cũng đỏ — traffic-light cho một con số không phải trạng thái.
`primary-action` (Quick Reference §4: *one primary CTA per screen*), `state-clarity`, `ux#114` (badge = state, không phải mọi pill).
**Quyết định:** một màn một primary (nút ở `ListPageHeader`/`DetailPageShell` header); hành động theo dòng là `outline`/`ghost` size `sm`. Màn Kỳ: hai nút lên **cùng hàng với `h1`** (B) hoặc một action bar một hàng ngay trên bảng với helper text ở bên trái của cùng hàng (A) — mockup A2/B2. Đối soát: badge giữ màu, số tiền và chênh lệch **màu chữ thường**, mũi tên bỏ. Báo cáo: số tiền màu thường, chỉ badge "Lấp đầy" có tone.

### 1.5 Thẻ cao gấp đôi nội dung; lưới Phòng in meta viết hoa gãy dòng

Thẻ Phòng 235 px cho năm dữ kiện (tên · loại+m² · người thuê · giá · ⋯), phần ⋯ chiếm một `CardFooter` riêng 50 px, khoảng trắng giữa giá và footer 40 px (`rooms-1440`; đo). Meta "PHÒNG ĐƠN • 20M²" viết hoa `tracking-wider` và gãy dòng sau dấu `•` (`room-grid.tsx:97`) — `ux#116`, `heading-line-balance`. Thẻ Toà nhà mở đầu bằng **khối ảnh 128 px** (`h-32`, `building-card.tsx:43`) chứa một icon `Building2` xám vì Mock không có ảnh — placeholder cho một tính năng không tồn tại (`ux#87`), rồi "Xem chi tiết" 12 px + ⋯ ở footer. KPI strip 80 px (`p-4`, `text-xl font-bold`) đứng trên **cả** Người thuê với "5 / 5 / 0" — ba con số không đổi từ ngày seed (`tenants-1440`).
**Quyết định:** thẻ Phòng ≈ 96 px — tên + ⋯ một hàng, meta sentence-case "Phòng đơn · 22 m² · Nguyễn Văn A" một dòng `truncate`, giá; badge trạng thái chỉ khi *khác* "Đã thuê" (Trống / Nợ) — mockup A5. Thẻ Toà nhà bỏ khối ảnh cho tới khi Mock/BE có ảnh; tên · địa chỉ · hai số · thanh lấp đầy, ⋯ ở header. `KpiStrip` `p-3`, số `text-lg font-semibold` (A) hoặc thành **một dòng chữ** dưới `h1` (B, `styles#28`). KPI **bỏ** ở Người thuê và Đối soát khi con số là hằng của Mock (§8).

### 1.6 Ngữ pháp `DataTable` áp cho cả bảng 3 dòng; MeterCell không thẳng cột

Đối soát: 3 hạng mục nhưng có ô tìm, facet "Trạng thái", và `PaginationBar` với 5 nút + chọn page size (`reconciliation-1440`). Người thuê: 5 dòng, vẫn pagination. Màn Kỳ: `MeterCell` in nhãn "Điện"/"Nước" **trong mỗi dòng** dù header đã có, bút chì ✎ trôi ở góc trên mỗi ô, ba giá trị (cũ · mới · tiêu thụ) không thẳng cột giữa các dòng vì mỗi ô là một flex riêng, dòng 103 cao hơn vì "gấp 2,2 lần" + nút "Duyệt điện" xếp xuống (`cycle-1440`). Mobile Hoá đơn: từ đỉnh tới dòng đầu **525 px** (đo DOM) — header, `h1`, nút tạo, KPI cuộn ngang bị cắt không dấu hiệu, dòng đếm, ô tìm, facet, CSV mỗi thứ một hàng (`invoices-390`).
`shadcn#26` (DataTable *for complex tables* — ngụ ý: không phải mọi bảng), `ux#19` (Content Jumping — *stable container*), `ux#64` (Mobile First — *core content first*), `ux#115` (chip reflow — cho dải scope cắt ngang).
**Quyết định:** `DataTable` tự ẩn `PaginationBar` khi `total ≤ pageSize` và ẩn ô tìm khi `total < 8` (con số hỏi lại ở §8); Đối soát về `Table` thường. Màn Kỳ: **bảng có header hai tầng** — "Điện (kWh)" / "Nước (m³)" trên, "Cũ · Mới · Dùng" dưới — mỗi giá trị một `td` căn phải, ô nhập 64 px nằm ở cột "Mới", nhãn trong dòng bỏ, ✎ (sửa chỉ số cũ) vào ⋯ cuối dòng, "Duyệt" là nút `sm` cạnh badge — mockup A2/B2. Mobile: toolbar một hàng (tìm · facet-icon · ⋯ chứa CSV/đổi view), KPI 2×2 gọn (A) hoặc hai dòng chữ (B), nút tạo về góc dưới phải trên bottom nav; dòng đầu ở ≈ 360 px (A) / ≈ 270 px (B). Dải scope có **fade mép phải** làm dấu hiệu cuộn.

### Những chỗ nhỏ hơn, ghi để ticket không bỏ sót

- Thang chữ: `h1` 24/bold, header 15/semibold, `CardTitle` 16/semibold, KPI 20/bold, tên thẻ Phòng 18/bold, "Tầng 2" 18/semibold, tiền 14/bold — bảy cỡ đậm (`ux#74` Font Size Scale). Về **bốn nấc**: trang 20/600 · mục 15/600 · thân 14/400 · meta 12/400; chỉ **tiền** được 600 ngoài thang.
- Chart: `--chart-1` của theme là cam `oklch(0.646 0.222 41.116)` — cột doanh thu và nửa donut cam trên app navy (`reports-1440`). `styles#1` *"single accent only"*. Đổi ở **`chartConfig`** (`color: "var(--primary)"`, phụ `var(--muted-foreground)`), không đụng `--chart-*` (ADR-0011 giữ chúng của theme).
- Nửa donut "Tỷ lệ lấp đầy" không in con số ở tâm trong khi KPI ngay trên đã in 83,3 % (`charts#3` *always label with %*; `charts#8` gauge cần *target*, ở đây không có). Bỏ donut, giữ "Lấp đầy theo tầng" với **nhãn giá trị trực tiếp** trên cột (`direct-labeling`), sắp giảm dần (`charts#2`). Cột "Doanh thu theo tháng" thêm nhãn giá trị.
- "Xuất báo cáo" một mình một hàng 50 px giữa `h1` và KPI; nút "Kỳ" một mình một hàng giữa chart và bảng → gộp vào hàng `h1` và hàng toolbar.
- Bảng Kỳ và Hoá đơn: ngày `05/04/2026` → `05/04/26` ở hướng B (một cột hẹp hơn 24 px); hướng A giữ đủ năm.
- `ContractCreate` form nổi không card giữa nền, header căn giữa cột hẹp — lệch với mọi màn khác; cho vào một `card` cùng bề rộng 640 px (không vẽ mockup, việc nhỏ).

---

## 2. Danh sách "bỏ đi" — chung cho cả hai hướng

Round này thắng bằng phép trừ. Mỗi dòng là một chỗ code có tên; ticket cắt theo dòng.

| # | Bỏ / đổi | Ở đâu | Vì (§) |
|---|---|---|---|
| 1 | Tiêu đề + mô tả trong `AppHeader` trên `md+`; `h1` trang `sr-only` dưới `md` | `layout/components/header/app-header.tsx`, `components/page/list-page-header.tsx` | 1.1 |
| 2 | Dòng "N … được tìm thấy" khi không lọc; khi lọc đọc "12 / 30 …" | `components/data-table/data-table.tsx:339–347` | 1.1 |
| 3 | Ô "Liên kết"; cột phải chỉ khi có action ngoài header | `components/page/detail-page-shell.tsx:250–` và từng `*-detail.template.tsx` | 1.2 |
| 4 | `InfoRow` flex-between → `dl` hai cột nhãn 140 px; card một dòng gộp | `components/card/info-card.tsx` | 1.2 |
| 5 | Alert "sắp hết hạn" ở chi tiết Hợp đồng | `features/contracts/templates/contract-detail.template.tsx` | 1.2 · §8 |
| 6 | Icon trang trí trong ô bảng (9 chỗ); hộp icon trước mã; tiền hết `text-primary` | `features/*/components/*-columns.tsx` | 1.3 |
| 7 | `Button` default cho action theo dòng → `outline`/`ghost` `sm` | `components/queue/task-queue.tsx`, `features/cycles/components/cycle-table-row.tsx` | 1.4 |
| 8 | Mũi tên + màu số ở Đối soát; màu xanh/đỏ số tiền ở Báo cáo | `features/reconciliation/components/reconciliation-columns.tsx`, `features/reports/components/report-columns.tsx` | 1.4 |
| 9 | `CardFooter` ⋯ và khoảng trắng của thẻ Phòng; meta uppercase | `features/rooms/components/room-grid.tsx`, `components/card/entity-list-card.tsx` | 1.5 |
| 10 | Khối ảnh `h-32` của thẻ Toà nhà; "Xem chi tiết" footer | `features/buildings/components/building-card.tsx` | 1.5 |
| 11 | `KpiStrip` ở Người thuê; ở Đối soát (§8) | `features/tenants/templates/tenant-list.template.tsx`, `features/reconciliation/templates/reconciliation.template.tsx` | 1.5 |
| 12 | `PaginationBar` khi `total ≤ pageSize`; ô tìm khi `total < 8`; Đối soát về `Table` | `data-table.tsx`, `reconciliation.template.tsx` | 1.6 |
| 13 | Nhãn "Điện/Nước" trong dòng, ✎ trôi; `MeterCell` → 3 `td` trên header hai tầng | `features/cycles/components/{meter-cell,cycle-table-row}.tsx`, `cycle.template.tsx` | 1.6 |
| 14 | Toolbar mobile nhiều hàng → một hàng; nút tạo xuống góc dưới; fade dải scope | `data-table.tsx` (mobile branch), `list-page-header.tsx`, `layout/components/header/building-scope.tsx` | 1.6 |
| 15 | Nửa donut; "Xuất báo cáo"/"Kỳ" một mình một hàng; màu chart → `chartConfig` navy | `features/reports/*` | Nhỏ |
| 16 | Bảy cỡ đậm → bốn nấc | mọi file trên, một lần | Nhỏ |

Không có dòng nào đụng `~/constants/status.ts`, `~/utils/*`, Mock, route, hay store. Đây là round *thuần trình bày* — spec có thể cắt ticket theo composite (mỗi composite một ticket, màn hình đi theo).

---

## 3. Hai hướng — cùng danh sách §2, khác mật độ

| | **A — "Bớt"** | **B — "Nén"** |
|---|---|---|
| Ý tưởng | giữ mọi cỡ chạm/chữ hiện tại, chỉ bỏ §2 | §2 **cộng** thang mật độ `styles#28` |
| Dòng bảng | 44 px | 40 px |
| Body / meta | 14 / 12 | 13 / 12 |
| Ô nhập trong bảng Kỳ | 30 px | 28 px |
| `KpiStrip` | dải thẻ, `p-3`, số 18/600 | **một dòng chữ** dưới `h1`: "Đã thu **85.440.000 ₫** · Quá hạn **11.340.000 ₫ · 4** · …" |
| Thẻ mobile | card có viền, 10/12 px | danh sách chia vạch, không viền, 8 px |
| KPI mobile | 2×2 gọn | hai dòng chữ |
| Ngày trong bảng | `05/04/2026` | `05/04/26` |
| Khoảng cách khối | 16 px | 12 px |
| Dòng đầu (mobile Hoá đơn, đo từ đỉnh) | ≈ 360 px (hiện 525) | ≈ 270 px |
| Dòng đầu (desktop Hoá đơn) | ≈ 380 px (hiện 454) | ≈ 300 px |
| Dòng bảng nhìn thấy ở 900 px cao | ≈ 10 | ≈ 14 |
| Target chạm | 44 px = HIG | 40 px < HIG 44 pt, > WCAG 2.2 AA 24 px (`web-target-size`) |
| Ai hưởng | người dùng điện thoại đi thu tiền | chủ trọ ngồi bàn, 45 phòng |
| Rủi ro | thấp; không đổi test snapshot nào ngoài §2 | trung: `test/globals.test.ts` không đụng, nhưng E2E đếm target/khoảng cách mobile phải chỉnh; 13 px body trên `vi` có dấu cần soi lại |

Mockup: A1–A5, B1–B3. Hướng B chỉ vẽ ba frame vì chi tiết Hợp đồng và lưới Phòng ở B chỉ khác A ở số đo.

**Khuyến nghị:** **A**, vì (1) bottom nav và ô 4 "Thu tiền" của round 3 nhắm người cầm điện thoại, 44 px là giao ước của nó; (2) thắng lớn nhất của round này nằm ở §2 chứ không ở 4 px mỗi dòng — A đã lấy ~70 % cái được của B; (3) B có thể là một `data-density` toggle ở Cài đặt *sau*, khi có người dùng bàn thật — không phải mặc định. Grill quyết.

---

## 4. Component map — composite nào đổi, màn nào đi theo

Mọi thay đổi nằm ở `~/components` và `~/features/layout`; các slice chỉ đổi ở `*-columns.tsx` và thẻ riêng. Không thêm composite mới, không thêm primitive vào `@monorepo/ui`.

| Composite / file | Đổi | Kéo theo |
|---|---|---|
| `layout/.../app-header.tsx` | tiêu đề/mô tả `md:hidden` | mọi màn |
| `page/list-page-header.tsx` | `h1` 20/600, `sr-only` dưới `md`; subtitle nhận `count` | 12 màn danh sách |
| `page/detail-page-shell.tsx` | `h2` 20/600; cột phải điều kiện; bỏ `InfoCard "Liên kết"` | 7 màn chi tiết |
| `card/info-card.tsx` | `InfoRow` → `dl` grid `[140px_1fr]`; `CardTitle` 15/600 | 7 màn chi tiết |
| `card/kpi-strip.tsx` | `p-3`, số `text-lg font-semibold`; (B) biến thể `inline` | Hôm nay, Hoá đơn, Báo cáo, Phòng |
| `data-table/data-table.tsx` | count có điều kiện; ẩn pagination/search theo ngưỡng; hàng `h-11` (A) / `h-10` (B); toolbar mobile một hàng; CSV/view vào ⋯ | mọi danh sách |
| `data-table/pagination-bar.tsx` | không đổi, chỉ được gọi ít hơn | — |
| `queue/task-queue.tsx` | action `outline sm`; icon dòng 16 px | Hôm nay, chuông |
| `card/entity-list-card.tsx` | header có ⋯, không footer; meta sentence-case một dòng | Phòng, Hợp đồng, Người thuê (view thẻ) |
| `features/rooms/components/room-grid.tsx` | thẻ ≈ 96 px (A5) | Phòng |
| `features/buildings/components/building-card.tsx` | bỏ khối ảnh | Toà nhà |
| `features/cycles/components/{meter-cell,cycle-table-row}.tsx` + `cycle.template.tsx` | header hai tầng, 3 `td`/đồng hồ, action bar một hàng | Kỳ |
| `features/*/components/*-columns.tsx` (10 file, 9 chỗ icon) | bỏ icon, tiền căn phải semibold, gộp phụ vào chính | 9 danh sách |
| `features/reports/components/*` | `chartConfig` navy; bỏ donut; nhãn giá trị; gộp hàng nút | Báo cáo |
| `features/reconciliation/*` | `Table` thường; bỏ mũi tên/màu số | Đối soát |
| `layout/.../building-scope.tsx` | fade mép phải dưới `md` | shell |
| `contract-create.template.tsx` | vào card 640 px | tạo Hợp đồng |

`MeterCell` (spec #227 C1) vẫn là *một gate* cho bảng và thẻ mobile — round này đổi **hình** của nó trên desktop (3 `td`) mà không đổi gate; thẻ mobile (`cycle-mobile-card.tsx`) giữ nguyên bố cục, chỉ bỏ nhãn lặp và đổi cỡ nút.

## 5. Token delta so với `globals.css`

**Không có.** Round này không thêm, không đổi token nào ở `apps/smart-rental/src/globals.css` hay `theme.css`:

- Màu chart đổi ở `chartConfig` từng chart (`var(--primary)`, `var(--muted-foreground)`), không đụng `--chart-*` (ADR-0011: chart/status token là của theme).
- Cỡ chữ/độ cao dòng là utility Tailwind tại chỗ (`quality-styling-tailwind`); "bốn nấc" là quy ước viết vào README app, không phải token — chưa có file thứ ba cần đồng bộ (`architecture-shared-components` § shared measurement).
- Hướng B nếu chọn: cũng chỉ là utility khác (`h-10` thay `h-11`, `text-[13px]` — **không**, `text-sm` 14 px giữ, B dùng `text-[13px]` là ngoài thang → nếu B thắng thì B dùng `text-sm` cho body và chỉ nén chiều cao; ghi lại ở §8).

## 6. State list — những trạng thái mockup không vẽ nhưng ticket phải có

- `DataTable`: (a) không lọc, `total ≤ pageSize` → không count, không pagination; (b) lọc → "12 / 30 hoá đơn" + nút xoá lọc; (c) `total < 8` → không ô tìm; (d) rỗng → `EmptyPanel` như cũ; (e) lỗi → `ErrorPanel`; (f) loading → skeleton **cùng chiều cao dòng mới** (`shadcn#41`, `ux#19`).
- `KpiStrip` loading: skeleton `p-3` khớp cỡ mới; (B) skeleton một dòng.
- Bảng Kỳ: Phòng trống (mờ, không ô nhập), thiếu chỉ số (ô nhập trống, badge xám), bất thường (ô nhập viền `warning`, "Dùng" màu `warning`, badge + nút Duyệt `sm`), sẵn sàng, đã lập (ô nhập → số thường, badge "Đã lập"). Ô nhập focus/invalid theo `Input` chuẩn.
- Chi tiết không có action ngoài header → không cột phải, nội dung `max-w-3xl` để `dl` không dài quá `ux#21`.
- Thẻ Phòng: Đã thuê (không badge), Trống (badge xám), Nợ (badge đỏ với số tiền), Bảo trì (nếu status có).
- Mobile `h1 sr-only`: `AppHeader` phải in đúng tiêu đề của màn chi tiết (đang có `resolveNavigationItem` — chi tiết in tên mục cha "Phòng", chấp nhận).
- Dark: không đổi gì — `.dark` vẫn chưa có toggle (pha 2 §10 dòng 17).

## 7. Copy — chỉ đổi những chữ round này chạm

| Hiện | Đề nghị | Vì |
|---|---|---|
| "30 hoá đơn được tìm thấy" (không lọc) | *(bỏ)*; khi lọc: "12 / 30 hoá đơn" | 1.1 |
| "PHÒNG ĐƠN • 20M²" | "Phòng đơn · 20 m²" | 1.5, `ux#116` |
| "Xem chi tiết" (footer thẻ Toà nhà) | *(bỏ — cả thẻ là link)* | 1.5 |
| "Liên kết" / "Xem phòng" / "Xem người thuê" / "Xem toà nhà" | *(bỏ)* | 1.2 |
| "Chỉ lập được từ sau ngày chốt của kỳ, 30/09/2026." | "Chỉ lập được từ 30/09/2026 · 3/6 sẵn sàng · 1 bất thường · 1 trống" | 1.6 — một dòng nói cả điều kiện lẫn tiến độ |
| Header cột "Điện" / "Nước" | "Điện (kWh)" / "Nước (m³)" + hàng phụ "Cũ · Mới · Dùng" | 1.6 |
| "gấp 2,2 lần kỳ trước" + "Duyệt điện" | badge "Điện ×2,2" + nút "Duyệt" | 1.6 |
| Cột "Tiền phòng · Tiền điện · Tiền nước" | "Phòng · Điện · Nước" (nhóm đã nói "tiền") — chỉ hướng B | 3 |
| "Quá hạn" (badge) | "Quá hạn 14 ngày" | số ngày đang ở cột riêng của Hôm nay, đưa vào badge để bảng bỏ cột |

Không có string mới cần i18n (app không có i18n — README).

## 8. Câu hỏi mở cho grill

1. **A hay B?** — hay A làm mặc định và B là một `data-density` toggle ở Cài đặt (thêm một store field → *không* còn là round thuần trình bày).
2. Alert "sắp hết hạn" ở chi tiết Hợp đồng: bỏ hẳn (badge + stepper + nút Gia hạn đã nói), hay giữ dạng một dòng text mờ dưới stepper?
3. Ngưỡng ẩn ô tìm: `< 8` dòng? `< 12` (= page size)? Hay chỉ ẩn pagination, ô tìm giữ luôn cho nhất quán?
4. KPI ở Người thuê "5 / 5 / 0": bỏ hẳn, hay giữ vì BE thật sẽ có "Đã rời" ≠ 0? Đối soát: "Tổng thu / Tổng chi / Chênh lệch / Tỷ suất" là *nội dung* màn, không phải KPI — giữ dạng dòng chữ (B) dù chọn A?
5. `AppHeader` desktop bỏ tiêu đề: có giữ mô tả một dòng cho màn *chi tiết* (nơi `h1` là tên thực thể, không phải tên mục) — hay breadcrumb của `DetailPageShell` (route sâu ≥ 3) đã đủ?
6. Thẻ Toà nhà bỏ khối ảnh: đến khi BE có ảnh thì ảnh về lại làm nền `h-32` hay thành avatar 40 px trong header thẻ? (quyết định *trước* để không vẽ lại lần ba.)
7. Hướng B: body 13 px là ngoài thang `text-sm`; nếu B thắng, nén chiều cao thôi (`h-10`, `py-1.5`) và giữ 14 px?
8. Cột "Hạn thanh toán" trong Hoá đơn: giữ, hay đưa vào badge ("Quá hạn 14 ngày") và bỏ cột trên mobile?

## 9. Không nằm trong round này

- Không đổi IA/sidebar/bottom nav (#221), không đổi flow Kỳ (#179), không đổi `MeterCell` gate hay `contractActions` (#227), không đổi Mock/World (#205), không đổi token (ADR-0011), không dark toggle.
- Không đụng sign-in (đã gọn), không đụng `communications`/`settings`/`compliance` ngoài những gì §2 kéo theo qua composite.
- Không "đẹp" bằng thêm: không gradient, không ảnh minh hoạ, không illustration cho empty state, không animation mới — `ui-reasoning#105` anti-pattern *"Excessive decoration + Complex shadows"*, `styles#1` *"No unnecessary decorations"*. Đẹp ở round này = ít thứ hơn, thẳng hàng hơn, một cỡ cho một vai.

---

## 10. Quyết định sau grill (2026-09-19, 22 câu — mọi câu chốt theo khuyến nghị)

Phần này là nguồn cho `/to-spec`. §8 giữ nguyên làm bản ghi câu hỏi; câu trả lời ở đây thắng.

| # | Quyết định |
|---|---|
| Q1 | **Hướng A "Bớt"** — giữ target 44 px, không toggle mật độ. B ghi lại làm phương án tương lai, không có store field. |
| Q2 | `AppHeader` trên `md+` **bỏ hẳn** tiêu đề + mô tả; còn trigger · search · chuông · avatar. Màn chi tiết dựa vào sidebar active + "Quay lại"/breadcrumb. Dưới `md` header giữ tiêu đề mục, `h1` trang `sr-only`. |
| Q3 | **`DataTable` là chủ con số**: toolbar luôn in "30 hoá đơn" hoặc "12 / 30 hoá đơn" khi lọc; subtitle `h1` bỏ số. Sửa 1 unit test + 2 E2E đang bám "được tìm thấy". |
| Q4 | Ô tìm và `PaginationBar` **cùng ẩn khi `total ≤ pageSize`**. |
| Q5 | Đối soát **giữ `DataTable`** (Q4 đã làm gọn). |
| Q6 | `KpiStrip` **bỏ ở Người thuê**, giữ ở Đối soát. |
| Q7 | Alert "sẽ hết hạn trong n ngày" **bỏ**; badge đọc "Sắp hết hạn · 11 ngày". |
| Q8 | Ô "Liên kết" **bỏ ở mọi màn**; link thuộc-về nằm ở dòng meta dưới tên (≤ 4 mục). |
| Q9 | "Người thuê hiện tại" thành một `dt/dd` trong "Thông tin phòng"; Phòng trống đọc "— (trống)" + link "Tạo hợp đồng" khi `contractActions` cho phép. |
| Q10 | Thẻ Toà nhà bỏ khối ảnh `h-32`; khi có `imageUrl` → avatar 40 px cạnh tên, chiều cao thẻ không đổi. |
| Q11 | Hoá đơn: desktop giữ cột Hạn (sort được) + badge có số ngày; **mobile bỏ cột, chỉ badge**. |
| Q12 | Mobile **không FAB**: nút tạo là `+` icon-only trên header cạnh search/chuông. Mockup A3/B3 đã sửa. |
| Q13 | Màn Kỳ: **action bar riêng ngay trên bảng**, helper text cùng hàng bên trái. |
| Q14 | `MeterCell` giữ một gate, **render 3 `td`** cho bảng (header hai tầng Cũ · Mới · Dùng) và 1 khối cho thẻ mobile. |
| Q15 | Bốn nấc chữ (20/600 · 15/600 · 14/400 · 12/400; chỉ tiền 600 ngoài thang) ghi ở README § round 4 **+ test text-scan**. |
| Q16 | Chart: bỏ nửa donut; "Lấp đầy theo tầng" **một màu navy + nhãn %**; màu qua `chartConfig` → `var(--primary)`. |
| Q17 | **Cắt theo composite, 7 ticket**: T1 shell/`AppHeader` + `ListPageHeader` · T2 `DataTable` (count, ngưỡng, hàng 44, toolbar mobile, `+` header) · T3 `DetailPageShell` + `InfoCard` `dl` (+ card 640 cho tạo Hợp đồng) · T4 `KpiStrip` + thẻ Phòng/Toà nhà/`entity-list-card` · T5 10 file `*-columns` + `TaskQueue` nút · T6 Kỳ (`MeterCell` 3 `td`, action bar) · T7 Báo cáo + Đối soát. |
| Q18 | KPI mobile: **lưới 2×2**; 3 KPI thì ô thứ 3 full-width. |
| Q19 | Test text-scan quét `src/components/**` + `src/features/**/templates/**`. |
| Q20 | **T8 tổng kiểm** riêng: chụp lại 14 route, đo lại số §1 (dòng đầu mobile ≤ 360 px, hàng 44 px, 1 primary/màn, 0 icon trang trí trong ô), cập nhật README + CLAUDE.md §1, comment tổng kết lên spec. |
| Q21 | T1–T7 **song song theo worktree** trên `dev`; T5 blocked by T2 (cùng đụng `test/components/data-table`); T8 blocked by tất cả. |
| Q22 | Hàng đợi Hôm nay: "Nhắc tất cả" `outline sm`, "Xem n hoá đơn" `ghost sm`; không primary theo dòng. |

Không ADR (đảo ngược rẻ, không trade-off cấu trúc). Không term mới cho `apps/smart-rental/CONTEXT.md`. Không token mới (§5 giữ nguyên). E2E: `buildings-rooms`, `invoices-utilities` sửa selector theo Q3; `shell.e2e` sửa theo Q2/Q12; các spec khác kiểm lại ở T8.
