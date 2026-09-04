# `@monorepo/assistant-ai`

Giao diện chat với model **Gemini**, và model gọi được tool của máy chủ MCP thời
tiết (`apps/mcp-weather`). Chạy Runtime **Next.js 16 App Router**, clone từ
`apps/_template_next` bằng `bun run gen:app` (ticket `legacy-migrate/05`), thay
cho `legacy/assistant-ai` đã đóng băng và cho `legacy/docs/apps/ASSISTANT-AI.md`.

```bash
bun run dev:assistant-ai      # http://localhost:3005
```

## Cần gì để chạy

Ba biến trong `.env` **ở root repo** (`.env.example` có sẵn dòng kèm giải thích):

| Biến | Bắt buộc | Là gì |
| --- | --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | **có** | Khoá Gemini, lấy ở <https://aistudio.google.com/apikey>. Server-only, không prefix. Thiếu là `next build` (và bước `import './src/env.ts'` trong `Dockerfile`) đỏ ngay kèm tên biến, chứ không ship một app chat lúc nào cũng lỗi. `.env.example` để placeholder nên `docker build` trần và CI vẫn xanh. |
| `MCP_DOMAIN` | không | Origin của máy chủ MCP, ví dụ `http://localhost:3004` (chính là `apps/mcp-weather`). Bỏ trống thì app vẫn chạy, chỉ là chat thuần không có tool — đúng thứ một người chưa bật máy chủ MCP nên nhận. |
| `NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN` | không | DSN Sentry của **project riêng** app này. Rỗng = SDK cài nhưng tắt. |

Hai biến đầu **không** mang tên app, khác quy ước ở `packages/env/README.md`, và
mỗi cái có lý do riêng: `GOOGLE_GENERATIVE_AI_API_KEY` là tên `@ai-sdk/google`
tài liệu hoá — app thứ hai muốn Gemini sẽ muốn đúng key của cùng một project
Google, chứ không phải key riêng; còn `MCP_DOMAIN` là tên AC của ticket viết ra.
Nếu sau này có app thứ hai trỏ vào một máy chủ MCP **khác**, `MCP_DOMAIN` là dòng
đầu tiên phải đổi thành `ASSISTANT_AI_MCP_DOMAIN`.

Chạy cả hai app cạnh nhau để thử tool:

```bash
bun run dev:mcp-weather       # http://localhost:3004 — endpoint ở /api/mcp
bun run dev:assistant-ai      # http://localhost:3005
```

## Model

Danh sách nằm ở `src/constants/models.ts`, mặc định `gemini-2.5-flash`. Người
dùng đổi bằng `ModelSelector` ở đầu màn chat; lựa chọn giữ trong
`~/stores/use-model-store.ts` (Zustand global + `persist`, key
`assistant-ai-model`). **Chỉ có id model được persist** — không có token nào ở
`localStorage`, session của app vẫn là cookie `HttpOnly` như mọi app Next ở đây.

Một id đã bị gỡ khỏi danh sách mà còn nằm trong `localStorage` của một người dùng
cũ sẽ bị `merge` của store loại và quay về mặc định; một id lạ gửi lên trong body
request cũng bị route handler loại như vậy — body do trình duyệt viết nên không
tin được.

> Bản cũ liệt kê `gemini-3.0-pro-preview`, một id **không tồn tại** trên API của
> Google, nên chọn nó là 404 ngay lượt đầu. Đã sửa thành `gemini-3-pro-preview`
> và ghim bằng test.

## Một lượt chat đi qua đâu

```text
ChatTemplate (client)                        route.ts                  streamChat()
  AssistantChatTransport   ──POST /api/chat──▶  (mỏng: validate body,  ──▶  loadMcpTools() ──▶ MCP_DOMAIN/api/mcp
  + prepareSendMessagesRequest                   resolve locale)             streamText(googleProvider(model))
    (thêm `model` + `locale`)
```

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Route handler | `src/app/api/chat/route.ts` | Mỏng: đọc body, ép kiểu `model`/`locale`, lấy catalogue rồi giao cho slice. Nằm **ngoài** `[locale]`, và matcher của `proxy.ts` đã loại `/api` — nên locale phải đi trong body chứ không lấy từ URL được. |
| Gọi model | `src/features/chat/server/stream-chat.ts` | `streamText` + `stopWhen: stepCountIs(5)` khi có tool, nên model **viết được câu tóm tắt sau khi tool trả về** thay vì dừng ở cục JSON. Bản cũ chỉ mở đường đó cho riêng `get-weather` bằng một nhánh `if`; các tool còn lại dừng ngay sau tool result. |
| Provider | `src/features/chat/server/chat-model.ts` | `createGoogleGenerativeAI({ apiKey: env.… })`, không dùng instance `google` có sẵn — instance đó tự đọc `process.env`, tức là đưa giá trị quan trọng nhất ra ngoài schema `~/env.ts` và ngoài `noProcessEnv` của Biome. |
| Client MCP | `src/features/chat/server/mcp-tools.ts` | `@modelcontextprotocol/sdk` — **cùng một SDK, cùng một dòng catalog** với máy chủ ở `apps/mcp-weather`, nên client không trôi sang một phiên bản protocol server không nói. Mở và đóng theo từng request, vì máy chủ đó stateless (không có `Mcp-Session-Id` để giữ). |
| Phân loại lỗi | `src/features/chat/utils/chat-error-code.ts` | Hàm **thuần** trả về một mã (`credential` / `rateLimit` / `generic`); câu chữ lấy từ `assistantAi.errors.*` nên lỗi cũng theo ngôn ngữ. Mặc định của AI SDK là chuỗi `"An error occurred."` cho mọi thứ — key sai và hết quota trông y hệt nhau. |
| Màn chat | `src/features/chat/templates/chat.template.tsx` | Default export, `"use client"` — runtime của assistant-ui là object của trình duyệt. Transport dựng **một lần** trong `useState`; model đọc **lúc gửi** qua `useModelStore.getState()`, nên đổi model có hiệu lực ngay ở lượt sau chứ không phải dựng lại transport. |

