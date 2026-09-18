# Nghiên cứu lại `apps/smart-rental` — flow nghiệp vụ chuẩn, chuẩn hoá code, đầu vào cho bước design (pha 2)

> Ngày kiểm tra: **2026-09-17**, nhánh `dev`, HEAD `ea20143` (working tree có thay đổi chưa commit của `documents`/`portfolio`, không đụng `apps/smart-rental`). Nguồn: **code thật** của `apps/smart-rental` (đọc trọn 18 slice — mọi `*.template.tsx`, mọi file `src/components/**`, `hooks/api/**`, `constants/mock/**`, `types/**`, `test/**`), spec [#127](https://github.com/qtuan02/monorepo/issues/127) + 9 sub-issue #129–#143 (qua `gh`), `apps/smart-rental/README.md` + `CONTEXT.md`, `.agents/rules/*`, backend `D:\Personal\smart-rental\backend` (chỉ đọc), `packages/ui/src/components/*`, dữ liệu CSV tĩnh của `.agents/skills/ui-ux-pro-max/data/` (đọc bằng grep, **không** Python), ADR-0008/0009, `docs/design/documents-redesign.md`, và **primary sources pháp lý/kỹ thuật** (văn bản luật, EVN, NAPAS/VietQR — §A.0). App được **boot thật** (`bun run dev`, port 3006) và chụp **85 screenshot** bằng Playwright ở 1440×900 và 390×844, kèm console log từng route. Mọi claim có `path:line`, URL hoặc số issue; chỗ không mở/kiểm được ghi **"chưa xác minh"**.
>
> **Ba loại nội dung:** **FACT** = đọc từ code/nguồn, trích được; **DELTA** = khoảng cách giữa app và chuẩn, vẫn là FACT hai đầu; **DRAFT** = đề xuất/câu hỏi của agent — chỉ nằm ở §D và §E, không nằm trong phần chẩn đoán. Không bịa số.
>
> **Không sửa file nào ngoài note này, không commit.** Screenshot nằm ở scratchpad của session (`…\scratchpad\shots\`, không commit — tên file trích trong §C.1 để đối chiếu lúc grill). Dev server đã tắt sau khi chụp.

Cấu trúc: **TL;DR** → **§0 Bối cảnh, phạm vi, Gate** → **Phần A — flow nghiệp vụ** (A.0 nguồn chuẩn · A.1 Hợp đồng · A.2 Hoá đơn/VietQR · A.3 Chỉ số điện nước → giá · A.4 Khai báo lưu trú · A.5 Đối soát/Báo cáo/Dashboard · A.6 Building scope · A.7 Auth/backend · A.8 Entity model) → **Phần B — chuẩn hoá code** (B.1 inventory composite · B.2 placeholder/dead code · B.3 vi phạm rule · B.4 status config · B.5 test · B.6 deps · B.7 Gate) → **Phần C — UI/UX** (C.1 defect + console · C.2 audit nhất quán · C.3 đầu vào design step · C.4 primitive chưa dùng) → **§D Câu hỏi mở cho grill** → **§E Đề xuất (DRAFT)** → **§F Nguồn**.

---

## TL;DR

1. **Pha 1 là port trung thực, và cũng trung thực với mọi lỗ hổng của prototype.** Gate xanh (typecheck 0 lỗi, 38 file test / 158 test pass — §B.7), 30 route mở được, nhưng **~45 nút/menu không có handler** (§B.2), hai `TODO` submit (Đợt hoá đơn, Nhập chỉ số), và mọi con số "tăng trưởng"/"thời hạn"/"phí" ở màn chi tiết là **literal** (`+12`, `+15.3%`, "12 tháng", "Hợp đồng dài hạn", phí thanh lý 500 000/300 000 đ…). Redesign không thể chỉ đổi vỏ: phần lớn màn hình chưa có *hành vi* để đổi vỏ cho.
2. **Entity model của Mock là 15 mảng rời không nối được với nhau** (§A.8). Hợp đồng/Hoá đơn/Người thuê giữ **tên** thay vì id; `Utility.roomId = "room-001"` không tồn tại trong `mockRooms` (`R-B1-101`); `Task.relatedId = "inv-001"/"con-002"` trỏ vào id không có (`I001`/`C001`), nên "Xem chi tiết" của 5/8 việc cần làm rơi vào màn "không tìm thấy"; id Khai báo lưu trú `C001` trùng id Hợp đồng `C001`; Hợp đồng của Toà nhà b2 trỏ "Phòng 111–120" trong khi b2 chỉ có 201–210; **bốn kiểu ngày** (`DD/MM/YYYY` string, ISO date, ISO timestamp, `YYYY-MM`) và **hai kiểu kỳ** (`MM/YYYY`, `YYYY-MM`) sống song song. Đây là thứ phải chốt *trước* design, vì màn hình nào cũng vẽ lên nó.
3. **Ba flow nghiệp vụ lệch chuẩn rõ nhất:** (a) **Hợp đồng** — vòng đời `pending → active → ending → ended` không có cọc (`deposit_status`), không có bàn giao, Gia hạn chỉ đổi `endDate`+`rentAmount` và luôn set `active` (kể cả Hợp đồng đã `ended`), Thanh lý chỉ set `ended` và không ghi quyết toán cọc (§A.1); backend target đã có `DRAFT/ACTIVE/EXPIRING/EXPIRED/TERMINATED` + `deposit_status` (be-motel `contract-service.md:58-61`). (b) **Hoá đơn** — `Invoice` không có `contractId`, không có line items, không có `paidAmount`; chi tiết hoá đơn vẽ "Phí dịch vụ 0 đ / Các khoản khác 0 đ" cứng; VietQR là lưới 25 ô giả, không có BIN/số tài khoản (§A.2); backend target có `DRAFT/UNPAID/PARTIAL/PAID/OVERDUE/CANCELLED` + `invoice_line_items` + `payment_requests` (`billing-service.md:60`, `payment-service.md:63`). (c) **Chỉ số điện nước → tiền** — màn chi tiết tính giá phẳng 3 500 đ/kWh, 8 000 đ/m³ (`meter-reading.ts:39-42`), Cài đặt lưu **4 bậc** 1 678/1 734/2 014/2 536 đ (`settings.ts:216-222` — bậc giá EVN cũ, chỉ tới 300 kWh) và **không nơi nào dùng** bậc thang để lập Hoá đơn; hai nguồn giá mâu thuẫn trong một app (§A.3).
4. **Building scope áp không đều** (§A.6): 9 hook nhận `buildingId`, nhưng **Khai báo lưu trú, Việc cần làm, Báo cáo, Thông báo, Cài đặt, Đợt hoá đơn, Nhập chỉ số** đọc Mock không scope; Dashboard "một Toà nhà" là **tổng × tỷ lệ** (`mockDashboardShare`), không phải số của Toà nhà đó.
5. **Code sạch hơn prototype nhiều, nhưng còn hai lớp trùng và một loạt rule-smell nhỏ** (§B): `contract-list` và `tenant-list` copy lại `useListView`/`ListViewSwitch` thay vì import `~/components/data-table/list-view.tsx`; `SummaryCard` đặt `flex items-center` lên `CardContent` mà primitive đã là `flex flex-col` → mọi thẻ KPI render **icon trên, chữ giữa, số giữa** (không phải bố cục icon-trái như code ngụ ý — §C.1 #1); màu trạng thái/icon viết bằng palette Tailwind thô (`emerald-100`, `blue-600`, `red-50`…) ở 20+ chỗ thay vì token `--success/--warning/--info` mà `theme.css` đã có; hai React key trùng ngoài console (`Báo cáo` — Mock sinh dòng trùng `month+building+floor`; Dashboard — legend donut thiếu `nameKey`).
6. **UI/UX: không lỗi vỡ layout nào ở 1440, nhưng "xấu" đến từ bốn nguồn có thể nêu tên** (§C.1–C.2): (i) thẻ KPI sai bố cục và **chiếm 4 thẻ × 130 px trên mobile** trước khi tới nội dung; (ii) màn chi tiết lặp cùng một dữ liệu 2–3 lần (Phòng: giá thuê hiện 3 lần; Hợp đồng: ngày bắt đầu/kết thúc 3 lần, khách/phòng 3 lần); (iii) lưới Phòng **nhóm theo tầng sau khi phân trang** → "Tầng 3" chỉ có 2 phòng ở trang 1; (iv) 6 kiểu header trang, 3 kiểu toolbar, 4 kiểu "thẻ thực thể", 3 kiểu bố cục chi tiết, 2 kiểu wizard — cùng tồn tại. Theme hiện là **shadcn neutral mặc định** (đen/xám, `tooling/tailwind/theme.css` commit `79c52df`), app **chưa override gì** — đúng trường hợp "app chưa có brand" của §7a; dữ liệu palette gần nhất từ `products.csv` là #105 Invoice & Billing / #102 Inventory / #101 CRM (§C.3).
7. **Backend còn xa hơn spec ghi:** `be-motel` chỉ có `BaseController` và `/api/v1/user-profiles` (§A.7); nhưng `backend/document/fe-api-integration/*.md` là **target contract** đã đặt tên enum/bảng cho mọi entity — redesign nên vẽ theo enum của contract đó thay vì enum của prototype, để lúc nối BE không phải đổi tên trạng thái lần thứ ba.

---

## §0. Bối cảnh, phạm vi, phương pháp

- **Phạm vi**: pha 2 của spec #127 — "redesign" — theo đúng chuỗi §7 của `CLAUDE.md`: note này → bước design (`ui-ux-pro-max`, CSV tĩnh) → `/grill-with-docs` → `/to-spec`. Note **không** thiết kế; nó liệt kê FACT để chủ repo quyết ba việc: flow nào là "chuẩn", code nào bỏ/gộp, design step nhắm vào đâu.
- **Pha 1 đã chốt gì (FACT, #127)**: port 1:1 trên Mock, Runtime Vite, không i18n/không dark mode/không slice `home` (README § "Ba khác biệt có chủ ý"), không nối BE, "Sửa bug nghiệp vụ của prototype" nằm ở **Out of Scope** — nên mọi lỗ hổng nghiệp vụ dưới đây là *di sản có chủ ý*, không phải lỗi của ticket nào.
- **Gate lúc kiểm tra**: `bun run --filter @monorepo/smart-rental typecheck` → exit 0; `… test` → `Test Files 38 passed (38) · Tests 158 passed (158) · Duration 35.81s` (§B.7). Không sửa gì.
- **Boot & chụp**: `bun run dev` từ `apps/smart-rental` (port 3006 trống), Playwright `chromium` chạy bằng `node` (không `bun run`), seed `localStorage.auth` đúng shape `e2e/support/auth-session.ts:8-16`, chụp 36 route × 2 viewport + 10 list page ở Building scope `b1` + 3 màn guest không token = **85 ảnh**. Lưu ý kỹ thuật: shell dùng `SidebarInset className="overflow-hidden"` + cột nội dung tự cuộn (`layout.template.tsx:21-27`) nên `fullPage` chỉ chụp được viewport — ảnh dài hơn 900 px bị cắt, nhận xét "dưới fold" dựa trên phần thấy được.
- **Giới hạn**: prototype gốc `D:\Personal\smart-rental\frontend` không đọc lại (spec nói port 1:1; note so app với *chuẩn*, không so với prototype). Bốn ảnh chứng từ `/images/meter-*.jpg` không tồn tại (README đã ghi) nên màn chi tiết Chỉ số hiện alt text — không tính là defect mới.

---

## Phần A — Flow nghiệp vụ: app đang làm gì, chuẩn nói gì, delta

### A.0 Nguồn chuẩn (pháp lý, biểu giá, chuẩn thanh toán) — tóm tắt từ primary sources

Tra bởi một agent phụ trên primary sources; quy ước: **[✓]** mở được bản gốc/bản toàn văn và trích; **[chưa xác minh]** chỉ có nguồn thứ cấp hoặc bản gốc không mở được (`thuvienphapluat.vn` trả 403 toàn bộ; thay bằng `hethongphapluat.com`, `vanban.chinhphu.vn`, `luatvietnam.vn`, trang cơ quan nhà nước). Trích dẫn từ `hethongphapluat.com` đôi chỗ là near-verbatim.

**A.0.1 Hợp đồng thuê nhà ở**

| Nguồn | Điều | Nội dung (trích) |
| --- | --- | --- |
| Bộ luật Dân sự 91/2015/QH13 [✓] `hethongphapluat.com/bo-luat-dan-su-2015/dieu-328` (đổi số điều) | Đ.328 k.2 | *"…tài sản đặt cọc được trả lại cho bên đặt cọc hoặc được trừ để thực hiện nghĩa vụ trả tiền; nếu bên đặt cọc từ chối… thì tài sản đặt cọc thuộc về bên nhận đặt cọc; nếu bên nhận đặt cọc từ chối… thì phải trả cho bên đặt cọc tài sản đặt cọc và một khoản tiền tương đương…, trừ trường hợp có thỏa thuận khác."* |
| | Đ.472 | Hợp đồng thuê tài sản; thuê nhà ở theo BLDS + Luật Nhà ở. BLDS 2015 **không** còn tiểu mục "thuê nhà ở" riêng |
| | Đ.477, 479, 481, 482 | Bên cho thuê sửa hư hỏng *"trừ những sửa chữa nhỏ theo tập quán"*; bên thuê *"bảo dưỡng và sửa chữa nhỏ; nếu làm mất, hư hỏng thì phải bồi thường"*; trả tiền đúng kỳ — không trả **ba kỳ liên tiếp** → bên cho thuê được đơn phương chấm dứt; trả lại tài sản đúng hạn, đúng tình trạng |
| Luật Nhà ở 27/2023/QH15 [✓] `hethongphapluat.com/luat-nha-o-2023/dieu-163…172`; gốc `vanban.chinhphu.vn/?pageid=27160&docid=209627` | Đ.163 | *"Hợp đồng về nhà ở do các bên thỏa thuận và phải được lập thành văn bản"* với **11 nội dung**: (1) họ tên/địa chỉ các bên; (2) mô tả nhà ở; (3) giá; (4) thời hạn và phương thức thanh toán; (5) thời gian giao nhận… **thời hạn cho thuê**; (6) quyền và nghĩa vụ; (7) cam kết; (8) thỏa thuận khác; (9) thời điểm hiệu lực; (10) ngày ký; (11) chữ ký |
| | Đ.164 k.2 | Thuê nhà ở *"không phải thực hiện công chứng, chứng thực hợp đồng, trừ trường hợp các bên có nhu cầu"*; hiệu lực theo thỏa thuận, mặc định = **thời điểm ký** |
| | Đ.170 | Thỏa thuận thời hạn, giá, trả định kỳ/một lần; cho thuê lại *"nếu được bên cho thuê đồng ý"* |
| | Đ.171 k.2 a | Hợp đồng **không xác định thời hạn** chấm dứt sau **90 ngày** kể từ khi bên cho thuê thông báo |
| | Đ.172 k.2 b–e, k.3, k.4 | Bên cho thuê đơn phương chấm dứt khi bên thuê *"không trả đủ tiền thuê… từ 03 tháng trở lên mà không có lý do đã được thỏa thuận"*, dùng sai mục đích, tự ý cải tạo, cho thuê lại không đồng ý, mất trật tự bị lập biên bản lần 3; bên thuê chấm dứt khi bên cho thuê không sửa hư hỏng nặng, *"tăng giá thuê bất hợp lý hoặc không thông báo trước"*; **báo trước ít nhất 30 ngày** bằng văn bản hoặc hình thức đã thỏa thuận |
| Luật KDBĐS 29/2023/QH15 Đ.9, Đ.44 k.7; NĐ 96/2024/NĐ-CP Đ.7, Đ.12 k.3 + Phụ lục II [✓] `xaydungchinhsach.chinhphu.vn/…nghi-dinh-96-2024…` | | Hợp đồng mẫu (Phụ lục II = hợp đồng thuê nhà ở, 12 Điều) **chỉ bắt buộc với doanh nghiệp** KDBĐS; cá nhân cho thuê quy mô nhỏ (≤ 300 tỷ/hợp đồng, ≤ 10 giao dịch/năm) không phải lập DN, không bị buộc dùng mẫu, vẫn kê khai thuế |

**A.0.2 Giá điện sinh hoạt và giá điện thu của người thuê**

| Nguồn | Nội dung |
| --- | --- |
| **Quyết định 1279/QĐ-BCT** ngày 09/5/2025, hiệu lực 10/5/2025 [✓ qua `quangninh.gov.vn/So/socongthuong/…nid=4815`; trang biểu giá `evn.com.vn` không render bảng] | Giá bán lẻ bình quân 2 204,0655 đ/kWh. Sinh hoạt **6 bậc**, chưa VAT: **B1 0–50: 1 984 · B2 51–100: 2 050 · B3 101–200: 2 380 · B4 201–300: 2 998 · B5 301–400: 3 350 · B6 401+: 3 460**; công tơ thẻ trả trước 2 909. Vẫn áp dụng đến 6/2026 theo `cafef.vn`/`luatvietnam.vn` — [chưa xác minh sau 6/2026] |
| **Quyết định 14/2025/QĐ-TTg** ngày 29/5/2025 `chinhphu.vn/?pageid=27160&docid=213782` [chưa mở toàn văn] | Cơ cấu lại thành **5 bậc** (0–100, 101–200, 201–400, 401–700, 701+); giá tiền cụ thể chờ quyết định giá lần điều chỉnh tiếp theo của BCT (QĐ 963/QĐ-BCT 22/4/2026 chỉ về khung giờ, không phải bậc thang) |
| **Thông tư 60/2025/TT-BCT** ngày 02/12/2025 (thay TT 16/2014, 25/2018, 06/2021, 09/2023) [✓ metadata `vanban.chinhphu.vn/?pageid=27160&docid=216125`, PDF `datafiles.chinhphu.vn/cpp/files/vbpq/2025/12/60-bct.pdf`; toàn văn text `luatvietnam.vn/…thong-tu-60-2025-tt-bct…420378-d1.html`] | Đ.12 k.5: thuê **≥ 12 tháng** và có đăng ký cư trú → chủ nhà ký/ủy quyền người thuê ký hợp đồng mua điện. Thuê **< 12 tháng**: *"Nếu chủ nhà không kê khai đầy đủ số người sử dụng điện thì áp dụng giá bán lẻ điện sinh hoạt bậc 2: Từ 101 - 200 kWh cho toàn bộ sản lượng"*; kê khai đủ thì *"cứ 04 (bốn) người được tính là một hộ"* (1 người = ¼, 2 = ½, 3 = ¾ định mức), số người *"theo thông tin về cư trú tại địa điểm sử dụng điện"*; tổng tiền điện thu của người thuê *"không được vượt quá tiền điện trong hoá đơn tiền điện hằng tháng"*. Điều khoản chuyển tiếp: tới lần điều chỉnh giá tiếp theo vẫn áp nội dung TT 16/2014 (bậc 3 cũ, cùng dải 101–200 kWh) |
| **Nghị định 133/2026/NĐ-CP** ngày 06/4/2026, hiệu lực 25/5/2026 (thay NĐ 134/2013 + 17/2022) [✓ metadata `hue.gov.vn/…/vb/56646`; `baochinhphu.vn/thu-tien-dien-nha-tro-vuot-gia-quy-dinh-…102260514221051825.htm`] | *"thu tiền điện của người thuê nhà cao hơn mức quy định"* → phạt **20–30 triệu đồng**, *"buộc hoàn trả toàn bộ số tiền thu vượt cho người thuê nhà"* (vị trí k.7 Đ.13 — theo nguồn thứ cấp, [chưa đối chiếu PDF gốc]) |

**A.0.3 Giá nước — theo tỉnh, theo năm**

| Nguồn | Nội dung |
| --- | --- |
| TP.HCM: QĐ 25/2019/QĐ-UBND + 17/2021/QĐ-UBND; bảng 2026 của SAWACO [✓ `benthanh.sawaco.com.vn/…don-gia-nuoc-sach…tu-ngay-01012026…`]; định mức theo VNeID [✓ `sawaco.com.vn/post-detail/tphcm-cap-dinh-muc-nuoc-sinh-hoat-can-cu-tren-vneid-231107111500`] | Định mức **4 m³/người/tháng**, số người theo cư trú VNeID/Cổng DVC. Bậc (đ/m³, chưa thuế): ≤ 4 m³/người **6 700**; 4–6 **12 900**; > 6 **14 400**; hộ nghèo 6 300. Hoá đơn = nước (VAT 5 %) + dịch vụ thoát nước 30 % (VAT 8 %) → tổng 9 206 / 17 725 / 19 786 đ/m³. Quyết định thay 25/2019 dự kiến 2026 — [chưa xác minh] |
| Hà Nội: QĐ 3541/QĐ-UBND ngày 07/7/2023 [✓ `luatvietnam.vn/…quyet-dinh-3541-qd-ubnd-ha-noi-2023…258734-d2.html`] | Theo **hộ**: 10 m³ đầu 8 500; 10–20 m³ 9 900; 20–30 m³ 16 000; > 30 m³ 27 000 đ/m³ (chưa VAT, phí BVMT); hộ nghèo 5 973. Chưa thấy quyết định mới hơn — [chưa xác minh] |
| Cách chủ trọ tính nước cho người thuê | **Không có quy định riêng**. Cơ sở phạt chung: NĐ 87/2024/NĐ-CP Đ.10 [✓ `hethongphapluat.com/nghi-dinh-87-2024-nd-cp…/dieu-10`] bán *"vượt giá tối đa do Nhà nước ban hành"* 10–20 triệu, *"buộc trả lại"* chênh lệch; áp cho chủ trọ là diễn giải báo chí — [chưa xác minh] |

**A.0.4 Lưu trú / tạm trú và PCCC**

| Nguồn | Nội dung |
| --- | --- |
| **Luật Cư trú 68/2020/QH14** Đ.27, Đ.30 [✓ `hethongphapluat.com/luat-cu-tru-2020/dieu-30`; PDF `datafiles.chinhphu.vn/cpp/files/vbpq/2021/02/68.signed.pdf` chưa đọc] | Đ.27 k.1: đến sinh sống ngoài xã nơi thường trú *"từ 30 ngày trở lên thì phải thực hiện đăng ký tạm trú"* (**người thuê** làm); k.2: tối đa 2 năm, gia hạn nhiều lần. Đ.30: thành viên hộ/người đại diện cơ sở lưu trú *"có trách nhiệm thông báo việc lưu trú"* (**chủ nhà** làm) — trực tiếp/điện thoại/điện tử; nội dung: họ tên, số định danh/CCCD/hộ chiếu, lý do, thời gian, địa chỉ; hạn *"trước 23 giờ của ngày bắt đầu lưu trú"*, đến sau 23 giờ thì *"trước 08 giờ ngày hôm sau"*; người thân đến nhiều lần chỉ báo một lần |
| **Luật 118/2025/QH15** (sửa 10 luật ANTT, hiệu lực **01/7/2026**) k.9 Đ.4 sửa Đ.30 [✓ `xaydungchinhsach.chinhphu.vn/luat-so-118-2025-qh15…119251229111316641.htm`] | *"Khi có người lưu trú qua đêm, thành viên hộ gia đình, người đại diện… cơ sở lưu trú… chủ sở hữu hoặc người được giao quản lý… có trách nhiệm thông báo lưu trú"*; thêm ngày sinh; thông báo qua VNeID |
| **NĐ 154/2024/NĐ-CP** ngày 26/11/2024, hiệu lực 10/01/2025, thay NĐ 62/2021 [✓ metadata `vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=172423`]; **TT 66/2023/TT-BCA** (mẫu CT01/CT02, hiệu lực 01/01/2024) [✓ tóm tắt] | Mẫu **CT01** = tờ khai thay đổi thông tin cư trú (đăng ký/gia hạn tạm trú, khai báo thông tin cư trú); CT02 cho công dân ở nước ngoài; đồng ý của chủ sở hữu chỗ ở = chữ ký trên CT01 **hoặc** qua VNeID/DVC trực tuyến; cổng `dichvucong.dancuquocgia.gov.vn`, app VNeID |
| **NĐ 282/2025/NĐ-CP** ngày 30/10/2025, hiệu lực 15/12/2025, thay NĐ 144/2021 — Đ.10 [✓ `tragiang.quangngai.gov.vn/…sau-ngay-15-12-2025-.html`] | k.1: cảnh cáo hoặc **500 000–1 000 000 đ** khi *"Không thực hiện đúng quy định… về thông báo lưu trú, khai báo tạm vắng"* / đăng ký tạm trú; cơ sở kinh doanh lưu trú, nhà ở tập thể không thông báo lưu trú: 1–3 người **2–4 triệu**, 4–8 người **4–8 triệu**, ≥ 9 người **8–12 triệu**; tổ chức gấp đôi (số khoản: [chưa xác minh]) |
| **Luật PCCC và CNCH 55/2024/QH15** (hiệu lực 01/7/2025) Đ.20–21; **NĐ 105/2025/NĐ-CP** [✓ `hethongphapluat.com/luat-phong-chay-chua-chay-va-cuu-nan-cuu-ho-2024/dieu-21`; `vanban.chinhphu.vn/?pageid=27160&docid=213702`] | Nhà ở kết hợp sản xuất, kinh doanh phải đủ điều kiện Đ.20, có biển cấm/báo/chỉ dẫn, *ngăn cách hoặc ngăn cháy giữa khu vực kinh doanh và khu vực để ở*; NĐ 105/2025 Phụ lục I liệt kê cơ sở thuộc diện quản lý, Đ.4 hồ sơ. Ngưỡng số phòng/diện tích riêng cho nhà trọ: [chưa xác minh trên nguồn chính thức] |

**A.0.5 VietQR / NAPAS**

| Nguồn | Nội dung |
| --- | --- |
| NAPAS [✓ `napas.com.vn/dich-vu-chuyen-tien-nhanh-napas-247`] | Dịch vụ *"tuân thủ tiêu chuẩn thanh toán QR của EMV Co. và bộ Tiêu chuẩn cơ sở cho mã QR do NHNN ban hành"*; hạn mức mỗi giao dịch *"dưới 500 triệu đồng"*. Tên chuẩn: **TCCS 03:2018/NHNNVN** công bố bởi QĐ 1928/QĐ-NHNN 05/10/2018 — [chưa xác minh trên `sbv.gov.vn`] |
| VietQR Quick Link [✓ `vietqr.io/en/danh-sach-api/link-tao-ma-nhanh/`] | `https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>`; `BANK_ID` = *"Mã BIN ngân hàng"* 6 số hoặc tên viết tắt (vd `970415`/`ICB`/`Vietinbank`); template `compact2` 540×640 (QR + logo + thông tin CK), `compact` 540×540, `qr_only` 480×480, `print` 600×776; `amount` *"số dương và tối đa 13 chữ số"*; `addInfo` *"tối đa 50 chữ cái, không bao gồm các kí tự đặc biệt"*. Không cần key |
| VietQR API [✓ `vietqr.io/en/danh-sach-api/link-tao-ma-nhanh/api-tao-ma-qr/`] | `POST https://api.vietqr.io/v2/generate`, header `x-client-id`, `x-api-key`; body `accountNo` (6–19 số), `acqId` (BIN 6 số), `accountName` (5–50 ký tự **không dấu, in hoa**), `amount` (int ≤ 13 ký tự), `addInfo` (**≤ 25** ký tự không dấu), `template`, `format`; trả `data.qrCode` (chuỗi EMV) + `data.qrDataURL` |
| Payload EMVCo MPM mẫu [✓ `vietqr.io/en/generate/`] | `000201 010212 38560010A000000727 0126 0006970415 0112113366668888 0208QRIBFTTA 5303704 5405790005 802VN 62220818Ung Ho Quy Vac Xin 63043ACF` — ID 38 = GUID `A000000727` + BIN + số TK + service `QRIBFTTA`; 53 = `704` (VND); 54 = số tiền; 58 = `VN`; 62 = nội dung; 63 = CRC |

**A.0.6 VND không có đơn vị lẻ**

- ISO 4217 List One (SIX, cơ quan bảo trì) [✓ `six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml`]: `Ccy="VND"`, `CcyNbr="704"`, **`CcyMnrUnts="0"`** → mọi số tiền là **số nguyên đồng**.
- NĐ 123/2020/NĐ-CP Đ.10 k.13 [✓]: *"Đồng tiền ghi trên hóa đơn là Đồng Việt Nam, ký hiệu quốc gia là 'đ'"*; chữ số Ả-rập, dấu chấm hàng nghìn/phẩy thập phân hoặc ngược lại; không có quy tắc làm tròn chung. Luật Kế toán 88/2015 Đ.10 [✓]: ký hiệu "đ"/"VND", làm tròn khi lập BCTC. Điều luật đích danh "hoá đơn làm tròn đến đồng": [chưa xác minh] — thực hành dựa trên minor unit = 0.

**Hệ quả gộp cho một Portal (FACT, không phải design):** (1) Hợp đồng phải là văn bản có 11 mục, có `thời hạn`, `giá`, `phương thức thanh toán`, `ngày ký`, `hiệu lực`; cọc có 3 lối ra (trả lại / trừ nợ / mất); mốc **3 tháng nợ → chấm dứt**, **báo trước 30 ngày**, **90 ngày** cho hợp đồng không thời hạn. (2) Giá điện là bậc thang toàn quốc **6 bậc 1 984–3 460 đ** (sắp 5 bậc); với người thuê < 12 tháng chủ nhà thu **một giá 2 380 đ/kWh (bậc 101–200)** nếu không kê khai, hoặc theo định mức **4 người = 1 hộ**; **tổng thu ≤ hoá đơn EVN**; thu vượt phạt **20–30 triệu + hoàn trả**. (3) Nước theo tỉnh và năm, TP.HCM theo m³/người (4 m³ định mức), Hà Nội theo hộ; hai thuế suất trên một hoá đơn. (4) Hai nghĩa vụ tách biệt: **thông báo lưu trú** (chủ nhà, mỗi người ở qua đêm, trước 23:00) và **đăng ký tạm trú** (người thuê, ≥ 30 ngày, ≤ 2 năm); từ 01/7/2026 chủ cơ sở lưu trú là chủ thể có tên; kênh VNeID/`dichvucong.dancuquocgia.gov.vn`; phạt cơ sở theo thang 1–3 / 4–8 / ≥ 9 người. (5) Một VietQR cần **BIN + số TK + số tiền nguyên ≤ 13 chữ số + addInfo ≤ 25/50 ký tự không dấu**, sinh được ngay ở FE bằng Quick Link. (6) VND minor unit 0.

### A.1 Hợp đồng — tạo → Gia hạn → Thanh lý

**FACT — app hiện tại**

| Việc | Code | Ghi chú |
| --- | --- | --- |
| Vòng đời | `contract-lifecycle.ts:6` `["pending","active","ending","ended"]`; stepper `contract-detail.template.tsx:250-252` | `ending` là *trạng thái lưu trong Mock* (`contracts.ts:25-32`), không suy từ `endDate`; `contract-expiry.ts:12-25` tính "sắp hết hạn" riêng → hai nguồn sự thật cho một khái niệm |
| Tạo | wizard 4 bước `contract-create.template.tsx:42-53`; schema `contract-form.ts:11-32`: `buildingId, roomId, tenantName, tenantPhone, tenantIdCard, startDate, termMonths, rentAmount, depositAmount` | Người thuê được **gõ tên** vào Hợp đồng, không chọn từ `mockTenants` → tạo xong không có `Tenant` nào sinh ra, Phòng không đổi `status`/`tenant` (`contract.ts:71-96` chỉ `unshift` vào `mockContracts`) |
| Gia hạn | `renew-contract-form.ts:5-12` `newEndDate, newRentAmount, notes`; mutation `contract.ts:113-129` ghi đè `endDate`, `rentAmount`, **`status: "active"`** | Không lưu lịch sử gia hạn, `notes` bị bỏ (`:120-124` không ghi); Gia hạn một Hợp đồng `ended` vẫn được (UI chỉ ẩn link khi `isEnded`, `contract-detail.template.tsx:291`, còn route `/contracts/:id/renew` mở thẳng) |
| Thanh lý | 3 bước `contract-liquidation.template.tsx:82-98`; checklist 4 ô `liquidation-form.ts:4-25`; mutation `contract.ts:131-143` chỉ `status: "ended"` | Tiền quyết toán là hằng số `OUTSTANDING_FEES = 500000`, `PENALTY_AMOUNT = 300000` (`:101-102`), dòng "Tiền nước tháng 03 / Tiền điện tháng 04" là literal (`:193-200`); **không có gì ghi lại** số cọc hoàn/giữ; Phòng không về `available` |
| Thời hạn | "12 tháng" và "Hợp đồng dài hạn" là literal (`contract-detail.template.tsx:184, 198, 209`; `tenant-detail.template.tsx:227`) dù `termMonths` có trong request | |
| Xoá | `useDeleteContract` splice Mock (`contract.ts:145-157`), nút "Xóa" ở header chi tiết `:72-81` | Glossary: *"không có huỷ Hợp đồng"* (`CONTEXT.md` § Gia hạn/Thanh lý) — nút Xóa mâu thuẫn glossary |
| Dữ liệu | mọi Hợp đồng Mock `startDate 01/01/2024, endDate 01/01/2025` (`contracts.ts:23-24`) mà 26/30 vẫn `active` | với `now = 2026-09-17`, `getContractExpiryMeta` trả `daysUntilEnd` âm → không cảnh báo, stepper vẫn "Đang hoạt động" |

**Backend target (FACT, `D:\Personal\smart-rental\backend\document\fe-api-integration\contract-service.md`)**: `POST /api/v1/contracts` tạo ở trạng thái `DRAFT` (`:10`); bảng `contracts` có `status` ∈ `DRAFT, ACTIVE, EXPIRING, EXPIRED, TERMINATED` (`:61`) và `deposit_status` ∈ `HELD, RETURNED, FORFEITED, PARTIAL_RETURNED` (`:58`); có module riêng "Termination wizard" (`:18`), "Asset handover" (`:27`), "Contract templates" (`:35`), bảng `contract_services`, `asset_handovers`, `termination_wizard_state` (`:70-112`).

**DELTA (so §A.0 + contract target)**

- App không có khái niệm **cọc như một trạng thái** (giữ/hoàn/giữ một phần) — chỉ có `depositAmount`; Thanh lý tính "hoàn lại" trên màn (`liquidation-summary-card.tsx:22-28`) rồi **vứt**.
- Không có **bàn giao tài sản** thật: `asset-checklist.tsx:20-49` là 4 món cứng, tick lưu `useState` cục bộ, hai nút không handler (`:113-118`).
- Không có **thời hạn báo trước / chấm dứt sớm / phạt** như một quy tắc — chỉ có hằng số phạt 300 000 đ; luật có ba mốc số cụ thể (Luật Nhà ở Đ.171–172, §A.0.1): **báo trước ≥ 30 ngày**, **90 ngày** cho hợp đồng không thời hạn, **nợ ≥ 3 tháng** (BLDS Đ.481: 3 kỳ liên tiếp) → quyền chấm dứt — app không có trường nào để ghi "đã thông báo ngày…" hay đếm số kỳ nợ.
- Không có **mẫu Hợp đồng / in / PDF** (nút "Tải PDF", "In hợp đồng" không handler — §B.2), trong khi Luật Nhà ở Đ.163 đòi **văn bản với 11 mục** (§A.0.1); `CreateContractRequest` chỉ có 9 trường, thiếu "phương thức thanh toán", "ngày ký", "hiệu lực", "cam kết/thoả thuận khác" và không lưu địa chỉ hai bên. Không cần công chứng (Đ.164 k.2) và cá nhân cho thuê quy mô nhỏ không bị buộc dùng mẫu NĐ 96/2024 — nên "mẫu Hợp đồng" là tiện ích, không phải nghĩa vụ pháp lý.
- Cọc theo BLDS Đ.328 có **ba lối ra** (trả lại / trừ vào nợ / mất) — đúng là `deposit_status HELD/RETURNED/FORFEITED/PARTIAL_RETURNED` của BE target; app chỉ có một số `depositAmount`.
- Enum `ending` (FE) ≠ `EXPIRING` (BE) — cùng nghĩa, khác tên; `pending` (FE) ≠ `DRAFT` (BE); FE thiếu `TERMINATED` (Thanh lý và hết hạn tự nhiên cùng rơi vào `ended`).

### A.2 Hoá đơn — Đợt hoá đơn → Hoá đơn → VietQR → quá hạn → Việc cần làm

**FACT — app hiện tại**

- `Invoice` (`types/invoice.ts:4-20`): `invoiceNumber, tenant (tên), room (tên), floor, amount, month "MM/YYYY", dueDate "DD/MM/YYYY", status, paymentDate | null, lastUpdated, buildingId?` — **không có** `contractId`, `roomId`, line items, `paidAmount`, kỳ dạng máy đọc được.
- Trạng thái `paid | pending | overdue | cancelled` (`:2`). `overdue` là **lưu sẵn trong Mock** (`invoices.ts:21-28`), không suy từ `dueDate < now`; Mock còn tạo Hoá đơn `overdue` **có** `paymentDate` (`i % 5 === 0 && i % 3 !== 0`, `:29`) — README #139 đã ghi nhận.
- Chi tiết: `invoice-detail.template.tsx:148-161` vẽ "Tiền thuê phòng = amount, Phí dịch vụ 0 đ, Các khoản khác 0 đ, Tổng = amount" — breakdown giả. Hai nút xác nhận thanh toán (`:173-181`, `:210-218`) không handler; "Xóa" chỉ `navigate` (`:288`), không mutation.
- Đợt hoá đơn: `batch-invoice.template.tsx:45-72` đọc `mockBatchInvoiceItems` (3 phòng "101/102/103" — `invoices.ts:36-64`) **không liên quan** `mockRooms`/`mockUtilities`; tổng = `rent + electricity + water + service` (`invoice-calculations.ts:3-9`); submit là `// TODO` (`:70-72`). Kỳ mặc định `dayjs().format("YYYY-MM")` (`:51`) nhưng Mock Hoá đơn lưu `"04/2026"` (`MM/YYYY`).
- VietQR: `vietqr-dialog.tsx:21-26` là lưới 25 ô bật/tắt theo `(i*7)%10>3`; nội dung chuyển khoản `Thanh toan {invoiceNumber}` (`:78-80`); không có ngân hàng/BIN/số tài khoản/tên người nhận; "Chia sẻ", "Lưu ảnh QR" không handler (`:87-94`).
- Tính tiền: `invoice-calculations.ts` chỉ cộng 4 số nguyên; **không** VAT, **không** bậc thang, **không** làm tròn; `formatCurrency` là `Intl vi-VN, maximumFractionDigits 0` (`utils/currency.ts:2-6`) — làm tròn xảy ra ở *hiển thị*, không ở *tính*. Test `invoice-calculations.test.ts` chỉ cover cộng và 4 KPI (`buildInvoiceSummaryStats`, `:20-41`).
- Việc cần làm: `mockTasks` là Mock riêng (`tasks.ts:8-105`), không sinh từ Hoá đơn quá hạn; `relatedId "inv-001"` (`:17, :53, :89`) không khớp `I001` → 3 việc "Hóa đơn quá hạn" bấm "Xem chi tiết" ra "Không tìm thấy hóa đơn"; `dueDate` 2024 → mọi việc hiện "Quá hạn 8xx ngày" (ảnh `desktop__tasks.png`).

**Backend target (FACT)**: `billing-service.md:60` `invoices.status` ∈ `DRAFT, UNPAID, PARTIAL, PAID, OVERDUE, CANCELLED`, `overdue_days` generated (`:61`); bảng `utility_readings`, `invoice_line_items`, `invoice_payments` (`:68-101`); `payment-service.md:15-23` `payment_requests` với `qr image URL, raw QR data, link thanh toán, trạng thái, hạn dùng`, status `PENDING, PAID, EXPIRED, CANCELLED` (`:63`), polling `/api/v1/payment-requests/{id}/status` (`:23`), webhook đối soát do `reconciliation-worker` (`:3`).

**DELTA (so §A.0 mục VietQR + VND)**

- Một mã VietQR thật cần **BIN 6 số + số tài khoản 6–19 số + số tiền nguyên ≤ 13 chữ số + `addInfo` ≤ 25 ký tự (API) / ≤ 50 (Quick Link), không dấu, không ký tự đặc biệt** (§A.0.5); Quick Link `img.vietqr.io/image/<BIN>-<STK>-compact2.png?amount=…&addInfo=…&accountName=…` sinh ảnh **không cần key** — tức FE có thể thay lưới giả bằng `<img>` ngay khi có tài khoản. App không lưu tài khoản ngân hàng của chủ nhà ở đâu (Cài đặt nhóm `billing` là read-only text — `settings.ts`), nên **không có dữ liệu để sinh QR**; nội dung hiện tại `Thanh toan HÓA-001` có dấu tiếng Việt (`Ó`) → không hợp lệ cho `addInfo`.
- VND `CcyMnrUnts="0"` (§A.0.6): mô hình `amount: number` nguyên là đúng; nhưng nếu tính từ bậc thang × kWh × VAT thì phải **làm tròn về đồng ở bước tính** — `invoice-calculations.ts` không có bước này và `formatCurrency` chỉ làm tròn khi hiển thị, nên tổng hiển thị có thể ≠ tổng cộng các dòng.
- Thiếu `PARTIAL` (thanh toán một phần) — thực tế thu tiền trọ hay lệch; thiếu `paidAmount`/`invoice_payments`.
- Kỳ hoá đơn không có kiểu máy đọc (`MM/YYYY` string) → không lọc theo kỳ, không so kỳ trước.
- "Quá hạn" phải là **suy ra** từ `dueDate` và `status != PAID` (BE: `overdue_days` generated) — app lưu cứng nên KPI "Quá hạn" và Việc cần làm không bao giờ tự cập nhật.

### A.3 Chỉ số điện nước → Giá điện bậc thang → Hoá đơn

**FACT — app hiện tại**

- Bản ghi `Utility` (`types/utility.ts:9-24`): `roomId "room-001"` (`utilities.ts:14`) — id **không tồn tại** trong `mockRooms` (`R-B1-101`, `rooms.ts:14`); `month "YYYY-MM"` (2024-04, khác kỳ Hoá đơn `04/2026`); `status draft | verified | anomaly`.
- Nhập chỉ số: `meter-input.template.tsx:29-43` đọc `mockMeterInputRooms` (5 phòng "101…202" với `lastElectricity/lastWater` **không** khớp `mockUtilities`), tiêu thụ = mới − cũ trong render (`meter-input-row.tsx:53-55`, logic thuần `meter-reading.ts:15-31` có test), submit `// TODO` (`:41-43`); heading "Kỳ hóa đơn: Tháng 10/2023" là literal (`:49`); **hai** nút `type="submit"` cùng form (`:52-59`) — "Tính toán hóa đơn" và "Lưu chỉ số" làm cùng một việc (không gì cả).
- Giá: `meter-reading.ts:39-42` `utilityRate = { electricity: 3500, water: 8000 }`; `utility-detail.template.tsx:128-141` hiện "Xem trước thanh toán" = `consumption × rate`. Cùng lúc, Cài đặt lưu `mockElectricityTierConfig` (`settings.ts:215-222`): `useVat: true`, 4 bậc `0–50: 1 678 · 51–100: 1 734 · 101–200: 2 014 · 201–300: 2 536`, **không có bậc > 300**, form sửa được và lưu Mock (`electricity-tier-config.tsx`, `setting.ts:45-60`), nhưng **không file nào ngoài Cài đặt import** `useGetElectricityTierConfig` (grep: chỉ `settings.template.tsx:22` và test).
- Schema bậc thang chỉ chặn `từ > đến` trong một bậc (`electricity-tier-form.ts:43-46`), không chặn chồng/hở giữa bậc — README #141 nói chờ chủ spec.
- Nước: không có cấu hình nào; 8 000 đ/m³ phẳng.

**DELTA (so §A.0 mục EVN + Thông tư về giá điện cho người thuê + giá nước)**

- App giữ **hai mô hình giá điện mâu thuẫn** (phẳng ở màn chi tiết, bậc thang ở Cài đặt) và **không mô hình nào chảy vào Hoá đơn** (`invoice-calculations.ts` nhận `electricity` là số tiền đã tính sẵn từ Mock).
- Bốn bậc 1 678…2 536 (kết thúc ở 300 kWh) **không phải** biểu giá nào đang hiệu lực: QĐ 1279/QĐ-BCT (10/5/2025) là **6 bậc 1 984 / 2 050 / 2 380 / 2 998 / 3 350 / 3 460 đ** chưa VAT, và QĐ 14/2025/QĐ-TTg sắp đưa về **5 bậc** (§A.0.2) — nghĩa là số bậc là **dữ liệu**, không phải hằng; schema `tiers[]` mở (`electricity-tier-form.ts:50`) là đúng hướng, giá trị Mock thì sai.
- Hằng số **3 500 đ/kWh** cao hơn bậc 6 (3 460) trước VAT, và cao hơn **mức pháp định cho người thuê < 12 tháng** là **2 380 đ/kWh** (bậc 101–200 cho toàn bộ sản lượng khi không kê khai — TT 60/2025 Đ.12 k.5, §A.0.2). Theo NĐ 133/2026 (hiệu lực 25/5/2026) thu vượt giá quy định bị phạt **20–30 triệu + hoàn trả** — màn "Xem trước thanh toán" hiện tại đang hiển thị đúng hành vi bị phạt.
- Không có khái niệm **định mức theo số người đăng ký cư trú** (TT 60/2025: *"cứ 04 người được tính là một hộ"*, số người *"theo thông tin về cư trú"* — §A.0.2) và không có ràng buộc **tổng thu ≤ hoá đơn EVN của Toà nhà** (`SupplierBill.type = "electricity"` đã có `totalAmount`, chưa ai so). Không có VAT 8 %/10 % như tham số tính (chỉ `useVat` boolean chưa dùng). Nước: TP.HCM lũy tiến theo **m³/người (4 m³ định mức)**, Hà Nội theo **hộ**, và có **hai thuế suất** (5 % nước + 8 % thoát nước) trên một hoá đơn (§A.0.3) — 8 000 đ/m³ phẳng không mô tả được cả hai; giá nước thay đổi theo tỉnh và theo năm nên phải là cấu hình theo Toà nhà (Toà nhà đã có `address`).
- Không có ảnh chứng từ thật (Mock trỏ file không tồn tại) và không có bước "xác minh" (`verified`) nào chuyển trạng thái — `draft`/`anomaly`/`verified` là dữ liệu tĩnh.

### A.4 Khai báo lưu trú (`compliance`)

**FACT — app hiện tại**: `ComplianceItem` (`types/compliance.ts:2-18`) có 3 loại `residence_declaration | safety_inspection | documentation`, trạng thái `completed | pending | overdue`, `tenant`/`room` là **tên**, `dueDate` string. Mock 4 dòng (`compliance.ts:4-38`) với tên người thuê **không có** trong `mockTenants` ("Nguyễn Văn An" vs "Nguyễn Văn A"). Hook không nhận Building scope (`hooks/api/compliance.ts:16-24`). Hai nút "Tạo file CT01 (VNeID)" và "Thêm yêu cầu" không handler (`compliance-dashboard.template.tsx:38-45`). Không có trường số CCCD/ngày bắt đầu lưu trú/hình thức khai báo/mã hồ sơ; `Tenant` có `idNumber` nhưng không nối.

**Backend target (FACT)**: `tenant-service.md:32-39` module "Residence registration", `PATCH /api/v1/tenants/{id}/residence/status` với `submitted, approved, rejected, expired`; bảng `residence_registrations` status `PENDING, SUBMITTED, APPROVED, REJECTED, EXPIRED` (`:134`); có `co_residents`, `tenant_documents`, `pii_access_logs` (`:77-141`).

**DELTA (so §A.0.4)**

- Luật tách **hai nghĩa vụ với hai chủ thể và hai đồng hồ**: *thông báo lưu trú* — **chủ nhà** làm, cho **mỗi** người ở qua đêm, hạn **trước 23:00 ngày bắt đầu** (Luật Cư trú Đ.30; từ 01/7/2026 Luật 118/2025 gọi đích danh "chủ sở hữu/người quản lý cơ sở lưu trú"); *đăng ký tạm trú* — **người thuê** làm khi ở **≥ 30 ngày**, hiệu lực **≤ 2 năm**, gia hạn (Đ.27), chủ nhà chỉ **đồng ý** qua chữ ký CT01 hoặc VNeID. App gộp cả hai vào một loại `residence_declaration`, không có ngày đến ở, không có ngày hết hạn tạm trú (2 năm), không có "đã đồng ý/đã nộp/mã hồ sơ" — trong khi BE target đã có `PENDING/SUBMITTED/APPROVED/REJECTED/EXPIRED` và `co_residents`.
- "Tạo file CT01 (VNeID)" (nút chết) trỏ đúng mẫu: CT01 là tờ khai thay đổi thông tin cư trú (TT 66/2023) — nhưng để sinh được cần **họ tên, ngày sinh, số định danh, địa chỉ chỗ ở, thời gian** (Đ.30 + Luật 118/2025) — `Tenant` có `name/idNumber`, thiếu `dob` (form nhập có `dob` nhưng mutation vứt — `tenant.ts:63-83`), thiếu địa chỉ Phòng dạng địa chỉ hành chính, `ComplianceItem` không nối `tenantId`.
- Phạt là **theo đầu người** cho cơ sở lưu trú (1–3 / 4–8 / ≥ 9 người: 2–4 / 4–8 / 8–12 triệu, NĐ 282/2025) → "quá hạn" phải đếm được **số người chưa thông báo**, không phải số dòng checklist.
- "Kiểm tra an toàn" (PCCC — Luật 55/2024 Đ.20–21, NĐ 105/2025) và "tài liệu" là nghĩa vụ **của chủ nhà với Toà nhà**, không **theo Người thuê** như model hiện tại (`ComplianceItem.tenant` bắt buộc, `buildingId` không có); ngưỡng PCCC riêng cho nhà trọ [chưa xác minh].

### A.5 Đối soát / Báo cáo / Dashboard — cái nào suy được từ entity, cái nào giả

**FACT**

| Màn | Nguồn dữ liệu | Suy được từ entity có sẵn? |
| --- | --- | --- |
| Đối soát (`/reconciliation`) | `mockReconciliationItems` 7 dòng riêng (`reconciliation.ts:8-78`), `status gain/loss` lưu sẵn; 4 tổng tính từ dòng (`reconciliation-stats.ts:8-28`) | **Có thể** — glossary định nghĩa Đối soát = Hoá đơn (thu) − Hoá đơn nhà cung cấp (chi) theo hạng mục. Cần: Hoá đơn có line items theo dịch vụ (điện/nước/rác/internet) + `SupplierBill.type` (đã có: `electricity/water/trash/internet/other`) + kỳ chung. Hiện Hoá đơn không có line item nên **chưa join được** (README #140 ghi đúng) |
| Báo cáo (`/reports`) | 3 Mock riêng: `mockReportRows` (theo tháng × toà × tầng), `mockOverdueDebts`, `mockProfitLossSummary` (`reports.ts`); "Lãi dịch vụ" là hằng `SERVICE_PROFIT = 850000` (`reports-overview.template.tsx:50`); "Cảnh báo thất thoát" luôn rỗng (`:217-220`) | P&L theo toà/tầng suy được từ Hoá đơn (thu) + Hoá đơn NCC + Chi phí (chi) **khi** Hoá đơn có `roomId → floor/buildingId` và kỳ máy đọc được; công nợ quá hạn suy từ Hoá đơn `dueDate < now && status != paid`; tỷ lệ lấp đầy suy từ `Room.status`. Hiện **không** cái nào được suy |
| Dashboard (`/`) | `mockDashboard` literal (`dashboard.ts:10-80`): `totalRooms 145`, `occupancy {42, 6}`, `occupancyRate 94.2`, doanh thu 12 tháng, thu/chi 6 tháng (đơn vị khác nhau: "triệu" vs số thô 4000/2400), 3 việc, 3 hoạt động; Building scope = **tổng × `mockDashboardShare[buildingId]`** (`:87-138`) | `totalRooms` suy được từ `mockRooms` (45) hoặc `mockBuildings.totalRooms` (tổng 169) — Mock dashboard nói **145**, ba số khác nhau cho một khái niệm. `occupancy` suy từ `Room.status`; doanh thu tháng từ Hoá đơn `paid` theo kỳ; chi phí từ Hoá đơn NCC + Chi phí. Trend `+12 / +2.5% / +15.3% / -4.2% / +12.3%` là literal (`dashboard.template.tsx:68, 75, 82, 89, 111`), "kỳ báo cáo tháng 4" literal (`:80`); `pendingTasks` là **danh sách thứ ba** của Việc cần làm (khác `mockTasks` và khác `notification-panel`) với enum ưu tiên **khác** (`urgent/high/medium` vs `high/medium/low` — `status.ts:212-216` vs `:275-282`) |

**DELTA**: glossary (`CONTEXT.md` § Đối soát, § Việc cần làm) nói cả hai là **dữ liệu suy ra, không nhập tay**. Điều kiện tối thiểu để suy: (1) Hoá đơn tham chiếu `contractId`/`roomId` bằng id, (2) Hoá đơn có line items theo dịch vụ, (3) một kiểu kỳ (`YYYY-MM`) dùng chung cho Hoá đơn, Chỉ số, Hoá đơn NCC, Báo cáo, (4) `overdue` suy từ `dueDate`. Bốn điều kiện này là §A.8.

### A.6 Building scope — slice nào tôn trọng, slice nào không

**FACT** (grep `useBuildingStore` / `buildingId` trong `apps/smart-rental/src`):

| Nhận `buildingId` ở hook (đúng khuôn "param như BE sẽ lọc") | Lọc ở template | **Không** scope |
| --- | --- | --- |
| `room.ts:31-34`, `tenant.ts:34-38`, `contract.ts:40-44`, `invoice.ts:26-30`, `utility.ts:26-30`, `supplier-bill.ts:32-38`, `expense.ts:28-34`, `reconciliation.ts:29-32`, `dashboard.ts:27` (qua `getMockDashboard`) | Toà nhà: `building-list.template.tsx:26-28` lọc trên danh sách không scope (README giải thích: selector cũng đọc list này) | `compliance.ts:21`, `task.ts:21`, `report.ts:30,40,50`, `send-log.ts:21`, `notification-template.ts:23`, `setting.ts:29,40` — và hai form đọc Mock thẳng: `batch-invoice.template.tsx:28,37` (`mockBatchInvoiceItems`), `meter-input.template.tsx:17,33` (`mockMeterInputRooms`) |

- Form tạo: Hợp đồng lấy `buildingId` mặc định từ store (`contract-create.template.tsx:70`), Người thuê stamp `buildingId` (`tenant-create.template.tsx:83`) — đúng.
- `null = mọi Toà nhà` áp đúng ở 9 hook (`!params?.buildingId ||` — cùng một điều kiện). Nhưng `Utility`/`Contract`/`Invoice`/`Tenant` khai `buildingId?` **optional** (`types/*.ts`), chỉ Mock mới gán; một bản ghi thiếu `buildingId` sẽ **biến mất** dưới mọi scope khác `null` — README #139 đã gặp đúng bug này với `utilities.ts`.
- Dashboard theo scope là **lát cắt tỷ lệ** — đổi scope thì số đổi, nhưng không phải số của Toà nhà đó (`dashboard.ts:87-138`, README #142 ghi có chủ ý).

### A.7 Auth / onboarding / backend

**FACT**

- Đăng nhập giả: `sign-in-form.tsx:32-38` set token `local-${email}` + user "Admin User"; mặc định điền `admin@gmail.com / admin@123` (`:28`); "Quên mật khẩu?" là `<button>` không handler (`:74-79`). Đăng ký: `register-form.tsx:56-59` set token rồi `navigate(ONBOARDING)`. Onboarding 3 bước không submit gì (`onboarding-wizard.template.tsx:148`, README #142). `http-client.ts:19-27` đã có `getAuthToken`/`onUnauthorized` (logout + `queryClient.clear()`).
- Backend `D:\Personal\smart-rental\backend` (chỉ đọc): Maven multi-module (`pom.xml`, `shared/`, `user-service/`, `property-service/`), controller duy nhất `user-service/.../UserProfileController.java` (`@RequestMapping(USER_PROFILES_API)`) trên `shared/.../BaseController.java` (CRUD chuẩn `POST / GET /{id} / GET /search / GET / PUT /{id} / DELETE /{id}`, `:24-56`). `document/fe-api-integration/README.md` tự ghi: *"Code hiện tại mới có `user-service` với controller `/api/v1/user-profiles`. Các file trong thư mục này mô tả target contract theo backend-design, không phải trạng thái implementation hiện tại."* Quy ước target: prefix `/api/v1`, JSON `snake_case`, list có phân trang/filter, PII (CCCD, SĐT, email, STK, URL ảnh giấy tờ) phải mask theo role.
- Thứ tự tích hợp BE đề xuất trong README đó: user → property → tenant → contract → billing → payment → notification → maintenance → report.
- Không có OpenAPI; không có endpoint auth nào ngoài user-profiles → **contract gap**: FE không thể nối gì ngoài `user-profiles` ngay cả khi muốn. Không thiết kế auth ở note này (đề bài).

### A.8 Entity model mà code ngụ ý — và mọi chỗ hai Mock cãi nhau

**Quan hệ code đang dùng (FACT)** — mũi tên = trường tham chiếu, `(tên)` = tham chiếu bằng chuỗi hiển thị:

```
Building 1─n Room            Room.buildingId? (rooms.ts:23)            id "b1" / "R-B1-101"
Building 1─n Tenant          Tenant.buildingId?, Tenant.room (tên)     id "T001"
Building 1─n Contract        Contract.buildingId?, .tenant (tên), .room (tên), .floor   id "C001", số "HĐ-001"
Building 1─n Invoice         Invoice.buildingId?, .tenant (tên), .room (tên) — KHÔNG contractId   id "I001", số "HÓA-001"
Building 1─n Utility         Utility.buildingId?, .roomId ("room-001" — không tồn tại), .roomName   id "util-001"
Building 1─n SupplierBill    .buildingId (bắt buộc), buildingName join qua hook                    id "sb1"
Building 1─n Expense         .buildingId (bắt buộc)                                                id "exp-1"
Building 1─n Reconciliation  .buildingId (bắt buộc), lineItemName (tên dịch vụ)                    id "rec-1"
Task → Invoice|Contract|Room|Tenant   relatedId ("inv-001"/"con-002" sai; "R-B1-103" đúng)         id "task-001"
ComplianceItem               tenant (tên), room (tên) — không buildingId                            id "C001" (trùng Contract)
ReportRow                    month "MM/YYYY", building (tên), floor ("Tầng 1")                      không id
Dashboard                    không tham chiếu gì; share theo buildingId                             —
Setting / ElectricityTier    toàn cục, không buildingId                                             id "S001"
NotificationTemplate/SendLog tenant (tên)                                                           id "T001" (trùng Tenant!)
```

**Bảng enum trạng thái đặt cạnh nhau (FACT, `constants/status.ts` + `types/*`)**

| Entity | FE (prototype) | BE target (`fe-api-integration/*.md`) |
| --- | --- | --- |
| Room | `available, occupied, maintenance, reserved` (`room.ts:2`) | `AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED` (`property-service.md:24,80`) — khớp |
| Tenant | `active, pending, overdue, ended` (`tenant.ts:2`) — "overdue" là trạng thái **của Hoá đơn** gắn lên người | không có status người thuê tương đương; residence: `PENDING, SUBMITTED, APPROVED, REJECTED, EXPIRED` |
| Contract | `pending, active, ending, ended` | `DRAFT, ACTIVE, EXPIRING, EXPIRED, TERMINATED` + `deposit_status HELD/RETURNED/FORFEITED/PARTIAL_RETURNED` |
| Invoice | `paid, pending, overdue, cancelled` | `DRAFT, UNPAID, PARTIAL, PAID, OVERDUE, CANCELLED` |
| Payment | — | `PENDING, PAID, EXPIRED, CANCELLED` |
| Utility | `draft, verified, anomaly` | `utility_readings` (chưa xác minh enum — file chỉ nêu bảng) |
| SupplierBill | suy từ `paymentDate` → `paid/pending` (`supplier-bill-payment.ts:7-11`) | chưa xác minh |
| Task | `open, in_progress, done` × priority `high, medium, low` (`task.ts:3-4`) | maintenance-service (chưa đọc chi tiết) |
| DashboardTask | priority `urgent, high, medium` (`dashboard.ts:13`) | — (enum thứ hai cho cùng khái niệm) |
| Compliance | `completed, pending, overdue` × type 3 | xem Tenant residence |
| Reconciliation | `gain, loss` (lưu sẵn, lẽ ra suy từ `netAmount`) | — |

**Mọi chỗ hai Mock không khớp nhau (FACT)**

1. `Utility.roomId "room-00x"` (`utilities.ts:14,27,…`) vs `Room.id "R-B1-10x"` (`rooms.ts:14`) — README #139 chỉ vá `buildingId`, không vá `roomId`.
2. `Task.relatedId "inv-001"/"con-002"/"con-006"` (`tasks.ts:17,29,77`) vs `Invoice.id "I001"`, `Contract.id "C001"` — chỉ 3 task `room` trỏ đúng (`R-B1-103/104/105`).
3. `Contract.room = "Phòng " + (101 + i%20)` cho **cả 30 Hợp đồng** (`contracts.ts:17`) → Hợp đồng `buildingId b2` (i 10–19) trỏ "Phòng 111–120" trong khi `mockRooms` của b2 là 201–210 (`rooms.ts:31`); tương tự Tenant (`tenants.ts:40`) và Invoice (`invoices.ts:16`).
4. `Tenant` 30 người "Nguyễn Văn A…" (`tenants.ts:34-37`) vs `Room.tenant` "Nguyễn Văn B/C/D…" theo i của **phòng** (`rooms.ts:21`) — tên trùng ngẫu nhiên, không phải quan hệ; `Compliance.tenant "Nguyễn Văn An"` (`compliance.ts:7`) không có trong cả hai.
5. Số Phòng: `mockRooms` 45 (`rooms.ts:11-57`), `mockBuildings.totalRooms` tổng 169 (`buildings.ts`), Dashboard `totalRooms 145` (`dashboard.ts:11`), `occupancy 42+6 = 48` (`:37`).
6. Kỳ: Hoá đơn `"04/2026"` (`invoices.ts:19`), Chỉ số `"2024-04"` (`utilities.ts:16`), Hoá đơn NCC `"2024-03"` (`supplier-bills.ts:14`), Chi phí `expenseDate "2024-04-10"` (`expenses.ts:15`), Báo cáo `"04/2026"` và `"03/2026"` (`reports.ts:7, 105`), Task `dueDate "2024-05-20"` (`tasks.ts:18`), Compliance `"15/03/2026"` (`compliance.ts:11`) — **ba năm khác nhau** trong một app "tháng này".
7. Id trùng xuyên entity: `Compliance "C001"` = `Contract "C001"`; `NotificationTemplate "T001"` = `Tenant "T001"`; `SendLog "SL001"`.
8. Báo cáo: `reports.ts:100-108` sinh 10 dòng b3 với `month = i%2 ? … : …` và `floor = Math.floor(i/5)+1` → các cặp `(04/2026, Tầng 1)` xuất hiện 3 lần → React key trùng ở `report-table.tsx:51` và `reports-overview.template.tsx:54-56` (console — §C.1).
9. Priority: `taskPriorityConfig` `high/medium/low` (`status.ts:212-216`) vs `dashboardTaskPriorityConfig` `urgent/high/medium` (`:275-282`) — cùng chữ "Cao" nhưng `high` tone `error` ở một nơi, tone `primary` ở nơi kia.

---

## Phần B — Chuẩn hoá code: bỏ gì, gộp gì, sửa gì

### B.1 Inventory `src/components/**` và `features/*/components/**`

Số consumer = số file `src/**` import đúng path `~/components/<group>/<file>` (grep chính xác chuỗi import; import tương đối `./x` trong cùng slice đếm riêng ở cột ghi chú).

| File | Consumer | Verdict (FACT về dùng; DRAFT về nên làm gì ở cột cuối) |
| --- | --- | --- |
| `badge/status-badge.tsx` | 24 | **Giữ** — đúng "một badge" của #133. Lưu ý `isCompact` chỉ bỏ icon; ba chỗ tự bọc thêm class `text-[10px] uppercase` (`contract-card.tsx:44`) |
| `card/summary-card.tsx` | 11 template | **Sửa bố cục** — `CardContent className="flex items-center gap-3"` (`:30`) không thắng `flex flex-col` của primitive (`packages/ui/src/components/card.tsx:76`) → render dọc, căn giữa (§C.1 #1). Đây là composite KPI **duy nhất** — tốt, giữ một |
| `card/info-card.tsx` (+`InfoRow`) | 11 | **Giữ**; nhưng 6 màn chi tiết dùng **cả** `InfoRow` **lẫn** `StatItem` cho cùng loại "nhãn–giá trị" (§C.2) |
| `card/stat-item.tsx` | 9 | Giữ hoặc **gộp với `InfoRow`** thành một cặp nhãn/giá trị có 2 orientation — hai composite cùng việc |
| `card/entity-list-card.tsx` | 8 (8 loại thẻ) | Giữ; vỏ chung của 8 thẻ, nhưng 8 thẻ bên trong **không chung anatomy** (§C.2) |
| `data-table/data-table.tsx` | 20 (10 template + 10 columns) | **Giữ** — trục xương của app; `facetFilterFn` export từ đây bị 10 file columns import → nên tách sang file nhỏ |
| `data-table/faceted-filter.tsx`, `pagination-bar.tsx`, `search-input.tsx`, `use-table-search-params.ts` | 1 (chỉ `data-table.tsx`) | Giữ (nội bộ composite) |
| `data-table/list-view.tsx` (`useListView`, `ListViewTabs`, `ListViewSwitch`) | 3 (rooms, invoices, utilities) | **Giữ và ép dùng** — `contract-list.template.tsx:18-43,98-108` và `tenant-list.template.tsx:29-30,77-94,159-170` **copy nguyên** hook + switch thay vì import (2 bản trùng) |
| `dialog/confirm-action-dialog.tsx` | 4 | Giữ |
| `menu/entity-action-menu.tsx` | 4 (`*-row-actions`) | Giữ; 3/4 menu có item **disabled vĩnh viễn** (Chỉnh sửa/Xóa phòng, Tải PDF, Tạo hóa đơn — §B.2) |
| `page/list-page-header.tsx` | 17 | Giữ; nhưng `contract-create` và `tenant-create` tự vẽ `<h1>` riêng (`contract-create.template.tsx:109-114`, `tenant-create.template.tsx:98-113`) — 2 bản lệch |
| `page/detail-page-shell.tsx` | 10 | Giữ; `<h1 class="sr-only">` + "Quay lại" — không có breadcrumb, không có tên entity ở vị trí h1 (§C.2) |
| `navigation/page-back-button.tsx` | 1 (shell) | Gộp vào `detail-page-shell` (một consumer) |
| `panel/empty-panel.tsx` | 15 | Giữ (trên primitive `empty`) |
| `panel/error-panel.tsx` | 13 | Giữ |
| `panel/loading-panel.tsx` | 26 | Giữ, nhưng là **một skeleton chung cho mọi màn** (lưới 6 ô tròn+2 dòng) — không khớp footprint bảng/chi tiết (rule `patterns-loading-skeletons`: skeleton phải cùng hình với nội dung) |
| `panel/query-section.tsx` | 3 (communications, reports, settings) | **Mở rộng** — 10 template list còn lại viết tay `isLoading ? … : isError ? … :` cùng một khối (§C.2) |
| `progress/occupancy-bar.tsx` | 3 | Giữ (default export — lệch quy ước named của shared composite, `quality-imports`) |
| `stepper/lifecycle-stepper.tsx` | 5 | Giữ |
| `form/text-field.tsx` | 3 (contract-create, renew, tenant-create) | Giữ; `building-form-dialog.tsx`, `sign-in-form.tsx`, `register-form.tsx`, `onboarding` viết tay `Controller+Field+Input` cùng anatomy — 4 chỗ có thể dùng nó |
| `exception/not-found.tsx`, `internal-server-error.tsx` | 1 (main.tsx) | Giữ (Template) |

Feature components — mọi file đều **đúng 1 consumer** (grep), đúng chỗ. Ba nhóm đáng gọi tên:

- **10 file `*-columns.tsx`** cùng khuôn `helper.accessor + DataTableColumnHeader` — hợp lệ, nhưng `task-columns.tsx` là "bảng không bao giờ vẽ" chỉ để lọc (`:8-13`), dấu hiệu `DataTable` đang gánh việc của một `useFilteredList`.
- **8 thẻ thực thể** (`building-card`, `contract-card`, `invoice-card`, `room-grid`, `task-card`, `tenant-card`, `template-card`, `utility-card`) trên `EntityListCard` — 8 bố cục khác nhau (§C.2).
- **`notification-panel.tsx` (317 dòng) và `search-dialog.tsx` (206 dòng)** là hai component lớn nhất slice `layout`, cả hai chạy trên **dữ liệu mẫu cục bộ** (`:79-128`, `:26-62`), palette không tìm gì thật (`onSelect={close}` `:156,:180`), quick link không điều hướng (`:64-69`).

### B.2 Placeholder, dead code, nút không handler

Đọc từ template (không phải grep máy): mỗi dòng là một control nhìn thấy được mà bấm không xảy ra gì (hoặc chỉ toast).

| Màn | Control | Code |
| --- | --- | --- |
| Đăng nhập | "Quên mật khẩu?" | `sign-in-form.tsx:74-79` |
| Phòng list | "Xuất Excel", "Thêm phòng" | `room-list.template.tsx:44-51` |
| Phòng detail | "In phòng", "Chỉnh sửa", "Xem hồ sơ khách thuê", "Xem lịch sử thanh toán", "Tạo hóa đơn", "Xem hợp đồng" | `room-detail.template.tsx:56-63, 157-164, 213-220, 229-246` |
| Phòng menu ⋯ | "Chỉnh sửa", "Xóa phòng" (disabled) | `room-row-actions.tsx:40-46` |
| Người thuê list | "Xuất Excel" | `tenant-list.template.tsx:103-106` |
| Người thuê detail | "In hồ sơ", "Chỉnh sửa", "Xem hợp đồng"×2, "Lịch sử thanh toán", "Tạo hóa đơn", "Lịch sử" | `tenant-detail.template.tsx:64-71, 173-181, 197-204, 237-263` |
| Người thuê menu ⋯ | "Tạo hóa đơn" (disabled) | `tenant-row-actions.tsx:27` |
| Người thuê create | "Quét CCCD" = `setTimeout` 2 s rồi điền hằng (`:39-44, 73-79`) | `tenant-create.template.tsx` |
| Hợp đồng list | "Xuất Excel" | `contract-list.template.tsx:52-55` |
| Hợp đồng detail | "Tải PDF", "Chỉnh sửa", "Xem hồ sơ khách", "In hợp đồng"; checklist "Thêm tài sản mới", "Ký biên bản bàn giao" | `contract-detail.template.tsx:64-71, 171-179, 282-290`; `asset-checklist.tsx:113-118` |
| Hoá đơn list | "Xuất Excel" | `invoice-list.template.tsx:53-56` |
| Hoá đơn detail | "Tải PDF"×2, "Chỉnh sửa", "Xem hồ sơ khách", "Đánh dấu đã thanh toán", "Xác nhận thanh toán", "In hóa đơn"; "Xóa" chỉ navigate | `invoice-detail.template.tsx:58-65, 137-145, 173-181, 210-218, 258-275, 288` |
| Hoá đơn menu ⋯ / VietQR | "Tải về PDF" (disabled); "Chia sẻ", "Lưu ảnh QR" | `invoice-row-actions.tsx:27`; `vietqr-dialog.tsx:87-94` |
| Đợt hoá đơn | "Xem trước tất cả"; submit `TODO` | `batch-invoice.template.tsx:81-84, 70-72` |
| Chỉ số list/detail | "Lịch sử chốt"; "Tải xuống", "Chỉnh sửa" | `utility-list.template.tsx:50-52`; `utility-detail.template.tsx:46-53` |
| Nhập chỉ số | hai `submit` cùng form, `TODO` | `meter-input.template.tsx:41-43, 52-59` |
| Hoá đơn NCC / Chi phí | "Thêm hóa đơn"; "Thêm chi phí" | `supplier-bill-list.template.tsx:40-44`; `expense-list.template.tsx:35-39` |
| Báo cáo | "Xuất báo cáo" (toast "sẽ bổ sung"); "Chọn ngày" | `reports-overview.template.tsx:82-95`; `report-filters-bar.tsx:93-96` |
| Khai báo lưu trú | "Tạo file CT01 (VNeID)", "Thêm yêu cầu" | `compliance-dashboard.template.tsx:38-45` |
| Thông báo | "Gửi ngay" = toast mô phỏng; 2 switch tự động `defaultChecked` tĩnh | `template-card.tsx:38-45`; `communications.template.tsx:241` |
| Cài đặt | "Khôi phục mặc định"; 4 nhóm read-only | `settings.template.tsx:60-63`; `setting-group.tsx` |
| Shell | "Xem tất cả thông báo"; nav-user "Nâng cấp", "Cài đặt"; ⌘K không tìm dữ liệu thật | `notification-panel.tsx:306-312`; `nav-user.tsx:89-96`; `search-dialog.tsx` |
| Onboarding | "Hoàn thành"/"Bỏ qua" đều về `/`, không lưu | `onboarding-wizard.template.tsx:148-155` |

Tổng: **~45 control** không có flow. Ngoài ra không còn template placeholder nào của scaffold #129 (mọi route đã có slice) — nhưng `/tasks`, `/reports`, `/compliance`, `/communications`, `/settings` là "màn đọc" trên Mock tĩnh không có mutation nào ngoài Giá điện bậc thang.

### B.3 Vi phạm / smell so với `.agents/rules/`

Kết quả grep + đọc (**không** tìm thấy: inline `style=`, hex thô, `key={index}`, `form.watch(`, barrel `index.ts`, `z.string().email()`, `{ message }` trong Zod, import ngược `~/components → ~/features` hay `~/hooks → ~/features`, `@/`, `react-router-dom`). Những gì **có**:

| Rule | Chỗ | FACT |
| --- | --- | --- |
| `quality-list-keys` (runtime) | `report-table.tsx:51`, `reports-overview.template.tsx:54-56,185,290` | key `${month}-${building}-${floor}` **trùng** vì Mock sinh dòng trùng (§A.8 #8) → React cảnh báo ở `/reports` (§C.1 console) |
| `quality-list-keys` (runtime) | `occupancy-donut-chart.tsx:57` | `<ChartLegendContent />` không truyền `nameKey`; primitive tính `key = nameKey ?? item.dataKey ?? "value"` (`packages/ui/src/components/chart.tsx:304-308`) → hai mục legend cùng key `"value"` → cảnh báo ở `/` (và mọi route redirect về `/`) |
| `quality-styling-tailwind` (token) | `constants/status.ts:115-123` (`statusTone` = `emerald/amber/red/blue/zinc/slate-*`), `:186-197`, `:256-273`; `iconClassName="bg-emerald-100 text-emerald-600"` ở `communications.template.tsx:108,114,120`, `compliance-dashboard.template.tsx:17-19`, `invoice-list.template.tsx:87,93,99`, `tenant-list.template.tsx:48,54,60`, `task-center.template.tsx:27,32,37`, `reconciliation.template.tsx:53,58,67-68`, `reports-overview.template.tsx:117,123,129,135`, `expense-list.template.tsx:61,67`, `supplier-bill-list.template.tsx:66`, `utility-list.template.tsx:83,89`; `notification-panel.tsx:50-74`; `tenants.ts:3-18` (14 màu avatar); `lifecycle-stepper.tsx:38,50`; `liquidation-*`, `contract-renew` (`emerald-50/200/600/900`, `blue-50/200`, `red-50/200/800/900`, `amber-*`) | `theme.css` **đã có** `--success`, `--warning`, `--info`, `--destructive` (light `:84-90`, dark `:133-139`) và `--chart-1..5` — app không dùng token nào trong số đó cho trạng thái; hệ quả: không thể đổi theme/dark mode ở pha 2 mà không sửa 20+ file, và mỗi màn tự chọn sắc độ (`emerald-50` vs `emerald-100`, `red-700` vs `red-600`) |
| `architecture-shared-components` (composite phải dùng) | `contract-list.template.tsx`, `tenant-list.template.tsx` | copy `useListView`/`ListViewSwitch` (B.1) |
| `react-effects-sync-only` | `tenant-create.template.tsx:73-79` | `setTimeout` không cleanup, `setScan`/`form.reset` sau unmount có thể chạy; `template-card.tsx:32-36` có cleanup (đúng) |
| `patterns-loading-skeletons` | `loading-panel.tsx` | một skeleton cho mọi footprint (bảng, chi tiết 3 cột, KPI) — 26 consumer |
| `patterns-self-fetching-components` | 10 template list | OR `isLoading`/`isError` **cả màn** ở template trong khi đã có `QuerySection` cho từng section (3 màn dùng) |
| `forms-schema-driven` | `meter-input.template.tsx:52-59` | hai `type="submit"` cho một form; `batch-invoice` submit rỗng |
| `quality-imports` (export style) | `occupancy-bar.tsx:10` default export trong `~/components` (bảng quy ước: shared composite = named) | nhỏ |
| `dates-dayjs-singleton` | `utility-detail.template.tsx:105,109,113`, `utility-columns.tsx:71` `toLocaleString("vi-VN")` inline; 4 kiểu ngày trong Mock (§A.8 #6) và types ghi *"Already display-formatted"* (`types/contract.ts:14`) | Mock lưu chuỗi đã format → không sort/so được, không có `formatDate` ở đường hiển thị |
| `tanstack-consume-mutation` | `invoice-detail.template.tsx:281-289` | "Xóa" không qua mutation, không toast, chỉ điều hướng — khác 3 màn chi tiết kia |
| `architecture-vertical-slices` | `types/*` 16 file ở `~/types` "shape 1:1" | đúng quyết định #127; nhưng `CreateContractRequest`, `RenewContractRequest`, `CreateTenantRequest` là *request* của BE — ứng viên `@monorepo/types` khi có service |

### B.4 Status/display config — một nơi hay nhiều nơi?

**FACT**: `~/constants/status.ts` giữ 17 config (room×2, invoice, utility×2, task×3, compliance×2, sendLog, occupancy, channel, dashboardTaskPriority, tenant, contract, supplierBill×2, reconciliation). Ngoài nó:

- `features/settings/constants/setting-categories.ts:7-31` — `settingCategoryConfig` (label/icon/description) — cùng shape, để ngoài.
- `features/layout/components/header/notification-panel.tsx:46-75` — `notificationTypeConfig` (icon/colorClass/bgClass) — cùng việc, để trong component.
- `features/rooms/templates/room-detail.template.tsx:35-39` — `statusNote` (câu phụ theo `RoomStatus`) — thuộc `roomStatusConfig` nhưng nằm ở template.
- `features/utilities/components/utility-card.tsx:25-28` — `accentByType` (gradient theo `UtilityType`) — cùng khoá với `utilityTypeConfig`.
- `constants/mock/tenants.ts:3-18` — `avatarColors`.
- `summaryTiles` với `iconClassName` riêng ở 5 template (B.3) — màu icon KPI được quyết **tại từng màn**.

Kết luận FACT: một nơi cho *badge*, nhưng **màu icon/tile/accent** phân tán 6 chỗ.

### B.5 Test — hình dạng coverage

**FACT** (`ls apps/smart-rental/test -R`, 38 file):

| Có test | Không có test (ngoài smoke `main.test.tsx`) |
| --- | --- |
| Seam route tree `pages/main.test.tsx` (30 hàng + guard); `components/data-table`; `constants/status`, `constants/mock/dashboard`; `stores/use-building-store`; `utils/{currency,date,pagination,string}`; `env`; slice **auth** (2 form), **buildings** (schema, stats), **contracts** (3 schema, expiry, lifecycle), **dashboard** (template), **expenses** (stats), **invoices** (detail template, batch schema, calculations), **layout** (search-dialog, navigation util), **onboarding** (template, schema), **reconciliation** (stats), **reports** (filters), **settings** (component, schema), **supplier-bills** (payment util), **tasks** (due), **tenants** (schema), **utilities** (meter-input template, schema, meter-reading) | **rooms** (không có test nào ngoài seam: grid theo tầng, delete), **communications**, **compliance**, `hooks/api/*` (mọi mutation Mock: create/renew/liquidate/delete — không test nào assert Mock đổi thế nào), `components/{badge,card,panel,menu,dialog,stepper}` (không cần — markup), `libs/*` |

- Test **không** "restate JSX": 4 template test assert hành vi (đổi scope thì số đổi, tab đổi, dialog mở với số tiền, validation, wizard 3 bước). Seam test assert heading + 1 chuỗi Mock mỗi route — đúng quyết định #127.
- Lỗ hổng đáng nói: **không test nào chạm hai flow mutation phức tạp nhất** (`useRenewContract` set `active` cho Hợp đồng `ended`; `useLiquidateContract` không đổi Phòng) — chính là chỗ §A.1 chỉ ra.
- E2E: 6 spec (`auth, buildings-rooms, dashboard, invoices-utilities, onboarding, shell`) — không chạy trong note này (ngoài Gate; README hướng dẫn `bunx playwright test` từ thư mục app).

### B.6 Dependencies

**FACT** (grep import theo tên package trong `src/ test/ e2e/ *.config.ts`): mọi dep **được dùng**; khác Template chỉ ở `@monorepo/i18n`, `react-i18next`, `@monorepo/types` bị bỏ và `@monorepo/hook` thêm (diff `package.json`). Hai devDeps `tailwind-scrollbar`, `tw-animate-css` không import trực tiếp nhưng `tooling/tailwind/globals.css:2,5` `@import`/`@plugin` chúng — resolve từ `node_modules` của app, cần giữ (giống Template). `@monorepo/api` chỉ dùng `createHttpClient` + `HttpError` (chưa có service). Không có dep thừa.

### B.7 Gate (chạy 2026-09-17, không sửa gì)

```
bun run --filter @monorepo/smart-rental typecheck   → @monorepo/smart-rental typecheck: Exited with code 0
bun run --filter @monorepo/smart-rental test        → Test Files  38 passed (38)
                                                       Tests  158 passed (158)
                                                       Duration  35.81s
```

`bun run check` và `build` không chạy lại (không đổi file). Biome pass theo CI của các ticket đã merge (#129–#142 closed) — chưa xác minh lại trong note này.

---

## Phần C — UI/UX: defect nhìn thấy, audit nhất quán, đầu vào cho design step

### C.1 Bảng defect từ screenshot + console (FACT)

Ảnh: `desktop__<route>.png`, `mobile__<route>.png`, `desktop_b1__<route>.png` (Building scope = b1), `desktop__guest_*.png`. Không route nào có horizontal scroll ở `documentElement` (đo `scrollWidth > clientWidth` = false ở cả 85 ảnh) — nhưng cột nội dung `overflow-auto` nên tràn ngang nằm **trong** cột, không đo được bằng cách này.

| # | Route | Viewport | Lỗi nhìn thấy | Ảnh | File khả nghi |
| --- | --- | --- | --- | --- | --- |
| 1 | mọi màn có KPI (`/`, `/tenants`, `/invoices`, `/utilities`, `/supplier-bills`, `/expenses`, `/reconciliation`, `/tasks`, `/reports`, `/compliance`, `/communications`) | cả hai | Thẻ KPI: icon **trên**, nhãn và số **căn giữa**, trend dính cạnh số — code định bố cục icon-trái/chữ-phải (`flex items-center gap-3`) nhưng primitive `CardContent` là `flex flex-col` nên không thắng; thẻ cao 130 px cho một con số | `desktop__home.png`, `desktop__tenants.png` | `summary-card.tsx:30` vs `packages/ui/src/components/card.tsx:76` |
| 2 | mọi màn KPI | 390 | 3–4 thẻ KPI **xếp dọc** chiếm ~520–700 px trước khi tới bảng/lưới; `/tenants` phải cuộn qua 4 thẻ mới thấy ô tìm kiếm | `mobile__tenants.png`, `mobile__reports.png`, `mobile__reconciliation.png` | `sm:grid-cols-2` chỉ từ 640 px; không có biến thể compact |
| 3 | `/rooms` (grid) | cả hai | Nhóm theo tầng **sau khi phân trang** (12/trang): "Tầng 3" hiện 2 phòng (111, 112), "Tầng 2" 5, "Tầng 1" 5 — người dùng đọc thành "tầng 3 có 2 phòng" | `desktop__rooms.png`, `desktop_b1__rooms.png` | `room-grid.tsx:21-33` + `data-table.tsx:232-236` (renderRows nhận trang đã cắt) |
| 4 | `/rooms` (grid) | 1440 | Header thẻ Phòng "Đã thuê" dùng `statusTone.primary` = `bg-primary/10` → **xám** trên theme neutral; chỉ "Trống" xanh; icon check tròn lặp thông tin badge; `text-[10px] uppercase` khó đọc | `desktop__rooms.png` | `room-grid.tsx:58-65`, `status.ts:122,140-144` |
| 5 | `/rooms/:id`, `/tenants/:id`, `/contracts/:id`, `/invoices/:id` | 1440 | Cùng một giá trị hiện 2–3 lần: Phòng — loại/diện tích/giá ở header **và** "Thông tin cơ bản" **và** "Chi tiết thanh toán"; Hợp đồng — ngày bắt đầu/kết thúc ở header, "Thời gian hợp đồng", khách/phòng ở "Thông tin khách thuê" **và** cột "Trạng thái"; tiền thuê/cọc ở "Điều khoản" **và** "Thông tin tài chính" | `desktop__rooms_R-B1-101.png`, `desktop__contracts_C001.png` | các `*-detail.template.tsx` |
| 6 | `/contracts/C001` | 1440 | Badge "Đã hết hạn" nhưng stepper "Vòng đời" tick xanh 3 bước (Chờ xử lý → Đang hoạt động → Sắp hết hạn) — ngôn ngữ "hoàn thành" cho một Hợp đồng đã hết; cột phải có 4 card nhỏ ("Trạng thái", "Vòng đời", "Thông tin tài chính", "Hành động") lặp cột trái | `desktop__contracts_C001.png` | `contract-lifecycle.ts`, `contract-detail.template.tsx:221-321` |
| 7 | `/contracts/:id/renew` | 1440 | Cột phải (1/3 màn) **trống hoàn toàn** cho tới khi bấm "Tiếp tục" (confirm card mới mount) | `desktop__contracts_C001_renew.png` | `contract-renew.template.tsx:116-212` |
| 8 | `/tasks` | cả hai | Mọi việc "Quá hạn 808–850 ngày" (Mock 2024); thẻ có **3 badge** (ưu tiên + loại + trạng thái) cùng hình — badge "Hóa đơn quá hạn" (loại) và tiêu đề "Hóa đơn quá hạn - Phòng 101" lặp | `desktop__tasks.png` | `task-card.tsx:48-59`, `tasks.ts` |
| 9 | `/invoices/:id` | 1440 | "Chi tiết hóa đơn": Phí dịch vụ **0 đ**, Các khoản khác **0 đ** — số giả hiện như thật; "Tải PDF" hiện **2 lần** (header + card Hành động); badge trạng thái hiện 2 lần (header + "Trạng thái thanh toán") | `desktop__invoices_I001.png` | `invoice-detail.template.tsx:148-161, 58-61, 258-266` |
| 10 | `/invoices/batch` | cả hai | `<input type="month">` hiện "September 2026" (locale trình duyệt, không phải vi); bảng trên mobile cắt cột "Điện & Nước" không có dấu hiệu cuộn | `desktop__invoices_batch.png`, `mobile__invoices_batch.png` | `batch-invoice.template.tsx:98-108` |
| 11 | `/tenants/create`, `/contracts/:id/renew`, `/contracts/create` bước 3 | 1440 | `<input type="date">` hiện `mm/dd/yyyy` (locale trình duyệt) trong app đọc `DD/MM/YYYY` — rủi ro nhập nhầm ngày/tháng | `desktop__tenants_create.png`, `desktop__contracts_C001_renew.png` | `text-field.tsx` với `type="date"`; primitive `date-picker`/`calendar` chưa dùng |
| 12 | `/utilities/meter-input` | 390 | Bảng 8 cột ép trong 390 px: chỉ thấy 4 cột, "Nước cũ/mới" và "Trạng thái" nằm ngoài vùng nhìn, không có gợi ý cuộn; hai nút "Tính toán hóa đơn"/"Lưu chỉ số" cùng làm một việc | `mobile__utilities_meter-input.png` | `meter-input.template.tsx:64-92` |
| 13 | `/utilities` | 1440 | Thẻ Chỉ số: ô icon "Tiêu thụ" là icon `Activity` cho cả điện lẫn nước; heading màn là "Tiện ích" trong khi glossary cấm từ này (`CONTEXT.md` § Chỉ số điện nước: *Avoid: tiện ích*) và sidebar cũng ghi "Tiện ích" | `desktop__utilities.png` | `utility-card.tsx:77-80`, `utility-list.template.tsx:46`, `navigation.ts:96` |
| 14 | `/utilities/:id` | 1440 | Ảnh chứng từ vỡ (alt "Chứng từ 1" trong ô xám 1:1); "Lịch sử" 2 mốc cùng một `updatedAt` | `desktop__utilities_util-001.png` | `utility-detail.template.tsx:143-192` |
| 15 | `/tenants` | 1440 | Avatar 14 màu ngẫu nhiên (rose/fuchsia/violet…) trên theme đen-trắng — ồn nhất trang; KPI "Nợ cước" dùng icon **check-circle** (`CheckCircle2`) cho một trạng thái xấu | `desktop__tenants.png` | `tenants.ts:3-18`, `tenant-list.template.tsx:56-61` |
| 16 | `/tenants/:id` | 1440 | Cột phải "Trạng thái hiện tại" ghi nhãn **"Khoá phòng"** (typo/ý?) cho tên Phòng; "Loại hợp đồng: Hợp đồng dài hạn" literal; hai card "Hành động nhanh" (3 nút chết) + "Liên hệ" | `desktop__tenants_T001.png` | `tenant-detail.template.tsx:221-263` |
| 17 | `/auth/login` | cả hai | Nút "Đăng nhập" **dính sát** ô mật khẩu (không có khoảng cách giữa `FieldGroup` và `CardFooter`), trong khi ô email → mật khẩu có gap | `desktop__guest_auth_login.png`, `mobile__guest_auth_login.png` | `sign-in-form.tsx:41-110` (`CardContent` không padding-bottom / `CardFooter` không `pt`) |
| 18 | `/auth/login` (submit sai) | 1440 | Lỗi hiện đúng dưới từng ô (tốt) nhưng nút submit vẫn dính ô mật khẩu; **không** có `aria-describedby` nối ô với lỗi (`FieldError` là `role="alert"`) | `desktop__guest_login_invalid.png` | như trên |
| 19 | `/`, `/reports` | cả hai | **Console**: `Encountered two children with the same key, "value"` (donut legend) ở `/` — và vì `/auth/*` có token redirect về `/`, cảnh báo xuất hiện ở cả 3 route; `/reports`: 9 cảnh báo key trùng `04/2026-Chung cư Mini Lê Duẩn-Tầng 1/2/3`, `03/2026-…` (Mock sinh dòng trùng) | `log.json` (25 mục, tất cả là hai lỗi này; **0** pageerror, **0** HTTP ≥ 400) | `occupancy-donut-chart.tsx:57`, `reports.ts:100-108`, `report-table.tsx:51` |
| 20 | mọi màn | 390 | Header: tên khu vực dài ("Hóa đơn nhà cung cấp", "Trung tâm nhiệm vụ") đẩy selector Toà nhà và chuông **ra ngoài mép phải** (bị `overflow-hidden` cắt, không cuộn được) | `mobile__supplier-bills.png`, `mobile__tasks.png` | `app-header.tsx:21-45` (`truncate` chỉ trên tiêu đề, không `min-w-0` cho cụm phải) |
| 21 | `/contracts/create` | 390 | Card stepper (4 bước, 420 px) chiếm trọn màn đầu; form ở dưới fold — trên mobile stepper nên nằm ngang/thu gọn | `mobile__contracts_create.png` | `contract-create.template.tsx:116-121` |
| 22 | `/reports` | 1440 | Tab "Lợi nhuận dịch vụ" là danh sách với `+850 000 đ` cứng cho mọi tầng; icon emoji `⚡ 💧` trong text (`:191`) — lệch quy ước icon (`lucide`); "Cảnh báo thất thoát" luôn rỗng | `desktop__reports.png` (tab pnl) | `reports-overview.template.tsx:169-226` |
| 23 | `/settings` | 1440 | Card "Tuân thủ & liên lạc" là 3 nút full-width xếp dọc (link điều hướng giả dạng nút) — không phải cài đặt; "Khôi phục mặc định" không handler | `desktop__settings.png` | `settings.template.tsx:67-92` |
| 24 | `/communications` | 1440 | Tab con "Tất cả / Zalo ZNS / SMS / Email" lồng trong tab cha; "Gửi ngay" đen full-width trên mỗi mẫu → 3 CTA chính cùng lúc | `desktop__communications.png` | `communications.template.tsx:143-174` |
| 25 | `/buildings` | 1440 | Thẻ Toà nhà không có trạng thái, không có ảnh (`imageUrl` có trong type, Mock không set); "Xem chi tiết" ghost link duy nhất — thẻ không click được toàn bộ | `desktop__buildings.png` | `building-card.tsx` |
| 26 | `/rooms/:id` cột phải | 1440 | Card "Nhanh chóng" (tiêu đề khó hiểu — "Hành động nhanh"?) chứa nút chết; badge `w-full justify-center` kéo badge thành thanh dài | `desktop__rooms_R-B1-101.png` | `room-detail.template.tsx:180-185, 224-248` |
| 27 | mọi màn | cả hai | Nút góc phải dưới (🏝) là TanStack Query Devtools — chỉ ở `PUBLIC_APP_ENV=local`, không phải defect production | — | `pages/main.tsx:158-160` |

Không tìm thấy: text tiếng Việt bị cắt giữa chữ (mọi `truncate` cắt cả từ có `…`), heading trùng/thiếu (mỗi route đúng 1 `<h1>` — log `h1=[…]` cho 85 ảnh), contrast dưới 4.5:1 **ở text chính** (đen/xám neutral); **không đo** contrast của badge màu (`emerald-700` trên `emerald-50` v.v.) — chưa xác minh.

### C.2 Audit nhất quán giữa 18 slice (FACT, đếm từ code)

| Mẫu | Số biến thể | Ở đâu |
| --- | --- | --- |
| **Header trang** | **6**: (1) `ListPageHeader` title+desc+actions — 17 màn; (2) `<h1>` + `<p>` tự vẽ, không actions — `contract-create.template.tsx:109-114`; (3) `<h1>` + `<p>` + "Hủy" bên phải + `max-w-4xl mx-auto` — `tenant-create.template.tsx:97-113`; (4) `DetailPageShell`: h1 sr-only + "Quay lại" + actions, tên entity ở `CardTitle` bên trong — 10 màn chi tiết; (5) chi tiết Chỉ số: `DetailPageShell` **+** `<h2 class="text-3xl">` tên phòng ngoài card — `utility-detail.template.tsx:92-99`; (6) `CardTitle role="heading" aria-level=1` — 2 màn auth | |
| **Toolbar bảng** | **3**: `DataTable` toolbar (search + facets + "Xóa bộ lọc" + `toolbarActions`) — 10 màn; `ReportFiltersBar` 3 `Select` + "Chọn ngày" + "Xóa bộ lọc" (state, không URL) — Báo cáo; lọc tab kênh bằng `Tabs` (state) — Thông báo | `data-table.tsx:173-215`, `report-filters-bar.tsx`, `communications.template.tsx:143-155` |
| **View switch thẻ/bảng** | 2 cách viết cùng UI: `useListView`+`ListViewSwitch` (3 màn) vs copy tay (2 màn); 5 màn khác chỉ bảng; Tasks chỉ thẻ | B.1 |
| **Thẻ KPI** | 1 composite (`SummaryCard`) nhưng **bố cục sai** (C.1 #1) và màu icon quyết ở 11 template | B.3 |
| **Thẻ thực thể (grid)** | **8 anatomy khác nhau** trên `EntityListCard`: Building (title/desc/2 stat/bar/link), Room (header tô màu trạng thái/tenant/giá+icon/⋯), Tenant (avatar/badge/2 dòng liên hệ/2 stat/2 ngày/⋯), Contract (icon tile/số HĐ/badge uppercase/dl 3 dòng/2 stat/⋯), Invoice (số/badge/2 dòng/2 stat/cập nhật/⋯), Utility (icon tile/badge/2 stat/tiêu thụ/link), Task (title/desc/3 badge/hạn/link), Template (title/desc/icon tile/preview/nút) | 8 file `*-card.tsx`/`room-grid.tsx` |
| **Bố cục màn chi tiết** | **3**: 2/3 + 1/3 (Phòng, Người thuê, Hợp đồng, Hoá đơn — cột phải 3–4 card nhỏ); 1 card tổng + 2 cột (Toà nhà, Chi phí, Hoá đơn NCC); heading ngoài card + 2 cột + 2 card dọc (Chỉ số) | `*-detail.template.tsx` |
| **Cặp nhãn–giá trị** | **3**: `InfoRow` (ngang, nhãn trái) · `StatItem` (dọc, nhãn uppercase nhỏ) · `dl` tự vẽ trong thẻ (`contract-card.tsx:51-96`, `invoice-card.tsx:35-52`) | |
| **Dialog** | **3**: `Dialog` form (tạo Toà nhà — 1 dialog form duy nhất, mọi form khác là **trang**), `AlertDialog` confirm (4 màn xoá), `Dialog` VietQR; `CommandDialog` ⌘K | |
| **Form** | **4 bố cục**: wizard 4 bước có stepper trái (Hợp đồng); wizard 3 bước có stepper trái không shell (Onboarding); trang dài 3 card + nút dưới cùng (Người thuê); form 2 card + confirm card bên phải (Gia hạn); + dialog (Toà nhà); + form-in-table (Đợt hoá đơn, Nhập chỉ số, Bậc thang). **3 cách đặt nút submit**: dưới form, ở `ListPageHeader.actions` (`form={FORM_ID}`), ở `CardFooter` | |
| **Empty/error/loading** | Empty: `EmptyPanel` (15) — nhưng `compliance-type-card.tsx:54` và `reports-overview.template.tsx:296-298` dùng `<p>` xám. Loading: 1 `LoadingPanel` (26) — 3 kích cỡ lưới, không skeleton bảng. Error: `ErrorPanel` (13) | |
| **Trạng thái** | `StatusBadge` 24 nơi — tốt; nhưng `Badge variant="outline"` thô ở `setting-group.tsx:26-35`, `room-columns.tsx:55` (tầng), `meter-input-row.tsx:108` ("Chưa nhập"), `liquidation-summary-card.tsx:63-76` | |
| **Icon ↔ nghĩa** | `ReceiptPoundSterling` (£) cho "Hóa đơn nhà cung cấp" (`navigation.ts:104`); `Droplet` cho "Tiện ích" (điện+nước); `Building` vs `Building2` cho Toà nhà vs Phòng; `CheckCircle2` cho "Nợ cước" (C.1 #15); `Activity` cho tiêu thụ điện | `navigation.ts`, templates |
| **Copy** | "Tiện ích" (heading + sidebar) vs glossary; "Tuân thủ"/"Liên lạc"/"Trung tâm nhiệm vụ" (sidebar) vs glossary "Khai báo lưu trú"/"Thông báo"/"Trung tâm việc"; "Khách thuê"/"khách" khắp nơi vs glossary "Người thuê" (_Avoid_: khách); "Xóa" Hợp đồng vs glossary "không có huỷ" | `CONTEXT.md` |

### C.3 Đầu vào cho bước design (dữ liệu, không quyết định)

Cách trích: `ux#NN` = `ux-guidelines.csv` `No=NN`; `shadcn#NN` = `stacks/shadcn.csv`; `react#NN` = `stacks/react.csv`; `products#NN`/`ui-reasoning#NN`/`colors#NN` join cùng `No`; `typography#NN` có `No` riêng (không join). Grep `^NN,` — cột `Keywords` của `products.csv` có xuống dòng trong ngoặc kép.

**a) Hàng `ux-guidelines.csv` áp thẳng vào defect C.1/C.2 (nguyên văn cột `Description | Do | Don't | Severity`):**

| No | Category · Issue | Do / Don't | Chạm defect |
| --- | --- | --- | --- |
| 3 | Navigation · Active State | Highlight active nav item / All links same style · Medium | sidebar đã đúng |
| 6 | Navigation · Breadcrumbs | Use for sites with 3+ levels / flat sites · Low | chi tiết 2–3 cấp (`/contracts/:id/renew`) không có breadcrumb (C.2 header) |
| 10 | Animation · Loading States | skeleton screens / blank screen · High | `LoadingPanel` một hình cho mọi màn (B.3) |
| 19 | Layout · Content Jumping | Reserve space… stable container / insert without layout strategy · High | KPI mount sau `isLoading` cả màn (C.2 empty/error/loading) |
| 22 · 104 | Touch · Target Size (44pt iOS/48dp Android; web ≥24 CSS px) · High | icon-sm 32 px ok; `Kbd`, badge không phải target |
| 28 · 41 | Interaction · Focus States; Accessibility · Keyboard Navigation · High | chưa xác minh bằng screenshot (không chụp focus) |
| 31 | Interaction · Disabled States (opacity + cursor) · Medium | 5 menu item disabled vĩnh viễn (B.2) — "disabled" ở đây nghĩa là "chưa có", không phải state |
| 33 · 44 · 55 · 109 | Error Feedback; Error Messages `role=alert`; Error Placement `aria-describedby`; Focusable Error Summary · High | `FieldError` là `role=alert` ✓; **không** `aria-describedby` (C.1 #18); không error summary cho form dài (Người thuê 8 ô, Bậc thang n×3) |
| 35 | Interaction · Confirmation Dialogs · High | 4 màn xoá có `AlertDialog` ✓; "Xóa" Hoá đơn confirm rồi **không xoá** (B.3) |
| 36 · 37 | Color Contrast 4.5:1; Color Only (icon/text + color) · High | badge có icon ✓; KPI icon tile màu-chỉ (C.1 #1); "Lãi/Lỗ" có icon ✓ |
| 39 | Heading Hierarchy · Medium | h1 sr-only rồi `CardTitle` (div) làm tiêu đề thật; `h2` Tầng trong grid; `h3` trong card — thứ tự đúng nhưng h1 vô hình |
| 43 · 54 | Form Labels / Input Labels (visible label) · High | ✓ (`FieldLabel`), trừ bậc thang dùng `aria-label` (`electricity-tier-config.tsx:135`) |
| 56 · 57 · 59 | Inline Validation (on blur); Input Types; Required Indicators · Medium | RHF mặc định validate on submit; `*` chỉ ở Gia hạn (`"Ngày kết thúc mới *"`), các form khác không đánh dấu bắt buộc |
| 61 · 32 | Submit Feedback; Loading Buttons · High | có `disabled={isPending}` ✓, toast ✓; hai `submit` cùng form (C.1 #12) |
| 64 · 69 · 71 | Mobile First; Horizontal Scroll; Table Handling (`overflow-x-auto` hoặc card layout) · High/Medium | bảng cuộn trong card không có dấu hiệu (C.1 #10, #12); header mobile bị cắt (#20) |
| 74 · 77 | Font Size Scale; Heading Clarity · Medium | `text-[10px]`, `text-[11px]` xuất hiện 11 chỗ (`contract-card`, `tenant-columns`, `template-card`, `notification-panel`, `reconciliation-columns`…) ngoài thang 12/14/16 |
| 78 · 79 · 80 · 90 | Loading Indicators; **Empty States** (message + action); Error Recovery (Try again); No Results (suggestions) · Medium/High | `EmptyPanel` có action khi đang lọc ✓; empty của `compliance-type-card` là `<p>` |
| 82 · 83 | Toast auto-dismiss; Confirmation Messages · Medium | toast primitive ✓ |
| 84 · 113 · 114 | Truncation (line-clamp + expand); **Essential Text Truncation** (Critical); **Compact Label Semantics** (badge = state, chip = value) · Critical/High | `truncate` trên tên/email (`tenant-card.tsx:31,50,54`); badge "T1" cho tầng và badge "2 chiếc" cho số lượng dùng `Badge` (không phải state) — vi phạm #114 |
| 85 · 86 | Date Formatting (locale); Number Formatting · Low | `formatCurrency` ✓; ngày là chuỗi Mock (B.3) |
| 89 | Search · Autocomplete (debounced) · Medium | `SearchInput` debounce 300 ms ✓ (`search-input.tsx:26`) |
| 91 | Data Entry · Bulk Actions (checkbox + action bar) · Low | bảng Phòng/Hợp đồng có cột chọn (`room-columns.tsx:23-42`) nhưng **không có** action bar — selection không làm gì |

**b) `stacks/shadcn.csv` / `stacks/react.csv` liên quan (No, nguyên văn `Guideline`):** shadcn#16 *React Hook Form integration (Controller + Field)* ✓ đang làm; #17 *Use Field for input structure* ✓; #18 *Display field errors (FieldError)* ✓; #22 *Use Command for search* ✓ nhưng không tìm gì; #24–26 *Table / proper structure / DataTable (TanStack)* ✓; #40–41 *Skeleton matching content layout* ✗ (B.3); #42–43 *AlertDialog for confirms + Action/Cancel* ✓; #44–46 *Sidebar/Provider/Trigger* ✓; #47–49 *Chart + chartConfig + ChartTooltip* ✓ (thiếu `nameKey` legend); #52–54 *semantic components / focus / labels* ✓; #68 *`render` for Base UI composition* ✓ (`PopoverTrigger render=`, `DropdownMenuTrigger render=`); #31–33 *Sonner* — **repo dùng `toast.add` của Base UI, rule repo thắng**. react#4 *derive, don't store* ✓; #8 *avoid unnecessary effects* (1 timer không cleanup — B.3); #10 *stable keys* ✗ (2 lỗi console); #28 *debounce search* ✓; #37 *virtualize lists >100* — Phòng 45, không cần; #39–40 error boundary ✓ (`main.tsx:168`); #54 *React Compiler first* ✓ (bật ở `vite.config.ts:28`); #58 *ref as prop* — không `forwardRef` ✓.

**c) App chưa có brand → `products` → `ui-reasoning` → `colors` (join `No`) — 5 hàng gần nhất (nguyên văn, cột chính):**

| No | Product Type | Style (products / ui-reasoning) | Color Mood | Key Considerations / Anti-patterns | `colors#No` (primary · bg · fg · accent · muted-fg · destructive) |
| --- | --- | --- | --- | --- | --- |
| **105** | Invoice & Billing Tool (keywords: invoice, billing, payment, receipt, estimate, quote, accounting) | *Minimalism & Swiss Style + Flat Design*; Landing *Conversion-Optimized + Trust*; Dashboard *Financial Dashboard* | *Professional navy + paid green + overdue red + neutral grey* | *Invoice template with line items. Tax/discount calculation. Status badges (Draft/Sent/Paid/Overdue). PDF export + share. Payment link generation. Client address book. Recurring invoices.* / Anti: *Excessive decoration + Complex shadows + 3D effects* | `#1E3A5F · #F8FAFC · #0F172A · #059669 · #475569 · #DC2626` — "Navy professional + paid green" |
| **102** | Inventory & Stock Management (inventory, stock, warehouse, sku, management) | *Flat Design + Minimalism & Swiss Style*; Dashboard *Real-Time Monitoring + Data-Dense* | *Functional neutral + status traffic-light (green/amber/red) + scanner accent* | *Product list/grid with thumbnails… Stock level badges. Low-stock alert banner. Category/location filter. Batch edit. Reorder trigger. Audit log.* | `#334155 · #F8FAFC · #0F172A · #059669 · #475569 · #DC2626` — "Industrial slate + stock green" |
| **101** | CRM & Client Management (crm, client, customer, pipeline, contact) | *Flat Design + Minimalism & Swiss Style*; Dashboard *Sales Intelligence Dashboard* | *Professional blue + pipeline stage colors + closed-won green* | *Contact card list with avatar. Pipeline kanban board. Activity timeline. Quick-log. Tag/segment filter. Mobile quick-actions.* | `#2563EB · #F8FAFC · #0F172A · #059669 · #475569 · #DC2626` — "Professional blue + deal green" |
| **7** | Analytics Dashboard (kpi, metric, dashboard-data, business-intelligence) | *Data-Dense Dashboard + Heat Map*; Dashboard *Drill-Down Analytics + Comparative* | *Cool→Hot gradients + neutral grey* | *Clarity > aesthetics. Color-coded data priority.* / rules: `must_have: data-export`, `if_large_dataset: virtualize-lists`; Anti: *Ornate design + No filtering* | `#1E40AF · #F8FAFC · #1E3A8A · #D97706 · #475569 · #DC2626` — "Blue data + amber highlights" |
| **36** | Real Estate/Property (buy, estate, housing, property, rent) | *Glassmorphism + Minimalism & Swiss Style*; Landing *Hero-Centric + Feature-Rich*; Dashboard *Sales Intelligence* | *Trust Blue (#0077B6) + Gold accents + White* | *Property listings. Virtual tours. Map integration. Agent profiles. Mortgage calculator.* — hàng **marketing listing**, không phải portal vận hành; Anti: *Poor photos + No virtual tours* | `#0F766E · #F0FDFA · #134E4A · #0369A1 · #475569 · #DC2626` — "Trust teal + professional blue" |

Ba hàng back-office (#101/#102/#105) chia sẻ **cùng** `Key_Effects` *"Color shift hover + Fast 150ms transitions + No shadows"*, cùng nền `#F8FAFC`/chữ `#0F172A`/muted `#475569`/destructive `#DC2626`/accent xanh `#059669`, chỉ khác primary. Không có hàng "property management / rental / ERP" riêng trong 192 hàng `products.csv`. `typography.csv` (No riêng): #42 *Dashboard Data* (Fira Code + Fira Sans — "Code for data, Sans for labels"), #31 *Financial Trust* (IBM Plex Sans), #16 *Corporate Trust* (Lexend + Source Sans 3), #72 *Enterprise SaaS* (Plus Jakarta Sans, "admin dashboards"); có hàng #21 *Vietnamese Friendly* — **chưa đọc**, cần xem cho copy tiếng Việt có dấu.

**d) Cách ghi override theme nếu design step chọn palette riêng (FACT từ ADR-0008/0009):** khối **unlayered** trong `apps/<app>/src/globals.css` (`:root` + `.dark`; *"viết trong `@layer base` thì compile, ship và thua"* — ADR-0008), `--radius` phải có đơn vị (`theme.css` suy `--radius-*` bằng `calc`), **giữ** status/chart/sidebar token của theme (ADR-0009 loại phương án override status: *"một status không nên đổi nghĩa giữa các app"*), hợp đồng là `apps/<app>/test/globals.test.ts` (copy `contrast.ts`, không import chéo app), và cần **ADR-0010** với lý do riêng — ADR-0009 đặt điều kiện *"một app override palette dùng chung khi nó không phải sản phẩm EMR và có lý do ghi thành ADR"*. Lưu ý FACT khác brief `documents`: `tooling/tailwind/theme.css` hiện là **shadcn neutral mặc định** (`--primary: oklch(0.205 0 0)`, commit `79c52df` "reset the shared palette to shadcn's neutral default"), không còn teal — mọi ảnh chụp là đen/xám vì thế.

**e) Hình dạng brief mà design step sẽ viết (từ `docs/design/documents-redesign.md`)**: title block (ngày, bước, đầu vào, đầu ra, cách đọc trích dẫn) → §1 Chẩn đoán (mỗi FACT trỏ file + `ux#NN`) → §2 Hướng (mỗi hướng = mockup HTML tĩnh trong `docs/design/<brief>/mockup-*.html` + bảng "Ý | Hàng CSV | Lấy gì" + bố cục từng màn + "Giá phải trả") → §3 Bố cục từng màn (ASCII wireframe) → §4 Component map (chỉ primitive **có sẵn**) → §5 Token delta → §6 State list (Màn | State | Hiển thị) → §7 Copy → §8 Không đổi → §9 Câu hỏi mở (**CẦN CHỦ REPO**) → §10 Chốt ở grill. Note này cung cấp nguyên liệu cho §1, §4, §6 và §9.

### C.4 Primitive `@monorepo/ui` có sẵn mà app chưa dùng hoặc tự vẽ lại

63 primitive (`packages/ui/src/components/`). App import ~30. Đối chiếu markup tay:

| Primitive (file) | App đang tự vẽ ở | Ghi chú |
| --- | --- | --- |
| `breadcrumb.tsx` | không có breadcrumb; `DetailPageShell` chỉ có "Quay lại" | `ux#6` |
| `pagination.tsx` | `data-table/pagination-bar.tsx` (170 dòng) tự dựng first/prev/pages/next/last bằng `Button` | có thể chồng lên primitive |
| `item.tsx` | các hàng "nhãn–mô tả–badge" tự vẽ: `compliance-type-card.tsx:38-52`, `residence-checklist-card.tsx:31-52`, `setting-group.tsx:72-94`, `notification-panel.tsx:135-178`, `reports-overview.template.tsx:243-266`, `pending-tasks-card.tsx:26-55`, `recent-activities-card.tsx:27-45` | 7 chỗ cùng anatomy |
| `date-picker.tsx` / `calendar.tsx` | `<input type="date">` qua `TextField` (Người thuê `dob`, Hợp đồng `startDate`, Gia hạn `newEndDate`); `<input type="month">` (Đợt hoá đơn) | C.1 #10–11 |
| `input-group.tsx` | `search-input.tsx:45-66` tự đặt icon `absolute` trong `Input`; ô tiền không có suffix "đ" | |
| `native-select.tsx` | — | thay `Select` ở bộ lọc Báo cáo trên mobile nếu cần |
| `sheet.tsx` / `drawer.tsx` | mọi form là trang riêng hoặc `Dialog`; sidebar mobile đã dùng `sheet` qua `sidebar` | ứng viên cho "Thêm phòng/Chi phí/Hoá đơn NCC" (nút chết) |
| `kbd.tsx` | ✓ đã dùng (`search-dialog.tsx`) | |
| `empty.tsx` | ✓ qua `EmptyPanel`; nhưng 2 chỗ `<p>` (C.2) | |
| `skeleton.tsx` | ✓ qua `LoadingPanel` — một hình | cần skeleton bảng/chi tiết |
| `progress.tsx` | ✓ `OccupancyBar`, checklist | |
| `tooltip.tsx` | không dùng cho icon-only button ngoài sidebar | `ux#40` icon buttons (`Eye` link có `aria-label` ✓) |
| `avatar.tsx` | `tenant-avatar.tsx` tự vẽ `div` màu + initials; nav-user dùng `Avatar` | 2 cách |
| `toggle-group.tsx` | view switch thẻ/bảng dùng `Tabs` (`list-view.tsx:59-68`) — Tabs không có panel tương ứng | semantics |
| `alert.tsx` | ✓ `ErrorPanel`; nhưng "Sẵn sàng hoàn tất"/"Xác nhận gia hạn" tự tô `Card` `bg-emerald-50` (`contract-liquidation.template.tsx:230`, `contract-renew.template.tsx:242`) | |
| `chart.tsx` | ✓ 3 biểu đồ; Báo cáo không có biểu đồ nào | |
| `attachment.tsx` | ảnh chứng từ/biên lai là `<img>` thô (`utility-detail.template.tsx:155-159`, `expense-detail.template.tsx:88-92`, `supplier-bill-detail.template.tsx:107-111`) | không fallback |
| `combobox.tsx` | chọn Toà nhà/Phòng trong wizard Hợp đồng là `Select` (`contract-create.template.tsx:253-306`) — 45 Phòng không tìm được | `patterns-self-fetching-inputs` |
| `resizable`, `carousel`, `menubar`, `navigation-menu`, `hover-card`, `context-menu`, `slider`, `input-otp`, `radio-group`, `accordion`, `aspect-ratio`, `marker`, `bubble`, `message*`, `questionnaire`, `direction`, `button-group` | chưa dùng | không nhất thiết cần |

---

## §D. Câu hỏi mở cho grill (DRAFT — câu hỏi, không phải quyết định)

**Flow / model (phải chốt trước design):**

1. **Enum trạng thái đi theo ai?** Giữ enum prototype (`ending`, `pending`, `overdue` của Tenant…) hay đổi ngay sang enum của `fe-api-integration/*.md` (`EXPIRING/TERMINATED`, `UNPAID/PARTIAL`, `deposit_status`) — để pha 2 vẽ badge một lần? (§A.8 bảng enum)
2. **Tham chiếu bằng id hay tên?** #127 chốt "Contract.tenant là tên, đổi sang id khi nối BE". Redesign có bắt buộc `contractId/roomId/tenantId` trên Hoá đơn/Chỉ số/Việc cần làm để Đối soát, Báo cáo, Dashboard **suy ra được** như glossary định nghĩa (§A.5) — hay giữ Mock rời và chấp nhận 3 màn đó là "ảnh"?
3. **Một kiểu kỳ (`YYYY-MM`) và một kiểu ngày (ISO) trong Mock?** Hiện 4 kiểu (§A.8 #6). Ngày hiển thị qua `formatDate`, không lưu chuỗi đã format?
4. **Hợp đồng**: Thanh lý phải ghi được cọc (giữ/hoàn/hoàn một phần) và số nợ thật từ Hoá đơn chưa trả? Gia hạn có lịch sử không? Có "Xóa" không (glossary nói không)? Chấm dứt sớm + báo trước có là quy tắc trong app không (theo §A.0)?
5. **Hoá đơn**: có line items (tiền phòng, điện theo bậc, nước, dịch vụ, khoản khác) và `PARTIAL` không? `overdue` suy từ `dueDate` hay lưu? Đợt hoá đơn lập từ Phòng đang có Hợp đồng `ACTIVE` + Chỉ số `verified` của kỳ đó (tức là Nhập chỉ số phải **trước** Đợt hoá đơn trong flow)?
6. **Giá điện**: chọn **một** mô hình: bậc thang EVN hiện hành (6 bậc, §A.0) áp theo định mức/số người, hay giá phẳng do chủ nhà đặt (thực tế phổ biến nhưng bị giới hạn bởi Thông tư — §A.0)? Bậc thang nằm ở Cài đặt toàn cục hay theo Toà nhà (`Building.utilityCycleDay` đã theo Toà nhà)? Nước: giá phẳng hay bậc theo tỉnh?
7. **Khai báo lưu trú**: model theo Người thuê (thông báo lưu trú/đăng ký tạm trú, có mã hồ sơ, hạn) tách khỏi nghĩa vụ **của cơ sở** (PCCC, giấy tờ)? Có sinh file/QR cho VNeID không, hay chỉ checklist + link ngoài (§A.0)?
8. **VietQR**: Cài đặt có tài khoản ngân hàng (BIN + STK + tên) để sinh QR từ `img.vietqr.io` ngay ở FE (không cần BE), hay chờ `payment-service`? Nội dung chuyển khoản chuẩn hoá ra sao (`addInfo` giới hạn ký tự, không dấu — §A.0)?
9. **Building scope**: 7 màn không scope (§A.6) — scope là bắt buộc cho *mọi* danh sách, hay Báo cáo/Cài đặt/Thông báo cố ý toàn cục? `buildingId` thành **bắt buộc** trên mọi entity?
10. **Việc cần làm** sinh từ dữ liệu (Hoá đơn quá hạn, Hợp đồng sắp hết, Chỉ số bất thường, Lưu trú quá hạn) — bỏ `mockTasks` và `pendingTasks` của Dashboard, hay giữ Task như entity nhập tay (bảo trì)?
11. **Onboarding/đăng ký/Quên mật khẩu**: giữ như màn giả cho tới khi BE có auth, hay bỏ khỏi pha 2?

**Code (bỏ / gộp):**

12. Bỏ hẳn ~45 control chết hay giữ dưới dạng "sắp có" (disabled + tooltip)? Ít nhất: hai `submit` Nhập chỉ số, "Tải PDF" lặp, "Xóa" Hoá đơn giả.
13. Gộp `InfoRow`/`StatItem`/`dl` tự vẽ thành một cặp nhãn–giá trị? Gộp 8 thẻ thực thể vào **một** anatomy (header: tên + badge; body: 2–4 stat; footer: meta + ⋯)? Xoá `notification-panel`/`search-dialog` Mock hay nối chúng vào Mock thật (⌘K tìm Phòng/Người thuê/Hợp đồng/Hoá đơn)?
14. Màu trạng thái chuyển sang token `--success/--warning/--info/--destructive` + `--chart-*` (điều kiện để dark mode ở pha 2 khả thi — README pha 1 nói "không dark mode", pha 2 quyết lại)?
15. `QuerySection` cho mọi màn, skeleton theo footprint (bảng/chi tiết/KPI) thay `LoadingPanel` duy nhất?

**Design step:**

16. Palette: giữ neutral shadcn (không ADR) hay override theo `colors#105`/`#102` (cần ADR-0010)? Dark mode có vào pha 2 không?
17. Mobile: KPI nên là dải ngang cuộn / 2 cột / ẩn — quyết trước khi vẽ (C.1 #2).
18. Chi tiết: một bố cục cho 10 màn (header entity + tabs?) thay 3 bố cục hiện tại; breadcrumb hay "Quay lại"?
19. Copy: đổi heading/sidebar về glossary ("Chỉ số điện nước", "Khai báo lưu trú", "Người thuê", "Trung tâm việc")?
20. i18n: pha 1 bỏ; pha 2 có bật lại (`@monorepo/i18n` i18next Flavor) không — quyết trước khi design viết copy?

---

## §E. Đề xuất (DRAFT — ngắn, để grill bác bỏ)

- **Thứ tự**: chốt §D 1–3 (enum, id, kỳ) → viết lại Mock **một lần** thành 1 Toà nhà đầy đủ quan hệ (thay 10 Toà nhà rời) → rồi mới design; design trên Mock rời sẽ vẽ ra màn "ảnh" lần nữa.
- **Cắt** trước khi vẽ: ~45 control chết, 3 danh sách Việc cần làm/thông báo trùng, 2 bản copy `useListView`, `ReportFiltersBar` (Báo cáo dùng `DataTable` facets + URL như 10 màn kia), tab "Lợi nhuận dịch vụ" (số cứng), "Cảnh báo thất thoát" (luôn rỗng), card "Tuân thủ & liên lạc" ở Cài đặt.
- **Sửa rẻ, thấy ngay** (không chờ design): `SummaryCard` bố cục (1 dòng class), `nameKey="name"` cho legend donut, Mock Báo cáo hết trùng key, header mobile `min-w-0`, gap nút Đăng nhập, `aria-describedby` cho `FieldError`, glossary copy.
- **Design step nhắm vào**: một page-header, một toolbar (`DataTable`), một KPI (2 size: full / compact-mobile), một thẻ thực thể, một bố cục chi tiết, một form layout + một vị trí submit, một skeleton/bảng, token trạng thái — 8 quyết định, mỗi cái trỏ `ux#NN`/`shadcn#NN` như §C.3.

---

## §F. Nguồn

**Repo & spec**: `apps/smart-rental/{README.md,CONTEXT.md,package.json,ports.env}`; `apps/smart-rental/src/**` (mọi file đã liệt kê theo `path:line` ở trên); `apps/smart-rental/test/**`, `e2e/support/auth-session.ts`; `CLAUDE.md` §1/§7a; `.agents/rules/{architecture-*,quality-*,patterns-*,tanstack-*,forms-*,zustand-*,react-*,dates-*,testing-*}.md`; GitHub Issues #127, #129, #130, #133, #137, #139, #140, #141, #142, #143 (`gh issue view`); `packages/ui/src/components/{card,chart}.tsx` và danh sách 63 file; `tooling/tailwind/{theme,globals}.css` (`git log` `79c52df`); `docs/adr/0008-portfolio-neubrutalist-neutral-override.md`, `docs/adr/0009-documents-prism-palette-override.md`; `docs/design/documents-redesign.md`.

**Backend (chỉ đọc)**: `D:\Personal\smart-rental\backend\document\fe-api-integration\{README,contract-service,billing-service,payment-service,property-service,tenant-service}.md`; `shared/src/main/java/sharing/base/controller/BaseController.java`; `user-service/.../UserProfileController.java`.

**Design data**: `.agents/skills/ui-ux-pro-max/data/{ux-guidelines,products,ui-reasoning,colors,typography}.csv`, `stacks/{shadcn,react}.csv`, `SKILL.md` (Quick Reference §5, §8–10; Pre-Delivery Checklist).

**Boot/chụp**: `bun run dev` (Vite 8.2.2, port 3006); Playwright `@playwright/test` (chromium) qua `node`, script + `log.json` ở scratchpad; Gate log `typecheck.log`, `test.log`.

**Pháp lý / biểu giá / chuẩn thanh toán**: xem §A.0 (mỗi mục kèm số hiệu văn bản + URL; mục nào không mở được ghi "chưa xác minh").
