# `@monorepo/documents`

Site tài liệu cho hai gói **được publish lên npm** từ workspace này:
`@fe-monorepo/ui` (63 primitive Base UI) và `@fe-monorepo/hook` (5 React hook).
Đối tượng đọc là **consumer cài từ npm**, không phải người làm việc trong repo —
nên mọi snippet trên site viết tên npm (`@fe-monorepo/ui/components/button`), còn
bản thân app vẫn import tên workspace (`@monorepo/ui/components/button`). Hai tên
này cố ý khác nhau; đừng "đồng bộ" chúng.

App chạy Runtime **Vite client SPA** (clone từ `apps/_template_vite`): SPA thuần,
không SSR, không gọi HTTP, nginx phục vụ một bundle tĩnh.

```bash
bun run --filter @monorepo/documents dev       # http://localhost:3003
```

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Port | `ports.env` | Dev **3003**, E2E **3103** — khai đúng một chỗ; `vite.config.ts` đọc cả hai qua `ports.ts` (`server.port` / `preview.port`, `strictPort` cả hai), `playwright.config.ts` đọc `E2E_PORT`. |
| Env | `src/env.ts` | Flavor `vite` của `@monorepo/env`; `.env` **ở root repo**, tới qua `envDir: "../../"` + `envPrefix: "PUBLIC_"` (**không** `VITE_`). |
| Router | `src/pages/main.tsx` | `react-router` 8 declarative; mọi path lấy từ `~/constants/routes.ts`. |
| Guard | *(không có)* | Site public: `ProtectedRoute` / `GuestRoute`, slice `auth`, `use-auth-store` và cả `~/libs/http-client` của Template đã bị **xoá** thay vì để không dùng. Catch-all 404 giữ nguyên. |
| Metadata | `scripts/generate-docs-metadata.ts` | Xem mục dưới — đây là thứ thay `src/constants/*.json` viết tay của bản cũ. |
| Demo | Storybook | Site này **không** render preview. 63 file preview thủ công của bản cũ bị bỏ; mỗi trang primitive link sang trang docs của nó trên Storybook. |
| Deploy | `vercel.json` · `Dockerfile` · `nginx.conf` | Vercel rewrite `/(.*)` → `/index.html` cho SPA; image thì builder Bun → `nginx:stable-alpine` như Template. |

## Env

`.env` ở root repo (copy từ `.env.example`). App này thêm đúng một key ngoài
nhóm base:

| Key | Bắt buộc | Dùng ở |
| --- | --- | --- |
| `PUBLIC_DOCUMENTS_STORYBOOK_URL` | có | `~/components/link/storybook-link.tsx` — dựng link `<url>/?path=/docs/<docsId>--docs` trên mỗi trang primitive |

Key mang **tên app** theo quy ước của ticket 03. Nó cố ý **không** `.optional()`:
thiếu giá trị thì build image đỏ ngay và gọi đúng tên biến, thay vì ship 63 trang
có nút demo dẫn đi đâu không rõ. Schema nằm ngay trong `src/env.ts` cùng chỗ gọi
`createEnv`, nên Dockerfile (import chính module đó để validate) và app đọc cùng
một schema — không có gì để lệch nhau. `test/env.test.ts` đối chiếu `.env.example`
đã commit với chính schema này.

## Nạp metadata

> Mục này thay §"How metadata is loaded" của tài liệu `DOCUMENTS.md` bản cũ.
> Bản đó nạp `src/constants/components.json` + `hooks.json` **viết tay**, cộng
> `registry.tsx` trỏ tới 63 preview thủ công — thêm một primitive là ba chỗ phải
> sửa tay, và không có gì báo khi quên. Bản này sinh metadata từ chính source.

**Sinh cái gì, từ đâu**

| Nguồn | Ra | Mỗi entry mang |
| --- | --- | --- |
| `packages/ui/src/components/*.tsx` | `src/generated/components.json` | `slug` (tên file bỏ đuôi) · `subpath` (`components/<slug>`) · `importPath` (`@fe-monorepo/ui/...`) · `exports` · `description` · `storybookDocsId` |
| `packages/hook/src/*.ts` | `src/generated/hooks.json` | như trên, trừ `storybookDocsId`; `subpath` là tên file trần (gói hook không có prefix) |

**Chạy lúc nào** — năm hook `pre*` trong `package.json`, không phải một bước tay:
`predev`, `prebuild`, `pretypecheck`, `pretest`, `pretest:coverage`. Treo ở cả
`typecheck` lẫn `test` chứ không chỉ `dev`/`build`, vì hai task đó của Turbo
**không** phụ thuộc `build` của app này — trên checkout sạch chúng sẽ chạy trước
khi JSON tồn tại và fail ngay ở bước resolve import. Gọi tay được: `bun run --filter @monorepo/documents generate:docs-metadata`.

**Chạy ra sao**

- `scripts/docs-metadata.ts` là **nửa thuần**: parse + dựng object, không ghi
  file, không `process.exit`, không dùng `Bun.*` — nên Vitest (chạy trên Node)
  import trực tiếp được. `scripts/generate-docs-metadata.ts` là entry, và là chỗ
  duy nhất ghi file.
- Danh sách export lấy bằng **`oxc-parser`** (`parseSync` → `module.staticExports`),
  không phải regex: một danh sách `export { ... }` xuống dòng, hay một
  `export type`, là chỗ regex sai ngay lần đầu. `export type` và `default` bị
  loại — bảng export là những thứ consumer gọi được.
- `description` là block JSDoc **ngay trên** declaration được export đầu tiên;
  JSDoc của một import ở trên nữa không tính.
