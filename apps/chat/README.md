# `@monorepo/chat`

App nhắn tin real-time kiểu Messenger, port 1:1 từ `chat-socket-fe` (`D:\Personal\chat\chat-socket-fe`,
Rsbuild + shadcn trên Radix + `@stomp/stompjs`) vào monorepo. Nối backend `chat-socket` (Spring Boot,
REST + STOMP trên cùng port). Spec [#195](https://github.com/qtuan02/monorepo/issues/195) — pha 1,
chạy được, không redesign. Glossary [`CONTEXT.md`](./CONTEXT.md) — dùng đúng từ vựng đó (Session,
Health gate, Presence, Conversation direct/group, Draft conversation, Friend request).

Ticket này (khung, [#196](https://github.com/qtuan02/monorepo/issues/196)) chỉ dựng app bằng `gen:app`
và cắm các quyết định nền — chưa có màn hình thật nào ngoài `/sign-in` (placeholder) và một shell rỗng.
Mọi tính năng (Session/Health gate, Conversation, Friends, socket…) đến ở các ticket sau — xem comment
tổng kết trên spec #195 cho thứ tự.

App chạy Runtime **Vite client SPA** (clone từ `apps/_template_vite` bằng `gen:app`): mọi màn hình nằm
sau đăng nhập, không crawler nào cần đọc, nginx phục vụ một bundle tĩnh.

```bash
bun run dev:chat     # http://localhost:3007
```

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Port | `ports.env` | Dev **3007**, E2E **3107** — do generator cấp. |
| Env | `src/env.ts` | Flavor `vite` của `@monorepo/env`, `baseEnvSchema.extend()` với hai key riêng: `PUBLIC_CHAT_API_BASE_URL` (origin backend `chat-socket`, service singleton tự nối `/api`) và `PUBLIC_CHAT_SOCKET_URL` (URL STOMP-over-WebSocket, `ws://…`/`wss://…`). Cả hai **bắt buộc** — thiếu một thì `bun run --filter @monorepo/chat build` fail và nêu đúng tên key. `.env` ở root repo (dev value: `http://localhost:8089` / `ws://localhost:8089/api/ws`). |
| Router | `src/pages/main.tsx` | `react-router` 8 declarative; mọi path từ `~/constants/routes.ts` — hiện chỉ có `HOME`/`SIGN_IN`. |
| Guard | `src/features/auth/provider/` | `ProtectedRoute` (chưa có route con — screen thật đến sau) / `GuestRoute` (bọc `/sign-in`). Catch-all `*` → `NotFound`, là **sibling** của `ProtectedRoute` trong shell, nên `/` và mọi URL lạ đều rơi vào 404 ở giai đoạn này (chưa có route con nào khớp trong `ProtectedRoute`). |
| Session | `src/stores/use-auth-store.ts` | Vẫn là bản `persist` (localStorage) của Template ở ticket này — **sẽ đổi** sang token chỉ sống trong store, không persist, theo mô hình Session thật (glossary, ADR-0014) ở ticket Session. Ghi ở đây để không ai đọc nhầm là xong. |
| Shell | `src/features/layout/templates/layout.template.tsx` | Rỗng — chỉ `<Outlet/>`. Shell thật (sidebar desktop / bottom nav mobile, theo nguồn) đến ở ticket layout. |
| Palette | `src/globals.css` | Teal của nguồn, override ở tầng app (xem § Token/accent) — cùng hình dạng ADR-0008/0009/0011. |
| Deploy | `vercel.json` · `Dockerfile` · `nginx.conf` | Như `apps/smart-rental`: build/install từ root qua `npx --yes bun@1.4.0`, SPA rewrite `/(.*)` → `/index.html`. Dockerfile/nginx của Template giữ nguyên cho job `docker`. |

## Những gì cố ý không có (ở ticket này)

Ghi ở đây để không ai đọc nhầm thành thiếu sót cần "hoàn thiện" ngay — mỗi thứ có ticket riêng, không
phải drift cần đồng bộ ngược từ `_template_vite` hay từ app khác:

1. **Không i18n.** Gỡ `~/libs/i18n.ts`, `select-language`, `@monorepo/i18n` + `react-i18next` khỏi
   deps. Copy hardcode tiếng Anh (nguồn `chat-socket-fe` vốn tiếng Anh); `@monorepo/dayjs` set locale
   `en` một lần ở `src/index.tsx`.
2. **Không persist token đúng nghĩa Session.** Store hiện tại vẫn là bản `persist` của Template —
   ticket Session đổi sang access token in-memory + refresh cookie `HttpOnly` (glossary **Session**,
   ADR-0014).
3. **Không `~/services/`.** Không có, và sẽ không có: mọi gọi backend đi qua service class trong
   `@monorepo/api` (ticket sau) — quy ước chung của cả monorepo, không phải riêng app này.
4. **Không redesign.** Giao diện port 1:1 từ nguồn (bố cục, palette, primitive `@monorepo/ui` thay
   Radix). Một redesign — nếu có — là spec riêng, đi qua bước design trước grill.
5. **Không có `~/hooks/api/template.ts` placeholder của Template**, không `@monorepo/types` — cả hai
   quay lại khi ticket service class thật thêm entity đầu tiên.

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

Ở ticket này chỉ có seam nền: `test/env.test.ts` (schema hai key riêng khớp `.env.example`),
`test/globals.test.ts` (token contract + AA), `test/features/auth/provider/protected-route.test.tsx`
(guard, không đổi từ Template). Seam route-tree chính (`test/pages/main.test.tsx`, mount mọi `ROUTES`
với service singleton + socket mock) đến cùng ticket Session, khi có Health gate và guard thật để mock.
