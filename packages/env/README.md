# `@monorepo/env`

Validate biến môi trường **một lần, lúc module load**, và trả về object đã
typed. Sai hoặc thiếu biến thì throw ngay với message đọc được — thay vì lòi ra
sau đó dưới dạng một `baseURL` `undefined` khiến mọi request bắn về chính origin
của app.

Package có **hai Flavor**, mỗi Flavor là một biến thể theo Runtime nằm dưới
subpath riêng của cùng package:

| Subpath | Runtime | Tiền tố | Nền |
| --- | --- | --- | --- |
| `@monorepo/env/vite/*` | Vite client (SPA) | `PUBLIC_` | zod `safeParse` |
| `@monorepo/env/next/*` | Next.js App Router | `NEXT_PUBLIC_` | `@t3-oss/env-nextjs` |
| `@monorepo/env/*` | không phụ thuộc Runtime | — | dùng chung cho cả hai |

## Vì sao hai tiền tố

Xem [`docs/adr/0003-env-two-flavors-native-prefix.md`](../../docs/adr/0003-env-two-flavors-native-prefix.md).

Tóm tắt: Next **chỉ** inline biến `NEXT_PUBLIC_*` vào bundle client, và không có
cách nào map một tên khác vào đó (`experimental__runtimeEnv` chỉ đổi *nguồn* giá
trị, không đổi việc Next có inline hay không). Vite thì inline theo `envPrefix`
tự cấu hình được. Nên mỗi Runtime **giữ tiền tố chuẩn của nó**, và không có lớp
nào map nhóm này sang nhóm kia.

Cái giá phải trả — và là cái được chấp nhận có chủ ý — là một giá trị dùng chung
(ví dụ `BASE_DOMAIN_API`) xuất hiện **hai lần** trong `.env` root, một lần cho
mỗi tiền tố. `.env` vẫn là **một file duy nhất ở root**; app Next nạp nó bằng
`dotenv -e ./ports.env -e ../../.env -- next dev` vì `next dev`/`next build` chỉ
đọc `.env` nằm trong thư mục app.

Vì tiền tố khác nhau, hai Flavor **không** chia sẻ base schema; thứ chúng chia
sẻ là những mảnh không phụ thuộc Runtime (hiện có `http-url`).

## Đặt tên key theo app

Tiền tố (`PUBLIC_` / `NEXT_PUBLIC_` / không tiền tố) trả lời câu hỏi *ai đọc
được biến này*. Còn **phần tên ngay sau tiền tố** trả lời câu hỏi *app nào sở
hữu nó*:

| Giá trị | Tên key | Ví dụ |
| --- | --- | --- |
| Mọi app đều đọc | key trần của Template | `PUBLIC_BASE_DOMAIN_API`, `NEXT_PUBLIC_SENTRY_DSN` |
| Chỉ **một** app đọc | mang tên app | `PUBLIC_DOCUMENTS_STORYBOOK_URL`, `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN` |
| Secret của **một** app | mang tên app, không tiền tố | `MCP_WEATHER_OPENWEATHERMAP_API_KEY` |

Lý do nằm ở chỗ **chỉ có đúng một `.env` ở root cho cả workspace** (ADR-0003):
mọi app trong `apps/` đọc cùng file đó — app Vite qua `envDir: "../../"`, app
Next qua `dotenv -e ../../.env --`. Nên hai app dùng chung một tên key **không
phải** là chia sẻ một giá trị mặc định: nó có nghĩa là mỗi app đang build bằng
giá trị của app kia, và người sửa file `.env` không có cách nào biết mình đang
đổi cho ai.

Cụ thể: `apps/portfolio` cần một DSN Sentry riêng (project `portfolio_v1`, khác
project của Template). Nếu nó mượn `NEXT_PUBLIC_SENTRY_DSN` thì một máy dev bật
Sentry cho Template sẽ vô tình bắn lỗi của portfolio sang đúng project đó — và
ngược lại. Vì vậy nó khai `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN`, còn key trần ở
trên vẫn thuộc về Template. Tương tự, `apps/documents` khai
`PUBLIC_DOCUMENTS_STORYBOOK_URL`: chỉ site tài liệu mới có khái niệm "URL
Storybook", nên một key trần `PUBLIC_STORYBOOK_URL` sẽ hứa với người đọc
`.env.example` một điều không đúng. Và `apps/mcp-weather` khai
`MCP_WEATHER_OPENWEATHERMAP_API_KEY` chứ không giữ `OPENWEATHERMAP_API_KEY` như
bản trong `legacy/`: một key trần cho một nhà cung cấp bên thứ ba là chỗ dễ va
nhất, vì app thứ hai cần cùng loại key sẽ tưởng nó đang dùng chung thay vì đang
ghi đè.

