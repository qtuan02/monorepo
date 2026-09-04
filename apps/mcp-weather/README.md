# `@monorepo/mcp-weather`

Máy chủ **Model Context Protocol** cung cấp dữ liệu thời tiết OpenWeatherMap cho
trợ lý AI. Chạy Runtime **Next.js 16 App Router**, clone từ `apps/_template_next`
bằng `bun run gen:app` (ticket `legacy-migrate/04`), thay cho `legacy/mcp` đã
đóng băng.

Sản phẩm của app này là **một endpoint**, không phải một màn hình:

```
POST /api/mcp        Streamable HTTP, JSON-RPC 2.0, KHÔNG auth
```

Các trang web kèm theo (`/`, `/sign-in`, `/dashboard`) là placeholder thừa hưởng
nguyên từ Template — chúng ở lại để app khớp khuôn Template và để `gen:app` lần
sau diff sạch, không phải vì có ai dùng.

```bash
bun run dev:mcp-weather     # http://localhost:3004 — endpoint ở /api/mcp
```

## Hợp đồng MCP — ba tool, không đổi

Đây là hợp đồng một backend khác **đang gọi**, nên tên tool, tên tham số và tên
field trong `structuredContent` là bề mặt công khai: đổi một cái là làm đứt client
đã ship. Chúng cố ý nằm **ngoài** `@monorepo/i18n` — dịch chúng sẽ đổi cái
protocol trả về.

| Tool | Tham số | Trả về |
| --- | --- | --- |
| `hello-world` | — | `{ message: "Hello, World!" }` |
| `get-weather` | `city` (bắt buộc), `units` (`metric` mặc định \| `imperial` \| `standard`) | thời tiết hiện tại: `temperature`, `feelsLike`, `description`, `humidity`, `pressure`, `windSpeed`, `visibility` (km) |
| `get-forecast` | như trên | dự báo 5 ngày / 3 giờ: mảng `forecast[]` cùng bộ field, thêm `tempMin`/`tempMax`/`windDirection`/`pop`/`clouds` |

Mỗi tool trả **cả hai nửa**: `content[0].text` cho model đọc, và
`structuredContent` cho client parse. Cả hai dựng từ một payload trong
`~/features/weather/utils/format-weather.ts` nên không thể lệch nhau.

Gọi thử bằng curl (client MCP phải khai **cả hai** content type trong `Accept`,
đó là yêu cầu của spec):

