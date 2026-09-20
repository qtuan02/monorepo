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

### Hình dạng màn hình — "Islands" (chốt ở vòng grill 2026-09-19)

**Islands**:
Tên hình dạng thị giác của app từ redesign 2026-09-19: mọi vùng nội dung là một Island nổi trên một nền gradient tĩnh của app, không vùng nào chạm mép cửa sổ. Khác "Prism" của `apps/documents` ở chỗ đây là một *bố cục* (các đảo tách rời nhau) chứ không phải một backdrop sau trang.
_Avoid_: Prism, glass theme, aurora (tên nền, không phải tên hình dạng)

**Island**:
Một vùng nội dung tự đứng — danh sách hội thoại, khung tin nhắn, chi tiết, thanh điều hướng — bo góc lớn, hơi trong, nổi trên nền gradient và cách các Island khác một khe. Một màn có nhiều Island; một Island không lồng Island khác.
_Avoid_: panel, card (tên primitive), cột, khung

**Rail**:
Island điều hướng dọc, hẹp, bên trái màn desktop: ba đích Chats · Friends · Profile, nút đổi theme và ảnh đại diện của mình. Chỉ tồn tại từ `md` trở lên; dưới đó vai của nó do Bottom nav đảm nhận.
_Avoid_: sidebar (là primitive của `@monorepo/ui`, không dùng ở đây), menu trái

**Bottom nav**:
Island điều hướng nằm ngang ở đáy màn mobile với ba đích Chats · Friends · Me; ẩn khi đang trong một Conversation vì composer chiếm đáy. Là bản mobile của Rail, không phải một menu.
_Avoid_: tab bar, menu dưới, footer

**Island fallback** (chốt ở vòng grill 2026-09-20):
Nội dung tạm của một Island khi phần bên trong nó không vẽ lên được (lỗi lúc render, không phải backend trả lỗi): Island vẫn đứng nguyên chỗ, các Island khác trên màn không đổi, và có đúng một nút thử lại làm Island đó tải lại dữ liệu của riêng nó. Khác **Health gate** (chặn toàn app trước khi có Island nào) và khác nhánh "không tải được" của một truy vấn (backend từ chối, Island vẫn vẽ bình thường và tự nói điều đó).
_Avoid_: error state (gộp với nhánh truy vấn lỗi), crash screen, 500, error boundary (tên cơ chế, không phải tên trạng thái)

### Nội dung tin nhắn — theo contract BE 2026-09-20 (chốt ở vòng grill 2026-09-20)

**Attachment**:
Một tệp đi kèm một tin nhắn — đúng một tệp mỗi tin, tải lên trước rồi tin mới được gửi kèm địa chỉ của nó. Tin có Attachment là **ảnh** (hiện ngay trong khung) hoặc **tệp** (chỉ có thể tải về), do loại nội dung của tệp quyết định; tin không có Attachment là tin chữ. Một tin có thể vừa có chữ vừa có Attachment.
_Avoid_: file (mơ hồ với loại `FILE`), media, upload (tên thao tác, không phải tên vật)

**Typing**:
Dấu hiệu một người khác đang gõ trong Conversation đang mở, sống vài giây rồi tự tắt nếu không có tín hiệu mới; chỉ hiện trong khung tin nhắn, không hiện ở danh sách. Là trạng thái tức thời như **Presence**, không phải thứ lưu ở backend.
_Avoid_: typing indicator (tên UI), composing, is-writing

**Sửa tin**:
Người gửi đổi chữ của một tin chữ đã gửi; tin giữ nguyên chỗ và mọi người thấy chữ mới kèm dấu "đã sửa". Chỉ tin chữ sửa được; tin có Attachment thì không.
_Avoid_: edit message (tên nút), update, chỉnh sửa (dài hơn không rõ hơn)

**Xoá tin**:
Người gửi rút một tin đã gửi: tin không còn tồn tại với mọi người và không để lại dấu vết — không có "tin đã bị thu hồi". Không hoàn tác được, nên luôn hỏi lại trước khi xoá.
_Avoid_: thu hồi (ngụ ý có bia mộ), unsend, remove
