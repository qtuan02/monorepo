# Nghiên cứu React error boundary cho `apps/chat` — bọc ở đâu để một Island sập không kéo cả app

> Ngày kiểm tra: **2026-09-20**, nhánh `dev`, HEAD `5be9870` (working tree đang dirty ở `apps/chat/**` bởi một session khác — sweep i18n; mọi `path:line` dưới đây đọc từ **working tree tại thời điểm kiểm tra**, không phải HEAD, nên có thể lệch vài dòng sau khi session kia commit). Nguồn: **code thật** của `apps/chat` (`src/pages/main.tsx`, `src/components/exception/*`, `src/libs/{query-client,socket}.ts`, `src/stores/use-socket-store.ts`, `src/hooks/api/*`, `src/features/{conversation,friends,group,current-user,layout,auth,chat}/**`, `src/utils/*`, `test/pages/main.test.tsx`, `test/features/layout/provider/theme-provider.test.tsx`, `vitest.config.ts`, `README.md`, `CONTEXT.md`), `packages/api/src/chat/*`, `packages/types/src/chat-base.ts`, tiền lệ ở `apps/{_template_vite,documents,smart-rental}/src/pages/main.tsx`, `apps/_template_next/src/app/[locale]/error.tsx`, `apps/_template_reactrouter/src/{root.tsx,routes/module.tsx}` + `test/routes/module.test.tsx`; **source đã cài** trong `node_modules/.bun/` (`react-error-boundary@6.1.4`, `@tanstack/query-core@5.102.8`, `@tanstack/react-query@5.102.8`, `react@19.2.8`); **docs chính thống** qua Context7 (`/bvaughn/react-error-boundary`, `/reactjs/react.dev`, `/tanstack/query`, `/colinhacks/zod`, `/vitest-dev/vitest`) và WebFetch `react.dev/reference/react-dom/client/createRoot`; rule `.agents/rules/{patterns-loading-skeletons,patterns-self-fetching-components,tanstack-consume-query,react-effects-sync-only,architecture-shared-components,testing-coverage,react-no-forwardref}.md`.
>
> **Ba loại nội dung:** **FACT** = đọc từ code/source đã cài/docs, trích được; **DELTA** = khoảng cách giữa app và rule/docs, hai đầu đều FACT; **DRAFT** = đề xuất/câu hỏi của agent — chỉ ở §C và §E. Không bịa số; chỗ không kiểm được ghi **"chưa xác minh"**.
>
> **Không sửa file nào ngoài note này, không commit.**

Cấu trúc: **TL;DR** → **§A Hiện trạng `apps/chat`** → **§B Cơ chế (FACT)** → **§C Các mức bọc (DRAFT)** → **§D Test seam** → **§E Câu hỏi mở** → **§F Nguồn**.

---

## TL;DR

1. **Hôm nay có đúng một boundary, bọc toàn cây, fallback là reload cả trang** — `src/pages/main.tsx:86-105` bọc cả `Toaster` + `QueryClientProvider` + `BrowserRouter`; fallback `~/components/exception/internal-server-error.tsx` là `window.location.reload()` (FACT §A.1). Bốn app Vite (`_template_vite`, `documents`, `smart-rental`, `chat`) đều cùng shape này; chỉ hai Runtime server có boundary **dưới** shell (`_template_reactrouter/src/routes/module.tsx:79`, `_template_next/.../error.tsx` với `reset`) — §A.3.
2. **Bề mặt "crash vì `undefined`" của `apps/chat` nhỏ hơn câu hỏi giả định**: grep không thấy `.data.<field>` không optional-chain, không thấy non-null `!`, không có `as` cast lên payload; mọi consumer `query.data` đều `?.`/`?? []` (§A.2 bảng 1). Socket payload đã qua type guard tay (`src/libs/socket.ts:37-96`) — message sai shape bị **drop**, không vào cache.
3. **Chỗ còn tin backend theo type mà không kiểm runtime là bên trong record**: `record.participants.map` (`map-conversation-to-ui-model.ts:25`, chạy trong `useMemo` của `use-conversation-list.ts:37-40`), `conversation.members.*` ở 4 file, và `getInitials(title)` → `name.trim()` (`utils/display.ts:16`) khi một user record thiếu cả `firstName/lastName/username` — đây là những TypeError **trong render** mà chỉ error boundary bắt được (§A.2 bảng 2).
4. **Lỗi trong `queryFn` (kể cả `response.data.messages` khi envelope thiếu `data`) và lỗi trong `select` đều thành `isError`, KHÔNG lên boundary** — `queryObserver.js:218-236` bắt `select` throw và set `status = "error"`; `useBaseQuery.js:39-45` chỉ `throw result.error` khi `throwOnError`/`suspense` (FACT §B.3). Mọi hook `select` của chat (`conversation.ts:183`, `message.ts:114-124`, `friend.ts:84`, `user.ts:91`) vì thế đã an toàn với boundary.
5. **`react-error-boundary` 6.1.4 đúng như README**: `fallback | fallbackRender | FallbackComponent` (loại trừ nhau ở type), `onError(error: unknown, info)`, `onReset({reason: "imperative-api" | "keys"})`, `resetKeys` so bằng `Object.is` từng phần tử, `useErrorBoundary()` → `{ error, resetBoundary, showBoundary }`; **không bắt** event handler / async / SSR / lỗi trong chính boundary (`dist/react-error-boundary.d.ts`, `.js:1-73`). `withErrorBoundary` dùng `forwardRef` → tránh (rule `react-no-forwardref`).
6. **React 19 root có `onCaughtError`/`onUncaughtError`/`onRecoverableError` trên `createRoot`** (react.dev); `apps/chat/src/index.tsx:12` chưa truyền gì → mặc định React log ra console. Dev mode: lỗi đã bắt vẫn bubble lên `window.onerror`; prod thì không (react.dev `Component.md`).
7. **react.dev nói thẳng về granularity cho "messaging app"**: bọc *danh sách hội thoại* và *từng message* là hợp lý, bọc từng avatar thì không (`Component.md` § Catching rendering errors). Khớp với Islands: một Island = một boundary.
8. **Khuyến nghị (DRAFT, §C.5)**: giữ root boundary; thêm **một** composite `~/components/exception/island-error.tsx` (fallback vừa footprint Island + nút Retry gọi `resetErrorBoundary`) và bọc **ba Island có query**: `ConversationList`, `ConversationPanel`, `ConversationDetailsPanel` (+ `FriendsTemplate`/`ProfileTemplate` là Island duy nhất của route nên bọc ở template) — mỗi chỗ `<QueryErrorResetBoundary>` + `<ErrorBoundary onReset={reset} FallbackComponent={IslandError} resetKeys={[conversationId]}>`. Không đổi `throwOnError`, không Zod hoá API layer ở vòng này — `isError` branch đã có ở mọi Island trừ `ConversationList` (DELTA §A.2), và Zod ở `packages/api` là quyết định tầng package cần grill riêng.

