# Design brief — round 3 "dễ hơn" cho `apps/smart-rental` (sau spec #153)

> **Đã implement, spec #179** (10 ticket #180–#189 merge vào `dev` 2026-09-18; #190 là tổng kiểm + cập nhật tài liệu). Bản ghi *tại thời điểm quyết* của bước design. Grill 2026-09-18 chốt 24 quyết định (§11) → **spec [#179](https://github.com/qtuan02/monorepo/issues/179)**, ADR-0013. Tài liệu này giữ nguyên nội dung quyết định, không phải mô tả app hiện tại; hình dạng app sau khi ship đọc ở `apps/smart-rental/README.md` § Hình dạng round 3 và CLAUDE.md §1, tổng kết 24 quyết định (cái nào ship, cái nào lệch và vì sao) ở comment trên spec [#179](https://github.com/qtuan02/monorepo/issues/179).

- **Ngày:** 2026-09-18
- **Bước:** design, chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`, không `--persist`. **Không** dùng `colors.csv`/`typography.csv`: app đã có brand (ADR-0011 — navy `#1e3a5f`, radius `0.375rem`, IBM Plex Sans, bề mặt phẳng). Round này **không đổi vỏ**; nó đổi thứ tự việc, số bước và số thứ người dùng phải nhớ.
- **Đầu vào:** [`docs/research/smart-rental-usability-round3.md`](../research/smart-rental-usability-round3.md) (2026-09-18, HEAD `031ccfc`, 147 ảnh, số đo DOM + WCAG) — Phần A tám flow đếm click/field, Phần B thuật ngữ/IA, Phần C audit + contrast, §D 20 câu, §E 22 đề xuất; brief pha 2 [`smart-rental-redesign.md`](./smart-rental-redesign.md) §10 (37 quyết định — cái nào round này chạm tới thì ghi rõ); `apps/smart-rental/CONTEXT.md`; ADR-0011/0012; contract BE `fe-api-integration/*.md` (chỉ đọc).
- **Đầu ra:** tài liệu này + một mockup HTML tĩnh [`smart-rental-round3/mockup-v1-de-hon.html`](./smart-rental-round3/mockup-v1-de-hon.html) — năm frame (Hôm nay 1240 · Hôm nay 390 + sheet "Thêm" · màn "Kỳ" gộp Chỉ số + Đợt · wizard Hợp đồng 2 bước · chi tiết Hoá đơn gọn + VietQR "Đã nhận") và một dải token badge trước/sau. Tự chứa, không script, không font ngoài.
- **Cách đọc trích dẫn:** `ux#NN` / `shadcn#NN` = hàng `No=NN` trong `ux-guidelines.csv` / `stacks/shadcn.csv` dưới `.agents/skills/ui-ux-pro-max/data/` (grep `^NN,`); `NN/g H#n` = heuristic Nielsen; `A.2`, `B.5`, `C.5`, `E12`, `D.3` = mục trong research note. Brief không lặp lại bằng chứng.
- **Giả định nền:** Mock kỳ 09/2026 được sửa cho nhất quán **trước** mọi ticket UI (E21 — hiện Hoá đơn 09 đã có mà Chỉ số 09 còn `DRAFT`, nên Hôm nay tự mâu thuẫn). Mọi frame vẽ trên scope b1 với số của research; không bịa số.

---

## 1. Chẩn đoán — vì sao Portal "đúng" mà chưa "dễ"

Pha 2 dựng đúng ngữ pháp màn hình (một `DetailPageShell`, một `DataTable`, một `KpiStrip`, một `StatusBadge`). Research đo lại và thấy ma sát không nằm ở vỏ mà ở **sáu chỗ có tên**, mỗi chỗ là một quyết định design round này phải ra.

### 1.1 Hôm nay là hàng đợi, nhưng hàng đợi lặp và KPI trùng số

Cùng danh sách việc ở ba nơi (Hôm nay · chuông · `/tasks`); 10 dòng "Hoá đơn HÓA-07x quá hạn · Cao" giống hệt nhau không gộp; "Cần thu tháng này" = "Quá hạn" mỗi khi ngày thu đã qua (B.1, B.3, C.2); việc sắp theo *nguồn* chứ không theo *hạn* — một Hợp đồng hết hạn ngày mai đứng sau 10 Hoá đơn; donut + bar chiếm 3/7 màn đầu cho hai con số nhìn hằng tháng (NN/g *Dashboards*: tránh circular; *Progressive disclosure*: màn đầu = việc hằng ngày). `ux#79` (Empty States — mặt trái: hàng đợi nói nhiều mà không ai đọc), `ux#114` (badge "Cao" là hằng theo loại → không phải state).
**Quyết định:** Hôm nay = **KPI 3 ô + hàng đợi gộp theo loại, sắp theo hạn + hai card "Tháng này"/"Vừa xong" dạng số**, chart rời sang Báo cáo; "Việc cần làm" rời sidebar (chuông giữ, `/tasks` giữ làm bản lọc — hoặc bỏ, §9.3). F1/F2.

