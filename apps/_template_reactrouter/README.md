# `@monorepo/_template_reactrouter`

Template app cho Runtime **React Router 8 framework mode**. Clone app này khi cần
SSR/SEO mà vẫn muốn ở trong hệ sinh thái Vite — cùng bundler, cùng React
Compiler, cùng cây `src/` và cùng alias `~/*` với `apps/_template_vite`. Cần một
SPA sau login thì clone `apps/_template_vite`; cần App Router và hệ sinh thái
Next thì clone `apps/_template_next`.

```bash
bun run dev:template-reactrouter    # http://localhost:3005
```

> **Trạng thái: tracer bullet.** Khung tối thiểu đã đi qua Gate — config, `root.tsx`,
> `routes.ts`, một route home có `loader`, typegen, `react-router-serve`, Vitest,
> Playwright. Những mảnh còn lại của spec (#78) — i18n, auth bằng cookie session +
> middleware guard, `~/libs/http-client` + TanStack Query, `/about` prerender,
> catch-all 404, Dockerfile — tới ở các ticket sau. Mọi chỗ tạm đều có comment nói
> rõ ticket nào thay nó.

## Những quyết định đã cắm sẵn

| Thứ | Ở đâu | Vì sao |
| --- | --- | --- |
| Port | `ports.env` | Dev 3005 và E2E 3105 khai đúng **một** chỗ. Runtime này đọc file từ cả hai phía: `react-router dev` là một Vite dev server nên lấy `server.port` từ `vite.config.ts` (qua `ports.ts`), còn `react-router-serve` không có config file nào cả — kênh duy nhất vào nó là `PORT`, nên script `start` đưa file này cho dotenv-cli đúng như Template Next. |
| `strictPort` | `vite.config.ts` | Mặc định Vite trôi sang port trống kế tiếp. Tách 3005/3105 lại càng quan trọng ở đây: `react-router-serve` với `PORT` rỗng **tự chọn** một cổng rảnh thay vì báo lỗi, nên một server lạc chỗ trả lời E2E là chuyện thật chứ không phải giả định. |
| `appDirectory: "src"` | `react-router.config.ts` | Mặc định của React Router là `"app"`. Một chữ này là thứ giữ `~/*`, cây `test/` soi gương `src/`, override `apps/**` của Biome và bước validate env trong Dockerfile đọc như nhau ở cả ba Runtime. |
| Route table là config | `src/routes.ts` | Không dùng `@react-router/fs-routes`. File này **là** bảng path — thứ mà Runtime Vite giữ ở `~/constants/routes.ts` và Runtime Next giữ bằng cây thư mục `src/app/`. Typegen biến nó thành `href()` có type, nên đổi tên route là lỗi biên dịch chứ không phải 404. |
| React Compiler | `vite.config.ts` | `@rolldown/plugin-babel` + `reactCompilerPreset()` chạy như một pass Babel riêng **bên cạnh** `reactRouter()`. Cố ý **không** dùng `@vitejs/plugin-react` cùng lúc: plugin framework đã tự lo React Refresh, chạy thêm sẽ transform mỗi file hai lần. |
| Hoán plugin khi test | `vite.config.ts` | `process.env.VITEST` là chỗ rẽ duy nhất trong file đó. `reactRouter()` render route module thành một tài liệu HTML hoàn chỉnh và ném `can't detect preamble` khi không có — mà đó đúng là thứ `createRoutesStub` đưa cho nó. |
| Env | `src/env.ts` | Flavor `react-router` của `@monorepo/env` (`@t3-oss/env-core`), **không** phải Flavor `vite`: Runtime này dựng cả code server lẫn code client từ một bản build, nên nó cần block `server` mà Flavor `vite` không có chỗ để đặt. Một module, hai graph — xem mục dưới. |
| typegen trước `tsc` | `package.json` · `tsconfig.json` | `typecheck` là **hai** lệnh và thứ tự là bắt buộc: `react-router typegen` ghi `.react-router/types/**/+types/*`, `rootDirs` gộp cây đó vào cây nguồn, và không có nó thì mọi `import type { Route } from "./+types/…"` đều đỏ trên một clone sạch. |
| Runner | `react-router-serve` | `react-router build` ra `build/client` (asset tĩnh) + `build/server/index.js` (bundle server). Không có `dist/` như Runtime Vite, không có `standalone` như Runtime Next. |

## Env — một module, hai graph

`src/env.ts` được Vite biên dịch vào **cả** bundle server lẫn bundle browser. Ba
điều dưới đây đã được kiểm bằng tay trên `@react-router/dev@8.3.1` + `vite@8.2.2`
(kết quả đầy đủ nằm ở comment của issue #81):

- **`PUBLIC_*` được inline vào cả hai bundle.** `build/server/index.js` chứa
  `PUBLIC_APP_ENV: "local"` như một chuỗi literal, không phải một lần đọc lúc
  chạy — nên đổi `.env` xong phải build lại, đúng như Runtime Vite.
- **Giá trị của key `server` không bao giờ tới client** — nhưng khai báo thì có,
  và phân biệt hai thứ đó là cả vấn đề. Hôm nay `env.ts` thậm chí không vào
  `build/client`: consumer duy nhất của nó là `loader` của route home, mà build
  cắt `loader` khỏi client graph, nên cả module bị tree-shake. Ngay khi có code
  client đọc `env` — `~/libs/http-client.ts` ở ticket sau là ca đầu tiên — thì
  khai báo schema (**tên key + validator**) nằm trong bundle browser, vì
  `createEnv` được gọi với cùng một options object ở cả hai graph. Thứ **không**
  nằm ở đó là **giá trị**: Vite chỉ thay `import.meta.env`, còn
  `process.env.X` thì viết lại thành một object rỗng, nên đọc ra `undefined`.
  Và thứ bảo vệ là `onInvalidAccess` của env-core: đọc key `server` từ client
  thì **throw nêu đúng tên key**, chứ không im lặng trả `undefined`. Cả hai vế
  đều đã kiểm bằng tay — vế bundle bằng một lần đọc `env` tạm từ template, vế
  throw bằng `packages/env/test/react-router` (`isServer: false`) và bằng
  `test/env.test.ts` khi nó còn chạy trên jsdom.
- **Guard là `typeof process`, không phải `import.meta.env.SSR`.** Cả hai đều an
  toàn trong bundle browser, nhưng chỉ `typeof process` còn đúng khi module được
  chạy bằng Bun/Node trần — mà đó chính là cách `prebuild` (và Dockerfile sau
  này) validate. Với `import.meta.env.SSR`, lần chạy đó sẽ luôn báo "thiếu key".

`react-router build` **không** evaluate `src/env.ts` — khác `next build`. Nên
script `prebuild` chạy đúng một lệnh: `bun -e "import './src/env.ts';"`, dưới
cùng file `.env` mà build dùng. Thiếu `TEMPLATE_REACTROUTER_SESSION_SECRET` là
build đỏ, nêu tên key, và không có `build/` nào được sinh ra.

## Chạy kiểm

```bash
bun run --filter @monorepo/_template_reactrouter typecheck   # react-router typegen && tsc --noEmit
bun run --filter @monorepo/_template_reactrouter test        # Vitest 5 + RTL (jsdom)
bunx playwright test --project=chromium                      # từ trong thư mục app
```

E2E dựng bản production thật rồi chạy chính script `start` của app trên E2E port
3105, nên thứ được kiểm là output đã build cùng cấu hình `PUBLIC_*` đã bake vào
nó. Spec đọc tài liệu **thô** qua fixture `request` — không trình duyệt, không
hydrate — nên bất cứ thứ gì assert được ở đó đều chứng minh là server đã gửi đi,
chứ không phải JavaScript vẽ thêm sau paint. Fixture `request` không kế thừa
`locale` của project, nên spec tự gửi `Accept-Language`.
