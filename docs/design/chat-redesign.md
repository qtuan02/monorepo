# Design brief — redesign UI/UX `apps/chat`

> **Spec [#232](https://github.com/qtuan02/monorepo/issues/232)** (hướng D Islands, 2026-09-19). Tài liệu này là bản ghi *tại thời điểm quyết*; hình dạng app sau khi ship đọc ở README của app.

> Bản ghi *tại thời điểm quyết* của bước design, đứng trước grill. Hình dạng app sau khi ship đọc ở [`apps/chat/README.md`](../../apps/chat/README.md), không phải ở đây.

- **Ngày:** 2026-09-19
- **Bước:** design, chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`, không `--persist`. Không dùng `colors.csv`/`typography.csv`: app đã có palette (teal port từ `chat-socket-fe`, override ở tầng app) và câu hỏi *có đổi palette không* để ở §9, không tự quyết.
- **Đầu vào:** code `apps/chat` tại `bb44c1a` (spec #195 pha 1, "port 1:1, không redesign"), [`apps/chat/CONTEXT.md`](../../apps/chat/CONTEXT.md) (Session, Health gate, Presence, Conversation, Draft conversation, Friend request), `packages/ui/src/components/*`, `tooling/tailwind/theme.css`, `apps/chat/test/**` + `e2e/auth.e2e.ts` (những gì đang được pin).
- **Đầu ra:** tài liệu này + hai mockup HTML tĩnh trong [`chat-redesign/`](./chat-redesign/): vòng 1 [`mockup-v1-ba-huong.html`](./chat-redesign/mockup-v1-ba-huong.html) (A/B/C, **bị từ chối** — §2.0) và vòng 2 [`mockup-v2-ba-huong-manh.html`](./chat-redesign/mockup-v2-ba-huong-manh.html) (D/E/F, §2b). Mỗi hướng một khung desktop 1180×720 + một khung phone 360; inline CSS, không script, không font ngoài — mở bằng trình duyệt.
- **Cách đọc trích dẫn:** `products#NN`, `styles#NN`, `ui-reasoning#NN`, `ux#NN`, `shadcn#NN` = hàng `No=NN` trong file cùng tên dưới `.agents/skills/ui-ux-pro-max/data/` (`ux` = `ux-guidelines.csv`, `shadcn` = `stacks/shadcn.csv`). Grep bằng `^NN,`.

---

## 1. Chẩn đoán — vì sao app trông "chưa được design"

Tất cả là **FACT** đọc từ code. Xếp theo tác động. Điểm chung: pha 1 port đúng *hành vi* của nguồn, và nguồn vốn chưa có bước design.

### 1.1 `@monorepo/ui` đã có sẵn một bộ primitive cho chat — app không dùng cái nào

`packages/ui/src/components/` có `bubble.tsx` (`Bubble`/`BubbleContent`/`BubbleGroup`, 7 variant kể cả `tinted`), `message.tsx` (`Message`/`MessageGroup`/`MessageAvatar`/`MessageHeader`/`MessageFooter`, `align="end"` cho tin của mình), `message-scroller.tsx` (stick-to-bottom + `MessageScrollerButton` "jump to latest"), `empty.tsx`, `item.tsx` (hàng media + title + description + actions), `input-group.tsx` (`InputGroupTextarea` + addon/button), `command.tsx`, `spinner.tsx`. Cả bảy đều có story trong `apps/storybook`. `grep -rn 'bubble\|message-scroller\|components/empty\|components/item\|input-group' apps/chat/src` → **0 kết quả**. `message-bubble.tsx` tự vẽ bubble bằng `rounded-2xl px-3 py-2`, `message-composer.tsx` ghép `Textarea rounded-3xl` + hai `Button` rời. Đây là điều rẻ nhất và lớn nhất của cả redesign: **đổi sang primitive có sẵn**, không thêm dependency (`shadcn#55`).

### 1.2 Pane tin nhắn: mỗi bubble in giờ riêng ở 10px, không group theo người gửi

`message-bubble.tsx`: mọi bubble có một dòng `text-[10px] text-right` giờ gửi. `message-row.tsx`: tên người gửi hiện khi đổi người, nhưng radius bubble giống hệt nhau, không avatar, không "đuôi" nhóm — ba tin liên tiếp của một người là ba viên thuốc rời nhau, mỗi viên một giờ. `products#92` (Chat & Messaging): *"Bubble UI (left/right alignment)… Read receipts… Group avatars"*; `ui-reasoning#92` anti-pattern *"Excessive decoration"* — ba mươi con số 10px trên một màn là decoration. Quick Reference §6: *"Text < 12px body"* là anti-pattern.

`message-list.tsx` (Virtuoso, `followOutput="auto"`): khi người dùng đang cuộn lên đọc cũ và tin mới đến, **không có gì báo** — không nút "N tin mới ↓". `MessageScrollerButton` tồn tại cho đúng việc này (§9.3 bàn Virtuoso vs MessageScroller).

Header pane: `<h1 class="text-sm">` cho tiêu đề cuộc trò chuyện — tiêu đề màn là 14px, bằng cỡ tin nhắn. Presence chỉ là **chấm** trên avatar (`ConversationAvatar online`), không chữ "Active now" — `ux#37`/Quick Reference `color-not-only`.

### 1.3 Shell: header phẳng + một link chữ "Friends"; mobile không có bottom nav

`layout.template.tsx` là một `<header>` với chữ "Chat", link ghost "Friends" và `CurrentUserMenu`. Không trạng thái active (`ux#3`), không lối tới `/profile` ngoài dropdown, không badge số lời mời. README § Shell ghi *"Sidebar (desktop) + bottom nav (mobile)"* — code **không có** bottom nav; trên phone, từ màn chat muốn sang Friends phải Back rồi bấm link chữ ở header. `ux#4` back-behavior, Quick Reference §9 `bottom-nav-limit`/`nav-label-icon`/`adaptive-navigation` (≥1024 sidebar, nhỏ hơn bottom nav).

### 1.4 Danh sách hội thoại không có ô tìm; "New" chỉ tạo group

`conversation-list.tsx`: header "Chats" + một nút icon `Users` = "New group". Không có ô tìm/lọc — người có 40 hội thoại cuộn tay. Muốn nhắn một người mới phải qua `/friends` → nút Message. `products#92` keyword *"inbox"*, Quick Reference §9 `search-accessible`. Mỗi hàng có `border-b` riêng + `hover:bg-accent` + `active bg-accent` cùng một màu — hàng đang mở và hàng đang hover không phân biệt được.

### 1.5 Empty state là một `<p>` xám, không có action

`conversation-panel.tsx`: *"Pick a conversation to begin."* / *"No messages yet."*; `conversation-list.tsx`: *"No conversations to show."*; `friends-list-section.tsx`: *"No friends added yet."* — bốn chỗ, cùng một `<p class="text-muted-foreground text-sm">` giữa khoảng trống, không nút. `ux#79` (Empty States: *"helpful message and action"*), `ux#90`. `Empty`/`EmptyTitle`/`EmptyDescription`/`EmptyContent` có sẵn.

### 1.6 Friends là ba section xếp dọc, không tab, không đếm

`friends.template.tsx`: Find people → Requests → Friends, cùng một cột cuộn `max-w-3xl`. Lời mời đến — việc duy nhất *cần* người dùng làm — nằm ở giữa, không được đếm ở bất kỳ đâu ngoài chính section đó. Quick Reference §9 `tab-badge`.

### 1.7 Touch target 32px ở đúng những nút hay bấm trên phone

`friend-request-row.tsx` Accept/Decline/Cancel và `conversation-panel.tsx` nút ⓘ đều `size="icon-sm"` = `size-8` = **32px**. `ux#22`/`ux#23`: 44pt iOS / 48dp Android, cách nhau ≥8px. Nút Back trong pane là `size="icon"` = 36px.

### 1.8 `.dark` viết đủ nhưng không có gì bật nó; `--font-sans` không ai khai

`globals.css` có khối `.dark` đầy đủ (README § Token/accent, `test/globals.test.ts` kiểm parity) nhưng app **không có** theme toggle, `index.html` không có class → toàn bộ khối là dead CSS. `theme.css` map `--font-sans: var(--font-sans)` vào biến app phải tự khai; `smart-rental`/`documents`/`portfolio` khai, `chat` không — chữ đang chạy trên fallback của preflight, không app nào sở hữu.

### Những chỗ nhỏ hơn, ghi để ticket không bỏ sót

| Chỗ | FACT | Nguồn |
|---|---|---|
| Boot | Health gate ("Connecting…") rồi ngay sau là `RouteGuardLoading` ("Checking session...") — hai màn full-screen spinner nối nhau, khác chữ, khác layout | `ux#10`, `ux#19` content jumping |
| Composer | placeholder `"Aa"`; không gợi ý Enter gửi / Shift+Enter xuống dòng | `ux#62` input affordance |
| Composer | emoji picker `lazy()` ✓ giữ | `shadcn#56` |
| Unread pill | `bg-primary` cùng màu với own bubble và active row — ba nghĩa một màu | `ux#37` |
| Timestamp hàng | `text-xs` không `tabular-nums` — cột giờ nhảy theo chữ số | Quick Reference §6 `number-tabular` |
| Details desktop | cột `w-80` mở bằng ⓘ, không nhớ trạng thái giữa hai hội thoại | giữ, §3.4 |
| `not-found.tsx` | clone Template, chưa xem lại theo shape mới | — |
| a11y ✓ đã đúng | mọi icon button có `aria-label`; `min-h-dvh`; `AlertDialog` cho Unfriend/Leave; `Sheet side="right"` mobile | `ux#40`, `ux#20`, `ux#35`, `shadcn#14`, `shadcn#42` |

---

## 2. Hướng — vòng 1 bị từ chối, vòng 2 đưa ba hướng mạnh

`products#92` Chat & Messaging → **Minimalism & Swiss + Micro-interactions**, phụ **Glassmorphism, Flat**; `ui-reasoning#92`: *"Professional + Clean hierarchy… Subtle hover 200ms"*, anti-pattern *"Excessive decoration"*, quy tắc `if_mobile → optimize-touch-targets`. Mọi hướng dưới đây đều đứng trên lớp nền §3 (rail + list có ô tìm + pane group theo người gửi + composer một khối + details; mobile: bottom nav) và map lên cùng một component map §4.

### 2.0 Vòng 1 — A Inbox / B Soft / C Aurora (2026-09-19, **bị chủ repo từ chối**: *"bình thường quá, design đẹp hơn đi"*)

Mockup [`mockup-v1-ba-huong.html`](./chat-redesign/mockup-v1-ba-huong.html). Ba hướng đọc thẳng từ `products#92` — A phẳng Swiss (`styles#1`), B tinted Soft UI (`styles#19`), C kính mờ (`styles#3`) — và mắc đúng lỗi đã ghi hai lần (`portfolio-redesign-v2.md` §1.2, `documents-redesign.md` §2.0): **đổi token, giữ nguyên hình**. Ba khung nhìn như một app, ba màu nền. Giữ lại từ vòng này: lớp nền §3 (không đổi), và bài học *bubble `tinted` của B đọc dễ hơn teal đặc* — hướng E và F kế thừa ý "tin của mình không cần là màu primary đặc".

### 2b Vòng 2 — mỗi hướng một ý tưởng thị giác

Mockup [`mockup-v2-ba-huong-manh.html`](./chat-redesign/mockup-v2-ba-huong-manh.html). Khác vòng 1 ở chỗ hình dạng, chữ và cách nói trạng thái đổi theo hướng, không chỉ token.

#### Hướng D — Islands (`styles#3` Glassmorphism, bố cục đảo)

**Không panel nào chạm mép.** Rail, list, pane, details là bốn đảo kính bo 22px cách nhau 12px, nổi trên nền gradient tĩnh ba màu (teal · tím · cam) viết ở `body` như documents. Tin của mình gradient teal có bóng màu; hàng đang mở "nhấc" lên thành thẻ trắng có bóng; chip lọc *All · Unread · Groups* (`ToggleGroup`) dưới ô tìm; composer là một đảo nhỏ nổi trên tin. Mobile: một đảo lớn + bottom nav là một đảo pill. Đẹp nhất trên ảnh, thân thiện nhất. **Chi phí:** `backdrop-blur` trên hai list Virtuoso cuộn liên tục (`styles#3` *"performance-limited"*), `.dark` làm lại toàn bộ, và repo đã có một app aurora (`documents`, ADR-0009) — hai app cùng ngôn ngữ kính là câu hỏi §9.1.

#### Hướng E — Ledger (giấy-mực, serif — không có hàng CSV tương ứng, đây là hướng tự đề xuất)

**Không bubble tròn, không gradient, không màu avatar.** Giấy ấm `#f3eee4` kẻ dòng mờ; mực xanh rêu `#123f36` là màu duy nhất (cùng họ teal hiện có, nên `--primary` chỉ tối đi). Tên người, tiêu đề màn dùng **serif** (một `@fontsource-variable`: Fraunces hoặc Newsreader — §9.7); nhãn phụ small caps 11px tracking `.12em`; avatar là **monogram vuông** viền mảnh (`AvatarFallback` đổi class, ảnh thật vẫn hiện nếu có). Tin người khác là thẻ kem có viền, tin của mình là khối mực; ô tìm và composer là một **dòng kẻ** chứ không phải hộp; Presence là chấm xanh lá ở góc monogram; unread là một chấm mực + tên đậm thay vì pill số. Dark mode = giấy than + mực kem, không phải đảo màu. **Rẻ nhất trong ba** (token giấy/mực + một font, không blur, không gradient) và **khác biệt nhất trong repo** (không app nào dùng serif). Rủi ro: cảm giác "biên tập" có hợp một app nhắn tin bạn bè không — chỉ chủ repo trả lời được.

#### Hướng F — Midnight (`styles#7` Dark Mode OLED + `styles#16` Micro-interactions) — **đề xuất**

**Tối là mặc định, teal là nguồn sáng duy nhất, và ánh sáng có nghĩa.** Người đang online có **vòng sáng** quanh avatar (`ring-2 ring-online` + `shadow` màu) thay vì chấm; hàng chưa đọc, mục nav đang mở, nút Send, nút "N new messages" phát sáng cùng một teal; tin của mình gradient teal có bóng màu; pane có một quầng teal mờ ở góc; composer viền gradient mảnh; "Seen" trong group là chồng avatar nhỏ. Glow chỉ ở đúng năm chỗ mang trạng thái — không trang trí (`ui-reasoning#92`). **Vì sao đề xuất:** `.dark` trong `globals.css` đã viết đủ và đang là dead CSS (§1.8) — hướng này biến nó thành mặc định thay vì viết thêm; không blur trên list, không font mới, contrast trên nền tối đo được từng cặp; app nhắn tin dùng nhiều buổi tối; light theme vẫn là nửa kia của toggle (phẳng, gần A) nên không mất ai. Rủi ro: light theme sẽ "bình thường" — chấp nhận, vì nó là chế độ phụ.

---

## 3. Lớp nền dùng chung — bố cục từng màn

### 3.1 Shell — rail 56px (desktop) · bottom nav (mobile)

- **≥ `md`:** rail dọc 56px bên trái: brand mark, ba mục **Chats / Friends / Profile** (icon + `Tooltip` nhãn, `aria-current`, badge đếm: unread tổng · lời mời đến), dưới cùng theme toggle + avatar (mở `CurrentUserMenu` hiện có). `ux#3`, Quick Reference §9 `adaptive-navigation`.
- **< `md`:** bottom nav 3 mục **Chats / Friends / Me** (icon + nhãn, ≤5 — `bottom-nav-limit`), ẩn khi đang trong màn chat (composer chiếm đáy). "Me" = `/profile` + Sign out. Header màn list chỉ còn tiêu đề lớn + nút "New".
- `LayoutTemplate` vẫn là nơi socket connect (không đổi).

### 3.2 Danh sách hội thoại

- Tiêu đề "Chats" 18–22px + một nút **New** (`+`, primary) mở `DropdownMenu`: *New message* (chọn bạn → Draft conversation) · *New group* (dialog hiện có). Nút `Users` riêng bỏ.
- **Ô tìm** ngay dưới tiêu đề: `InputGroup` + icon; lọc client-side trên hội thoại đã tải qua `@monorepo/hook/use-debounce` 300ms (`patterns-debounce-search-input` shape A); "No results for 'x'" + nút xoá (`ux#90`). Tìm server-side là §9.4.
- Hàng = `Item` (`ItemMedia` avatar + Presence, `ItemTitle` tên + giờ `tabular-nums`, `ItemDescription` preview một dòng, `ItemActions` pill chưa đọc) bên trong Virtuoso như hiện tại. Bỏ `border-b` từng hàng; active ≠ hover.
- Preview của tin do mình gửi: `You: …` (cần `lastMessageSenderId` — §9.5).

### 3.3 Pane tin nhắn

- Header 60px: avatar + tên **15px/600** + dòng phụ: *Active now* (Presence, chữ + chấm) hoặc *N members · M online* cho group; phải là ⓘ toggle details (44px trên mobile).
- Tin nhắn qua `MessageGroup` → `Message align`: **group theo người gửi** (cùng người, cách nhau < 5 phút — §9.6 chốt ngưỡng); avatar/tên người gửi **một lần mỗi nhóm** (`MessageAvatar`, `MessageHeader`); bubble trong nhóm bo góc nối (`Bubble` + `BubbleGroup`); **giờ ở `MessageFooter` của tin cuối nhóm**, không phải mỗi bubble. Ngày → pill `Today / Yesterday / Mon / 12/09` sticky (`~/utils/date.ts` đã có format).
- Trạng thái tin của mình ở footer nhóm cuối: *Sending… / Sent / Seen* (§9.5 dữ liệu).
- Nút nổi **"N new messages ↓"** khi đang cuộn lên và tin mới đến; `aria-live="polite"` (`ux#118`). Virtuoso vs `MessageScroller` là §9.3.
- Empty: `Empty` với icon + *"No messages yet"* + *"Say hi to Linh"*. Không chọn gì (desktop): `Empty` + *"Pick a conversation"* + nút **New message**.

### 3.4 Composer

`InputGroup` một khối: `InputGroupButton` emoji (lazy picker giữ) · `InputGroupTextarea` auto-grow tới 5 dòng, placeholder *"Message {name}…"* · `InputGroupButton` Send primary (disabled khi rỗng/pending, `Spinner` khi pending). Dòng hint 11px dưới: `Enter` to send · `Shift+Enter` new line (desktop only). `ux#62`, `ux#32`.

### 3.5 Details

Giữ cấu trúc hiện có (cột 280–320 desktop, `Sheet` mobile). Direct: avatar 72 + tên + `@username` + *Active now* + bio + hai action (View profile · Unfriend). Group: tên + nút rename inline, *Add members · Leave group*, danh sách thành viên là `Item` với `Badge` Owner. Mở/đóng nhớ trong phiên (state ở `ConversationShellTemplate`, không store).

### 3.6 Friends

`Tabs`: **Friends · Requests (badge đếm đến) · Find people**. Requests chia *Received* / *Sent*. Hàng = `Item`; action ≥ 44px trên mobile, Accept là primary, Decline là `outline` (không `destructive` — từ chối không phải xoá; `ux#35` chỉ dành cho Unfriend/Leave, đã có `AlertDialog`). Tab Find giữ ô tìm debounce hiện có + `Empty` "No one found".

### 3.7 Auth · Health gate · Session check

Sign-in/Sign-up: một `Card` giữa màn, brand mark + tên app, form hiện có, link đổi qua lại. Health gate và Session check **cùng một** màn: brand mark + `Spinner` + một dòng ("Connecting…" → "Checking session…") để không nhảy layout (`ux#19`); sau 10s hiện *"Still connecting — the server may be waking up"* (`ux#80`).

### 3.8 Theme

Theme toggle ở rail/menu "Me"; provider = context + `localStorage` một key + class `.dark` trên `<html>` (pattern `apps/documents/src/features/layout`), không store. Biến `.dark` đã có; với F nó thành mặc định (`<html class="dark">` khi chưa có lựa chọn), với D/E phải viết lại theo §5.

---

## 4. Component map — không thêm primitive, không thêm dependency

| Màn/phần | `@monorepo/ui` | `~/components` / slice |
|---|---|---|
| Rail + bottom nav | `Tooltip`, `Badge`, `buttonVariants` trên `Link` | `~/features/layout/components/{nav-rail,bottom-nav}.tsx` (mới), `layout.template.tsx` chọn theo `useIsMobile` |
| Hàng hội thoại / bạn / thành viên | `Item*`, `Avatar`, `Badge` | `ConversationAvatar` giữ; `UserItem`, `FriendRequestRow` viết lại trên `Item` |
| Ô tìm | `InputGroup` + `InputGroupInput` | `conversation-list.tsx`; filter thuần ở `~/features/conversation/utils/filter-conversations.ts` (+ test) |
| Tin nhắn | `MessageGroup`, `Message`, `MessageAvatar`, `MessageHeader`, `MessageFooter`, `BubbleGroup`, `Bubble`, `BubbleContent` | `message-row.tsx`/`message-bubble.tsx` → `message-group.tsx`; nhóm tính trong `~/features/conversation/utils/group-messages.ts` (thuần, có test) |
| Jump to latest | `MessageScrollerButton` **hoặc** nút tự viết trên Virtuoso (`atBottomStateChange`) | §9.3 |
| Composer | `InputGroup`, `InputGroupTextarea`, `InputGroupButton`, `Spinner` | `message-composer.tsx` |
| Empty/no-results | `Empty`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` | `~/components/empty/*.tsx` nếu ≥ 2 slice dùng cùng một cái |
| New menu | `DropdownMenu`, `Dialog` (create group hiện có), `Command` cho picker bạn | `~/features/conversation/components/new-conversation-menu.tsx` |
| Friends tabs | `Tabs`, `Badge` | `friends.template.tsx` |
| Details | `Sheet` (mobile), `Badge`, `AlertDialog` | giữ `conversation-details-panel.tsx`, `group-panel.template.tsx` |
| Theme | — | `~/features/layout/provider/theme-provider.tsx` (copy shape `documents`) |

Không thêm package. `react-virtuoso`, `@stomp/stompjs`, `@emoji-mart/*` giữ.

---

## 5. Token delta (`apps/chat/src/globals.css`, khối unlayered hiện có)

Dùng chung cả ba hướng: khai `--font-sans` (§9.7); giữ `--online` nhưng cho nó việc lớn hơn (vòng sáng ở F, chấm góc ở E); own bubble **không** là `--primary` đặc ở cả ba (bài học vòng 1), nên pill chưa đọc giữ `--primary` mà không trùng nghĩa. Theme toggle (§3.8) là bắt buộc với F, tuỳ chọn với D/E.

| Token / bề mặt | D Islands | E Ledger | F Midnight (dark là mặc định) |
|---|---|---|---|
| `--background` | gradient 3 màu ở `body` (app CSS), token trắng giữ | `oklch(0.95 0.012 85)` giấy ấm + kẻ dòng `repeating-linear-gradient` ở `body` | `.dark` hiện có → `oklch(0.13 0.012 250)` (`#0a0e13`), là default |
| `--card` / `--popover` (đảo · thẻ · panel) | `oklch(1 0 0 / 72%)` + `backdrop-blur-2xl` | `oklch(0.985 0.01 85)` kem, `--border` `oklch(0.87 0.02 85)` | `oklch(0.17 0.012 250)` / `oklch(0.2 0.012 250)`, `--border` `oklch(1 0 0 / 6%)` |
| `--primary` | giữ teal `oklch(0.5 0.14 175)` + gradient trong `className` cho own bubble/Send | **mực** `oklch(0.32 0.06 175)` (cùng hue, tối hơn) | `oklch(0.8 0.15 175)` (`#2dd4bf`) + `--primary-foreground` tối |
| `--sidebar` (nền list) | trong đảo, = `--card` | = `--background` | `oklch(0.17 0.012 250)` |
| `--radius` | `1.375rem` cho đảo (class riêng), primitive giữ `0.625rem` | `0.1875rem` — gần vuông toàn app | `0.75rem` |
| Font | system | + `@fontsource-variable/fraunces` (hoặc newsreader) làm `--font-heading`; body giữ sans | system |
| Presence | chấm (giữ `--online`) | chấm 9px góc trên-phải monogram | `ring-2 ring-online shadow-[0_0_14px_var(--online)]` |
| Glow / shadow | bóng màu dưới own bubble, Send, hàng đang mở (`shadow-*` + màu) | không có bóng nào | glow ở 5 chỗ: ring online, pill unread, nav active, Send, jump |
| `.dark` | làm lại toàn bộ (đảo tối trên gradient tối) | giấy than `oklch(0.2 0.01 85)` + mực kem | **là chính hướng này**; `:root` light = phẳng, gần A vòng 1 |

`test/globals.test.ts` mở rộng danh sách override đúng theo hướng chọn; không nới contrast — E và F đo lại cặp own-bubble/chữ và muted/nền trước khi chốt số.
---

## 6. State list

| Nơi | State |
|---|---|
| Boot | health-check pending · health fail ≥10s (copy phụ) · session check pending · session none → `/sign-in` |
| Rail/nav | active · badge unread · badge requests · offline (socket disconnected — §9.8) |
| List | loading (`ConversationListSkeleton` giữ, khớp `Item`) · empty (`Empty` + New message) · error + Retry · lọc không kết quả · đang tải trang sau (footer skeleton giữ) |
| Hàng | default · hover · active · unread (tên + preview 600, pill) · online |
| Pane | chưa chọn (desktop) · Draft (empty "Say hi") · loading (`MessageListSkeleton` khớp group) · error + Retry · lịch sử rỗng · đang tải cũ hơn (top) · có tin mới dưới (nút nổi) |
| Tin của mình | sending · sent · seen (§9.5) · failed + Retry (§9.5) |
| Composer | rỗng (Send disabled) · có chữ · pending (Spinner) · picker mở |
| Details | đóng · direct · group (owner / member — actions khác) · mobile Sheet |
| Friends | mỗi tab: loading · empty · error · row pending (Accept/Decline/Cancel/Unfriend) · confirm Unfriend |
| Theme | light · dark · theo hệ thống (mặc định) |

---

## 7. Copy — tiếng Anh hardcode (không i18n, README §1)

Mới: `New message` · `New group` · `Search chats` · `No results for "{q}"` · `Clear search` · `Pick a conversation` · `Say hi to {name}` · `Active now` · `{n} members · {m} online` · `{n} new messages` · `Jump to latest` · `Message {name}…` · `Enter to send · Shift+Enter for a new line` · `Sending…` / `Sent` / `Seen` / `Failed to send · Retry` · `Requests` / `Received` / `Sent` / `Find people` · `No one found` · `Still connecting — the server may be waking up` · `Appearance: Light / Dark / System`. Bỏ: `Aa`, `Pick a conversation to begin.`, `No conversations to show.`

---

## 8. Những gì không đổi

`ROUTES` và cây route trong `main.tsx` (kể cả `ChatSocketRouteBoundary`, catch-all sibling của guard); data layer (`packages/api/src/chat/*`, service singleton, ADR-0014 refresh); `use-auth-store` không persist; socket + Presence + cache patch; Virtuoso cho list hội thoại; `--online`; không i18n; `test/pages/main.test.tsx` vẫn là seam chính (mount mọi `ROUTES`, mock `~/libs/http-client`); E2E `auth.e2e.ts` chạy không backend.

---

## 9. Câu hỏi mở đưa vào grill (đã chốt toàn bộ ở §10)

1. **Hướng nào** — D Islands / E Ledger / F Midnight (đề xuất)? Nếu D: chấp nhận repo có hai app ngôn ngữ kính (`documents` Prism + chat) không? Nếu F: light theme "phẳng" là chấp nhận được?
2. **Palette:** giữ teal port từ nguồn, hay đây là lúc chọn palette riêng (khi đó mới mở `colors.csv`, như documents vòng 3)?
3. **Message scroller:** giữ Virtuoso (ảo hoá + cuộn ngược vô hạn đã chạy) và tự viết nút "N new messages" trên `atBottomStateChange`, hay đổi sang `MessageScroller` (`@shadcn/react`, stick-to-bottom, **không ảo hoá**) và tải lịch sử theo trang thường? Lịch sử một hội thoại thực tế dài bao nhiêu?
4. **Tìm hội thoại:** lọc client trên trang đã tải là đủ, hay backend `chat-socket` có/định thêm endpoint search?
5. **Dữ liệu cho "You: …", "Seen", "Failed":** `Conversation` hiện chỉ có `lastMessage` string — payload có `lastMessageSenderId`? Sự kiện `CONVERSATION_SEEN` có `seenByUserId`, nhưng conversation có `lastSeenMessageId` per member để vẽ "Seen" sau reload không? Gửi lỗi hiện toast toàn cục — có giữ tin lỗi tại chỗ để Retry?
6. **Ngưỡng group tin:** cùng người gửi và cách nhau < 5 phút (Messenger) hay chỉ cùng người gửi?
7. **Font:** D/F system stack (0 KB); E cần một serif — Fraunces (biểu cảm, có trục "wonk") hay Newsreader (điềm hơn)? Cả hai đều có `@fontsource-variable`.
8. **Socket disconnected:** hiện im lặng khi mất kết nối — cần banner "Reconnecting…" trong scope này không?
9. **Typing indicator** (mockup B có vẽ): backend chưa có event → ngoài scope trừ khi thêm ở `chat-socket`?
10. **Rail:** `<nav>` thuần + `Tooltip` (đề xuất) hay `Sidebar collapsible="icon"` của `@monorepo/ui` (`shadcn#44`, nhưng mobile của nó là Sheet, không phải bottom nav)?
11. **Theme toggle** nằm trong scope redesign, hay ticket riêng?
12. **Mobile bottom nav 3 mục** Chats / Friends / Me — "Me" là `/profile` với Sign out ở trong, đúng ý?

## 10. Chốt ở vòng grill — 2026-09-19 (hướng D Islands)

Chủ repo chọn **D — Islands** trên mockup v2, kèm một lỗi mockup phải ghi: đảo Bottom nav trên phone cao bằng đảo nội dung — bug CSS (`.phone .isl{flex:1}` đè lên cả nav), **không phải ý đồ**, đã sửa (`flex:none; height:66px`). Toàn bộ 27 câu chốt theo đề xuất; ghi lại làm đầu vào `/to-spec`:

| # | Quyết định |
|---|---|
| 1 | Spec ship **light + theme toggle**; `.dark` của Islands (đảo tối trên gradient tối) là **ticket cuối cùng cùng spec**. Toggle 3 trạng thái Light/Dark/System, mặc định **System**, Dark khoá cho tới khi ticket `.dark` xong |
| 2 | **Hai vai màu**: teal (`--primary`) = làm gì (New, Send, own bubble gradient); mực (`--foreground`) = đang ở đâu (Rail active, chip chọn, nút tin mới). Không thêm token |
| 3 | **Không `backdrop-filter`** ở đâu — đảo là `bg-card/75` trên gradient tĩnh |
| 4 | Chip `All · Unread · Groups`: **Groups server** (`list({ type: "GROUP" })`, key riêng), Unread client; chip trên URL `?filter=`; ô tìm lọc **trong** chip đang chọn. Đang lọc Unread mà mở một hội thoại → hàng **ở lại** tới khi rời filter |
| 5 | Ô tìm: client trên trang đã tải, debounce 300ms; rỗng → "No results for 'x'" + xoá + *"Search people instead →"* sang Find people |
| 6 | Giữ **Virtuoso**; nút "N new messages" tự viết từ `atBottomStateChange` + đếm tin đến khi không ở đáy, `aria-live="polite"` |
| 7 | Group tin: cùng người gửi **và < 5 phút**, date divider luôn cắt nhóm — hàm thuần có test |
| 8 | Read receipt **có**: direct = chữ "Seen" dưới nhóm tin cuối của mình; group = chồng avatar (≤3 + "+n") **đúng tin mỗi người đọc tới** (trôi xuống khi họ đọc). Live: patch `participants[].lastRead*` từ `conversation.seen` (hiện chỉ patch `unreadCount`) |
| 9 | Gửi lỗi: giữ toast toàn cục, **khôi phục chữ vào composer**. Không optimistic (ticket sau nếu muốn) |
| 10 | Bottom nav **3 mục Chats · Friends · Me**, ẩn trong màn chat; "Me" = `/profile`, Sign out là một hàng trong đó |
| 11 | Rail = `<nav>` thuần + `Tooltip`, không `Sidebar` primitive |
| 12 | Details: **bỏ ba ô stat**; còn avatar 88 có vòng, tên, `@username`, presence, bio, hai action. Mở/đóng nhớ trong phiên |
| 13 | Socket mất kết nối → pill "Reconnecting…" **ở header pane**, ẩn chấm presence khi chưa connect |
| 14 | `SYSTEM` render pill giữa dòng; `IMAGE`/`FILE` giữ như cũ (ngoài scope) |
| 15 | Nút "+" → `DropdownMenu`: **New message** (`Dialog` + `Command` trên `useFriendsInfiniteQuery` → Draft) · **New group** (dialog cũ). Bỏ nút `Users` |
| 16 | Glossary `apps/chat/CONTEXT.md`: **Islands · Island · Rail · Bottom nav** (đã ghi). ADR-0016 (đã viết) |
| 17 | Badge Chats trên Rail/Bottom nav và chip "Unread · n" đếm **số hội thoại chưa đọc** trên trang đã tải, không phải tổng tin |
| 18 | Dưới `md`: **giữ Island**, khe 8px; màn chat mobile là một Island với composer bên trong |
| 19 | `md`–`lg`: Rail + list 280 + pane, **Details là Sheet**; từ `lg` mới có Island Details 292 |
| 20 | Boot: Health gate + Session check là **một Island chờ**, chỉ đổi dòng chữ; sau 10s thêm "Still connecting — the server may be waking up" |
| 21 | Friends `Tabs`: mặc định **Friends**, badge trên Requests, tab trên URL `?tab=` để badge nav link thẳng vào Requests |
| 22 | E2E: thêm **`shell.e2e.ts`** (mock health/refresh/conversations): desktop có Rail không Bottom nav; 375px có Bottom nav, vào chat nav ẩn + Back về list. `auth.e2e.ts` cập nhật cho UI mới |
| 23 | Thứ tự ticket: (1) token + Islands shell (gradient, Rail, Bottom nav, theme provider) → (2) list (Item, tìm, chip, New menu) → (3) pane (group tin, receipt, jump, SYSTEM pill, composer, khôi phục chữ, Reconnecting) → (4) Friends tabs + touch target 44px + Details → (5) boot Island + auth + empty states → (6) `.dark` → (7) tổng kiểm + README § Hình dạng + `shell.e2e.ts`. (2)–(5) độc lập sau (1) |

Hai FACT tra được ở grill, để spec không hỏi lại: `ChatConversationRecord.lastMessage` là cả `ChatMessageRecord` (có `senderId`) → "You: …" dẫn xuất được; `ChatConversationParticipant.lastReadMessageId/lastReadAt` + event `conversation.seen` → read receipt dẫn xuất được, không cần backend đổi.

## 11. Bước tiếp

`/to-spec` từ §3 + §4 + §5 (cột D) + §10 → `/to-tickets` theo §10 hàng 23. Font: system stack (Q7 cũ đóng cùng hướng D).