### 1.2 Chuỗi tháng (chỉ số → Đợt → thu) cắt thành ba màn ở hai nhóm sidebar

Nhập chỉ số ở "Quản lý" hàng 3, Đợt ở "Hoá đơn" hàng 2; Đợt nói "Chưa đủ điều kiện" mà không nói thiếu điện hay nước, không link sang Nhập chỉ số; Nhập chỉ số không điền sẵn Nháp của kỳ; bảng xem trước Đợt không có cột điện/nước (A.3, A.4). Mỗi màn chọn kỳ và scope lại từ đầu. `ux#106` (Redundant Entry — WCAG 2.2 A), NN/g H1/H6/H9. Contract BE: Chỉ số **thuộc Hoá đơn** (`POST /invoices/{id}/utility-readings`), cron `invoice-generator` tự lập, FE duyệt Nháp (D.3, D.4).
**Quyết định (hai hướng, §2.1):** Hướng 2 vẽ trong F3 — **một màn "Kỳ điện nước & hoá đơn"**; Hướng 1 giữ hai màn và chỉ nối.

### 1.3 Wizard Hợp đồng bốn bước, hai bước đầu mỗi bước một ô, ba thứ hỏi lại

≥ 14 click, 8 field bắt buộc, `rentAmount` mặc định 3.000.000 dù `Room.price` có, `paymentDueDay` hỏi nhưng hạn thu lấy từ Toà nhà, ngày kết thúc chọn lịch thay vì thời hạn, Phòng trống không có lối "Tạo hợp đồng", tạo xong Phòng không đổi trạng thái (A.2). NN/g *Wizards*: mỗi bước phải có nhiều thông tin thì mới đáng một bước. `ux#81` (Progress Indicators ✓ giữ), `ux#106`.
**Quyết định:** **2 bước** — "Phòng & Người thuê" (hai combobox cạnh nhau; option Phòng ghi Toà nhà; vào từ Phòng trống thì đã chọn sẵn) và "Điều khoản & xác nhận" (giá từ Phòng, cọc = 1 tháng mặc định, ngày thu từ Toà nhà, **thời hạn** 6/12/khác thay ngày kết thúc, tóm tắt sống ở cột phải). F4. Gia hạn và Thanh lý lấy cùng bố cục "form trái + tóm tắt phải luôn có" (sửa cột phải trống của A.8).

### 1.4 Thu tiền gõ lại thứ app đang hiện; "Gửi nhắc" ở Hôm nay nói dối

Sheet thanh toán để trống số tiền dù "Còn lại" hiện ở tab bên cạnh; nút VietQR hiện cả khi Còn lại = 0; sau khi quét không có gì nối sang "đã nhận" (3 click nữa); "Gửi nhắc" ở Hôm nay chỉ toast "nhật ký đã ghi" nhưng không ghi (A.5). NN/g H1 (toast sai sự thật), H6, H8 (card "Hành động" một nút). `ux#34`/`ux#83` (Success Feedback phải *thật*).
**Quyết định:** "Ghi nhận thu *n* đ" là primary với số tiền **điền sẵn = còn lại**; dialog VietQR có "Đã nhận *n* đ" dùng cùng mutation; VietQR ẩn khi Còn lại = 0; "Nhắc tất cả" ở Hôm nay mở đúng dialog chọn kênh của list (ghi nhật ký thật) — hoặc bỏ nút. F5.

### 1.5 Ba nhãn cho một "ngày", hai công thức cho một "Quá hạn", bốn tên cho một màn

`utilityCycleDay` / `collectionDay` / `Contract.paymentDueDay`; KPI Quá hạn = `amount` ở list, = `outstanding` ở Hôm nay; "Tạo hoá đơn hàng loạt" / "Lập đợt hoá đơn" / "Tạo hoá đơn" / "Tạo & Gửi"; "Đã xác minh" vs "Đã xác nhận"; `2026-09` vs `09/2026`; h1 "Quản lý …" (B.1, B.2). NN/g H2, H4.
**Quyết định:** một khái niệm **"Ngày thu"** trên Toà nhà (Hợp đồng chỉ override khi cần, §9.6); một công thức Quá hạn = outstanding; bảng copy §7.

### 1.6 Mobile thiếu Đăng xuất và cắt nút; badge dưới AA

`ItemActions` không wrap → "Xem" bị cắt còn "Xe"; không có tài khoản/Đăng xuất ở 390 (menu `hidden md:block`, sheet "Thêm" chỉ 11 khu vực); danh sách mặc định là thẻ 429 px cũ nhất trước (C.4). Bốn tone `statusTone` 1,98–3,99:1 trên nền `/10`; `globals.test.ts` không đo (C.5). `ux#36` (High), WCAG 1.4.3, `ux#22`/`ux#104`.
**Quyết định:** Item action xuống dòng riêng trên mobile; sheet "Thêm" = hàng tài khoản + lưới + "Đăng xuất" tách riêng; bảng mặc định desktop / Item mobile; **4 token chữ badge** ở app (§5). F2, dải token.