- `storybookDocsId` suy ra từ slug (`alert-dialog` → `storybook-alertdialog`), cộng
  một bảng override nhỏ cho trường hợp story đặt tên theo component chứ không theo
  file (`direction` → `storybook-directionprovider`). Script không tra được title
  thật: `turbo prune --docker` bỏ `apps/storybook` khỏi build context. Chỗ đối
  chiếu id với story thật là `test/generated/catalogue-invariants.test.ts`, chạy
  trên checkout có đủ hai thư mục.

**Ở đâu, và vì sao gitignore** — `src/generated/` là dữ liệu dẫn xuất và **không**
commit (`.gitignore` của app). Commit nó là mở đường cho nó lệch khỏi
`packages/ui` ngay lần đầu ai đó chạy `ui-add` mà quên sinh lại. Đổi lại, `ui-add`
thêm một primitive là lần build kế tiếp site đã có trang cho nó — sidebar, danh
sách, trang chi tiết, không sửa file nào.

**Turbo cache** — `turbo.json` của app khai `inputs` cho `build`/`typecheck`/`test`
gồm `$TURBO_DEFAULT$` cộng hai thư mục nguồn (`$TURBO_ROOT$/packages/ui/src/components/**`,
`$TURBO_ROOT$/packages/hook/src/**`), nên sửa một primitive **ngoài** app này vẫn
làm cache của app miss đúng lúc cần.

## Bảng route

> Mục này thay §"Routing" của tài liệu `DOCUMENTS.md` bản cũ. Path lấy từ
> `~/constants/routes.ts`; hai path động có builder riêng, không ai nội suy tay.

| Path | Hằng số | Page | Trang gì |
| --- | --- | --- | --- |
| `/` | `ROUTES.HOME` | `home-page.tsx` | Bắt đầu — cài đặt, peer dependency, nối CSS + `@source`, ví dụ Button, "không có root entry" |
| `/components` | `ROUTES.COMPONENTS` | `components-page.tsx` | Danh sách 63 primitive, có ô lọc (debounce 300ms) |
| `/components/:slug` | `ROUTES.COMPONENT_BY_SLUG` · `ROUTES.componentBySlugPath(slug)` | `component-detail-page.tsx` | Import, bảng export, link Storybook |
| `/hooks` | `ROUTES.HOOKS` | `hooks-page.tsx` | Danh sách 5 hook |
| `/hooks/:slug` | `ROUTES.HOOK_BY_SLUG` · `ROUTES.hookBySlugPath(slug)` | `hook-detail-page.tsx` | Import, bảng export, mô tả |
| `*` | — | `not-found-page.tsx` | 404, **trong** shell để còn đường quay lại |

Slug lạ ở hai route động **không** redirect: trang tự render 404 tại chính URL đó
và gọi tên slug bị hụt. Vercel cần rewrite `/(.*)` → `/index.html` (đã có trong
`vercel.json`), nếu không refresh giữa `/components/button` sẽ 404 ở tầng hosting
chứ không tới được router.

## Chạy kiểm

```bash
bun run --filter @monorepo/documents typecheck   # tsc --noEmit (pretypecheck sinh metadata)
bun run --filter @monorepo/documents test        # Vitest 5 + RTL (jsdom)
bunx playwright test --project=chromium          # từ trong thư mục app

# Docker chạy TỪ ROOT repo — context phải là root (Dockerfile mở bằng
# `COPY . .` + `bunx turbo prune`, và còn `COPY apps/documents/nginx.conf`).
docker build -f apps/documents/Dockerfile -t documents .
```

`test/` soi gương `src/` (cộng `test/scripts/` cho nửa thuần của generator).
Những gì được kiểm, và vì sao chỉ chừng đó:

| File | Kiểm |
| --- | --- |
| `test/scripts/docs-metadata.test.ts` | Parser, trên hai fixture giả ghi ra thư mục tạm (một `.tsx`, một `.ts`): danh sách export xuống dòng, `export type` bị loại, JSDoc đúng block, file hỏng thì **ném** và gọi tên file |
| `test/generated/catalogue-invariants.test.ts` | Bất biến: mọi file trong hai thư mục nguồn đều có entry; specifier luôn `@fe-monorepo/*`; mọi primitive có ít nhất một export; `storybookDocsId` trỏ đúng story thật |
| `test/features/*/templates/*-detail.template.test.tsx` | Đúng một nhánh mỗi trang: slug có trong catalogue → bảng export; slug lạ → 404 tại chỗ |
| `test/utils/*.test.ts` | Logic thuần: xếp hạng bộ lọc, và **đúng từng ký tự** dòng import mà người đọc copy |
| `test/env.test.ts` | `.env.example` đã commit vẫn thoả schema của chính app này |

Không có test cho markup thuần hay cho primitive của `@monorepo/ui` — cái sau là
suite của shadcn/Base UI, không phải của site này (xem
`.agents/rules/testing-coverage.md`).

E2E dựng bản production thật rồi `vite preview` trên port 3103, nên `dev` và `e2e`
lên cùng lúc được, và thứ được kiểm đúng là cấu hình `PUBLIC_*` đã bake lúc build.
`e2e/documents.e2e.ts` đi đúng đường người đọc đi: mở `/`, bấm link sang một trang
primitive, thấy bảng export; lọc danh sách rồi mở một card; slug lạ ra 404; và
boot không có console error. Trên Windows gọi `bunx playwright test` với cwd là
thư mục app — chạy qua `bun run` script có thể treo lúc launch Chromium.
