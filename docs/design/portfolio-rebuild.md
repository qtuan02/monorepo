# Design brief — build lại `apps/portfolio`

> **Đã implement, spec #103.** Tài liệu này giữ nguyên nội dung quyết định của bước design; nó là bản ghi *tại thời điểm quyết*, không phải mô tả app hiện tại. Hình dạng app sau khi build đọc ở [`apps/portfolio/README.md`](../../apps/portfolio/README.md) và CLAUDE.md §1; những chỗ ở đây còn để ngỏ (§9) đã được chốt trong chính các ticket của spec.

- **Ngày:** 2026-09-06
- **Bước:** design (§7a CLAUDE.md), chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`, không `--persist`.
- **Đầu vào:** [`docs/research/portfolio-cv-data-rebuild.md`](../research/portfolio-cv-data-rebuild.md) (dữ liệu CV, shortlist repo, schema hiện tại), code `apps/portfolio` tại commit `96d0345`, `tooling/tailwind/theme.css`.
- **Đầu ra:** tài liệu này, cho vòng `/grill-with-docs` tiếp theo. Nơi lưu (`docs/design/`) là **tạm** — guide `docs/guides/skills-workflow.md` ghi nơi lưu chốt ở grill đầu tiên.
- **Cách đọc trích dẫn:** `ux#NN` = hàng `No=NN` trong `data/ux-guidelines.csv`; `nextjs#NN`, `shadcn#NN` = `data/stacks/*.csv`; `products#NN`, `landing#NN`, `motion#NN`, `typography#NN` = file cùng tên trong `data/`. Mỗi hàng CSV là một record trọn vẹn, grep được bằng `^NN,`.
- **Ba loại nội dung:** **FACT** (có nguồn), **TARGET** (theo brief của chủ repo), **DRAFT** (đề xuất của bước design — chủ repo duyệt hoặc bỏ).

---

## 0. Tóm tắt 10 dòng

1. **Giữ vỏ, đổi ruột.** Shell hiện tại (một cột `max-w-2xl`, dock đáy, theme wipe, i18n `vi`/`en`, SSR đủ để crawler đọc CV) đã đúng hướng, có test và E2E. Không dựng lại từ đầu; thay đổi nằm ở **cấu trúc nội dung** và **kỷ luật motion/typography**.
2. **Định vị mới (TARGET):** *Frontend-led full-stack engineer* — web (React/Next), mobile (React Native/Expo), backend khi cần (Spring Boot, .NET, PayloadCMS). Hero phải nói được câu này trong một dòng; hiện hero chỉ có "developer yêu nghề".
3. **Thêm section Projects** (bản cũ có, bản hiện tại bỏ) với 5 repo trong shortlist §7.3 của research, dạng card 2 cột — đây là chỗ duy nhất chứng minh được BE/DevOps bằng link thật thay vì bullet.
4. **Work:** thêm `medviet` lên đầu, quyết số phận `fptis`; giữ `ResumeCard` accordion nhưng **không** để mọi row `defaultExpanded` — row đầu mở, các row sau đóng (progressive disclosure, `ux#84`).
5. **Skills:** từ 19 badge phẳng sang **5 nhóm** (Frontend / Mobile / Backend / DevOps & CI / Tooling), mỗi nhóm một dòng badge; tên skill không dịch, nhãn nhóm dịch.
6. **Motion:** hiện có ~40 `BlurFade` stagger trên một trang (mỗi badge một fade) → vi phạm `ux#7` (1–2 element/view). Đề xuất fade **theo section**, stagger chỉ cho card Projects (30–50 ms/card, `motion#7`), và **tôn trọng `prefers-reduced-motion`** (`ux#9`, `ux#99`) — `blur-fade.tsx` hiện không có nhánh này (FACT: grep không thấy `useReducedMotion`/`prefers`).
7. **Typography:** body đang `text-sm`/`text-xs` (14/12 px) ở About, Contact → dưới ngưỡng 16 px mobile (`ux#67`). Nâng body lên 15–16 px, meta tối thiểu 14 px; measure ≤ 75 ký tự đã đạt nhờ `max-w-2xl` (`ux#73`).
8. **Màu:** `theme.css` là palette **web-emr** (brand teal `#38a696` của sản phẩm EMR ở Medviet, FACT trong comment file). Portfolio cá nhân đang mặc màu thương hiệu của nơi làm việc — cần chủ repo quyết: giữ, hay override một accent riêng trong `apps/portfolio/src/globals.css` (đã có tiền lệ override `--font-sans` ở đúng chỗ đó).
9. **Print/PDF:** thêm `@media print` (ẩn dock, mở hết accordion, tắt fade) để trang **là** CV in được — rẻ hơn duy trì PDF riêng, và trả lời câu hỏi "có nút tải CV không".
10. **Chưa chốt được vì phụ thuộc chủ repo:** timeline (A/B/C ở research §4.3), tên/logo Medviet, ảnh screenshot 5 project, accent color, font.

