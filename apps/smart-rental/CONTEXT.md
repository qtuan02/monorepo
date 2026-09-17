# `apps/smart-rental` — glossary

Context của app `smart-rental` (Runtime Vite): portal quản lý phòng trọ cho chủ nhà, port từ
prototype `D:\Personal\smart-rental\frontend` (`fe-motel-rsbuild`). Thuật ngữ dùng chung của repo
(Runtime, Flavor, Template app, Gate) ở [`CONTEXT.md`](../../CONTEXT.md) gốc; file này chỉ ghi từ
vựng riêng của app, chốt lần đầu ở vòng grill 2026-09-16.

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
Toà nhà đang được chọn cho toàn Portal — mọi danh sách lọc theo nó — giữ trong một store app-wide
và bền qua reload. `null` nghĩa là mọi Toà nhà.
_Avoid_: current building, selected building, bộ lọc toà nhà (nó không phải một filter của bảng)

**Phòng** (`Room`):
Đơn vị cho thuê trong một Toà nhà, có trạng thái `available | occupied | maintenance | reserved`.
_Avoid_: unit, căn

**Người thuê** (`Tenant`):
Người ký Hợp đồng thuê một Phòng. Trạng thái là của quan hệ thuê, không phải của con người.
_Avoid_: khách, khách thuê, resident, user (đó là chủ nhà đăng nhập)

**Hợp đồng** (`Contract`):
Thoả thuận thuê giữa một Người thuê và một Phòng, có vòng đời tạo → gia hạn → thanh lý.
_Avoid_: lease, agreement

**Gia hạn** / **Thanh lý**:
Hai bước duy nhất của vòng đời Hợp đồng sau khi tạo — gia hạn kéo dài ngày kết thúc, thanh lý
kết thúc và quyết toán cọc. Cả hai là màn hình riêng dưới một Hợp đồng.
_Avoid_: renew/terminate lẫn với extend/cancel, huỷ (không có huỷ Hợp đồng)

**Hoá đơn** (`Invoice`):
Khoản Portal thu của Người thuê theo tháng cho một Phòng, thanh toán qua VietQR. Một **Đợt hoá
đơn** (`BatchInvoice`) lập nhiều Hoá đơn cho một tháng cùng lúc.
_Avoid_: bill (dành cho Hoá đơn nhà cung cấp), receipt, phiếu thu

**Chỉ số điện nước** (`Utility`):
Bản ghi chỉ số công tơ của một Phòng trong một tháng — chỉ số cũ, chỉ số mới, tiêu thụ — cho
một `UtilityType` (điện hoặc nước). Trong code pha 1 giữ tên `Utility` của prototype; **nhập chỉ
số** (`MeterInput`) là màn hình ghi nhiều bản ghi cùng lúc.
_Avoid_: utility theo nghĩa dịch vụ/tiện ích (đó là `UtilityType`), meter reading, UtilityIndex
(tên trong tài liệu thiết kế v1, chưa dùng trong code), tiện ích

**Hoá đơn nhà cung cấp** (`SupplierBill`):
Khoản Portal phải trả cho nhà cung cấp điện, nước, rác, internet của một Toà nhà trong một kỳ.
Là chi phí đầu vào, khác Hoá đơn (thu của Người thuê).
_Avoid_: invoice, bill (không định ngữ), hoá đơn điện nước (dễ lẫn với Chỉ số điện nước)

**Chi phí** (`Expense`):
Khoản chi vận hành khác của một Toà nhà ngoài Hoá đơn nhà cung cấp (sửa chữa, mua sắm…).
_Avoid_: cost, khoản chi

**Đối soát** (`Reconciliation`):
Bảng thu – chi theo dòng của một Toà nhà, cho ra lãi/lỗ; đọc từ Hoá đơn, Hoá đơn nhà cung cấp và
Chi phí, không nhập tay. Pha 1 (#140) chưa có phép join đó: các dòng Đối soát là Mock riêng, đúng
như prototype; bốn số tổng (thu, chi, lãi/lỗ, biên lợi nhuận) tính từ các dòng đang hiển thị.
_Avoid_: báo cáo (đó là Báo cáo), P&L, cân đối

**Khai báo lưu trú** (`Compliance`):
Nghĩa vụ pháp lý gắn với một Người thuê (khai báo tạm trú, kiểm tra an toàn, giấy tờ) có hạn và
trạng thái hoàn thành. Tên slice là `compliance`.
_Avoid_: tuân thủ (chung chung), đăng ký tạm trú (chỉ một loại trong ba)

**Việc cần làm** (`Task`):
Một mục sinh ra từ dữ liệu — Hoá đơn quá hạn, Hợp đồng sắp hết, bảo trì — gom vào **Trung tâm
việc** (`TaskCenter`); trỏ về đúng một Hoá đơn/Hợp đồng/Phòng/Người thuê.
_Avoid_: todo, reminder, nhắc việc

**Giá điện bậc thang**:
Cấu hình giá điện theo bậc tiêu thụ (khuôn EVN) trong Cài đặt, dùng khi lập Hoá đơn từ Chỉ số
điện nước.
_Avoid_: tiered pricing, biểu giá
