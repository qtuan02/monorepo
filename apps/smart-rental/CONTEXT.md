# `apps/smart-rental` — glossary

Context của app `smart-rental` (Runtime Vite): portal quản lý phòng trọ cho chủ nhà, port từ
prototype `D:\Personal\smart-rental\frontend` (`fe-motel-rsbuild`). Thuật ngữ dùng chung của repo
(Runtime, Flavor, Template app, Gate) ở [`CONTEXT.md`](../../CONTEXT.md) gốc; file này chỉ ghi từ
vựng riêng của app, chốt lần đầu ở vòng grill 2026-09-16, sửa ở vòng grill pha 2 (redesign) 2026-09-17 và vòng grill round 3 ("dễ hơn") 2026-09-18.

## Language

**Portal**:
Chính app này — màn hình sau đăng nhập của chủ nhà, không có trang public. Pha 1 (port) chạy trên
dữ liệu **Mock**; backend `be-motel` chưa có endpoint nghiệp vụ nào.
_Avoid_: dashboard (đó là một màn hình trong Portal), SaaS, hệ thống

**Mock**:
Dữ liệu mẫu cố định của một slice, giữ nguyên từ prototype, đứng sau hook `~/hooks/api` thay cho
service class cho tới khi backend có contract. Một giá trị Mock không sống ở hai nơi.
_Avoid_: fixture (gợi test), seed, fake API, repository (tên lớp của prototype, đã bỏ)

**Toà nhà** (`Building`):
Một cơ sở cho thuê gồm nhiều Phòng; đơn vị mà Building scope chọn.
_Avoid_: nhà trọ, dãy trọ, property, cơ sở

**Building scope**:
Toà nhà đang được chọn cho toàn Portal, bền qua reload — mọi danh sách, con số và Việc cần làm theo nó;
hai ngoại lệ có tên là Cài đặt (toàn cục) và Báo cáo (so sánh giữa các Toà nhà). `null` nghĩa là mọi
Toà nhà; màn Kỳ (chốt chỉ số và lập Đợt hoá đơn) đòi đúng một Toà nhà.
_Avoid_: current building, selected building, bộ lọc toà nhà (nó không phải một filter của bảng)

**Phòng** (`Room`):
Đơn vị cho thuê trong một Toà nhà, có trạng thái `available | occupied | maintenance | reserved`.
_Avoid_: unit, căn

**Người thuê** (`Tenant`):
Người ký Hợp đồng thuê một Phòng. Người thuê **không có trạng thái**: "đang thuê / đã rời" là của
Hợp đồng, "quá hạn" là của Hoá đơn — màn hình suy hai điều đó ra chứ không lưu lên con người.
_Avoid_: khách, khách thuê, resident, user (đó là chủ nhà đăng nhập), trạng thái người thuê

**Hợp đồng** (`Contract`):
Thoả thuận thuê giữa một Người thuê và một Phòng, mang tiền thuê, Cọc, chu kỳ thu và thời hạn báo
trước. Vòng đời: **Nháp → Đang hiệu lực → Sắp hết hạn → Đã hết hạn**, hoặc **Đang hiệu lực →
Đã thanh lý**. "Sắp hết hạn" là 30 ngày trước ngày kết thúc và được suy ra, không ai đặt tay.
Chỉ Nháp mới xoá được.
_Avoid_: lease, agreement, huỷ hợp đồng, pending/ending (tên trạng thái của prototype)

**Cọc**:
Khoản Người thuê gửi khi ký Hợp đồng, có trạng thái riêng: **Đang giữ → Đã hoàn / Hoàn một phần /
Không hoàn**, quyết ở bước Thanh lý.
_Avoid_: deposit lẫn với tiền thuê trả trước, đặt cọc giữ phòng (không có trong Portal)

**Gia hạn** / **Thanh lý**:
Hai bước duy nhất của vòng đời Hợp đồng sau khi ký. Gia hạn kéo dài ngày kết thúc (và có thể đổi
tiền thuê) từ một Hợp đồng Đang hiệu lực hoặc Sắp hết hạn, và để lại lịch sử. Thanh lý kết thúc
Hợp đồng, quyết toán Cọc và trừ nợ thật từ các Hoá đơn chưa thu.
_Avoid_: renew/terminate lẫn với extend/cancel, huỷ (không có huỷ Hợp đồng), gia hạn Hợp đồng đã hết hạn

