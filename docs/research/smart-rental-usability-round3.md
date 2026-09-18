# Nghiên cứu lại business & design `apps/smart-rental` — usability round 3 (đầu vào cho design step → grill → spec)

> Ngày kiểm tra: **2026-09-18**, nhánh `dev`, HEAD `031ccfc`. **Lưu ý working tree:** trong lúc kiểm tra, một session khác đang sửa `apps/smart-rental` (lúc 10:42 `git status` có **38 file** dirty — `src/features/invoices/components/vietqr-dialog.tsx`, `invoice-detail.template.tsx`, `constants/status.ts`, `constants/mock/{buildings,invoices}.ts`, `hooks/api/{invoice,report,utility}.ts`, `utils/{invoice-batch,report-rows,currency}.ts`, `features/layout/{constants/navigation.ts,components/header/notification-panel.tsx}`, `test/**`… và một file mới `src/utils/zod-whole-number.ts`). Mọi `path:line` trong note **trích từ HEAD `031ccfc`** (`git show HEAD:…`) trừ khi ghi **(WT)**; screenshot là từ dev server nên phản ánh working tree tại thời điểm chụp (ví dụ dialog VietQR đã có link "Đi tới Cài đặt Toà nhà" ở WT, HEAD chưa có — §A.5). Nguồn: note pha 2 [`smart-rental-rebuild.md`](./smart-rental-rebuild.md) (chỉ trích, không lặp), brief [`docs/design/smart-rental-redesign.md`](../design/smart-rental-redesign.md) + mockup, `apps/smart-rental/{CONTEXT,README}.md`, ADR-0011/0012, spec #153 + #154–#167 (`gh issue view`), **code thật** 18 slice (`*.template.tsx`, `src/components/**`, `constants/{routes,status,tariff}.ts`, `constants/mock/**`, `hooks/api/**`, `utils/**`, `types/**`), app **boot thật** (`bun run dev`, port 3006 trống, đã tắt sau khi chụp) và **147 screenshot** Playwright chromium chạy bằng `node` (không `bun run`), seed `localStorage.auth` đúng shape `e2e/support/auth-session.ts:8-16` + `localStorage.building` cho scope; primary sources UX/WCAG/shadcn/Base UI/Tailwind (§F); CSV tĩnh `.agents/skills/ui-ux-pro-max/data/` đọc bằng grep (không Python); target contract `D:\Personal\smart-rental\backend\document\fe-api-integration\*.md` (chỉ đọc).
>
> **Ba loại nội dung:** **FACT** = đọc từ code/ảnh/nguồn, trích được; **DELTA** = khoảng cách giữa app và heuristic/chuẩn, hai đầu đều FACT; **DRAFT** = đề xuất/câu hỏi của agent — chỉ ở §D, §E. Không bịa số; chỗ không kiểm được ghi **"chưa xác minh"**. Mọi nhận xét "khó/xấu" đi kèm heuristic (`NN/g H#n`, `WCAG x.y.z`, `ux#NN`) hoặc số đo hoặc tên ảnh.
>
> **Không sửa file nào ngoài note này, không commit.** Ảnh ở scratchpad `…\scratchpad\shots-r3\` (không commit): `desktop__<route>.png`, `mobile__<route>.png`, `desktop-tall__*` (1440×1800), `mobile-tall__*` (390×1800), `desktop_b1__*` / `mobile_b1__*` (scope b1), `state__*` (form/dialog/sheet mở, desktop b1), `mstate__*` (mobile b1), `desktop__guest_*`. Console/HTTP log: `shots-r3/log.json`, `log-b.json`. Script: `shoot-r3.cjs`, `shoot-r3b.cjs`, `measure.cjs` (đo DOM), `contrast.cjs` (WCAG).

Cấu trúc: **TL;DR** → **§0 Bối cảnh, phạm vi, Gate** → **Phần A — luồng thao tác** (A.1–A.8 tám flow, A.9 DELTA chung) → **Phần B — dễ hiểu** (B.1 thuật ngữ · B.2 nhãn/badge · B.3 thứ tự thông tin · B.4 thứ phải đoán · B.5 IA sidebar/bottom nav) → **Phần C — UI đơn giản nhưng đẹp** (C.1 audit nhất quán · C.2 thừa/lặp · C.3 whitespace/hierarchy/density · C.4 mobile · C.5 token/WCAG số đo) → **§D Câu hỏi mở** → **§E Đề xuất (DRAFT)** → **§F Nguồn**.

---

## TL;DR

1. **Pha 2 đã ship đúng 37 quyết định, và Portal giờ "đúng" hơn "dễ"**: mọi màn có việc thật, không còn nút chết, một ngữ pháp màn hình — nhưng tám flow chính vẫn mang **ma sát có tên** (Phần A): wizard Hợp đồng 4 bước mà hai bước đầu mỗi bước **một ô** và hỏi lại ba thứ Mock đã biết (giá Phòng, ngày thu Toà nhà, cọc); Nhập chỉ số **không điền sẵn** bản ghi Nháp của kỳ; thu tiền phải gõ lại số "Còn lại" app đang hiện; "Khai báo" từ Hôm nay rơi vào tab Tổng quan của Người thuê chứ không phải tab Lưu trú; "Gửi nhắc" ở Hôm nay chỉ toast, không ghi nhật ký như chính toast nói (A.5).
2. **Hôm nay là hàng đợi, nhưng hàng đợi lặp ba lần và hai KPI đầu trùng số** (B.3, C.2): cùng danh sách Việc cần làm ở Hôm nay, ở chuông và ở `/tasks`; "Cần thu tháng này" = "Quá hạn" (43.470.000 đ / 43.470.000 đ) vì hạn thu là ngày 5 và hôm nay là 18 — hai ô nói một điều nửa tháng mỗi tháng; 10 dòng "Hoá đơn HÓA-07x quá hạn · Cao" giống hệt nhau, không gộp, không "nhắc tất cả".
3. **Mock tự mâu thuẫn ở đúng luồng nghiệp vụ pha 2 dựng lên**: kỳ 09/2026 đã có Hoá đơn cho mọi Toà nhà nhưng Chỉ số kỳ 09 vẫn `DRAFT`, nên Hôm nay vừa liệt 10 Hoá đơn 09/2026 quá hạn vừa bảo "chưa lập Đợt hoá đơn kỳ 2026-09" cho cả ba Toà nhà (A.3, A.4); Đăng ký tạm trú "Hết hạn 30/09/2026 · sắp hết hạn" nhưng badge **Quá hạn** (trạng thái lưu tay, không suy) (A.7). Đây là dữ liệu chứ không phải UI, nhưng người dùng thấy ở UI.
4. **Ba "ngày" cho một khái niệm và hai "Quá hạn" cho một con số** (B.1, B.2): `Building.utilityCycleDay` ("Ngày chốt điện nước", form tạo Toà nhà) → được gán làm `collectionDay` (`hooks/api/building.ts:78`); `Contract.paymentDueDay` ("Chu kỳ thu", wizard) được lưu và hiện nhưng hạn thu Hoá đơn lấy từ `Building.collectionDay` (`utils/invoice-batch.ts:120-125`); KPI "Quá hạn" ở Hoá đơn = `amount` (45.090.000 đ) còn ở Hôm nay = `amount − paidAmount` (43.470.000 đ) cùng scope.
5. **Badge trạng thái không đạt WCAG 1.4.3** (C.5, đo bằng công thức): `text-success` trên `bg-success/10` = **2,87:1**, `text-warning` = **1,98:1**, `text-info` = **3,34:1**, `text-destructive` = **3,99:1** — bốn tone của `statusTone` (`constants/status.ts:50-58`) đều dưới 4,5:1 cho chữ 12 px; `test/globals.test.ts` chỉ đo các cặp override của ADR-0011 nên không bắt được. Chữ nền/muted/primary thì rất tốt (7,2–17,1:1).
6. **Mobile có hai lỗi cấu trúc**: nút "Xem" của mỗi việc ở Hôm nay bị **cắt khỏi mép phải** (Item 391 px trong cột 358 px — `mobile-tall__home.png`, đo `measure.cjs`), và **không có Đăng xuất**: menu tài khoản `hidden md:block`, trigger sidebar `hidden md:inline-flex`, sheet "Thêm" chỉ có 11 khu vực (C.4). Danh sách mặc định là **thẻ** (429 px/thẻ, 84 Hoá đơn, cũ nhất trước) nên bản `renderMobileRow` gọn hơn hầu như không ai thấy.
7. **Vỏ đã "một ngữ pháp" nhưng còn lặp và còn rỗng** (C.2, C.3): chi tiết Hoá đơn hiện Kỳ 2 lần, Mã 2 lần, Tổng cộng 2 lần, meta "Phòng Phòng 102"; card "Hành động" chứa đúng một nút; Toà nhà có ba đường vào cùng một sheet Cài đặt và "83%" hiện ba lần trong một card; lưới Phòng ở scope "Tất cả" trộn tầng của ba Toà nhà (Tầng 5 = Phòng 207/208 của Toà nhà khác) với 2 thẻ/hàng trên 1440 px.
8. **IA 15 mục là quá nhiều cho tần suất thật** (B.5): theo nghiệp vụ, mỗi tháng chủ nhà chạm 4 khu vực (Hôm nay · Chỉ số → Đợt → Hoá đơn · Thu tiền), vài lần/năm 3 (Hợp đồng, Người thuê, Khai báo lưu trú), sổ sách 4 (Hoá đơn NCC, Chi phí, Đối soát, Báo cáo — hai cái cuối tính từ cùng ba nguồn), hiếm 3 (Toà nhà, Thông báo, Cài đặt); "Việc cần làm" là bản sao của Hôm nay. Bottom nav 5 ô hợp Material/Apple, nhưng ô "Hoá đơn" đưa về danh sách thẻ 84 mục thay vì việc phải thu.

---

## §0. Bối cảnh, phạm vi, phương pháp, Gate

- **Câu hỏi**: UX dễ hiểu hơn, thao tác tiện hơn, luồng dễ hơn, UI đơn giản nhưng đẹp — trên bản pha 2 đã ship (spec #153, 14/14 ticket đóng, `dev` `eae2546`; HEAD hôm nay `031ccfc` chỉ thêm commit env của Template). Note là **đầu vào** cho round 3; không thiết kế.
- **Đã có, không lặp**: entity model, enum, pháp lý/EVN/VietQR (note pha 2 §A.0–A.8), 27 defect pha 1 (§C.1 cũ — phần lớn đã sửa), 37 quyết định (brief §10). Chỗ nào defect cũ **vẫn còn** thì trích số cũ.
- **Gate (chạy 2026-09-18 trên working tree đang bị session khác sửa)**: `bun run --filter @monorepo/smart-rental typecheck` → **exit 0**; `… test` → `Test Files 2 failed | 68 passed (70) · Tests 2 failed | 344 passed (346) · 147,65 s`. Hai fail: `test/features/invoices/templates/invoice-detail.template.test.tsx` (file **đang dirty** của session khác — không phải lỗi HEAD) và `test/components/form/date-field.test.tsx` (timeout 5.440 ms trong lần chạy full; **chạy lại riêng: 2/2 pass** → flaky dưới tải, chưa xác minh nguyên nhân). Gate của HEAD `eae2546` theo comment #167: 343/343 (không chạy lại riêng trong note này vì không tạo worktree).
- **Boot & chụp**: 29 route × {1440×900, 390×844} scope `null`, 13 route `desktop-tall`, 9 route `mobile-tall`, 10 route × 2 viewport scope `b1`, ~30 state (sheet/dialog/wizard/selection/anomaly/search/notification/more-sheet), 3 ảnh guest. Console: **một** lỗi React lặp ở `/` mọi viewport/scope: `Encountered two children with the same key, "name"` (legend donut: app truyền `nameKey="name"` đúng như #159 yêu cầu — `occupancy-donut-chart.tsx:62` — nhưng primitive `packages/ui/src/components/chart.tsx:303-309` dùng **chính chuỗi `nameKey`** làm React `key` (`const key = `${nameKey ?? item.dataKey ?? "value"}`` rồi `key={key}`) nên hai mục legend đều key `"name"` — lỗi ở `@monorepo/ui`, không ở app; mọi legend ≥ 2 mục trong workspace đều dính); **0** pageerror, **0** HTTP ≥ 400 (`log.json`). Tràn ngang: `documentElement` không tràn ở ảnh nào; cột nội dung (`overflow-auto`) **tràn ở `/` mobile** (`inner: true`, cột cao 3.611 px ở scope null / 2.398 px ở b1).
- **Số đo DOM** (`measure.cjs`, `getBoundingClientRect` + `getComputedStyle`): ghi ở C.3/C.5.

---

## Phần A — Luồng thao tác (task flows)

Quy ước đếm: **click** = một lần bấm chuột/chạm (mở combobox và chọn mục = 2; date picker = mở + chọn ngày ≥ 2); **field** = ô phải điền/chọn; **màn** = số route hoặc bước wizard đi qua; xuất phát từ **Hôm nay** (scope b1 đã chọn, trừ khi ghi). Số click là **tối thiểu** theo code, không tính gõ phím.

### A.1 Đăng nhập → Hôm nay

| Bước | Màn | Click / field | Ma sát | Nguồn | Ảnh |
|---|---|---|---|---|---|
| 1 | `/auth/login` | 1 click (form điền sẵn `admin@gmail.com / admin@123`) | Không có ma sát; nút không còn dính ô mật khẩu (defect cũ #17 đã sửa) | `features/auth/components/sign-in-form.tsx:28` | `desktop__guest_login.png`, `mobile__guest_login.png` |
| 2 | `/` Hôm nay | 0 | Trước nội dung là **ba tầng chrome**: header ("Hôm nay · Tổng quan hoạt động…"), hàng tabs scope, rồi `h1` = ngày ("Thứ sáu, 18/09/2026") — chữ "Hôm nay" ở sidebar + header, ngày ở h1; 120 px chrome trước KPI ở 1440 | `layout.template.tsx:217-221`, `dashboard.template.tsx:39-40` | `desktop__home.png` |

**FACT thêm**: Hôm nay có một nút hành động duy nhất "Lập đợt hoá đơn" (`dashboard.template.tsx:46-53`) — với scope `null` nó dẫn tới màn yêu cầu chọn Toà nhà (`batch-invoice.template.tsx:285-286`), tức nút đầu tiên người dùng thấy đôi khi là ngõ cụt một bước.

### A.2 Tạo Hợp đồng (wizard 4 bước)

| Bước | Màn | Click / field | Ma sát | Nguồn | Ảnh |
|---|---|---|---|---|---|
| 1 | Sidebar → `/contracts` → "Tạo hợp đồng" | 2 | — (không có lối vào từ Phòng trống: chi tiết Phòng trống chỉ có "Xem toà nhà", không có "Tạo hợp đồng") | `room-detail.template.tsx` (cột phải "Liên kết") | `desktop__rooms_R-B1-101.png` |
| 2 | Bước 1 "Chọn phòng" | 2 click / 1 field | **Cả một bước cho một combobox**; ở scope `null` nhãn option chỉ "Phòng 101 · Tầng 1", không có tên Toà nhà (`select-room.tsx:444`) | `contract-create.template.tsx:174-201` | `state__contract_wizard_step1_combobox_open.png` |
| 3 | Bước 2 "Người thuê" | 2 click / 1 field (+ "Thêm mới" mở Sheet 8 ô) | Một bước cho một combobox | `:204-250` | `state__contract_wizard_step2.png` |
| 4 | Bước 3 "Điều khoản" | ≥ 6 click / **6 field bắt buộc** | `rentAmount` mặc định **3.000.000** dù `Room.price` có trong Mock (`types/room.ts:12`); `depositAmount` mặc định 3.000.000; `paymentDueDay` mặc định 5 dù Toà nhà đã có `collectionDay` (`types/building.ts:25`) và giá trị này **không** được dùng cho hạn thu (`utils/invoice-batch.ts:120-125`); `endDate` bắt buộc chọn bằng lịch (không có "12 tháng") | `contract-create.template.tsx:69-80, 253-305`; `types/contract-form.ts` | `state__contract_wizard_step3.png`, `state__contract_wizard_step3_errors.png` |
| 5 | Bước 4 "Xác nhận" → Lưu | 2 | Câu xác nhận tốt; toast + về chi tiết | `:307-355` | — |

**Tổng**: ≥ 14 click, **8 field bắt buộc**, 6 màn/bước; **3 chỗ nhập lại thứ Mock đã có** (giá Phòng, ngày thu Toà nhà, cọc = giá). Sau khi tạo: **Phòng không đổi `status`** — `useCreateContract` (`hooks/api/contract.ts:60-110` HEAD) đọc `room` để lấy tên/tầng nhưng không ghi `room.status = "occupied"`; Thanh lý thì có set `available` (`:57`) → lưới Phòng và KPI lấp đầy không thấy Hợp đồng mới cho tới khi reload Mock.

**DELTA**: NN/g *Wizards* (Budiu 2017): wizard cho "novice users or infrequent processes"; với người làm lặp phải có "another faster alternative". Hợp đồng là việc vài lần/năm → wizard hợp lý, nhưng hai bước một ô vi phạm chính lý do tồn tại của wizard ("less information on the page" chỉ có nghĩa khi trang có nhiều thông tin). NN/g **H6 Recognition rather than recall** + `ux#106 Redundant Entry` (WCAG 2.2 A): ba giá trị hỏi lại. NN/g **H5 Error prevention**: ngày kết thúc tự do thay vì thời hạn (BLDS/Luật Nhà ở — note pha 2 §A.0.1 — hợp đồng ghi *thời hạn*).

