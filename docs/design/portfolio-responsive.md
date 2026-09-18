# Design brief — responsive phone/tablet cho `apps/portfolio` (vòng 3)

> **Đã implement, spec #210, tickets #211–#214** (2026-09-18). Bản ghi *tại thời điểm chọn* của bước design (§7a CLAUDE.md). Hình dạng app sau khi implement đọc ở
> [`apps/portfolio/README.md`](../../apps/portfolio/README.md) và CLAUDE.md §1, không phải ở đây.

- **Ngày:** 2026-09-18
- **Bước:** design, chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`,
  không `--persist`. App **đã có** theme và hình dạng (v2, [`portfolio-redesign-v2.md`](./portfolio-redesign-v2.md),
  ADR-0008) nên vòng này **không** đụng `colors.csv` / `typography.csv`: chỉ bố cục theo breakpoint.
- **Đầu vào:** code `apps/portfolio` trên `dev` (ca9ff52 + working tree), chụp bằng Playwright ở
  375×667, 375 dark, 667×375 (landscape), 768×1024, 1024×768 với `locale: vi-VN`.
- **Đầu ra:** tài liệu này + hai mockup HTML tĩnh trong [`portfolio-responsive/`](./portfolio-responsive/):
  `mockup-phone.html` (375 px: hiện trạng ↔ đề xuất, cạnh nhau) và `mockup-tablet.html` (768 px: một cột ↔ 3/2).
  Mockup là vật để chọn bằng mắt, không phải nguồn sự thật cho code.
- **Cách đọc trích dẫn:** `ux#NN` = hàng `No=NN` trong `.agents/skills/ui-ux-pro-max/data/ux-guidelines.csv`
  (grep `^NN,`). Rule của repo thắng CSV khi mâu thuẫn.

---

## 1. Chẩn đoán — "đã đẹp nhưng chưa responsive" là đúng ở đâu

Code v2 đã có `min-w-0`, `[overflow-wrap:anywhere]`, `flex-wrap`, hai cột từ `lg`, và
`e2e/viewport.e2e.ts` khoá `scrollWidth ≤ 375` — nên **không có horizontal scroll** ở bất kỳ viewport
nào (đo: 375/768/1024 đều `scrollWidth == innerWidth`). Cái "chưa responsive" là sáu điểm khác, mỗi
điểm là số đo chứ không phải cảm giác:

| # | Viewport | FACT đo được | Vi phạm |
|---|---|---|---|
| 1 | 375 | `<nav>` dock có `boundingBox.width = 403`, `x = −14` → cắt 14 px **mỗi bên**: nửa icon Home và chevron của select ngôn ngữ nằm ngoài màn. `position: fixed` không góp vào `scrollWidth`, nên spec hiện có vẫn xanh | `ux#17` (fixed element), `ux#69` (nội dung phải vừa viewport), `ux#104` (target bị cắt còn < 24 px) |
| 2 | 375 | Hero: avatar `size-20` (80 px) + `gap-5` chiếm 100/335 px của thân → cột chữ còn **183 px**; tên 2 dòng, positioning 4 dòng, 4 action vỡ thành 3 hàng lệch | `ux#66` (target trên mobile phải to hơn, không phải vỡ hàng), `ux#112` (chữ phải reflow theo bề rộng thật) |
| 3 | 375 | Work row: logo 48 + `gap-x-4` lấy 64 px của **mọi** dòng bullet → cột bullet 227 px, bullet dài nhất 10 dòng | `ux#73` (measure), `ux#112` |
| 4 | 375 | Link `Mã nguồn / Xem demo` trong Projects và link Contact: cao ≈ 20 px, cách nhau `gap-y-1` = 4 px khi xuống dòng | `ux#104` (≥ 24 CSS px), `ux#23` (≥ 8 px gap), `ux#22` |
| 5 | 768 | Một cột 720 px; `#about p` rộng 676 px ở 15 px sans ≈ 95–105 ký tự/dòng | `ux#73` (65–75 ký tự) |
| 6 | 667×375 | `sm:pt-24` (96 px) + dock 68 px + `mb-4` = **180/375 px** viewport là khoảng trống và chrome | `ux#17`, `ux#65` (test cả landscape) |

