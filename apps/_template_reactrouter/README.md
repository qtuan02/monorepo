# `@monorepo/_template_reactrouter`

Template app cho Runtime **React Router 8 framework mode**. Clone app này khi cần
SSR/SEO mà vẫn muốn ở trong hệ sinh thái Vite — cùng bundler, cùng React
Compiler, cùng cây `src/` và cùng alias `~/*` với `apps/_template_vite`. Cần một
SPA sau login thì clone `apps/_template_vite`; cần App Router và hệ sinh thái
Next thì clone `apps/_template_next`.

```bash
bun run dev:template-reactrouter    # http://localhost:3005
```

> **Trạng thái: đang dựng dần.** Khung tối thiểu (tracer bullet), **i18n + app
> shell** và **Dockerfile** đã đi qua Gate — config, `root.tsx` với
> `middleware`/`loader`, `routes.ts`, slice `layout` (header · body · footer),
> route home dịch qua catalogue chung, typegen, `react-router-serve`, Vitest,
> Playwright, image năm stage (builder Bun → runner Node). Những mảnh còn lại của
> spec (#78) — auth bằng cookie session + middleware guard, `~/libs/http-client` +
> TanStack Query, `/about` prerender, catch-all 404 — tới ở các ticket sau. Mọi
> chỗ tạm đều có comment nói rõ ticket nào thay nó.

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
| Ngôn ngữ nằm ở cookie, **không** ở URL | `src/constants/cookies.ts` · `src/root.tsx` | Cookie `template_reactrouter_lang` rồi tới `Accept-Language`, cố ý khác `_template_next` (segment `[locale]`). Cookie + header không cần rewrite path, nên mọi route ở đây giữ nguyên hình dạng của nó; một Template mà route nào cũng có prefix sẽ ép prefix đó lên mọi clone. Đổi lại, hai app này không dùng chung được spec E2E về locale — đúng là chuyện phải chấp nhận. |
| Quyết định ngôn ngữ đúng **một** lần | `middleware` của `src/root.tsx` | `resolveLanguage(request, COOKIE)` chạy trong root middleware và ghi vào `RouterContext`. Cùng một object đó đi tiếp vào `loader` (cho `meta`) và vào tham số thứ **năm** của `entry.server` — nên `meta`, payload hydrate và cây React không thể nói ba thứ khác nhau. |
| i18next **clone** cho mỗi request | `src/entry.server.tsx` | Một tiến trình Node render mọi khách cùng lúc, nên đổi ngôn ngữ của singleton là một race không khoá: triệu chứng là trang render đúng — bằng ngôn ngữ của người khác. `createRequestI18n` clone (dùng chung resource store + formatter ICU), và `test/entry.server.test.ts` đọc file này dạng **text** để chặn việc gọi đổi ngôn ngữ lọt vào đây. |
| Đổi ngôn ngữ **trước** `hydrateRoot` | `src/entry.client.tsx` | Client đọc lại `document.documentElement.lang` — thứ server đã render — rồi `changeLanguage` và **đợi** nó xong mới hydrate. Hydrate trước rồi đổi sau chính là cú nháy markup mà ticket này tồn tại để tránh. Lần gọi đó cũng ghi luôn cookie (`caches: ["cookie"]`), nên lần render server kế tiếp khớp sẵn. |
| `<html lang>` đọc từ instance i18next | `Layout` trong `src/root.tsx` | Không đọc `loaderData`: `Layout` bọc cả `ErrorBoundary` (đường đó không có loader nào chạy), và đổi ngôn ngữ trong header không re-run loader — đọc loader thì thuộc tính này sẽ đứng yên. Đọc từ instance đang render thì luôn đúng, và đúng bằng giá trị `entry.client` đọc ngược lại. |
| Shell là một route `layout()` | `src/routes.ts` · `src/routes/layout.tsx` | `layout()` không thêm segment: chrome mount một lần bao quanh các route thay vì mỗi route tự vẽ lại. Màn hình cần **không** có chrome (sign-in ở #84) nằm ngoài wrapper này, y như `_template_next` đặt `sign-in/` ngoài group `(shell)`. |

## Env — một module, hai graph

`src/env.ts` được Vite biên dịch vào **cả** bundle server lẫn bundle browser. Ba
điều dưới đây đã được kiểm bằng tay trên `@react-router/dev@8.3.1` + `vite@8.2.2`
(kết quả đầy đủ nằm ở comment của issue #81):

- **`PUBLIC_*` được inline vào cả hai bundle.** `build/server/index.js` chứa
  `PUBLIC_APP_ENV: "local"` như một chuỗi literal, không phải một lần đọc lúc
  chạy — nên đổi `.env` xong phải build lại, đúng như Runtime Vite.
- **Giá trị của key `server` không bao giờ tới client** — nhưng khai báo thì có,
  và phân biệt hai thứ đó là cả vấn đề. Lúc tracer bullet, `env.ts` thậm chí
  không vào `build/client`: consumer duy nhất của nó là `loader` của route home,
  mà build cắt `loader` khỏi client graph, nên cả module bị tree-shake. Từ khi
  `footer-build-info.tsx` đọc `PUBLIC_APP_ENV` thì không còn vậy nữa — và đó
  chính là ca đáng hiểu: khai báo schema (**tên key + validator**) nằm trong
  bundle browser, vì
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
  chạy bằng Bun/Node trần — mà đó chính là cách `prebuild` và bước validate
  của Dockerfile chạy. Với `import.meta.env.SSR`, lần chạy đó sẽ luôn báo "thiếu key".

`react-router build` **không** evaluate `src/env.ts` — khác `next build`. Nên
script `prebuild` chạy đúng một lệnh: `bun -e "import './src/env.ts';"`, dưới
cùng file `.env` mà build dùng. Thiếu `TEMPLATE_REACTROUTER_SESSION_SECRET` là
build đỏ, nêu tên key, và không có `build/` nào được sinh ra.

## i18n — một chuỗi bốn bước cho mỗi request

Khách nhận **HTML đầu tiên đúng ngôn ngữ của mình**, chứ không phải nhận tiếng
Việt rồi bị JavaScript sửa lại sau paint. Bốn file dưới đây là toàn bộ cơ chế,
mỗi file một việc:

1. **`src/root.tsx` — `middleware` quyết định.** `resolveLanguage(request,
   LANGUAGE_COOKIE_NAME)` từ `@monorepo/i18n`: cookie → `Accept-Language` →
   ngôn ngữ mặc định của registry. Kết quả ghi vào `languageContext`
   (`~/libs/language-context`). Đây là chỗ **duy nhất** ngôn ngữ được quyết định.
2. **`src/entry.server.tsx` — clone i18next cho request đó.** Tham số thứ năm của
   `handleRequest` chính là `RouterContextProvider` mà middleware vừa ghi vào:
   `@react-router/serve` không nhận `getLoadContext` nào cả, nhưng server runtime
   tự tạo một cái cho mỗi request và luồn đúng object đó qua middleware, qua
   loader, rồi vào đây. `createRequestI18n(language)` trả một clone (dùng chung
   resource store + formatter ICU), và cây được bọc trong `<I18nextProvider>`
   với clone đó — **không bao giờ** với singleton.
3. **`root.tsx` — `loader` và `<html lang>`.** `loader` trả `{ language }` để
   `meta` (chạy ngoài cây React, không với tới provider được) đọc qua
   `matches[0].loaderData` và dịch bằng `i18n.getFixedT(language)`. `<html lang>`
   thì đọc từ chính instance đang render — xem bảng quyết định ở trên.
4. **`src/entry.client.tsx` — đổi ngôn ngữ trước khi hydrate.** Đọc lại
   `document.documentElement.lang`, `await changeLanguage(...)`, rồi mới
   `hydrateRoot`. Không có bước này, detector phía trình duyệt
   (`document.cookie` → `navigator.language`) có thể lệch với thứ server đã đàm
   phán, và mỗi lần lệch là một hydration mismatch.

Chuỗi ngôn ngữ vào catalogue chung `packages/i18n/src/locales/*.json`, namespace
`templateReactRouter.*`, cú pháp **ICU** (`{appEnv}`, không phải `{{appEnv}}`) và
**không có thẻ rich-text** — `catalogue-invariants.test.ts` chặn cả hai. Chuỗi
dùng chung của shell (`common.brand`, `footer.*`, `language.*`,
`internalServerError.*`) không nhân bản vào namespace mới.

Đổi ngôn ngữ là **state change chứ không phải navigation**:
`~/components/select/select-language.tsx` gọi `changeLanguage`, cây render lại
tại chỗ, và detector cache lựa chọn vào cookie để lần render server sau khớp.
Đây là chỗ Runtime này cố ý khác `_template_next` — bên đó switcher điều hướng
sang prefix locale khác.

## Chạy kiểm

```bash
bun run --filter @monorepo/_template_reactrouter typecheck   # react-router typegen && tsc --noEmit
bun run --filter @monorepo/_template_reactrouter test        # Vitest 5 + RTL (jsdom)
bunx playwright test --project=chromium                      # từ trong thư mục app

# Docker chạy TỪ ROOT repo — context phải là root (Dockerfile mở bằng
# `COPY . .` + `bunx turbo prune`), thư mục app làm context sẽ đỏ ở bước prune.
docker build -f apps/_template_reactrouter/Dockerfile -t template-reactrouter .
docker run --rm -p 3000:3000 template-reactrouter   # PORT bên trong container là 3000
```

Runner copy thêm `.env` (bản `.env.<BUILD_ENV>` mà builder đã dùng) vào cạnh
`build/`: `PUBLIC_*` đã inline vào cả hai bundle lúc build, nhưng key **server**
không tiền tố thì compile thành một lần đọc `process.env` sống trong
`build/server/index.js` mà `createEnv` evaluate lúc load module. `react-router-serve`
không tự nạp dotenv, nên CMD nạp file đó bằng `node --env-file-if-exists` — và
Node không ghi đè biến đã set, nên `docker run -e TEMPLATE_REACTROUTER_SESSION_SECRET=…`
vẫn thắng file đã bake.

E2E dựng bản production thật rồi chạy chính script `start` của app trên E2E port
3105, nên thứ được kiểm là output đã build cùng cấu hình `PUBLIC_*` đã bake vào
nó. Spec đọc tài liệu **thô** qua fixture `request` — không trình duyệt, không
hydrate — nên bất cứ thứ gì assert được ở đó đều chứng minh là server đã gửi đi,
chứ không phải JavaScript vẽ thêm sau paint. Fixture `request` không kế thừa
`locale` của project **và cũng không kế thừa cookie jar nào**, nên mỗi spec tự
gửi `Accept-Language` (và `cookie`, cho ca "lựa chọn đã lưu thắng header") của
riêng nó.

Ba spec, ba lớp khác nhau: `server-rendering.e2e.ts` (tài liệu thô đi đủ),
`i18n-negotiation.e2e.ts` (đàm phán ngôn ngữ trên tài liệu thô, gồm một ca hai
request chồng nhau — bằng chứng hành vi rằng singleton i18next không bị đổi) và
`shell.e2e.ts` (nửa trình duyệt: đổi ngôn ngữ tại chỗ, reload vẫn giữ, console
không có lỗi hydration).