---

## 2. Hai câu hỏi có hướng — phần còn lại là một lớp nền

### 2.1 Chuỗi tháng: Hướng 1 "nối hai màn" hay Hướng 2 "một màn Kỳ"

| | Hướng 1 — nối | Hướng 2 — gộp (F3) |
|---|---|---|
| Màn | `/utilities/meter-input` + `/invoices/batch` giữ nguyên | một `/billing-cycles/:month` (tên route §9.1), thay cả hai; `/utilities` còn là **lịch sử** chỉ số |
| Sửa gì | "Chưa đủ điều kiện" → "Thiếu chỉ số điện Phòng 103" + link; Nhập chỉ số điền sẵn Nháp; Đợt thêm cột điện/nước/tổng; Hôm nay "chưa lập Đợt" trỏ Nhập chỉ số khi thiếu | bảng một hàng/Phòng: chỉ số cũ (đọc) · mới (điền sẵn Nháp) · tiêu thụ · tiền phòng · điện · nước · tổng · trạng thái; bất thường inline + "Duyệt điện/nước" **riêng từng đồng hồ**; footer "Lập *n* hoá đơn đủ điều kiện"; chọn kỳ ‹ › một lần |
| Mô hình dữ liệu | FE hiện tại (Chỉ số rời theo Phòng/kỳ) | gần BE target (Chỉ số gắn kỳ/Hoá đơn Nháp; `reading_end ≥ reading_start` chặn tại chỗ) |
| Chi phí | 3–4 ticket nhỏ | 1 ticket lớn + đổi Mock `utilities` + task derivation E21 |
| Rủi ro | vẫn 2 lần mở/2 lần chọn kỳ mỗi tháng | route mới, E2E mới; "Nhập chỉ số" mobile phải vẽ lại thành thẻ/Phòng |

**Đề xuất:** Hướng 2 — chuỗi này là việc tháng nào cũng làm, và Hướng 1 giữ nguyên số lần chọn kỳ/scope. Nếu grill giữ Hướng 1, F3 vẫn cho bảng cột điện/nước và ô điền sẵn.

### 2.2 Hôm nay: hàng đợi gộp (F1) hay giữ 1 dòng/việc

Gộp: 4 Hoá đơn quá hạn thành **một** dòng có tổng tiền + "Nhắc tất cả" + mở rộng từng Hoá đơn (sub-item với "Ghi nhận thu"/"VietQR"); Hợp đồng/Chỉ số/Lưu trú vẫn một dòng/việc vì mỗi việc một hành động khác nhau. Sắp theo hạn (quá hạn → hôm nay → 7 ngày). Giữ 1 dòng/việc thì `/tasks` và Hôm nay là một; gộp thì `/tasks` là bản **không gộp** có facet — hoặc bỏ (§9.3).

---

## 3. Lớp nền — bố cục từng màn đổi gì

### 3.1 Shell & IA (F1, F2)

- Sidebar **theo chuỗi việc**, 4 nhóm: *Hôm nay* · **Tháng này** (Kỳ điện nước & hoá đơn · Hoá đơn · Đối soát) · **Người & phòng** (Toà nhà · Phòng · Người thuê · Hợp đồng · Khai báo lưu trú) · **Sổ sách** (Hoá đơn NCC · Chi phí · Báo cáo) · **Hệ thống** (Thông báo · Cài đặt). 14 mục (bỏ "Việc cần làm"). Thứ tự trong "Tháng này" = thứ tự làm.
- Bottom nav: Hôm nay · Phòng · Người thuê · **Thu tiền** · Thêm. "Thu tiền" = `/invoices?status=UNPAID,PARTIAL,OVERDUE&sort=dueDate` — cùng route, khác query. Sheet "Thêm": hàng tài khoản trên cùng (avatar · tên · email · "Hồ sơ"), lưới 3 cột 9 khu vực, **"Đăng xuất" tách riêng dưới cùng** (ux — *destructive-nav-separation*).
- Header: `Kbd` hiện `Ctrl K` trên Windows/Linux, `⌘K` trên Mac (đọc `navigator.platform`/`userAgentData`).
- Chuông giữ, nhưng là bản của hàng đợi có **cùng gộp** với Hôm nay.

### 3.2 Hôm nay (F1, F2)