Hai thứ **không** phải lỗi, ghi để không ai "sửa": (a) hover-press của `StandardBlock` không dính trên
touch vì Tailwind v4 bọc `hover:` trong `@media (hover: hover)`; (b) 1024 px ngang đã là hai cột đúng
như v2, không đổi.

## 2. Ràng buộc UX chọn cho vòng này

- `ux#69` **Horizontal Scroll** — giữ; mở rộng seam: dock cũng phải nằm trong viewport (xem §5).
- `ux#17` **Fixed Positioning** — dock cố định phải tính safe-area và không đè nội dung: `pb-26` của `<main>`
  giữ, thêm `scroll-padding-bottom` cho focus (`ux#100`).
- `ux#104` **Target Size (Minimum)** + `ux#23` **Touch Spacing** — mọi link inline trên phone ≥ 24 px cao,
  cách nhau ≥ 8 px; dock đã 48 px (`e2e/dock.e2e.ts` đo).
- `ux#73` **Line Length** + `ux#112` **Text Reflow** — tablet dọc không được ~100 ký tự/dòng; phone không
  được nhường 64 px mỗi dòng cho một logo.
- `ux#65` **Breakpoint Testing** — 320 / 375 / 414 / 768 / 1024 + landscape. Spec hiện có thiếu 320 và landscape.
- `ux#20` **Viewport Units** — không đụng (`min-h-dvh` đã có ở body).

Không chọn: `bottom-nav-limit`/`nav-label-icon` (Quick Reference §9) — dock này là link ngoài + hai
control, không phải điều hướng trong app; và dưới 5 mục.

## 3. Sáu điểm → hướng xử lý

Mỗi điểm có nhánh **lười** (ít diff nhất mà đúng) và nhánh **đủ**; khuyến nghị in đậm.

### 3.1 Dock tràn viewport (điểm 1) — **CẦN CHỦ REPO chọn A hay B**

Cộng lại: 4 control × 48 + 6 gap × 8 + padding 16 + viền 4 + 2 separator × 10 + trigger ngôn ngữ ≈ 112
("Tiếng Việt" + chevron) = ~403 px.

- **A — thu gọn, giữ pill nổi.** Dưới `sm`: trigger ngôn ngữ chỉ hiện **mã** (`VI` / `EN`, `uppercase` của
  `locale` — không cần key catalogue mới), bỏ `mx-1` của separator. Còn ~343 px: vừa 375 và 360 (Android),
  **không** vừa 320 (`ux#65`). Diff: ~3 class + một nhánh render trong `SelectLanguage` (prop `compact`
  hoặc `sm:hidden`/`hidden sm:inline` hai span).
- **B — thanh đáy full-width trên phone (khuyến nghị).** Dưới `sm`: wrapper bỏ `mb-4`/`justify-center`,
  `Dock` thành `w-full justify-between border-x-0 border-b-0 shadow-none` (bóng lệch xuống-phải của một
  thanh chạm đáy rơi ra ngoài màn nên bỏ không mất gì), thêm `pb-[env(safe-area-inset-bottom)]` (`ux#17`);
  từ `sm` trở lại đúng pill hiện tại. Vẫn lấy nhãn ngắn `VI`/`EN` dưới `sm` để 320 còn chỗ
  (192 + 68 + 16 = 276 < 320). `<main>`'s `pb-26` giữ nguyên — thanh 68 px + safe-area vẫn dưới 104 px.
  Đây là hình dạng "một khối cứng chạm mép" hợp neubrutalist hơn một pill bị cắt.
  ~~Cần `viewport-fit=cover`~~ — **bỏ ở grill (Q8)**: `layout.tsx` không export `viewport`, mặc định
  `viewport-fit=auto` đã giữ viewport trong vùng an toàn nên thanh không bị home-indicator đè; `cover`
  chỉ để vẽ tràn xuống dưới indicator và kéo theo pad notch khi landscape. Không `env()`, không pad.