---

## §A · Hiện trạng `apps/chat`

### A.1 Một boundary, ở gốc (FACT)

- `src/pages/main.tsx:86-105` — `MainApp` render `<ErrorBoundary fallback={<InternalServerError />} onError={(error, info) => console.error("Uncaught render error:", error, info.componentStack)}>` bọc `Toaster`, `QueryClientProvider`, devtools, `BrowserRouter > AppRoutes`. Không có `onReset`, không `resetKeys`, không `QueryErrorResetBoundary`.
- `src/components/exception/internal-server-error.tsx:9-23` — màn `min-h-svh`, `<h1>Something went wrong</h1>`, nút `Reload page` → `window.location.reload()`. Docblock: *"A full reload rather than a retry button: at this point the app's state is of unknown validity"*.
- `src/index.tsx:12-17` — `ReactDOM.createRoot(rootEl)` **không** truyền option `onCaughtError`/`onUncaughtError`/`onRecoverableError`.
- **Hệ quả FACT**: một TypeError trong render của bất kỳ Island nào (Rail, list, pane, Details, Bottom nav, Friends, Profile) → toàn bộ cây bị thay bằng màn reload; `Toaster` và `QueryClientProvider` cũng unmount (chúng nằm **trong** boundary) → cache TanStack mất khi reload, socket `Client` mất theo (store không persist — `use-socket-store.ts:16-19`).
- `AppRoutes` (`main.tsx:39-73`) tách khỏi `MainApp` để `test/pages/main.test.tsx` mount riêng → **test hiện tại không đi qua boundary nào** (`renderAt`, `main.test.tsx:151-171` bọc `AppRoutes` bằng `QueryClientProvider` + `VirtuosoMockContext` + `RouterProvider`, không `ErrorBoundary`).

### A.2 Inventory chỗ đọc data (FACT + DELTA)

**Phương pháp**: grep `\.data\.[a-zA-Z]` (loại `?.`), non-null `!`, `as <Type>`, `[0]`/index access, và `.(participants|items|pages|members|…)\.(map|filter|length|…)` trên toàn `apps/chat/src`. Kết quả:

- `.data.<field>` không optional-chain: **0** khớp. Non-null assertion: **0**. `as` cast lên payload: **0** (chỉ 2 cast trên giá trị `Select` UI: `language-toggle-button.tsx:46`, `theme-toggle-button.tsx:39`). Index access: chỉ `utils/display.ts:19-20` và đã `?.`/`?? ""` (`noUncheckedIndexedAccess` bật ở `tooling/typescript/base.json`).

**Bảng 1 — consumer của `query.data` (tất cả đã guard, không thể throw vì `data === undefined`)**

| Nơi | Đọc | Guard |
| --- | --- | --- |
| `features/chat/provider/chat-socket-provider.tsx:48` | `currentUserQuery.data?.id` | `?.` |
| `features/conversation/hooks/use-conversation-list.ts:35,39` | `currentUserQuery.data?.id`, `(conversationsQuery.data ?? [])` | `?.`, `?? []`, `if (!currentUserId) return []` |
| `features/conversation/hooks/use-conversation-messages.ts:25-26` | `messagesQuery.data?.messages ?? []`, `?.olderMessageCount ?? 0` | `?.` + `??` |
| `features/conversation/components/conversation-panel.tsx:85,110` | `currentUserQuery.data?.id`, `activeConversation?.members.length ?? 0` | `?.` |
| `features/conversation/components/message-list.tsx:43` | `currentUserQuery.data?.id` | `?.` |
| `features/conversation/components/conversation-details-panel.tsx:90-92` | `userInfoQuery.data?.bio && … userInfoQuery.data.bio` | `&&` narrowing |
| `features/conversation/components/people-search-results.tsx:35` | `(peopleQuery.data ?? []).filter` | `?? []` |
| `features/conversation/hooks/use-send-message.ts:30,66` | `currentUserQuery.data?.id` | `?.` |
| `features/friends/components/{friends-list-section.tsx:38,friend-request-section.tsx:104-105,find-people-section.tsx:75}` | `.data ?? []`, `.data?.receivedRequests ?? []` | `??` |
| `features/friends/templates/friends.template.tsx:47` | `requestsQuery.data?.receivedRequests.length ?? 0` | `?.` (receivedRequests là required trong type) |
| `features/layout/hooks/use-nav-badges.ts:22,25` | `(conversationsQuery.data ?? []).filter`, `.data?.receivedRequests.length ?? 0` | `??` |
| `features/current-user/templates/profile.template.tsx:43-51` | `currentUserQuery.data` → `if (!currentUser) return "Unable to load your profile."` | early return |
| `features/group/components/group-member-picker.tsx:42` | `(friendsQuery.data ?? [])` | `?? []` |
| `components/user-detail-dialog.tsx:72` | `const user = userQuery.data;` | chưa xác minh dòng sau (không đọc trọn file) |

