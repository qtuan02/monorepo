---
status: ready-for-human
---

# 04 — Migrate `mcp` thành `mcp-weather` trên `_template_next`, giữ nguyên hợp đồng MCP

**What to build:** Backend đang gọi MCP thời tiết tiếp tục gọi được `POST /api/mcp` (Streamable HTTP) với ba tool `hello-world`, `get-weather`, `get-forecast`, không auth, y như trước — chỉ khác app giờ tên `mcp-weather`, sinh từ `_template_next` và **giữ nguyên** i18n, guard, proxy, Sentry của Template (route `/api/*` nằm ngoài matcher nên guard không chạm). Key OpenWeatherMap là server env khai trong `env.ts`, build fail sớm khi thiếu ở môi trường cần.

**Blocked by:** 03 — quy ước env key theo tên app và đường e2e/docker đã được chứng minh trên portfolio.

**Status:** `ready-for-human` (2026-09-04) — xem Notes: 5/6 ô đã đạt, ô cuối chờ một lượt chạy CI.

## Acceptance criteria

- [x] `apps/mcp-weather` (workspace `@monorepo/mcp-weather`) sinh bằng `gen:app` Runtime `next`; không gỡ `[locale]`, next-intl, `proxy.ts`, session guard; trang chủ Template giữ làm placeholder (có thể đổi copy nói đây là MCP server).
- [x] Route handler dưới `app/api/mcp/` dựng `McpServer` + `StreamableHTTPServerTransport` với `@modelcontextprotocol/sdk` bản mới nhất theo catalog và `zod` catalog; logic gọi OpenWeatherMap nằm trong slice `features/weather/` (server helper), không trong route module; types dưới `types/` hoặc `@monorepo/types` nếu app khác cần.
- [x] `env.ts`: `OPENWEATHERMAP_API_KEY` (server, không prefix, tên có prefix app hay không — theo quy ước ticket 03, ghi lựa chọn vào Notes) và `NEXT_PUBLIC_MCP_WEATHER_SENTRY_DSN`; `.env.example` và Docker ARG cập nhật; e2e chạy được với key giả (mock fetch tới OpenWeatherMap tại seam thấp nhất có thể, hoặc tool trả lỗi có cấu trúc khi key giả — hợp đồng MCP vẫn được chứng minh).
- [x] E2E bằng `request` fixture trên bản build (`next start`): `initialize` → `tools/list` trả đúng ba tên tool; một `tools/call` `hello-world` trả đúng; xanh local và trên job `e2e` CI.
- [x] `vercel.json` giữ nếu bản cũ có; README `apps/mcp-weather` ghi URL endpoint, ba tool, key cần, app nào đang gọi (`assistant-ai` qua `MCP_DOMAIN`, và BE ngoài repo); nội dung `legacy/docs/apps/MCP.md` được thay thế; `legacy/README.md` dòng `mcp` cập nhật tên mới và trạng thái.
- [ ] Không còn `@modelcontextprotocol/sdk ^1.0`, `@t3-oss/env-nextjs` trực tiếp, `jiti`; Gate xanh 0 warning; job `docker` xanh; output vào Notes.

## Notes

**Trạng thái: `ready-for-human` (2026-09-04) — không phải `done`.**
Năm trên sáu ô đã tick và có bằng chứng dưới đây. Ô #6 còn hở đúng một mảnh: **job `docker`**.
Máy này không dựng được image (`command -v docker` rỗng) và không có `gh` để đọc run — đúng bức
tường đã đẩy ticket 02 và 03 sang cùng nhãn. Phần còn lại của ô đó đã đạt: Gate xanh 0 warning
(output bên dưới), catalog không còn `jiti`, không workspace nào khai `@t3-oss/env-nextjs` trực tiếp
ngoài chính `packages/env`, và SDK đã ở `^1.30.0`.

**Còn lại đúng ba bước, và ai làm:**

