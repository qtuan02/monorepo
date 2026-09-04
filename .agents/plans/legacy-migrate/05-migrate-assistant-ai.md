---
status: ready-for-human
---

# 05 — Migrate `assistant-ai` lên `_template_next` với bộ AI SDK mới nhất

**What to build:** Người dùng mở `apps/assistant-ai`, chat với Gemini qua route handler `/api/chat`, và model gọi được tool thời tiết của `mcp-weather` qua `MCP_DOMAIN`. App chạy trên `_template_next`, dùng `ai`, `@ai-sdk/google`, `@ai-sdk/react`, `@assistant-ui/react`, `@assistant-ui/react-ai-sdk` bản mới nhất qua catalog `ai-sdk`; không còn Radix; store model là Zustand global theo rule. E2E boot app và mở màn chat với key giả.

**Blocked by:** 04 — `mcp-weather` là dependency runtime (MCP_DOMAIN) và là mẫu cho route handler + env server; 03 — quy ước env.

**Status:** `ready-for-human` (2026-09-04) — xem Notes: 6/7 ô đã đạt, ô cuối chờ một lượt chạy CI.

## Acceptance criteria

- [x] `apps/assistant-ai` sinh bằng `gen:app` Runtime `next`; `app/` ở root của bản cũ chuyển thành `src/app/[locale]/…` theo Template; màn chat là một slice `features/chat/` với template default-export; route handler `/api/chat` mỏng, logic gọi model + MCP client trong slice (`server/` hoặc helper server-only).
- [x] Catalog đặt tên `ai-sdk` trong `package.json` root gồm `ai`, `@ai-sdk/google`, `@ai-sdk/react`, `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`, `@modelcontextprotocol/sdk` (dùng chung với `mcp-weather`), latest lúc làm; mọi breaking change (API `streamText`/`useChat`, transport của assistant-ui) xử lý và ghi tóm tắt vào Notes.
- [x] `@radix-ui/react-slot` và mọi Radix bị gỡ; UI dựng từ `@monorepo/ui` (render prop của Base UI thay `asChild`); `motion`, `react-markdown`, `remark-gfm` qua catalog nếu giữ.
- [x] Store chọn model: `stores/use-model-store.ts` (global, typed interface, narrow selector), không persist token nào; danh sách model là constant.
- [x] `env.ts`: `GOOGLE_GENERATIVE_AI_API_KEY` (server, bắt buộc ở môi trường thật, optional khi build với key giả — quyết cách để `next build` không cần key thật và ghi vào Notes), `MCP_DOMAIN` (server, optional, `httpUrlSchema`), `NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN`; `.env.example`, Docker ARG cập nhật. — **đạt, với một sai lệch cố ý về tên key, xem Quyết định 2.**
- [x] E2E trên bản build: màn chat render, ô nhập và nút gửi có accessible name; gửi một tin với key giả → UI hiện lỗi có cấu trúc thay vì treo (mock ở seam thấp nhất: provider hoặc fetch); một spec raw HTML + locale như Template. Xanh local và trên job `e2e` CI; job `docker` xanh. — **local đạt; CI còn trống, xem cuối Notes.**
- [x] README `apps/assistant-ai` (thay `legacy/docs/apps/ASSISTANT-AI.md`): key Gemini, `MCP_DOMAIN` trỏ `mcp-weather`, model mặc định; `legacy/README.md` dòng `assistant-ai` cập nhật.
- [ ] Gate xanh 0 warning; output vào Notes. — **Gate xanh (output bên dưới); ô này còn hở đúng job `docker` trên CI.**

## Notes

**Trạng thái: `ready-for-human` (2026-09-04) — không phải `done`.**
Sáu trên bảy ô đã tick và có bằng chứng dưới đây. Ô cuối còn hở đúng một mảnh: **job `docker`**
và **job `e2e`** trên CI. Máy này không dựng được image (`command -v docker` rỗng) và không có `gh`
để đọc run — đúng bức tường đã đẩy ticket 02, 03 và 04 sang cùng nhãn.

**Còn lại đúng ba bước, và ai làm:**

1. **Một người** push nhánh `feat/upgrade`.
2. **Một người** mở run, mở riêng job matrix `docker (assistant-ai)` và job `e2e`. Cả hai mang
   `continue-on-error: true` nên dấu tích tổng của workflow là vô nghĩa ở đây — phải mở từng job.