---

## 1. Phân tích yêu cầu (Step 1 của skill)

| Mục | Kết luận | Nguồn |
|---|---|---|
| Product type | **Portfolio/Personal** — `products#11`: primary style *Motion-Driven + Minimalism & Swiss Style*, landing *Storytelling-Driven*, palette *Brand primary + artistic interpretation*, anti-pattern *Corporate templates + Generic layouts* | `products.csv` hàng 11 |
| Reasoning | `ui-reasoning#11`: `if_minimal_portfolio → constraint:reduce-motion`. Trang này là CV một cột, không phải showcase sáng tạo → nhánh **minimal**, tức là **giảm motion**, không thêm parallax | `ui-reasoning.csv` hàng 11 |
| Landing pattern gần nhất | `landing#26` *Portfolio Grid*: Hero (Name/Role) > Project Grid > About > Contact; "Neutral background (let work shine). Accent: Minimal"; hover overlay, lazy image | `landing.csv` hàng 26 |
| Đối tượng đọc | Recruiter/tech lead VN, đọc trên điện thoại từ link Zalo/LinkedIn; crawler (Google, OG preview) | research §3 (link LinkedIn, OG image đang có) |
| Stack | Next 16 App Router, `cacheComponents`, next-intl, `motion`, `@monorepo/ui` (Base UI). Không TanStack Query, không store | research §8.1; `apps/portfolio/package.json` |
| Platform | **Web** (desktop + mobile web). Các mục safe-area/haptic/Dynamic Type của skill là App UI → **bỏ qua** | SKILL.md scope notice |

---

## 2. Cấu trúc trang (DRAFT)

Thứ tự đọc mới, một cột, `id` giữ để dock/anchor dùng:

| # | Section | `id` | Giữ / đổi | Lý do |
|---|---|---|---|---|
| 1 | Hero | `hero` | **đổi** | Thêm dòng định vị + 2–3 quick action (email, GitHub, LinkedIn). Hero là 100 % những gì OG/crawler và người lướt 5 giây thấy |
| 2 | About | `about` | đổi copy | Viết lại theo TARGET; 2 đoạn ≤ 70 từ mỗi đoạn |
| 3 | Work | `work` | đổi dữ liệu | `medviet` lên đầu; 3–4 row tuỳ phương án timeline |
| 4 | **Projects** | `projects` | **mới** | 5 card, grid 1 cột mobile / 2 cột `sm:` |
| 5 | Skills | `skills` | đổi shape | 5 nhóm |
| 6 | Education | `education` | giữ | — |
| 7 | Contact + Hobbies | `contact` / `hobbies` | giữ, thêm LinkedIn | Hobbies giữ vì rẻ; có thể bỏ nếu chủ repo muốn gọn (câu hỏi §9) |

Không thêm section Awards: một giải (VDA 2025) — để nó là **badge** trên row Arobid (`shadcn#10` compound: một `Badge` trong header của `ResumeCard`), không phải section riêng (research §8.4 cùng ý).

Không thêm "stats strip" (3+ năm / 3 công ty / 2 gói npm): con số "3+" chưa tự đứng được (research §1.3) — không in số cho tới khi timeline chốt.

### 2.1 Hero

```
[h1] Xin chào, mình là Tuấn 👋              [Avatar 112/144 px, Lens zoom]
[p ] Frontend-led full-stack engineer — web, mobile và backend khi dự án cần.
[p ] (một câu ngắn về hiện tại: đang làm EMR/HIS tại Medviet)     ← TARGET, chờ §9
[row] ✉ Email   ⌥ GitHub   in LinkedIn   ⤓ In CV (print)          ← link, không Button
```

- Quick action là `<a className={buttonVariants({variant:"outline",size:"sm"})}>` — link mặc `buttonVariants`, **không** `Button render={<a>}` (rule `architecture-ui-primitives`, đã áp dụng ở dock).
- Emoji 👋 giữ (đây là **text trang trí**, không phải icon → không vi phạm `no-emoji-icons`), nhưng `aria-hidden="true"` và **không** `animate-bounce` khi reduced-motion.
- Avatar: static import, `priority` vì là LCP (`nextjs#21`), kích thước khai báo (`nextjs#18`). Lens giữ, nhưng là enhancement — ảnh vẫn hiện khi JS chưa chạy (đã đúng).
- Hero **không** có CTA "Thuê tôi" kiểu marketing: `landing#32` một primary CTA, và với CV thì CTA thật là email.