- h1 ngày, mô tả "*n* việc cần làm · *m* Phòng, *k* đang thuê". Nút header: **việc kế tiếp của tháng** (Nhập chỉ số kỳ → Lập Đợt → không có), không phải "Lập đợt hoá đơn" cố định (A.1 ngõ cụt khi scope null).
- KPI 3 ô: "Còn phải thu tháng này" (một số, dòng phụ **"*n* Hoá đơn quá hạn"** đỏ) · "Hợp đồng sắp hết hạn" (dòng phụ ngày gần nhất) · "Chỉ số kỳ MM/YYYY *x*/*y* phòng" (dòng phụ bất thường/chưa lập). Bỏ ô Quá hạn riêng (E19), bỏ "Doanh thu" khỏi màn đầu.
- Hàng đợi: `Item` + `ItemActions`; dòng gộp có `ico` = số lượng; sub-item nền `bg-muted`, thụt trái; mỗi dòng ≤ 2 hành động, **primary là hành động ghi nhận** (Gia hạn / Sửa chỉ số / Khai báo / Ghi nhận thu), "Xem" là ghost. Bỏ badge ưu tiên khi cùng giá trị trong nhóm.
- Dưới: hai card số "Tháng này" (lấp đầy · đã lập · đã thu · còn phải thu · link Báo cáo) và "Vừa xong" (3 sự kiện gần nhất từ nhật ký Thanh toán/Nhắc/Gia hạn — nguồn có sẵn trong Mock). Donut/bar → Báo cáo.
- Mobile: KPI cuộn ngang 150 px giữ (quyết định 16); `ItemActions` xuống dòng, nút 36 px.

### 3.3 Màn "Kỳ" (F3, nếu Hướng 2)

- h1 "Kỳ MM/YYYY · Toà nhà", mô tả = ngày chốt + giá điện/nước từ Cài đặt Toà nhà (link "Sửa giá"); chọn kỳ ‹ › ở header; scope ≠ một Toà nhà → `BuildingScopeRequiredPanel` như hiện tại.
- Stepper 3 ô chỉ để định vị (Chốt chỉ số & kiểm tiền → Lập Đợt → Thu tiền *ở Hoá đơn*), không phải wizard.
- Bảng: một hàng/Phòng đang thuê (Phòng trống hiện mờ "Không lập"); ô chỉ số mới `pre` (điền sẵn Nháp, nền `accent`), ô rỗng cho chưa nhập, ô `err` cho bất thường với lý do inline ("↑2,3×", "−1.007"); giảm chỉ số **không lưu được** (H5; BE `reading_end ≥ reading_start`); "Duyệt" riêng từng đồng hồ. Tiền phòng theo ngày ở (21/30) nếu Hợp đồng bắt đầu giữa kỳ. Footer: tổng + đếm trạng thái.
- Hành động: "Lưu nháp chỉ số" (ghost, lưu = Nháp — E15), "Lập *n* hoá đơn đủ điều kiện" (primary, disabled khi *n* = 0 với lý do ngay cạnh). Phòng đã có Hoá đơn kỳ này: badge "Đã có hoá đơn", không lập lại.
- Mobile: thẻ/Phòng như `meter-input-card.tsx` hiện tại + 3 dòng tiền.

### 3.4 Wizard Hợp đồng (F4), Gia hạn, Thanh lý

- 2 bước; `?room=` prefill từ chi tiết Phòng trống (thêm nút "Tạo hợp đồng" ở đó, A.2); tóm tắt sống cột phải từ bước 2; "Ký hợp đồng" ở card tóm tắt.
- Sau ký: Phòng → `occupied` (sửa `useCreateContract`); Hôm nay sinh việc Thông báo lưu trú cho Người thuê mới.
- Gia hạn: "Thời hạn thêm" 6/12/khác thay ngày kết thúc; `notes` lưu thật hoặc bỏ ô (A.8); card xác nhận có từ đầu, cập nhật theo form.
- Thanh lý: card "Số trả lại" trống/"chọn cách quyết toán" cho tới khi chọn (A.6); Alert cảnh báo dùng tone `warning` với token chữ mới.

### 3.5 Chi tiết (F5) — sửa `DetailPageShell` một lần cho 10 màn

- Bỏ card "Tóm tắt" trùng header; card "Hành động" chỉ render khi ≥ 2 hành động, còn không thì hành động lên header; cột phải **ẩn khi rỗng** (main full width).
- Tabs lên URL `?tab=` qua `hooks/use-url-tab.ts` (đã có, chỉ Thông báo dùng) → Hôm nay "Khai báo" link thẳng tab Lưu trú (E14).
- Breadcrumb ở mọi route depth ≥ 3 (giữ), "‹ Tên khu vực" ở depth 2 (giữ).
- Hoá đơn: meta "Phòng 102 · Người thuê · kỳ · hạn" một dòng (bỏ "Phòng Phòng"); bảng dòng + Tổng cộng **một lần** (footer); card Thanh toán liệt kê + "Còn lại"; VietQR như §1.4. Toà nhà: một lối vào Cài đặt (tab), một "83%". Hợp đồng: stepper vòng đời **không tick bước chưa qua** (B.2), rút xuống ngang trong header thay 520 px cột phải (§9.8).

### 3.6 Danh sách

