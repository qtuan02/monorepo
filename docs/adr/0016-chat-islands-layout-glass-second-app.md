---
status: accepted
date: 2026-09-19
---

# `apps/chat` mang hình dạng "Islands" — app thứ hai dùng ngôn ngữ kính, khác Prism ở chỗ đó là một bố cục

`apps/chat` pha 1 (spec #195) port 1:1 giao diện của `chat-socket-fe`: header phẳng + một link chữ, bubble tự vẽ với giờ 10px trên mỗi tin, không ô tìm, không bottom nav, `.dark` viết đủ nhưng không có gì bật. Bước design 2026-09-19 (`docs/design/chat-redesign.md`) đưa ba hướng "đổi token, giữ hình" và bị từ chối ("bình thường quá"); vòng 2 đưa ba hướng có ý tưởng thị giác riêng, chủ repo chọn **D — Islands**.

Repo đã có một app dùng kính: `apps/documents` "Prism" (ADR-0009) — glass panel trên một aurora backdrop. Người đọc sau sẽ hỏi vì sao chat không "dùng lại Prism", và vì sao lại override palette ở tầng app lần thứ năm (ADR-0008, 0009, 0011, chat pha 1).

## Quyết định

1. **Islands là một bố cục, không phải một theme kính.** Mọi vùng nội dung — Rail, danh sách hội thoại, khung tin nhắn, chi tiết, Bottom nav — là một *Island*: bo 22px, `bg-card/75`, nổi trên một nền gradient tĩnh ba màu viết ở `body`, cách nhau một khe (12px desktop, 8px mobile), **không Island nào chạm mép cửa sổ**. Prism là *một trang* có backdrop kính phía sau; Islands là *nhiều đảo* mà nền là chính app. Hai app không chia sẻ CSS vì hai thứ đó không cùng một shape, không phải vì thiếu chỗ đặt chung.
2. **Không `backdrop-filter` ở đâu cả.** Gradient tĩnh không có cạnh để blur làm mờ; độ trong 75% trên gradient mượt đủ đọc là kính. Hai Island lớn nhất mang Virtuoso cuộn liên tục, và `styles#3` (Glassmorphism) ghi rõ *performance-limited*. Đây là điểm khác Prism có chủ đích: Prism blur, Islands không.
3. **Hai vai màu, không thêm token.** Teal (`--primary`, giữ từ pha 1) nói *làm gì*: New, Send, tin của mình (gradient teal có bóng màu). Mực gần đen (`--foreground`) nói *đang ở đâu*: mục Rail active, chip lọc đang chọn, nút "N new messages". Chấm/vòng Presence giữ `--online`.
4. **Override ở tầng app, cùng cơ chế bốn app trước**: khối `:root`/`.dark` unlayered trong `src/globals.css`, đứng ngoài mọi `@layer` nên thắng `theme.css` mà không `!important`. Light ship trước cùng theme toggle (mặc định theo hệ thống, Dark khoá cho tới khi ticket `.dark` xong); `.dark` của Islands — đảo tối trên gradient tối, không phải đảo màu — là ticket cuối của cùng spec, vì `test/globals.test.ts` kiểm parity `:root`/`.dark` và một theme cũ nửa vời không được ở lại.
5. **Không thêm dependency.** Mọi thứ Islands cần đã có trong `@monorepo/ui`: `Item`, `Bubble`/`Message`, `InputGroup`, `Empty`, `Command`, `ToggleGroup`, `Tabs`, `Tooltip`, `Sheet`. Rail là `<nav>` thuần + `Tooltip`, không phải `Sidebar` primitive (mobile của nó là Sheet, Islands cần Bottom nav). Danh sách tin giữ `react-virtuoso`; `MessageScroller` của `@monorepo/ui` không ảo hoá nên không thay.

## Lựa chọn đã cân nhắc

- **Dùng lại Prism** (glass panel + aurora của documents): cùng ngôn ngữ, nhưng Prism là site đọc — một trang, một cột — còn chat là ba-bốn vùng sống cùng lúc. Bê backdrop Prism sang là "Prism thêm lần nữa" trên một bố cục nó không được nghĩ cho.
- **Ba hướng vòng 1** (Swiss phẳng / Soft tinted / kính toàn màn): bị từ chối vì chỉ đổi token — cùng lỗi `documents-redesign.md` §2.0 và `portfolio-redesign-v2.md` §1.2 đã ghi.
- **E Ledger** (giấy-mực, serif) và **F Midnight** (dark-first, glow): rẻ hơn D (không gradient, không làm lại `.dark` từ đầu / `.dark` là mặc định), khác biệt tương đương; chủ repo chọn D bằng mắt trên mockup. Ghi lại vì nếu perf mobile của gradient + độ trong làm khó, F là đường lui gần nhất — nó dùng đúng bộ `.dark` hiện có.

## Hệ quả

- `apps/chat/src/globals.css` thêm gradient nền, token đảo (`--card`/`--popover` 75%, `--radius` riêng cho đảo bằng class, primitive giữ `0.625rem`), và `.dark` viết lại; `test/globals.test.ts` mở rộng danh sách override, không nới contrast.
- Glossary `apps/chat/CONTEXT.md` có thêm Islands · Island · Rail · Bottom nav; README § Hình dạng ghi lại shape sau khi ship.
- Từ `md` đến `lg` chỉ có ba Island (Details là Sheet); dưới `md` một Island + Bottom nav, và Bottom nav ẩn khi đang trong một Conversation.
- Đường lui: bỏ gradient + độ trong về `bg-card` đặc là một diff CSS; bố cục đảo, Rail và Bottom nav vẫn đứng.