### A.3 Lập Đợt hoá đơn

| Bước | Màn | Click / field | Ma sát | Nguồn | Ảnh |
|---|---|---|---|---|---|
| 1 | Hôm nay → "Lập đợt hoá đơn" | 1 | Scope `null` → `BuildingScopeRequiredPanel` ("chọn Toà nhà ở thanh phía trên") = thêm 1 click | `batch-invoice.template.tsx:285-291` | `desktop__invoices_batch.png` |
| 2 | Chọn kỳ | 0 (mặc định tháng hiện tại) | `MonthField` hiện "09/2026" ✓ | `:264-283` | — |
| 3 | Bảng tick | 0 (mặc định tick mọi dòng đủ điều kiện) | Với Mock kỳ 09: **mọi dòng "Đã lập kỳ này" hoặc "Chưa đủ điều kiện"**, nút "Tạo & Gửi **0** hoá đơn" disabled; "Chưa đủ điều kiện" **không nói thiếu điện hay nước** và **không link** sang Nhập chỉ số (không có `ROUTES.METER_INPUT` trong file) | `:164-196`, `utils/invoice-batch.ts:325-370` | `desktop_b1__invoices_batch.png` |
| 4 | "Tạo & Gửi n hoá đơn" | 1 | Copy "Gửi" trong khi không gửi gì (README "Không gửi thông báo thật"); sau tạo chỉ toast, **ở lại trang** | `:98-126` | — |

