---
status: ready-for-human
---

# 03 — Migrate `portfolio` lên `_template_next`; quy ước env key theo tên app

**What to build:** Site portfolio chạy trong `apps/portfolio` sinh từ `_template_next`: nội dung đầy đủ trong HTML đầu tiên, `/` là tiếng Việt không prefix và `/en/...` có prefix, `manifest`/`robots`/`sitemap` có, Sentry báo về project riêng của portfolio qua key `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN`, deploy Vercel vẫn được (giữ `vercel.json`), Dockerfile của Template build xanh trên job `docker`. Quy ước "env key app-specific mang tên app" được ghi thành luật ở CLAUDE.md §3 và README của `@monorepo/env` để ba app sau theo. Đây là app đầu tiên đi trọn đường e2e + docker trên CI.

**Blocked by:** 01 — port; 02 — job `docker`.

**Status:** `ready-for-human` (2026-09-04) — xem Notes: 8/10 ô đã đạt, hai ô còn lại chờ một lượt chạy CI.

## Acceptance criteria

- [x] `apps/portfolio` sinh bằng `bun run gen:app` (Runtime `next`), không copy tay config; port do generator gán; app cũ trong `legacy/portfolio` chỉ dùng để đọc.
- [x] Nghiệp vụ chuyển vào slice dưới `features/` (mỗi màn một slice, template default-export), asset ảnh dưới `assets/` reach bằng import (rule `quality-imports` § Static assets; `public/` chỉ giữ favicon/robots/manifest/ảnh OG cần URL cố định), route module mỏng dưới `app/[locale]/(shell)/…`, `middleware.ts` cũ → `proxy.ts` của Template (session guard giữ nhưng không route nào của portfolio bị guard trừ khi bản cũ có), `manifest`/`robots`/`sitemap` theo App Router convention.
- [x] Sentry: `env.ts` của app khai `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN` (client, optional, `httpUrlSchema`) và truyền vào `initSentryClient/Server/Edge` thay cho `NEXT_PUBLIC_SENTRY_DSN`; `.env.example` thêm key với comment; Docker build ARG cập nhật; `clientRuntimeEnv` liệt kê literal.
- [x] Quy ước env ghi vào CLAUDE.md §3 (dòng "An env variable") và `packages/env/README.md`: giá trị dùng chung → key chung của Template; giá trị của riêng một app → `NEXT_PUBLIC_<APP>_…` / `PUBLIC_<APP>_…` / `<APP>_…` cho secret; ví dụ bằng portfolio.
- [x] Dependency: `react-markdown` major mới nhất (kiểm `className` không còn), `motion`, `next-themes` thêm catalog nếu còn dùng (hoặc bỏ nếu Template đã có cách khác — ghi quyết định vào Notes); không còn `@next/third-parties` bản 15, `@t3-oss/env-nextjs` trực tiếp, `jiti`, ESLint/Prettier config, Radix.
- [x] i18n: chuỗi của portfolio vào `packages/i18n/src/locales/<code>.json` theo ICU (rule catalogue invariants), namespace theo app để không đụng Template.
- [x] Vercel: `vercel.json` giữ (rewrite/headers cũ nếu còn ý nghĩa); ticket xác nhận và ghi vào README app cách Vercel build với `output: standalone` và env từ dashboard (không đọc `.env` root); nếu cần script `build` riêng cho Vercel thì thêm và ghi lý do.
- [ ] Test: `test/` soi gương `src/` cho helper/nhánh có logic; ít nhất hai spec `.e2e.ts` — raw HTML có nội dung + `<title>` + `lang`, và chuyển locale `/en` — xanh local qua `bunx playwright test --project=chromium`; job `e2e` và `docker` xanh cho `portfolio` trên CI.
- [x] README `apps/portfolio` (mục đích, env, port, lệnh, deploy Vercel, Sentry project); `legacy/README.md` dòng `portfolio` cập nhật "đã migrate, xoá ở ticket 07".
- [ ] Gate xanh 0 warning; output verify vào Notes, kèm URL run CI.

## Notes

