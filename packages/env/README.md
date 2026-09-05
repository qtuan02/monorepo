# `@monorepo/env`

Validate biến môi trường **một lần, lúc module load**, và trả về object đã
typed. Sai hoặc thiếu biến thì throw ngay với message đọc được — thay vì lòi ra
sau đó dưới dạng một `baseURL` `undefined` khiến mọi request bắn về chính origin
của app.

Package có **ba Flavor**, mỗi Flavor là một biến thể theo Runtime nằm dưới
subpath riêng của cùng package:

| Subpath | Runtime | Tiền tố | Nền |
| --- | --- | --- | --- |
| `@monorepo/env/vite/*` | Vite client (SPA) | `PUBLIC_` | zod `safeParse` |
| `@monorepo/env/next/*` | Next.js App Router | `NEXT_PUBLIC_` | `@t3-oss/env-nextjs` |
| `@monorepo/env/react-router/*` | React Router 8 framework mode (SSR) | `PUBLIC_` cho client, không tiền tố cho server | `@t3-oss/env-core` |
| `@monorepo/env/*` | không phụ thuộc Runtime | — | dùng chung cho cả ba |

## Vì sao mỗi Runtime giữ tiền tố riêng

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

Vì tiền tố — và cách validate — khác nhau, các Flavor **không** chia sẻ base
schema; thứ chúng chia sẻ là những mảnh không phụ thuộc Runtime (hiện có
`http-url`). Kể cả `react-router` và `vite`, vốn dùng chung tiền tố
`PUBLIC_`, cũng khai lại base block của mình: một Flavor không import Flavor
khác, và hai hình dạng thật sự khác nhau — `vite` là một `z.object` được
`safeParse` nguyên khối, `react-router` là dictionary từng key vì t3-env tách
nửa server và nửa client ra trước khi parse. Phần trùng lặp đó được giữ trung
thực bằng một test drift: bộ key `PUBLIC_*` của hai bên phải bằng nhau, nếu một
bên thêm hoặc bớt key thì test đỏ.

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
bản cũ: một key trần cho một nhà cung cấp bên thứ ba là chỗ dễ va
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
  // Chỉ những biến client app này thêm vào; hai biến base đã có sẵn.
  client: {
    NEXT_PUBLIC_ANALYTICS_ID: z.string().min(1),
  },
  clientRuntimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
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

## Flavor `react-router`

```ts
// apps/<app>/src/env.ts
import * as z from "zod";

import { createEnv } from "@monorepo/env/react-router/create-env";

export const env = createEnv({
  // Không tiền tố: chỉ đọc được từ code chạy trên server (loader, action,
  // entry.server). Đọc từ client sẽ throw.
  server: {
    SESSION_SECRET: z.string().min(1),
  },
  // Chỉ những biến client app này thêm vào; ba biến base đã có sẵn.
  client: {
    PUBLIC_ANALYTICS_ID: z.string().min(1),
  },
  runtimeEnv: {
    PUBLIC_APP_ENV: import.meta.env.PUBLIC_APP_ENV,
    PUBLIC_BASE_DOMAIN: import.meta.env.PUBLIC_BASE_DOMAIN,
    PUBLIC_BASE_DOMAIN_API: import.meta.env.PUBLIC_BASE_DOMAIN_API,
    PUBLIC_ANALYTICS_ID: import.meta.env.PUBLIC_ANALYTICS_ID,
    // `import.meta.env.SSR` là `false` trong bundle client, nên nhánh đọc
    // `process` bị loại hẳn thay vì throw ở đó.
    SESSION_SECRET: import.meta.env.SSR
      ? process.env.SESSION_SECRET
      : undefined,
  },
});
```

Framework mode build **code server và code client trong cùng một bản build
Vite**. Đó là lý do Runtime này cần Flavor riêng chứ không dùng lại `vite`:
Flavor `vite` chỉ biết một schema `PUBLIC_` duy nhất, không có chỗ nào đặt
secret.

Ba ràng buộc, cả ba đều là lý do API có hình dạng như trên:

1. **`runtimeEnv` là map đầy đủ, và phải viết trong `env.ts` của app.** env-core
   đọc **chỉ** object này — nó không tự lấy từng key server ra khỏi
   `process.env` như `experimental__runtimeEnv` của Flavor `next`. Nên map phải
   liệt kê cả nửa client lẫn nửa server, dưới dạng literal
   `import.meta.env.PUBLIC_*` cho client: Vite chỉ thay thế tĩnh những literal
   `import.meta.env` trong code **do nó compile**, nếu package này tự đọc hộ
   thì giá trị sẽ là `undefined` trong browser.

   Và vì `env.ts` này chạy trong **cả hai** graph, phần đọc server phải viết
   sao cho an toàn ở client. Vite thay `import.meta.env` nhưng để nguyên
   `process.env.SESSION_SECRET`, đồng thời không define `process` trong bundle
   browser — nên một read trần sẽ throw `ReferenceError: process is not
   defined` ngay lúc module load, trước khi validation kịp chạy và với một lỗi
   không nói gì về env. Bọc mỗi read server bằng `import.meta.env.SSR` (Vite
   thay thành `false` ở client nên nhánh đó bị loại hẳn) hoặc bằng
   `typeof process === "undefined"`; app nào muốn giữ dạng trần thì phải tự khai
   `define` cho `process.env` trong Vite config của nó.
2. **Base schema tự khai, không import từ `vite/schema`.** Cùng tiền tố
   `PUBLIC_` không có nghĩa là dùng chung được: một Flavor không import Flavor
   khác, và `vite` là `z.object` còn đây là dictionary. Đổi lại, test drift ở
   `test/react-router/` bắt buộc hai bộ key phải khớp.
3. **Đọc biến `server` từ client thì throw.** Object trả về là một Proxy: khi
   module chạy phía client (`typeof window !== "undefined"`), env-core bỏ hẳn
   dictionary `server`, và mọi lần đọc một key trong đó ném lỗi có nêu tên biến
   — thay vì trả `undefined` âm thầm. Vì phân biệt server/client dựa trên tiền
   tố, một key `PUBLIC_*` khai nhầm vào `server` **vẫn** đọc được ở client; thứ
   gì browser được thấy thì khai ở `client`.

`emptyStringAsUndefined` bật, giống Flavor `next`: một dòng trống trong `.env`
là biến **thiếu**, không phải biến hợp lệ.

## Phần dùng chung (ngoài mọi Flavor)

`@monorepo/env/http-url` xuất `httpUrlSchema` — `z.url({ protocol: /^https?$/ })`.
Chặt hơn `z.url()` (vốn nhận cả `"localhost:8000"`, đọc `localhost:` như một
scheme) và lỏng hơn `z.httpUrl()` (vốn đòi domain public nên loại
`http://localhost:3000`).

## Test

Vitest 5, `environment: "node"`. Hai Flavor nền t3-env test được **không cần
Next hay Vite**: t3-env chỉ cần một object giá trị, và nó *throw* chứ không
`process.exit`. Mọi test nêu `isServer` rõ ràng — nếu không, t3-env tự đoán
server/client bằng `typeof window`, và cách đoán đó sai theo cả hai hướng: dưới
test environment có DOM nó **âm thầm bỏ qua** phần `server`, còn dưới `node`
(runner của package này) nó không bao giờ chạm tới nửa client. Nên các case phía
client truyền `isServer: false`.

```bash
bun run --filter @monorepo/env test
```