Cả hai đều giữ 48 px/target và `gap-2` mà `dock.e2e.ts` đo.

### 3.2 Hero bị avatar ép (điểm 2)

- Lười: `size-20` → `size-16` dưới `sm`. Cột chữ 199 px — vẫn ép. Không đủ.
- **Đủ (khuyến nghị): thân hero là một `grid grid-cols-[minmax(0,1fr)_auto]`**, avatar ở cột 2 **chỉ
  ngang hàng `$ whoami` + tên** (`row-span-1`), ba nhóm còn lại `col-span-2`; từ `sm` avatar
  `sm:row-span-4`, các nhóm `sm:col-span-1` → **đúng bố cục hiện tại**, một DOM cho mọi breakpoint,
  thứ tự đọc không đổi. Trên phone: positioning và current-job chạy hết 335 px; bốn action thành
  `grid grid-cols-2 sm:flex sm:flex-wrap` — 2×2 đều nhau, mỗi ô ≥ 160 px rộng, 32 px cao (`size="sm"`),
  target rộng hơn (`ux#66`), không còn hàng lẻ. Avatar giữ `size-20` — đủ nhận mặt, và nó chỉ chiếm
  chiều cao của tên.

### 3.3 Work row nhường 64 px mỗi dòng (điểm 3)

- Lười: `size-12` → `size-10` logo dưới `sm`. Lấy lại 8 px. Không đủ.
- **Đủ (khuyến nghị): cùng mẹo grid.** `StandardBlock` của row thành `grid grid-cols-[auto_minmax(0,1fr)]
  gap-x-4`; logo cột 1, `<h3>` (+ `sr-only` award) cột 2, **thân accordion `col-span-2 sm:col-start-2
  sm:col-span-1`**. Phone: bullet chạy 291 px (từ 227) → bullet dài nhất ~7 dòng thay vì 10; từ `sm`
  y hệt hiện tại. `ResumeCard` là một file, Education dùng lại nên tự có.

### 3.4 Link inline dưới 24 px (điểm 4)

- **Lười = đủ:** `linkClassName` của `ProjectRow` thêm `py-1.5 -my-1.5` (32 px hit-area, không đổi bố cục
  nhìn thấy) và `gap-y-1` → `gap-y-2` ở hàng link; Contact: `gap-y-2` → `gap-y-3` giữa các dòng và `py-1
  -my-1` trên `<a>`. Không đụng `text-sm` (14 px là sàn `ux#67` cho meta, `viewport.e2e.ts` đã khoá).

### 3.5 Tablet dọc ~100 ký tự/dòng (điểm 5) — **CẦN CHỦ REPO**

- Lười: `max-w-prose` cho `<p>` trong About/Projects/Work. Trong một khối `bg-card` full-width, chữ dừng ở
  2/3 rồi để trống — trông như lỗi. Không khuyến nghị.
- **Đủ (khuyến nghị): hai cột từ `md`, tỉ lệ 3/2** (`md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`, giữ
  `lg:` 2/1 như v2). 720 px → cột đọc 424 px (~55 ký tự ở 15 px sans — dưới sàn 65 một chút nhưng là
  measure của cột CV, không phải bài báo), rail 264 px. Kéo theo: `md:space-y-0`, `md:gap-x-8`, hero
  `md:col-span-2 md:mb-8`, rail `md:sticky md:top-6 md:self-start`; ô Contact/Hobbies
  `sm:grid-cols-[2fr_1fr]` phải về `md:grid-cols-1`; Skills `sm:grid-cols-[7.5rem_1fr]` phải về
  `md:grid-cols-1` (rail 264 px không đủ cho cột nhãn 120 px + list). Trang tablet từ 2982 px → ~2300 px.
  Rủi ro: rail 264 px làm Contact `sm:w-24` + email dài xuống dòng — đã xảy ra ở rail 1024 px hôm nay
  và chấp nhận được.