**Tổng (happy path)**: 2–3 click, 0 field. Nhưng **precondition** (Chỉ số VERIFIED của kỳ) không có đường dẫn từ màn này → thực tế là 2 flow: A.4 rồi A.3. Bảng xem trước có cột Tiền phòng và Tổng, **không có cột điện/nước** (kWh × giá) — thứ chủ nhà cần kiểm trước khi lập (`:156-161`).

**FACT — Mock tự mâu thuẫn**: kỳ 09/2026 đã có Hoá đơn (HÓA-071… `desktop_b1__tasks.png`) nhưng `mockUtilities` kỳ `2026-09` đều `DRAFT` (`constants/mock/utilities.ts:34`); `deriveTasks` coi "chưa lập Đợt" = có Chỉ số kỳ chưa VERIFIED (`utils/task-derivation.ts:431-459`), **không** nhìn Hoá đơn đã tồn tại → Hôm nay đồng thời có "Hoá đơn HÓA-071 quá hạn kỳ 09/2026" và "Trọ Sinh Viên Xanh chưa lập Đợt hoá đơn kỳ 2026-09" (9 việc ở scope b1: 4 + 2 + 1 + 1 + 1). Tiêu đề việc dùng `2026-09` (`:447`) trong khi mọi nơi khác "09/2026".

**DELTA**: NN/g **H1 Visibility of system status** — trạng thái "chưa đủ điều kiện" không nói *vì sao* và *làm gì tiếp*; **H9** error message phải "constructively suggest a solution". Contract BE: `invoice-generator` cron "Hàng ngày 06:00 — tạo hóa đơn batch theo `utility_cycle_day`" (`worker-services.md:66`) và invoice `DRAFT` → `finalize` (`billing-service.md:15`) → phía BE **tự lập Đợt**, FE chỉ duyệt Nháp; mô hình Chỉ số của BE là **thuộc Hoá đơn** (`POST /api/v1/invoices/{id}/utility-readings`, `billing-service.md:21`), không phải bản ghi rời theo Phòng như FE (§D.3).

### A.4 Nhập Chỉ số điện nước

| Bước | Màn | Click / field | Ma sát | Nguồn | Ảnh |
|---|---|---|---|---|---|
| 1 | Sidebar "Chỉ số điện nước" → "Nhập chỉ số" | 2 | Không có lối tắt từ Hôm nay (việc "chưa lập Đợt" trỏ về `/invoices/batch`, không phải Nhập chỉ số — `task-queue.tsx:204-205`) | `utility-list.template.tsx:47` | `desktop__utilities.png` |
| 2 | Chọn kỳ (mặc định) + scope | 0–1 | như A.3 | `meter-input.template.tsx:244-273` | `desktop_b1__utilities_meter-input.png` |
| 3 | Bảng: N phòng × 2 ô | b1: 5 phòng → **10 field**, tất cả trống | **Không điền sẵn bản ghi Nháp của kỳ** ("A room already read for `month` is not filtered out — re-entering simply overwrites it", `utils/meter-input-rooms.ts:8-9`); "Điện cũ" hiện đúng, "Điện mới" trống dù Mock đã có 270 kWh Nháp cho Phòng 102 | `meter-input-rooms.ts:34-45` | `state__meter_input_anomaly.png` |
| 4 | Bất thường → "Duyệt bất thường" | 1/phòng | Một nút duyệt cho **cả điện lẫn nước** của phòng (`combineMeterStatus`), chỉ số **giảm** (nước 1008 → 1, "−1007" đỏ) cũng duyệt được và lưu tiêu thụ 0 (`meter-input.template.tsx:126`; `meter-reading.ts:28` trả `consumption: null`) | `meter-input-row.tsx:375-403`, `use-meter-entry-state.ts:459` | như trên |
| 5 | "Lưu n chỉ số" | 1 | Lưu = **VERIFIED ngay** (`hooks/api/utility.ts` `useConfirmMeterReadings`: `status: "VERIFIED"` cả nhánh update lẫn create) — không có trạng thái Nháp thật sau khi lưu; "n" đếm điện + nước (1 phòng = "2 chỉ số") | `hooks/api/utility.ts:94-153` | — |

**Tổng**: 3–4 click + 2N field; **N×2 chỗ nhập lại** khi kỳ đã có Nháp. Việc "Chỉ số Phòng 102 bất thường" ở Hôm nay dẫn tới **chi tiết** Chỉ số (`task-due.ts:17-18`), nơi không sửa được — muốn sửa phải sang Nhập chỉ số và gõ lại.

**DELTA**: **H6** (recall: nhớ số đã gõ kỳ trước); **H5** (duyệt số âm không chặn; BE có check `reading_end >= reading_start`, `billing-service.md:85`); **H4 Consistency**: `utilityStatusConfig.VERIFIED` = "Đã xác minh" (`status.ts:126-129`) còn màn nhập/glossary nói "xác nhận"/"Duyệt". Sản phẩm ngoài (first-party docs, ITRO): "Trên màn hình Trang chủ, ấn chọn 'Điện nước' → Chọn nút 'Chốt'" — hai chạm từ trang chủ, có "ngày chốt" trên chính màn (§F).

### A.5 Thu tiền + VietQR

| Bước | Màn | Click / field | Ma sát | Nguồn | Ảnh |
|---|---|---|---|---|---|
| 1 | Hôm nay → "Xem" | 1 | Landing ở tab **Tổng quan** | `task-queue.tsx:185` | `desktop__invoices_I001.png` |
| 2 | Tab "Thanh toán" → "Ghi nhận Thanh toán" | 2 | Sheet 3 ô: ngày (điền sẵn hôm nay), **số tiền trống** dù "Còn lại" đang hiện ở tab Tổng quan, kênh mặc định "Chuyển khoản" | `payment-form-sheet.tsx:372-378, 434-470` | `state__invoice_I001_payment_sheet.png` |
| 3 | "Lưu lại" | 1 + gõ số | Trạng thái tự đổi ✓; toast ✓ | `hooks/api/invoice.ts:204` | — |
| VietQR | Cột phải "Thanh toán VietQR" | 1 | Dialog hiện ảnh `img.vietqr.io` thật ✓; nút hiện **cả với Hoá đơn Đã thu** (Còn lại 0 đ, `desktop__invoices_I001.png`); sau khi quét không có gì nối sang "đã nhận" — phải đóng dialog, đổi tab, mở sheet (3 click nữa); Toà nhà b3 không có tài khoản: HEAD chỉ `Alert` không link (`vietqr-dialog.tsx:543-549` HEAD), WT đã thêm link (ảnh `state__invoice_b3_vietqr_no_bank.png`) | `invoice-detail.template.tsx:311-318` | `state__invoice_I001_vietqr.png` |
| Gửi nhắc (Hôm nay) | nút "Gửi nhắc" | 1 | **Chỉ toast** "Đã gửi nhắc — Nhật ký nhắc được ghi trên hoá đơn" nhưng **không** gọi `useSendInvoiceReminders` (`task-queue.tsx:211-216`, comment `:172-179` thừa nhận "stays a toast"); trong khi tab Nhắc nợ và thanh chọn hàng loạt ghi nhật ký thật (`send-reminder-dialog.tsx`, `hooks/api/invoice.ts:245-257`) | | `desktop__home.png` |

**Tổng thu tiền**: 4 click + 1 field gõ lại; 1 route, 2 tab. **DELTA**: **H1** — toast nói dối về trạng thái hệ thống (nhật ký không ghi → việc không biến mất); **H6/`ux#106`** — số tiền còn lại phải gõ lại; **H8 Aesthetic and minimalist**: card "Hành động" chứa một nút, và nút đó hiện khi không còn gì để thu. Contract BE: thanh toán qua QR về bằng **webhook** (`invoice_payments.noted_by null nếu tự động từ webhook`, `billing-service.md:114`; `payment-requests/{id}/status` polling) → bước ghi tay sau QR là tạm thời của Mock; `payment-reminder-1/2` là cron (`worker-services.md:68-69`) → "Gửi nhắc" tay sẽ thành ngoại lệ.

### A.6 Thanh lý

| Bước | Màn | Click / field | Ma sát | Nguồn | Ảnh |
|---|---|---|---|---|---|
| 1 | Hôm nay → "Thanh lý" (nút phụ cạnh "Gia hạn") | 1 | Tốt: breadcrumb 3 cấp ✓, nợ thật từ Hoá đơn ✓ | `contract-liquidation.template.tsx:411-421` | `desktop__contracts_C001_liquidation.png` |
| 2 | Chọn cách quyết toán (radio) | 1 (+2 field nếu Hoàn một phần: số tiền điền sẵn, **lý do bắt buộc**) | Trước khi chọn, card "Số trả lại" đã hiện **0 đ** (fallback `decision ?? "FORFEITED"`, `:470-475`) — người đọc tưởng mặc định là giữ cọc; lý do chỉ bắt buộc với "Hoàn một phần", "Giữ toàn bộ" không cần lý do (`liquidation-form.ts:679-682`) | | `state__contract_liquidation_initial.png`, `state__contract_liquidation_partial.png` |
| 3 | "Xác nhận thanh lý" | 1 | Không có bước chốt chỉ số cuối/bàn giao tài sản (BE có `termination-summary` gồm "công nợ, cọc, **điện nước**, bồi thường" và `asset-handover` — `contract-service.md:18-33`) | `:634-641` | — |