### 2.2 Work

- Row: logo 48 px tròn, tên công ty + period `tabular-nums` (đã có), role, body accordion.
- **`defaultExpanded` chỉ row đầu** (`medviet`). Các row sau đóng, có chevron hiện rõ chứ không chỉ `group-hover:opacity-100` (hover-only affordance vi phạm `hover-vs-tap` trong Quick Reference §2; trên mobile không có hover → người dùng không biết row mở được).
- Badge giải thưởng trên row Arobid: `Badge variant="secondary"` cạnh period, text ngắn "VDA 2025".
- Period: giữ chuỗi dịch tay (`"03/2026 – Hiện tại"`) — **hoặc** chuyển `WorkItem` sang `{ from: "2026-03", to?: "2026-09" }` và format bằng `useFormatter().dateTime` của next-intl để một mốc chỉ ghi một lần. Đề xuất chuyển (giảm drift giữa `vi.json`/`en.json`), nhưng là scope tăng → câu hỏi §9.

### 2.3 Projects (mới)

Card = `@monorepo/ui/components/card` thật (`Card` + `CardHeader` + `CardTitle` + `CardContent` + `CardFooter`, `shadcn#10`) — khác `ResumeCard`, ở đây cần viền, nền `bg-card`, hover lift, tức là đúng những gì `Card` ship.

```
┌──────────────────────────────┐
│ [ảnh 16:9, next/image, lazy] │  ← optional; không có ảnh thì bỏ khối, không để ô xám
│ Tên project        [Personal]│  ← Badge type
│ 1–2 câu mô tả                │
│ [React 19][Rsbuild][STOMP]…  │  ← Badge nhỏ, tối đa 6, nowrap từng chip (ux#116)
│ ⌥ Source    ↗ Demo           │  ← link ngoài, target=_blank rel=noreferrer
└──────────────────────────────┘
```

- Grid `grid gap-4 sm:grid-cols-2`; card cao bằng nhau nhờ `h-full` + footer đẩy xuống.
- Ảnh: `src/assets/projects/<id>.{png,jpg,webp}` **import** (rule `quality-imports`), `loading="lazy"` (`nextjs#17`, `ux#47`), `aspect-video` để không CLS (`nextjs#40`). Hiện **chưa có ảnh nào** cho 5 repo shortlist → câu hỏi §9; card phải render đẹp khi `image` undefined.
- Hover: chỉ `translate-y`/shadow (`motion#2`, transform-only) — không scale card có text (đọc khó khi scale).
- Type: `personal` | `company` (bản cũ có; giữ để sau này gắn 4 link Arobid làm card `company` nếu chủ repo muốn).
- Thứ tự DRAFT: monorepo → chat-socket → SmartRental → spring-boot-microservices → gitlab-bot-for-lark (research §7.3).

### 2.4 Skills

```
Frontend    [React][Next.js][TypeScript][Tailwind CSS][shadcn/ui][TanStack Query][Zustand][RHF + Zod][Storybook][i18n]
Mobile      [React Native][Expo][NativeWind][Reanimated]
Backend     [Spring Boot][.NET 8][PayloadCMS][PostgreSQL][MongoDB][Redis]
DevOps & CI [Docker][GitHub Actions][Vercel][Turborepo][Changesets]
Tooling     [Bun][Biome][Vitest][Playwright][Figma]
```

- Nhóm là `<h3>` nhỏ (`text-sm font-medium text-muted-foreground`) — **không** dùng `Tabs`: tab giấu 4/5 nội dung khỏi lần đọc đầu và khỏi crawler, còn CV thì cần đọc một lượt.
- Badge: `Badge variant="outline"` hoặc `secondary`, **không** `hover:-translate-y-1` (badge không phải control; lift gợi ý bấm được — `ux#117` ngược lại: nếu là chip tương tác thì phải là button). Bỏ `select-none`.
- Danh sách trên là DRAFT từ research §6; `.NET 8` chỉ có 21 commit và chưa CV nào ghi → câu hỏi §9.

### 2.5 Education, Contact, Hobbies