- Nếu chủ repo thấy 3/2 ở 768 quá chật: giữ một cột, chỉ đổi `md:text-base` cho prose (16 px → ~90 ký
  tự). Bớt chứ không hết.

### 3.6 Landscape phone (điểm 6)

- **Lười = đủ:** `sm:pt-24` → `md:pt-24` trên `<main>` (667 px không còn ăn 96 px đầu). Dock theo 3.1-B là
  thanh 68 px chạm đáy, không còn `mb-4`. Còn lại là chuyện của trình duyệt.

## 4. Component map — không có gì mới

| Việc | File | Primitive |
|---|---|---|
| 3.1 | `features/layout/templates/navbar.template.tsx`, `features/layout/components/dock.tsx`, `components/select/select-language.tsx` (nhãn ngắn), `app/[locale]/layout.tsx` (`viewport-fit`) | `Select` giữ, chỉ className |
| 3.2 | `features/home/components/hero-section.tsx` | `Avatar`, `buttonVariants` giữ |
| 3.3 | `features/home/components/resume-card.tsx` | `StandardBlock` giữ, thêm class grid ở call site |
| 3.4 | `project-row.tsx`, `contact-section.tsx` | — |
| 3.5 | `features/home/templates/home.template.tsx`, `skills-section.tsx` | — |
| 3.6 | `app/[locale]/(shell)/layout.tsx` | — |
| `ux#100` | `src/globals.css`: `html { scroll-padding-bottom: 6.5rem }` (dock + safe-area) | — |

Không có composite mới trong `~/components`, không có primitive mới trong `@monorepo/ui`.

## 5. Token delta, state, copy

- **Token:** không. Một dòng CSS `scroll-padding-bottom`, không phải token.
- **State:** không có state mới; `SelectLanguage` nhận thêm một cách hiển thị nhãn (compact dưới `sm`).
- **Copy cần dịch:** không. Mã ngôn ngữ ngắn lấy từ `locale.toUpperCase()`; `aria-label` của trigger
  vẫn là `language.placeholder`.
- **Seam test (đổi/thêm):**
  - `e2e/viewport.e2e.ts`: thêm "dock nằm trọn trong viewport" — `nav.boundingBox()` có `x ≥ 0` và
    `x + width ≤ innerWidth` ở **320**, 375, 414 (`ux#65`). Đây là cái hôm nay xanh sai.
  - `e2e/viewport.e2e.ts`: thêm 768 → hai cột (`aside` bên phải `#about`) nếu chọn 3.5 hai-cột; hôm nay spec
    khẳng định "dưới desktop là một cột" bằng 375, không phải 768, nên không mâu thuẫn.
  - `e2e/dock.e2e.ts` giữ nguyên 48 px / 8 px; chạy thêm ở 375 để thanh full-width cũng phải đạt.
  - `test/features/home/templates/home.template.test.tsx` (thứ tự section) không đổi — DOM không đổi.
  - Link ≥ 24 px: một `toBeGreaterThanOrEqual(24)` trên `boundingBox().height` của link đầu tiên trong
    `#projects` ở 375 — đủ, không cần đo hết.

## 6. Câu hỏi mở cho grill

1. **3.1 — A (pill thu gọn) hay B (thanh đáy full-width)?** B là khuyến nghị; A giữ nguyên "một pill" của
   v2 §6.4 nhưng bỏ 320 px.
2. **3.5 — hai cột từ 768 (3/2) hay giữ một cột và chịu measure dài?** Khuyến nghị hai cột.
3. **Nhãn `VI`/`EN`** dưới `sm` có ổn với chủ repo không, hay muốn icon cờ (đã có `vn.svg`/`gb.svg` trong
   Template Vite — portfolio không có, phải thêm asset)? Khuyến nghị mã chữ: không thêm asset, mono, đúng
   grammar terminal.