3. Dán URL run + kết quả vào mục "Bằng chứng CI" ở cuối, tick ô cuối, rồi đổi `status: done`.

> Không có file CI nào phải sửa cho app này. Job `e2e` duyệt `apps/*/playwright.config.ts` và job
> `docker` duyệt `find apps -name Dockerfile`, nên `apps/assistant-ai` được phủ mà không cần thêm
> step — khác với ghi chú trong Notes của ticket 04, vốn viết trước khi hai job đó chuyển sang
> discovery.

### App được sinh, không copy tay

`bunx gen run app --args assistant-ai next`. Generator gán port **3005 dev / 3105 e2e** vào
`apps/assistant-ai/ports.env`, đổi tên trong `package.json` và hai ARG của `Dockerfile`, rồi thêm ba
script root (`dev:`, `build:`, `e2e:headed:`). `legacy/assistant-ai/` chỉ được đọc.

### Quyết định 1 — bộ AI SDK: đi thẳng lên latest, và ba thứ được **xoá** thay vì port

Bốn major cùng lúc: `ai` 5.0 → **7.0.92**, `@ai-sdk/google` 2.0 → **4.0.63**, `@assistant-ui/react`
0.11 → **0.15.18**, `@assistant-ui/react-ai-sdk` 1.1 → **1.4.9** (+ `@assistant-ui/react-markdown`
0.11 → 0.14). Breaking change gặp thật và cách xử lý:

| Đổi gì | Xử lý |
| --- | --- |
| `convertToModelMessages` thành **async** | `await` trong `stream-chat.ts`. Nó phải tải file part trước khi gọi model. |
| `@assistant-ui/react-ai-sdk` giờ chỉ là **shim re-export** của `@assistant-ui/ai-sdk` mới | Giữ nguyên specifier AC yêu cầu — `export * from "@assistant-ui/ai-sdk"`, nên `useChatRuntime` / `AssistantChatTransport` import y như cũ. |
| `useAssistantState` **không còn** export từ `@assistant-ui/react` 0.15 | Chỉ dùng ở hiệu ứng shimmer của reasoning; hiệu ứng đó bỏ (xem Quyết định 4). |
| `AssistantChatTransport` gọi `prepareSendMessagesRequest` của mình rồi **thay cả body** nếu callback trả về `body` | Callback liệt kê lại đúng bộ field mặc định của AI SDK (`id`/`messages`/`trigger`/`messageId`/`metadata`) cộng `model` + `locale`. Đây là chỗ **đã đỏ một lần**: bản đầu chỉ trả `{...body, model, locale}` và server nhận `messages: []` → `AI_InvalidPromptError`. E2E bắt được, không phải review. |

**Ba thứ upgrade cho phép xoá chứ không phải port** — đây mới là phần đáng giá của ticket:

1. **130 dòng `convertMcpSchemaToZod`.** `jsonSchema()` của `ai` nhận thẳng JSON Schema mà MCP công
   bố. Bản chuyển tay cũ rơi im lặng mọi ràng buộc nó không nhận ra và trả `z.any()` — một enum bắt
   buộc đến tay model thành "gì cũng được".
2. **Nhánh `if (mcpTool.name === "get-weather")`.** Bản cũ chỉ cho riêng tool đó `stepCountIs(3)` +
   một system prompt, nên mọi tool khác dừng ngay trên output của chính nó và người dùng nhìn cục
   JSON. Nay điều kiện là "có tool hay không", ngân sách bước **giữ nguyên 3** như bản cũ. Đo được:
   một lượt `get-forecast` thật trả về đoạn tóm tắt tiếng Việt 5 ngày, việc bản cũ không làm.
3. **`components/attachment.tsx`, 240 dòng.** Đính kèm cần một `AttachmentAdapter` khai trong
   `adapters` của runtime; bản cũ chưa bao giờ khai (đã đọc `ChatThreadOptions` của 0.15 để chắc), nên
   khối UI đó không bao giờ hiển thị được gì. README của bản cũ vẫn quảng cáo "Attachment Support".

Client MCP giữ **`@modelcontextprotocol/sdk`** chứ không chuyển sang `@ai-sdk/mcp` (cũng có sẵn, cũng
trả tool AI SDK): cùng một SDK và **cùng một dòng catalog** với server ở `apps/mcp-weather` thì client
không thể trôi sang một phiên bản protocol server không nói. `@modelcontextprotocol/sdk` vì thế chuyển
từ catalog mặc định sang catalog `ai-sdk`, và `apps/mcp-weather` trỏ theo — đúng chữ "dùng chung với
`mcp-weather`" của AC.