1. **Một người** push nhánh `feat/upgrade`.
2. **Một người** mở run, mở riêng job matrix `docker (mcp-weather)` và job `e2e`. Cả hai mang
   `continue-on-error: true` nên dấu tích tổng của workflow là vô nghĩa ở đây — phải mở từng job.
3. Dán URL run + kết quả vào mục "Bằng chứng CI" ở cuối, tick #6, rồi đổi `status: done`.

### App được sinh, không copy tay

`gen run app --args mcp-weather next` (qua binary `gen`, không phải `bunx turbo gen` — nó cắt cụt
argument trên Windows). Generator gán port **3004 dev / 3104 e2e** vào `apps/mcp-weather/ports.env`,
đổi tên trong `package.json` và hai ARG của `Dockerfile`, rồi thêm ba script root. `legacy/mcp/` chỉ
được đọc.

### Quyết định 1 — tên key env: **mang tên app**

AC để ngỏ; spec nói *"ưu tiên tên app khi hai app có thể cần key cùng loại"*. Chọn
**`MCP_WEATHER_OPENWEATHERMAP_API_KEY`**, không giữ `OPENWEATHERMAP_API_KEY` của bản cũ. Lý do là
điều kiện đã đổi chứ không phải sở thích: hồi đó mỗi app có `.env` riêng, còn ở repo này **một** file
`.env` ở root phục vụ mọi app (ADR-0003), nên một key trần cho một nhà cung cấp bên thứ ba là chỗ dễ
va nhất — app thứ hai cần cùng loại key sẽ tưởng nó dùng chung trong khi thực ra đang ghi đè. Đã ghi
vào `packages/env/README.md` (nó thành ví dụ cho hàng "Secret của **một** app") và CLAUDE.md §3.

Key là **bắt buộc** (`z.string().min(1)`), khác secret mẫu optional của Template. Đo được:

```
$ bun --env-file=<.env thiếu key> -e "import './src/env.ts';"
error: Invalid environment:
✖ MCP_WEATHER_OPENWEATHERMAP_API_KEY: Invalid input: expected string, received undefined
    at apps/mcp-weather/src/env.ts:26:20
```

Đó đúng là bước `Dockerfile` chạy, nên image thiếu key sẽ đỏ lúc build kèm tên biến thay vì ship một
server mà `hello-world` vẫn xanh còn `get-weather` trả 401. `.env.example` vì thế mang placeholder
`replace-with-your-openweathermap-key` — CI `cp .env.example .env` trong `setup-workspace`, nên Gate
và `docker build` trần vẫn xanh với key giả.

### Quyết định 2 — transport: bỏ hẳn shim Node ~250 dòng

Bản cũ dùng `StreamableHTTPServerTransport` (Node, cần `IncomingMessage`/`ServerResponse`) nên phải tự
dựng một `ServerResponse` giả: `writeHead`, `write`, `end`, `on`/`once`/`emit`, gom `Uint8Array`, và
một `setTimeout(5000)` dự phòng khi sự kiện `finish` không bao giờ bắn. SDK `1.30.0` có
`WebStandardStreamableHTTPServerTransport` nhận thẳng `Request` và trả `Response` — đúng thứ một route
handler App Router được đưa. Toàn bộ shim biến mất; route handler còn 3 dòng thân.

Kèm theo một sửa đúng chứ không chỉ ngắn hơn: bản cũ giữ **một `McpServer` ở module scope** rồi
`connect` một transport mới cho mỗi request. `Server.connect` chỉ bind được một transport tại một
thời điểm, nên hai request song song thì request sau tráo transport của request trước giữa chừng.
Bản mới là factory `createWeatherMcpServer()` — một server + một transport mỗi request, đúng hình
dạng stateless mà chính ví dụ của SDK dùng.

### Quyết định 3 — trang chủ: thay nội dung, giữ mọi thứ khác của Template

AC bắt buộc giữ `[locale]`, next-intl, `proxy.ts`, session guard — **đã giữ nguyên cả bốn**, cùng
slice `auth`, màn `sign-in` và `dashboard` được guard (khác `apps/portfolio`, vốn bỏ hẳn). Phần AC
cho phép ("*có thể* đổi copy") đã dùng: slice `home` của Template được thay bằng slice `weather` với
một trang tổng quan endpoint, dưới namespace i18n riêng `mcpWeather.*`.