**Tổng**: 3 click, 1–3 field, 1 route. Flow ngắn nhất và rõ nhất trong app. **DELTA** nhỏ: **H5** (số 0 đ trước khi chọn); Alert cảnh báo dùng tone `warning` (1,98:1 — C.5).

### A.7 Khai báo lưu trú

| Bước | Màn | Click / field | Ma sát | Nguồn | Ảnh |
|---|---|---|---|---|---|
| 1 | Hôm nay → "Khai báo" | 1 | Dẫn tới **`/tenants/:id` tab Tổng quan** (`task-due.ts:15-16` → `tenantDetailPath`), Lưu trú là tab thứ 4 (`tenant-detail.template.tsx:232-233`); tabs không nằm trên URL (`detail-page-shell.tsx:141` `defaultValue`) nên không link thẳng được | | `state__tenant_T001_tab_residence.png` |
| 2 | Tab "Lưu trú" → "Đã gửi" | 2 | Không xác nhận, **không nhập mã hồ sơ/ngày** — hook tự bịa `CT01-<tenantId>` (`hooks/api/compliance.ts:80, 95`); không hoàn tác | | `desktop__compliance.png` |
| — | Đăng ký tạm trú | 0 | **Không có hành động nào** (chỉ badge + hạn); "Hết hạn 30/09/2026 · sắp hết hạn" nhưng badge "Quá hạn" — `registrationStatus` là **trạng thái lưu tay** (`utils/residence-declaration.ts:250, 266-269`), ngược ADR-0012 | | `desktop__compliance.png` |
| — | Link ngoài | 1 | Trỏ `https://dichvucong.gov.vn` (`residence-declaration-lines.tsx:114`); note pha 2 §A.0.4 ghi cổng cư trú là `dichvucong.dancuquocgia.gov.vn` — **chưa xác minh** cổng nào đúng cho Thông báo lưu trú |

**Tổng**: 3 click; **1 thứ phải đoán** (tab nào), **1 dữ liệu giả** (mã hồ sơ). **DELTA**: **H1/H6** (rơi sai tab); **H3 User control** (không undo); glossary "có mã hồ sơ" nhưng không ai nhập được.

### A.8 Gia hạn