**Bảng 2 — chỗ tin shape bên trong record (payload backend/socket đúng type thì không sao; thiếu field thì TypeError TRONG RENDER → chỉ boundary bắt)**

| Nơi | Biểu thức | Nổ khi | Chạy ở đâu |
| --- | --- | --- | --- |
| `features/conversation/utils/map-conversation-to-ui-model.ts:25` | `record.participants.map(…)` | `participants` không phải mảng | trong `useMemo` của `use-conversation-list.ts:37-40` → render của **mọi** consumer `useConversationList` (list, panel, messages, `use-send-message`) |
| `features/conversation/components/conversation-details-panel.tsx:55` | `conversation.members.find` | `members` undefined — chỉ nếu mapper trên đã đổi shape (mapper luôn tạo `members`), thực tế được che bởi dòng trên | render Details |
| `features/group/templates/group-panel.template.tsx:152-160,192` | `conversation.members.find/map/filter/length` | như trên | render Details (group) |
| `features/conversation/hooks/use-send-message.ts:36` | `conversation.members.find` | như trên | trong handler `mutate` → **không** phải render; boundary không bắt (§B.1) |
| `utils/display.ts:16` (`getInitials`) | `name.trim()` | `title`/`displayName` là `undefined` — xảy ra khi `getDisplayName(user)` (`display.ts:8-12`) nhận user thiếu cả 3 field: `[…].filter(Boolean).join(" ") \|\| user.username` → `undefined` | `components/avatar/conversation-avatar.tsx:33`, gọi từ `user-item.tsx:71`, `user-info.tsx:74`, list item, panel header |
| `features/conversation/components/message-list.tsx:56,65` | `messages[topVisibleIndex]`, `groupMessages(messages, …)` | `messages` luôn là mảng từ `?? []`; `[i]` trả `undefined` không throw | render — an toàn |
| `utils/date.ts:19` (`toLocal`) | `dayjs.utc(value).local()` | `value` undefined → dayjs "now"/Invalid Date, **không throw** | render — an toàn về crash, sai về hiển thị |
| `hooks/api/conversation.ts:113`, `message.ts:69-70` | `conversation.participants.map`, `page.items.some` | chạy trong `setQueriesData` updater từ callback socket / `onSuccess` → **không phải render**, boundary không bắt; lỗi rơi vào callback STOMP (`socket.ts:150-160`) hoặc mutation `onSuccess` | ngoài render |

**Socket trust boundary (FACT)**: `src/libs/socket.ts:37-96` có `isChatMessagePayload`, `isChatConversationUpdatedEvent`, `isChatConversationSeenEvent` kiểm `typeof` từng field + `MESSAGE_TYPES.has(type)`; `subscribeTo*` (`:150-160`, `:167-179`) **return sớm** khi guard fail. `sanitizeOnlineUserIds` (`:100-109`) lọc phần tử không phải string. Nghĩa là: một socket message "unexpected shape" **không** vào cache → không thể gây render crash. Lỗ duy nhất: guard kiểm field của message nhưng `ChatConversationUpdatedEvent.lastMessage` được `isChatMessagePayload` kiểm — đủ.

**HTTP trust boundary (FACT)**: `packages/api/src/chat/*-service.ts` unwrap envelope `ChatBaseResponse<T>.data` (`chat-base.ts:8-12`) rồi trả `response.data` / `response.data.messages` (`conversation-service.ts:31-33`, `message-service.ts:30-31,43,54`, `user-service.ts:26,35-36,46,55`, `friend-service.ts:32`) — **không có runtime validation** (grep `zod|safeParse` trong `packages/api/src/chat`, `packages/types/src/chat-*.ts`: 0). Envelope thiếu `data` → TypeError **trong `queryFn`** → promise reject → `isError` (§B.3), không phải render crash.

**DELTA — nhánh `isError` theo Island**

| Island / vùng | `isLoading` skeleton | `isError` + Retry | Ghi chú |
| --- | --- | --- | --- |
| `ConversationList` (`conversation-list.tsx:131-136`) | có (`ConversationListSkeleton`) | **không** — `useConversationList` trả `isError` (`use-conversation-list.ts:47`) nhưng `conversation-list.tsx:94-100` không destructure | HTTP fail → list rỗng + empty state "no conversations" (sai nghĩa) |
| `MessageList` (`message-list.tsx:85-101`) | có | có (`couldNotLoad` + `refetch()`) | |
| Friends: 3 section (`friends-list-section.tsx:51-71`, `friend-request-section.tsx:107-121`, `find-people-section.tsx:109-123`) | có | có | |
| Profile (`profile.template.tsx:20-51`) | có | `!currentUser` → text, không Retry | |
| Details direct (`conversation-details-panel.tsx:90`) | — | `userInfoQuery` chỉ đọc `bio` optional | |
| Rail / Bottom nav (`use-nav-badges.ts:17-20`) | — | `enabled: false`, chỉ đọc cache | không fetch → không error |
| `HealthGate` (`health-gate.tsx:16-18`) | `BootIsland` cho tới `isSuccess` | không có nhánh error riêng (retry 2s theo docblock) | |

### A.3 Tiền lệ trong repo (FACT)

| App / Runtime | Boundary | Fallback | Reset |
| --- | --- | --- | --- |
| `_template_vite/src/pages/main.tsx:41-83` | 1 root `react-error-boundary` | `InternalServerError` (i18n, `min-h-svh`, reload) | không |
| `documents/src/pages/main.tsx:31-57` | 1 root, **bên trong** `ThemeProvider` ("so the error fallback keeps the reader's theme too") | reload | không |
| `smart-rental/src/pages/main.tsx:160-179` | 1 root | reload | không |
| `chat/src/pages/main.tsx:86-105` | 1 root, **bên ngoài** `ThemeProvider` (ThemeProvider nằm trong `AppRoutes:41`) | reload | không |
| `_template_next/src/app/[locale]/error.tsx:15-17` | segment boundary của Next | `InternalServerError({ reset })` — nút gọi `reset` của React ("re-renders the segment rather than reloading the document, so client state survives a transient failure", `error.tsx:11-13`) | **có** |
| `_template_reactrouter/src/root.tsx:167-200` | root `ErrorBoundary` | `InternalServerError` fullscreen, reload | không |
| `_template_reactrouter/src/routes/module.tsx:79-85` | **route-level** boundary dưới shell — docblock: *"root's ErrorBoundary replaces the whole shell, so a visitor who mistyped a slug would lose the header and every way out with it. Catching it here keeps the chrome"* | `NotFound` cho 404, `InternalServerError fullscreen={false}` cho lỗi khác (`internal-server-error.tsx:8-15` giải thích prop `fullscreen`) | không |

