# `@monorepo/chat`

App nhắn tin real-time kiểu Messenger, port 1:1 từ `chat-socket-fe` (`D:\Personal\chat\chat-socket-fe`,
Rsbuild + shadcn trên Radix + `@stomp/stompjs`) vào monorepo. Nối backend `chat-socket` (Spring Boot,
REST + STOMP trên cùng port). Spec [#195](https://github.com/qtuan02/monorepo/issues/195) — pha 1,
chạy được, không redesign; spec [#232](https://github.com/qtuan02/monorepo/issues/232) sau đó đưa app
sang hình dạng **"Islands"** — xem [§ Hình dạng Islands](#hình-dạng-islands) bên dưới. Glossary
[`CONTEXT.md`](./CONTEXT.md) — dùng đúng từ vựng đó (Islands, Island, Rail, Bottom nav + từ pha 1:
Session, Health gate, Presence, Conversation direct/group, Draft conversation, Friend request).

Ticket khung ([#196](https://github.com/qtuan02/monorepo/issues/196)) dựng app bằng `gen:app` và cắm
các quyết định nền. Ticket Session ([#198](https://github.com/qtuan02/monorepo/issues/198)) là tracer
bullet đầu tiên chạm backend thật: Health gate, sign-in/sign-up, guard async qua `/auth/refresh`, và
sign-out. Các ticket sau đó dựng đủ 6 route của nguồn: Conversation + lịch sử ([#199](https://github.com/qtuan02/monorepo/issues/199)),
gửi tin + emoji ([#200](https://github.com/qtuan02/monorepo/issues/200)), socket STOMP + Presence
([#201](https://github.com/qtuan02/monorepo/issues/201)), Friends + Draft conversation
([#202](https://github.com/qtuan02/monorepo/issues/202)), Group + Profile
([#203](https://github.com/qtuan02/monorepo/issues/203)). Ticket tổng kiểm
([#204](https://github.com/qtuan02/monorepo/issues/204)) đóng pha 1: Gate + E2E + docker xanh, deploy
Vercel, archive repo nguồn. Xem comment tổng kết trên spec #195 cho thứ tự đầy đủ.

Spec #232 (redesign Islands, brief [`docs/design/chat-redesign.md`](../../docs/design/chat-redesign.md),
ADR-0016) chạy 8 ticket theo thứ tự token/shell → list → pane → Friends/Details → auth/empty state →
`.dark` → tổng kiểm: T1 shell + theme + boot Island ([#233](https://github.com/qtuan02/monorepo/issues/233)),
T2 danh sách ([#234](https://github.com/qtuan02/monorepo/issues/234)), T3 pane + composer
([#235](https://github.com/qtuan02/monorepo/issues/235)), T4 read receipt + "N new messages" +
Reconnecting ([#236](https://github.com/qtuan02/monorepo/issues/236)), T5 Friends Tabs + Details
([#237](https://github.com/qtuan02/monorepo/issues/237)), T6 Auth Island + trang Me
([#238](https://github.com/qtuan02/monorepo/issues/238)), T7 `.dark` Islands
([#239](https://github.com/qtuan02/monorepo/issues/239)), T8 tổng kiểm
([#240](https://github.com/qtuan02/monorepo/issues/240)). Xem comment tổng kết trên spec #232 cho lệnh
verify + kết quả.

App chạy Runtime **Vite client SPA** (clone từ `apps/_template_vite` bằng `gen:app`): mọi màn hình nằm
sau đăng nhập, không crawler nào cần đọc, nginx phục vụ một bundle tĩnh.

```bash
bun run dev:chat     # http://localhost:3007
```

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Port | `ports.env` | Dev **3007**, E2E **3107** — do generator cấp. |
| Env | `src/env.ts` | Flavor `vite` của `@monorepo/env`, `baseEnvSchema.extend()` với hai key riêng: `PUBLIC_CHAT_API_BASE_URL` (origin backend `chat-socket`, service singleton tự nối `/api`) và `PUBLIC_CHAT_SOCKET_URL` (URL STOMP-over-WebSocket, `ws://…`/`wss://…`). Cả hai **bắt buộc** — thiếu một thì `bun run --filter @monorepo/chat build` fail và nêu đúng tên key. `.env` ở root repo (dev value: `http://localhost:8089` / `ws://localhost:8089/api/ws`). |
| Router | `src/pages/main.tsx` | `react-router` 8 declarative; mọi path từ `~/constants/routes.ts` — `HOME`/`SIGN_IN`/`SIGN_UP`. `AppRoutes` (route tree + Health gate) tách khỏi `MainApp` (providers + `BrowserRouter`) đúng như `smart-rental`, để `test/pages/main.test.tsx` mount được ở mọi path. |
| Health gate | `src/features/auth/components/health-gate.tsx` | Bọc ngoài `<Routes>`: chặn cả app cho tới khi `GET /health-check` trả 200, thử lại mỗi 2s (`~/hooks/api/health.ts`). |
| Guard | `src/features/auth/provider/` | `ProtectedRoute` / `GuestRoute`, cả hai chạy `useSessionCheck` (`~/features/auth/hooks/use-session-check.ts`) — gọi `/auth/refresh` bằng cookie trước khi quyết, hiện `RouteGuardLoading` ("Checking session...") lúc chờ. Catch-all `*` → `NotFound` vẫn là **sibling** của `ProtectedRoute`, không cần Session. |
| Session | `src/stores/use-auth-store.ts` | Access token chỉ sống trong store — **không** `persist`. Nửa còn lại của Session là refresh cookie `HttpOnly` do backend giữ; `useSessionCheck` là cầu nối giữa hai nửa lúc boot/reload. |
| Data layer | `packages/api/src/chat/*.ts` | Sáu service class — `ChatAuthService`, `ChatHealthService`, `ChatUserService`, `ChatFriendService`, `ChatConversationService`, `ChatMessageService` — unwrap `ChatBaseResponse.data` (`@monorepo/types/chat-base`), singleton ở `~/libs/http-client.ts` (`withCredentials`, `onAuthError` → refresh + cất token, `onUnauthorized` → xoá cache + đăng xuất — ADR-0014). |
| Shell | `src/features/layout/templates/layout.template.tsx` | `NavRail` (`≥md`) hoặc `BottomNav` (`<md`, ẩn trong màn chat) quanh một `Island` bọc `<Outlet/>` — xem § Hình dạng Islands. `~/features/current-user/components/current-user-menu.tsx` mang avatar/tên + dropdown View profile/Edit profile (`/profile?edit=1`)/Sign out. |
| Conversation | `src/features/conversation/` | Sidebar danh sách (direct + group, cuộn vô hạn, Presence) qua `react-virtuoso`; màn chat cuộn ngược vô hạn, composer + emoji picker lazy-load, Draft conversation từ Friends. |
| Socket | `src/libs/socket.ts` + `src/stores/use-socket-store.ts` + `src/features/chat/provider/` | STOMP thuần (`@stomp/stompjs`); type guard cho 6 payload (`conversation.updated{conversation}`, `.removed`, `.seen`, `message.created\|updated\|deleted{message}`, `typing`) — payload lạ/`group.deleted` bị bỏ qua. `conversation.updated` **upsert** nguyên record vào list theo `id` (hội thoại mới tự hiện); `conversation.removed` xoá khỏi list, và nếu đang mở đúng id thì đưa về Home kèm toast. Message cache upsert theo `id`, `message.deleted` xoá. `subscribeToTyping`/`sendTyping` đã có ở lib (UI hiện "đang gõ" là T4). Presence online/offline như cũ. |
| Friends / Group / Profile | `src/features/friends/`, `src/features/group/`, `src/features/current-user/` | `/friends` (Friend request lifecycle, tìm user debounce), tạo/đổi tên/thêm-xoá-thành-viên/rời group theo role, `/profile` xem/sửa hồ sơ tại chỗ — một `ProfileForm` với hai trạng thái view/edit trên `?edit=`, không có dialog. |
| Palette | `src/globals.css` | Teal của nguồn, override ở tầng app (xem § Token/accent) — cùng hình dạng ADR-0008/0009/0011. |
| Deploy | `vercel.json` · `Dockerfile` · `nginx.conf` | Như `apps/smart-rental`: build/install từ root qua `npx --yes bun@1.4.0`, SPA rewrite `/(.*)` → `/index.html`. Dockerfile/nginx của Template giữ nguyên cho job `docker`. |

## Những gì cố ý không có (ở ticket này)

Ghi ở đây để không ai đọc nhầm thành thiếu sót cần "hoàn thiện" ngay — mỗi thứ có ticket riêng, không
phải drift cần đồng bộ ngược từ `_template_vite` hay từ app khác:

1. **i18n — có, từ 2026-09-20, đang chuyển dần.** i18next Flavor như `_template_vite` (`~/libs/i18n.ts`,
   cookie `chat_lang`, bridge `~/libs/dayjs.ts`), copy dưới namespace `chat.*` của catalogue chung, switcher là
   `LanguageToggleButton` cạnh `ThemeToggleButton` trên Rail. Đã dịch: Rail / Bottom nav / hai toggle; phần
   còn lại (auth, conversation, friends, group, profile, nhãn ngày "Today"/"Yesterday" trong `~/utils/date.ts`)
   vẫn hardcode tiếng Anh, chờ sweep. **Giờ:** `chat-socket` trả UTC, FE render local — mọi chuỗi giờ từ BE đi
   qua `~/utils/date.ts` (`toLocal`), không gọi `dayjs(value)` thẳng; gửi lên BE dùng `toApiTimestamp` (UTC ISO).
2. **Không `~/services/`.** Không có, và sẽ không có: mọi gọi backend đi qua service class trong
   `@monorepo/api` (`packages/api/src/chat/`) — quy ước chung của cả monorepo, không phải riêng app này.
3. **Attachment, Sửa/Xoá tin, Typing UI, đổi mật khẩu — chưa có UI.** Backend (`chat-socket` contract
   2026-09-20) và socket lib đã sẵn sàng cho cả bốn từ T1b (#255); UI của mỗi cái là ticket riêng độc
   lập trong cùng spec #253: Attachment ở T2, Sửa/Xoá tin ở T3, "đang gõ…" ở T4, đổi mật khẩu ở T5.
   Không phải drift — đọc comment tổng kết trên spec #253 để biết trạng thái từng ticket.
   Optimistic send, "Failed · Retry" tại chỗ, và tìm hội thoại phía server vẫn cố ý ngoài scope, như
   từ spec #232.
4. **Không CI job E2E, không throttle callback riêng.** `useThrottle` của nguồn bỏ hẳn — double-submit
   chặn bằng `isPending` của mutation; `use-debounce` của nguồn đổi sang `@monorepo/hook/use-debounce`.

## Gotcha

`@emoji-mart/react` chưa khai `peerDependencies` cho React 19 (peer báo React 16–18) — cài và chạy vẫn
tốt, chỉ là một dòng warning lúc `bun install`. `Picker` được `lazy(() => import(...))` từ composer nên
không nằm trong bundle ban đầu.

## Precondition backend

Backend `chat-socket` phải đặt `chat-socket.client-url` = **origin của app này** (`http://localhost:3007`
lúc dev, domain Vercel lúc prod) — dùng cho cả CORS lẫn STOMP allowed origin. Ở prod, cookie refresh là
`SameSite=None; Secure` nên cần HTTPS. Việc đổi cấu hình backend nằm ngoài spec #195, do chủ repo làm.

## Hình dạng Islands

Spec #232 (brief [`docs/design/chat-redesign.md`](../../docs/design/chat-redesign.md) §10, ADR-0016)
chuyển app sang hình dạng **Islands**: mọi vùng — Rail, danh sách hội thoại, khung tin nhắn, chi tiết,
Bottom nav — là một `Island` (`~/components/island/island.tsx`, `bg-card/75`, bo 22px, không
`backdrop-filter`) nổi trên một nền gradient tĩnh ba màu (teal · tím · cam, nhạt hơn ở light, tối hơn ở
`.dark`) app vẽ ở `body`. Hai vai màu: teal (`--primary`) nói *làm gì* (nút New group, Send, tin của mình
gradient teal có bóng màu); mực gần đen (`--foreground`) nói *đang ở đâu* (mục Rail active, chip đang
chọn, nút "N new messages"). Không thêm token cho hai vai này.

**Shell:** `≥md` hiện `NavRail` (`<nav>` thuần + `Tooltip`, không phải `Sidebar` primitive) với ba mục
Chats · Friends · Profile, badge đếm hội thoại chưa đọc/lời mời đến, theme toggle và avatar ở đáy.
`<md` hiện `BottomNav` 3 mục Chats · Friends · Me, ẩn khi đang trong một Conversation (composer chiếm
đáy màn). `LayoutTemplate` vẫn là nơi socket connect, bọc toàn bộ `<Outlet/>` trong một `Island`.

**Theme:** context + một key `localStorage` + class `.dark` trên `<html>` (`~/features/layout/provider/
theme-provider.tsx`, shape `apps/documents`), không store; ba trạng thái Light/Dark/System qua
`ThemeToggleButton`, mặc định System. `.dark` là Islands tối thật — đảo tối hơn trên gradient tối hơn —
không phải một palette dở dang: ship cùng lúc với ticket cuối spec (#239), không khoá lựa chọn Dark.

**Danh sách/pane/Friends/Details:** giữ đúng cấu trúc §3 của brief — `Item` cho mọi hàng (hội thoại,
bạn bè, thành viên), chip `All · Unread · Groups` trên URL `?filter=`, nhóm tin theo người gửi (< 5
phút) qua `MessageGroup`/`Bubble`, read receipt ("Seen" / chồng avatar), nút "N new messages", pill
`Reconnecting…`/`SYSTEM`, `Tabs` Friends · Requests · Find people trên URL `?tab=`; Friends và Profile chiếm trọn Island (header cố định, thân tự cuộn, hàng người là **một** card `~/components/user-item.tsx` cho cả bốn danh sách — Friends, Received, Sent, kết quả tìm — lưới `lg:2`/`2xl:3` cột, một hàng gọn — avatar 40 + tên/@username là nút mở detail, action `size="sm"` bên phải, tối đa một nút primary + một `outline`, không ghost; tabs là pill có icon, tab active mang `--foreground` như chip `All·Unread·Groups`). Đọc `~/features/
conversation`, `~/features/friends` để biết chi tiết từng component — bảng phía trên là điểm vào.

**Ba Island từ `md` (đóng decision hàng 19 của brief, 2026-09-20):** `layout.template.tsx` chỉ bọc Friends/Profile trong một Island; màn hội thoại (`/` và `/conversation/:id`) nhận cột trần và `conversation-shell.template.tsx` tự xếp list Island 320 · pane Island · Details Island 320 (khi mở; ở `md`–`lg` Details chiếm chỗ list bằng `max-lg:hidden` thay vì ép pane). Nút `+` là **New group** thẳng (tooltip, không dropdown); ô search của list tìm **cả chat lẫn người** — `people-search-results.tsx` gọi `useUserSearchInfiniteQuery`, bạn hay không đều hiện (icon `UserPlus` = chưa là bạn), chọn → Draft conversation qua `useOpenDirectConversation`; `NewMessageDialog` bỏ. Bong bóng bo góc theo vị trí trong run (Messenger), tin người khác nền `muted`, avatar đặt ở tin cuối run; mọi nút đứng một mình dùng `outline`, không `ghost` (chỉ hai nút nằm trong ô nhập — emoji, X xoá search — giữ ghost).

**Island fallback (spec #251/#252, 2026-09-20):** mỗi Island có truy vấn riêng đứng sau một
`~/components/exception/island-boundary.tsx` của riêng nó (`react-error-boundary`'s `ErrorBoundary`,
`FallbackComponent` là `island-fallback.tsx` — text + nút Retry gọi `resetErrorBoundary`, cùng footprint
với nhánh "không tải được" của `MessageList`). Bọc đúng 5 chỗ, bên trong `<Island>`: list (reset
`conversation.all`), pane (reset message keys của `conversationId` + `conversation.all`, `resetKeys`
theo `conversationId`), Details direct/group (reset user info của đối phương + `conversation.all`,
`resetKeys` theo `conversationId`), Friends template (`friend.all`), Profile template (`user.all`) — Rail,
Bottom nav, Health gate và auth không bọc. Retry = `resetQueries` đúng key của Island rồi remount, không
reload cả trang; đổi `conversationId` tự xoá fallback của pane/Details qua `resetKeys`, không cần bấm.
Mọi lỗi boundary bắt được — Island hay boundary gốc — log một chỗ ở `createRoot(rootEl, {
onCaughtError, onUncaughtError })` trong `src/index.tsx`; boundary gốc (`~/pages/main.tsx`) giữ
`InternalServerError` + reload cho lỗi ngoài shell, không còn `onError` riêng. Vá kèm tại nguồn: mapper
Conversation coi `participants` thiếu là `[]`, `~/utils/display.ts`'s `getDisplayName`/`getInitials`
không throw với user không tên; `ConversationList` có nhánh `isError` + Retry (`refetch`) riêng, không
còn hiện empty state khi backend từ chối.

Khoảng trống còn lại, ghi ở lần code review 2026-09-19, chờ backend: `chat-socket` không có
`GET /conversations/{id}`, nên `conversation-panel.tsx` chỉ tra hội thoại đang mở trong các trang
list **đã tải** — deep-link tới một hội thoại ngoài 20 dòng đầu (hoặc một group chỉ nạp qua chip
Groups) không render composer và người gửi đọc là "Unknown user". "View profile" trong Details (story
45), avatar/tên trên mỗi hàng `/friends` và mỗi thành viên trong Group info đều mở
`~/components/user-detail-dialog.tsx` — cái vỏ fetch `useUserInfoQuery` khi mở quanh
`~/components/user-info.tsx`, khối trình bày thuần (avatar, tên, quan hệ, rồi **mọi** field
`GET /v1/user/info` trả — Username · Email · Phone · Bio · Joined, field trống hiện "—") để một frame
khác (sheet, trang) dùng lại không cần dialog; action quan hệ vẫn ở hàng.

## Token/accent

Override ở **tầng app**, cùng hình dạng `apps/portfolio` (ADR-0008), `apps/documents` (ADR-0009) và
`apps/smart-rental` (ADR-0011) đã làm: khối `:root`/`.dark` **unlayered** trong `src/globals.css`, đứng
ngoài mọi `@layer` nên thắng `theme.css` mà không cần `!important`. Khác ba app kia: giữ nguyên
`oklch()` của nguồn thay vì đổi sang hex, vì đây là port 1:1 chứ không phải một bảng màu tự chọn.

| Token | Ghi chú |
| --- | --- |
| `--primary`, `--ring`, `--sidebar-primary` | Teal, `oklch(0.5 0.14 175)` — màu hành động của nguồn |
| `--accent`, sidebar (`--sidebar*`) | Tinted teal nhạt, theo đúng nguồn |
| `--online` | Token **mới** — chấm Presence kiểu Messenger; ánh xạ Tailwind qua `@theme inline` (`--color-online`) |
| `--radius` | **Không override** — `0.625rem` của nguồn trùng mặc định `theme.css` |
| `--islands-gradient-{teal,violet,amber}` | Ba điểm dừng gradient của Islands, khai trong `@layer base` (không unlayered — `theme.css` không có giá trị literal nào cho hai biến này để "thắng"), đổi giữa `:root`/`.dark` cho gradient sáng/tối (ADR-0016 §4) |
| `--card`, `--popover`, `--border` | **Chỉ** `.dark` override — dark Islands trên gradient tối; light dùng thẳng `--card` trắng của `theme.css`, vốn đã đọc được là `bg-card/75` trên gradient sáng |

`--success`/`--warning`/`--info`/`--destructive`, `--chart-*` và mọi token khác giữ nguyên của theme
dùng chung — một trạng thái không đổi nghĩa giữa các app. `test/globals.test.ts` kiểm token parity
`:root`/`.dark`, đúng danh sách override, và contrast AA cho chữ trên `bg-card/75` đặt trên gradient.

## Test

Seam chính là `test/pages/main.test.tsx` (shape `apps/smart-rental/test/pages/main.test.tsx`): mount
`AppRoutes` ở mọi `ROUTES` hiện có, `vi.mock("~/libs/http-client")` cho ba service singleton — Health
gate chặn tới khi health-check resolve, guard chờ `/auth/refresh` rồi mới quyết (`replace`, không
`push`), `/sign-in` với Session sẵn có bounce về `/`. Bên cạnh đó: `test/features/auth/provider/
{protected,guest}-route.test.tsx` (guard ở mức unit, cùng mock), `test/features/auth/components/
{sign-in,sign-up}-form.test.tsx` (validation tiếng Anh của nguồn + payload gửi đúng), `packages/api/
test/chat/*.test.ts` (ba service class unwrap `ChatBaseResponse.data`), `test/env.test.ts` +
`test/globals.test.ts` (không đổi từ ticket khung). E2E `e2e/auth.e2e.ts` chạy trên `vite preview` với
`page.route` chặn `/health-check` + `/auth/refresh` — không cần backend thật.