- Education: giữ `ResumeCard` với `href`.
- Contact: thêm `linkedin` (test `withHref` phải mở rộng danh sách). Value là link chỉ khi dẫn đi được (đã đúng).
- Contact + Hobbies cạnh nhau `flex gap-6` → trên 375 px hai cột này chật (Contact có email dài). Đổi thành `grid gap-6 sm:grid-cols-[2fr_1fr]`, mobile xếp dọc (`ux#69` không scroll ngang; `ux#112` reflow).

---

## 3. Ràng buộc UX đã chọn (mỗi cái trỏ hàng CSV)

| # | Ràng buộc | Áp vào đâu | Hiện trạng (FACT) |
|---|---|---|---|
| `ux#7` | Tối đa 1–2 element động mỗi view | Bỏ `BlurFade` trên từng badge/contact line; giữ per-section | ~40 fade/trang, stagger 50 ms mỗi badge |
| `ux#9`, `ux#99` | `prefers-reduced-motion` → trạng thái cuối, không animate | `BlurFade`, `BlurFadeText`, hero 👋, dock magnification, theme wipe (`@supports` + thêm `@media (prefers-reduced-motion: reduce)`) | Không có nhánh reduced-motion ở `blur-fade.tsx`, `dock.tsx`, `globals.css` |
| `ux#39` | h1 → h2 → h3 tuần tự | h1 hero, h2 mỗi section, h3 nhóm skill / tên project | Đúng tới h2 |
| `ux#40` | Icon-only control có accessible name | Dock link (`aria-label` đã có), quick action hero nếu icon-only | Đúng ở dock |
| `ux#41`, `ux#28` | Tab order = thứ tự nhìn, focus ring thấy được | `main` trước `NavbarTemplate` trong DOM (đã đúng) — không cần skip link (`ux#45`) vì nav đứng sau nội dung | Đúng |
| `ux#100` | Focus không bị dock che | `scroll-padding-bottom` ≥ 5 rem trên `html`; `pb-26` trên `main` đã có | Thiếu `scroll-padding` |
| `ux#17`, `ux#20` | Fixed dock + `dvh` | Dock `fixed bottom-0`; body `min-h-dvh` (Template đã dùng) | Đúng |
| `ux#22` + WCAG target 24 px web | Dock icon 48 px, quick action ≥ 32 px cao, chip không phải control | Dock 48 px đúng |
| `ux#36`, `ux#76` | Text 4.5:1 | `text-muted-foreground` trên `bg-background`: light `#646464` trên `#f8f8f9` ≈ 5.6:1 ✓; dark `oklch(0.708)` trên `oklch(0.145)` ≈ 7:1 ✓ | Đạt; giữ khi đổi accent (§5) |
| `ux#38` | Alt text | Logo công ty `alt=company` (đã có); ảnh project `alt=""` vì tên card đã là text | — |
| `ux#67` | Body ≥ 16 px mobile | About, bullets Work, mô tả Project: `text-[15px]`/`text-base`; meta (period, contact) ≥ `text-sm` | About `text-sm`, Contact `text-xs` |
| `ux#72`, `ux#73` | Line-height 1.5–1.75; 65–75 ký tự | `leading-relaxed` cho prose; `max-w-2xl` (672 px) ≈ 75 ký tự ở 16 px ✓ | — |
| `ux#84`, `ux#113` | Không cắt cụt text thiết yếu | Bullet Work không `line-clamp`; mô tả project không clamp (tối đa 2 câu ở nguồn) | — |
| `ux#116` | Chip một dòng, `nowrap`, không cắt | Badge skill/tech: `whitespace-nowrap`; container `flex-wrap` | Badge đã wrap container |
| `ux#1`, `ux#3` | Anchor cuộn mượt, active state | Nếu dock thêm anchor tới section → `scroll-behavior: smooth` (tắt khi reduced-motion) và active indicator. Hiện dock chỉ có Home/LinkedIn/GitHub → **không** thêm anchor nav trong vòng này (trang ngắn, 7 section) | — |
| `ux#47`, `nextjs#17`, `nextjs#18` | Lazy + dimension cho ảnh dưới fold | Ảnh project | — |
| `nextjs#21` | `priority` cho LCP | Avatar hero | Avatar qua `AvatarImage` (Base UI `<img>`), không `next/image` → cân nhắc `next/image` + `priority`, hoặc `fetchPriority="high"` |
| `nextjs#7`, `nextjs#8` | Server Component mặc định | Mọi section server; island chỉ `BlurFade`, `Lens`, `ResumeCard`, dock, theme toggle. `ProjectCard` **server** (hover bằng CSS) | Đúng |
| `nextjs#26` | OG image | Đổi `og-image.jpg` khi định vị đổi | Có sẵn 1200×630 |
| `shadcn#4`, `shadcn#6` | Token OKLCH, `.dark` đủ | Override accent (nếu có) phải viết cả `:root` và `.dark` | theme.css đủ hai bộ |
| `shadcn#38`, `shadcn#39` | Tooltip + một `TooltipProvider` | Dock đã đúng | Đúng |
| `motion#4` (Scroll Reveal, Subtle) | 300–400 ms, `y: 12`, fade | Thông số cho `BlurFade` section | Hiện `yOffset` 6–8, blur 6 px, duration 0.4 — gần đúng, bỏ blur để rẻ GPU |
| `motion#7` (Stagger List, Subtle) | 250–350 ms, stagger 30 ms | Card Projects | — |
| `typography#9` (Developer Mono) | JetBrains Mono + IBM Plex Sans | **Tuỳ chọn** — chỉ khi chấp nhận `@fontsource` self-host (rule `quality-styling-tailwind` cho phép `@fontsource*` import từ `globals.css`, không cần Google lúc build) | System stack (cố ý, comment trong `globals.css`) |

