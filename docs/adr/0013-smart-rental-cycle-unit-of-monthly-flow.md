---
status: accepted
date: 2026-09-18
---

# `apps/smart-rental` — Kỳ là đơn vị của chuỗi tháng: chốt cuối tháng, hạn thu là Ngày thu tháng sau, Chỉ số Nháp → Đã chốt trên một màn

Sau pha 2 (spec #153), chuỗi việc tháng nào cũng làm — chốt chỉ số → lập Đợt hoá đơn → thu tiền — cắt thành ba màn ở hai nhóm sidebar; mỗi màn chọn kỳ và Toà nhà lại từ đầu; màn Đợt nói "chưa đủ điều kiện" mà không nói thiếu gì; màn nhập chỉ số không điền sẵn bản ghi đã gõ; chỉ số lưu là `VERIFIED` ngay nên bước "xác nhận" glossary tả không tồn tại; và ba trường "ngày" (`utilityCycleDay`, `collectionDay`, `Contract.paymentDueDay`) cùng tả một thứ, trong đó một trường được hỏi nhưng không dùng (research round 3 §A.3–A.4, §B.1). Backend target `be-motel` thì gắn chỉ số vào Hoá đơn Nháp (`POST /invoices/{id}/utility-readings`) và lập Đợt bằng cron.

Quyết định, chốt ở vòng grill 2026-09-18: (1) **Kỳ** — một tháng của một Toà nhà — là thuật ngữ và là đơn vị của chuỗi; **một màn Kỳ** (`/cycles/:month`, một Toà nhà) chứa cả chuỗi: chỉ số từng Phòng điền sẵn Nháp, tiền điện/nước tính tại chỗ theo Bảng giá, nút lập Hoá đơn cho các Phòng đủ điều kiện. Hai màn `nhập chỉ số` và `Đợt hoá đơn` bỏ; `/utilities` còn là lịch sử chỉ đọc. (2) **Chỉ số điện nước có hai trạng thái Nháp → Đã chốt**; "bất thường" là cờ suy ra, duyệt riêng từng đồng hồ; chỉ số mới nhỏ hơn chỉ số cũ bị chặn hẳn, thay công tơ là sửa chỉ số cũ của Phòng. (3) **Ngày chốt không cài — luôn là cuối tháng của Kỳ**; Toà nhà cài đúng **một ngày, "Ngày thu"**, là hạn thu của Hoá đơn Kỳ trước (Hoá đơn Kỳ 09 hạn là Ngày thu tháng 10). Hợp đồng không có ngày thu riêng. Mock vì thế dịch mọi Hoá đơn lùi một Kỳ.

## Considered Options

- **Giữ hai màn, chỉ nối** (điền sẵn Nháp, "thiếu chỉ số điện Phòng 103" + link, thêm cột điện/nước): rẻ — nhưng vẫn hai lần mở, hai lần chọn kỳ và Toà nhà cho một việc lặp hằng tháng; số lần mở màn quan trọng hơn chi phí một lần.
- **Theo đúng mô hình BE — Chỉ số thuộc Hoá đơn Nháp, không có bản ghi Chỉ số rời**: gần đích nhất — nhưng "chỉ số đã gõ mà chưa lập" không phân biệt được với "chưa gõ", và lịch sử chỉ số theo Phòng (tab Chỉ số, `/utilities`) mất chỗ đứng. FE giữ Chỉ số theo Kỳ + Phòng với hai trạng thái; khi nối BE, "Đã chốt" là lúc `POST /invoices/{id}/utility-readings` xảy ra.
- **Ngày thu = ngày chốt, hạn = chốt + N ngày**: một ngày cài + một hằng số — nhưng thêm một hằng số không ai đặt tên, và "chốt ngày 5 tháng sau" trái với cách Mock và Bảng giá đang tính theo tháng dương lịch.
- **Hai ngày trên Toà nhà (Ngày chốt, Ngày thu)**: linh hoạt nhất — nhưng code pha 2 đã gán chốt = thu và chưa Toà nhà nào cần hai ngày khác nhau; thêm lại khi có Toà nhà thật đòi.

## Consequences

- Route mới `/cycles/:month`; `ROUTES.INVOICE_BATCH`, `ROUTES.METER_INPUT` và `/tasks` bỏ; `~/utils/invoice-batch.ts` + `meter-input-rooms.ts` gộp thành derivation của hàng Kỳ; `Utility.status` còn `DRAFT | FINALIZED`, `ANOMALY` thành cờ suy ra như `EXPIRING` của Hợp đồng (ADR-0012).
- `Building` còn một `collectionDay` = Ngày thu; `utilityCycleDay` và `Contract.paymentDueDay` bỏ khỏi type, Mock và form. Hạn thu của Hoá đơn Kỳ `YYYY-MM` = Ngày thu của tháng kế tiếp; Mock dịch Hoá đơn lùi một Kỳ (18/09/2026: Kỳ 08 đã lập và quá hạn, Kỳ 09 đang Nháp).
- Glossary `apps/smart-rental/CONTEXT.md` đã sửa cùng ngày: Kỳ, Ngày thu, Thu tiền, Chỉ số điện nước, Hoá đơn, Việc cần làm, Hôm nay.
- Việc "Kỳ chưa lập Đợt" ở Hôm nay chỉ xuất hiện từ ngày chốt; trước đó tiến độ chỉ số là một ô KPI, không phải việc.
- Ticket Mock (dịch Kỳ + hai trạng thái Chỉ số) là ticket đầu của round 3; mọi ticket UI đứng sau nó.