- `useListView` mặc định **`table`** trên desktop, `renderMobileRow` (Item) trên `< md`; thẻ chỉ còn ở Phòng (lưới tầng). Nhớ lựa chọn view trên URL như hiện tại.
- Sort mặc định: Hoá đơn theo `dueDate` tăng dần với chưa thu/quá hạn trước; Hợp đồng theo `endDate`; Người thuê theo tên.
- Lưới Phòng scope null: nhóm **Toà nhà → tầng** (E13), hoặc ép chọn Toà nhà (§9.7).
- "Chưa thu" KPI gồm cả quá hạn (một bucket "còn phải thu") hoặc đổi nhãn "Chưa tới hạn" (E19).

---

## 4. Component map — không thêm dependency

| Cần | Dùng | Ghi chú |
|---|---|---|
| Dòng việc gộp + mở rộng | `@monorepo/ui/components/item` (`Item`, `ItemActions`, `ItemContent`) + `collapsible` | sub-item là `Item` với `className="pl-15 bg-muted"`; mở/đóng bằng `Collapsible`, không state riêng |
| Action wrap mobile | `ItemActions` + `flex-wrap` / `basis-full md:basis-auto` | sửa ở `~/components/queue/task-queue.tsx`, một chỗ |
| Sheet "Thêm" | `sheet` (`shadcn#14`) + `Avatar` + `Separator` | Đăng xuất dùng `buttonVariants({variant:"ghost"})` + `text-destructive` |
| Bảng Kỳ | `DataTable` (`shadcn#26`) với cell là `Input` `inputMode="numeric"` | ô điền sẵn: `data-prefilled` + `bg-accent`; bất thường: `aria-invalid` + `FieldError` inline |
| Segmented "Cọc 1/2 tháng", "Thời hạn 6/12/khác" | `toggle-group` (đã dùng cho scope) | "Khác" mở `Input` cạnh đó, không dialog |
| Tóm tắt sống wizard | `Card` + `useWatch` từng field (`forms-use-watch`) | không `watch()` cả form |
| Tab trên URL | `hooks/use-url-tab.ts` (có sẵn) | `DetailPageShell` nhận `tabParam` |
| Kbd theo platform | `kbd` + hook nhỏ `use-is-mac` (Own, `@monorepo/hook`) hoặc inline `navigator.platform` trong `search-dialog.tsx` | inline đủ; hook khi có nơi thứ hai |
| "Đã nhận" VietQR | cùng `useRecordInvoicePayment` | không mutation mới |
| "Vừa xong" | đọc nhật ký Thanh toán + Nhắc + Gia hạn đã có trong Mock qua `~/hooks/api` | không Mock mới |

Không dùng: `accordion` cho hàng đợi (Collapsible đủ), chart mới, drag-drop, thư viện ngày.

---

## 5. Token delta

Chỉ **bốn** token mới, ở `apps/smart-rental/src/globals.css` (unlayered, cùng khối ADR-0011), không đổi theme dùng chung:

| Token | Giá trị | Trên nền `/10` | Trên card | Thay cho |
|---|---|---|---|---|
| `--success-foreground-strong` | `#016630` (green-800) | 6,37:1 | 7,13:1 | `text-success` 2,87 |
| `--warning-foreground-strong` | `#973c00` (amber-800) | 6,57:1 | 7,09:1 | `text-warning` 1,98 |
| `--info-foreground-strong` | `#193cb8` (blue-800) | 7,83:1 | 8,82:1 | `text-info` 3,34 |
| `--destructive-foreground-strong` | `#9f0712` (red-800) | 7,02:1 | 8,36:1 | `text-destructive` 3,99 |

`statusTone` (`constants/status.ts`) đổi lớp chữ sang token mới; nền `/10`, icon, viền, chart **giữ** màu theme (ADR-0009: nghĩa trạng thái không đổi giữa app). `-700` đạt cho 3 tone nhưng `green-700` chỉ 4,42:1 → chọn `-800` cả bốn cho một quy tắc. `test/globals.test.ts` thêm 4 cặp này vào bảng đo (AA ≥ 4,5). Cách tính: research §C.5. Nếu grill muốn sửa ở theme thay vì app → ADR mới, ảnh hưởng 7 app (§9.5).

Chart `--chart-1/-2` (cam/teal) rời khỏi màn đầu nên câu hỏi override chart (D.16) **không còn gấp**; giữ theme.

---

## 6. State list

| Màn | State phải vẽ/kiểm |
|---|---|
| Hôm nay | 0 việc ("Không có việc nào — tháng này đã lập Đợt, đã thu đủ") · scope null (KPI cộng dồn, nút header ẩn nếu việc kế tiếp cần một Toà nhà) · nhóm mở/đóng · nhóm 1 phần tử (không gộp) · > 7 việc (link "Xem tất cả *n*" → `/tasks`) |
| Kỳ | scope null → panel chọn Toà nhà · kỳ tương lai (disabled ‹›) · 0 Phòng đang thuê · tất cả đã có Hoá đơn (footer "Đã lập đủ", nút ẩn) · bất thường chưa duyệt (nút lập đếm không gồm) · Toà nhà chưa có giá điện nước (Alert + link Cài đặt) |
| Wizard | `?room=` không tồn tại/không trống → bước 1 trống + toast · Người thuê "Thêm mới" (Sheet như hiện tại) · lỗi validate bước 2 hiện dưới field, tóm tắt vẫn cập nhật |
| Hoá đơn chi tiết | Còn lại = 0 (không VietQR, primary → "Xem biên lai"/không có) · Đã huỷ · Toà nhà không có tài khoản (dialog VietQR → Alert + link, đã có ở WT) |
| Mobile | sheet "Thêm" đóng/mở · Item 1 action / 2 action · KPI ô thứ 3 cắt chữ (dùng nhãn ngắn "Chỉ số 09") |
| Badge | 4 tone × trên `/10` × trên card × trong `Alert` |