---

## 4. Component map

| Cần | Dùng | Ghi chú |
|---|---|---|
| Avatar hero | `@monorepo/ui/components/avatar` (có) | Xem `nextjs#21` ở trên |
| Quick action link | `buttonVariants` từ `@monorepo/ui/components/button` trên `<a>`/`Link` | Không `Button render={<a>}` |
| Card project | `@monorepo/ui/components/card` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Server Component; hover bằng CSS |
| Badge skill / tech / type / award | `@monorepo/ui/components/badge` | `variant="outline"` skill, `secondary` type/award |
| Work / Education row | `~/features/home/components/resume-card.tsx` (giữ, custom có lý do trong comment) | Sửa chevron luôn hiện (opacity 0.6 → 1 hover) |
| Fade | `~/features/home/components/blur-fade.tsx` (giữ) | Thêm `useReducedMotion` từ `motion/react`; bỏ filter blur |
| Dock | `~/features/layout/components/dock.tsx` (giữ) | Khi reduced-motion: `magnification = 40` (tức tắt) |
| Separator giữa nhóm skill | không cần — spacing đủ | — |
| Empty/skeleton | không có dữ liệu bất đồng bộ → không cần skeleton ngoài `SelectLanguage` (đã có) | — |
| Icon | `lucide-react` (đã dùng toàn repo) — **không** đổi sang Phosphor như SKILL.md gợi ý; rule repo thắng, một icon family (`icon-style-consistent`) | GitHub/LinkedIn icon riêng trong `~/components/icons` (có) |

Không có composite mới cần vào `~/components`: `ProjectCard` chỉ một slice dùng → `~/features/home/components/project-card.tsx`.

---

## 5. Token delta so với `tooling/tailwind/theme.css`

FACT: `theme.css` ghi rõ *"Palette ported from web-emr's root.css (the EMR brand)"*, primary `#38a696`, dark primary `#75cdc0`. Portfolio kế thừa nguyên.

Hai phương án, **không** chọn hộ:

| | A — giữ teal EMR | B — accent cá nhân |
|---|---|---|
| Việc | 0 | Override trong `apps/portfolio/src/globals.css` `@layer base { :root { --primary; --primary-foreground; --ring; --accent; --accent-foreground; --selection; --selection-foreground } .dark { … } }` — cùng chỗ đã override `--font-sans` |
| Rủi ro | Portfolio mang màu sản phẩm của nơi đang làm; đổi việc là đổi màu | Chọn sai hue thì phải đo lại contrast (`ux#36`) cho `primary-foreground` và `ring` |
| Hợp `products#11` | "Brand primary + artistic interpretation" — brand ở đây là *cá nhân* | ✓ |
| Hợp `landing#26` | "Neutral background, accent minimal" — cả hai đều đạt vì nền đã neutral | ✓ |

Nếu B: giữ **một** hue, dùng ở link/focus/badge award/hover card; không đụng `destructive/success/warning/info` (không dùng ở portfolio). Hex cụ thể chốt ở grill; **không** lấy từ `colors.csv` (§7a cấm với app đã có theme). Tokens **không** đổi: radius `0.625rem`, spacing scale, `--font-*` (trừ khi chọn `typography#9`).

Delta chắc chắn cần bất kể A/B:

- `html { scroll-padding-bottom: 5rem }` (dock).
- `@media (prefers-reduced-motion: reduce)`: tắt `::view-transition-*` animation, `animate-bounce`.
- `@media print`: ẩn `NavbarTemplate`, `SelectLanguage`, Lens; `ResumeCard` mở hết (prop hoặc `print:block`); bỏ `BlurFade` opacity; link project in kèm URL (`a[href^="http"]::after` với `attr(href)`); `@page { margin: 16mm }`.