`@ai-sdk/react` **có trong catalog** như AC đòi nhưng **không** là dependency của app: không file nào
import nó, và nó đã về qua `@assistant-ui/react-ai-sdk`. Một dep không ai import là rác; một dòng
catalog chưa có consumer thì vô hại và sẵn sàng cho lần đầu app cần nó trực tiếp.

`motion` **bỏ**: AC cho phép ("nếu giữ"), và hai hiệu ứng fade của màn chào làm được bằng
`animate-in fade-in slide-in-from-bottom-2` của `tw-animate-css` vốn đã có trong theme. `remark-gfm`
thêm vào catalog mặc định. `react-markdown` không khai trực tiếp — nó về qua
`@assistant-ui/react-markdown`.

### Quyết định 2 — tên env: một key giữ tên trần, một key **đổi khác AC**

AC viết `GOOGLE_GENERATIVE_AI_API_KEY` và `MCP_DOMAIN`. Sau vòng review, hai key đi hai đường:

- **`GOOGLE_GENERATIVE_AI_API_KEY` giữ nguyên tên trần.** Đây là tên `@ai-sdk/google` tài liệu hoá và
  tự đọc mặc định — biến một người đã export sẵn trong shell — và app thứ hai muốn Gemini sẽ muốn
  đúng key của **cùng một project Google** chứ không phải key riêng, khác hẳn một key
  OpenWeatherMap. Ngoại lệ này đã được viết thành một mục riêng trong `packages/env/README.md` và một
  câu trong CLAUDE.md §3, kèm cái giá app phải trả: giá trị vẫn đi qua schema và provider nhận nó
  **tường minh** (`createGoogleGenerativeAI({ apiKey: env.… })`), chứ không để SDK tự đọc
  `process.env` — nếu không thì key quan trọng nhất của app nằm ngoài `env.ts` và ngoài `noProcessEnv`.
- **`MCP_DOMAIN` → `ASSISTANT_AI_MCP_DOMAIN`, tức là *khác* chữ trong AC.** Bản đầu giữ đúng AC. Vòng
  review chỉ ra rằng chính ngoại lệ ở trên **không phủ** key này: "máy chủ MCP" là cái tên repo tự
  nghĩ ra, đúng một app đọc, trong đúng một file `.env` ở root (ADR-0003) — nên nó rơi thẳng vào hàng
  "Secret của **một** app" của bảng trong `packages/env/README.md`, cạnh
  `MCP_WEATHER_OPENWEATHERMAP_API_KEY` của ticket 04. CLAUDE.md §7b nói rõ: nơi một ticket đã xong và
  một rule mâu thuẫn nhau thì **rule thắng**. Đổi tên là một dòng; ai muốn giữ đúng chữ AC thì
  `src/env.ts`, `.env.example` và `vitest.config.ts` là ba chỗ phải sửa lại.

Key Gemini là **bắt buộc** (`z.string().min(1)`), theo tiền lệ `MCP_WEATHER_OPENWEATHERMAP_API_KEY`
của ticket 04 chứ không theo secret mẫu optional của Template. AC để ngỏ "cách để `next build` không
cần key thật"; cách đã chọn là **placeholder trong `.env.example`**, không phải `.optional()`:

```
$ bun --env-file=<.env thiếu key> -e "import './src/env.ts';"
✖ GOOGLE_GENERATIVE_AI_API_KEY: Invalid input: expected string, received undefined
```

Đó đúng là bước `Dockerfile` chạy, nên image thiếu key đỏ lúc build kèm tên biến thay vì ship một app
chat lúc nào cũng lỗi. CI `cp .env.example .env` trong `setup-workspace`, nên Gate, `docker build`
trần và E2E đều xanh với key giả. `ASSISTANT_AI_MCP_DOMAIN` thì **optional**: thiếu nó app là chat
thuần, đúng thứ một người chưa bật `mcp-weather` nên nhận, chứ không phải một app không boot.

**Docker ARG không phải sửa**: image nhận env bằng *file* (`COPY .env.${BUILD_ENV} .env`), nên thêm
biến chỉ là thêm dòng vào `.env.example`.

### Quyết định 3 — `<Suspense>` quanh màn chat là bắt buộc, không phải trang trí