Skeleton/empty/error panel giữ nguyên ngữ pháp pha 2 (`~/components/panel/*`).

---

## 7. Copy — về glossary (không i18n, quyết định 17)

| Hiện | Đổi thành | Chỗ |
|---|---|---|
| Tạo hoá đơn hàng loạt / Lập đợt hoá đơn / Tạo hoá đơn / Tạo & Gửi *n* hoá đơn | **Lập Đợt hoá đơn** (khu vực), **Lập *n* hoá đơn** (submit) — bỏ "Gửi" | h1, nút Hôm nay, nút list, submit |
| Quản lý hoá đơn / Danh sách phòng / Quản lý Người thuê | Hoá đơn / Phòng / Người thuê | h1 = tên sidebar |
| "Tổng quan hoạt động quản lý phòng trọ." | "Việc cần làm hôm nay." | `navigation.ts` mô tả Hôm nay |
| "Quản lý khai báo nơi ở và kiểm tra an toàn." | "Thông báo lưu trú và Đăng ký tạm trú của Người thuê." | mô tả Khai báo lưu trú |
| Đã xác minh | Đã xác nhận | `utilityStatusConfig.VERIFIED` |
| `2026-09` (tiêu đề việc) | 09/2026 | `task-derivation.ts` |
| Phòng Phòng 102 | Phòng 102 | meta Hoá đơn |
| Chưa đủ điều kiện | Thiếu chỉ số điện / nước kỳ 09/2026 | Đợt (Hướng 1) — Hướng 2 là badge "Chưa nhập" |
| Ngày chốt điện nước / Ngày thu trong tháng / Chu kỳ thu | **Ngày thu** (Toà nhà); Hợp đồng: "Ngày thu riêng (tuỳ chọn)" | 3 form |
| Quá hạn (KPI list, = amount) | Quá hạn (= còn lại) | `invoice-calculations.ts` |
| Doanh thu (Hôm nay) | Đã lập / Đã thu (hai số) | card "Tháng này" |
| ⌘K | Ctrl K (Windows/Linux) | `search-dialog.tsx` |
| Cao (badge ưu tiên) | bỏ khi cùng giá trị trong nhóm | `task-queue.tsx` |
| "Đã gửi nhắc — Nhật ký nhắc được ghi trên hoá đơn" (toast Hôm nay) | chỉ khi ghi thật | A.5 |

---

## 8. Những gì không đổi

Palette/radius/font ADR-0011; `DetailPageShell`/`DataTable`/`KpiStrip`/`StatusBadge`/`FormSheet` là composite (chỉ sửa props/mặc định); Building scope tabs (quyết định C); `Đối soát`/`Báo cáo` suy ra (ADR-0012); Mock theo contract BE; không i18n, không dark-mode toggle, không sign-up (README "không có"); E2E/Gate như #167; Storybook không đụng.

---

## 9. Câu hỏi mở — cần chủ repo trả lời ở grill

### 9.1 Chuỗi tháng — Hướng 1 hay Hướng 2 — **CẦN CHỦ REPO**
Đề xuất Hướng 2 (§2.1). Nếu Hướng 2: tên route (`/billing-cycles/:month`? `/cycles/:month`?), `/utilities` còn giữ làm lịch sử không, Mock `utilities` gắn `invoiceId` hay giữ rời + join theo kỳ (D.3).

### 9.2 Cái gì BE sẽ tự làm thì FE vẽ thế nào — **CẦN CHỦ REPO**
Cron lập Đợt, quá hạn, nhắc T2/T5, webhook QR, tạm trú hết hạn (D.4). Round này vẽ nút tay (Mock) nhưng đặt copy/state để sau chỉ đổi thành "đã tự lập, cần duyệt"? Hay vẽ ngay dạng duyệt?

### 9.3 Hôm nay gộp; `/tasks` giữ hay bỏ; "Việc cần làm" rời sidebar — **CẦN CHỦ REPO**
§2.2. Sắp theo hạn thay theo nguồn. `/tasks` = bản không gộp có facet, hay bỏ (chuông đủ).

### 9.4 Wizard 2 bước, thời hạn thay ngày kết thúc, cọc mặc định 1 tháng
§1.3. Có giữ `paymentDueDay` trên Hợp đồng làm override không (→ 9.6)?