## Vì sao chat nằm sau `<Suspense>`

`src/app/[locale]/(shell)/page.tsx` bọc `ChatTemplate` trong `<Suspense>` với
`ChatSkeleton`. Đây **không** phải trang trí: runtime của assistant-ui sinh id
tin nhắn bằng `Math.random()` ngay trong render, và dưới `cacheComponents` một
Client Component đọc giá trị không ổn định lúc prerender làm **hỏng cả
`next build`** (`Next.js encountered the unstable value Math.random()`).
`<Suspense>` là cách Next tài liệu hoá để đẩy nhánh đó ra khỏi prerender.

Hệ quả phải nói thẳng: HTML máy chủ gửi cho crawler là **vỏ** (metadata, `lang`,
header, skeleton), không phải khung chat. Đó là ranh giới cố ý — một cuộc hội
thoại là của riêng từng người và không có gì để đưa vào kết quả tìm kiếm — và
`e2e/server-rendering.e2e.ts` kiểm đúng phần vỏ đó.

## Khác gì bản cũ

- **Bộ AI SDK lên latest**: `ai` 5 → **7**, `@ai-sdk/google` 2 → **4**,
  `@assistant-ui/react` 0.11 → **0.15**, `@assistant-ui/react-ai-sdk` 1.1 →
  **1.4**. Tất cả qua catalog `ai-sdk` ở `package.json` root.
- **Không còn Radix trực tiếp**: `@radix-ui/react-slot` bị gỡ; UI dựng từ
  `@monorepo/ui` (Base UI), composition bằng prop `render` thay `asChild`.
  (`@assistant-ui/react` vẫn phụ thuộc `radix-ui` bên trong nó — đó là
  transitive, không phải dep của app này.)
- **130 dòng chuyển JSON Schema → zod biến mất**: `jsonSchema()` của `ai` nhận
  thẳng schema MCP công bố. Bản chuyển tay cũ im lặng rơi mọi ràng buộc nó không
  nhận ra và trả `z.any()`, tức là một enum bắt buộc đến tay model thành "gì cũng
  được".
- **`app/` ở root → `src/app/[locale]/`**, i18n qua `@monorepo/i18n`
  (namespace `assistantAi.*`), env qua Flavor `next` của `@monorepo/env`, test
  dưới `test/` soi gương `src/`.
- **Bỏ `components/attachment.tsx` (240 dòng)**: đính kèm cần một
  `AttachmentAdapter` khai trong runtime, bản cũ chưa bao giờ khai — nên khối UI
  đó không bao giờ hiển thị được gì.
- **Reasoning đơn giản hơn**: vẫn gập/mở được, nhưng bỏ shimmer + gradient +
  scroll-lock. Chúng chạy trên `data-[state=open]` của Radix và hai keyframe
  không tồn tại trong `@monorepo/tailwind-config`; giữ chúng đồng nghĩa thêm
  animation token riêng cho app chỉ để trang trí.

## Chạy kiểm

```bash
bun run check && bun run typecheck && bun run test && bun run build
bunx playwright test --project=chromium          # từ thư mục app này
```

E2E chạy trên **bản build** ở cổng 3105 (`ports.env`). Nó **không** gọi model
thật: CI build bằng key placeholder của `.env.example`, nên một lượt gửi kết thúc
bằng alert lỗi — và đó chính là điều được kiểm, "không treo". Mã lỗi nào ứng với
nguyên nhân nào thì ghim ở `test/features/chat/utils/chat-error-code.test.ts`,
không cần mạng.

## Deploy

Vercel, qua `vercel.json` cạnh `Dockerfile` — `build:vercel` gọi `next build`
trần vì trên Vercel không có `.env` ở root, giá trị đến từ dashboard. `Dockerfile`
của Template giữ nguyên: image nhận env bằng **file**
(`COPY .env.${BUILD_ENV} .env`), nên không có build ARG nào phải cập nhật khi
thêm biến.