Đổi lại, mỗi key mang tên app **phải** được khai trong `env.ts` của đúng app đó
và thêm vào `.env.example` kèm một dòng comment nói app nào sở hữu — vì tên key
là thứ duy nhất còn lại để tra ngược từ `.env` về app.

## Flavor `vite`

```ts
// apps/<app>/src/env.ts
import * as z from "zod";

import { createEnv } from "@monorepo/env/vite/create-env";
import { baseEnvSchema } from "@monorepo/env/vite/schema";

const appEnvSchema = baseEnvSchema.extend({
  PUBLIC_ANALYTICS_ID: z.string().min(1),
});

export const env = createEnv(appEnvSchema, import.meta.env);
```

`createEnv(schema, runtimeEnv)` nhận `runtimeEnv` như một tham số chứ không tự
đọc `import.meta.env`, nên package vẫn dùng được ngoài Vite (script Bun/Node,
chính test của package này).

## Flavor `next`

```ts
// apps/<app>/src/env.ts
import * as z from "zod";

import { createEnv } from "@monorepo/env/next/create-env";

export const env = createEnv({
  // Không tiền tố: Next không đưa vào bundle client, t3-env đọc thẳng
  // `process.env`.
  server: {
    DATABASE_URL: z.url(),
    AUTH_SECRET: z.string().min(1),
  },
  // Chỉ những biến client app này thêm vào; ba biến base đã có sẵn.
  client: {
    NEXT_PUBLIC_ANALYTICS_ID: z.string().min(1),
  },
  clientRuntimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_BASE_DOMAIN: process.env.NEXT_PUBLIC_BASE_DOMAIN,
    NEXT_PUBLIC_BASE_DOMAIN_API: process.env.NEXT_PUBLIC_BASE_DOMAIN_API,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },
});
```

Ba ràng buộc, cả ba đều là lý do API có hình dạng như trên:

1. **`clientRuntimeEnv` phải viết trong `env.ts` của app**, dưới dạng literal
   `process.env.NEXT_PUBLIC_*`. Next chỉ thay thế tĩnh những literal đó trong
   code **do nó compile**; nếu package này tự đọc `process.env` hộ, giá trị sẽ
   là `undefined` trong browser (trừ khi app khai `transpilePackages`). Đây là
   lý do base key vẫn phải liệt kê ở đây, dù schema của chúng đã nằm sẵn trong
   package.
2. **Biến base khai dưới `client`, không phải `server`.** Một key
   `NEXT_PUBLIC_*` khai nhầm vào `server` sẽ *biến mất* khỏi object khi module
   chạy phía client — đọc ra `undefined` mà không throw gì cả.
3. **Biến `server` không cần khai runtime value**: wrapper dùng
   `experimental__runtimeEnv`, nên t3-env lấy chúng từ `process.env`.

4. **`shared` là block tuỳ chọn** cho biến đọc được ở cả hai phía mà không mang
   tiền tố (`NODE_ENV`, `APP_TIER`…). t3-env validate chúng ở cả hai nửa, nên giá
   trị của chúng phải nằm trong `clientRuntimeEnv` — type của option ép đúng điều
   đó.

Kết quả trả về là một Proxy đã typed: đọc một biến `server` từ code client sẽ
throw, và mọi key không khai báo đều là lỗi typecheck.

## Phần dùng chung (ngoài mọi Flavor)

`@monorepo/env/http-url` xuất `httpUrlSchema` — `z.url({ protocol: /^https?$/ })`.
Chặt hơn `z.url()` (vốn nhận cả `"localhost:8000"`, đọc `localhost:` như một
scheme) và lỏng hơn `z.httpUrl()` (vốn đòi domain public nên loại
`http://localhost:3000`).

## Test

Vitest 5, `environment: "node"`. Flavor `next` test được **không cần Next
runtime**: t3-env chỉ cần một object giá trị, và nó *throw* chứ không
`process.exit`. Mọi test truyền `isServer: true` — nếu không, t3-env tự đoán
server/client bằng `typeof window`, và dưới một test environment có DOM nó sẽ
**âm thầm bỏ qua** phần `server` thay vì validate.

```bash
bun run --filter @monorepo/env test
```