→ Repo **đã có** tiền lệ "boundary dưới shell, fallback không fullscreen" (React Router) và "fallback có nút reset thay vì reload" (Next). `chat` là app đầu tiên có nhiều Island độc lập trên một màn, nên là nơi kết hợp hai tiền lệ đó có lý nhất.

---

## §B · Cơ chế (FACT)

### B.1 Error boundary bắt gì, không bắt gì (React 19)

- react.dev `Component.md` § *Catching rendering errors with an Error Boundary*: boundary là class component có `static getDerivedStateFromError(error)` (đổi state để render fallback) và/hoặc `componentDidCatch(error, info)` (log; `info.componentStack`). Không có hook tương đương. **Không bắt**: lỗi trong event handler, SSR, async callback, và lỗi trong chính boundary. Dev mode: lỗi đã bắt vẫn bubble lên `window` (`window.onerror`); prod thì không.
- Granularity — react.dev nguyên văn: *"in a messaging app, it makes sense to place an Error Boundary around the list of conversations. It also makes sense to place one around every individual message. However, it wouldn't make sense to place a boundary around every avatar."*
- React 19: hàm truyền vào `startTransition` (từ `useTransition`) mà throw / reject → **được** boundary gần nhất bắt (react.dev `useTransition.md` § *Displaying an error to users with an error boundary*). Promise reject đưa vào `use()` cũng propagate lên boundary gần nhất (`use.md`).
- `createRoot(container, options)` nhận `onCaughtError(error, errorInfo)` (lỗi boundary đã bắt), `onUncaughtError` (lỗi không boundary nào bắt), `onRecoverableError` (React tự phục hồi, ví dụ hydration). Mặc định: *"By default, React will log all errors to the console."* Option phải truyền vào `createRoot`, không phải `root.render` (react.dev `createRoot.md`). `apps/chat/src/index.tsx:12` chưa dùng.
- **React Compiler**: không tìm thấy caveat riêng về error boundary trong docs (`react-compiler/*`); compiler chỉ compile function component/hook, `ErrorBoundary` của thư viện là class (`.js:7`) nên không bị compile — **suy luận từ hai FACT, chưa có câu docs nào nói thẳng**. Escape hatch nếu nghi: `"use no memo"` (`react-compiler/directives/use-no-memo.md`).

### B.2 `react-error-boundary` 6.1.4 như đã cài

Từ `node_modules/.bun/react-error-boundary@6.1.4+…/dist/react-error-boundary.d.ts` và `.js` (`bun.lock:2333`, catalog `^6.1.4` ở `package.json:91`):

| API | Type / hành vi |
| --- | --- |
| `ErrorBoundaryProps` | union **loại trừ nhau**: `{ fallback: ReactNode }` \| `{ FallbackComponent: ComponentType<FallbackProps> }` \| `{ fallbackRender: (props: FallbackProps) => ReactNode }` — mỗi nhánh gán hai prop kia `?: never` |
| `FallbackProps` | `{ error: unknown; resetErrorBoundary: (...args: unknown[]) => void }` — **`error: unknown`**, không phải `Error` |
| `onError?: (error: unknown, info: ErrorInfo) => void` | gọi trong `componentDidCatch` (`.js:19-21`) |
| `onReset?: (details)` | `{ reason: "imperative-api", args }` khi gọi `resetErrorBoundary()`; `{ reason: "keys", prev, next }` khi `resetKeys` đổi |
| `resetKeys?: unknown[]` | `componentDidUpdate` so `prev.length !== next.length \|\| some(!Object.is)` (`.js:22-30, 63-65`) — chỉ reset khi **đang** `didCatch` |
| render khi `didCatch` | ưu tiên `fallbackRender` → `FallbackComponent` → `fallback`; **không có cái nào thì re-throw** (`.js:33-47`) |
| `ErrorBoundaryContext` | `{ didCatch, error, resetErrorBoundary }` — provider luôn được render, kể cả lúc không lỗi |
| `useErrorBoundary()` | `{ error, resetBoundary, showBoundary(error) }`; `showBoundary` set state rồi **throw trong render** của component gọi nó (`.js:71-94`) → đưa lỗi handler/async lên boundary gần nhất; throw `"ErrorBoundaryContext not found"` nếu ngoài boundary |
| `getErrorMessage(thrown: unknown): string \| undefined` | helper mới của 6.x — `.message` của object hoặc chính string |
| `withErrorBoundary(Component, props)` | HOC qua **`forwardRef`** (`.js:95-104`) → mâu thuẫn rule `react-no-forwardref` (impact HIGH); dùng JSX `<ErrorBoundary>` thay vì HOC |

Docblock d.ts lặp lại danh sách không bắt (SSR, event handler, lỗi trong boundary, async) và trỏ `useErrorBoundary` / `startTransition` cho hai trường hợp sau. Context7 `/bvaughn/react-error-boundary` (README, `_autodocs/hooks-use-error-boundary.md`) cùng nội dung.

### B.3 TanStack Query v5 — HTTP error vs render-time TypeError

