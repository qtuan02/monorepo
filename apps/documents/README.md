# `@monorepo/documents`

Site tài liệu cho hai gói **được publish lên npm** từ workspace này:
`@fe-monorepo/ui` (63 primitive Base UI) và `@fe-monorepo/hook` (5 React hook).
Đối tượng đọc là **consumer cài từ npm**, không phải người làm việc trong repo —
nên mọi snippet trên site viết tên npm (`@fe-monorepo/ui/components/button`), còn
bản thân app vẫn import tên workspace (`@monorepo/ui/components/button`). Hai tên
này cố ý khác nhau; đừng "đồng bộ" chúng.

App chạy Runtime **Vite client SPA** (clone từ `apps/_template_vite`): SPA thuần,
không SSR, không gọi HTTP, nginx phục vụ một bundle tĩnh. Hình dạng là hướng D
**"Prism"** (spec #128, 2026-09-16): không sidebar, panel kính trên backdrop aurora,
palette indigo riêng — xem mục Hình dạng bên dưới.

```bash
bun run --filter @monorepo/documents dev       # http://localhost:3003
```

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Port | `ports.env` | Dev **3003**, E2E **3103** — khai đúng một chỗ; `vite.config.ts` đọc cả hai qua `ports.ts` (`server.port` / `preview.port`, `strictPort` cả hai), `playwright.config.ts` đọc `E2E_PORT`. |
| Env | `src/env.ts` | Flavor `vite` của `@monorepo/env`; `.env` **ở root repo**, tới qua `envDir: "../../"` + `envPrefix: "PUBLIC_"` (**không** `VITE_`). |
| Shell | `src/features/layout/` | **Không có sidebar.** `nav-pill.template.tsx` (nav pill kính dính đầu trang) · `components/nav/search-palette.tsx` (`⌘K` / `Ctrl K`) · `components/backdrop.tsx`. `ThemeProvider` ở `~/libs/theme-provider.tsx` (cross-cutting, không phải nội bộ slice — `DetailExample` cũng đọc nó). Thứ tự DOM: skip link → nav pill → backdrop → `<main id>` → footer một dòng. |
| Panel · tile · swatch | `src/components/{panel,tile,swatch,detail,page,catalogue,code,search,link}/` | `GlassPanel` (utility `glass`), `Tile` (nền đục, **không** blur, tự render `<li>`), `Swatch` (hue từ `~/utils/slug-to-hue.ts`), `DetailToolbar` / `DetailHero` / `DetailExample` (iframe story) / `DetailPanels` / `PanelHeading`, `ListHeader`, `DocsSection`, `CatalogueList` (đầu trang + lọc + lưới, tile qua render prop — hai list template chỉ còn là vỏ), `CodeBlock` / `ImportSnippet`, `FilterInput` / `FilterEmpty`, `StorybookLink`. |
| Palette · font · theme | `src/globals.css` | Override **toàn bộ** palette dùng chung ở tầng app (ADR-0009), hai webfont qua `@fontsource-variable`, dark mode "indigo night" — xem mục Font & palette. |
| Router | `src/pages/main.tsx` | `react-router` 8 declarative; mọi path lấy từ `~/constants/routes.ts`. |
| Guard | *(không có)* | Site public: `ProtectedRoute` / `GuestRoute`, slice `auth`, `use-auth-store` và cả `~/libs/http-client` của Template đã bị **xoá** thay vì để không dùng. Catch-all 404 giữ nguyên. |
| Metadata | `scripts/generate-docs-metadata.ts` | Xem mục dưới — đây là thứ thay `src/constants/*.json` viết tay của bản cũ. |
| Demo | Storybook | Site này **không viết** preview nào: 63 file preview thủ công của bản cũ bị bỏ. Mỗi trang primitive nhúng story `Default` của nó từ Storybook đã deploy (`iframe.html?id=<storyId>&viewMode=story`) làm ví dụ, và link sang trang docs của nó cho variant + bảng props. iframe theo theme người đọc (`&globals=theme:dark` khi tối, không nối gì khi sáng) và không còn viền/nền riêng — stage panel của Storybook là khung duy nhất, `GlassPanel` bọc ngoài. |
| Deploy | `vercel.json` · `Dockerfile` · `nginx.conf` | Vercel rewrite `/(.*)` → `/index.html` cho SPA; image thì builder Bun → `nginx:stable-alpine` như Template. |

## Hình dạng

Ba trang, ba frame của mockup ([`docs/design/documents-redesign/mockup-v3-prism.html`](../../docs/design/documents-redesign/mockup-v3-prism.html));
từ vựng ở [`CONTEXT.md`](./CONTEXT.md), quyết định ở
[`docs/design/documents-redesign.md`](../../docs/design/documents-redesign.md) §10 và
[ADR-0009](../../docs/adr/0009-documents-prism-palette-override.md).

- **Điều hướng, không sidebar.** Một **nav pill** kính dính cách đỉnh 1rem: brand,
  ba mục (Bắt đầu / Component / Hook), ô mở palette, bốn nút tròn (ngôn ngữ, theme,
  npm, Storybook). Dưới `md` pill co còn brand + tìm + menu mở `Sheet`. Vào 68
  trang còn lại bằng **palette `⌘K` / `Ctrl K`** (`CommandDialog` nhóm Component /
  Hook, đọc thẳng hai Catalogue, mỗi dòng swatch + slug + subpath, Enter mở trang) và
  bằng nút **trước/sau** theo thứ tự Catalogue trên trang chi tiết
  (`~/utils/catalogue-neighbours.ts`).
- **Backdrop hai mức.** `Backdrop` là lớp `aria-hidden` tuyệt đối ở đầu document:
  bốn vệt aurora blur + năm khối hình học tĩnh + một dải tan về nền phẳng. `full` ở
  `/`, `soft` (nửa độ đậm, hai khối) ở mọi trang khác — `layout.template.tsx` quyết
  theo `pathname`. Dưới `md` khối hình ẩn, chỉ còn aurora. Không keyframe, không
  `backdrop-filter` ở đây.
- **Panel kính** (`GlassPanel`, utility `glass` / `glass-deep` trong `globals.css`):
  mọi bề mặt nội dung — nav pill, palette; hero + ba card nổi + hai guide (`@fe-monorepo/ui` sáu
  section, `@fe-monorepo/hook` ba, mỗi guide mở bằng capsule cài của riêng gói đó) đánh số
  ở Getting Started; thanh công cụ + hero + hai panel Import / Export ở
  trang chi tiết; panel 404 tại chỗ. Bốn tầng bóng `--sh-1..4` cùng một thang.
- **Tile · swatch · tile rộng.** Danh sách là lưới 1/2/4 cột của `Tile`: swatch 38px,
  slug mono, một dòng export (ba tên + `+n` qua Locale message
  `exportPreviewMore`), số export ở góc. Tile nền đục 75% và **không** blur — sáu
  mươi `backdrop-filter` trên một trang là chi phí GPU. `col-span-2` từ `md` khi
  `exports.length >= 10`; class nằm trên `<li>` mà `Tile` tự render, vì đó mới là
  grid item. Hover nhấc 3px + bóng tầng 4; dưới `prefers-reduced-motion` chỉ còn bóng, không nhấc — và
  `globals.css` tắt luôn animation mở/đóng của Dialog, Sheet, Select (`[data-open]`, `[data-closed]`),
  vì `tw-animate-css` không tự tôn trọng reduced-motion. Swatch là
  gradient hue sinh xác định từ slug — cùng màu ở tile, ở palette và ở hero chi tiết.
  Lọc rỗng → `Empty` với nút xoá bộ lọc.
- **Trang chi tiết.** Thanh công cụ hai nửa đẩy về hai mép (`Component / dialog` bên trái,
  hai pill trước/sau sát phải) → hero kính đậm (swatch 120px, h1 slug mono, meta
  `gói/subpath · N export`, action Storybook đen đặc + npm kính) → panel **Ví dụ**
  (`detail-example.tsx`: iframe story `Default` của primitive trên Storybook đã deploy,
  `storybookExampleId` từ generator, kèm `globals=theme:dark` trên URL khi người đọc
  đang dark nên iframe đổi theme theo trang) → hai panel `1.25fr | 1fr`: Import (`CodeBlock` nền indigo, dòng import
  copy được) và Export (`<ul>` chip mono). Hook không có nút Storybook lẫn ví dụ, mô tả
  từ Locale message.
- **Palette, font, theme** — mục kế tiếp sau Env.

## Env

`.env` ở root repo (copy từ `.env.example`). App này thêm đúng một key ngoài
nhóm base:

| Key | Bắt buộc | Dùng ở |
| --- | --- | --- |
| `PUBLIC_DOCUMENTS_STORYBOOK_URL` | có | `~/components/link/storybook-link.tsx` (link `<url>/?path=/docs/<docsId>--docs`) và `~/components/detail/detail-example.tsx` (iframe `<url>/iframe.html?id=<storyId>&viewMode=story`) trên mỗi trang primitive. Mặc định trong `.env.example` là Storybook đã deploy, `https://storybook-monorepo-ui.vercel.app`; trỏ `http://localhost:6006` khi muốn xem story local |

Key mang **tên app** theo quy ước của ticket 03. Nó cố ý **không** `.optional()`:
thiếu giá trị thì build image đỏ ngay và gọi đúng tên biến, thay vì ship 63 trang
có nút demo dẫn đi đâu không rõ. Schema nằm ngay trong `src/env.ts` cùng chỗ gọi
`createEnv`, nên Dockerfile (import chính module đó để validate) và app đọc cùng
một schema — không có gì để lệch nhau. `test/env.test.ts` đối chiếu `.env.example`
đã commit với chính schema này.

## Font & palette

App này là app **thứ hai** override palette dùng chung sau `portfolio`, và là app
đầu tiên override **cả accent lẫn neutral**: site tài liệu cho hai gói npm public
không mặc palette của một sản phẩm EMR nội bộ. Lý do và các lựa chọn đã cân nhắc
ở [ADR-0009](../../docs/adr/0009-documents-prism-palette-override.md); giá trị
từ `colors#17` của skill design, chốt ở
[`docs/design/documents-redesign.md`](../../docs/design/documents-redesign.md)
§10 hàng 1, 3, 4, 16, 17.

**Khối override** nằm trong `src/globals.css`, **unlayered** (ngoài mọi
`@layer`) — `theme.css` tới qua `@import` trần nên khai báo của nó cũng
unlayered, và một khai báo unlayered thắng mọi `@layer` bất kể thứ tự; viết
trong `@layer base` thì compile xong vẫn thua, không log gì. Hai khối `:root`
/ `.dark` cùng bộ 19 token: `background` `foreground` `card` `popover`
`primary` `secondary` `muted` `accent` (+ `-foreground` mỗi cái), `border`
`input` `ring`, `selection` (+ `-foreground`), và `--radius: 1.125rem` (có
đơn vị). Status, chart, sidebar, surface/code token **giữ của theme**. Dark là
*indigo night* cùng hue — nền `#0B0A1F`, chữ `#E0E7FF`, primary nâng
`#818CF8` — không phải xám của theme và không phải light đảo cực.

**Font** — ba dòng trong `@layer base :root`: `--font-sans` system stack (prose),
`--font-heading` Outfit (tiêu đề, class `font-heading`), `--font-mono`
JetBrains Mono (mọi slug, subpath, export, dòng lệnh — `font-mono`). Hai
dependency `@fontsource-variable/outfit` và `@fontsource-variable/jetbrains-mono`
nằm trong `catalog:` mặc định của root, import từ `globals.css`: font nằm trong
`node_modules`, Vite hash `.woff2` như mọi asset, nên `bun run build` **không ra
mạng**. Outfit chỉ có subset latin/latin-ext — dấu tiếng Việt trong tiêu đề rơi
về system sans; JetBrains Mono có subset `vietnamese`.

**Theme** — `~/libs/theme-provider.tsx` port từ `apps/portfolio`: context +
`useEffect` + một key `localStorage` (`theme`) + class `.dark` trên `<html>`;
không `next-themes`, không store. Lần đầu theo `prefers-color-scheme`, bấm
toggle thì nhớ. Một inline script trong `index.html` gắn class **trước** khi
bundle tải để người đọc dark không thấy nền sáng nháy. Sống ở `~/libs` chứ
không phải trong slice `layout` vì đây là state toàn app — `DetailExample`
(một shared component) cũng đọc nó để chọn `&globals=theme:dark` cho iframe
Storybook, và một shared component không được import ngược lên `~/features`.

**Hợp đồng token là test**: `test/globals.test.ts` đọc `globals.css` như text và
ghim bộ token, vị trí unlayered, radius, ba dòng font, hai import fontsource, và
contrast từng cặp chữ/nền ≥ 4.5:1 (ring ≥ 3:1) ở **cả hai theme** — đo trên nền
kính hiệu dụng (panel 58% trắng / 60% tối hợp lên vùng aurora tệ nhất), không
trên nền phẳng. Viền `#C7D2FE` cố ý là cạnh mềm (≈1.3–1.5:1), không phải vạch
3:1. `test/support/contrast.ts` copy từ portfolio — app không import chéo app.

## Nạp metadata

> Mục này thay §"How metadata is loaded" của tài liệu `DOCUMENTS.md` bản cũ.
> Bản đó nạp `src/constants/components.json` + `hooks.json` **viết tay**, cộng
> `registry.tsx` trỏ tới 63 preview thủ công — thêm một primitive là ba chỗ phải
> sửa tay, và không có gì báo khi quên. Bản này sinh metadata từ chính source.

**Sinh cái gì, từ đâu**

| Nguồn | Ra | Mỗi entry mang |
| --- | --- | --- |
| `packages/ui/src/components/*.tsx` | `src/generated/components.json` | `slug` (tên file bỏ đuôi) · `subpath` (`components/<slug>`) · `importPath` (`@fe-monorepo/ui/...`) · `exports` · `description` · `example` · `storybookDocsId` · `storybookExampleId` |
| `packages/hook/src/*.ts` | `src/generated/hooks.json` | như trên, trừ hai id Storybook; `subpath` là tên file trần (gói hook không có prefix) |

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
- `description` và `example` đọc từ **một** block JSDoc: block ngay trên declaration
  được export đầu tiên **có** JSDoc (`use-is-mobile` export hằng breakpoint trước
  hook, nên không phải "export đầu tiên"); JSDoc của một import ở trên nữa không
  tính. `description` là phần trước tag đầu tiên gộp thành một câu; `example` là
  phần sau `@example` tới tag kế, giữ nguyên xuống dòng và thụt đầu dòng, `null`
  khi không có. Trang hook render `example` thành panel "Ví dụ" — nguồn duy nhất
  của snippet là source hook, không có bản copy trong i18n hay README.
- `storybookDocsId` suy ra từ slug (`alert-dialog` → `storybook-alertdialog`), cộng
  một bảng override nhỏ cho trường hợp story đặt tên theo component chứ không theo
  file (`direction` → `storybook-directionprovider`). Script không tra được title
  thật: `turbo prune --docker` bỏ `apps/storybook` khỏi build context. Chỗ đối
  chiếu id với story thật là `test/generated/catalogue-invariants.test.ts`, chạy
  trên checkout có đủ hai thư mục.
- `storybookExampleId` là `<storybookDocsId>--default` — story mọi file stories đều
  export, trừ `accordion` (hai story `Single`/`Multiple`, bảng override chọn `single`).
  Cùng test invariant đối chiếu id này với `export const` thật trong file stories.

**Ở đâu, và vì sao gitignore** — `src/generated/` là dữ liệu dẫn xuất và **không**
commit (`.gitignore` của app). Commit nó là mở đường cho nó lệch khỏi
`packages/ui` ngay lần đầu ai đó chạy `ui-add` mà quên sinh lại. Đổi lại, `ui-add`
thêm một primitive là lần build kế tiếp site đã có trang cho nó — palette `⌘K`, danh
sách, trang chi tiết, trước/sau, không sửa file nào.

**Turbo cache** — `turbo.json` của app khai `inputs` cho `build`/`typecheck`/`test`
gồm `$TURBO_DEFAULT$` cộng hai thư mục nguồn (`$TURBO_ROOT$/packages/ui/src/components/**`,
`$TURBO_ROOT$/packages/hook/src/**`), nên sửa một primitive **ngoài** app này vẫn
làm cache của app miss đúng lúc cần.

## Bảng route

> Mục này thay §"Routing" của tài liệu `DOCUMENTS.md` bản cũ. Path lấy từ
> `~/constants/routes.ts`; hai path động có builder riêng, không ai nội suy tay.

| Path | Hằng số | Page | Trang gì |
| --- | --- | --- | --- |
| `/` | `ROUTES.HOME` | `home-page.tsx` | Bắt đầu — hai guide tách riêng: `ui` (cài, peer, nối CSS, theme, ví dụ Button, "không có root entry") và `hook` (cài, peer, ví dụ `useDebounce`) |
| `/components` | `ROUTES.COMPONENTS` | `components-page.tsx` | Lưới 63 tile, có ô lọc (debounce 300ms), tile rộng từ 10 export |
| `/components/:slug` | `ROUTES.COMPONENT_BY_SLUG` · `ROUTES.componentBySlugPath(slug)` | `component-detail-page.tsx` | Trước/sau, hero, ví dụ (iframe story Storybook), Import, chip export, link Storybook |
| `/hooks` | `ROUTES.HOOKS` | `hooks-page.tsx` | Lưới 5 tile hook, có mô tả |
| `/hooks/:slug` | `ROUTES.HOOK_BY_SLUG` · `ROUTES.hookBySlugPath(slug)` | `hook-detail-page.tsx` | Cùng hình dạng trang component: trước/sau, hero (+ link Storybook), **Ví dụ** (iframe story `Hooks/useX` của `apps/storybook`, một story mỗi hook — `use-<slug>.stories.tsx`), Import, chip export, panel **Cách dùng** từ `@example` |
| `*` | — | `not-found-page.tsx` | 404, **trong** shell để còn đường quay lại |

Slug lạ ở hai route động **không** redirect: trang tự render 404 tại chính URL đó
và gọi tên slug bị hụt. Vercel cần rewrite `/(.*)` → `/index.html` (đã có trong
`vercel.json`), nếu không refresh giữa `/components/button` sẽ 404 ở tầng hosting
chứ không tới được router.

## Deploy Vercel

`vercel.json` trỏ install/build về root repo. Cả hai lệnh gọi bun qua
`npx --yes bun@1.4.0` chứ không phải `bun` trần: image build của Vercel mang bun
**của nó** (1.3.14 tại thời điểm viết) và không đọc nổi `bun.lock` của repo
(`lockfileVersion: 2`, do bun 1.4 ghi) — deploy đỏ ngay ở bước install với
`UnknownLockfileVersion`. Ghim ở lệnh là chỗ duy nhất còn lại: `packageManager`
chỉ được đọc khi bật `ENABLE_EXPERIMENTAL_COREPACK`, còn `bunVersion` trong
`vercel.json` chọn runtime của Function chứ không phải builder.

Trên Vercel **không có `.env` ở root** — biến đến từ Environment Variables trong
dashboard, và Vite gộp `process.env` khớp tiền tố `PUBLIC_` vào `import.meta.env`
lúc build. Dashboard phải khai **bốn** key cho cả Production lẫn Preview; ba key
đầu đến từ `baseEnvSchema` mà mọi app Vite kế thừa, nên ở local chúng nằm sẵn
trong `.env` ở root và không ai thấy:

| Key | Nguồn | Bắt buộc |
| --- | --- | --- |
| `PUBLIC_APP_ENV` | base schema | **Có** |
| `PUBLIC_BASE_DOMAIN` | base schema | **Có** |
| `PUBLIC_BASE_DOMAIN_API` | base schema | **Có** |
| `PUBLIC_DOCUMENTS_STORYBOOK_URL` | app | **Có** — production: `https://storybook-monorepo-ui.vercel.app` (Storybook đã deploy) |

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
| `test/scripts/docs-metadata.test.ts` | Parser, trên hai fixture giả ghi ra thư mục tạm (một `.tsx`, một `.ts`): danh sách export xuống dòng, `export type` bị loại, JSDoc đúng block, `@example` nhiều dòng / không có / có tag theo sau, file hỏng thì **ném** và gọi tên file |
| `test/generated/catalogue-invariants.test.ts` | Bất biến: mọi file trong hai thư mục nguồn đều có entry; specifier luôn `@fe-monorepo/*`; mọi primitive có ít nhất một export; mọi hook có `example` khác `null`; `storybookDocsId` trỏ đúng story thật; `storybookExampleId` là một `export const` của file stories đó |
| `test/features/*/templates/*-detail.template.test.tsx` | Đúng một nhánh mỗi trang: slug có trong catalogue → chip export (`listitem`); slug lạ → 404 tại chỗ; trang hook: panel Ví dụ từ source, và không có panel khi entry giả có `example: null`; iframe Ví dụ không viền/nền riêng, và `src` có `&globals=theme:dark` ở theme tối, không có ở theme sáng |
| `test/features/component/components/component-tile.test.tsx` · `test/components/tile/tile.test.tsx` | Tile rộng ở 10 export và không rộng ở 9 — trên `listitem`, là grid item; tên link bắt đầu bằng slug; `+n` |
| `test/features/component/templates/component-list.template.test.tsx` | Lọc rỗng hiện nút xoá bộ lọc, bấm thì danh sách quay lại |
| `test/features/layout/**` | Shell (`layout.template`: nav pill, palette, thứ tự DOM) |
| `test/libs/theme-provider.test.tsx` | Ba quyết định của provider: mở theo theme nào, một lần switch ghi gì, class gắn ở đâu |
| `test/globals.test.ts` | Hợp đồng token — xem mục Font & palette |
| `test/utils/*.test.ts` | Logic thuần: xếp hạng bộ lọc, `slugToHue` (xác định, trong `[0, 360)`), hàng xóm trong Catalogue, và **đúng từng ký tự** dòng import mà người đọc copy |
| `test/env.test.ts` | `.env.example` đã commit vẫn thoả schema của chính app này |

Không có test cho markup thuần hay cho primitive của `@monorepo/ui` — cái sau là
suite của shadcn/Base UI, không phải của site này (xem
`.agents/rules/testing-coverage.md`).

E2E dựng bản production thật rồi `vite preview` trên port 3103, nên `dev` và `e2e`
lên cùng lúc được, và thứ được kiểm đúng là cấu hình `PUBLIC_*` đã bake lúc build.
`e2e/documents.e2e.ts` là bảy spec đi đúng đường người đọc đi: mở `/`, qua nav
pill sang một trang primitive, thấy chip export và dòng import; `Control+K`, gõ
`dialog`, Enter → `/components/dialog`; lọc danh sách rồi mở một tile; từ `dialog`
bấm *Sau* → `direction`; bấm toggle theme → `html.dark` và reload vẫn `dark`; slug
lạ ra 404; và boot không có console error. Trên Windows gọi `bunx playwright test` với cwd là
thư mục app — chạy qua `bun run` script có thể treo lúc launch Chromium.