| Bước | Màn | Click / field | Ma sát | Nguồn | Ảnh |
|---|---|---|---|---|---|
| 1 | Hôm nay → "Gia hạn" | 1 | ✓ breadcrumb | `contract-renew.template.tsx:80-90` | `desktop__contracts_C001_renew.png` |
| 2 | Form: ngày kết thúc mới (lịch), tiền thuê mới (điền sẵn), ghi chú | ≥ 3 / 2 bắt buộc | Ngày kết thúc mới **tự do** (không "+12 tháng"); **`notes` được hỏi nhưng không lưu** (`hooks/api/contract.ts:164-178` không có `notes`) — defect cũ §A.1 pha 2 vẫn còn | | `state__contract_renew_validation.png` |
| 3 | "Tiếp tục" → card xác nhận **mount ở cột phải** → "Xác nhận gia hạn" | 2 | Cột phải **trống** cho tới khi bấm Tiếp tục (defect cũ C.1 #7 còn nguyên — brief §3.5 nói "xác nhận là bước cuối, không cột phải trống" nhưng chỉ áp cho wizard) | `:143-237` | `desktop__contracts_C001_renew.png` |

**Tổng**: ≥ 6 click, 2 field, 1 route. **DELTA**: **H8** (cột trống 1/3 màn); **H1** (ghi chú biến mất không báo).

### A.9 DELTA chung của tám flow

- **Hôm nay → hành động → quay về?** Không hành động nào quay lại Hôm nay sau khi xong (toast rồi ở lại chi tiết/list); hàng đợi tự cập nhật khi quay về nhưng người dùng phải tự về (NN/g **H3** "emergency exit"; `ux#4 Back Button` — Back trình duyệt hoạt động ✓).
- **Định dạng kỳ**: `2026-09` (task title) vs `09/2026` (mọi nơi khác) — **H4**.
- **Hai lối vào cùng một việc, không lối vào cho việc kế tiếp**: Toà nhà có nút "Cài đặt" ở header **và** tab "Cài đặt" **và** nút "Chỉnh sửa" trong tab (`state__building_b1_tab_settings.png`); Phòng trống không có "Tạo hợp đồng"; Đợt hoá đơn không có "Nhập chỉ số"; VietQR không có "Đã nhận".
- **Ghi tay thứ BE sẽ tự làm**: lập Đợt (cron `invoice-generator`), quá hạn (`overdue-checker`), nhắc thanh toán (`payment-reminder-*`), QR → thanh toán (webhook), hết hạn tạm trú (`residence-expiry`) — `worker-services.md:59-70`. Ở FE Mock, tất cả là nút; khi nối BE, phần lớn thành *thông báo* (§D.4).

---

## Phần B — Dễ hiểu (comprehension)

### B.1 Thuật ngữ trên màn hình vs `CONTEXT.md`

| Trên màn | Glossary | Chỗ | FACT |
|---|---|---|---|
| "Đã xác minh" (Chỉ số VERIFIED) | "Đã xác nhận" (§ Chỉ số điện nước, spec §10 hàng 27 "xác nhận") | `status.ts:126-129`; màn nhập "Duyệt bất thường", batch "Chỉ số đã xác nhận" | ba từ cho một trạng thái |
| "Ngày chốt điện nước" (form tạo Toà nhà) / "Ngày thu trong tháng" (Cài đặt Toà nhà) / "Chu kỳ thu (ngày trong tháng)" (wizard Hợp đồng) | glossary Hợp đồng: "chu kỳ thu"; Bảng route/README: "ngày thu" | `building-form-sheet.tsx:95`, `building-settings-form-sheet.tsx:131`, `contract-create.template.tsx:288`; `hooks/api/building.ts:78` gán chốt = thu | ba nhãn, hai trường, một giá trị dùng thật |
| "Tạo hoá đơn hàng loạt" (h1) / "Lập đợt hoá đơn" (nút Hôm nay) / "Tạo hoá đơn" (nút list) / "Tạo & Gửi n hoá đơn" (submit) | **Đợt hoá đơn** | `batch-invoice.template.tsx:272, 124`; `invoice-list.template.tsx:78`; `dashboard.template.tsx:51` | bốn tên cho một màn; "Gửi" không gửi |
| "Quản lý hoá đơn" / "Danh sách phòng" / "Quản lý Người thuê" (h1) vs sidebar "Hoá đơn" / "Phòng" / "Người thuê" | tên khu vực = tên glossary | `invoice-list.template.tsx:70`, `room-list.template.tsx`, `tenant-list.template.tsx` | h1 thêm "Quản lý"/"Danh sách" — sidebar/header/h1 nói ba cách |
| "Tổng quan hoạt động quản lý phòng trọ." (mô tả header Hôm nay) | Hôm nay "là hàng đợi việc, không phải bảng thống kê" (_Avoid_: tổng quan) | `navigation.ts:48` | mô tả dùng đúng từ glossary cấm |
| "Quản lý khai báo nơi ở và kiểm tra an toàn." | Khai báo lưu trú _Avoid_: kiểm tra an toàn | `navigation.ts:132` | còn sót từ pha 1 |
| "Doanh thu" (Báo cáo, Hôm nay) | không có trong glossary | `dashboard-summary.ts:505-508` cộng `invoice.amount` bất kể đã thu | "doanh thu" = **đã lập**, không phải đã thu — chủ nhà đọc là tiền về |
| "Cần thu tháng này" | — | `dashboard-summary.ts:510-514`: `billingMonth === currentMonth && outstanding > 0` | = "Quá hạn" mỗi khi `collectionDay` < hôm nay (b1 ngày 5, b2 ngày 10, b3 ngày 1 — `mock/buildings.ts:18,39,60`) |

### B.2 Nhãn nút / trạng thái / badge

- **Hai "Quá hạn" cho một số**: Hoá đơn list `overdueAmount += invoice.amount` (`invoice-calculations.ts:31-32` HEAD) → 45.090.000 đ; Hôm nay `overdueAmount += outstanding` (`dashboard-summary.ts:515-517`) → 43.470.000 đ, cùng scope `null` (`desktop__invoices.png` vs `desktop__home.png`). **H4**.
- **"Chưa thu 0 đ" cạnh "Quá hạn 45 triệu"** (`desktop__invoices.png`): bucket loại trừ nhau (`UNPAID` ≠ `OVERDUE`) nên "Chưa thu" chỉ đếm Hoá đơn chưa tới hạn → người đọc hiểu "không còn gì phải thu". **H2 Match real world**: với chủ nhà, quá hạn *là* chưa thu.
- **Badge ưu tiên "Cao" trên mọi Hoá đơn quá hạn** (10/10 ở scope null) — không phân biệt gì (`task-derivation.ts:361`), thêm một pill 39×20 px/dòng; `ux#114 Compact Label Semantics`: badge = state, ở đây priority là hằng theo loại.
- **Alert "Hợp đồng sẽ hết hạn trong 12 ngày"** dùng `variant="destructive"` (đỏ) cho một cảnh báo (`contract-detail.template.tsx:161-168`) trong khi badge cùng màn là `warning` (vàng) — **H4**.
- **Vòng đời tick xanh "Nháp"** cho Hợp đồng chưa từng là Nháp (`desktop__contracts_C001.png`) — stepper mô tả *đường đi lý thuyết* chứ không phải lịch sử; defect cũ C.1 #6 sửa cho `EXPIRED/TERMINATED`, không sửa cho bước đầu.
- **"Chưa đủ điều kiện"** (batch) / **"Chưa nhập"** (meter) / **"Chờ xử lý"** (Đăng ký tạm trú `pending`) — ba trạng thái "chưa" không nói việc kế tiếp (**H9**).
- **Nút phụ "Xem"** trên Hôm nay là outline, "Gửi nhắc" là primary — hành động primary là cái *không ghi gì* (A.5).
- **"Thanh toán VietQR"** là nút primary duy nhất trên chi tiết Hoá đơn, kể cả Hoá đơn Đã thu.

### B.3 Thứ tự thông tin trên Hôm nay và màn chi tiết

**Hôm nay** (`desktop__home.png`, `mobile-tall__home.png`): h1 ngày → mô tả "17 Phòng · 14 đang thuê" → nút "Lập đợt hoá đơn" → 3 KPI → "Cần làm hôm nay" (trái, 4/7) + Lấp đầy donut + Doanh thu 6 tháng (phải, 3/7). FACT: (a) hai KPI đầu cùng số (B.1); (b) donut và bar nằm **ngang hàng** với hàng đợi ở desktop và **dưới 10+ việc** ở mobile (cột 3.611 px); (c) bar 6 tháng gần phẳng (16,4 tr × 6 ở b1 — `desktop_b1__reports.png`) vì Mock đều; (d) NN/g *Dashboards* (Laubheimer 2017): "Avoid area-based and circular visualizations… area and angle are poor" — donut là biểu đồ duy nhất trên màn đầu; (e) NN/g *Progressive disclosure* (Nielsen 2006): primary display = "features users frequently need" — lấp đầy/doanh thu là nhìn hằng tháng, không phải hằng ngày. Việc cần làm sắp theo **nguồn** (mọi Hoá đơn → mọi Hợp đồng → …, `task-derivation.ts:354-459`), không theo hạn/ưu tiên: một Hợp đồng hết hạn ngày mai đứng sau 10 Hoá đơn.

**Chi tiết** (một bố cục cho 10 màn ✓ — `detail-page-shell.tsx`): header entity (h2) + ≤ 3 meta + actions + tabs + cột phải. FACT lặp: Hoá đơn — "Kỳ 04/2026" ở meta **và** "Kỳ" ở Tóm tắt, mã ở h2 **và** "Mã hoá đơn" ở Tóm tắt, "Tổng cộng" ở footer bảng **và** ở StatItem (`invoice-detail.template.tsx:265, 320-329, 83-94`); Toà nhà — "Ngày thu 5 hằng tháng" ở meta **và** trong card Cài đặt; "Tỷ lệ lấp đầy" = "83%" + "Tỷ lệ chiếm dụng" + "LẤP ĐẦY 83%" thanh (`state__building_b1_tab_settings.png`); Hợp đồng — sạch. Meta Hoá đơn "**Phòng Phòng 102**" (`:265` `Phòng ${invoice.room}` với `room` đã là "Phòng 102"). `h1` là `sr-only` ("Chi tiết hoá đơn") còn tiêu đề nhìn thấy là `h2` (`:80, :114`) — đúng seam test, nhưng `ux#39` heading hierarchy: h1 vô hình, tab title = tên khu vực.

### B.4 Thứ người dùng phải "đoán"

| Chỗ | Phải đoán gì | Nguồn/ảnh |
|---|---|---|
| Hôm nay "Khai báo" | vào tab nào sau khi tới Người thuê | A.7 |
| Đợt hoá đơn "Chưa đủ điều kiện" | thiếu điện hay nước, đi đâu nhập | A.3 |
| Nhập chỉ số kỳ đã có Nháp | số đã gõ hôm trước là bao nhiêu | A.4 |
| Chi tiết Phòng "Xóa" disabled (Phòng có Hợp đồng) | có `Tooltip` lý do (`room-detail.template.tsx:14-16, 45`) ✓ — nhưng tooltip là hover, không hiện trên chạm (`ux#11 Hover vs Tap`) | `state__rooms_R-B1-102.png` |
| Batch "Tạo & Gửi" | gửi cho ai, bằng gì | A.3 |
| Hôm nay "Gửi nhắc" | có ghi gì không (toast nói có, code nói không) | A.5 |
| Thanh lý "Số trả lại 0 đ" trước khi chọn | đã chọn "giữ" chưa | A.6 |
| ⌘K | trên Windows là Ctrl+K — `Kbd` chỉ hiện "⌘K" (`search-dialog.tsx:225`), ảnh chụp trên Windows vẫn ⌘ | `desktop__home.png` |
| Scope "Tất cả Toà nhà" ở `/rooms` | "Tầng 5" là của Toà nhà nào — thẻ không ghi tên Toà nhà | `desktop__rooms.png` |
| Kỳ `2026-09` vs `09/2026` | có phải cùng kỳ | A.3 |
| Đăng ký tạm trú "Chờ xử lý" | ai xử lý, chủ nhà làm gì | A.7 |
| Mobile: đăng xuất ở đâu | không có đường (C.4) | `mstate__more_sheet.png` |

Icon không nhãn: `⋯` hàng có `aria-label` ✓; chuông có badge số ✓; icon loại việc (Bell/FileClock/Gauge/ShieldAlert) không có nhãn nhưng tiêu đề đã nói loại — `ux#40` đạt.

### B.5 Information architecture — 15 mục sidebar + bottom nav 5

**FACT** `navigation.ts:150-171`: Chính (Hôm nay · Toà nhà · Phòng · Người thuê · Việc cần làm) · Quản lý (Hợp đồng · Hoá đơn · Chỉ số điện nước · Hoá đơn NCC · Chi phí · Đối soát · Báo cáo) · Hệ thống (Khai báo lưu trú · Thông báo · Cài đặt). Bottom nav: Hôm nay · Phòng · Người thuê · Hoá đơn · Thêm (`:174-179`).

**Tần suất suy từ nghiệp vụ** (FACT về nghiệp vụ, không phải đo người dùng — chu kỳ tháng của một nhà trọ theo chính flow pha 2: chốt chỉ số → lập Đợt → thu → đối soát; Hợp đồng/Người thuê/Lưu trú theo lượt vào-ra; theo `worker-services.md` BE cũng lịch theo tháng/ngày):

| Nhóm tần suất | Khu vực | Ghi chú |
|---|---|---|
| Hằng ngày | Hôm nay | (Việc cần làm = bản đầy đủ của cùng hàng đợi — `task-center.template.tsx` dùng chung `TaskQueue`; chuông = bản thứ ba) |
| Hằng tháng, theo chuỗi | Chỉ số điện nước → Hoá đơn (Đợt) → thu tiền (trong Hoá đơn) | ba khu vực cho **một** chuỗi việc; Chỉ số nằm ở nhóm "Quản lý" thứ 3, Hoá đơn thứ 2 — ngược thứ tự làm |
| Hằng tháng, sổ sách | Hoá đơn NCC · Chi phí · Đối soát · Báo cáo | Đối soát và Báo cáo **cùng nguồn** (Hoá đơn + NCC + Chi phí — `utils/reconciliation-items.ts`, `utils/report-rows.ts`), khác cách cắt (kỳ vs 6 kỳ/tầng) |
| Theo lượt vào/ra (vài lần/năm/Phòng) | Hợp đồng · Người thuê · Khai báo lưu trú · Phòng (đổi trạng thái) | Khai báo lưu trú ở nhóm "Hệ thống" dù là nghĩa vụ theo Người thuê; Phòng ở bottom nav dù đổi hiếm |
| Hiếm | Toà nhà · Thông báo (mẫu) · Cài đặt | Thông báo = mẫu + nhật ký; nhật ký nhắc đã nằm trên từng Hoá đơn (tab Nhắc nợ) |

**DELTA**: 15 mục / 3 nhóm không sai chuẩn (Material/Apple không đặt trần cho drawer/sidebar; trang HIG/M3 **không mở được** — render JS, §F), nhưng: (1) NN/g **H8** — "Việc cần làm" là mục sidebar cho một màn trùng Hôm nay; (2) nhóm theo *loại dữ liệu* thay vì *chuỗi việc* (`ux#…nav-hierarchy` — brief C hướng "adaptive navigation"), nên chuỗi tháng cắt thành 3 mục ở 2 nhóm; (3) bottom nav 5 ô đúng trần (`ux#… bottom-nav-limit ≤ 5`, brief §2 C; M3/HIG **chưa xác minh** verbatim), nhưng ô "Hoá đơn" mở **84 thẻ cũ nhất trước** (`invoice-list` không sort, `useListView` mặc định `grid` — `list-view.tsx:20`), không phải "việc phải thu" — bottom nav dẫn về danh sách thay vì việc; (4) "Thêm" chứa 11 mục dạng lưới 3 cột không có tài khoản/đăng xuất (C.4).

---

## Phần C — UI đơn giản nhưng đẹp

### C.1 Audit nhất quán (FACT, đếm từ code + ảnh)

| Mẫu | Trạng thái sau pha 2 | Còn lệch |
|---|---|---|
| Header trang | `ListPageHeader` mọi list ✓; wizard Hợp đồng tự vẽ h1 + "Hủy" (`contract-create.template.tsx:113-128`) | 2 kiểu (list vs wizard); h1 thêm "Quản lý/Danh sách" (B.1) |
| Chi tiết | `DetailPageShell` 10 màn ✓ | breadcrumb chỉ ở 2 màn 3 cấp; "Quay lại" ở 2 cấp ✓ (`ux#6`) |
| KPI | `KpiStrip` một composite ✓, 98 px desktop / 130 px mobile (đo) | số KPI 2–4 tuỳ màn; Hoá đơn 4 ô trong đó 2 ô = 0 đ; Khai báo 2 ô |
| Thẻ thực thể | một anatomy ✓ | Hoá đơn 368×379 / Phòng 214×234 (đo) — cùng anatomy, khác mật độ: thẻ Hoá đơn có 3 tầng (badge · nhãn-giá trị · SỐ TIỀN/HẠN uppercase · Cập nhật · ⋯) |
| Bảng | `DataTable` ✓ (hàng 53 px, th 40 px, checkbox 16 px, ⋯ 32 px — đo) | view mặc định **thẻ**, không nhớ lựa chọn ngoài URL |
| Form | `FormSheet` 6 form ngắn ✓; wizard 1; trang 2 (Gia hạn, Thanh lý) | Gia hạn giữ bố cục "form + card xác nhận bên phải" (A.8) |
| Badge | `StatusBadge` ✓ một hình | contrast (C.5) |
| Icon | theo bảng brief §4 ✓ | Chỉ số & Hôm nay dùng `Bell` cho hai loại việc (`task-queue.tsx:160,165`) |
| Type scale | 24 / 18 / 16 / 14 / 12 (đo) ✓ (`ux#74`) | `ItemTitle` line-height 19,25 px (1,375) lệch thang 20 |
| Màu | token theme cho trạng thái ✓; navy accent ✓ | chart `--chart-1` cam `#f54900` + `--chart-2` teal — hai màu **không thuộc** palette navy/green của `colors#105` (ADR-0011 cố ý giữ chart của theme) → màn Hôm nay có 3 hue: navy, cam, teal |
| Radius | `0.375rem` ✓ | ảnh QR `rounded-xl border-4 border-primary shadow-lg` (`vietqr-dialog.tsx:540`) — bóng + viền dày trên bề mặt phẳng |

### C.2 Chỗ thừa / lặp

- Cùng một danh sách việc **ba nơi** (Hôm nay · chuông · `/tasks`); chuông trên chính màn Hôm nay lặp nội dung đang hiện (`state__notification_panel.png`).
- Hôm nay: 2 KPI trùng số (B.1); 10 dòng cùng tiêu đề + badge "Cao".
- Chi tiết Hoá đơn: Kỳ ×2, Mã ×2, Tổng cộng ×2, "Phòng Phòng"; card "Hành động" một nút; card "Tóm tắt" là bản sao header.
- Toà nhà: 3 lối vào sheet Cài đặt; 83% ×3; "Ngày thu" ×2.
- Vòng đời (cột phải Hợp đồng): 5 bước dọc ≈ 520 px cho một thông tin badge đã nói.
- Lưới Phòng scope null: nhóm tầng **xuyên Toà nhà**, 9 nhóm × ≤ 2 thẻ, `Tầng 5 → Tầng 1` (`room-grid.tsx`; `desktop__rooms.png`); nhóm tầng chỉ có nghĩa **trong** một Toà nhà.
- `/tasks` = Hôm nay + ô tìm + 2 facet.

### C.3 Whitespace / hierarchy / density

- **Thẻ Hoá đơn 379 px × 3/hàng** ở 1440 → 3 thẻ/viewport, 84 thẻ = 28 hàng; bảng cùng dữ liệu 53 px/hàng → 7 hàng/viewport và có checkbox. Với việc "thu tiền tháng này", bảng là dạng đúng; mặc định lại là thẻ (`list-view.tsx:20`).
- **Cột phải chi tiết** 1/3 màn chứa 1–2 card nhỏ, còn lại trống (`desktop__rooms_R-B1-101.png`, `desktop__invoices_I001.png`).
- **Wizard**: `max-w-2xl` giữa màn, bước 1–2 chiếm ~30 % chiều cao còn lại trống (`desktop__contracts_create.png`).
- **Báo cáo scope null**: một bảng 3 dòng và nút "Xuất báo cáo" đứng một mình một hàng (`desktop-tall__reports.png`).
- Tương phản bề mặt: card `#ffffff` trên nền `#f8fafc` = **1,05:1**, hairline `#e5e5e5` = **1,26:1** (đo `contrast.cjs`) — "phẳng" đúng ADR-0011, nhưng khối chỉ còn phân biệt bằng viền 1 px rất nhạt; WCAG 1.4.11 không đòi cho card trang trí, ghi để design quyết mức "phẳng".
- Line-height body 20/14 = 1,43 (`ux#72` khuyên 1,5–1,75 cho đoạn văn; app là bảng/nhãn nên chấp nhận được).

### C.4 Mobile (390)

| # | FACT | Nguồn | Ảnh |
|---|---|---|---|
| 1 | **Item của Việc cần làm tràn ngang**: `[data-slot=item]` rộng **391 px** trong cột 358 px; nút "Xem" bị cắt còn "Xe" | `task-queue.tsx:264-287` (`ItemActions` không wrap) | `mobile-tall__home.png`, `measure.cjs` |
| 2 | **Không có Đăng xuất / tài khoản**: `HeaderUserMenu` `hidden md:block`, `SidebarTrigger` `hidden md:inline-flex`, sheet "Thêm" = 11 khu vực | `app-header.tsx:32, 48`, `bottom-nav.tsx:445-476` | `mstate__more_sheet.png` |
| 3 | Danh sách mặc định **thẻ 429 px** (Hoá đơn), 268 px (Phòng) — 2 thẻ/màn; toolbar xếp 3 hàng (tìm / Trạng thái / Xuất CSV) trước thẻ đầu tiên | `list-view.tsx:20` | `mobile-tall__invoices.png` |
| 4 | `renderMobileRow` (Item gọn) chỉ hiện khi view = bảng (`?view=table`) | `data-table.tsx` | `mstate__invoices_table_as_items.png` |
| 5 | KPI strip 130 px, ô 150 px, cuộn ngang ✓ (quyết định 16) — ô thứ 3 cắt "Hợp đồ… trong 30" | `kpi-strip.tsx:202` | `mobile__home.png` |
| 6 | Header mobile: tiêu đề + tìm + chuông ✓ (defect cũ #20 đã sửa) | `app-header.tsx` | — |
| 7 | Tabs scope: ToggleGroup `size="sm"` **32 px** cao, cuộn ngang, không chỉ báo cuộn | `building-scope.tsx:318-336` | `mobile__home.png` |
| 8 | Wizard mobile: stepper ngang thu gọn ✓ (`mstate__contract_wizard_step3.png`) | | |
| 9 | Nhập chỉ số mobile: mỗi Phòng một thẻ ✓, không tràn | `meter-input-card.tsx` | `mstate__meter_input_anomaly.png` |
| 10 | Devtools TanStack (🏝) che ô "Thêm" của bottom nav ở 390 — chỉ ở `PUBLIC_APP_ENV=local`, không phải defect production | `pages/main.tsx` | mọi ảnh mobile |

**Target size** (đo): bottom nav 78×63 ✓ (44 pt/48 dp); nút Item 32 px, ⋯ 32 px, tabs scope 32 px, `TabsTrigger` 29 px, badge 20 px (không phải target), **checkbox 16×16** — WCAG 2.5.8 (AA) tối thiểu **24×24 CSS px** trừ ngoại lệ *Spacing* (vòng 24 px quanh mỗi target không giao nhau): checkbox trong ô 39×53 px → có thể đạt qua Spacing (**chưa xác minh** vòng 24 px của checkbox và của link tên hàng); 32 px đạt WCAG nhưng dưới 44 pt iOS / 48 dp Android (`ux#22`; HIG/M3 **chưa mở được**, NN/g *Touch Targets*: "at least 1 cm × 1 cm" ≈ 38 px @ 96 dpi).

### C.5 Token, palette ADR-0011 và WCAG bằng số

Công thức: WCAG 2.x relative luminance `L = 0.2126R + 0.7152G + 0.0722B` (sRGB linear hoá), `CR = (L1 + 0.05)/(L2 + 0.05)`; oklch → sRGB theo ma trận OKLab (Björn Ottosson) trong `contrast.cjs`; màu `/10` = alpha-blend 10 % lên `--card #ffffff`. Token đọc từ `src/globals.css:122-141` (override) và `tooling/tailwind/theme.css:69-107` (theme).

| Cặp | Hex | CR | WCAG 1.4.3 (AA 4,5:1 chữ thường; 3:1 chữ ≥ 18 pt / 14 pt đậm) |
|---|---|---|---|
| `--foreground` / `--background` | `#0f172a` / `#f8fafc` | **17,06** | ✓ |
| `--muted-foreground` / `--background` · `/card` · `/bg-muted` | `#475569` / `#f8fafc` · `#fff` · `#f5f5f5` | 7,24 · 7,58 · 6,95 | ✓ (theme gốc `#737373` chỉ 4,73 — override tốt hơn) |
| `--primary` / `--background`; trắng / primary; primary / `--accent` | `#1e3a5f` | 10,99; 11,50; 10,57 | ✓ |
| **`text-success` / `bg-success/10`** (badge Đã thu, Đang thuê, Đã gửi, Lãi) | `#00a63e` / `#e5f6ec` | **2,87** | ✗ (12 px, weight 500) |
| **`text-warning` / `bg-warning/10`** (Sắp hết hạn, Thu một phần, Chưa gửi, Trung bình) | `#fe9a00` / `#fff5e5` | **1,98** | ✗ — dưới cả 3:1 |
| **`text-info` / `bg-info/10`** (Chưa thu, Đang giữ, Chờ xử lý, mọi loại việc) | `#2b7fff` / `#eaf2ff` | **3,34** | ✗ |
| **`text-destructive` / `bg-destructive/10`** (Quá hạn, Không hoàn, Cao) | `#e7000b` / `#fde5e7` | **3,99** | ✗ |
| `text-success` / card (StatItem "Đã trả") | `#00a63e` / `#fff` | 3,22 | ✗ — `StatItem` value là `text-base font-semibold` (16 px/600, `stat-item.tsx:18`), dưới ngưỡng "large text" 14 pt đậm ≈ 18,66 px |
| `text-destructive` / card ("Còn lại", chữ lỗi form) | `#e7000b` / `#fff` | 4,76 | ✓ |
| `text-warning` / card (Alert Thanh lý) | `#fe9a00` / `#fff` | 2,15 | ✗ |
| `--chart-1` / `--chart-2` (kề nhau, phi văn bản) | `#f54900` / `#009689` | 1,02 | hue khác nhau (cam/teal — trục an toàn cho mù màu đỏ-lục), độ sáng bằng nhau |
| card / background; border / card | — | 1,05; 1,26 | bề mặt "phẳng" (không thuộc 1.4.3) |

**FACT về hợp đồng test**: `test/globals.test.ts` đo AA cho `OVERRIDDEN_TOKENS` (`:31-41`: primary, ring, sidebar-primary, background, foreground, muted-foreground, accent) — **không** đo `statusTone` vì các token đó là của theme (ADR-0011 cố ý giữ). Hệ quả: chữ trạng thái — thứ mang nghĩa nhiều nhất trên mọi màn — là nhóm duy nhất dưới AA, và không test nào bắt. `ux#36` (High), WCAG 1.4.3 AA.

**Palette ADR-0011 vs màn hình thật**: navy `#1e3a5f` chỉ xuất hiện ở nút primary, tab đang chọn, link, avatar; hai biểu đồ Hôm nay/Báo cáo là **cam `#f54900`** (`--chart-1`) và teal — hai màu chiếm diện tích lớn nhất trên màn đầu không thuộc palette `colors#105` ("navy + paid green"). `--success` `#00a63e` là green của theme, không phải `#059669` của `colors#105` (ADR-0011 chọn giữ theme). Font IBM Plex Sans Variable ✓ (`measure.cjs` `body` font-family), `tabular-nums` ✓ ở số.

---

## §D. Câu hỏi mở cho grill (DRAFT — chỉ hỏi)

**Flow / business**

1. **Hôm nay là hàng đợi hay bảng?** Giữ donut + bar trên màn đầu, hay đẩy xuống Báo cáo và để Hôm nay chỉ còn KPI + việc (B.3, NN/g dashboards/progressive disclosure)? Việc sắp theo hạn/ưu tiên hay theo nguồn?
2. **Gộp hay tách "Cần thu" và "Quá hạn"?** Một số "Còn phải thu tháng này" + dòng phụ "trong đó quá hạn n" — hay hai ô như hiện tại (B.1)?
3. **Chỉ số thuộc Phòng hay thuộc Hoá đơn?** FE: bản ghi rời theo Phòng/kỳ, VERIFIED ngay khi lưu; BE target: `utility_readings` thuộc `invoice_id`, Hoá đơn `DRAFT` → `finalize` (`billing-service.md:15-23, 85`). Round 3 vẽ theo bên nào? Nếu theo BE, "Nhập chỉ số" và "Đợt hoá đơn" là **một** màn (Nháp của kỳ) chứ không phải hai.
4. **Cái gì BE sẽ tự làm thì FE có còn là nút không?** Lập Đợt (cron 06:00), quá hạn, nhắc (T2/T5), QR → thanh toán (webhook), tạm trú hết hạn (`worker-services.md:59-70`): giữ nút tay để demo Mock, hay vẽ ngay dạng "đã tự lập, cần duyệt"?
5. **Wizard Hợp đồng còn 4 bước?** Gộp Phòng + Người thuê một bước, điều khoản lấy mặc định từ Phòng/Toà nhà (giá, ngày thu, cọc = 1 tháng), thời hạn thay ngày kết thúc — hay giữ 4 bước (A.2)?
6. **Ba "ngày"** (`utilityCycleDay`, `collectionDay`, `Contract.paymentDueDay`): giữ mấy, ai override ai, nhãn là gì (B.1)?
7. **Thu tiền sau QR**: có nút "Đã nhận đủ" ngay trong dialog VietQR / trên dòng việc không, hay luôn qua Sheet 3 ô? Số tiền mặc định = còn lại?
8. **Khai báo lưu trú**: "Đã gửi" có hỏi mã hồ sơ + ngày không? Đăng ký tạm trú có hành động gì (đánh dấu đã nộp/đã duyệt)? trạng thái suy từ hạn hay lưu? cổng nào (`dichvucong.gov.vn` vs `dichvucong.dancuquocgia.gov.vn`)?
9. **Gửi nhắc ở Hôm nay** ghi nhật ký thật (mở dialog chọn kênh như list) hay bỏ nút, chỉ còn "Xem"? Có "Nhắc tất cả n quá hạn" không?
10. **Mock kỳ 09/2026**: sửa cho nhất quán (Chỉ số 09 VERIFIED nếu Hoá đơn 09 đã có, hoặc bỏ Hoá đơn 09) — ai làm trước round 3?
11. **Trần giá điện** `ELECTRICITY_PRICE_CAP_PER_KWH = 3_900` (`constants/tariff.ts:6`) ghi nguồn TT 60/2025 nhưng note pha 2 §A.0.2 không có số 3.900 (bậc 6 QĐ 1279 = 3.460 chưa VAT; mức cho người thuê < 12 tháng = 2.380) — **chưa xác minh** 3.900 đến từ đâu; Mock 3.500/3.800 đều dưới trần nên Alert không bao giờ hiện. Trần nào?

**IA / UI**

12. Sidebar 15 → nhóm theo **chuỗi việc** (Tháng này: Chỉ số · Đợt · Hoá đơn · Đối soát | Người & Phòng: Toà nhà · Phòng · Người thuê · Hợp đồng · Lưu trú | Sổ sách: NCC · Chi phí · Báo cáo | Cài đặt) hay giữ ba nhóm hiện tại? Bỏ "Việc cần làm" khỏi sidebar (= Hôm nay)?
13. Bottom nav: "Hoá đơn" hay "Thu tiền" (list lọc chưa thu, sort hạn) ở ô thứ 4? Tài khoản/đăng xuất vào "Thêm"?
14. Danh sách: **bảng mặc định** trên desktop, Item trên mobile, thẻ chỉ cho Phòng (lưới tầng)? Sort mặc định theo hạn/kỳ mới nhất?
15. Badge: đổi `statusTone` sang chữ đậm hơn (vd `text-success` → token `-700`/`-800` riêng cho chữ, nền `/10`) để đạt 4,5:1 — sửa ở app (unlayered, thêm 4 token `--success-text`…) hay ở theme dùng chung (ảnh hưởng mọi app; ADR-0009 cấm đổi nghĩa status)?
16. Chart: giữ `--chart-*` của theme (cam/teal) hay override về navy/green trong app (ADR-0011 nói giữ)?
17. Cột phải chi tiết: giữ 2/3 + 1/3 cho mọi màn, hay chỉ khi có ≥ 2 card (Hoá đơn/Phòng hiện 1 nút)?
18. Lưới Phòng ở scope "Tất cả": nhóm theo **Toà nhà → tầng**, hay ép chọn một Toà nhà như Đợt/Nhập chỉ số?
19. Tabs chi tiết lên URL (`?tab=`) để link thẳng từ Hôm nay (đã có `hooks/use-url-tab.ts`, chỉ Thông báo dùng)?
20. i18n / dark mode vẫn hoãn (quyết định 17–18)?

---

## §E. Đề xuất (DRAFT — xếp theo tác động/chi phí, mỗi dòng trỏ FACT)

### Đổi copy (rẻ nhất, không đổi hành vi)

| # | Việc | FACT |
|---|---|---|
| E1 | Một tên cho Đợt hoá đơn (h1, nút Hôm nay, nút list, submit "Lập n hoá đơn" — bỏ "Gửi") | B.1 |
| E2 | Bỏ "Quản lý/Danh sách" khỏi h1; mô tả header Hôm nay/Khai báo theo glossary | B.1 |
| E3 | "Đã xác minh" → "Đã xác nhận"; kỳ `2026-09` → `09/2026` trong tiêu đề việc; "Phòng Phòng 102" | B.1, A.3, B.3 |
| E4 | "Chưa đủ điều kiện" → "Thiếu Chỉ số điện/nước kỳ 09/2026" + link Nhập chỉ số | A.3 |
| E5 | `Kbd` hiện Ctrl+K trên Windows | B.4 |

### Đổi vỏ (UI)

| # | Việc | FACT |
|---|---|---|
| E6 | Sửa 4 tone badge đạt ≥ 4,5:1 (chữ đậm hơn trên nền 10 %), mở rộng `globals.test.ts` đo `statusTone` | C.5 |
| E7 | Mobile: `ItemActions` wrap/xuống dòng; thêm tài khoản + Đăng xuất vào sheet "Thêm" | C.4 #1–2 |
| E8 | Bảng là view mặc định (desktop), Item trên mobile; sort Hoá đơn theo hạn/kỳ mới nhất | C.3, C.4 #3 |
| E9 | Chi tiết: bỏ card "Tóm tắt" trùng header; card "Hành động" chỉ khi ≥ 2 hành động; ẩn VietQR khi Còn lại = 0; cột phải ẩn khi rỗng | B.3, C.2 |
| E10 | Toà nhà: một lối vào Cài đặt; một "83%" | C.2 |
| E11 | Vòng đời: bước đầu không tick khi chưa qua; Alert sắp hết hạn dùng `warning` | B.2 |
| E12 | Hôm nay: gộp dòng cùng loại ("4 Hoá đơn quá hạn · 11,3 tr · [Nhắc tất cả] [Xem]"), bỏ badge "Cao" khi cùng giá trị, chart xuống dưới/qua Báo cáo | B.3, C.2 |
| E13 | Lưới Phòng scope null nhóm Toà nhà → tầng | C.2 |
| E14 | Hôm nay "Khai báo" → tab Lưu trú (tabs lên URL) | A.7, §D.19 |

### Đổi flow (business — cần grill)

| # | Việc | FACT |
|---|---|---|
| E15 | Nhập chỉ số **điền sẵn** Nháp của kỳ; lưu = Nháp, "Xác nhận" riêng (hoặc gộp với Đợt theo mô hình BE) | A.4, §D.3 |
| E16 | Wizard Hợp đồng: mặc định giá = `Room.price`, cọc = 1 tháng, ngày thu = Toà nhà, thời hạn thay ngày kết thúc; gộp bước 1–2 | A.2 |
| E17 | Thu tiền: số tiền mặc định = còn lại; "Đã nhận" từ dialog VietQR; Gửi nhắc ở Hôm nay ghi nhật ký thật hoặc bỏ | A.5 |
| E18 | Một khái niệm "ngày thu" (bỏ `paymentDueDay` khỏi wizard hoặc dùng nó cho `dueDate`) | B.1 |
| E19 | KPI "Quá hạn" một công thức (outstanding) ở mọi màn; "Chưa thu" gồm cả quá hạn hoặc đổi nhãn | B.2 |
| E20 | Khai báo: "Đã gửi" hỏi mã hồ sơ + ngày; Đăng ký tạm trú suy trạng thái từ hạn + có hành động | A.7 |
| E21 | Mock 09/2026 nhất quán; "chưa lập Đợt" suy từ Hoá đơn của kỳ, không từ Chỉ số | A.3 |
| E22 | IA: sidebar theo chuỗi việc, bỏ "Việc cần làm" khỏi sidebar, bottom nav ô 4 = việc phải thu | B.5 |

Thứ tự gợi ý: E21 (Mock) → E15–E19 (flow, quyết ở grill) → E6–E14 (vỏ) → E1–E5 (copy, đi kèm từng ticket).

---

## §F. Nguồn (URL đầy đủ, truy cập 2026-09-18)

**Repo**: `apps/smart-rental/{README.md,CONTEXT.md,src/**,test/globals.test.ts,e2e/support/auth-session.ts,ports.env}` tại HEAD `031ccfc` (và WT nơi ghi); `docs/research/smart-rental-rebuild.md`; `docs/design/smart-rental-redesign.md` + `smart-rental-redesign/mockup-v1-ba-huong.html`; `docs/adr/0011-*.md`, `0012-*.md`; `tooling/tailwind/theme.css`; GitHub Issues #153 (+2 comment tổng kết) và #154–#167 (`gh issue view`); `CLAUDE.md` §1/§7a.

**Backend target contract (chỉ đọc)**: `D:\Personal\smart-rental\backend\document\fe-api-integration\{billing-service,payment-service,notification-service,contract-service,tenant-service,property-service,worker-services}.md`.

**Primary sources UX/WCAG/stack**:
- Nielsen, J. *10 Usability Heuristics for User Interface Design* (1994, rev. 2024) — https://www.nngroup.com/articles/ten-usability-heuristics/ (H1–H10 trích nguyên văn ở Phần A/B).
- Sherwin, K. *Placeholders in Form Fields Are Harmful* (2014) — https://www.nngroup.com/articles/form-design-placeholders/ ("Disappearing placeholder text strains users' short-term memory"; áp cho placeholder giống giá trị thật ở Sheet Người thuê — `state__tenant_create_sheet_errors.png`).
- Budiu, R. *Wizards: Definition and Design Recommendations* (2017) — https://www.nngroup.com/articles/wizards/.
- Laubheimer, P. *Dashboards: Making Charts and Graphs Easier to Understand* (2017) — https://www.nngroup.com/articles/dashboards-preattentive/.
- Nielsen, J. *Progressive Disclosure* (2006) — https://www.nngroup.com/articles/progressive-disclosure/.
- Harley, A. *Touch Targets on Touchscreens* (2019) — https://www.nngroup.com/articles/touch-target-size/ ("at least 1cm × 1cm").
- W3C *WCAG 2.2* — https://www.w3.org/TR/WCAG22/ (1.4.3, 2.4.7, 2.4.11 trích nguyên văn); *Understanding 2.5.8 Target Size (Minimum)* — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html (24×24 CSS px + 5 ngoại lệ).
- Tailwind CSS v4 *Theme variables* — https://tailwindcss.com/docs/theme (`--text-xs` 0.75rem … `--text-2xl` 1.5rem; `--spacing` 0.25rem).
- shadcn/ui *Data Table* — https://ui.shadcn.com/docs/components/data-table (TanStack, pagination/sorting/filtering/row selection/column visibility).
- Base UI *Toggle Group* — https://base-ui.com/react/components/toggle-group ("Provides a shared state to a series of toggle buttons"; `value` mảng; arrow-key + `loopFocus`) — cơ sở cho tabs scope là ToggleGroup.
- **Chưa mở được** (trang render bằng JS, WebFetch chỉ trả tiêu đề): Apple HIG *Tab bars* https://developer.apple.com/design/human-interface-guidelines/tab-bars, *Accessibility* (44 pt) https://developer.apple.com/design/human-interface-guidelines/accessibility; Material 3 *Navigation bar* https://m3.material.io/components/navigation-bar/guidelines; M2 *Bottom navigation* / *Data tables* — con số 44 pt / 48 dp trích qua `ux-guidelines.csv` #22, #104.

**CSV tĩnh** `.agents/skills/ui-ux-pro-max/data/`: `ux-guidelines.csv` #4, #5, #6, #19, #22, #23, #31, #33, #36, #37, #39, #40, #43, #54, #56, #59, #61, #64, #69, #71, #72, #74, #79, #80, #81, #84, #85, #91, #104, #106, #114, #116; `stacks/shadcn.csv` #11–19, #24–26, #40–43, #44–47, #53–54, #67; `react-performance.csv` #18–21 (derived state).

**Sản phẩm ngoài, first-party docs** (chỉ để so flow, không phải chuẩn): ITRO — https://quanlynhatro.com/huong-dan-su-dung (mục "Quản lý điện nước", "Lập hóa đơn và thanh toán hóa đơn"); https://quanlynhatro.com/blog/thuc-hien-chuc-nang-chot-dien-nuoc-tren-phan-mem-quan-ly-nha-tro-itro-phien-ban-app-49 ("Trên màn hình Trang chủ, ấn chọn 'Điện nước' → Chọn nút 'Chốt'"; "Điền đầy đủ các thông tin trên màn hình Chốt điện nước"); https://quanlynhatro.com/blog/huong-dan-lap-va-thanh-toan-hoa-don-dich-vu-tren-phan-mem-quan-ly-nha-tro-itro-15 ("Lập hóa đơn dịch vụ cho nhiều phòng cùng lúc (import bằng excel)"). Nhà trọ 24h https://nhatro24h.vn/tin-tuc — trang tin, không có guide thao tác (bỏ).

**Boot/chụp/đo**: `bun run dev` (Vite 8, port 3006); Playwright `playwright-core@1.62.1` qua `node` (`node_modules/.bun/playwright-core@1.62.1`), chromium headless; script `shoot-r3.cjs` / `shoot-r3b.cjs` / `shoot-r3c.cjs` / `measure.cjs` / `contrast.cjs`; Gate log `typecheck.log`, `test.log` — tất cả ở scratchpad.