---

## 6. State list

| Đối tượng | State | Ghi chú |
|---|---|---|
| Trang | `vi` / `en` (`as-needed`, `/` = vi) | Mọi key mới có ở cả hai locale — test `resume.test.ts` đỏ nếu thiếu |
| Theme | light / dark / (system → một trong hai) | Đo contrast accent ở cả hai |
| Motion | bình thường / `prefers-reduced-motion` | Fade → hiện ngay; dock → không phóng; wipe → không |
| Media | screen / **print** | §5 |
| Hero avatar | ảnh / fallback `HT` | Đã có |
| `ResumeCard` | expanded / collapsed; có body / không (education) | Row đầu Work mở |
| `ProjectCard` | có ảnh / không ảnh; có demo / chỉ source; type personal / company | Không có ô ảnh xám khi thiếu ảnh |
| Chip tech | ≤ 6 hiện; > 6 → cắt ở dữ liệu (constants), không `+n` overlay | Giữ constants ≤ 6 |
| `SelectLanguage` | skeleton (Suspense) / hiện | Đã có |
| 404 / 500 | `not-found.tsx`, `error.tsx` từ Template | Không đổi |
| Viewport | 375 / 768 / 1024+ | Một cột suốt; Projects 2 cột từ `sm`; Contact+Hobbies 2 cột từ `sm` |

---

## 7. Copy cần viết / dịch (key mới, DRAFT tiếng Việt; bản `en` viết ở ticket)

| Key | vi (DRAFT) | Ghi chú |
|---|---|---|
| `portfolio.hero.positioning` | "Frontend-led full-stack engineer — web, mobile và backend khi dự án cần." | TARGET |
| `portfolio.hero.current` | "Hiện làm sản phẩm EMR/HIS tại Medviet: web, app React Native và backend .NET." | Chờ §9 (tên công ty, .NET) |
| `portfolio.hero.actions.{email,github,linkedin,print}` | "Email" / "GitHub" / "LinkedIn" / "In CV" | |
| `portfolio.about.experience` | Viết lại: số năm theo phương án chốt, FE là gốc, đã ship mobile (Expo) và BE (.NET / Spring Boot / PayloadCMS), quen monorepo + CI + design system | Thay đoạn "hơn 3 năm React/Next" hiện tại |
| `portfolio.meta.description` | Cùng nội dung, ≤ 155 ký tự | SEO |
| `portfolio.work.items.medviet.{role,period,bullets.*}` | 3 bullet DRAFT ở research §5.3 (monorepo + health-exam; EMR mobile; legacy EMR web + .NET handlers) | Chờ §9 về tên dự án được nêu |
| `portfolio.work.items.arobid.award` (badge) | "VDA 2025" | Tooltip: tên giải đầy đủ |
| `portfolio.projects.title` | "Dự án cá nhân" | |
| `portfolio.projects.type.{personal,company}` | "Cá nhân" / "Công ty" | |
| `portfolio.projects.links.{source,demo}` | "Mã nguồn" / "Xem demo" | |
| `portfolio.projects.items.<id>.{description,bullets.*}` | 5 item, mô tả 1–2 câu + 2–3 bullet DRAFT ở research §7.3 | Tên project không dịch |
| `portfolio.skills.groups.{frontend,mobile,backend,devops,tooling}` | "Frontend" / "Mobile" / "Backend" / "DevOps & CI" / "Công cụ" | |
| `portfolio.contact.items.linkedin` | "linkedin.com/in/tuan-huynh-916b792b7" | |

Copy **không** đổi: education, hobbies, navbar, 404/500.

---

## 8. Delta schema / code (để `/to-tickets` cắt việc)