- **`throwOnError`** (`query-core/build/modern/hydration-*.d.ts:750-757`): *"Whether errors should be thrown instead of setting the `error` property. If set to `true` or `suspense` is `true`, all errors will be thrown to the error boundary. If set to `false` and `suspense` is `false`, errors are returned as state. If set to a function, it will be passed the error and the query, and it should return a boolean … Defaults to `false`."* Đặt được per-query hoặc trong `QueryClient.defaultOptions.queries` (merge ở `queryClient.defaultQueryOptions`, Context7 `/tanstack/query`). `apps/chat/src/libs/query-client.ts:25-32` **không** đặt → mặc định `false`.
- Đường throw thật: `react-query/build/modern/useBaseQuery.js:39-45` — `if (getHasError({...})) throw result.error`; `errorBoundaryUtils.js:14-16` — `getHasError` = `result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && data === undefined || shouldThrowError(throwOnError, [error, query]))`. Với `throwOnError` mặc định → không bao giờ throw → mọi HTTP fail là `isError` (rule `tanstack-consume-query`).
- **`select` throw → `isError`, không phải crash**: `query-core/build/modern/queryObserver.js:218-236` bọc `options.select(data)` trong `try/catch`, cất `#selectError`, rồi `error = this.#selectError; status = "error"`. Nghĩa là `data.pages.flatMap((page) => page.items)` ở `hooks/api/conversation.ts:183`, `friend.ts:84`, `user.ts:91` và `select` của `message.ts:114-124` nếu gặp page thiếu `items` sẽ ra `isError` (và `data` giữ `#selectResult` cũ), không lên boundary.
- Lỗi trong `queryFn` (kể cả TypeError `response.data.messages` khi envelope thiếu `data`, §A.2) là promise reject → retry theo `retry: 1` (`query-client.ts:30`) → `isError`. **Chỉ TypeError trong render/`useMemo` sau khi `data` đã defined mới là việc của boundary.**
- **`QueryErrorResetBoundary`** (`react-query/build/modern/QueryErrorResetBoundary.js`): context `{ clearReset, reset, isReset }`; component `useState(createValue)` per instance, `children` có thể là function `({ reset }) => …`; `useQueryErrorResetBoundary()` không có boundary → dùng giá trị **global** mặc định (docs: *"If there is no boundary defined it will reset them globally"*). Pattern docs (`guides/suspense.md`): `<QueryErrorResetBoundary>{({ reset }) => <ErrorBoundary onReset={reset} fallbackRender={({ resetErrorBoundary }) => <button onClick={() => resetErrorBoundary()}>Try again</button>}>…`. Vai trò của `reset`: `ensurePreventErrorBoundaryRetry` (`errorBoundaryUtils.js:5-9`) đặt `retryOnMount = false` cho query đang lỗi khi `throwOnError`/`suspense` **trừ khi** `isReset()` — tức là `onReset={reset}` là thứ cho phép query fetch lại sau khi boundary reset. **Với `throwOnError: false` (chat hôm nay) cơ chế này không tham gia** — boundary reset chỉ remount subtree, hook chạy lại bình thường.
- **`useSuspenseQuery`** (`useSuspenseQuery.js:9-15`): ép `enabled: true, suspense: true, throwOnError: defaultThrowOnError, placeholderData: undefined` → `data` luôn defined trong component, loading lên `<Suspense>`, lỗi lên `<ErrorBoundary>`. Docs Context7 `/tanstack/query` (`useSuspenseQuery.md`): *"`data` is guaranteed to be defined here — no `isPending` check needed."* Đổi sang shape này là đổi cả rule `patterns-loading-skeletons` (skeleton từ `isLoading` sang `Suspense fallback`) — nằm ngoài câu hỏi, ghi ở §E.

### B.4 Zod v4 `safeParse` (đã cài, `import * as z from "zod"` theo rule `forms-schema-driven`)

Context7 `/colinhacks/zod` README: `.safeParse()` trả discriminated union `{ success: true, data } | { success: false, error: ZodError }`, không throw; `z.infer<typeof schema>` suy type. Trong repo Zod hiện chỉ dùng cho form schema (`features/*/types/*-form.ts`) và `env.ts`; **chưa** dùng cho payload API/socket (grep §A.2). `src/libs/socket.ts` đang là type guard tay tương đương `safeParse` không có dependency.

---

## §C · Các mức bọc có thể (DRAFT — trade-off)

### C.1 Mức 0 — giữ nguyên một root boundary (hôm nay)

- **Được**: 0 diff; đúng shape 4 app Vite còn lại.
- **Mất**: một TypeError ở Details/Rail/badge kéo sập cả pane đang gõ dở; `Toaster` + `QueryClientProvider` unmount; reload là lối ra duy nhất. `main.test.tsx` không thể assert gì về boundary.

### C.2 Mức 1 — một boundary **mỗi Island có query** (khuyến nghị)

Ranh giới đúng theo CONTEXT.md ("một Island không lồng Island khác", `CONTEXT.md:53-54`) và theo react.dev (list of conversations / individual message). Điểm bọc, mỗi điểm là **một** `<ErrorBoundary>` ngay bên trong (hoặc bên ngoài) `<Island>`:

| Island | Bọc ở | `resetKeys` | Lý do |
| --- | --- | --- | --- |
| Conversation list | `conversation-shell.template.tsx:125,140` quanh `<ConversationList …/>` | `[filter]`? — không, filter là state nội bộ; `[]` | `useConversationList` là điểm nổ chung (§A.2 bảng 2) |
| Message pane | `conversation-shell.template.tsx:105-119` quanh `panel` (hoặc trong `conversation-panel.tsx:124` quanh nội dung Island) | `[conversationId]` | đổi hội thoại phải tự thoát fallback |
| Details | `conversation-panel.tsx:222-232` quanh `<ConversationDetailsPanel>` | `[activeConversation.id]` | Details sập không được kéo pane |
| Friends / Profile | trong `friends.template.tsx` / `profile.template.tsx` (Island do `LayoutTemplate:57` cấp) | `[]` | một Island một route |
| Rail / Bottom nav | **không** | — | chỉ đọc cache (`use-nav-badges.ts`), không JSX nào có thể nổ vì data; bọc thêm là bọc avatar |
| `HealthGate` / auth | **không** | — | trước khi có shell, root boundary đúng chỗ |

