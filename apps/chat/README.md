# `@monorepo/chat`

App nhắn tin real-time kiểu Messenger, port 1:1 từ `chat-socket-fe` (`D:\Personal\chat\chat-socket-fe`,
Rsbuild + shadcn trên Radix + `@stomp/stompjs`) vào monorepo. Nối backend `chat-socket` (Spring Boot,
REST + STOMP trên cùng port). Spec [#195](https://github.com/qtuan02/monorepo/issues/195) — pha 1,
chạy được, không redesign. Glossary [`CONTEXT.md`](./CONTEXT.md) — dùng đúng từ vựng đó (Session,
Health gate, Presence, Conversation direct/group, Draft conversation, Friend request).

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
| Shell | `src/features/layout/templates/layout.template.tsx` | Sidebar (desktop) + bottom nav (mobile) + `<Outlet/>`, như nguồn. `~/features/current-user/components/current-user-menu.tsx` mang avatar/tên + dropdown Edit profile/View profile/Sign out. |
| Conversation | `src/features/conversation/` | Sidebar danh sách (direct + group, cuộn vô hạn, Presence) qua `react-virtuoso`; màn chat cuộn ngược vô hạn, composer + emoji picker lazy-load, Draft conversation từ Friends. |
| Socket | `src/libs/socket.ts` + `src/stores/use-socket-store.ts` + `src/features/chat/provider/` | STOMP thuần (`@stomp/stompjs`), patch cache tại chỗ khi tin đến, Presence online/offline, `seen`. |
| Friends / Group / Profile | `src/features/friends/`, `src/features/group/`, `src/features/current-user/` | `/friends` (Friend request lifecycle, tìm user debounce), tạo/đổi tên/thêm-xoá-thành-viên/rời group theo role, `/profile` xem/sửa hồ sơ. |
| Palette | `src/globals.css` | Teal của nguồn, override ở tầng app (xem § Token/accent) — cùng hình dạng ADR-0008/0009/0011. |
| Deploy | `vercel.json` · `Dockerfile` · `nginx.conf` | Như `apps/smart-rental`: build/install từ root qua `npx --yes bun@1.4.0`, SPA rewrite `/(.*)` → `/index.html`. Dockerfile/nginx của Template giữ nguyên cho job `docker`. |

## Những gì cố ý không có (ở ticket này)

Ghi ở đây để không ai đọc nhầm thành thiếu sót cần "hoàn thiện" ngay — mỗi thứ có ticket riêng, không
phải drift cần đồng bộ ngược từ `_template_vite` hay từ app khác:

1. **Không i18n.** Gỡ `~/libs/i18n.ts`, `select-language`, `@monorepo/i18n` + `react-i18next` khỏi
   deps. Copy hardcode tiếng Anh (nguồn `chat-socket-fe` vốn tiếng Anh, kể cả thông báo lỗi form);
   `@monorepo/dayjs` set locale `en` một lần ở `src/index.tsx`.
2. **Không `~/services/`.** Không có, và sẽ không có: mọi gọi backend đi qua service class trong
   `@monorepo/api` (`packages/api/src/chat/`) — quy ước chung của cả monorepo, không phải riêng app này.
3. **Không redesign.** Giao diện port 1:1 từ nguồn (bố cục, palette, primitive `@monorepo/ui` thay
   Radix). Một redesign — nếu có — là spec riêng, đi qua bước design trước grill.
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

`--success`/`--warning`/`--info`/`--destructive`, `--chart-*` và mọi token khác giữ nguyên của theme
dùng chung — một trạng thái không đổi nghĩa giữa các app. `test/globals.test.ts` kiểm token parity
`:root`/`.dark`, đúng danh sách override, và contrast AA cho `--primary`/`--online`.

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