4. Landscape phone: chỉ sửa padding (3.6) hay còn muốn dock **ẩn khi cuộn xuống**? Khuyến nghị không:
   thêm state + effect cho một trường hợp hiếm.

## 7. Ngoài phạm vi

Không đổi palette, không đổi typography scale, không đổi print, không đổi OG. Không thêm animation.
`prerender`/SEO không liên quan. 320 px chỉ cam kết "không tràn" — không cam kết đẹp.

## 8. Chốt ở vòng grill — 2026-09-18

Ba vòng, 13 câu, mọi câu chọn phương án khuyến nghị. Glossary `apps/portfolio/CONTEXT.md` đã sửa
cùng lúc: **CV site** và **Rail** đổi ngưỡng sang `md`, **Lún** thêm ngoại lệ, thuật ngữ mới
**Thanh chạm đáy**. Không ADR: mọi quyết định là className theo breakpoint, đảo ngược trong một
commit, không có trade-off nào người sau cần được giải thích ngoài brief này.

| # | Quyết định | Chốt |
|---|---|---|
| Q1 | Dock trên phone | **B** — thanh chạm đáy full-width dưới `sm`; từ `sm` là pill nổi như v2 |
| Q2 | Nhãn select ngôn ngữ dưới `sm` | **Mã chữ** `VI`/`EN` từ `locale.toUpperCase()`; `aria-label` giữ `language.placeholder` |
| Q3 | Tablet dọc 768–1023 | **Hai cột 3/2 từ `md`**, `lg` giữ 2/1; Skills và Contact/Hobbies về một cột trong rail từ `md` |
| Q4 | Hero trên phone | **Grid**: avatar chỉ ngang hàng `$ whoami` + tên, ba nhóm dưới `col-span-2`, action lưới 2×2; từ `sm` bố cục cũ |
| Q5 | Work/Education row | **Grid**: thân accordion `col-span-2 sm:col-start-2` |
| Q6 | 320 px | **Cam kết "không tràn, không cắt"** — E2E đo dock trong viewport + `scrollWidth` ở 320/375/414. Không cam kết đẹp |
| Q7 | Landscape phone | **Chỉ padding**: `sm:pt-24` → `md:pt-24`; không dock ẩn khi cuộn |
| Q8 | Safe-area | **Không** `viewport-fit=cover`, không `env()` |
| Q9 | Lún của thanh dock | **Chỉ từ `sm`**; dưới `sm` thanh không dịch; control vẫn lún 1 px khi bấm |
| Q11 | Rail ở `md` | **Sticky từ `md`** — một hành vi Rail |
| Q14 | Nút hero trên phone | **`h-10` dưới `sm`, `h-8` từ `sm`** trên className, không đụng primitive |
| Q15 | Link inline (Projects, Contact) | **`py-1.5 -my-1.5` + `gap-y-2`** ở mọi breakpoint, chữ giữ 14 px |
| Q16 | Focus dưới thanh dock | **`html { scroll-padding-bottom: 6rem }`** trong `globals.css` |

Ngưỡng đổi hình của dock là `sm` (640): tablet dọc 768 và phone landscape 667 đều đủ chỗ cho pill
403 px, nên chỉ phone dọc mới thấy thanh chạm đáy.

Seam test sau chốt (bổ sung §5): `viewport.e2e.ts` thêm 320 và 414 vào bộ "không tràn", thêm "dock
`boundingBox` nằm trong viewport" ở cả ba, thêm "768 là hai cột" (aside bên phải `#about`); `dock.e2e.ts`
chạy thêm ở 375 để thanh full-width vẫn đạt 48 px/8 px; `test/features/home/templates/home.template.test.tsx`
không đổi. `apps/portfolio/README.md` § Hình dạng và CLAUDE.md §1 cập nhật khi implement.

## 9. Bước tiếp

`/to-spec` cùng phiên → một issue `spec` trên `qtuan02/monorepo`, ticket là sub-issue.