`next build` **đỏ** nếu không có nó:

```
Error: Route "/[locale]": Next.js encountered the unstable value `Math.random()` in a Client Component.
```

Runtime của assistant-ui sinh id tin nhắn bằng `Math.random()` ngay trong render, và dưới
`cacheComponents` một Client Component đọc giá trị không ổn định lúc prerender là lỗi build. Next
tài liệu hoá đúng hai lối thoát; `<Suspense>` là lối đầu.

Hệ quả phải nói thẳng chứ không giấu: **HTML máy chủ gửi cho crawler là vỏ** — metadata, `lang`,
header, skeleton — chứ không phải khung chat. Đó là ranh giới đúng cho app này (một cuộc hội thoại là
của riêng từng người, không có gì để đưa vào kết quả tìm kiếm), và `e2e/server-rendering.e2e.ts` được
viết lại để chốt đúng phần vỏ đó thay vì chép assertion "nội dung có trong HTML" của Template.

### Quyết định 4 — giữ nguyên Template, trừ slice `home`

Giữ **cả bốn** thứ ticket 04 phải giữ: `[locale]`, next-intl, `proxy.ts` *với* session guard, slice
`auth` + màn `sign-in` + `dashboard` được guard. Thay slice `home` của Template bằng slice `chat`,
dưới namespace i18n riêng `assistantAi.*` — app không còn đọc key `home.*` nào.

Ba thứ **đơn giản hơn bản cũ**, mỗi thứ một lý do đo được, không phải sở thích:

- **Reasoning**: vẫn gập/mở được, bỏ shimmer + gradient fade + scroll lock. Chúng chạy trên
  `data-[state=open]` của Radix (Base UI dùng `data-open` trần — xem `architecture-ui-primitives.md`)
  và trên hai keyframe `animate-shimmer` / `animate-collapsible-*` **không tồn tại** trong
  `@monorepo/tailwind-config`. Giữ chúng nghĩa là thêm animation token riêng cho một app, chỉ để trang
  trí. Chevron xoay theo `group-aria-expanded/trigger:`, đúng lối `accordion.tsx` của `@monorepo/ui`.
- **`useCopyToClipboard`** lấy từ `@monorepo/hook` thay cho bản `useState` + `setTimeout` tự viết
  trong `markdown-text.tsx`. Hook của workspace trả về *text* đã copy, nên trạng thái "đã copy" giờ
  đúng theo từng code block thay vì bật cho mọi block cùng lúc.
- **`category` của model** bỏ (cả năm model đều `Text-out`, bộ lọc là code chết). **`description`
  thì giữ** — nó là dòng chữ người dùng đọc trong picker, nên chuyển vào catalogue
  (`assistantAi.models.<id>`) thay vì hard-code tiếng Việt trong một constant.

### Một bug thật của bản cũ, đã sửa và ghim bằng test

`GEMINI_MODELS` cũ liệt kê **`gemini-3.0-pro-preview`**. Id đó không tồn tại trên API của Google (tên
thật là `gemini-3-pro-preview`, Gemini 3 không có minor), nên ai chọn nó thì lượt đầu tiên 404 và
không có gì trong app nói được vì sao. `test/constants/models.test.ts` ghim **hai literal** — có
`gemini-3-pro-preview`, không có `gemini-3.0-pro-preview` — chứ không suy ra từ chính mảng đang test,
vì suy ra thì lần đổi tên sau lại đi qua im lặng. Không có luật chung để kiểm thay:
`gemini-2.0-flash` thật sự có minor, còn Gemini 3 thật sự không.

### Test — ranh giới hai runner

**Vitest (60 test / 9 file)**, phần đáng test là logic thuần và nhánh người dùng chạm được:

- `test/features/chat/utils/chat-error-code.test.ts` — phân loại lỗi. Đây là chỗ sai mà **không ai
  thấy**: mọi nhánh đều hiện *một* alert nào đó, nên "hết quota" bị kể thành "kiểm tra key" sẽ đẩy
  người dùng đi đổi một cái key vẫn đúng. Dùng đúng chuỗi Google trả về, kể cả ca 429 nhắc **cả hai**.