### 9.5 Bốn token chữ badge ở app hay ở theme — **CẦN CHỦ REPO**
§5. App: 4 dòng CSS + test, không ảnh hưởng app khác. Theme: mọi app đạt AA cùng lúc nhưng cần ADR và Storybook kiểm lại.

### 9.6 Ba "ngày" → một "Ngày thu"
Bỏ `utilityCycleDay` (gán = `collectionDay` sẵn rồi) hay giữ hai khái niệm "chốt" và "thu" thật sự khác ngày? `Contract.paymentDueDay` là override tuỳ chọn hay bỏ?

### 9.7 Lưới Phòng ở scope null
Nhóm Toà nhà → tầng, hay ép chọn một Toà nhà như Kỳ.

### 9.8 Vòng đời Hợp đồng
Stepper dọc 520 px ở cột phải → ngang trong header (5 chấm) hay bỏ hẳn (badge đã nói)?

### 9.9 Khai báo lưu trú
"Đã gửi" hỏi mã hồ sơ + ngày? Đăng ký tạm trú có hành động gì, trạng thái suy từ hạn (ADR-0012)? Cổng `dichvucong.gov.vn` hay `dichvucong.dancuquocgia.gov.vn` — **chưa xác minh**, cần chủ repo chốt.

### 9.10 Trần giá điện 3.900
`ELECTRICITY_PRICE_CAP_PER_KWH` không khớp nguồn pháp lý trong note pha 2 (D.11). Trần nào, hay bỏ Alert?

### 9.11 Thứ tự ticket
Đề xuất: E21 Mock nhất quán → token badge + mobile (rẻ, độc lập) → Hôm nay gộp + IA → màn Kỳ → wizard/Gia hạn/Thanh lý → chi tiết + danh sách mặc định → copy đi kèm từng ticket.

---

## 10. Bước tiếp

`/grill-with-docs` trên brief này (cùng session với `/to-spec`), mở mockup bằng trình duyệt để chọn bằng mắt §2.1/§2.2; grill chốt → cập nhật `CONTEXT.md` (Kỳ, Ngày thu, Thu tiền) + ADR nếu 9.5 chọn theme → `/to-spec` → `/to-tickets`. Chờ session đang sửa `apps/smart-rental` (38 file dirty lúc research) commit trước khi mở ticket đầu tiên.

---

## 11. Chốt ở vòng grill — 2026-09-18

Ba vòng, 24 quyết định; glossary `apps/smart-rental/CONTEXT.md` đã cập nhật cùng lúc (Kỳ, Ngày thu, Thu tiền mới; Chỉ số điện nước, Hoá đơn, Việc cần làm, Hôm nay sửa). Mọi câu ở §9 đã có trả lời; nơi câu trả lời **khác** đề xuất của brief thì ghi rõ.