Fallback: **một** composite mới `~/components/exception/island-error.tsx` (default export theo bảng `quality-imports` cho `~/components/exception/*`), props `FallbackProps`: text ngắn + `<Button variant="outline" size="sm" onClick={() => resetErrorBoundary()}>Retry</Button>` (dùng key `chat.convPane.list.retry` / `retry` đã có ở `en.json:8`), `flex h-full flex-1 items-center justify-center p-6` — cùng footprint với nhánh `isError` của `message-list.tsx:93-101`, không `min-h-svh`. Đây là "footprint-shaped" theo tinh thần `patterns-loading-skeletons`, và nằm ở `~/components` vì ≥ 2 slice dùng (`architecture-shared-components`: *"what more than one slice reuses"*; không import `~/features`).

Sketch (mỗi chỗ ~6 dòng, không cần wrapper riêng — cân nhắc gói thành `~/components/exception/island-boundary.tsx` chỉ khi số chỗ bọc > 3 và lặp đúng cùng props):

```tsx
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import IslandError from "~/components/exception/island-error";

<QueryErrorResetBoundary>
  {({ reset }) => (
    <ErrorBoundary
      FallbackComponent={IslandError}
      onReset={reset}
      resetKeys={[conversationId]}
      onError={(error, info) => console.error("Island render error:", error, info.componentStack)}
    >
      <ConversationPanel … />
    </ErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

- `onReset={reset}` **hôm nay là no-op về hành vi** (§B.3, `throwOnError: false`) nhưng là pattern docs và là thứ khiến ngày nào bật `throwOnError`/`useSuspenseQuery` thì Retry vẫn đúng — giữ hay bỏ là câu hỏi §E.2.
- Retry của Island fallback: `resetErrorBoundary()` remount subtree; nếu crash do cache bẩn (record thiếu field vẫn nằm trong cache), remount **throw lại ngay** → cần thêm `queryClient.invalidateQueries`/`resetQueries` trong `onReset` cho key của Island đó, hoặc chấp nhận fallback có thêm nút "Reload page". Đây là lý do docblock `internal-server-error.tsx` chọn reload — ở mức Island thì giữ **cả hai**: Retry (nhẹ) + link reload.
- `onError` ở từng Island: nếu muốn một chỗ log duy nhất, dùng `createRoot(rootEl, { onCaughtError })` ở `index.tsx` (§B.1) thay vì lặp `onError` — React 19 gọi `onCaughtError` cho **mọi** boundary. Đổi `index.tsx` là đổi file entry duy nhất, một lần.
- Chi phí: ~3–5 chỗ bọc + 1 file composite + test. Không thêm dependency.

### C.3 Mức 2 — boundary theo route

Bọc `element` của từng `<Route>` trong `main.tsx:49-68` (ví dụ `<Route element={<RouteBoundary />}>` với `<Outlet />`, reset theo `location.key`). Giữ được Rail/Bottom nav khi màn sập, nhưng **không** tách list/pane/Details — trên `/conversation/:id` cả ba vẫn đi cùng. Là tập con của C.2 với ít lợi hơn; chỉ hợp nếu chủ repo muốn 1 chỗ bọc duy nhất và chấp nhận mất cả màn. React Router declarative mode không có `errorElement` (đó là data router) — chưa xác minh trong docs v8, nhưng `main.tsx` dùng `BrowserRouter` + `Routes` nên không có sẵn.

### C.4 Mức 3 — chặn ở trust boundary để crash không xảy ra

- **HTTP**: Zod `safeParse` (hoặc type guard tay như `socket.ts`) trong `packages/api/src/chat/*-service.ts` hoặc trong `select` của hook → record sai shape bị **loại/normalise** trước khi vào cache; lỗi thành `isError` (§B.3) hoặc item bị bỏ. Đúng về nguyên tắc ("validate at trust boundaries" — ponytail cũng không được lược cái này), nhưng: (i) là quyết định tầng `@monorepo/api` (package dùng chung, hiện không có Zod, `architecture-features-modules` nói service trả `Promise<T>` plain), (ii) phải viết schema cho ~6 record type đã có TS type → hai nguồn sự thật trừ khi đổi sang `z.infer` ở `@monorepo/types` (grill riêng), (iii) không thay được boundary — bug trong chính mapper/`useMemo` (không phải data) vẫn cần chỗ hứng.
- **Socket**: đã làm (`socket.ts`), không cần Zod thêm.
- **Hardening rẻ, không cần Zod** (DELTA §A.2 bảng 2): `getInitials(name ?? "")` hoặc `getDisplayName` fallback `"Unknown user"` như `map-conversation-to-ui-model.ts:9-19` đã làm; `record.participants ?? []` ở `map-conversation-to-ui-model.ts:25`. Hai dòng, xoá hai đường nổ cụ thể nhất.

### C.5 Khuyến nghị (≤ 10 dòng)

1. Giữ root boundary + `InternalServerError` như cũ (đúng 4 app Vite; hứng lỗi ngoài shell).
2. Thêm `~/components/exception/island-error.tsx` (FallbackComponent, Retry + reload nhỏ) và bọc **3 Island của conversation shell** (list, pane, Details) + template của Friends/Profile — C.2; `resetKeys={[conversationId]}` ở pane/Details; `QueryErrorResetBoundary` + `onReset={reset}` theo pattern docs.
3. Chuyển log về một chỗ: `createRoot(rootEl, { onCaughtError, onUncaughtError })` ở `index.tsx`, bỏ `onError` lặp ở từng boundary (root giữ hay bỏ tuỳ grill).
4. Vá hai đường nổ rẻ ở C.4 (`getInitials`, `participants ?? []`) và thêm nhánh `isError` cho `ConversationList` (DELTA duy nhất còn thiếu).
5. **Không** bật `throwOnError`, **không** `useSuspenseQuery`, **không** Zod ở `packages/api` ở vòng này — mỗi cái là một đổi rule/tầng riêng (§E).
6. Không dùng `withErrorBoundary` (forwardRef). Không tạo wrapper `IslandBoundary` cho tới khi ≥ 4 chỗ lặp y hệt.

---

## §D · Test seam

### D.1 Đã có gì (FACT)

- `test/pages/main.test.tsx:151-171` mount `AppRoutes` (không boundary) trong `createMemoryRouter` + `QueryClientProvider` mới per test, service singleton mock qua `vi.mock("~/libs/http-client")` (`:91`), socket store mock (`:130`), `beforeEach` reset mock + `mockResolvedValue` shape rỗng (`:175-208`). Đây là seam đúng để ép một record sai shape: `chatConversationGetConversations.mockResolvedValue({ items: [{ …, participants: undefined }], nextCursor: null })` (cast qua `unknown` vì type không cho) và assert **Island nào** hiện fallback, Island nào vẫn render.
- Pattern spy console đã dùng trong repo: `vi.spyOn(console, "error").mockImplementation(() => {})` (`test/features/layout/provider/theme-provider.test.tsx:114`, `documents/test/libs/theme-provider.test.tsx:96`, `storybook/test/stories.test.tsx:153`). `vitest.config.ts` đặt `clearMocks: true` nhưng **không** `restoreMocks` → spy console phải `mockRestore()` tay hoặc `vi.restoreAllMocks()` trong `afterEach` (Vitest docs `config/restoremocks.md`, `api/mock.md`), nếu không spy sống sang test sau và nuốt lỗi thật.
- `theme-provider.test.tsx:113-117` chứng minh: trong jsdom + RTL, một throw trong render **không có boundary** bật ra khỏi `render()` (`expect(() => render(<Probe />)).toThrow`). Vậy với `AppRoutes` hôm nay, một record sai shape làm test **throw**, không có gì để assert — chính là "test đỏ trước" cho C.2.
- Tiền lệ test boundary trong repo: `_template_reactrouter/test/routes/module.test.tsx:64-84` render qua `createRoutesStub` với `ErrorBoundary` của route rồi `findByRole("heading", { name: "404 …" })` — assert **fallback hiện + chrome còn**.

### D.2 Cách viết (DRAFT, Vitest 5 + RTL)

1. **Unit cho composite** `test/components/exception/island-error.test.tsx`: render `<ErrorBoundary FallbackComponent={IslandError}><Boom /></ErrorBoundary>` với `Boom` throw có điều kiện qua một biến module/prop; `vi.spyOn(console, "error").mockImplementation(() => {})` trong `beforeEach`, `mockRestore` trong `afterEach`; assert `getByRole("button", { name: "Retry" })`; đổi điều kiện để `Boom` không throw nữa, `await user.click(retry)`, assert nội dung thật quay lại và `queryByText(/went wrong/)` là `null` (`testing-coverage`: absence bằng `queryBy*`). React 19 dev vẫn `console.error` lỗi đã bắt (§B.1) → spy là bắt buộc để log không nhiễu.
2. **Seam route** trong `main.test.tsx` (cùng file, `describe("an Island that crashes")`): mock `chatConversationGetConversations` trả record thiếu `participants`; `renderAt(ROUTES.HOME)`; assert list Island hiện fallback (`findByRole("button", { name: "Retry" })`) **và** pane `NoConversationSelected` vẫn có `heading "Pick a conversation"`; sau đó `mockResolvedValue` shape đúng, click Retry, `findByText(<tên hội thoại>)`. Cần thêm `ErrorBoundary`... không — boundary nằm **trong** `ConversationShellTemplate` (C.2) nên `AppRoutes` đã bao gồm nó; không phải sửa `renderAt`.
3. **`resetKeys`**: test đổi route `/conversation/a` → `/conversation/b` bằng `router.navigate` và assert fallback biến mất mà không click Retry.
4. Không test `react-error-boundary` tự nó (`testing-coverage`: không test hành vi thư viện) — chỉ test quyết định "Island nào bọc, fallback nào, reset khi nào".

---

## §E · Câu hỏi mở cho grill

1. **Phạm vi bọc**: đúng 3 Island của conversation shell + Friends/Profile (C.2), hay chỉ list + pane (đúng câu react.dev) và để Details rơi vào boundary của pane?
2. **`QueryErrorResetBoundary` + `onReset={reset}`**: giữ theo pattern docs dù no-op khi `throwOnError: false`, hay bỏ cho ngắn (ponytail) và thêm khi nào bật `throwOnError`?
3. **Retry vs reload ở Island**: chỉ `resetErrorBoundary()` (có thể throw lại ngay nếu cache bẩn), hay `onReset` kèm `queryClient.resetQueries({ queryKey: … })` của Island đó, hay fallback có cả hai nút?
4. **Log**: chuyển sang `createRoot(…, { onCaughtError, onUncaughtError })` (một chỗ, React 19) hay giữ `onError` per boundary như Template? Nếu chuyển, có sync về `_template_vite` (đổi 4 app) hay chỉ `chat`?
5. **Trust boundary HTTP**: có mở ticket riêng cho Zod/type guard ở `packages/api/src/chat` (đổi `@monorepo/types/chat-*` sang `z.infer`?) hay chấp nhận TS type + boundary là đủ cho một backend mình sở hữu?
6. **`ConversationList` thiếu `isError`** (DELTA §A.2): sửa cùng ticket này hay tách?
7. **Rule mới?** Có đáng một rule `patterns-error-boundaries.md` (impact HIGH) — "một boundary mỗi vùng tự fetch, fallback footprint-shaped ở `~/components/exception`, không `withErrorBoundary`" — hay chỉ ghi vào README `apps/chat` § Hình dạng Islands + CONTEXT.md?
8. **Có sync lên `_template_vite`?** Template hiện 1 root boundary; app có nhiều vùng tự fetch (Home launcher + header) nhưng chưa ai cần. Theo §7a "ba hình dạng cố ý khác nhau", mặc định là **không** sync.

---

## §F · Nguồn

**Code `apps/chat` (working tree 2026-09-20, HEAD `5be9870`)**: `src/pages/main.tsx:39-73,86-105` · `src/index.tsx:12-17` · `src/components/exception/{internal-server-error.tsx:9-23,not-found.tsx}` · `src/libs/query-client.ts:10-37` · `src/libs/socket.ts:37-96,100-109,150-179` · `src/stores/use-socket-store.ts:16-19,45-57` · `src/hooks/api/conversation.ts:57-124,156-186` · `src/hooks/api/message.ts:60-86,88-127` · `src/hooks/api/{friend.ts:84,user.ts:91}` · `src/features/chat/provider/chat-socket-provider.tsx:48,62-84` · `src/features/conversation/utils/map-conversation-to-ui-model.ts:9-19,25,55` · `src/features/conversation/hooks/use-conversation-list.ts:35-52` · `src/features/conversation/hooks/use-conversation-messages.ts:19-45` · `src/features/conversation/templates/conversation-shell.template.tsx:105-145` · `src/features/conversation/components/{conversation-panel.tsx:80-110,124,222-232, conversation-list.tsx:94-136, message-list.tsx:36-101, conversation-details-panel.tsx:55-92, people-search-results.tsx:35}` · `src/features/group/templates/group-panel.template.tsx:152-160,192` · `src/features/friends/{templates/friends.template.tsx:47, components/friends-list-section.tsx:38-71, friend-request-section.tsx:104-121, find-people-section.tsx:75-123}` · `src/features/current-user/templates/profile.template.tsx:20-51` · `src/features/layout/{templates/layout.template.tsx:49-65, hooks/use-nav-badges.ts:16-28}` · `src/features/auth/components/health-gate.tsx:12-21` · `src/components/avatar/conversation-avatar.tsx:33` · `src/components/{user-item.tsx:71,user-info.tsx:74}` · `src/utils/{display.ts:8-22,date.ts:19-29,is-record.ts}` · `test/pages/main.test.tsx:91,130,151-208` · `test/features/layout/provider/theme-provider.test.tsx:113-117` · `vitest.config.ts` · `README.md:49` · `CONTEXT.md:47-62`.

**Package / tiền lệ**: `packages/types/src/chat-base.ts:8-12` · `packages/api/src/chat/{conversation-service.ts:23-34,message-service.ts:30-54,user-service.ts:26-55,friend-service.ts:32}` · `apps/_template_vite/src/pages/main.tsx:41-83` + `src/components/exception/internal-server-error.tsx` · `apps/documents/src/pages/main.tsx:28-57` · `apps/smart-rental/src/pages/main.tsx:158-179` · `apps/_template_next/src/app/[locale]/error.tsx` + `src/components/exception/internal-server-error.tsx:9-36` · `apps/_template_reactrouter/src/root.tsx:167-200`, `src/routes/module.tsx:69-85`, `src/components/exception/internal-server-error.tsx:8-49`, `test/routes/module.test.tsx:64-84` · `tooling/typescript/base.json` (`noUncheckedIndexedAccess`) · `package.json:91` (catalog `react-error-boundary ^6.1.4`) · `bun.lock:2333`.

**Source đã cài**: `node_modules/.bun/react-error-boundary@6.1.4+03aa47d54245a271/node_modules/react-error-boundary/dist/react-error-boundary.{d.ts,js}` (`.js:1-104`) · `node_modules/.bun/@tanstack+query-core@5.102.8/node_modules/@tanstack/query-core/build/modern/queryObserver.js:218-236`, `hydration-Bjs0MSgg.d.ts:750-757` · `node_modules/.bun/@tanstack+react-query@5.102.8+…/build/modern/{useBaseQuery.js:15,38-45, errorBoundaryUtils.js:5-16, QueryErrorResetBoundary.js, useSuspenseQuery.js:9-15}` · `react@19.2.8`, `@types/react@19.2.18`.

**Docs (Context7)**: `/bvaughn/react-error-boundary` — README § API › ErrorBoundary, `_autodocs/hooks-use-error-boundary.md`, `_autodocs/quick-start.md` · `/reactjs/react.dev` — `reference/react/Component.md` (§ Catching rendering errors with an Error Boundary, `componentDidCatch` caveats), `reference/react-dom/client/createRoot.md` (`onCaughtError`/`onUncaughtError`/`onRecoverableError`), `reference/react/useTransition.md` (§ Displaying an error to users with an error boundary), `reference/react/use.md`, `learn/react-compiler/debugging.md`, `reference/react-compiler/directives/use-no-memo.md` · `/tanstack/query` — `docs/framework/react/guides/suspense.md` (QueryErrorResetBoundary + react-error-boundary), `useQueryErrorResetBoundary.md`, `useSuspenseQuery.md`, `packages/react-query/src/useBaseQuery.ts`, `packages/query-core/src/queryClient.ts` (`defaultQueryOptions`), `shouldThrowError.md` · `/colinhacks/zod` — README § Handling errors (`safeParse`), `z.infer` · `/vitest-dev/vitest` — `docs/api/vi.md` (`vi.spyOn`), `docs/api/mock.md` (`mockRestore`), `docs/config/restoremocks.md`.

**WebFetch**: https://react.dev/reference/react-dom/client/createRoot (mặc định "log all errors to the console"; option phải truyền vào `createRoot`). https://tanstack.com/query/v5/docs/framework/react/reference/useQuery — trang không trả về bảng option qua fetch (chưa xác minh trên web, thay bằng docblock của `query-core` đã cài ở trên).

**Rule**: `.agents/rules/{patterns-loading-skeletons,patterns-self-fetching-components,tanstack-consume-query,react-effects-sync-only,architecture-shared-components,architecture-features-modules,testing-coverage,react-no-forwardref,quality-imports,forms-schema-driven}.md`; `CLAUDE.md` §7a (mock ở service singleton; ba hình dạng không sync).
