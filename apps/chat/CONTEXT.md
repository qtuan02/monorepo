# `apps/chat` — glossary

Context của app `chat` (Runtime Vite): app nhắn tin real-time kiểu Messenger, port từ
`D:\Personal\chat\chat-socket-fe` (Rsbuild + STOMP) và nối backend `chat-socket` (Spring Boot, REST +
STOMP trên cùng port). Thuật ngữ dùng chung của repo (Runtime, Flavor, Template app, Gate) ở
[`CONTEXT.md`](../../CONTEXT.md) gốc; file này chỉ ghi từ vựng riêng của app, chốt lần đầu ở vòng
grill 2026-09-18 — trước khi `gen:app` chạy, nên thư mục chưa có `package.json` cho tới ticket đầu.

## Language

### Phiên và kết nối

**Session**:
Trạng thái đã đăng nhập của app này: một access token ngắn hạn chỉ sống trong store (không persist),
đi kèm một refresh cookie `HttpOnly` do backend giữ; lúc boot app hỏi backend đổi cookie lấy token mới
rồi mới quyết cho vào hay đưa về đăng nhập. Là hình thứ ba trong repo, khác token persist của Template
Vite và khác cookie session của hai Runtime SSR (ADR-0007).
_Avoid_: token (chỉ là một nửa), login state, auth (tên slice)

**Health gate**:
Màn chờ chặn toàn bộ UI cho tới khi backend trả lời kiểm tra sức khoẻ; app không render gì khác trước
đó. Không có tiền lệ ở app nào khác trong repo.
_Avoid_: splash, loading screen, connecting overlay

**Presence** (`online`):
Tập user đang online, nhận qua socket lúc kết nối và cập nhật khi ai đó vào/ra; là trạng thái tức thời
của kết nối, không phải thuộc tính lưu ở backend của user.
_Avoid_: status (mơ hồ với `MessageStatus`), active, last seen

### Trò chuyện

**Conversation**:
Một luồng tin nhắn giữa hai user (**direct**) hoặc nhiều user có role (**group**, có chủ nhóm và thành
viên). Cùng một loại dữ liệu, khác `type`.
_Avoid_: chat (tên app), thread, room, channel

**Draft conversation**:
Conversation direct chưa tồn tại ở backend, mở từ danh sách bạn bè để nhắn cho một người lần đầu; trở
thành Conversation thật khi tin nhắn đầu tiên được gửi. Chỉ sống trong router state của phiên.
_Avoid_: pending conversation, temp chat, new chat (tên nút)

**Friend request**:
Lời mời kết bạn một chiều với vòng đời gửi → chấp nhận / từ chối / thu hồi; hai user là **bạn** khi lời
mời được chấp nhận, và huỷ kết bạn là thao tác riêng, không phải "từ chối".
_Avoid_: invitation, connection, follow