```bash
curl -X POST http://localhost:3004/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

**Giới hạn đã biết, thừa hưởng từ bản cũ:** tên thành phố chỉ được bỏ dấu tiếng
Việt (`Hồ Chí Minh` → `Ho Chi Minh`), **không** được ánh xạ sang tên OpenWeatherMap
dùng. Nên `Ho Chi Minh City` và `Da Nang` tra được, còn `Hà Nội` (→ `Ha Noi`) trả
404 `city not found` trong khi `Hanoi` thì được. Bản cũ hành xử y hệt; sửa cho tử
tế cần bảng ánh xạ hoặc Geocoding API, nằm ngoài phạm vi ticket migrate.

## Ai đang gọi nó

- `apps/assistant-ai` (ticket `legacy-migrate/05`), qua biến `MCP_DOMAIN` trỏ vào
  URL đầy đủ của endpoint này.
- Một backend **ngoài repo**. Đó là lý do ticket migrate cấm đổi hợp đồng và cấm
  thêm auth cho `/api/mcp`.

## Hình dạng app

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Route handler | `src/app/api/mcp/route.ts` | Mỏng: dựng transport, `connect`, trả `Response`. Không giữ logic protocol nào. Nằm **ngoài** `[locale]`, và matcher của `proxy.ts` đã loại `/api`, nên guard lẫn locale negotiation không bao giờ chạm nó. |
| MCP server | `src/features/weather/server/mcp-server.ts` | `createWeatherMcpServer()` — một **factory**, không phải singleton module. `Server.connect(transport)` chỉ bind được một transport tại một thời điểm, nên một server dùng chung giữa các request song song sẽ bị request sau tráo transport của request trước giữa chừng. Stateless Streamable HTTP là một server + một transport mỗi request. |
| Gọi OpenWeatherMap | `src/features/weather/server/openweathermap.ts` | **Không** đi qua `@monorepo/api`: package đó sở hữu backend mà `NEXT_PUBLIC_BASE_DOMAIN_API` trỏ tới và dùng chung cho cả workspace. OpenWeatherMap là API bên thứ ba, origin riêng, key trong querystring, đúng một consumer — đúng ba điều kiện của mục "The one exception" trong `.agents/rules/architecture-features-modules.md`, được thêm vào rule trong chính ticket này. App thứ hai cần cùng provider thì nó chuyển vào package. |
| Phần thuần | `src/features/weather/utils/format-weather.ts` | Bỏ dấu tên thành phố + format hai câu trả lời. Không `fetch`, không `env` — nên test được không cần mạng và không cần key. |
| Danh mục tool | `src/features/weather/constants/tools.ts` | Dữ liệu thuần (name/title/description) khoá theo tên tool, **không** import SDK — nên mỗi lần `registerTool` tra bảng là compiler kiểm, không phải `.find()` lúc chạy. Vừa là nguồn cho `registerTool`, vừa là nguồn cho trang placeholder — nên trang không thể quảng cáo một tool endpoint không phục vụ, và trang không kéo SDK vào bundle. |
| Trang placeholder | `src/features/weather/templates/mcp-overview.template.tsx` | Server Component, không ship JS, đọc thẳng `MCP_TOOLS`. Không có loader `"use cache"` ở giữa: không có gì để fetch, danh mục là hằng số của chính slice đăng ký các tool đó — cùng lý do `apps/portfolio` không có loader nào. |
| Không có | — | Slice `home` của Template (đã thay bằng `weather`), `~/stores/`, và nút "Thử lại" trên dashboard: nó post vào một Server Action `revalidateTag` cho catalogue của **trang chủ** — hay để dạy trong Template, nhưng ở đây là nút của slice này bust cache của slice kia dưới một nhãn không nói điều đó. |
| Guard / auth | `src/features/auth/`, `src/proxy.ts` | **Giữ nguyên của Template** — khác `apps/portfolio`, vốn bỏ hẳn. `/dashboard` vẫn nằm sau `PROTECTED_ROUTE_PREFIXES`, và `e2e/server-rendering.e2e.ts` vẫn chứng minh redirect xảy ra trong chính response. |

## Env

Đọc qua Flavor `next` của `@monorepo/env` trong `src/env.ts`. `.env` nằm ở **root
repo** (ADR-0003), nạp bằng `dotenv -e ../../.env --` vì Next chỉ đọc `.env` nằm
trong thư mục app.

| Key | Bắt buộc | Dùng ở |
| --- | --- | --- |
| `MCP_WEATHER_OPENWEATHERMAP_API_KEY` | **Có** | `src/features/weather/server/openweathermap.ts` |
| `NEXT_PUBLIC_MCP_WEATHER_SENTRY_DSN` | Không | `instrumentation.ts`, `instrumentation-client.ts` |

Cả hai **mang tên app**. `.env` ở root là **một** file dùng chung cho mọi app, nên
một giá trị của riêng một app phải nói rõ app nào — xem `packages/env/README.md`.
Đó cũng là lý do key ở đây là `MCP_WEATHER_OPENWEATHERMAP_API_KEY` chứ không phải
`OPENWEATHERMAP_API_KEY` như bản cũ: hồi đó app sống trong một workspace mà các
app không dùng chung một file env.

Key OpenWeatherMap cố ý **không** `.optional()` (Template để secret mẫu của nó là
optional): hai tool thời tiết là toàn bộ lý do app tồn tại, nên thiếu key thì
`next build` — và bước `import './src/env.ts'` trong `Dockerfile` — phải đỏ ngay
và gọi đúng tên biến, thay vì ship một server mà `hello-world` vẫn xanh còn
`get-weather` trả 401 không ai đọc. `.env.example` vì thế mang một placeholder
(`replace-with-your-openweathermap-key`) để `docker build` trần và CI vẫn xanh;
key thật lấy ở <https://openweathermap.org/api> và đặt trong `.env` của bạn.

## Port

Khai đúng **một** chỗ: `ports.env`.

| | Port |
| --- | --- |
| Dev (`next dev`) | **3004** |
| E2E (`next start` do Playwright dựng) | **3104** |

## Lệnh

```bash
bun run dev:mcp-weather                                  # dev server, cổng 3004
bun run build:mcp-weather                                # build production

bun run --filter @monorepo/mcp-weather typecheck         # next typegen && tsc
bun run --filter @monorepo/mcp-weather test              # Vitest 5 + RTL (jsdom)
bun run --filter @monorepo/mcp-weather test:coverage     # báo cáo v8, không có ngưỡng

bunx playwright test --project=chromium                  # E2E — chạy TỪ TRONG thư mục app
bun run e2e:headed:mcp-weather                           # cùng spec, một cửa sổ thật