| # | Quyết định | Ghi chú |
|---|---|---|
| 1 | Mock sửa trước mọi ticket UI: **Hoá đơn dịch lùi một Kỳ** — ngày 18/09 thì Kỳ 08 đã lập (hạn 05/09, quá hạn 13 ngày), Kỳ 09 đang Nháp một phần (1 Phòng bất thường + 1 Phòng chưa nhập mỗi Toà nhà). "Kỳ chưa lập Đợt" suy từ Hoá đơn của Kỳ, và chỉ là việc từ cuối tháng | Khác brief (brief giả định Hoá đơn 09) — hệ quả của #12 |
| 2 | Chuỗi tháng: **Hướng 2 — một màn Kỳ** `/cycles/:month` (F3); `/utilities` giữ làm **lịch sử chỉ đọc** (vào từ tab Chỉ số của Phòng và "Xem các Kỳ trước"); `/invoices/batch` và `/utilities/meter-input` bỏ | |
| 3 | Việc BE sẽ tự làm: **nút tay, copy/state đặt sẵn** để khi nối BE chỉ đổi nhãn ("Lập" → "Duyệt Nháp đã tự lập") | |
| 4 | Hôm nay: **gộp** Hoá đơn quá hạn cùng Toà nhà thành một mục (tổng, "Nhắc tất cả", mở rộng), loại khác 1 mục/việc; **sắp theo hạn**; donut/bar → Báo cáo; hai card số "Tháng này" + "Vừa xong" (suy từ nhật ký Thanh toán/Nhắc/Gia hạn, không Mock mới); **bỏ `/tasks`** và mục sidebar "Việc cần làm"; chuông giữ, cùng gộp | |
| 5 | Wizard Hợp đồng **2 bước**, giá từ Phòng, cọc mặc định 1 tháng (1/2/khác), **thời hạn** 6/12/khác thay ngày kết thúc, tóm tắt sống cột phải, `?room=` từ Phòng trống, ký xong Phòng → Đang thuê + việc Lưu trú. Gia hạn "thêm 6/12/khác tháng"; Thanh lý card "Số trả lại" trống tới khi chọn | |
| 6 | **Một "Ngày thu"** trên Toà nhà; bỏ `utilityCycleDay` khỏi form Toà nhà và `paymentDueDay` khỏi wizard | |
| 7 | 4 token chữ badge `-800` ở **app** (`globals.css` unlayered + 4 cặp `globals.test.ts`); "nâng lên theme" ghi vào Consequences ADR-0011 | |
| 8 | IA: sidebar 4 nhóm theo chuỗi việc (Tháng này / Người & phòng / Sổ sách / Hệ thống), 14 mục; bottom nav ô 4 = **"Thu tiền"** (= Hoá đơn lọc còn phải thu, sort hạn); sheet "Thêm" = hàng tài khoản + lưới + "Đăng xuất" tách riêng | "Thu tiền" vào glossary |
| 9 | Danh sách: **bảng mặc định** desktop, Item mobile, thẻ chỉ ở Phòng; sort Hoá đơn theo hạn (còn phải thu trước), Hợp đồng theo ngày kết thúc, Người thuê theo tên | Đảo quyết định 14 pha 2 |
| 10 | Thu tiền: primary "Ghi nhận thu *n* đ" điền sẵn = còn lại; VietQR có "Đã nhận *n* đ" (cùng mutation); VietQR ẩn khi còn lại = 0; "Nhắc tất cả" ở Hôm nay **ghi nhật ký thật** qua dialog chọn kênh | |
| 11 | Chỉ số điện nước **2 trạng thái Nháp → Đã chốt** (chốt khi Hoá đơn lập từ nó); "bất thường" là **cờ suy ra**, duyệt riêng từng đồng hồ; **"Kỳ"** thành thuật ngữ | Thay `DRAFT/VERIFIED/ANOMALY`; "Đã xác minh"/"Đã xác nhận" bỏ |
| 12 | **Chốt = cuối tháng của Kỳ (cố định, không cài); hạn thu = Ngày thu của tháng sau** (Kỳ 09 → hạn 05/10). Màn Kỳ nhận Nháp trước ngày chốt, chỉ lập từ ngày chốt | Phát hiện ở grill: Q6 × R2-3 mâu thuẫn |
| 13 | "Thu tiền" (việc/màn) tách khỏi "Thanh toán" (bản ghi) trong glossary | |
| 14 | Chỉ số mới < chỉ số cũ: **chặn hẳn**, lỗi inline; thay công tơ = sửa "chỉ số cũ" của Phòng (hành động riêng, có ghi chú) | Khớp BE `reading_end ≥ reading_start` |
| 15 | Hợp đồng bắt đầu giữa Kỳ: tiền phòng Kỳ đầu **theo ngày ở** (21/30), hiện rõ; sửa được trên Hoá đơn Nháp | |
| 16 | Chi tiết: bỏ card "Tóm tắt"; card "Hành động" chỉ khi ≥ 2; cột phải ẩn khi rỗng; tab lên URL `?tab=`; vòng đời Hợp đồng → **stepper ngang nhỏ trong header**, bước chưa qua không tick | |
| 17 | Lưới Phòng scope null: **nhóm Toà nhà → tầng**, mỗi Toà nhà một tiêu đề | |
| 18 | Khai báo lưu trú: "Đã gửi" mở sheet hỏi **mã hồ sơ + ngày**; Đăng ký tạm trú **suy trạng thái từ hạn** (ADR-0012), hành động "Đã gia hạn đến …"; việc "sắp hết hạn" 30 ngày trước | Cổng dịch vụ công vẫn chưa xác minh → ghi trong ticket |
| 19 | Trần giá điện 3.900: giữ cơ chế, đánh dấu chưa xác minh, **ticket riêng** tra nguồn + Mock một Toà nhà vượt trần | |
| 20 | Một spec round 3; thứ tự ticket: Mock timeline → token badge + mobile → Hôm nay + IA → màn Kỳ → wizard/Gia hạn/Thanh lý → chi tiết + danh sách → Lưu trú → trần giá điện; copy (§7) đi kèm từng ticket | Mock timeline chặn tất cả |
| 21 | Nút header Hôm nay = **việc kế tiếp của tháng** ("Nhập chỉ số Kỳ 09" cả tháng, "Lập Đợt" từ ngày chốt) | |
| 22 | `Kbd` hiện `Ctrl K` ngoài Mac | |
| 23 | Chart `--chart-*` giữ theme (không còn trên màn đầu) | D.16 đóng |
| 24 | i18n / dark mode: vẫn hoãn (quyết định 17–18 pha 2) | |

**ADR đề xuất:** #11 + #12 + #2 gộp thành một ADR — *Kỳ là đơn vị của chuỗi tháng: chốt cuối tháng, hạn = Ngày thu tháng sau, Chỉ số Nháp → Đã chốt trên một màn* — vì khó đảo (Mock dịch một Kỳ, derivation, route), gây ngạc nhiên cho người đọc sau (vì sao FE giữ Chỉ số theo Kỳ trong khi BE gắn vào Hoá đơn), và là trade-off thật (Hướng 1 vs 2, một ngày vs hai ngày).