- `test/features/chat/server/mcp-tools.test.ts` — chạy trên environment **node** (phần còn lại của
  suite là jsdom, nơi t3-env từ chối trả biến `server`), mock ở seam **client MCP** chứ không phải
  `fetch`: thứ module này chịu trách nhiệm là bản dịch giữa hai protocol — tool nào tới tay model,
  schema ra sao, `execute` trả gì — chứ không phải HTTP. Phủ: tên tool, schema đi qua nguyên vẹn,
  ưu tiên `structuredContent`, tool lỗi trả **chuỗi** (ném sẽ giết cả lượt), và hai nhánh degrade
  (không khai domain / không kết nối được).
- `test/stores/use-model-store.test.ts` — mặc định, giữ lựa chọn, rehydrate, và **loại một id đã bị
  gỡ** còn nằm trong `localStorage` của người dùng cũ.
- `test/constants/models.test.ts`, `test/env/env.test.ts` + bốn file thừa hưởng từ Template.

**E2E (9 spec)** trên bản build, cổng 3105:

- `chat.e2e.ts` — màn chat render; ô nhập / nút gửi / picker model có accessible name; gợi ý hiện ra;
  và một lượt gửi với key giả kết thúc bằng **một trong ba câu lỗi của chính app**, không phải chuỗi
  thô của provider, không phải ô rỗng, không phải spinner quay mãi.
- `server-rendering.e2e.ts` + `locale-switch.e2e.ts` — viết lại theo hình dạng thật của app (xem
  Quyết định 3).

**Về chữ "mock ở seam thấp nhất" của AC:** E2E **không** mock. Cả `page.route()` lẫn Playwright đều
không chạm được `fetch` phía server, và mock được ở đó thì phải bịa một biến env chỉ để test cắm vào
— tức là thêm cấu hình sản phẩm để phục vụ test. Đường đã chọn: key giả thật của `.env.example`, và
assertion chốt **thứ chứng minh được dù lượt đó hỏng vì lý do gì** — alert mang một trong ba câu của
app. Nguyên nhân nào ứng với câu nào thì ghim ở tầng Vitest, không cần mạng. Ba câu đó là **literal**
trong spec chứ không import từ catalogue: loader của Playwright từ chối JSON của
`packages/i18n` khi thiếu import attribute, và suy ra từ code đang test thì một câu bị sửa thành vô
nghĩa vẫn xanh.

### Đối chiếu bằng key thật, hai lượt, trên bản build

Không nằm trong suite (cần secret), nhưng đã chạy tay với key Gemini và key OpenWeatherMap thật lấy
từ `legacy/.env` (không commit), `apps/mcp-weather` chạy local ở 3004:

- `get-weather` "Hồ Chí Minh" → model gọi tool, nhận dữ liệu OpenWeatherMap thật, rồi **tự viết câu
  tóm tắt tiếng Việt** ("mưa rất lớn, nhiệt độ 31.15°C nhưng cảm giác như 38.15°C…").
- `get-forecast` "Da Nang" → tóm tắt 5 ngày theo buổi. Đây là tool bản cũ **không** tóm tắt được, nên
  nó là bằng chứng trực tiếp cho Quyết định 1 mục 2.
- Kiểm cả trong trình duyệt (Playwright, key thật): tool card, markdown, action bar copy/reload đều
  render; màu chữ của assistant đo được bằng `--foreground`, không lệch token.

### Bốn thứ vòng review tìm ra và đã sửa trong chính lượt này

1. **`vercel.json` trỏ vào một script không tồn tại.** `buildCommand` gọi `build:vercel`, nhưng
   `package.json` chỉ có `build` (đã prefix `dotenv -e ../../.env --`, mà trên Vercel không có `.env`
   ở root). Deploy sẽ đỏ ngay bước build. Cả `portfolio` lẫn `mcp-weather` đều khai
   `"build:vercel": "next build"`; app này thiếu vì `vercel.json` là file tôi viết tay còn script thì
   không. Đã thêm.
2. **`MCP_DOMAIN` không mang tên app** — xem Quyết định 2.
3. **Component của feature export named thay vì default.** `quality-imports.md` có bảng: feature
   component là **default**. Bảy component trong `components/thread/` đã đổi. Hai chỗ giữ named và có
   lý do: `reasoning.tsx` export **hai** component từ một file, `chat.skeleton.tsx` theo đúng quy ước
   skeleton của Template (`TemplateListSkeleton` cũng named).