**Hoá đơn** (`Invoice`):
Khoản Portal thu của Người thuê theo kỳ cho một Hợp đồng, gồm các **dòng** theo loại (tiền phòng,
điện, nước, dịch vụ, khoản khác, giảm trừ). Trạng thái: **Nháp · Chưa thu · Thu một phần · Đã thu
· Quá hạn · Đã huỷ**; "Quá hạn" và "Thu một phần" được suy từ hạn thu và các Thanh toán, không lưu.
Một **Đợt hoá đơn** (`BatchInvoice`) lập nhiều Hoá đơn cho một Toà nhà trong một Kỳ, từ màn Kỳ, và
chỉ lập được cho Phòng đã có đủ Chỉ số điện và nước của Kỳ, không còn bất thường chưa duyệt; lập
xong, các Chỉ số đó chuyển Đã chốt.
_Avoid_: bill (dành cho Hoá đơn nhà cung cấp), receipt, phiếu thu, invoice theo Phòng (Hoá đơn thuộc Hợp đồng)

**Thanh toán** (`Payment`):
Một lần Người thuê trả tiền cho một Hoá đơn — ngày, số tiền, kênh (VietQR, tiền mặt, chuyển
khoản). Là **bản ghi**; việc tạo ra nó là Thu tiền. Trạng thái Hoá đơn đi theo tổng các Thanh toán.
_Avoid_: giao dịch, payment request (khái niệm của backend), sửa tay trạng thái Hoá đơn

**Thu tiền**:
Việc chủ nhà ghi nhận một Thanh toán cho một Hoá đơn còn phải thu — từ Hôm nay, từ chi tiết Hoá
đơn, hay ngay sau khi Người thuê quét VietQR ("Đã nhận"). Số tiền mặc định là phần còn lại. Ô
"Thu tiền" trên thanh điều hướng mobile là danh sách Hoá đơn còn phải thu, sắp theo hạn.
_Avoid_: thanh toán (đó là bản ghi kết quả), thu nợ, collect

**Chỉ số điện nước** (`Utility`):
Bản ghi chỉ số công tơ của một Phòng trong một Kỳ — chỉ số cũ, chỉ số mới, tiêu thụ — cho một
`UtilityType` (điện hoặc nước). Hai trạng thái: **Nháp** (đã gõ, sửa được) → **Đã chốt** (khi Hoá
đơn của Kỳ được lập từ nó). "Bất thường" là **cờ suy ra** (tiêu thụ lệch lớn so với Kỳ trước), không
phải trạng thái; chủ nhà duyệt riêng từng đồng hồ. Trong code giữ tên `Utility` của prototype.
Chỉ số được nhập trên màn Kỳ, không còn màn "nhập chỉ số" riêng.
_Avoid_: utility theo nghĩa dịch vụ/tiện ích (đó là `UtilityType`), meter reading, UtilityIndex, tiện ích, đã xác minh/đã xác nhận (trạng thái cũ, nay là Đã chốt)

**Kỳ**:
Một tháng của một Toà nhà — đơn vị của chuỗi việc hằng tháng **chốt chỉ số → lập Đợt hoá đơn → Thu
tiền**. Màn Kỳ là nơi cả chuỗi diễn ra cho một Toà nhà: chỉ số của từng Phòng (Nháp điền sẵn), tiền
điện/nước tính tại chỗ theo Bảng giá, và nút lập Hoá đơn cho các Phòng đủ điều kiện. Chốt được từ cuối tháng của Kỳ; hạn thu là Ngày thu của tháng sau. Kỳ viết `MM/YYYY` trên màn
hình.
_Avoid_: billing cycle, chu kỳ, tháng hoá đơn, `YYYY-MM` trên màn hình (chỉ trong URL/dữ liệu)

**Ngày thu**:
Ngày trong tháng, đặt trên Toà nhà, là **hạn thu** của Hoá đơn Kỳ trước — Hoá đơn Kỳ 09 có hạn là
Ngày thu của tháng 10. Là ngày duy nhất Toà nhà cài; ngày **chốt** chỉ số không cài, luôn là cuối
tháng của Kỳ (màn Kỳ nhận Nháp sớm hơn, nhưng chỉ lập Hoá đơn từ ngày đó). Hợp đồng không có ngày
thu riêng.
_Avoid_: ngày chốt điện nước, chu kỳ thu, ngày thu của Hợp đồng (đã bỏ ở round 3)

