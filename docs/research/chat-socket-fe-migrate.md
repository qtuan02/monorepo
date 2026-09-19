# Nghiên cứu move `chat-socket-fe` (Rsbuild + STOMP) vào monorepo thành `apps/<chat>` chạy được

> **Đã shipped ở [#195](https://github.com/qtuan02/monorepo/issues/195)** (pha 1, `apps/chat`, tổng kiểm [#204](https://github.com/qtuan02/monorepo/issues/204)) — nội dung dưới đây là ảnh chụp lúc nghiên cứu, không phải trạng thái hiện tại của app; đọc `apps/chat/README.md` cho hình dạng đã chạy.

> Ngày kiểm tra: **2026-09-18**, nhánh `dev`, HEAD `ca9ff52` (working tree có một thay đổi chưa commit ở `.github/workflows/ci.yml` — gỡ job `e2e` khỏi CI, xem §C.11; không đụng `apps/`). Nguồn: **code thật** của app nguồn `D:\Personal\chat\chat-socket-fe` (đọc trọn `src/` — 155 file `.ts/.tsx`, 12 753 dòng — cùng `rsbuild.config.ts`, `package.json`, `biome.json`, `components.json`, `tsconfig.json`, `README.md`, `agent/AGENTS.md`, `vercel.json`, `.env.template`, `.github/workflows/*`); backend cạnh đó `D:\Personal\chat\chat-socket` (chỉ đọc `README.md`, `WebSocketConfig.java`, `SecurityServerConfig.java`, `constant/*.java`); **code thật** của monorepo (`apps/_template_vite/**`, `apps/smart-rental/{README.md,vercel.json,package.json,src/globals.css,src/index.tsx}`, `packages/{api,env,hook,ui,dayjs,i18n}`, `tooling/{tailwind,typescript}`, `biome.json`, `package.json` gốc, `.env.example`, `.github/workflows/ci.yml`, `turbo/generators/config.ts`, `.agents/rules/*`, `.agents/knowledge-base.md`, `.agents/plans/legacy-migrate/spec.md`, ADR-0001/0003/0011, `docs/research/smart-rental-rebuild.md`), spec GitHub [#127](https://github.com/qtuan02/monorepo/issues/127) (qua `gh`), và **docs chính thống** qua Context7 (React Router v8 changelog/upgrading, `@stomp/stompjs` 7, `emoji-mart`, Rsbuild env-vars). App nguồn được **chạy Gate thật** (`bun install` → `tsc --noEmit` → `rsbuild build` → `biome check`) và được **kiểm chéo bằng toolchain của monorepo** (Biome 2.5.12 với `biome.json` gốc, TypeScript 7.0.2 với `tooling/typescript/base.json`, `babel-plugin-react-compiler` 1.0.0) trong scratchpad — không sửa một file nào của app nguồn. Mọi claim có `path:line`, URL hoặc số issue; chỗ không mở/kiểm được ghi **"chưa xác minh"**.
>
> **Ba loại nội dung:** **FACT** = đọc từ code/nguồn, trích được; **DELTA** = khoảng cách giữa app nguồn và Template/rule của repo, vẫn là FACT hai đầu; **DRAFT** = đề xuất/câu hỏi của agent — chỉ nằm ở §D và §E. Không bịa số.
>
> **Không sửa file nào ngoài note này, không commit, không tạo app.** Scratchpad của session (`…\scratchpad\{chatcheck,tscheck,rc}\`) giữ output Biome/tsc/React Compiler để đối chiếu lúc grill, không commit.

Cấu trúc: **TL;DR** → **§A Inventory app nguồn** (A.1 stack · A.2 cấu trúc `src/` · A.3 route/guard · A.4 env/build · A.5 dependency map · A.6 backend contract · A.7 test/CI/deploy · A.8 Gate thật) → **§B Map sang monorepo** (bảng từng thư mục + bảng primitive) → **§C Điểm gãy kỹ thuật** → **§D Phương án (DRAFT)** → **§E Câu hỏi mở cho grill** → **§F Nguồn**.

---

## TL;DR

1. **App nguồn đang xanh và gần với quy ước repo hơn tưởng tượng.** Gate nguồn: `tsc --noEmit` 0 lỗi, `rsbuild build` exit 0, `biome check` "Checked 165 files … No fixes applied" (§A.8). Kiểm chéo bằng toolchain monorepo: **TypeScript 7.0.2 + `base.json` (`noUncheckedIndexedAccess`, `checkJs`, `module: Preserve`) → 0 lỗi trên 155 file**; **Biome 2.5.12 với `biome.json` gốc → 132 lỗi + 1 warning, trong đó 131 là auto-fix** (`organizeImports` 101, `useImportType` separatedType 30), còn **1 lỗi tay** (`useExhaustiveDependencies` ở `features/chat/hooks/use-message-composer.ts:78`) và 1 warning (`noUnnecessaryConditions` ở `features/friends/hooks/use-open-direct-conversation.ts:17`) — §C.6. Cấu trúc `src/` đã là feature-sliced với `hooks/api` + `queryKeysFactory` cùng shape với Template (`libs/query-key-factory.ts` gần như byte-identical).
2. **Ba điểm gãy thật sự khi "chạy được", theo thứ tự nặng → nhẹ:** (a) **Radix → Base UI**: 7/12 file `src/components/ui/*` import `radix-ui` (§A.5); dùng bên ngoài chỉ có **2 chỗ `asChild`** và **3 `onSelect`** của `DropdownMenuItem` (Base UI Menu.Item không có `onSelect`, có `onClick`/`closeOnClick`) — bảng đối chiếu §B.2; (b) **`libs/axios.ts` là interceptor refresh-token + `withCredentials: true`** (`libs/axios.ts:41-44, 56-105`) — `createHttpClient` của `@monorepo/api` chỉ có `getAuthToken` + `onUnauthorized` (chỉ bắn khi **401**, `packages/api/src/client.ts:128-130`), không có refresh/retry, không có `withCredentials`; backend trả **403** cho token hết hạn (`chat-socket/README.md` §SecurityFilter) nên `onUnauthorized` không bao giờ thấy — §C.3; (c) **`sonner` → `@monorepo/ui/components/toast`**: 23 call site `toast.success/error` ở 12 file, và global `MutationCache.onError` của Template đã toast mọi mutation fail nên 6 `onError` toast trong `hooks/api` phải bỏ (rule `tanstack-use-mutation`) — §C.4.
3. **Rsbuild → Vite gần như miễn phí về env**: app nguồn đọc `import.meta.env.PUBLIC_*` (`config/env.ts:12-14`) — đúng shape Vite với `envPrefix: "PUBLIC_"` của Template. Hai chỗ phải đổi: `import.meta.env.NODE_ENV` (Vite không có, Template dùng `env.PUBLIC_APP_ENV === "local"`) và `src/env.d.ts` trỏ `@rsbuild/core/types` → `vite/client`. Gotcha phát hiện khi chạy build thật: `.env.template` đặt `NODE_ENV=development` nên **`rsbuild build` hiện tại xuất bundle dev-mode** (`MODE:"development"`, không tách CSS, tổng 5,26 MB) — §A.8/§C.1.
4. **React Router 7.15 → 8.3.1: không có breaking change chạm code app nguồn** — mọi import đã từ `react-router` (không `react-router-dom`), chỉ dùng `BrowserRouter/Routes/Route/Navigate/Outlet/Link/NavLink/useNavigate/useLocation/useParams/matchPath` (§A.3); v8 chỉ xoá `react-router-dom` và promote future flag của framework/data mode (§C.2). Template đã chạy đúng bộ API này trên 8.3.1 (`apps/_template_vite/src/pages/main.tsx:4`).
5. **STOMP/socket không có tiền lệ trong repo nhưng không cần polyfill**: `@stomp/stompjs` 7.3.0 dùng `WebSocket` của browser, polyfill chỉ cho Node (Context7 §C.7). Backend chốt allowed-origin **cứng theo `chat-socket.client-url` = `http://localhost:3000`** cho cả CORS lẫn WS (`SecurityServerConfig.java:59`, `WebSocketConfig.java:27`) → app mới ở port **3007** (slot trống kế tiếp, §C.9) sẽ bị CORS chặn cho tới khi đổi config backend.
6. **React Compiler (Template bật) bail-out 5 hàm/204 hàm compile được** (§C.8): `conversation-list.tsx:61` mutate biến module trong render ("This value cannot be modified" — hack Footer cho Virtuoso), `use-send-message.ts:23` "Existing memoization could not be preserved", `add-group-members-dialog.tsx:36` + `use-create-group-dialog.ts:30` "Use of incompatible library" (react-hook-form `watch()` — trùng rule `forms-use-watch`). Bail-out = hàm đó chạy không memo, không phải lỗi build.
7. **Khuyến nghị (DRAFT, §D): phương án 1 — `gen:app` Runtime `vite` rồi port từng lớp, giống #127 pha 1** — vì (i) rule `architecture-ui-primitives` cấm hand-copy primitive vào app và spec #127 đã áp "không cài lại Radix" như một điều kiện (user story 33), (ii) diện tiếp xúc Radix/sonner thực tế nhỏ (2 `asChild`, 3 `onSelect`, 23 toast), (iii) phần lớn `features/**` copy được gần nguyên sau `biome check --write` + đổi `@/`→`~/`. Chi phí nằm ở **socket layer + refresh-token** (cần quyết định ở tầng package) hơn là ở UI.
8. **App nguồn không có test, không có E2E** (`package.json` scripts: `build/check/dev/format/lint/preview/typecheck`, không `test`; không thư mục `test/`, `e2e/`; CI của nó chỉ lint/format/typecheck) — Gate `test` của monorepo sẽ pass rỗng cho tới khi có ít nhất seam `test/pages/main.test.tsx` như smart-rental. Mọi copy UI là **tiếng Anh hardcode**, không i18n.

---

## §A · Inventory app nguồn

### A.1 Stack + version (FACT — `package.json`, `bun.lock` đã cài)

| Thứ | App nguồn (`chat-socket-fe/package.json`) | Đã cài (node_modules) | Monorepo (catalog root `package.json`) | Ghi chú |
| --- | --- | --- | --- | --- |
| Build | `@rsbuild/core ^2.0.5` + `@rsbuild/plugin-react` + `@rsbuild/plugin-tailwindcss 2.0.0` | 2.0.6 | Vite **8.2.2** + `@vitejs/plugin-react` 6.1.1 + `@rolldown/plugin-babel` + `@tailwindcss/vite` | §C.1 |
| React | `^19.2.6` | 19.2.6 | 19.2.8 (`react19`) | — |
| Router | `react-router ^7.15.0` | 7.15.0 | **8.3.1** (`react-router8`) | §C.2 |
| Query | `@tanstack/react-query ^5.100.10` | 5.100.10 | ^5.102.8 | cùng major |
| Zod | `^4.4.3` | 4.4.3 | ^4.5.4 | dùng `{ message }` (Zod 3 spelling) + `import { z }` — §C.6 |
| Zustand | `^5.0.13` | 5.0.13 | 5.0.15 | — |
| Axios | `^1.16.1` | 1.16.1 | ^1.20.0 (qua `@monorepo/api`) | app không cài trực tiếp ở monorepo |
| RHF | `react-hook-form ^7.75.0` + `@hookform/resolvers ^5.2.2` | — | ^7.87.0 / ^5.9.1 | — |
| Icons | `lucide-react ^1.14.0` | 1.14.0 | 1.40.0 | — |
| UI | `radix-ui ^1.4.3` (umbrella), shadcn **new-york** (`components.json:3`) | 1.4.3 | `@base-ui/react ^1.7.0`, shadcn **base-vega** (`packages/ui/components.json:3`) | §B.2 |
| Toast | `sonner ^2.0.7` | 2.0.7 | `@monorepo/ui/components/toast` (Base UI `createToastManager`) | §C.4 |
| Tailwind | `tailwindcss ^4.3.0` + `@tailwindcss/postcss` + `tailwindcss-animate ^1.0.7` | — | `tailwindcss ^4.3.3` + **`tw-animate-css 1.4.0`** + `tailwind-scrollbar` | §C.5 |
| Virtual list | `react-virtuoso ^4.18.7` | 4.18.7 (peer `react >=19` OK) | **không có** trong catalog; có `@tanstack/react-virtual` (`tanstack-table9`) và `@monorepo/ui/components/message-scroller` (`@shadcn/react/message-scroller`) | §B.1 |
| Emoji | `emoji-mart ^5.6.0` + `@emoji-mart/react ^1.1.1` + `@emoji-mart/data ^1.2.1` | `@emoji-mart/react` peer **`react ^16.8 \|\| ^17 \|\| ^18`** (không khai 19; bun vẫn cài, app chạy được) | không có | §C.7 |
| Socket | `@stomp/stompjs ^7.3.0` | 7.3.0, `type: module` | không có | §C.7 |
| TS | `typescript ^6.0.3` | 6.0.3 | **~7.0.2** | §C.6 (0 lỗi dưới TS7) |
| Biome | `2.4.14` (config riêng, `useExhaustiveDependencies: off`, `noExplicitAny: off`) | — | 2.5.12, một config gốc | §C.6 |
| Node/Bun | `.nvmrc` 22.21.0; engines `node >=22.21.0`, `bun >=1.2.3` | — | Node 24, `bun@1.4.0` | — |

### A.2 Cấu trúc `src/` (FACT — `find src`, README §Project Structure)

```text
src/
├── index.tsx                 createRoot + <App/> — cùng shape Template (index.tsx:1-13)
├── app.tsx                   route tree + providers + BackendHealthGate + socket connect effect (app.tsx:35-129)
├── env.d.ts                  /// <reference types="@rsbuild/core/types" /> + Window.toggleDevtools + *.svg?react (env.d.ts:1-16)
├── globals.css               @import tailwindcss + @plugin tailwindcss-animate + @theme inline + :root/.dark teal (globals.css:1-131)
├── config/                   constant.ts (limits, labels, SOCKET_EVENT) · env.ts (zod parse import.meta.env) · routes.ts (APP_ROUTES + APP_API)
├── libs/                     axios.ts (refresh interceptor) · query-client.ts · query-key-factory.ts
├── services/                 auth · conversation · friend · health · message · user (plain object + axiosClient) · socket-service.ts (STOMP subscribe + type guards)
├── hooks/api/                auth · conversation · friend · health · message · user (TanStack Query + cache patch helpers)
├── hooks/                    use-debounce · use-session-check · use-throttle
├── stores/                   useAuthStore.ts (accessToken, KHÔNG persist) · useSocketStore.ts (STOMP Client + onlineUsers)
├── providers/                chat-socket-provider.tsx · guest-route.tsx · protected-route.tsx · route-guard-loading.tsx
├── types/                    auth · base (BaseResponse<T>, Pagination*) · conversation · friend · friend-status · message · user (6 `export enum`)
├── utils/                    cn · conversation (draft id) · date (Intl, không dayjs) · display · error · string
├── components/ui/            avatar button card dialog dropdown-menu field input label separator sheet skeleton textarea (12 file, shadcn new-york)
├── components/shared/        conversation-avatar · detail-field · mobile-top-back-bar · user-item(+action-button, avatar, dialog, helpers)
├── features/
│   ├── auth/                 components (sign-in-form, sign-up-form) · hooks (use-auth-session-success, use-sign-in-flow, use-sign-up-flow) · templates (sign-in-template, sign-up-template) · types (sign-in-form, sign-up-form)
│   ├── chat/                 components/{content,mobile,sidebar,skeleton} · 15 hook · templates (chat-shell-layout, chat-template) · utils (direct-message-draft, map-message-to-ui-model)
│   ├── conversation/         components (9) · hooks (3) · templates (conversation-details-panel-template) · utils (map-conversation-to-ui-model)
│   ├── current-user/         components (4) · hooks (use-current-user-section) · templates (2)
│   ├── friends/              components (4) · hooks (3) · templates (friends-template)
│   └── group/                components (6) · hooks (3) · templates (3)
└── pages/                    auth-page-shell · chat-page · friends-page · profile-page · sign-in-page · sign-up-page (mỏng)
```

DELTA với Template Vite (`apps/_template_vite/src/`): (1) app nguồn có `services/` trong app, Template không (service class ở `@monorepo/api`, rule `architecture-features-modules`: "There is **no `~/services/` folder** inside an app"); (2) `config/` ≈ `constants/` + `env.ts` ở root `src/`; (3) `providers/` ≈ `features/auth/provider/`; (4) tên template `<name>-template.tsx` (dash) thay vì `<name>.template.tsx` (dot, rule `architecture-vertical-slices`); (5) mọi component/template/page là **named export** (`export function ChatTemplate`), Template dùng **default export** cho page/template/feature component (rule `quality-imports` bảng "Match the actual export style"); (6) store đặt tên `useAuthStore.ts` (camelCase file) thay vì `use-auth-store.ts`; (7) không có `~/hooks/api` nào đặt factory bằng `queryKeysFactory<"x">("x")` như Template — app nguồn viết explicit generic (`hooks/api/conversation.ts:24-25`, `friend.ts:21-24`, `health.ts:9`, `message.ts:26`, `user.ts:28`), rule `tanstack-key-factory` nói "never restated as an explicit type argument" (cosmetic).

### A.3 Route table + guard (FACT)

`config/routes.ts:1-10`:

| Key | Path | Page | Guard (`app.tsx:93-109`) |
| --- | --- | --- | --- |
| `signIn` | `/sign-in` | `SignInPage` | `GuestRoute` |
| `signUp` | `/sign-up` | `SignUpPage` | `GuestRoute` |
| `chat` | `/` | `ChatPage` | `ProtectedRoute` → `ChatSocketRouteBoundary` |
| `chatConversation` | `/conversation/:conversationId` | `ChatPage` | (như trên) |
| `friends` | `/friends` | `FriendsPage` | (như trên) |
| `profile` | `/profile` | `ProfilePage` | (như trên) |
| `conversationById(id)` | builder | — | — |

- **Không có route `*` / 404** — URL lạ render `<Routes>` rỗng (app.tsx:94-108). Template có `NotFound` trong shell ngoài guard (`main.tsx:78`).
- **Không có shell/layout route**: mỗi page tự bọc `ChatShellLayout` (`pages/friends-page.tsx:11`, `profile-page.tsx:11`) hoặc `ChatTemplate` tự vẽ shell (`chat-template.tsx:44-85`); `ChatSocketRouteBoundary` là route-element không path (`app.tsx:101,113-129`) đọc `matchPath(APP_ROUTES.chatConversation)` để bơm `activeConversationId` vào `ChatSocketProvider`.
- Guard: `ProtectedRoute`/`GuestRoute` (`providers/*-route.tsx`) dùng `useSessionCheck` (`hooks/use-session-check.ts:5-46`): nếu store không có `accessToken` → gọi `refreshSessionOnce()` (POST `/auth/refresh`, cookie) rồi mới quyết; trong lúc chờ render `RouteGuardLoading`. DELTA: Template guard đọc token **đồng bộ** từ store `persist` (`features/auth/provider/protected-route.tsx:24-27`), không có trạng thái "đang kiểm session".
- `BackendHealthGate` (`app.tsx:65-80`) chặn toàn bộ UI cho tới khi `GET /health-check` thành công (`hooks/api/health.ts:16-27`, `retry: true`, `retryDelay: 2000`) — không có tiền lệ trong Template.
- React Router API dùng (grep): `BrowserRouter, Routes, Route, Outlet, Navigate, Link, NavLink, useNavigate, useLocation, useParams, matchPath`, `navigate(path, { state, replace })`, `location.state` (draft conversation: `features/chat/hooks/use-direct-message-draft.ts:39-46, 81-88, 144-148, 173-175`; `features/friends/hooks/use-open-direct-conversation.ts:76-78`). Tất cả import từ `"react-router"`, **không** có `react-router-dom` (grep 0).

### A.4 Env + build config (FACT)

- `rsbuild.config.ts:7-15` tự viết `loadEnv([...])` throw khi thiếu `PUBLIC_API_BASE_URL`, `PUBLIC_SOCKET_URL` (cùng ý "fail sớm" với `createEnv` của `@monorepo/env`); `html.title: "Chat"`; alias `@` → `src` (`:24-26`); `server.port: 3000`, `open: true` (`:28-31`); `output.injectStyles: process.env.NODE_ENV === "development"` (`:33`).
- `config/env.ts:3-15`: zod `z.object({ NODE_ENV, PUBLIC_API_BASE_URL: url().default("http://localhost:8089"), PUBLIC_SOCKET_URL: url().default("ws://localhost:8089/api/ws") })`, parse `import.meta.env.*`. DELTA: `@monorepo/env` vite Flavor (`packages/env/src/vite/schema.ts:47-51`) bắt buộc `PUBLIC_APP_ENV`, `PUBLIC_BASE_DOMAIN`, `PUBLIC_BASE_DOMAIN_API` (`httpUrlSchema`), không có default; app extend bằng `baseEnvSchema.extend()` trong `~/env.ts` (README §2 Env). Tên key theo quy ước: key riêng app mang tên app → `PUBLIC_CHAT_SOCKET_URL` (giả sử app tên `chat`); `PUBLIC_API_BASE_URL` của nguồn trùng vai `PUBLIC_BASE_DOMAIN_API` (lưu ý app nguồn tự nối `/api` vào base: `libs/axios.ts:42`).
- `.env.template` (= `.env` hiện tại): `NODE_ENV=development`, `PUBLIC_API_BASE_URL=http://localhost:8089`, `PUBLIC_SOCKET_URL=ws://localhost:8089/api/ws`.
- `tsconfig.json`: `lib DOM/ES2020`, `moduleResolution: bundler`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`, `paths @/* → ./src/*`, **không** `noUncheckedIndexedAccess`. Monorepo `base.json` có `noUncheckedIndexedAccess`, `checkJs`, `module: Preserve` — kiểm dưới TS 7.0.2 với base này: **0 lỗi** (§A.8).
- `biome.json` nguồn: recommended + tắt `useExhaustiveDependencies`, `noExplicitAny`; `organizeImports: on`. Monorepo: `domains react/turborepo/types: all`, `noNonNullAssertion: error`, `useImportType: separatedType`, `useExportType`, `noMisusedPromises`, override `apps/**` cấm `process.env` (`biome.json:41-63, 108-127`).
- `components.json` nguồn: style `new-york`, alias `utils: @/utils/cn`, `lib: @/libs` — monorepo: `base-vega`, alias `#utils/cn` chỉ dùng trong `packages/ui`.

### A.5 Dependency → nơi dùng (FACT, grep `from "<pkg>`)

| Dependency | Số file | File |
| --- | --- | --- |
| `radix-ui` | 7 | `components/ui/{avatar,button,dialog,dropdown-menu,label,separator,sheet}.tsx` — **chỉ trong `components/ui`** |
| `sonner` | 12 | `app.tsx` (`<Toaster richColors />`), `hooks/api/{auth,user}.ts`, `features/auth/hooks/use-auth-session-success.ts`, `features/chat/hooks/{use-chat-sidebar,use-send-message}.ts`, `features/conversation/hooks/use-conversation-details-panel.ts`, `features/current-user/hooks/use-current-user-section.ts`, `features/friends/hooks/{use-friend-request-actions,use-friends-template}.ts`, `features/group/hooks/{use-create-group-dialog,use-group-conversation-actions}.ts` — 12× `toast.error`, 11× `toast.success` |
| `react-virtuoso` | 3 | `features/chat/components/content/message-list.tsx:2-3,162-185` (`Virtuoso` với `firstItemIndex`, `followOutput`, `startReached`, `alignToBottom`), `features/chat/hooks/use-message-list-auto-scroll.ts:2` (`VirtuosoHandle.scrollToIndex`), `features/conversation/components/conversation-list.tsx:1,103-115` (`endReached`, `components.Footer`) |
| `@stomp/stompjs` | 2 | `services/socket-service.ts:1`, `stores/useSocketStore.ts:1` |
| `@emoji-mart/{react,data}` | 1 | `features/chat/components/content/message-composer.tsx:1-2,80-93` (2 `<Picker>` — mobile/desktop, `theme="light"`) |
| `react-hook-form` + `@hookform/resolvers` | 5 | auth 2 hook, group 3 file (`add-group-members-dialog.tsx`, `rename-group-dialog.tsx`, `use-create-group-dialog.ts`) |
| `zustand` | 2 | 2 store |
| `axios` | 1 | `libs/axios.ts` |
| `lucide-react` | 31 | khắp nơi |
| `class-variance-authority` | 2 | `components/ui/{button,field}.tsx` |
| `clsx` + `tailwind-merge` | 1 | `utils/cn.ts` |
| `@tanstack/react-query-devtools` | 1 | `app.tsx:30-33` lazy — cùng shape Template `main.tsx:25-28` |

Primitive `components/ui/*` được import từ ngoài (số file): `button` 31, `skeleton` 10, `input` 9, `avatar` 5, `dialog` 5, `card` 2, `field` 2, `textarea` 2, `dropdown-menu` 1, **`label`/`separator`/`sheet` = 0** (chết, chỉ `field.tsx` import `label` + `separator` nội bộ).

### A.6 Backend contract mà FE gọi (FACT — `config/routes.ts:12-55`, `services/*.ts`, `chat-socket/README.md`)

Backend `D:\Personal\chat\chat-socket`: Spring Boot 4.0.6, Java 25, PostgreSQL + Redis + Flyway, `spring.mvc.servlet.path=/api`, port **8089**, JWT access token (TTL 15 phút) + refresh token trong cookie `refreshToken` (`httpOnly`, `secure: true`, `sameSite: none`, TTL 14 ngày); `chat-socket.client-url = http://localhost:3000` dùng cho **CORS** (`SecurityServerConfig.java:59`, `allowCredentials true`) **và** allowed origin của STOMP endpoint `/ws` (`WebSocketConfig.java:27`). `SecurityFilter`: thiếu token → **401** "Token not found."; token invalid/expired → **403** "Token expired or invalid."; bypass `OPTIONS`, `/api/ws`, `/api/v1/auth/*`.

REST (base `${PUBLIC_API_BASE_URL}/api`, `libs/axios.ts:42`; prefix `/v1` từ `APP_API.v1.base`):

| Method | Path | Service | Response shape |
| --- | --- | --- | --- |
| GET | `/health-check` (không `/v1`) | `health-service.ts:5-9` | — |
| POST | `/v1/auth/sign-in` · `sign-up` · `sign-out` · `refresh` | `auth-service.ts` | `BaseResponse<{accessToken}>` / `BaseResponse<null>` |
| GET/PATCH | `/v1/user/me` · GET `/v1/user/info?userId` · GET `/v1/user?search&offset&limit` | `user-service.ts` | `BaseResponse<UserProfile>` / `<UserInfo>` / `<PaginationResponse<UserSearch>>` |
| GET/POST/DELETE | `/v1/friend` · `/v1/friend/request` · `accept` · `decline` · `cancel` · `/v1/friend/{id}` | `friend-service.ts` | `BaseResponse<…>` |
| GET/POST/PATCH/DELETE | `/v1/conversation` · `/{id}/messages?limit&cursor` · `/{id}/seen` · `/{id}/group` · `/{id}/members[/{memberId}]` · `/{id}/leave` | `conversation-service.ts`, `message-service.ts` | `BaseResponse<{messages, nextCursor}>` (cursor pagination) |
| POST | `/v1/message/direct` · `/v1/message/group` | `message-service.ts:35-56` | `BaseResponse<MessageRecord>` |

**Mọi response có envelope `BaseResponse<T> = { data, message, status }`** (`types/base.ts:1-5`) và service unwrap `response.data.data` (vd `conversation-service.ts:34-37`). DELTA: rule `architecture-features-modules` §"The client returns the raw body — there is no envelope" viết cho backend không envelope; ở đây envelope là **contract thật của backend**, service class phải unwrap `.data` (cùng cách app nguồn làm) — không phải "đọc envelope trong component".

STOMP (`brokerURL = PUBLIC_SOCKET_URL`, `connectHeaders.Authorization: Bearer <accessToken>`, `reconnectDelay 5000`, heartbeat 10 000/10 000 — `stores/useSocketStore.ts:44-52`):

| Destination | Ai đăng ký | Payload | Nguồn |
| --- | --- | --- | --- |
| `/app/online-users` (snapshot) + `/topic/online-users` (broadcast) | `useSocketStore.ts:77-78` | `string[]` user id | backend README §Online users |
| `/user/queue/conversations` | `socket-service.ts:77-100` | `ConversationEvent` (`eventType: "conversation.updated"`) hoặc `ConversationSeenEvent` (`"conversation.seen"`) | `SocketChannel.CONVERSATION_QUEUE` |
| `/topic/conversations/{id}/messages` | `socket-service.ts:102-120` | `MessageRecord` | subscribe cần là active participant |
| `/topic/conversations/{id}/seen` | `socket-service.ts:122-140` | `ConversationSeenEvent` | — |

Vòng đời: `app.tsx:82-90` effect `connect()` khi có `accessToken`, `disconnect()` khi đổi; `useSocketStore.connect` (`:38-90`) tạo `Client`, set `onConnect/onStompError/onDisconnect/onWebSocketClose`, `activate()`; `use-chat-socket-sync.ts:38-111` (mount qua `ChatSocketProvider`) patch cache TanStack (`applyConversationUpdateToCache`, `appendConversationMessageToCache`, `applyConversationSeenToCache` trong `hooks/api/{conversation,message}.ts`) và auto `markConversationAsSeen`. Khi socket **không** connected, mutation gửi tin invalidates list (`hooks/api/message.ts:182-185`) — fallback polling-less.

### A.7 Test / CI / deploy (FACT)

- **Không có test**: `package.json` scripts không có `test`; không `test/`, `e2e/`, không `vitest`/`playwright` trong deps. `.github/workflows/ci.yml` chỉ `lint` + `format` + `typecheck` (không build). `cd.yml` `workflow_dispatch` deploy Vercel bằng `vercel build/deploy --prebuilt --prod`.
- `vercel.json`: `buildCommand: bun run build`, `outputDirectory: dist`, rewrite `/(.*)` → `/index.html`, `git.deploymentEnabled.main: false`. DELTA: `apps/smart-rental/vercel.json` chạy từ root repo (`cd ../.. && npx --yes bun@1.4.0 install --frozen-lockfile` / `… x turbo run build --filter=@monorepo/smart-rental`, `framework: vite`).
- Không Dockerfile/nginx ở nguồn; Template có (`Dockerfile` Bun builder → `nginx:stable-alpine`, validate env bằng `bun --env-file=/app/.env -e "import './src/env.ts';"` — `Dockerfile:56`).
- `public/`: `favicon.png`, `banner-login.jpg`, `banner-content.jpg`; 3 chỗ `<img src="/banner-…">` (`sign-in-template.tsx:17`, `sign-up-template.tsx:17`, `empty-conversation-banner.tsx:7`) — rule `quality-imports` §Static assets: ảnh UI render phải `import` từ `~/assets/`, `public/` chỉ giữ favicon/robots.
- `agent/`: 41 rule riêng (`agent/rules/*.md`) + skill vendored — **không** mang vào monorepo (repo đã có `.agents/rules/` 52 rule; nhiều rule nguồn trùng tên: `react-no-forwardref`, `routing-route-guards`, `tanstack-use-*`, `forms-schema-driven`…).

### A.8 Gate thật của app nguồn + kiểm chéo bằng toolchain monorepo (FACT, chạy 2026-09-18)

| Lệnh | Kết quả |
| --- | --- |
| `bun install` (cwd nguồn) | 231 packages, 17,6 s |
| `bun run typecheck` (`tsc --noEmit`, TS 6.0.3) | **exit 0** |
| `bun run build` (`rsbuild build`, env từ `.env`) | **exit 0**, "built in 1.29 s", tổng **5 264 kB** (gzip 925 kB): `index.js` 974,8 kB, `lib-react.js` 1 196 kB, chunk `emoji-mart` 2 100,7 kB, **không có file CSS** — grep `dist/static/js/index.js` thấy `MODE:"development"` → build chạy **dev mode** vì `.env` có `NODE_ENV=development` và `injectStyles` bật theo nó (`rsbuild.config.ts:33`). Số kB này **không** đại diện cho bundle production |
| `bun run check` (Biome 2.4.14, config nguồn) | "Checked 165 files … No fixes applied", exit 0 |
| Biome **2.5.12 + `biome.json` monorepo** (copy `src/` vào `apps/chat/src` trong scratchpad, `vcs` off) | **132 lỗi, 1 warning**: `assist/source/organizeImports` 101 · `lint/style/useImportType` 30 · `lint/correctness/useExhaustiveDependencies` 1 (`features/chat/hooks/use-message-composer.ts:78` "more dependencies than necessary: conversation.id" — effect refocus cố ý theo `conversation.id`) · warning `lint/suspicious/noUnnecessaryConditions` (`features/friends/hooks/use-open-direct-conversation.ts:17` `data?.pages ?? []`). Sau `biome check --write`: **còn 1 lỗi** (useExhaustiveDependencies), 104 file được format/sort lại |
| TypeScript **7.0.2** + `tooling/typescript/base.json` (tsconfig scratchpad, `paths @/*` trỏ src nguồn, `types: []`, 155 file) | **0 lỗi** |
| `babel-plugin-react-compiler` 1.0.0 (từ `apps/_template_vite/node_modules`) trên 155 file | 204 hàm compile OK, **5 bail-out** (§C.8) |

---

## §B · Map sang monorepo

### B.1 Thư mục/file nguồn → đích (FACT về hai đầu; cột "Ghi chú" là DELTA)

| Nguồn | Đích (theo `CLAUDE.md` §3 + rule) | Ghi chú |
| --- | --- | --- |
| `src/index.tsx` | `src/index.tsx` | Template import `./pages/main` (`MainApp`); giữ `setDayjsLocale` một lần nếu bỏ i18n như smart-rental (`smart-rental/src/index.tsx:10`) |
| `src/app.tsx` | `src/pages/main.tsx` (`MainApp` = providers + `BrowserRouter`; `AppRoutes` tách riêng để test — smart-rental README hàng Router) | Thêm `ErrorBoundary` + `<Toaster />` của `@monorepo/ui`, `NotFound` catch-all; `BackendHealthGate` + effect socket connect là logic riêng app — đặt ở `main.tsx` hoặc `features/layout` (DRAFT §D) |
| `src/config/routes.ts` `APP_ROUTES` | `~/constants/routes.ts` `ROUTES` (`SCREAMING_SNAKE`, builder `camelCase…Path`) | `chat`→`HOME`, `chatConversation`→`CONVERSATION_BY_ID`, `conversationById`→`conversationByIdPath` (rule `routing-constants`) |
| `src/config/routes.ts` `APP_API` | Vào **service class** (`packages/api/src/chat/*-service.ts`) — mỗi method giữ path của mình như `template-service.ts:22-24` | Rule `architecture-features-modules`: service "binds an endpoint's path, the params it accepts, and the payload it returns" — không có bảng API riêng trong app |
| `src/config/constant.ts` | `~/constants/{chat,socket}.ts` (`MESSAGES_DEFAULT_LIMIT`, `SOCKET_EVENT`, `CONVERSATION_LABELS`) | `APP_LOCALE`/`APP_TIME_ZONE`/`ONE_DAY_IN_MS` chỉ `utils/date.ts` dùng → theo `utils/date.ts` (xem dưới) |
| `src/config/env.ts` | `~/env.ts` = `createEnv(baseEnvSchema.extend({ PUBLIC_CHAT_SOCKET_URL: z.url()… }), import.meta.env)` + dòng trong `.env.example` | `PUBLIC_API_BASE_URL` → `PUBLIC_BASE_DOMAIN_API` (dùng chung, đã là `http://localhost:8000` trong `.env.example:18` — app chat cần `8089`, xem §E); `NODE_ENV` → `PUBLIC_APP_ENV`; tên `PUBLIC_CHAT_*` theo quy ước "key một app đọc mang tên app" (§3 "An env variable") |
| `src/env.d.ts` | `src/vite-env.d.ts` (`/// <reference types="vite/client" />`) | `Window.toggleDevtools` → Template dùng `// @ts-expect-error window.monorepoToggleDevtools` (`main.tsx:36-37`); `*.svg?react` không dùng (grep 0) → bỏ |
| `src/libs/axios.ts` | `~/libs/http-client.ts` = `createHttpClient({ baseURL, getAuthToken, onUnauthorized })` + singleton service | **Không tương đương** — §C.3 (refresh/retry, `withCredentials`, 403) |
| `src/libs/query-client.ts` | `~/libs/query-client.ts` Template | Nguồn thiếu `MutationCache.onError` toast; defaultOptions **giống hệt** (`staleTime 60s, gcTime 5m, keepPreviousData, retry 1, refetchOnWindowFocus false, mutations retry 0` — `query-client.ts:3-16` hai bên) |
| `src/libs/query-key-factory.ts` | `~/libs/query-key-factory.ts` Template | Gần byte-identical (cùng `QueryKeyDefinition`, `UseQueryOptionsWrapper`, `UseMutationOptionsWrapper`, `UseOptionsWrapper`); Template có thêm `UseInfiniteQueryOptionsWrapper` |
| `src/services/{auth,user,friend,conversation,message}-service.ts` | `packages/api/src/chat/{auth,user,friend,conversation,message}-service.ts`, class `ChatAuthService`… nhận `HttpClient`, trả `Promise<T>` đã unwrap `.data` | Ba điều kiện ngoại lệ third-party (**third-party, một app, key riêng**) **không** thoả — đây là backend của chính chủ repo, gọi qua `PUBLIC_BASE_DOMAIN_API` → vào package. Types → `packages/types/src/{auth,user,friend,conversation,message}.ts` (rule "Backend owns the shape → `packages/types`") |
| `src/services/health-service.ts` | `packages/api/src/chat/health-service.ts` (hoặc method trên một service) | — |
| `src/services/socket-service.ts` | **Không có tiền lệ.** Theo layering `architecture-circular-dependencies` (`~/types/constants/utils → @monorepo/* → ~/libs → ~/hooks/~/stores → ~/components → ~/features`): hàm `subscribeTo*` thuần (không React, chỉ `@stomp/stompjs` + type guard) hợp tầng **`~/libs/socket.ts`** (wiring site, cạnh `http-client.ts`) hoặc `packages/api/src/chat/socket-service.ts` nếu coi STOMP là service của backend chat (DRAFT §D) | `@stomp/stompjs` là dep mới, cần thêm catalog root |
| `src/stores/useAuthStore.ts` | `~/stores/use-auth-store.ts` | Nguồn: `{ accessToken, setAccessToken, clearState }`, **không persist** (access token sống trong memory, session khôi phục bằng refresh cookie — `use-session-check.ts`). Template: `{ token, setToken, logout }` + `persist("auth")` localStorage (`use-auth-store.ts:20-29`); E2E `signIn(page)` seed đúng shape persist (`e2e/support/auth-session.ts:7-11`). Rule `zustand-global` bảo persist; **ADR-0007 mới nói cookie session cho SSR**, không cấm SPA persist. Quyết định §E |
| `src/stores/useSocketStore.ts` | `~/stores/use-socket-store.ts` (app-wide: `client, isConnected, onlineUsers, connect, disconnect`) | Đọc `useAuthStore.getState()` (`:39`) và `env` — vẫn downward. `client: Client` trong store (object không serializable) — ok, không persist |
| `src/providers/{protected,guest}-route.tsx` | `~/features/auth/provider/{protected,guest}-route.tsx`, **default export**, không props | Giữ `useSessionCheck` + `RouteGuardLoading` nếu giữ refresh-on-boot (§E) |
| `src/providers/route-guard-loading.tsx` | `~/features/auth/components/route-guard-loading.tsx` | — |
| `src/providers/chat-socket-provider.tsx` | `~/features/chat/provider/chat-socket-provider.tsx` (slice expose `provider/` lên route tree — rule `architecture-vertical-slices`) | `ChatSocketRouteBoundary` (`app.tsx:113-129`) đi cùng |
| `src/hooks/api/*.ts` | `~/hooks/api/*.ts` — đổi `@/services/x` → `~/libs/http-client` singleton, bỏ 6 `onError` toast (`auth.ts:31-33,43-45,55-57`, `user.ts:101-103`; group/conversation hook truyền `onError` từ caller) | `useFriendsInfiniteQuery` / `useConversationsView` đọc `useSocketStore` để gắn presence — hook `~/hooks/api` import `~/stores`: cùng tầng, rule cho phép (`~/hooks/api ~/stores` cùng hàng) |
| `src/hooks/use-debounce.ts` | **xoá**, dùng `@monorepo/hook/use-debounce` (cùng chữ ký `useDebounce<T>(value, delay)`) | 2 caller: `user-search-list.tsx:7`, `use-friends-template.ts:10` |
| `src/hooks/use-throttle.ts` | **Không thay 1:1**: nguồn là throttle **callback** `useThrottle(callback, delay) → { throttle, isThrottling, clear }` (`use-throttle.ts:9-60`); `@monorepo/hook/use-throttle` là throttle **value** `useThrottle<T>(value, delay): T` (`packages/hook/src/use-throttle.ts:18`). Caller duy nhất `use-send-message.ts:84-87` (chặn double-submit 300 ms) | DRAFT: giữ hook này trong slice `~/features/chat/hooks/` (feature-only) hoặc thay bằng `isPending` của mutation + ref lock |
| `src/hooks/use-session-check.ts` | `~/features/auth/hooks/use-session-check.ts` | — |
| `src/types/*.ts` | `packages/types/src/*.ts` cho shape backend (`BaseResponse`, `Pagination*`, `UserProfile`, `ConversationRecord`, `MessageRecord`, `Friend*`, request payload, enum); UI model (`Conversation`, `ConversationMember`, `Message`, `UserItemData`, `MessageStatus`) → `~/types/` hoặc slice `types/` | Nguồn trộn cả hai trong một file (`types/conversation.ts`: `ConversationRecord` backend + `Conversation` UI); 6 `export enum` — TS7 base không bật `erasableSyntaxOnly`, giữ được |
| `src/utils/cn.ts` | **xoá**, `@monorepo/ui/utils/cn` | 31+ caller |
| `src/utils/date.ts` | `~/utils/date.ts` nhưng viết lại trên `@monorepo/dayjs` (`DATE_FORMAT`, `TIME_FORMAT`, `DATE_TIME_FORMAT`, `formats.ts`) + `.fromNow()`-style relative | Nguồn dùng `Intl.DateTimeFormat` + tự parse UTC (`parseUtcDate`, `:87-98`: timestamp không có `Z` coi là UTC); rule `dates-dayjs-singleton` cấm format string inline; `dayjs.utc()` có sẵn (plugin `utc` extend ở `packages/dayjs`) |
| `src/utils/{display,error,string,conversation}.ts` | `~/utils/*.ts` (thuần) | `display.ts` import `CONVERSATION_LABELS` + `types` — vẫn foundation |
| `src/components/ui/*` | **xoá toàn bộ**, import `@monorepo/ui/components/<name>` | Bảng B.2 |
| `src/components/shared/*` | `~/components/{avatar,user,detail}/…` (named export, thư mục theo concern) | `user-item.tsx` gọi `useUserInfoQuery` — composite tự fetch, đúng `architecture-shared-components` |
| `src/features/<feat>/**` | `~/features/<feat>/**` giữ nguyên tên slice (`auth`, `chat`, `conversation`, `current-user`, `friends`, `group`) | Đổi `<name>-template.tsx` → `<name>.template.tsx` default export; `@/` → `~/`; `toast` → `@monorepo/ui` |
| `src/features/chat/templates/chat-shell-layout.tsx` + `chat-template.tsx` shell | `~/features/layout/templates/layout.template.tsx` render `<Outlet/>` + `ChatSidebar` + `MobileChatBottomNav` | Nguồn vẽ shell hai lần (`chat-template.tsx:44-85`, `chat-shell-layout.tsx:38-60`) — gộp thành một layout route (DRAFT) |
| `src/pages/*` | `~/pages/<feat>-page.tsx` default export | `auth-page-shell.tsx` → `~/features/auth/components/` |
| `src/globals.css` | `~/globals.css` = `@import "@monorepo/tailwind-config/globals"` + `@source "../../../packages/ui"` + **khối `:root/.dark` unlayered** override teal + token `--online` (ADR-0011 shape, `smart-rental/src/globals.css:1-40`) | Nguồn khai lại toàn bộ `@theme inline` (`globals.css:6-47`) — bỏ, `theme.css` đã có; chỉ giữ giá trị `:root/.dark` (teal `--primary: oklch(0.5 0.14 175)`…) và **`--online`/`--color-online`** (theme không có; 3 file dùng `bg-online`). `@plugin "tailwindcss-animate"` → bỏ, `tw-animate-css` đã import ở `tooling/tailwind/globals.css:2` |
| `public/banner-*.jpg` | `src/assets/images/banner-*.jpg` + `import` | rule `quality-imports` §Static assets |
| `public/favicon.png` | `public/favicon.png` | — |
| `rsbuild.config.ts` | `vite.config.ts` Template (không sửa), `ports.env` do `gen:app` cấp | `html.title` → `index.html` Template |
| `vercel.json` | copy shape `apps/smart-rental/vercel.json` đổi filter | Dockerfile/nginx từ Template giữ cho job `docker` |
| `biome.json`, `tsconfig.json`, `postcss.config.mjs`, `.cursorrules`, `agent/`, `CLAUDE.md`/`AGENTS.md` nguồn | **không mang** | monorepo có một `biome.json`, tsconfig extends `@monorepo/tsconfig/base.json`, không postcss trong app Vite (`@tailwindcss/vite`) |

### B.2 Primitive `src/components/ui/*` (shadcn new-york/Radix) → `@monorepo/ui/components/*` (base-vega/Base UI 1.7.0) — FACT hai đầu

| Nguồn | Có ở `packages/ui/src/components/` | API delta phải sửa ở caller |
| --- | --- | --- |
| `avatar.tsx` (`Avatar/AvatarImage/AvatarFallback/AvatarBadge/AvatarGroup/AvatarGroupCount`, Radix) | ✅ `avatar.tsx` cùng 6 export, `AvatarPrimitive.Root.Props` Base UI | Không — caller chỉ dùng `Avatar className`, `AvatarImage src alt className`, `AvatarFallback`. Base UI `Avatar` có thêm `after:` viền ring (`avatar.tsx:20`) — cosmetic |
| `button.tsx` (Radix `Slot`, `asChild`) | ✅ `button.tsx` (`ButtonPrimitive.Props & VariantProps`), `buttonVariants` export; đủ 6 variant (`default/outline/secondary/ghost/destructive/link`) và 8 size (`default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg`) nguồn dùng (`packages/ui/src/components/button.tsx:8-43`) | **2 chỗ**: `sign-up-form.tsx:74` `<Button asChild variant="link"><Link/></Button>` → `<Link className={cn(buttonVariants({variant:"link"}), …)}>` (rule "A link that looks like a button is a `Link` + `buttonVariants`"); `chat-current-user-section.tsx:69` `DropdownMenuTrigger asChild` → `render={<CurrentUserTrigger …/>}`. `ref={emojiButtonRef}` (`message-composer.tsx:53`) và `ref={ref}` (`chat-current-user-trigger.tsx:27`) — Base UI Button nhận `ref` như prop (React 19), OK |
| `card.tsx` (không Radix) | ✅ | Không |
| `dialog.tsx` (Radix) | ✅ Base UI Dialog; `DialogContent` tự thêm nút Close (`dialog.tsx:65` `render=`), `DialogFooter` có sẵn Close `render={<Button variant="outline"/>}` (`:111`) | `open`/`onOpenChange` giữ tên; Base UI `onOpenChange(open, eventDetails)` — caller truyền `setState`/`(next)=>…` vẫn chạy. `className="max-w-md|max-w-xl"` trên `DialogContent` (`user-item-dialog.tsx:47`, `add-group-members-dialog.tsx:84`, `create-group-dialog.tsx:44`) đè `sm:max-w-md` của primitive — kiểm bằng mắt |
| `dropdown-menu.tsx` (Radix) | ✅ Base UI Menu (`Root/Trigger/Positioner/Popup/Item…`); `DropdownMenuContent` nhận `side`/`align`/`sideOffset`/`alignOffset` (`dropdown-menu.tsx:21-30`) | **3 chỗ `onSelect`** ở `chat-current-user-section.tsx:84,93,101` → Base UI `Menu.Item` không có `onSelect`, có `onClick` + `closeOnClick?: boolean` (`@base-ui/react/menu/item/MenuItem.d.ts`); `event.preventDefault()` để giữ menu mở khi mở dialog → `closeOnClick={false}` |
| `field.tsx` (không Radix; `Field/FieldLabel/FieldError errors=[…]/FieldGroup/…`) | ✅ `field.tsx` cùng API (`FieldError errors?: Array<{message?}>` — `:180-195`) | Không; nhưng form nguồn dùng `register()` thay `Controller` (`sign-in-form.tsx:52,71`) — rule `forms-field-components` bảo `Controller` (cosmetic, không chặn chạy) |
| `input.tsx`, `textarea.tsx`, `skeleton.tsx` (không Radix) | ✅ cùng tên named export | Không (`Skeleton` nguồn có `ref` prop, ui không — không caller nào truyền ref) |
| `label.tsx`, `separator.tsx`, `sheet.tsx` (Radix) | ✅ | **0 caller ngoài** → xoá, không cần map |
| `sonner` `<Toaster richColors/>` + `toast.success/error(msg)` | `@monorepo/ui/components/toast` `<Toaster/>` + `toast.add({ title, type: "success"\|"error" })` (`query-client.ts:16-22` Template) | 23 call site — §C.4 |
| `data-[state=open]` (chỉ trong `components/ui/*`, 0 chỗ ngoài) | `data-open`/`data-closed` | Không cần sửa vì file `components/ui` bị xoá |

---

## §C · Điểm gãy kỹ thuật khi "chạy được" (FACT + DELTA; mức: 🔴 chặn boot/build · 🟠 chặn Gate · 🟡 hành vi/cosmetic)

### C.1 🔴 Rsbuild → Vite: env, alias, types, CSS
- `import.meta.env.PUBLIC_*` (`config/env.ts:13-14`) — Rsbuild expose `PUBLIC_` mặc định lên cả `import.meta.env` và `process.env` (Rsbuild docs "Access Public Variables in Client Code"); Vite Template expose cùng tên nhờ `envPrefix: "PUBLIC_"` (`vite.config.ts:22`). ✅ giữ nguyên cách đọc.
- `import.meta.env.NODE_ENV` (`config/env.ts:12`, `app.tsx:37`) — Vite không có `NODE_ENV` trên `import.meta.env` (có `MODE`/`DEV`); Template dùng `env.PUBLIC_APP_ENV === "local"` (`main.tsx:32`). Đổi 2 chỗ.
- `@/*` → `~/*`: 100 % import nội bộ dùng `@/` (grep) → sed toàn cục; Vite Template đọc alias từ tsconfig `paths` (`vite.config.ts:29-33`), không khai `resolve.alias`.
- `env.d.ts` `/// <reference types="@rsbuild/core/types" />` → `vite-env.d.ts` `vite/client` (bắt buộc: TS 6+ check side-effect import `import "./globals.css"` — `knowledge-base.md:274-278`).
- `output.injectStyles` + `NODE_ENV=development` trong `.env` → §A.8: build hiện tại là dev-mode. Ở Vite, `.env` root không chứa `NODE_ENV` và Vite tự set mode theo lệnh → tự khỏi; **nhưng `PUBLIC_APP_ENV`/`PUBLIC_BASE_DOMAIN*` phải có trong `.env` root** (đã có, `.env` hiện `PUBLIC_BASE_DOMAIN_API=http://localhost:8000` — không phải 8089, §E).
- `postcss.config.mjs` (`@tailwindcss/postcss`) → bỏ; Template dùng `@tailwindcss/vite` (`vite.config.ts:27`).
- `html.title: "Chat"` → `index.html` của app.

### C.2 🟡 React Router 7.15 → 8.3.1
FACT (Context7 `/websites/reactrouter` changelog v8.0.0): "the `react-router-dom` package has been completely removed … swap imports to `react-router` and `react-router/dom`"; "all previous v8 future flags have been removed or promoted to top-level configurations" (`v8_middleware`, `v8_splitRouteModules`, `v8_viteEnvironmentApi` — framework/data mode). App nguồn: 0 import `react-router-dom`, chỉ dùng API declarative (§A.3) — Template Vite chạy y hệt bộ này trên 8.3.1 (`main.tsx:4`, `protected-route.tsx:1`, `header-*` dùng `Link`). **Không thấy breaking change chạm code nguồn**; `location.state` object (`use-direct-message-draft.ts`) và `navigate(path, { state, replace })` không đổi. Chưa xác minh: hành vi `matchPath` với `end` mặc định giữa 7.15 và 8.3 (không có mục changelog nào nhắc).

### C.3 🔴 `libs/axios.ts` (refresh token) ↔ `@monorepo/api` `createHttpClient`
FACT hai đầu:
- Nguồn (`libs/axios.ts`): `withCredentials: true` (`:43`); request interceptor gắn Bearer trừ 3 path auth (`:46-54`); response interceptor: nếu **401 hoặc 403** (`AUTH_RETRY_STATUS_CODES`, `:15`) và chưa retry và đang có token và không phải path auth → `getFreshAccessToken()` (POST `/v1/auth/refresh`, dedupe bằng promise module, `:28-39`) → set token → **retry request gốc** (`:73-85`); refresh fail → `queryClient.clear()` + `clearState()`; mọi lỗi khác → `new Error(message từ body)` (`:88-100`).
- `packages/api/src/client.ts`: options chỉ `baseURL, timeout, getAuthToken, onUnauthorized` (`:4-20`); interceptor response chỉ normalize `HttpError` và gọi `onUnauthorized` khi `statusCode === 401` (`:128-130`) rồi **throw** — không retry, không refresh; **không expose axios instance** ("Deliberately does NOT expose the underlying axios instance", `:60-66`); không set `withCredentials` (per-request `AxiosRequestConfig` truyền qua `config` của mỗi method vẫn có thể set, nhưng singleton service không tự thêm).
- Backend: token hết hạn → **403** (README §SecurityFilter) → `onUnauthorized` (401) không bắn; cookie `refreshToken` `sameSite: none; secure: true` → cần `withCredentials` **và** HTTPS ở prod (ở `http://localhost` Chrome vẫn gửi cookie `Secure` cho localhost — chưa xác minh với backend thật).
- DELTA: **không thể thay `libs/axios.ts` bằng `createHttpClient` hiện tại mà giữ refresh flow.** Ba đường (DRAFT §D): mở rộng `HttpClientOptions` trong package (`withCredentials?`, `onAuthError?: (error) => Promise<string | null>` refresh-and-retry — thay đổi package, có test ở `packages/api/test`); hoặc app giữ axios riêng trong `~/libs/http-client.ts` (vi phạm "no second HTTP layer", `CLAUDE.md` §2); hoặc bỏ refresh-retry, chỉ refresh proactively ở `useSessionCheck` + `onUnauthorized` → logout (mất tính "im lặng" khi access token 15 phút hết hạn giữa phiên).
- Thêm: `queryClient.clear()` trong interceptor (`:82`) — Template làm đúng điều đó trong `onUnauthorized` (`http-client.ts:18-24`) → cùng ý.

### C.4 🟠 `sonner` → `@monorepo/ui/components/toast`
- 23 call site (§A.5). API đích: `toast.add({ title, description?, type: "success"|"error"|… })` (Base UI toast manager, `toast.tsx:17`); Template global `MutationCache.onError` đã toast mọi mutation fail bằng `HttpError.message` (`query-client.ts:14-24`).
- Rule `tanstack-use-mutation`/`tanstack-consume-mutation`: hook **không** được `onError` toast → bỏ ở `hooks/api/auth.ts:31-33,43-45,55-57`, `hooks/api/user.ts:101-103`; các `onError: (error) => toast.error(getErrorMessage(…))` ở caller (`use-chat-sidebar.ts:56-58`, `use-group-conversation-actions.ts:43-45,53-55,63-66,83-90`, `use-current-user-section.ts:66-68`) → xoá (double toast). `toast.success` (11 chỗ) giữ, đổi API. `use-send-message.ts:104-109` `try/catch` quanh `mutateAsync` để `onRestoreContent` — giữ catch, bỏ `toast.error` bên trong.
- `useSignInMutation` v.v. nhận `options?: UseMutationOptionsWrapper<SignInPayload, SignInResponse, Error>` — Template wrapper cùng thứ tự generic `<TVariables, TData, TError>` (`query-key-factory.ts:61-69` hai bên) → giữ.

### C.5 🟡 Tailwind/CSS
- `@plugin "tailwindcss-animate"` (`globals.css:2`) — monorepo import `tw-animate-css` (`tooling/tailwind/globals.css:2`); class app nguồn dùng (`animate-in/out`, `fade-in-0`, `zoom-in-95`, `slide-in-from-*`) tồn tại trong cả hai — nhưng chỉ nằm trong `components/ui/*` bị xoá; `features/**` không dùng (grep). Không cần `tailwindcss-animate`.
- `@custom-variant dark (&:is(.dark *))` nguồn vs `(&:where(.dark, .dark *))` monorepo — không có toggle `.dark` ở nguồn (grep 0, emoji picker `theme="light"` cứng) → không ảnh hưởng.
- Token riêng **`--online`/`--color-online`** (`globals.css:31,76,112`; dùng ở 3 file) — `theme.css` không có → khai trong khối override của app (ADR-0011 pattern) hoặc đổi sang `--success` (DRAFT).
- Palette teal (`--primary: oklch(0.5 0.14 175)`, `--radius: 0.625rem`, sidebar tinted) khác neutral base-vega → **app-layer override unlayered** như `apps/smart-rental/src/globals.css` + `test/globals.test.ts` contrast (ADR-0011 §Consequences).
- `@source "../../../packages/ui"` bắt buộc (Template `globals.css:7`) để class trong primitive được scan.

### C.6 🟠 Biome + TypeScript 7 (số đo thật §A.8)
- Biome: 131/132 lỗi auto-fix (`organizeImports` theo group `:NODE:`/react/package/`@monorepo`/alias; `useImportType` "separatedType" — nguồn viết `import { type X, Y }` inline ở 30 chỗ). **1 lỗi tay**: `use-message-composer.ts:78-80` `useEffect(() => { focusComposer(); }, [conversation.id, focusComposer])` — `conversation.id` là dep cố ý (refocus khi đổi hội thoại) → cần `// biome-ignore lint/correctness/useExhaustiveDependencies: refocus on conversation change` hoặc đọc `conversation.id` trong effect. Warning `noUnnecessaryConditions` (`use-open-direct-conversation.ts:17`) — Gate chuẩn của repo là "0 warning" (`ports.ts` comment "the Gate's standard is zero warnings") → sửa `data?.pages ?? []`.
- Rule `apps/**` `noProcessEnv`: nguồn không đọc `process.env` trong `src/` (chỉ `rsbuild.config.ts:9,33`) ✅.
- TS 7.0.2 + `base.json`: **0 lỗi** (155 file). `verbatimModuleSyntax` nguồn không có trong base (base có `isolatedModules`) — không lỗi. 6 `export enum` OK (base không bật `erasableSyntaxOnly`).
- Zod: 6 file `import { z } from "zod"` (`types/sign-in-form.ts:1`, `sign-up-form.ts:1`, `add-group-members-dialog.tsx:5`, `rename-group-dialog.tsx:5`, `use-create-group-dialog.ts:5`, `config/env.ts:1`) → `import * as z` (rule `forms-schema-driven` §"Import zod as a namespace" — lý do externalize musl); `{ message }` → `{ error }`; `.string().email()` (`sign-up-form.ts:7`) → `z.email()`. Không chặn build, là rule HIGH.

### C.7 🟡 Dep ngoài repo: `@stomp/stompjs`, `react-virtuoso`, `emoji-mart`
- `@stomp/stompjs` 7.3.0: ESM (`type: module`), dùng `WebSocket` global của browser — Context7 (`/stomp-js/stompjs`): polyfill `ws` **chỉ cho Node**; `Client({ brokerURL, connectHeaders, reconnectDelay, heartbeatIncoming/Outgoing })`, `activate()`/`deactivate()` (Promise) — đúng cách nguồn dùng. Vite bundle được, không cần `define`/polyfill. Thêm vào catalog root (rule "never hardcode a version" trong app `package.json`).
- `react-virtuoso` 4.18.7: peer `react >= 19` ✅, build/typecheck OK trên 19.2.6 (§A.8). Không có trong catalog; repo có `@tanstack/react-virtual` (catalog `tanstack-table9`) và primitive `message-scroller` (`packages/ui/src/components/message-scroller.tsx`, `@shadcn/react/message-scroller`: `Provider/Root/Viewport/Content`, auto-scroll, nút "scroll to bottom"), `message.tsx` (`Message/MessageGroup/MessageAvatar/MessageContent/MessageHeader…`), `bubble.tsx` (`BubbleGroup`, `bubbleVariants` default/secondary/muted/tinted/outline/ghost/destructive). Giữ virtuoso = thêm 1 catalog entry; đổi sang primitive = viết lại `message-list.tsx` + `message-bubble.tsx` + `conversation-list.tsx` (không bắt buộc để "chạy được"; DRAFT §D/§E).
- `@emoji-mart/react` 1.1.1: peer `react ^16.8||^17||^18` (không khai 19) — cài và chạy được dưới 19.2.6 (§A.8), nhưng là warning peer; chunk **2,1 MB dev / 409 kB gzip** (`@emoji-mart/data` `sets/15/native.json` 424 kB) — Context7: khuyến nghị `lazy(() => import('@emoji-mart/react'))` + `data` async. Nguồn import tĩnh cả hai (`message-composer.tsx:1-2`) và render **2 `<Picker>`** (mobile/desktop, `:80-93`).

### C.8 🟡 React Compiler (Template bật qua `@rolldown/plugin-babel` + `reactCompilerPreset()`, `vite.config.ts:26`)
Chạy `babel-plugin-react-compiler` 1.0.0 trên 155 file: 204 hàm compile, **5 bail-out** (mỗi cái = hàm đó chạy không memo, không lỗi build):

| File:line | Lý do compiler | Pattern |
| --- | --- | --- |
| `features/conversation/components/conversation-list.tsx:61` | "This value cannot be modified" | `conversationListFooterState.isFetchingNextPage = isFetchingNextPage` trong render (`:76`) — mutate object module-scope để `Virtuoso components.Footer` (khai ở module, `:47-55`) đọc được; đúng lỗi rule `react-no-inline-components` cố tránh nhưng đổi thành mutation. Sửa: `context` prop của Virtuoso hoặc `useMemo` components |
| `features/chat/hooks/use-send-message.ts:23` (×2) | "Existing memoization could not be preserved" | `useCallback` deps `sendDirectMessageMutation.mutateAsync` (`:57-62`) — compiler không chứng minh được memo tương đương |
| `features/group/components/add-group-members-dialog.tsx:36` | "Use of incompatible library" | `watch("memberIds")` của RHF (`:58`) |
| `features/group/hooks/use-create-group-dialog.ts:30` | "Use of incompatible library" | `form.watch("memberIds")` (`:44`) — rule `forms-use-watch` bảo `useWatch` |

Ngoài ra không có ref đọc trong render (grep `.current` chỉ trong effect/callback), `useLayoutEffect` ở `use-message-list-auto-scroll.ts:25` hợp lệ.

### C.9 🟠 Port dev/E2E
`apps/*/ports.env` hiện: 3000/3100 (`_template_vite`), 3001/3101 (`_template_next`), 3002/3102 (`portfolio`), 3003/3103 (`documents`), 3004/3104 (`mcp`), 3005/3105 (`_template_reactrouter`), 3006/3106 (`smart-rental`). `nextFreePortPair` (`turbo/generators/config.ts:168-190`) quét slot thấp nhất trống cả hai band → app mới nhận **3007 / 3107**. **Backend chốt origin `http://localhost:3000`** (`chat-socket.client-url`, §A.6) cho CORS + WS → phải đổi `chat-socket.client-url` (YAML/env của backend) sang `http://localhost:3007`, nếu không `GET /health-check` fail CORS và `BackendHealthGate` treo "Connecting to server..." vô hạn (`app.tsx:68-77`). (Ghi chú: app nguồn chạy port 3000 — trùng `_template_vite`.)

### C.10 🟡 Dockerfile · nginx · vercel.json
- Template Dockerfile validate env bằng `import './src/env.ts'` (`:56`) → `PUBLIC_CHAT_SOCKET_URL` phải có trong `.env.example` (job `docker` build với `BUILD_ENV=example`, `ci.yml` §docker). `gen:app` rewrite `APP_DIRNAME`/`PROJECT` ARG.
- nginx SPA fallback đã có (`nginx.conf:23-26`); không cần proxy `/api` vì app gọi origin tuyệt đối `PUBLIC_BASE_DOMAIN_API`.
- `vercel.json`: theo `smart-rental` (install/build từ root qua `npx --yes bun@1.4.0`, `framework: vite`, rewrite SPA); env `PUBLIC_*` từ dashboard. Nguồn tắt auto-deploy `main` (`git.deploymentEnabled.main: false`) — quyết định giữ hay không (§E).

### C.11 🟡 CI tự bắt app mới
- `docker`: matrix `find apps -mindepth 2 -maxdepth 2 -name Dockerfile` (`ci.yml:167`) → tự có. `changes.app` match `apps/` (`:126`).
- `e2e`: **HEAD `ca9ff52` còn job `e2e`** (glob `apps/*/playwright.config.ts`, `ci.yml@HEAD:193-251`), nhưng **working tree hiện xoá job này** ("E2E (Playwright) is local-only — `bun run e2e` — and does not run in CI", diff chưa commit) → nếu commit, app mới chỉ chạy E2E local. Bốn Gate `check/typecheck/test/build` tự bắt qua Turbo.
- App nguồn không có test → `test` task: Turbo bỏ qua app không có script `test`, nhưng clone từ Template có `vitest run` với `include: test/**` → cần ≥ 1 test (Template có 4 test cần sửa/bỏ: `env.test.ts`, `sign-in-form`, `protected-route`, `home.template`).

---

## §D · Phương án (DRAFT — chủ repo quyết)

### PA1 — `gen:app` Runtime `vite`, port từng lớp lên chuẩn repo (như #127 pha 1)
Trình tự gợi ý (mỗi bước Gate xanh): (1) `bun run gen:app` → `apps/chat` (3007/3107), strip `home` slice + i18n như smart-rental (README "Những gì cố ý không có" 1–3); (2) `@monorepo/types` + `packages/api/src/chat/*-service.ts` (5–6 class) + `~/libs/http-client.ts` — **kèm quyết định refresh-token** (§C.3: khuyến nghị mở rộng `HttpClientOptions` một lần trong package, có test, vì đây là app thứ nhất có backend thật với refresh cookie và `mcp`/`smart-rental` sẽ cần cùng cơ chế khi nối BE); (3) copy `types/utils/constants/stores/hooks/api` + `biome check --write` + sed `@/`→`~/`; (4) copy `features/**` + `components/shared`, đổi 12 primitive theo B.2 (2 `asChild`, 3 `onSelect`, 23 toast, 3 `<img>`), template `.template.tsx` default export; (5) socket layer: `~/libs/socket.ts` (subscribe fns) + `~/stores/use-socket-store.ts` + `~/features/chat/provider/chat-socket-provider.tsx`; (6) `globals.css` override teal + `--online` + `test/globals.test.ts`; (7) `test/pages/main.test.tsx` seam (mount `AppRoutes` mọi `ROUTES`, mock `~/libs/http-client`) + `e2e/auth.e2e.ts`; (8) `vercel.json`, README, `.env.example`, CLAUDE.md §1/§6 dòng app mới.
- **Chi phí**: trung bình — UI delta nhỏ (§B.2), phần lớn code copy được; điểm tốn công thật: service class + types (tách backend shape khỏi UI model), refresh-token ở package, socket layering, viết test từ 0.
- **Rủi ro**: quyết định package (`@monorepo/api`) ảnh hưởng mọi app dùng `createHttpClient` (chỉ Template + smart-rental `httpClient` bare) — nhỏ nếu thêm option opt-in.
- **Khớp rule**: `architecture-ui-primitives` ("never hand-copied into an app"), `architecture-features-modules` (no `~/services/`), ADR-0001 tinh thần ("mỗi app quay lại `apps/` bằng ticket migrate", "không `git mv`", spec legacy-migrate US 1, 13, 14: "không còn gói Radix … trực tiếp").

### PA2 — copy nguyên `src/` vào clone Template, giữ `components/ui` Radix + `sonner` + `libs/axios.ts` "để chạy trước", chuẩn hoá sau
- **Chạy được nhanh nhất** (≈ sed alias + env + 1 biome-ignore + thêm 3 dep `radix-ui`/`sonner`/`tailwindcss-animate` vào catalog), Gate `check/typecheck/build` có thể xanh trong một ticket.
- **Đối chiếu rule/ADR**: rule `architecture-ui-primitives` (CRITICAL) nói thẳng "Add a primitive with the shadcn generator — never hand-copy one into an app"; `knowledge-base.md:216-218` đặt invariant "nothing declares `@radix-ui/*` directly"; spec #127 (US 33) và legacy-migrate spec (US 14) đều lấy "không Radix/sonner trong app" làm điều kiện đóng ticket; ADR-0001 chọn "migrate ticket riêng" thay vì "giữ trong `apps/` và lọc bằng `--filter`" **chính vì** không muốn Gate giả và hai hệ primitive trong workspace. **Repo không có tiền lệ cho trạng thái quá độ này** — nếu chọn PA2 thì phải là quyết định có ghi (issue/ADR) với hạn chuẩn hoá, không phải mặc định.
- Rủi ro kỹ thuật: `radix-ui` 1.4.3 + `@base-ui/react` 1.7.0 cùng bundle (Template import `@monorepo/ui/components/toast` cho Toaster) — hai hệ portal/z-index; `@radix-ui/*` hiện chỉ transitive qua `cmdk` (knowledge-base) → thêm direct dep phá invariant.

### PA3 — PA1 nhưng thay `react-virtuoso` bằng `message-scroller` + `message`/`bubble` của `@monorepo/ui` ngay trong port
- Lợi: không thêm catalog entry, dùng primitive chat đã có (`bubble.tsx`, `message.tsx`, `message-scroller.tsx`), một hình dạng bubble với Storybook.
- Chi phí: viết lại `message-list.tsx` (reverse-infinite `firstItemIndex` + `startReached` + `followOutput`) và `conversation-list.tsx` trên `MessageScroller` — chưa xác minh `@shadcn/react/message-scroller` có hỗ trợ "prepend older messages giữ scroll offset" (cần đọc source `@shadcn/react` hoặc Storybook `message-scroller` trước khi cam kết). Đề xuất để pha 2 (redesign), không trộn vào "chạy được".

**Khuyến nghị**: **PA1**, với `react-virtuoso` + `emoji-mart` giữ (thêm catalog), `useThrottle` callback giữ trong slice `chat`, refresh-token giải ở `@monorepo/api` bằng option opt-in. PA3 là ticket pha 2.

---

## §E · Câu hỏi mở cho grill

1. **Tên app**: `apps/chat` (`@monorepo/chat`, `dev:chat`, `PUBLIC_CHAT_*`) hay `apps/chat-socket`? Tên ảnh hưởng key env và Dockerfile ARG do `gen:app` ghi.
2. **Env key & giá trị**: `PUBLIC_BASE_DOMAIN_API` dùng chung hiện là `http://localhost:8000` (`.env.example:18`) — app chat cần `http://localhost:8089`; chấp nhận **một root `.env` cho mọi app** nghĩa là mọi app Vite build với `8089` khi dev chat (README §2: "two apps that reuse a key are not sharing a default, they are each building with the other's value"), hay khai `PUBLIC_CHAT_API_BASE_URL` riêng (app nguồn tự nối `/api`)? Socket: `PUBLIC_CHAT_SOCKET_URL` riêng chắc chắn.
3. **Refresh-token ở tầng nào** (§C.3): mở rộng `createHttpClient` (`withCredentials`, `onAuthError` refresh-and-retry, `HttpError` 403) trong `@monorepo/api` — hay app giữ axios riêng — hay bỏ silent-refresh? Backend trả 403 cho token hết hạn: `onUnauthorized` hiện chỉ bắt 401.
4. **Session persist**: giữ mô hình nguồn (access token trong memory + refresh cookie + `useSessionCheck` loading gate) hay đổi sang `persist` localStorage như Template/smart-rental (đơn giản hoá guard + E2E `signIn(page)` seed)? Persist access token 15 phút vào localStorage có nghĩa gì với backend hiện tại?
5. **i18n**: app nguồn hardcode **tiếng Anh** (`"Welcome back"`, `"Sign in"`, `"No messages yet."`…). Bỏ `@monorepo/i18n` như smart-rental (README "Không i18n") hay mang catalogue `chat.*` (vi/en ICU, `packages/i18n/src/languages.ts:11` có `vi`, `en`) ngay từ port? Ảnh hưởng `utils/date.ts` (rule `dates-locale-render-input`).
6. **Backend contract ổn định chưa?** Backend `chat-socket` HEAD `9beb0ba` mới 5 commit; README có "Chưa xác định trong source hiện tại" ở vài chỗ. Có đổi `client-url` sang 3007 (hoặc allow list) không? Prod domain?
7. **Vercel**: giữ deploy Vercel (project mới trỏ monorepo như smart-rental) hay chỉ Docker? Nguồn tắt auto-deploy `main`.
8. **E2E cần backend thật**: mọi màn sau `BackendHealthGate` cần `GET /health-check` → E2E `chromium` trên `vite preview` sẽ treo "Connecting to server..." nếu không có backend. Chấp nhận E2E chỉ cho `/sign-in` UI với mock ở service singleton (Playwright `page.route` chặn `/health-check`)? Hay spin backend Docker (Postgres + Redis + Java 25) — không có trong CI hiện tại.
9. **Virtuoso vs `message-scroller`** (PA3): giữ dep hay đổi primitive, và ở pha nào?
10. **Emoji**: giữ `emoji-mart` (2 `<Picker>`, ~400 kB gzip, peer không khai React 19) hay lazy-load theo docs, hay bỏ tạm?
11. **Redesign?** Port 1:1 (teal palette + shape hiện tại, override ADR-0011 style) hay đi bước design trước như smart-rental pha 2? Note này giả định port 1:1.
12. **`useThrottle` callback**: giữ trong slice `chat` (Own) hay nâng lên `@monorepo/hook` với tên khác (`use-throttled-callback`) — ADR-0010 quy ước Derived/Own.
13. **Archive repo nguồn** `qtuan02/chat-socket-fe` sau khi deploy (như `fe-motel-rsbuild` ở #127 US 36)?

---

## §F · Nguồn

**App nguồn** (`D:\Personal\chat\chat-socket-fe`, git HEAD `d56134d`): `package.json`, `rsbuild.config.ts`, `tsconfig.json`, `biome.json`, `components.json`, `vercel.json`, `.env.template`, `.env`, `.nvmrc`, `postcss.config.mjs`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `agent/AGENTS.md`, `.github/workflows/{ci,cd}.yml`, `public/*`, và **toàn bộ `src/**`** (155 file, liệt kê ở §A.2 — trích dẫn `path:line` xuyên suốt).

**Backend** (`D:\Personal\chat\chat-socket`, HEAD `9beb0ba`, chỉ đọc): `README.md` (§4 port, §5 config, §6 auth/SecurityFilter, §7 REST, §9 STOMP, §Security notes CORS), `src/main/java/com/chat_socket/config/WebSocketConfig.java`, `config/SecurityServerConfig.java:54-62`, `constant/{RouteApi,SocketChannel}.java`, `ApplicationYaml.java`.

**Monorepo** (`D:\Personal\monorepo`, `dev` @ `ca9ff52`): `CLAUDE.md` §1–§3, §6, §7a; `apps/_template_vite/{package.json,vite.config.ts,tsconfig.json,ports.env,ports.ts,turbo.json,Dockerfile,nginx.conf,vitest.config.ts,playwright.config.ts,e2e/support/auth-session.ts,src/{index.tsx,env.ts,vite-env.d.ts,globals.css,constants/routes.ts,libs/*,stores/use-auth-store.ts,pages/main.tsx,features/auth/provider/*,hooks/api/template.ts}}`; `apps/smart-rental/{README.md,vercel.json,package.json,src/globals.css,src/index.tsx}` + `ls test e2e`; `apps/*/ports.env`; `packages/api/src/{client.ts,template/template-service.ts}`, `packages/api/package.json`; `packages/env/src/vite/{create-env,schema}.ts`; `packages/hook/src/{use-debounce,use-throttle}.ts` + `ls`; `packages/ui/{package.json,components.json}`, `packages/ui/src/components/{avatar,button,dialog,dropdown-menu,textarea,toast,sheet,field,skeleton,bubble,message,message-scroller}.tsx`, `packages/ui/node_modules/@base-ui/react/{menu/item/MenuItem.d.ts,dialog/root/DialogRoot.d.ts}`; `packages/dayjs/src/formats.ts`; `packages/i18n/src/languages.ts`; `tooling/tailwind/{globals,theme}.css`; `tooling/typescript/base.json`; `biome.json`; `package.json` (catalogs); `.env.example`; `.env` (chỉ đọc key `PUBLIC_*`); `.github/workflows/ci.yml` (HEAD và working tree); `turbo/generators/config.ts:100-232`; `.agents/rules/{architecture-*,routing-*,tanstack-*,zustand-*,forms-*,quality-imports,quality-styling-tailwind,dates-*,testing-*,react-*}.md`; `.agents/knowledge-base.md:195-225,270-285`; `.agents/plans/legacy-migrate/spec.md`; `docs/adr/{0001,0003,0011}*.md`; `docs/research/smart-rental-rebuild.md` (40 dòng đầu, shape note).

**GitHub**: spec [#127](https://github.com/qtuan02/monorepo/issues/127) (qua `gh issue view 127 --repo qtuan02/monorepo`).

**Docs chính thống (Context7, 2026-09-18)**: React Router — `/websites/reactrouter` "v8.0.0 › What's Changed › Removed react-router-dom", "Upgrading from v7", future flags `v8_middleware`/`v8_splitRouteModules` ([reactrouter.com/start/changelog](https://reactrouter.com/start/changelog), [reactrouter.com/upgrading/v7](https://reactrouter.com/upgrading/v7)); `@stomp/stompjs` — `/stomp-js/stompjs` README + llms.txt ("Node.js only: polyfill WebSocket", `Client` config, `activate`/`deactivate`) ([github.com/stomp-js/stompjs](https://github.com/stomp-js/stompjs)); emoji-mart — `/missive/emoji-mart` React wrapper + "Lazy Load Emoji Data" + Picker props ([github.com/missive/emoji-mart](https://github.com/missive/emoji-mart)); Rsbuild — `/web-infra-dev/rsbuild` "Access Public Variables in Client Code", `output.injectStyles` ([rsbuild.rs/guide/advanced/env-vars](https://rsbuild.rs/guide/advanced/env-vars)).

**Đo đạc trong session** (scratchpad, không commit): `bun install/typecheck/build/check` tại app nguồn; Biome 2.5.12 (`node_modules/.bin/biome` của monorepo) với `biome.json` gốc (`vcs` off, `includes ["**"]`) trên bản copy `apps/chat/src`; `tsc` 7.0.2 với tsconfig extends `base.json`; `babel-plugin-react-compiler` 1.0.0 từ `apps/_template_vite/node_modules`.

**Chưa xác minh**: (1) `matchPath` mặc định `end` giữa RR 7.15 và 8.3; (2) Chrome gửi cookie `Secure; SameSite=None` cho `http://localhost:8089` với backend thật (chỉ đọc README); (3) `@shadcn/react/message-scroller` hỗ trợ prepend giữ scroll offset (PA3); (4) size bundle **production** của app nguồn (build hiện tại là dev-mode); (5) `application.yaml` local của backend (file không đọc — chỉ `application-template.yaml` qua README).