**Trạng thái: `ready-for-human` (2026-09-04) — không phải `done`, và không thể là `done` từ máy này.**
Tám trên mười ô đã tick và có bằng chứng dưới đây. Hai ô còn lại (#8 phần "job `e2e` và `docker`
xanh cho `portfolio` trên CI", #10 phần "URL run CI") đòi một lượt chạy trên GitHub Actions: máy này
không dựng được image (`command -v docker` rỗng), không đọc được run (không có `gh`), và lượt này bị
cấm mọi lệnh git ghi nên chưa push được nhánh. Đây đúng bức tường đã đẩy ticket 02 sang cùng nhãn —
xem [`docs/agents/triage-labels.md`](../../../docs/agents/triage-labels.md).

**Còn lại đúng ba bước, và ai làm:**

1. **Một người** push nhánh `feat/upgrade`.
2. **Một người** mở run, mở riêng job `e2e` và job matrix `docker (portfolio)`. Cả hai mang
   `continue-on-error: true` nên dấu tích tổng của workflow là vô nghĩa ở đây — phải mở từng job.
3. Dán URL run + kết quả vào mục "Bằng chứng CI" ở cuối, tick #8 và #10, rồi đổi `status: done`.

### App được sinh, không copy tay

`gen run app --args portfolio next` (qua binary `gen`, không phải `bunx turbo gen` — nó cắt cụt
argument trên Windows). Generator gán port **3002 dev / 3102 e2e** vào `apps/portfolio/ports.env`,
đổi tên trong `package.json` và hai ARG của `Dockerfile`, rồi thêm ba script `dev:portfolio` /
`build:portfolio` / `e2e:headed:portfolio` vào root `package.json`. `legacy/portfolio/` chỉ được đọc.

### Quyết định lệch so với AC — đọc trước khi đọc code

**Bỏ hẳn slice `auth`, màn `sign-in` và route group được guard.** AC #2 viết "session guard giữ
nhưng không route nào của portfolio bị guard". Bản cài đặt đi xa hơn: `proxy.ts` chỉ còn locale
negotiation, `features/auth/` không tồn tại, `ROUTES` chỉ có `HOME`.

Lý do, ghi ở đầu [`src/proxy.ts`](../../../apps/portfolio/src/proxy.ts): giữ guard với danh sách
prefix rỗng thì hoặc phải publish một màn đăng nhập không ai dùng được lên một site CV công khai,
hoặc để quyết định guard trỏ tới một route không còn tồn tại. Guard không mất: nó nằm trong
`apps/_template_next` và đến cùng `gen:app` cho app nào thật sự cần. **Nếu chủ ticket muốn đúng chữ
của AC thì đây là chỗ phải sửa lại** — không hạng mục nào khác phụ thuộc quyết định này.

**Bỏ ba header debug và cookie `_portfolio_cache_id` của `middleware.ts` cũ.** Ba header
(`x-current-path`, `x-hostname`, `x-user-agent`) là *response* header — không component nào đọc được
chúng, và không có gì trong repo đọc. Cookie thì định danh theo thiết bị trên một site công khai
không còn phục vụ mục đích nào.

**Bỏ `next/font/google` (Inter_Tight).** Tải font lúc build khiến job `docker` và CI phụ thuộc mạng
Google — đúng lý do `_template_next` đã dùng system stack.

### Rác đã chết trong bản cũ — đo được, không phỏng đoán

- `react-markdown` khai trong `dependencies` nhưng **không một import nào** trong `legacy/portfolio/src`.
- `framer-motion` bị import nhưng **không khai** trong `package.json` — chỉ sống nhờ pnpm hoist.
  Bản mới dùng `motion` (catalog `^13.2.0`), import từ `motion/react`.
- `GoogleAnalytics` / `GoogleTagManager` gắn id **rỗng** — không đo gì.
- `robot.ts` thiếu chữ "s" nên Next chưa bao giờ nhận ra nó là robots route.
- `sitemap.xml/route.ts` trỏ vào `/api/sitemaps/...` không tồn tại.
- Ảnh OG trỏ `/vercel.svg` không tồn tại.

Sáu thứ trên được thay bằng `src/app/{manifest,robots,sitemap}.ts` theo App Router convention.

### Catalog: gỡ hai entry chết

`@next/third-parties` và `jiti` ra khỏi catalog `next16`. Đã grep toàn `apps/`, `packages/`,
`tooling/` (bỏ artifact build): không workspace nào tham chiếu. Ba app legacy còn lại có khai `jiti`,
nhưng chỉ để chạy `createJiti("./src/env")` trong `next.config.js` kiểu Next 15 — Next 16 đọc
`next.config.ts` native và `_template_next` chứng minh bằng cách không có nó, nên hai ticket migrate
sau sẽ bỏ y như ở đây. Gỡ ngay để lần sau không cargo-cult lại.

### Nội dung CV: đối chiếu một-đối-một với bản cũ

Đây là dạng lỗi im lặng nhất của một cuộc migrate — một section biến mất và không test nào đỏ. Đã
đếm thủ công `legacy/portfolio/src/constants/data.ts` so với
`src/features/home/constants/resume.ts` cộng catalogue i18n:

| Mục | Bản cũ | Bản mới |
| --- | --- | --- |
| Work | 4 (FPT IS, AROBID, DCORP R-KEEPER, WISDOM ROBOTICS) | 4 |
| Education | 1 (Saigon Technology University) | 1 |
| Contact | 5 (birthday, phone, location, github, email) | 5 |
| Hobbies | 5 | 5 |
| Skills | 19 | 19 |
| About | 2 đoạn | 2 (`about.experience`, `about.mindset`) |
| Navbar | 3 (Home, LinkedIn, GitHub) | 3, URL trùng khớp |

### i18n

60 message key mỗi ngôn ngữ dưới namespace `portfolio.*`. Kiểm parity toàn catalogue: `vi.json` và
`en.json` mỗi bên **190 key, hình dạng giống hệt**, không key nào lệch một phía, không chuỗi rỗng,
không `{{name}}`, không rich-text tag. `bun run --filter @monorepo/i18n test` xanh.

### Ba lỗi do vòng review tìm ra và đã sửa trong chính lượt này

1. **Không có `<h1>` nào trong HTML prerender.** Đo trên bytes: `.next/server/app/{vi,en}.html` có
   h1=0, heading đầu tiên là `<h2>`. Trên một trang mà toàn bộ mục đích là được recruiter và crawler
   đọc, outline bắt đầu từ level 2, và người dùng screen reader duyệt theo phím H không bao giờ đáp
   xuống tên chủ nhân CV. `BlurFadeText` nay nhận prop `as` (`"span" | "h1"`), hero truyền `as="h1"`.
   Kiểm lại sau khi sửa: **h1=1, h2=6** ở cả hai locale.
   Hệ quả kéo theo: spec `locale-switch` đỏ, vì route announcer của Next
   (`__next-route-announcer__`) nay mirror `<h1>` vào một vùng `aria-live` nên `getByText` khớp hai
   phần tử — *đó là bằng chứng bản sửa có tác dụng*. Spec đổi sang
   `getByRole("heading", { level: 1 })`.
2. **`public/og-image.jpg` là bản copy byte-identical của `legacy/portfolio/public/avatar-2.jpg`**
   (cùng MD5 `1c7e6342…`): ảnh **dọc 1920×2560, 1.1 MB**, trong khi `layout.tsx` khai
   `width: 1200, height: 630`. Mọi nền tảng đặt trước khung 1.91:1 rồi mới tải ảnh, nên card sẽ là
   một dải cắt ngang giữa bức ảnh dọc. Sinh lại bằng `sharp` (fit cover, neo `top` để giữ khuôn
   mặt): **1200×630, ratio 1.905, 25 KB** — nhỏ hơn 44 lần.
3. **`target="_blank"` áp cho cả `tel:` lẫn `mailto:`.** Hai scheme này bàn giao sang ứng dụng khác
   nên tab trắng bị bỏ lại; trên iOS Safari đây là khác biệt giữa "mở dialer" và "không có gì xảy
   ra". Thêm `isExternalPage()`, chỉ gắn `target`/`rel` cho `http(s)`.

### Job `e2e` trên CI trước đây không chạy app này

`.github/workflows/ci.yml` hardcode đúng hai step cho hai Template. Filter `changes.app` vẫn bật job
khi diff chạm `apps/`, nên job **báo xanh** trong khi 9 spec của portfolio chưa bao giờ chạy — dạng
xanh giả tệ nhất. Step nay tự khám phá mọi app có `playwright.config.ts` (cùng lối job `docker` dùng
`find apps -name Dockerfile`), có `set +e` cộng bảng đếm lỗi để một app đỏ không nuốt mất các app
sau, và `upload-artifact` đổi sang glob `apps/*/playwright-report/`. Ticket migrate sau không phải
sửa file này nữa. Kiểm vòng lặp tại chỗ: bắt đúng `_template_next`, `_template_vite`, `documents`,
`portfolio` (storybook không có E2E nên không lọt vào).

### Verify — output thật, chạy sau khi mọi sửa đổi đã nằm trên đĩa

```
bun run check      → Checked 503 files in 26s. No fixes applied.   (0 diagnostic)
bun run typecheck  → Tasks: 16 successful, 16 total
bun run test       → Tasks: 12 successful, 12 total
bun run build      → Tasks:  7 successful,  7 total
```

E2E local, chạy từ thư mục app bằng `bunx playwright test --project=chromium` (không qua `bun run`,
vốn treo lúc launch Chromium trên Windows):

```
apps/portfolio → 9 passed (24.3s)
```

Chín spec gồm: nội dung CV, `<title>` và thuộc tính `lang` có trong HTML thô trước khi JS chạy;
`og:image` là URL tuyệt đối; `robots.txt` trỏ sitemap và sitemap liệt kê cả hai locale; manifest
được serve; URL lạ trả **404 thật** chứ không phải 200-nói-404; và chuyển locale `/` ↔ `/en`.

### Một warning thật, thừa hưởng từ Template — không phải lỗi của ticket này

`webServer` của Playwright chạy `bun run build && bun run start`, trong khi `next.config.ts` đặt
`output: "standalone"`, nên Next cảnh báo `"next start" does not work with "output: standalone"`.
Hệ quả phải nói thẳng: **9 spec xanh chứng minh `next start` boot được, KHÔNG chứng minh server
standalone mà `Dockerfile` thực sự ship (`CMD ["node", "server.js"]`) boot được.**
`_template_next` mang đúng warning này và khoản đó đã được quy về **ticket 13 §2** của topic
`personal-monorepo-rebuild`. Cố ý không sửa ở đây: đổi `webServer.command` là quyết định thuộc ticket
kia, và sửa lén sẽ làm hai Template lệch nhau.

### Còn treo, đã ghi nhận chứ không lặng lẽ bỏ qua

Vòng review sinh 32 phát hiện; 10 cái nặng nhất được một agent phản biện kiểm chứng (mặc định bác
bỏ nếu không tự xác nhận được), 7 sống sót và đã xử lý ở trên. **22 phát hiện còn lại chưa ai kiểm
chứng** — chúng có thể đúng hoặc sai. Những cái đáng theo dõi nhất thuộc app này:

- `error.tsx` nhận `error` nhưng không gọi `captureException`, nên đúng lớp lỗi khách nhìn thấy lại
  là lớp Sentry không có event — dù app khai hẳn project riêng.
- Ảnh chân dung (LCP element) render qua `AvatarImage` của Base UI, tức `<img>` thuần, nên không đi
  qua image optimizer — trong khi `resume-card.tsx` bên cạnh đã dùng `next/image` đúng cách.
- Comment ở `lens.tsx:49` khẳng định `useMotionTemplate` chạy trên motion clock, nhưng nó chỉ nhận
  số thuần từ React state — nếu đúng thì comment đang nói ngược sự thật, loại lỗi khiến người sửa
  sau tin nhầm là chỗ đó đã tối ưu.
- `Dock` giữ `bg-white/50` không có override dark, trong khi dải fade ngay dưới nó thì có.
- `aria-label` trên header từng hàng CV dùng chung một chuỗi tĩnh, nên mọi hàng có cùng accessible
  name.

Sentry `org: "sentry"` / `project: "portfolio_v1"` bê nguyên từ `next.config.js` cũ và **chưa ai xác
nhận với Sentry thật** — `org: "sentry"` trông giống placeholder.

### Bằng chứng CI — **còn trống, chờ bước 1–3 ở đầu mục Notes**

```
URL run:
job e2e (portfolio):
job docker (portfolio):
```