| Việc | File | Ghi chú |
|---|---|---|
| `ProjectItem` type + `PROJECT_ITEMS` | `types/resume.ts`, `constants/resume.ts` | `{ id; name; type; techStack; image?; source?; demo?; bulletKeys }` |
| `ProjectsSection` + `ProjectCard` | `components/projects-section.tsx`, `components/project-card.tsx`, `templates/home.template.tsx` | Server Components |
| `SkillGroup` + `SKILL_GROUPS` thay `SKILLS` | `types`, `constants`, `components/skills-section.tsx`, test | |
| `WorkItem` `medviet` (+ logo), xử lý `fptis` | `constants`, `src/assets/logos/medviet.*`, `vi.json`, `en.json` | Logo chưa có |
| `award?: string` trên `WorkItem` → Badge | `types`, `resume-card.tsx` | |
| Contact `linkedin` | `constants`, test `withHref` | |
| Hero positioning + quick actions | `hero-section.tsx` | |
| Reduced-motion ở `BlurFade`/`BlurFadeText`/`Dock`, bỏ blur filter | `blur-fade*.tsx`, `dock.tsx` | |
| Font-size pass (About/Contact/bullets) | các section | |
| `scroll-padding`, reduced-motion, print CSS | `globals.css` | |
| (tuỳ) accent override | `globals.css` | Phương án B |
| (tuỳ) `period` → `{from,to}` + `useFormatter` | `types`, `constants`, `resume-card.tsx`, i18n | |
| OG image mới | `public/og-image.jpg` | Sau khi copy chốt |
| E2E `server-rendering.e2e.ts` | đổi assertion `"Social Protection System"` → chuỗi của Medviet/bullet mới; thêm assert Projects render server-side | FACT: E2E hiện assert chuỗi FPT IS |
| Test `resume.test.ts` | thêm `projects`, `skills.groups`, section headings | |

Không đổi: shell layout, `proxy.ts`, i18n wiring, dock cấu trúc, theme provider, metadata routes.

---

## 9. Quyết định đã chốt ở grill 2026-09-06 (thay cho câu hỏi mở)

Mọi mục dưới đây là **quyết định của chủ repo**, ghi lại nguyên văn lựa chọn; chúng override mọi DRAFT ở các mục trên khi hai bên khác nhau.

| # | Quyết định | Chọn | Hệ quả lên tài liệu này |
|---|---|---|---|
| 1 | Loại trang | **CV site** (Work dẫn, Projects phụ) — term ghi ở `apps/portfolio/CONTEXT.md` | Thứ tự §2 giữ nguyên |
| 2 | Timeline | **Phương án A**: Dcorp 03/2024–02/2025 → Arobid 03/2025–02/2026 → MedViet 03/2026–nay = 31 tháng; **không** Wisdom | Row `wisdom` bị xoá; `fptis` bị xoá |
| 3 | FPT IS | Tên "bùa" — **bỏ hẳn**, kể cả bullet Social Protection / Quang Ninh | E2E `server-rendering.e2e.ts` phải đổi assertion |
| 4 | Số năm | In **"2+ năm"**, bỏ mục tiêu 3+ | `about.experience`, `meta.description`, hero |
| 5 | Công ty hiện tại | **MedViet — Software Engineer**, period **03/2026 – Hiện tại** (theo brief, dù git chỉ có từ 22/05/2026) | Row `medviet` |
| 6 | Bullet MedViet | Cả 4: monorepo FE + **module Khám sức khoẻ** (chủ repo nhấn mạnh phải có); app EMR mobile Expo/RN; web EMR legacy Next 14 + Redux; backend .NET 8 (EF Core, MediatR) | Tên in công khai: "EMR/HIS", "hệ thống khám sức khoẻ" — **không** tên bệnh viện/tỉnh, không mã màn hình |
| 7 | Định vị hero | "Frontend-led full-stack engineer — web, mobile và backend khi dự án cần." | §2.1 |
| 8 | Quick action hero | Email · GitHub · LinkedIn · In CV | §2.1 |
| 9 | Projects | **3 card** có demo sống: monorepo, chat-socket (FE+BE), SmartRental; **không ảnh**; grid 1 cột mobile / 3 cột `md` | §2.3 sửa grid; `image` bỏ khỏi scope đợt này |
| 10 | Link Arobid | Text trong bullet, **không** link, không card `company` | §2.3 bỏ `type: company` khỏi scope (giữ field cho sau) |
| 11 | Arobid | 03/2025–02/2026, Frontend Developer, 6 bullet hiện tại **+ 1 bullet Mobile App React Native**; TradeXpo và VDA 2025 in công khai | §2.2 |
| 12 | Dcorp | 03/2024–02/2025, Frontend Developer, giữ nguyên 5 bullet; "Highlands Coffee (qua VTI)" in công khai | — |
| 13 | Accent | **Indigo trung tính**, override trong `apps/portfolio/src/globals.css` (`--primary`, `--primary-foreground`, `--ring`, `--accent`, `--accent-foreground`, `--selection`, `--selection-foreground`) cả `:root` lẫn `.dark`; hex chốt ở ticket, phải đo 4.5:1 | §5 phương án B |
| 14 | Font | System stack, giữ nguyên | — |
| 15 | Skills | 5 nhóm Frontend / Mobile / Backend / DevOps & CI / Tooling; **.NET in ở Backend** (sau Spring Boot) và trong bullet MedViet, **không** lên hero; Angular, Go không in | §2.4 |
| 16 | In CV | `@media print`, **không** PDF riêng | §5 |
| 17 | Hobbies / LinkedIn | Giữ Hobbies; thêm `linkedin` vào Contact | §2.5 |
| 18 | Ảnh | Giữ `avatar.jpg` cho hero | — |
| 19 | Logo MedViet | Lấy từ source `E:\MedViet` (web-emr / medviet) — file cụ thể ghi ở §9.1 | assets |
| 20 | `period` | **Giữ chuỗi dịch tay** ở hai locale | Bỏ hàng "(tuỳ) period → {from,to}" khỏi §8 |
| 21 | OG image | Sinh bằng `opengraph-image.tsx` (`ImageResponse`), **không** file `og-image.jpg` mới | §8 thay hàng "OG image mới" |
| 22 | Dock | Giữ Home · LinkedIn · GitHub · theme toggle; **không** anchor nav | — |
| 23 | Accordion Work | Chỉ row MedViet mở sẵn; chevron luôn hiện | §2.2 |
| 24 | Motion | Fade theo section + stagger card Projects; bỏ fade từng badge/dòng; `prefers-reduced-motion` cho fade, dock, wipe | §3 |
| 25 | Nơi lưu design | `docs/design/<topic>.md` — chốt cho cả chuỗi workflow, ghi vào `docs/guides/skills-workflow.md` | — |

