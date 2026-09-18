# `@monorepo/portfolio`

Site CV cá nhân — một màn hình public, không đăng nhập, không gọi backend. Chạy
Runtime **Next.js 16 App Router**, clone từ `apps/_template_next` bằng
`bun run gen:app` (ticket `legacy-migrate/03`), thay cho app `portfolio` của bản
trước khi dựng lại repo — đã xoá, còn đọc được trong git history.

Lý do nó là Next chứ không phải Vite: toàn bộ giá trị của trang này nằm ở **HTML
đầu tiên**. Nhà tuyển dụng mở link, LinkedIn unfurl thẻ social, Google index —
cả ba đọc byte đầu và không chạy JavaScript của trang. Nội dung CV vì vậy phải
render trên server, và `e2e/server-rendering.e2e.ts` là chỗ chứng minh điều đó.

Hình dạng thị giác hiện tại là **redesign v2 — Terminal / neubrutalist** (spec
#113, chốt ở [`docs/design/portfolio-redesign-v2.md`](../../docs/design/portfolio-redesign-v2.md)
§7, ghi thành [ADR-0008](../../docs/adr/0008-portfolio-neubrutalist-neutral-override.md)):
góc vuông, viền cứng, bóng đổ đặc, mono cho tiêu đề và nhãn, sans cho văn xuôi,
hai accent (indigo + vàng) trên neutral gần đen/gần trắng, dark mode đảo cực,
không fade. Dữ liệu CV, i18n, print và thẻ chia sẻ giữ hợp đồng của v1 (spec
#103, [`docs/design/portfolio-rebuild.md`](../../docs/design/portfolio-rebuild.md)).

**Responsive** (spec #210, chốt ở [`docs/design/portfolio-responsive.md`](../../docs/design/portfolio-responsive.md)):
dock là **thanh chạm đáy** full-width dưới `sm` (nhãn ngôn ngữ rút `VI`/`EN`), trở lại pill nổi từ
`sm`; hero và hàng CV (`ResumeCard`) đổi sang lưới một cột trên điện thoại — avatar chỉ ngang hàng
tên, bốn action xếp 2×2 cao 40px, thân accordion trải hết bề rộng dưới heading; link inline (Mã
nguồn, Xem demo, giá trị liên hệ) có vùng bấm 32px. Từ tablet dọc (`md`) trang là **cột đọc** +
**rail** 3/2 dính khi cuộn, hai cột 2/1 giữ nguyên từ `lg`; landscape phone giữ lề gốc, `md`+ mới
lên `pt-24`. Cam kết không tràn ngang từ 320px. `e2e/viewport.e2e.ts` và `e2e/dock.e2e.ts` đo cả bộ.

```bash
bun run dev:portfolio     # http://localhost:3002
```

## Hình dạng app

| Thứ | Ở đâu | Ghi chú |
| --- | --- | --- |
| Bố cục | `src/app/[locale]/(shell)/layout.tsx` + `templates/home.template.tsx` | Khung `max-w-6xl`. Một cột dưới `md`; từ `md` là **cột đọc** (About, Work, Projects) + **rail** (Skills, Education, Contact, Hobbies) dính khi cuộn, hero trải cả hai — tỉ lệ 3/2 ở tablet dọc (768px, rail ~264px), 2/1 từ `lg` (#123, #210). Đúng thứ tự DOM cắt đôi, nên test thứ tự section không đổi và tab order = thứ tự đọc. Projects hai cột từ `sm`, card lẻ cuối trải hết hàng; trong rail Skills xếp nhãn trên giá trị từ `md`, Contact/Hobbies xuống dọc từ `md` (giữ hai cột ở `sm`). Landscape phone (667×375) giữ lề `py-12`, `md`+ mới lên `pt-24`; `scroll-padding-bottom` trên `html` chừa chỗ cho thanh chạm đáy khi focus nhảy tới link cuối. `e2e/viewport.e2e.ts` đo cả bốn bố cục, cam kết không tràn ngang từ 320px. |
| Nội dung CV | `src/features/home/` | Một slice. `templates/home.template.tsx` (default-export) xếp 8 section theo **thứ tự đọc** — Hero → About → Work → Projects → Skills → Education → Contact + Hobbies (hai cái cuối chung một hàng từ `sm`, xếp dọc lại trong rail từ `lg`). `constants/resume.ts` giữ **cấu trúc** (id, thứ tự, logo, tech stack, bullet nào thuộc role nào), còn **mọi chuỗi người đọc thấy** nằm ở `@monorepo/i18n` dưới namespace `portfolio.*`. Hai nửa nối nhau bằng `id`. |
| Khối tiêu chuẩn | `src/features/home/components/standard-block.tsx` | **Một** hình khối cho cả trang — viền 2px màu `--border`, bóng đặc `4px 4px` màu `--hard-shadow` (utility `shadow-hard`, khai báo trong `@theme inline` của `globals.css`), góc vuông, nền card, chữ `text-foreground`. Là component chứ không phải hằng className: hình dạng mà bảy file gọi nó phải giống nhau thì sống ở một file. Padding `p-4 sm:p-5` cũng là của khối (mọi caller đều chọn đúng một inset); bố cục bên trong là của nơi gọi. Tiêu đề section đi qua `section-heading.tsx`: `##` màu indigo (ẩn khỏi accessible name) + chữ mono in hoa giãn chữ, luôn là `h2`. |
| Hero | `src/features/home/components/hero-section.tsx` | **Cửa sổ terminal duy nhất** của trang: một `StandardBlock` với `p-0` mang thanh tiêu đề (ba chấm `rounded-full` — **ngoại lệ bo tròn cố ý duy nhất** của trang, vì đèn cửa sổ thì tròn — + `tuan@portfolio:~`, `aria-hidden`, `print:hidden`) rồi thân theo thứ tự một shell in ra — `$ whoami` → tên (**h1** — không còn lời chào, không emoji), `$ cat role.txt` → dòng định vị, `$ current --job` → công việc hiện tại, hàng bốn hành động (Email nền vàng `bg-highlight`, GitHub, LinkedIn, In CV) và ảnh chân dung **vuông** ở mép phải thân (override className vì `Avatar` bo tròn bằng class, không đọc `--radius`). Tên lệnh là **code** — `portfolio.hero.commands.*` giống hệt nhau ở hai locale, `test/messages.test.ts` ghim — và cả dòng lệnh `aria-hidden`, nên screen reader đi thẳng từ h1 sang dòng định vị. Không còn Lens, không còn fade. |
| Ba section đáng nói | `src/features/home/components/` | **Work** là accordion (`resume-card.tsx`), mỗi hàng một khối tiêu chuẩn với logo vuông: chỉ row đầu mở sẵn, chevron luôn hiện — hover-only affordance thì trên điện thoại không tồn tại — và row Arobid mang badge giải VDA 2025 nền vàng (`bg-highlight`). Tên công ty, mốc thời gian, badge, tech stack là mono; chức danh và bullet là sans. **Projects** là **một** khối tiêu chuẩn chứa ba hàng (`project-row.tsx`, không còn card, không còn primitive `Card`), mở bằng một câu ghi chú tính chất (`portfolio.projects.note`): đây là dự án **học và demo**, có repo public + demo sống, không phải sản phẩm production (#125). Mỗi hàng: tên mono + link cùng dòng, một câu mô tả sans, tech stack là một dòng mono mờ (cap sáu tên ép ở tầng dữ liệu) — **không** bullet, **không** badge loại; hàng cách nhau bằng đường kẻ 2px của trang. Cú **lún** mọi khối đều có: `StandardBlock` dịch 2px về phía bóng và rút bóng về 2px (`shadow-hard-pressed`), transform + shadow thôi nên hàng xóm không dịch, `motion-reduce` bỏ tween. Từ #124 mọi khối tiêu chuẩn lún, hero và About lẫn Skills — lún là chất liệu của trang, không phải dấu hiệu bấm được. **Skills** là **một** khối tiêu chuẩn chứa năm hàng dạng directory listing — nhãn `frontend/` mono bên trái (dấu `/` ẩn khỏi accessible name), tên kỹ năng là text mono cách nhau bằng dấu phẩy vẽ bằng pseudo-element, không còn badge — hiện cùng lúc, không phải tab: tab giấu bốn nhóm khỏi lần đọc đầu và khỏi crawler hoàn toàn. **About**, **Contact**, **Hobbies** mỗi cái một khối tiêu chuẩn; Contact có thêm nhãn trường mono (`portfolio.contact.labels.*`) trước giá trị sans, và Education là khối nhờ dùng chung `ResumeCard`. |
| Chrome | `src/features/layout/` | Dock nổi ở đáy viewport (`components/dock.tsx` + `templates/navbar.template.tsx`) và `provider/theme-provider.tsx` (provider riêng của app, **không** còn `next-themes`: cùng hợp đồng — key `theme` trong localStorage, class `light`/`dark` trên `<html>`, script chạy trước paint — nhưng script chỉ render ở lần mount đầu của document và theme được gắn lại ở mọi lần mount, vì root layout `[locale]` remount khi đổi ngôn ngữ; `next-themes` render script ở mọi mount nên React 19 cảnh báo, và bỏ luôn class khi remount — #126). Không có header/footer — một CV không cần. Từ v2 dock là **một khối đặc vuông**: viền 2px `--border`, bóng `shadow-hard` (cùng utility với khối tiêu chuẩn từ #124), nền `bg-background`, **không magnification**, không còn dải mờ macOS phía sau. **Thanh lún khi hover** như mọi khối; **control bên trong không lún theo hover** (thanh đã lún) mà lún 1px khi bấm — hover chỉ đổi nền. Mỗi control 48px, `gap-2` giữ hai control cách nhau ≥ 8px (`e2e/dock.e2e.ts` đo). **Năm mục**: Home, LinkedIn, GitHub, đổi theme (wipe khi đổi vẫn chạy, `theme-toggle-button.tsx`), và **chọn ngôn ngữ** — chuyển từ góc trên phải xuống đây ở #124, vẽ như một control (48px, không viền/bóng riêng, mono), có `aria-label`, bọc `Suspense` vì đọc `usePathname()`; shell không còn chrome nào trên nội dung. Dưới `sm` dock đổi hình thành **thanh chạm đáy** (spec #210): trải hết bề rộng viewport, chạm mép dưới, chỉ còn viền trên, không bóng, không lún cả thanh (control bên trong vẫn lún 1px khi bấm); nhãn ngôn ngữ rút thành mã `VI`/`EN`. Một dock, hai hình theo breakpoint — không phải bottom nav. |
| Route module | `src/app/[locale]/(shell)/page.tsx` | Đúng một dòng `return <HomeTemplate />`. Không `generateMetadata` riêng: title/description của root layout đã mô tả chính trang này, thêm một bản nữa chỉ tạo chỗ cho hai bên lệch nhau. |
| Metadata routes | `src/app/{manifest,robots,sitemap}.ts` | Theo convention App Router, nằm **ngoài** `[locale]`. Thay cho `robot.ts` (thiếu chữ `s`, nên Next chưa bao giờ nhận ra) và `sitemap.xml/route.ts` (trỏ vào endpoint không tồn tại) của bản cũ. Vì thế `public/robots.txt` của Template đã bị xoá — một URL chỉ được có một nguồn. |
| `proxy.ts` | `src/proxy.ts` | Chỉ còn `negotiateLocale`, cộng một nhánh cho ảnh metadata sinh động (`/vi/opengraph-image`) đi thẳng — `as-needed` sẽ 307 URL đó về bản không prefix, mà crawler xem trước link cần nhận ảnh ngay ở request đầu; quyết định là hàm thuần `~/utils/metadata-image-path.ts`. Không route nào bị guard: đây là site public, nên slice `features/auth` + màn `sign-in` + nhóm route `dashboard` của Template bị bỏ hẳn thay vì giữ với danh sách prefix rỗng. Cơ chế guard không mất — nó vẫn nằm trong `apps/_template_next` và quay lại cùng `gen:app` cho app nào thật sự cần. |
| Ảnh | `src/assets/` | Reach bằng **import**, không phải URL string trỏ `public/` — bundler resolve, hash và báo lỗi build khi đổi tên. `public/` chỉ còn `favicon.ico`, file duy nhất cần URL cố định — ảnh OG không còn là file tĩnh mà được sinh bởi `src/app/[locale]/opengraph-image.tsx` theo từng locale — route module chỉ resolve locale, catalogue và host rồi giao cho `features/home/components/open-graph-card.tsx` vẽ. Thẻ vẽ theo đúng ngữ pháp của trang: một khối trắng viền cứng bóng đặc trên nền trang, thanh tiêu đề ba ô vuông + host, `$ whoami`, tên trên một mảng vàng, dòng định vị; không bo góc. Satori không đọc được custom property nên `OPEN_GRAPH_PALETTE` ghi thẳng sRGB của light theme, và test giữ từng literal khớp với token trong `globals.css`/`theme.css`. Vẫn chỉ Geist Regular có sẵn trong `ImageResponse` — không `fonts`, không file font trong repo, `next build` không ra mạng. |
| Không có | — | `~/libs/`, `~/hooks/api/`, `~/stores/`, TanStack Query, `"use cache"`. Site không gọi API nào; nội dung là hằng số của slice, và `"use cache"` chỉ trả giá trị serializable trong khi cấu trúc CV mang `StaticImageData` cùng component icon. |

## Palette, motion và print — ba thứ sống trong `src/globals.css`

**Palette riêng — mười hai token màu, một độ dài.** `tooling/tailwind/theme.css`
là palette neutral mặc định của shadcn (primary gần đen, viền xám, không có
accent hue) — một cái CV cần một accent của riêng nó, và một trang viền cứng
cần chữ và viền đẩy hẳn ra hai cực thay vì dừng cách cực một bậc. App override đúng
bốn nhóm, ở **tầng app**, không đụng theme dùng chung:

| Nhóm | Token | Light → Dark |
| --- | --- | --- |
| Bảy **accent** của v1, một hue indigo (277) | `primary` + `primary-foreground`, `ring`, `accent` + `accent-foreground`, `selection` + `selection-foreground` | indigo-600 trên trắng → indigo nâng sáng trên nền đen |
| Hai **neutral** v2 chiếm lấy | `foreground`, `border` | gần đen `#0a0a0a` → gần trắng `#fafafa`. `muted-foreground` cố ý **không** override — đã AA, và là màu xám thứ hai cho meta lùi lại |
| Cặp **highlight** vàng (hue 91–92), đúng hai vai: nền nút Email và badge VDA 2025 | `highlight` + `highlight-foreground` | `#ffe14d` → `#eec743` dịu hơn; chữ trên nó gần đen ở cả hai theme, và focus ring trên nền vàng vẽ bằng chính `highlight-foreground` inset vì không vàng nào đạt 3:1 với `--ring` indigo trong dark |
| Bóng đổ đặc | `hard-shadow` (+ utility `shadow-hard` = `4px 4px 0 0`) | đen → trắng, đổi cùng viền — bóng đen trên nền đen thì không còn là bóng, nên nó là token |

Cộng **`--radius: 0px`** (có đơn vị — `0` trần làm các `calc(var(--radius) * n)`
của theme thành `<number>` mà `border-radius` từ chối): `theme.css` suy mọi
`rounded-*` từ nó, nên một dòng vuông badge/card/button/skeleton/select cho cả
trang mà không sửa `@monorepo/ui`. **Dark mode là bản đảo cực** của light chứ
không phải bản làm mờ: nền gần đen, chữ + viền + bóng gần trắng. Status colour,
chart, sidebar để nguyên cho theme.

Khối đó cố ý **không** nằm trong `@layer`: `theme.css` được kéo vào bằng
`@import` trần nên `:root`/`.dark` của nó ở ngoài mọi layer, mà một khai báo
không layer thắng khai báo trong layer bất kể thứ tự. Viết trong `@layer base`
thì mười ba dòng này (mười hai màu, một độ dài) compile, ship và **thua** — trang vẫn teal, không log gì
cả. `test/globals.test.ts` ghim hợp đồng này (đúng tập token, hai hue, hai
neutral ở hai cực, từng tỉ lệ tương phản ở cả hai theme, radius, chỗ đứng trong
cascade) — ai muốn thêm/bớt token thì sửa test **có chủ đích**, và ADR-0008 ghi
vì sao hợp đồng v1 "chỉ bảy accent, không đụng neutral" đã đổi.

**Reduced motion.** Không còn fade nào theo section và hero không còn bàn tay
vẫy: mọi thứ render ở trạng thái nghỉ, nên không có `opacity: 0` inline nào để
CSS phải hoàn tác. Thứ còn lại là chuyển động do CSS sở hữu — wipe theme — tắt
theo tên, không phải bằng `* { animation: none }`, để một animation tương lai
phải tự khai vào đây. Dock không còn chuyển động nào (magnification đã bỏ ở
redesign v2), nên không cần đọc preference.

**Print.** Trang này **là** bản CV, nên "tải CV" ở hero là hộp thoại in của trình
duyệt chứ không phải một file PDF phải giữ đồng bộ bằng tay. `@media print` hoàn
tác một thứ `motion` viết inline (row accordion chưa ai bấm in ra heading không
thân), thay hẳn palette dark bằng light (trình duyệt không in background
graphics, nên theme tối in ra là chữ trắng trên giấy trắng), và in href sau mỗi
link ngoài — trừ khối Contact, nơi chữ hiện ra **đã là** URL. Từ redesign v2,
bản in còn **làm nhẹ** hình khối: `StandardBlock` (cửa sổ terminal ở hero cũng
là nó, với `p-0`) mang `print:border print:shadow-none` nên mọi khối in không
bóng, viền 1px; ảnh chân dung và logo công ty mỏng theo; thanh tiêu đề cửa sổ
`print:hidden` như dock. Phần print của hình khối nằm **cạnh phần màn hình**
trong className chứ không trong `@media print` của `globals.css` — khối đó chỉ
giữ những gì utility không nói được (đè inline style của `motion`, `::after`
in href, đổi palette). `e2e/print-and-motion.e2e.ts` đo tất cả dưới media
emulation `print`.

## i18n

`/` là tiếng Việt **không prefix**, `/en` có prefix (`localePrefix: "as-needed"`
của `@monorepo/i18n`). Đổi ngôn ngữ là **điều hướng**, không phải mutate một
singleton: `SelectLanguage` gọi `router.replace(pathname, { locale })` với
`usePathname` của next-intl, cái trả path **không** kèm prefix.

Chuỗi của app nằm dưới namespace riêng `portfolio.*` trong
`packages/i18n/src/locales/{vi,en}.json`, viết bằng ICU MessageFormat, để không
đụng namespace dùng chung của Template. Thêm một dòng CV = sửa hai file JSON đó,
cộng `id` trong `src/features/home/constants/resume.ts` nếu là một mục mới.

## Env

Đọc qua Flavor `next` của `@monorepo/env` trong `src/env.ts`. `.env` nằm ở
**root repo** (ADR-0003), nạp bằng `dotenv -e ../../.env --` vì Next chỉ đọc
`.env` nằm trong thư mục app.

| Key | Bắt buộc | Dùng ở |
| --- | --- | --- |
| `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` | **Có** | `metadataBase`, `app/robots.ts`, `app/sitemap.ts` |
| `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN` | Không | `instrumentation.ts`, `instrumentation-client.ts` |

Hai key đều **mang tên app**, và đó là quy ước chứ không phải sở thích: `.env` ở
root là **một** file dùng chung cho mọi app, nên mượn `NEXT_PUBLIC_TEMPLATE_NEXT_SENTRY_DSN`
sẽ đẩy lỗi của site này sang project Sentry của Template. Giá trị dùng
chung thì giữ key chung; giá trị của riêng một app thì `NEXT_PUBLIC_<APP>_…`
(Next), `PUBLIC_<APP>_…` (Vite), `<APP>_…` cho secret server.

`NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` cố ý **không** `.optional()`: thiếu nó thì
`next build` đỏ ngay và gọi đúng tên biến, thay vì ship một sitemap toàn URL
tương đối — mà sitemap URL tương đối thì không phải sitemap.

Không có biến server-only: site này không giữ secret nào.

## Port

Khai đúng **một** chỗ: `ports.env`.

| | Port |
| --- | --- |
| Dev (`next dev`) | **3002** |
| E2E (`next start` do Playwright dựng) | **3102** |

Next không có option port ở tầng config, nên `dev`/`start` đưa thẳng `ports.env`
cho dotenv-cli (`PORT` là kênh duy nhất còn lại ngoài cờ `--port`), còn
`playwright.config.ts` import `E2E_PORT` từ `./ports.ts` rồi ép qua
`webServer.env.PORT`. E2E cách dev đúng 100 để một `next dev` bị bỏ quên không
bao giờ trả lời được cho E2E — `reuseExistingServer` sẽ nhận nhầm nó và cả run
vẫn xanh.

## Lệnh

```bash
bun run dev:portfolio                                   # dev server, cổng 3002
bun run build:portfolio                                 # build production

bun run --filter @monorepo/portfolio typecheck          # next typegen && tsc
bun run --filter @monorepo/portfolio test               # Vitest 5 + RTL (jsdom)
bun run --filter @monorepo/portfolio test:coverage      # báo cáo v8, không có ngưỡng

bunx playwright test --project=chromium                 # E2E — chạy TỪ TRONG thư mục app
bun run e2e:headed:portfolio                            # cùng spec, một cửa sổ thật

# Docker chạy TỪ ROOT repo — context phải là root (Dockerfile mở bằng
# `COPY . .` + `bunx turbo prune`); lấy thư mục app làm context sẽ đỏ ở bước prune.
docker build -f apps/portfolio/Dockerfile -t portfolio .
```

Runner copy thêm `.env` (bản `.env.<BUILD_ENV>` mà builder đã dùng) vào cạnh
`server.js`: `NEXT_PUBLIC_*` đã được inline lúc build, nhưng một biến **server**
không tiền tố thì không nằm trong bundle nào — nó phải có mặt trong `process.env`
lúc chạy. Standalone server gọi `loadEnvConfig` trên cwd của nó nên đọc được file
này; dotenv không ghi đè biến đã set, nên `docker run -e KEY=…` vẫn thắng.

Trên Windows gọi E2E bằng `bunx playwright test` với cwd là thư mục app: chạy
runner qua một `bun run` script có thể treo lúc launch Chromium.

## Test

`test/` soi gương đường dẫn dưới `src/`; `e2e/` là hàng xóm của nó, đuôi
`.e2e.ts` để Vitest không bao giờ nhặt phải.

Cái được test là **quyết định**, không phải markup:

- `test/features/home/constants/resume.test.ts` — mối nối giữa cấu trúc CV và
  catalogue, **cả hai chiều**. Chiều đi: next-intl render một key thiếu thành
  **chính đường dẫn key**, nên một dòng dịch bị rớt sẽ hiện ra màn hình dưới dạng
  `portfolio.work.…` mà không ném ở đâu cả; hai nửa typecheck độc lập và không
  nửa nào biết nửa kia. Chiều về: một message **không component nào đọc** không
  làm hỏng render nào, không fail typecheck nào và không hiện ở đâu cả — nên nó
  tích lại, và người sửa `vi.json` tiếp theo không phân biệt được dòng nào còn
  sống. Test dựng lại tập key app **có thể** đọc từ constants cộng mọi chuỗi
  `"portfolio.…"` viết thẳng trong `src/`, rồi bắt phần dư. Cùng file cũng ghim
  đúng danh sách ba role — một row quay lại là một lời khẳng định được publish
  trước khi có ai nhìn trang.
- `test/features/home/templates/home.template.test.tsx` — **thứ tự** section và
  outline heading. Không chỗ nào khác thấy được: mỗi section là một component có
  test riêng, còn template xếp chúng thì không có logic nào để typecheck — và hai
  ticket thêm section song song đã làm lệch thứ tự đúng một lần, im lặng, vì mọi
  section vẫn render.
- `test/features/home/components/resume-card.test.tsx` — nhánh duy nhất của một
  hàng CV: có thân thì là accordion header (`<h3>` bọc `<button aria-expanded>`),
  không có thì là một `<a>` thật ra ngoài.
- `test/globals.test.ts` + `test/support/contrast.ts` — hợp đồng palette v2:
  đúng bảy accent + hai neutral + cặp highlight + bóng, hai hue (indigo, vàng),
  neutral và bóng achromatic ở hai cực, `muted-foreground` **không** bị đụng,
  từng tỉ lệ contrast ở cả hai theme (kể cả "ring indigo không đủ 3:1 trên vàng
  trong dark" — lý do nút Email vẽ ring riêng), `--radius: 0px` có đơn vị, chỗ
  đứng của khối override ngoài mọi `@layer`, và print palette giữ hợp đồng v1.
  Đọc CSS dưới dạng **text**: jsdom không tính style, và giá trị nằm trong custom
  property mà chỉ một cascade thật resolve được. Rằng cascade thật sự resolve
  đúng như file này khẳng định thì `e2e/accent.e2e.ts` kiểm, trong trình duyệt.
- `test/features/home/components/hero-section.test.tsx` — h1 là tên, dòng lệnh
  và thanh tiêu đề cửa sổ nằm ngoài cây trợ năng, không còn bàn tay vẫy, đúng
  bốn hành động (In CV cuối), mailto không mở tab mới.
  `test/features/layout/components/dock.test.tsx` — không còn magnification:
  control giữ nguyên cỡ khi con trỏ đi dọc thanh. `test/messages.test.ts` —
  `portfolio.hero.commands.*` giống hệt nhau ở mọi locale, và không message nào
  mồ côi.
- `test/features/home/components/open-graph-card.test.tsx` — thẻ chia sẻ render
  ra static markup rồi đọc: không `border-radius`, đúng một `box-shadow` offset
  bằng nhau và blur 0, đúng một mảng vàng và nó bọc tên, indigo chỉ làm màu chữ;
  và mỗi literal trong `OPEN_GRAPH_PALETTE` bằng sRGB mà token light theme tương
  ứng resolve ra — đọc CSS as text qua `test/support/css-tokens.ts`, cùng bộ
  helper `globals.test.ts` dùng. `test/app/[locale]/opengraph-image.test.tsx`
  giữ nửa route: PNG thật cho từng locale, 404 cho locale lạ, và `ImageResponse`
  được gọi không có `fonts` trong khi `src/` không chứa file font nào.
- `test/utils/metadata-image-path.test.ts` — hàm thuần quyết định path nào của
  ảnh metadata được `proxy.ts` cho đi thẳng.
- `test/features/layout/components/theme-toggle-button.test.tsx` — theme kế tiếp,
  hướng wipe, và nhánh trình duyệt không có `startViewTransition`.
- `test/features/layout/constants/navbar.test.ts` — item internal đi qua `ROUTES`
  và **không** tự viết prefix locale; item external là URL tuyệt đối.
- `test/proxy.test.ts` — `config.matcher` phải là literal khớp từng ký tự với
  `I18N_PROXY_MATCHER`. Một regex sai vẫn build xanh và fail-open, nên không có
  gì khác bắt được lỗi này.
- `test/env/env.test.ts` — key bắt buộc thiếu thì ném có tên biến; DSN optional
  vắng thì không.

E2E assert trên **HTML thô** qua fixture `request` (không browser, không
hydration): tên ứng viên (h1) cùng lệnh `whoami` và dòng định vị, một **bullet
mô tả công việc** — heading có thể đến từ
shell, bullet thì chỉ có nếu slice thật sự render trên server — một tên project
cùng href repo của nó, `<title>`, `lang`, `og:image` tuyệt đối trỏ vào route sinh
ảnh **theo locale** (và fetch chính URL đó với `maxRedirects: 0`: unfurler phải
nhận byte ngay ở request đầu), `robots.txt` / `sitemap.xml` /
`manifest.webmanifest`, 404 trả status thật, và `/en` phục vụ bản tiếng Anh.
Fixture `request` **không** kế thừa `locale` của project, nên các spec đó tự gửi
header `Accept-Language`.

Bốn spec còn lại cần một trình duyệt thật, vì thứ chúng kiểm là **layout đã tính**
hoặc **cascade đã resolve** — hai thứ jsdom không có: `accent.e2e.ts` (mười hai
token ra đúng màu ở cả light lẫn dark, primitive vuông, mọi khối sau hero là
`StandardBlock` với viền 2px + bóng đặc, badge và nút Email nền vàng với ring
inset, ảnh vuông, card dự án hover không nhấc), `dock.e2e.ts` (khung vuông viền
2px bóng đặc ở hai theme, mỗi control ≥ 44px cách nhau ≥ 8px, không phóng to
dưới con trỏ), `print-and-motion.e2e.ts` (`emulateMedia` cho `print`: không
bóng, viền 1px, không thanh tiêu đề, không dock, mọi row mở, href in sau link;
và cho `prefers-reduced-motion`, nay tầm thường vì không còn gì để tắt ngoài
wipe) và `viewport.e2e.ts` (không scroll ngang ở 375 px cả hai locale — nơi rủi
ro của mono lộ ra — cỡ chữ tối thiểu 15/14 px, chevron hiện ở trạng thái nghỉ).
`locale-switch.e2e.ts` đi cả hai đường: hai test đầu fetch thô, test cuối bấm
thật vào switcher để xác nhận người đọc ở lại đúng trang.

## Deploy Vercel

`vercel.json` trỏ install/build về root repo và gọi script **`build:vercel`**:

```jsonc
"installCommand": "cd ../.. && npx --yes bun@1.4.0 install --frozen-lockfile",
"buildCommand":   "cd ../.. && npx --yes bun@1.4.0 run --filter @monorepo/portfolio build:vercel",
```

Cả hai lệnh gọi bun qua `npx --yes bun@1.4.0` chứ không phải `bun` trần: image
build của Vercel mang bun **của nó** (1.3.14 tại thời điểm viết) và không có cách
nào ghim — `packageManager` chỉ được đọc khi bật `ENABLE_EXPERIMENTAL_COREPACK`,
còn `bunVersion` trong `vercel.json` chọn runtime của Function chứ không phải
builder. Bun đó không đọc nổi `bun.lock` của repo (`lockfileVersion: 2`, do bun
1.4 ghi) và deploy đỏ ngay ở bước install với `UnknownLockfileVersion`. Ghim ở
lệnh là chỗ duy nhất còn lại.

`build:vercel` là `next build` **trần**, không có tiền tố `dotenv -e ../../.env`
như script `build` chuẩn của Template. Lý do: trên Vercel **không có `.env` ở
root** — biến môi trường đến từ Environment Variables trong dashboard của
project và đã nằm sẵn trong `process.env` lúc build, nên tiền tố dotenv ở đó vừa
thừa vừa rủi ro (nó đỏ vì không tìm thấy file).

Nghĩa là dashboard Vercel phải khai **bốn** key cho cả Production lẫn Preview —
không phải chỉ hai key riêng của app ở mục **Env**. Hai key còn lại đến từ
`baseClientSchema` của `@monorepo/env/next/schema`, mà mọi app Next đều kế thừa;
ở local chúng nằm sẵn trong `.env` ở root nên không ai thấy, còn trên Vercel thì
không có file nào để kế thừa:

| Key | Nguồn | Bắt buộc |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | base schema | **Có** |
| `NEXT_PUBLIC_BASE_DOMAIN_API` | base schema | **Có** |
| `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` | app | **Có** |
| `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN` | app | Không |

`NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` phải là **origin thật của deploy** — không
phải `http://localhost:3002` — nếu không sitemap và `og:image` sẽ trỏ về
localhost.

`output: "standalone"` trong `next.config.ts` bị Vercel **bỏ qua** (Vercel dùng
Build Output API riêng), nên nó không cản deploy zero-config; nó ở đó cho runner
Docker `node:24-alpine` + `node server.js`. Điều này còn phải xác nhận trên một
deploy thật trước khi coi ticket là đóng.

## Sentry

Wrap ở `next.config.ts` qua `@monorepo/sentry/next-config` với
`{ org: "sentry", project: "portfolio_v1" }` (kế thừa từ bản cũ); DSN
đọc từ `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN` và truyền vào `initSentryClient`
trong `src/instrumentation-client.ts`, cùng `initSentryForRuntime` trong
`src/instrumentation.ts` — hàm này ở `src/sentry-runtime.config.ts` là chỗ
duy nhất được đọc `process.env.NEXT_RUNTIME` để chọn SDK server hay edge. DSN
rỗng nghĩa là
SDK vẫn cài nhưng tắt — không gọi mạng, không log rác (xem
`packages/sentry/src/options.ts`). Còn phải đối chiếu lại `org` / `project` với
Sentry thật trước khi đóng ticket.