# Docker chạy TỪ ROOT repo — context phải là root (Dockerfile mở bằng
# `COPY . .` + `bunx turbo prune`); lấy thư mục app làm context sẽ đỏ ở bước prune.
docker build -f apps/mcp-weather/Dockerfile -t mcp-weather .
```

Trên Windows gọi E2E bằng `bunx playwright test` với cwd là thư mục app: chạy
runner qua một `bun run` script có thể treo lúc launch Chromium.

## Test

`test/` soi gương đường dẫn dưới `src/`; `e2e/` là hàng xóm của nó, đuôi
`.e2e.ts` để Vitest không bao giờ nhặt phải.

Ranh giới giữa hai runner ở app này rất rõ:

- **Vitest** phủ nửa thuần và cả lớp `fetch` — `test/features/weather/server/openweathermap.test.ts`
  chạy trên environment **node** (nửa còn lại của suite là jsdom, nơi t3-env từ
  chối trả biến `server`) và stub `globalThis.fetch`: nó chốt endpoint, tên thành
  phố đã bỏ dấu, `units`, `cache: "no-store"`, và việc một lỗi từ provider ném
  kèm cả status lẫn message gốc — đúng chuỗi client đọc lại trong `isError`. Đây
  là "mock fetch tại seam thấp nhất" mà ticket cho phép, nên không spec nào cần
  key thật.
  `test/features/weather/utils/format-weather.test.ts`
  (đổi mét sang km, nhãn đơn vị theo `units`, POP thành phần trăm nguyên, xuống
  dòng mỗi 8 mốc 3 giờ, bỏ dấu `đ`/`Đ`) và
  `test/features/weather/constants/tools.test.ts` (ba tên tool ghim cứng dưới
  dạng literal — suy ra từ chính mảng đang test thì một lần đổi tên sẽ đi qua im
  lặng).
- **Playwright** phủ hợp đồng, trên bản **build**, qua fixture `request` (không
  browser): `e2e/mcp-endpoint.e2e.ts` gọi `initialize`, `tools/list` (đúng ba
  tên) và một `tools/call hello-world` (không cần API key — vì thế CI chạy được
  mà không cần secret), rồi kiểm endpoint trả 200 không redirect, tức không dính
  guard lẫn prefix locale.

`get-weather` / `get-forecast` **không** có E2E: chúng gọi mạng ra ngoài và cần
key thật, nên một spec cho chúng sẽ vừa flaky vừa buộc CI phải giữ secret. Chúng
được kiểm bằng tay với key thật khi migrate (xem Notes của ticket 04), và mọi thứ
dưới lớp `fetch` — kể cả nhánh lỗi khi key sai — đã có unit test ở trên.

## Deploy Vercel

`vercel.json` trỏ install/build về root repo và gọi script **`build:vercel`**:

```jsonc
"installCommand": "cd ../.. && bun install --frozen-lockfile",
"buildCommand":   "cd ../.. && bun run --filter @monorepo/mcp-weather build:vercel",
```

`build:vercel` là `next build` **trần**, không có tiền tố `dotenv -e ../../.env`
như script `build` chuẩn: trên Vercel **không có `.env` ở root** — biến đến từ
Environment Variables trong dashboard và đã nằm sẵn trong `process.env` lúc
build, nên tiền tố dotenv ở đó vừa thừa vừa đỏ vì không tìm thấy file.

Nghĩa là **cả hai** key ở mục Env phải khai trong dashboard Vercel cho Production
lẫn Preview — thiếu `MCP_WEATHER_OPENWEATHERMAP_API_KEY` thì build đỏ, đúng như
thiết kế.

`output: "standalone"` trong `next.config.ts` bị Vercel **bỏ qua** (Vercel dùng
Build Output API riêng), nên nó không cản deploy zero-config; nó ở đó cho runner
Docker `node:24-alpine` + `node server.js`.

## Sentry

DSN đọc từ `NEXT_PUBLIC_MCP_WEATHER_SENTRY_DSN` và truyền vào `initSentryClient`
(`src/instrumentation-client.ts`) cùng `initSentryForRuntime`
(`src/instrumentation.ts`). DSN rỗng nghĩa là SDK vẫn cài nhưng tắt — không gọi
mạng, không log rác (xem `packages/sentry/src/options.ts`).

`next.config.ts` gọi `withSentry(...)` **không kèm `org`/`project`**, khác
`apps/portfolio`. Bản cũ (`legacy/mcp`) chưa bao giờ dùng Sentry nên không có
project nào để kế thừa, và bịa ra một slug không tồn tại chỉ làm bước upload
source map đỏ trong CI. Khi project Sentry thật được tạo, thêm
`{ org, project }` ở đó là đủ.