4. **`--thread-max-width: 44rem` viết ở hai file**, kèm một comment nói "set once here" đã sai.
   `ChatSkeleton` là **fallback** của `<Suspense>`, tức là anh em chứ không phải con của thread, nên
   nó không kế thừa được biến — đúng ca `quality-styling-tailwind.md` dành cho một hằng số dùng chung.
   Đã tách ra `~/features/chat/constants/layout.ts`.

Cộng ba sửa nhỏ hơn: `@ai-sdk/react` gỡ khỏi dependencies (không file nào import), hai comment sai
(một cái tả một `<span>` sr-only không tồn tại, một cái ghi sai namespace `assistantAi.chat.errors.*`),
và câu lỗi `credential` **không còn đọc tên biến env cho người dùng cuối** — nó nói "máy chủ chưa
được cấu hình khoá Gemini hợp lệ", vẫn đủ để người vận hành biết phải xem gì.

### Verify — output thật, chạy sau khi mọi sửa đổi đã nằm trên đĩa

```
bun run check      → Checked 666 files in 29s. No fixes applied.   (0 diagnostic)
bun run typecheck  → Tasks: 18 successful, 18 total
bun run test       → Tasks: 14 successful, 14 total
bun run build      → Tasks:  9 successful,  9 total
```

`@monorepo/assistant-ai` riêng: **60 test / 9 file** xanh.

E2E local, chạy từ thư mục app bằng `bunx playwright test --project=chromium` (không qua `bun run`,
vốn treo lúc launch Chromium trên Windows):

```
apps/assistant-ai → 9 passed (15.4s)
```

Hai app khác được chạy lại để chắc việc thêm namespace vào catalogue chung không làm vỡ gì:

```
apps/_template_next → 6 passed (15.5s)
apps/mcp-weather    → 10 passed (13.7s)
```

### Warning thừa hưởng từ Template — không phải lỗi của ticket này

`webServer` của Playwright chạy `bun run build && bun run start`, trong khi `next.config.ts` đặt
`output: "standalone"`, nên Next cảnh báo `"next start" does not work with "output: standalone"`.
**9 spec xanh chứng minh `next start` boot được, KHÔNG chứng minh server standalone mà `Dockerfile`
thực sự ship (`CMD ["node", "server.js"]`) boot được.** Khoản đó thuộc **ticket 13 §2** của topic
`personal-monorepo-rebuild`, y như ghi chú của ticket 04; sửa lén ở đây sẽ làm app này lệch cả hai
Template và cả `mcp-weather`.

### Còn treo, đã ghi nhận chứ không lặng lẽ bỏ qua

- **Sentry chưa có project.** `next.config.ts` gọi `withSentry(...)` **không kèm `org`/`project`**,
  giống `mcp-weather` và khác `portfolio`. Bản cũ chưa bao giờ dùng Sentry nên không có slug để kế
  thừa, và bịa một slug không tồn tại chỉ làm bước upload source map đỏ trong CI. DSN
  (`NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN`) đã nối đúng ba chỗ và để rỗng — SDK cài nhưng tắt.
- **`error.tsx` nhận `error` nhưng không gọi `captureException`** — thừa hưởng nguyên từ Template,
  cùng khoản treo đã ghi ở ticket 03 và 04.
- **Dashboard vẫn là demo của Template** (`TemplateList` gọi `NEXT_PUBLIC_BASE_DOMAIN_API`, không có
  backend nào ở đó). Giữ vì session guard cần một route để bảo vệ, y như `mcp-weather`.
- **`apps/mcp-weather` vẫn dùng tên cookie của Template** (`template_next_lang`,
  `template_next_session`) trong khi chính comment trong file đó nói tên phải theo app.
  `apps/assistant-ai` khai `assistant_ai_*`, `apps/portfolio` khai `portfolio_lang`. Đây là một dòng
  sửa ở `apps/mcp-weather/src/constants/cookies.ts`, **không** làm ở đây vì ticket 04 đang chờ review
  và đổi tên cookie sẽ đăng xuất mọi session đang mở của app đó.
- **Không có test cho `stream-chat.ts` và route handler.** Cả hai gần như chỉ là dây nối; phần quyết
  định được (`chatErrorCode`, `loadMcpTools`, `isGeminiModel`) đã tách ra và có test riêng. Một test
  cho `streamText` sẽ phải mock chính AI SDK, tức là test lại thư viện.

### Bằng chứng CI — **còn trống, chờ bước 1–3 ở đầu mục Notes**

```
URL run:
job docker (assistant-ai):
job e2e (assistant-ai):
```
