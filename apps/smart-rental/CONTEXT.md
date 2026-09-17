# `apps/smart-rental` — glossary

Context của app `smart-rental` (Runtime Vite): portal quản lý phòng trọ cho chủ nhà, port từ
prototype `D:\Personal\smart-rental\frontend` (`fe-motel-rsbuild`). Thuật ngữ dùng chung của repo
(Runtime, Flavor, Template app, Gate) ở [`CONTEXT.md`](../../CONTEXT.md) gốc; file này chỉ ghi từ
vựng riêng của app, chốt lần đầu ở vòng grill 2026-09-16, sửa ở vòng grill pha 2 (redesign) 2026-09-17.

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
Toà nhà; lập Đợt hoá đơn và nhập chỉ số đòi đúng một Toà nhà.
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
Một **Đợt hoá đơn** (`BatchInvoice`) lập nhiều Hoá đơn cho một Toà nhà trong một kỳ, và chỉ lập
được cho Phòng đã có Chỉ số điện nước xác nhận của kỳ đó.
_Avoid_: bill (dành cho Hoá đơn nhà cung cấp), receipt, phiếu thu, invoice theo Phòng (Hoá đơn thuộc Hợp đồng)

**Thanh toán** (`Payment`):
Một lần Người thuê trả tiền cho một Hoá đơn — ngày, số tiền, kênh (VietQR, tiền mặt, chuyển
khoản). Chủ nhà ghi nhận tay; trạng thái Hoá đơn đi theo tổng các Thanh toán.
_Avoid_: giao dịch, payment request (khái niệm của backend), sửa tay trạng thái Hoá đơn

**Chỉ số điện nước** (`Utility`):
Bản ghi chỉ số công tơ của một Phòng trong một kỳ — chỉ số cũ, chỉ số mới, tiêu thụ — cho một
`UtilityType` (điện hoặc nước). Trong code giữ tên `Utility` của prototype; **nhập chỉ số**
(`MeterInput`) là màn hình ghi nhiều bản ghi cùng lúc, và đứng **trước** Đợt hoá đơn trong flow.
_Avoid_: utility theo nghĩa dịch vụ/tiện ích (đó là `UtilityType`), meter reading, UtilityIndex, tiện ích

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
thường, Thông báo lưu trú chưa gửi, kỳ chưa lập Đợt hoá đơn — trỏ về đúng một Hoá đơn / Hợp đồng /
Phòng / Người thuê và mang hành động làm ngay. Không có việc nhập tay.
_Avoid_: todo, reminder, nhắc việc, trung tâm việc, task bảo trì (không có trong Portal)

**Hôm nay**:
Màn đầu tiên sau đăng nhập — các con số cần nhìn của Building scope và danh sách Việc cần làm của
ngày. Là hàng đợi việc, không phải bảng thống kê.
_Avoid_: dashboard, tổng quan, trang chủ