Không có ADR nào từ vòng này: không quyết định nào vừa khó đảo ngược, vừa gây ngạc nhiên, vừa là trade-off thật (accent override ở app là một dòng CSS; print thay PDF đảo lại bất cứ lúc nào).

### 9.1 Logo MedViet — kết quả tìm trong source (FACT, agent quét `E:\MedViet` 2026-09-06)

- Không có asset nào tên "medviet". Brand trong `web-emr` là **DHS – Digital Health Solutions** (teal `#3AA6B9`); monorepo `medviet` chỉ có favicon mặc định của template.
- **Chọn:** `E:\MedViet\frontend\web-emr\public\img\logo\favicon.png` — 512×512 RGBA, app icon DHS, nền teal bo góc. Copy sang `apps/portfolio/src/assets/logos/medviet.png` (import, không `public/`). Trong vòng tròn 48 px của `ResumeCard` nền đặc không thành vấn đề.
- Bỏ qua: `logo.svg` (wordmark "mds" 77×24, quá dẹt), `IconMainLogo.tsx` (SVG inline, dead code, phải extract), các logo bệnh viện khách hàng (`division.png`, `BTH.png`, `TV.png` — không phải brand, không in).
- **Tên in giữ "MedViet"** (Q29) dù logo là DHS: MedViet là tên sản phẩm/monorepo, DHS là công ty; bullet không cần nhắc DHS.

---

## 10. Pre-delivery checklist cho `/code-review` (trục Standards bổ sung, web-only)

- [ ] Mọi section là Server Component trừ `BlurFade`, `Lens`, `ResumeCard`, dock, theme toggle (`nextjs#7`).
- [ ] `prefers-reduced-motion`: fade, dock, wipe, 👋 đều tĩnh (`ux#9`, `ux#99`).
- [ ] Không quá 2 element động trong một viewport khi cuộn (`ux#7`).
- [ ] Body ≥ 15 px, meta ≥ 14 px trên 375 px; không scroll ngang ở 375/768 (`ux#67`, `ux#69`).
- [ ] Contrast 4.5:1 cho `muted-foreground` và accent ở cả light/dark (`ux#36`).
- [ ] h1 → h2 → h3 tuần tự (`ux#39`); icon-only link có `aria-label` (`ux#40`).
- [ ] Focus không bị dock che: Tab tới link cuối Contact vẫn thấy ring (`ux#100`).
- [ ] Ảnh project có `width/height` hoặc `aspect-video`, `loading="lazy"`; avatar là LCP có priority (`nextjs#17`, `#18`, `#21`).
- [ ] Chip skill không phải control: không hover-lift, không `cursor-pointer` (`ux#117`).
- [ ] Print: dock ẩn, accordion mở, link hiện URL.
- [ ] Raw-HTML E2E: một bullet Work **và** một tên project có trong document trước JS.
- [ ] `bun run check && bun run typecheck && bun run test && bun run build` xanh; E2E portfolio chạy local (`bunx playwright test` từ `apps/portfolio`).