**Bảng giá**:
Đơn giá của một Toà nhà dùng khi lập Hoá đơn: điện (đ/kWh), nước (đ/m³), và các dịch vụ cố định
(rác, internet, gửi xe…). Giá phẳng do chủ nhà đặt; Portal cảnh báo khi giá điện vượt trần pháp
luật cho người thuê.
_Avoid_: giá điện bậc thang (mô hình đã bỏ ở pha 2), biểu giá EVN, tiered pricing

**Tài khoản nhận tiền**:
Tài khoản ngân hàng của một Toà nhà (ngân hàng, số tài khoản, tên) mà mã VietQR trên Hoá đơn trỏ
tới. Chưa có thì Hoá đơn không có mã QR.
_Avoid_: ví, cổng thanh toán

**Hoá đơn nhà cung cấp** (`SupplierBill`):
Khoản Portal phải trả cho nhà cung cấp điện, nước, rác, internet của một Toà nhà trong một kỳ.
Là chi phí đầu vào, khác Hoá đơn (thu của Người thuê).
_Avoid_: invoice, bill (không định ngữ), hoá đơn điện nước (dễ lẫn với Chỉ số điện nước)

**Chi phí** (`Expense`):
Khoản chi vận hành khác của một Toà nhà ngoài Hoá đơn nhà cung cấp (sửa chữa, mua sắm…).
_Avoid_: cost, khoản chi

**Đối soát** (`Reconciliation`):
Bảng thu – chi theo dòng của một Toà nhà trong một kỳ, cho ra lãi/lỗ và biên: thu từ các dòng Hoá
đơn, chi từ Hoá đơn nhà cung cấp và Chi phí. **Luôn được tính ra**, không nhập tay và không lưu.
_Avoid_: báo cáo (đó là Báo cáo), P&L, cân đối, gain/loss lưu sẵn

**Khai báo lưu trú** (`Compliance`):
Hai nghĩa vụ pháp lý gắn với một Người thuê: **Thông báo lưu trú** (chủ nhà làm khi Người thuê
vào ở — chưa gửi / đã gửi, có mã hồ sơ) và **Đăng ký tạm trú** (Người thuê làm khi ở từ 30 ngày,
có hạn). Portal chỉ theo dõi và trỏ ra cổng dịch vụ công; không sinh hồ sơ. Tên slice là
`compliance`.
_Avoid_: tuân thủ (chung chung), đăng ký tạm trú dùng cho cả hai, kiểm tra an toàn / giấy tờ (nghĩa
vụ của cơ sở, không thuộc mục này)

**Việc cần làm** (`Task`):
Một mục **suy ra từ dữ liệu** — Hoá đơn quá hạn, Hợp đồng sắp hết hạn, Chỉ số điện nước bất
thường, Thông báo lưu trú chưa gửi, Đăng ký tạm trú sắp hết hạn, kỳ chưa lập Đợt hoá đơn — trỏ về
đúng một Hoá đơn / Hợp đồng / Phòng / Người thuê và mang hành động làm ngay. Không có việc nhập tay.
Các Hoá đơn quá hạn của cùng một Toà nhà **gộp thành một mục** (tổng tiền, nhắc tất cả, mở rộng
từng Hoá đơn); các loại khác một mục một việc. Sắp theo hạn, không theo loại. Sống ở Hôm nay và ở
chuông — không có màn riêng.
_Avoid_: todo, reminder, nhắc việc, trung tâm việc, `/tasks` (đã bỏ ở round 3), task bảo trì (không có trong Portal)

**Hôm nay**:
Màn đầu tiên sau đăng nhập — ba con số của Building scope (còn phải thu, Hợp đồng sắp hết hạn,
Chỉ số của Kỳ) và danh sách Việc cần làm của ngày, rồi hai bảng số "Tháng này" và "Vừa xong". Là
hàng đợi việc, không phải bảng thống kê; biểu đồ thuộc Báo cáo.
_Avoid_: dashboard, tổng quan, trang chủ