Vì sao đi xa hơn "đổi copy": app này **deploy công khai lên Vercel**, và một trang public quảng cáo
sáu phân hệ bệnh viện không tồn tại (POS, Bệnh nhân, Thuốc…) là sai lệch chứ không chỉ thừa. Trang
mới ít code hơn trang cũ (không grid module, không bảng icon, không cờ `comingSoon`) và đọc đúng
`MCP_TOOLS` mà server đăng ký, nên nó không thể quảng cáo một tool endpoint không phục vụ.

**Nếu chủ ticket muốn đúng chữ "giữ trang Template" thì đây là chỗ phải sửa lại** — không hạng mục
nào khác phụ thuộc quyết định này.

### Đối chiếu hợp đồng MCP một-đối-một với bản cũ

Đây là dạng lỗi im lặng nhất của cuộc migrate này: một tên field lệch và client ngoài repo hỏng mà
không test nào đỏ. Đã đối chiếu từng dòng `legacy/mcp/src/app/api/mcp/route.ts` với bản mới, rồi
kiểm lại bằng cách gọi thật `tools/list` trên bản build:

| Mặt hợp đồng | Bản cũ | Bản mới |
| --- | --- | --- |
| Path | `/api/mcp` | trùng |
| Method | `GET` (SSE) + `POST` (JSON) | trùng |
| Auth | không | không |
| `serverInfo` | `tuan-mcp` / `1.0.0` | trùng |
| Tên tool | `hello-world`, `get-weather`, `get-forecast` | trùng |
| `title` / `description` | — | trùng từng ký tự |
| `inputSchema` | `city` required, `units` enum 3 giá trị, `default: "metric"` | trùng (đã đọc JSON Schema thật từ `tools/list`) |
| `outputSchema` | 9 field / 3 + 14 field | trùng từng tên và kiểu |
| Chuỗi lỗi | `Failed to get weather data: …` / `Failed to get weather forecast: …` | trùng (xem "Lỗi vòng review bắt được" #3) |

### Sai lệch cố ý duy nhất so với bản cũ, và nó là một bản sửa

`units: "standard"` trước đây in nhãn tốc độ gió là **`mph`**, vì code rẽ nhánh
`units === "metric" ? "m/s" : "mph"`. OpenWeatherMap trả **m/s** cho cả `standard` lẫn `metric`; chỉ
`imperial` là mph. Một đơn vị sai gắn vào một con số mà model đọc ra cho người dùng là loại lỗi không
ai thấy cho tới khi câu trả lời đã sai. Đã sửa và có test giữ
(`format-weather.test.ts` → *"labels standard with K and m/s, the units the provider actually returns"*).

### Giới hạn giữ nguyên, không lặng lẽ bỏ qua

Chuẩn hoá tên thành phố chỉ **bỏ dấu tiếng Việt**, không ánh xạ sang tên OpenWeatherMap dùng — y hệt
bản cũ (comment trong bản cũ hứa "map to English names" nhưng chưa bao giờ làm). Đo thật:
`Ho Chi Minh City` → OK, `Da Nang` → OK, còn `Hà Nội` → `Ha Noi` → 404 `city not found` trong khi
`Hanoi` thì được. Sửa tử tế cần bảng ánh xạ hoặc Geocoding API — là tính năng mới, nằm ngoài
*"migrate là 1:1 trên khuôn mới"*. Đã ghi vào README của app.

### Rule được sửa, không phải comment biện hộ

`features/weather/server/openweathermap.ts` gọi thẳng `fetch`, không qua `@monorepo/api`. Rule
`architecture-features-modules.md` khi đó **không có ngoại lệ nào**, nên bản đầu chỉ có một comment
giải thích — tức là tạo tiền lệ mà không có luật đứng sau, và tích hợp bên thứ ba tiếp theo sẽ copy.
Đã thêm mục **"The one exception: a third-party API that exactly one app calls"** vào chính rule đó,
với ba điều kiện phải cùng đúng (bên thứ ba, đúng một app gọi, key do app đó tự khai) và câu chốt:
app thứ hai cần cùng provider thì nó chuyển vào package.

### Bốn thứ vòng review tìm ra và đã sửa trong chính lượt này

1. **Hợp đồng output khai hai lần.** `types/weather.ts` có interface `WeatherOutput`/`ForecastOutput`,
   còn `mcp-server.ts` có `outputSchema` zod liệt kê **cùng** 9 và 14 tên field — hai bản viết tay,
   mỗi bản typecheck độc lập, thêm field vào một bên thì bên kia sai im lặng, với đúng thứ file tự gọi
   là "the wire contract". Nay chỉ còn schema zod, TS type suy ra bằng `z.infer`, và `registerTool`
   nhận `weatherOutputSchema.shape`. Đã kiểm JSON Schema phát ra không đổi.
2. **`toolConfig()` tra `.find()` + `throw` lúc chạy** trên một mảng literal compile-time. Nay
   `MCP_TOOL_DETAILS` là `Record<McpToolName, …>`, mỗi lần tra được compiler kiểm, không còn nhánh lỗi
   nào để test.
3. **Chuỗi lỗi của tool đã lệch.** Bản cũ bọc `Failed to get weather data: ${msg}`; bản đầu để lỗi
   thô lọt ra, nên payload `isError` mà client đang đọc **đã khác**. Đã khôi phục nguyên văn cả hai
   tiền tố. Đây là drift hợp đồng thật, và là thứ mắt thường dễ bỏ qua nhất trong cả ticket.
4. **`"use cache"` trên một hằng số.** Bản đầu có `server/tool-catalogue.ts` bọc `MCP_TOOLS` bằng
   `"use cache"` + `cacheTag` mà không gì revalidate, cộng một nút "Thử lại" trên dashboard post vào
   Server Action bust cache của **trang chủ** — nút của slice này bust cache slice kia dưới một nhãn
   không nói điều đó. Đã xoá cả ba; page giờ đúng một dòng `return <McpOverviewTemplate />`, cùng lối
   `apps/portfolio` (nội dung là hằng số của chính slice). Namespace cũng dọn theo: app không còn đọc
   key `home.*` nào của Template.

### Test — ranh giới hai runner

`get-weather`/`get-forecast` **không** có E2E, và đó là lựa chọn chứ không phải thiếu sót: một spec
cho chúng hoặc gọi mạng thật (flaky) hoặc buộc CI giữ secret. AC cho ba đường; đã chọn đường đầu —
*"mock fetch tới OpenWeatherMap tại seam thấp nhất có thể"*:

- `test/features/weather/server/openweathermap.test.ts` chạy trên environment **node** (phần còn lại
  của suite là jsdom, nơi t3-env từ chối trả biến `server`) và stub `globalThis.fetch`. Nó chốt
  endpoint mỗi tool gọi, tên thành phố đã bỏ dấu trong `q`, `appid`, `units` và mặc định `metric`,
  `cache: "no-store"`, và việc lỗi provider ném kèm **cả status lẫn message gốc** — đúng chuỗi client
  đọc lại bên trong `isError` khi key sai.
- `format-weather.test.ts` phủ nửa thuần: mét→km, nhãn đơn vị theo `units` (kể cả nhánh `standard` đã
  sửa), POP thành phần trăm nguyên, xuống dòng mỗi 8 mốc 3 giờ, `đ`/`Đ` mà NFD không tách.
- `tools.test.ts` ghim ba tên tool và `MCP_ENDPOINT_PATH` dưới dạng **literal** — suy ra từ chính mảng
  đang test thì một lần đổi tên sẽ đi qua im lặng, mà đây là thứ client ngoài repo hard-code.
- E2E `mcp-endpoint.e2e.ts` phủ hợp đồng trên bản build qua fixture `request` (không browser):
  `initialize`, `tools/list` đúng ba tên, `tools/call hello-world` khớp cả `content` lẫn
  `structuredContent`, và endpoint trả 200 với `maxRedirects: 0` — tức không dính guard lẫn prefix
  locale.

Ngoài ra đã kiểm **bằng tay với key thật** (lấy từ `legacy/.env`, không commit) trên bản build:
`get-weather` "London" `standard` trả 292.58K / 5.66 m/s; `get-forecast` "Da Nang" `imperial` trả 40
mốc; `get-weather` "Nowhereville" trả `isError: true` với chuỗi
`Failed to get weather data: OpenWeatherMap API error: 404 Not Found - {"cod":"404",…}`.

### Verify — output thật, chạy sau khi mọi sửa đổi đã nằm trên đĩa

```
bun run check      → Checked 578 files in 40s. No fixes applied.   (0 diagnostic)
bun run typecheck  → Tasks: 17 successful, 17 total
bun run test       → Tasks: 13 successful, 13 total
bun run build      → Tasks:  8 successful,  8 total
```

`@monorepo/mcp-weather` riêng: **57 test / 8 file** xanh.

E2E local, chạy từ thư mục app bằng `bunx playwright test --project=chromium` (không qua `bun run`,
vốn treo lúc launch Chromium trên Windows):

```
apps/mcp-weather → 10 passed (20.3s)
```

### Một warning thật, thừa hưởng từ Template — không phải lỗi của ticket này

`webServer` của Playwright chạy `bun run build && bun run start`, trong khi `next.config.ts` đặt
`output: "standalone"`, nên Next cảnh báo `"next start" does not work with "output: standalone"`.
Hệ quả phải nói thẳng: **10 spec xanh chứng minh `next start` boot được, KHÔNG chứng minh server
standalone mà `Dockerfile` thực sự ship (`CMD ["node", "server.js"]`) boot được.** Khoản đó thuộc
**ticket 13 §2** của topic `personal-monorepo-rebuild`; sửa lén ở đây sẽ làm app này lệch cả hai
Template.

### Còn treo, đã ghi nhận chứ không lặng lẽ bỏ qua

- **Sentry chưa có project.** `next.config.ts` gọi `withSentry(...)` **không kèm `org`/`project`**,
  khác `apps/portfolio`. Bản cũ chưa bao giờ dùng Sentry nên không có slug để kế thừa, và bịa một
  slug không tồn tại chỉ làm bước upload source map đỏ trong CI. DSN
  (`NEXT_PUBLIC_MCP_WEATHER_SENTRY_DSN`) đã nối đúng ba chỗ và để rỗng — SDK cài nhưng tắt. Tạo
  project thật rồi thêm `{ org, project }` là đủ.
- **`error.tsx` nhận `error` nhưng không gọi `captureException`** — thừa hưởng nguyên từ Template,
  cùng khoản treo đã ghi ở ticket 03.
- **`GET /api/mcp` giờ stream thật.** Shim cũ có `setTimeout(5000)` nên GET luôn trả sau ≤5s và thực
  tế chưa bao giờ stream; transport mới giữ kết nối SSE mở kèm keep-alive 15s. Đúng spec Streamable
  HTTP hơn bản cũ, nhưng ở chế độ stateless thì không gì đẩy dữ liệu vào stream đó — nên nếu một
  client mở GET và giữ, đó là một kết nối rỗi. Trên Vercel function timeout sẽ cắt. Giữ vì hợp đồng,
  ghi lại vì nó là hành vi *đã đổi* dù bề mặt không đổi.
- **Dashboard vẫn là demo của Template** (`TemplateList` gọi `NEXT_PUBLIC_BASE_DOMAIN_API`, không có
  backend nào ở đó). Giữ vì AC bắt giữ session guard, và guard cần một route để bảo vệ.

### Bằng chứng CI — **còn trống, chờ bước 1–3 ở đầu mục Notes**

```
URL run:
job docker (mcp-weather):
job e2e (mcp-weather):
```
