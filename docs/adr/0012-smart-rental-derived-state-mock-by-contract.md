---
status: accepted
date: 2026-09-17
---

# `apps/smart-rental` — trạng thái dẫn xuất được tính, không lưu; Mock viết theo contract của `be-motel`

Pha 1 giữ Mock của prototype nguyên trạng: 15 mảng rời tham chiếu nhau bằng tên, `Invoice.status = "overdue"` và `Contract.status = "ending"` lưu sẵn, Việc cần làm / Đối soát / Báo cáo / Dashboard là bốn Mock riêng không suy từ gì (research §A.8). Backend `be-motel` mới có một controller, nhưng `document/fe-api-integration/*.md` đã đặt tên enum và bảng cho mọi entity.

Quyết định, chốt ở vòng grill 2026-09-17: (1) **Mock được viết lại một lần theo contract đó** — tham chiếu bằng id, enum `DRAFT/ACTIVE/EXPIRING/EXPIRED/TERMINATED` + `deposit_status` cho Hợp đồng, `DRAFT/UNPAID/PARTIAL/PAID/OVERDUE/CANCELLED` cho Hoá đơn, một kiểu kỳ `YYYY-MM`, ngày ISO; ba Toà nhà (6/8/4 Phòng), sáu kỳ Hoá đơn 04–09/2026, hai kỳ Chỉ số. (2) **Mọi trạng thái suy được thì không lưu**: `OVERDUE` và `PARTIAL` từ hạn thu và các Thanh toán, `EXPIRING` từ ngày kết thúc (30 ngày), "bất thường" từ tiêu thụ so kỳ trước, trạng thái Người thuê từ Hợp đồng, Việc cần làm từ năm nguồn, Đối soát/Báo cáo/KPI từ Hoá đơn + Hoá đơn nhà cung cấp + Chi phí. Phép suy là **hàm thuần trong `~/utils`**, có test, gọi từ `queryFn` của hook — khi backend làm thật, chỉ lời gọi trong `queryFn` biến mất. (3) Ghi lên Mock là in-memory, mất khi reload.

## Considered Options

- **Giữ Mock rời, redesign chỉ đổi vỏ**: rẻ nhất — nhưng Tổng quan/Việc cần làm/Đối soát tiếp tục là ảnh, và mọi màn vẽ trên một entity model sẽ phải vẽ lại lần nữa khi nối backend. Lần đổi tên trạng thái thứ ba là thứ ADR này tồn tại để tránh.
- **Lưu trạng thái dẫn xuất kèm một "job" cập nhật**: giống backend thật hơn — nhưng ở FE không có job, và một trạng thái lưu sẵn là một trạng thái sai vào ngày mai (Hoá đơn hạn 05/09 không tự thành quá hạn).
- **Tính trong component (`useMemo`)**: gần nơi hiển thị — nhưng không test được nếu không render, và cùng một phép suy sẽ được viết ở Hôm nay, ở danh sách và ở chi tiết.
- **Persist ghi vào localStorage**: thao tác giữ qua reload — nhưng cần nút reset, và làm test khó reset hơn; thêm khi cần demo dài.

## Consequences

- `~/constants/mock/*.ts` thay toàn bộ; `mockReconciliation`, `mockReports`, `mockTasks`, `mockDashboard*` bị xoá. `~/types/*` đổi theo enum contract; `~/constants/status.ts` là một home cho `StatusConfig` mới.
- Glossary `apps/smart-rental/CONTEXT.md` đã sửa cùng ngày: Người thuê không có trạng thái, Cọc, Thanh toán, Bảng giá, Tài khoản nhận tiền, Việc cần làm suy ra, Hôm nay.
- Ticket đầu tiên của pha 2 là Mock này; mọi ticket UI đứng sau nó.
