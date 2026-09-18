# Design brief — responsive phone/tablet cho `apps/documents` (Prism, vòng 2)

> **Spec [#215](https://github.com/qtuan02/monorepo/issues/215)** (2026-09-18). Bản ghi *tại thời điểm chọn* của bước design (§7a CLAUDE.md). Hình dạng app sau khi implement đọc ở
> [`apps/documents/README.md`](../../apps/documents/README.md) § Hình dạng và CLAUDE.md §1, không phải ở đây.

- **Ngày:** 2026-09-18
- **Bước:** design, chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`,
  không `--persist`. App **đã có** theme và hình dạng (Prism, [`documents-redesign.md`](./documents-redesign.md)
  §10, ADR-0009) nên vòng này **không** đụng `colors.csv` / `typography.csv`: chỉ bố cục theo breakpoint.
- **Đầu vào:** bản build production của `apps/documents` trên `dev` (working tree 2026-09-18), `vite preview`
  trên 3103, chụp và đo bằng Playwright ở 320×568, 375×667, 414×896, 667×375 (landscape), 768×1024, 1024×768,
  `locale: vi-VN`, thêm 375 dark; đo cả en-US cho bề rộng nav pill.
- **Đầu ra:** tài liệu này + hai mockup HTML tĩnh trong [`documents-responsive/`](./documents-responsive/):
  `mockup-phone.html` (375 px: hiện trạng ↔ đề xuất cho danh sách, hero chi tiết, palette) và
  `mockup-tablet.html` (768 px: nav pill và `DocsSection`, hiện trạng ↔ đề xuất). Mockup là vật để chọn bằng mắt,
  không phải nguồn sự thật cho code.
- **Cách đọc trích dẫn:** `ux#NN` = hàng `No=NN` trong `.agents/skills/ui-ux-pro-max/data/ux-guidelines.csv`
  (grep `^NN,`); `QR §n` = mục Quick Reference trong SKILL.md khi hàng không có `No`. Rule của repo thắng CSV.

---

## 1. Chẩn đoán — "đã đẹp nhưng chưa responsive" là đúng ở đâu

Prism đã viết khá nhiều theo breakpoint: menu `Sheet` dưới `md`, lưới tile 1/2/4, hero chi tiết xếp dọc dưới
`sm`, capsule cài đặt gập tab lên trên lệnh, `<pre>` cuộn trong khối, khối hình backdrop ẩn dưới `md`. Trên
**phone dọc** (375/414) không có horizontal scroll (`scrollWidth == innerWidth` ở mọi trang) và không có target
nào dưới 24 px. Cái "chưa responsive" là **tablet dọc bị bỏ quên** và ba màn phone quá dài — sáu điểm, mỗi điểm
là số đo:

| # | Viewport | FACT đo được | Vi phạm |
|---|---|---|---|
| 1 | **768** | `scrollWidth = 815` trên 768 ở **mọi** trang — cả site cuộn ngang 47 px. Nav pill cao **70 px** thay vì 54: brand vỡ thành `@fe-` / `monorepo`, link "Bắt đầu" vỡ hai dòng, hai nút npm/Storybook có `right = 773` và `815` — ngoài màn. Cộng lại ở `md`: brand 152 + link 250 (vi) / 310 (en) + ô tìm `md:w-64` **256** + 4 nút 162 + gap ≈ 850 > 714 px lòng pill. Thủ phạm là ô tìm mở rộng ở `md` thay vì `lg` | `ux#69` (không cuộn ngang), `ux#116` (nhãn pill nguyên một dòng), `ux#113` (tên phân biệt phải đọc được trọn) |
| 2 | **768** | `DocsSection` `md:grid-cols-[260px_1fr]` → cột phải còn **374 px** trong panel 736; cả 5 snippet Getting Started cuộn ngang (`scrollWidth` 380 / 460 / 623 / 592 / 615). Ở 1024 cột phải 614 px, chỉ 2/5 cuộn nhẹ (623, 615) | `ux#21` (bề rộng nội dung), `ux#111` (token dài không được ép cuộn khi có chỗ) |
| 3 | **375** | `/components`: 63 tile × 122 px × 1 cột = trang **8 984 px** (ở 414: 8 936); `/hooks` 3 384 px cho 18 mục. Mỗi tile trả 38 px swatch + 12 px gap xếp dọc cho một dòng slug | QR §5 `content-priority`, `ux#66` (target to hơn chứ không phải cao hơn) |
| 4 | **375** | Palette `⌘K` là `CommandDialog` `top-1/3` (y = 222) với list `max-h-72` (288) → đáy ở ~560/667; bàn phím ảo iOS (~260 px) che gần hết kết quả. Hàng `alert-dialog`, `aspect-ratio` vỡ slug thành hai dòng vì subpath `ml-auto truncate` giữ chỗ | QR §9 `search-accessible`, `ux#116`, `ux#113` |
| 5 | **375** | Hero chi tiết: swatch `lg` 120 px xếp **trên** h1; panel hero từ y = 398 tới ~1 150 = **750 px** trong viewport 667 — người đọc phải cuộn qua một ô màu mới thấy dòng import | QR §5 `content-priority` |
| 6 | **320** | h1 landing `text-[2.5rem]` + `<br>` cứng → **4 dòng** (cao 163 px so với 82 ở 375), mồ côi "UI," và "file."; lead 18 px trên 288 px ≈ 30 ký tự/dòng | `ux#112` (chữ reflow theo bề rộng), `ux#65` (320 nằm trong bộ test) |

Ba thứ **không** phải lỗi, ghi để không ai "sửa": (a) `<pre>` cuộn ngang **bên trong** `CodeBlock` trên phone là
cố ý — một dòng `@import "@fe-monorepo/ui/globals.css"` không gập được, và `ux#111` chỉ cấm cuộn *trang*;
(b) landscape 667×375: pill 635 px chỉ mang brand + hai nút tròn, trông rỗng nhưng không tràn, h1 60 px vừa
viewport — không đụng; (c) tile rộng `md:col-span-2` và hover nhấc 3 px không dính trên touch (Tailwind v4 bọc
`hover:` trong `@media (hover: hover)`).

## 2. Ràng buộc UX chọn cho vòng này

- `ux#69` **Horizontal Scroll** — mở rộng seam: hôm nay E2E không đo `scrollWidth` ở viewport nào; thêm 320 /
  375 / 414 / **768** / 1024 (`ux#65`).
- `ux#116` **Compact Label Overflow** + `ux#113` **Essential Text Truncation** — brand, ba link nav, slug trong
  palette và trên tile là *tên phân biệt*: `whitespace-nowrap` hoặc gập ở gạch nối, không bao giờ vỡ giữa chữ.
- `ux#21` **Container Width** — cột code của `DocsSection` phải đủ cho snippet dài nhất (623 px) ở viewport
  nào đang hai cột.
- `ux#112` **Text Reflow** — display heading dùng `clamp()` thay cỡ cố định, không `<br>` cứng dưới `sm`.
- QR §5 `content-priority` — trên phone: slug + import trước, swatch và ô màu sau.
- QR §9 `search-accessible` — palette trên phone neo **đỉnh** màn hình để bàn phím ảo không che kết quả.
- `ux#22` **Touch Target Size** — nút tròn 36 px (`size-9`) đạt sàn web 24 px (`ux#104`) nhưng dưới 44 pt; chỉ
  nâng ở nơi ngón tay là đầu vào duy nhất — trong `Sheet` — không đụng pill.

Không chọn: `bottom-nav-limit` (site có ba mục và palette, không có điều hướng đáy); `virtualize-lists` (63 mục
không đủ để trả chi phí `react-virtuoso`, và row tile đã cắt trang còn một nửa).

## 3. Sáu điểm → hướng xử lý

Mỗi điểm có nhánh **lười** (ít diff nhất mà đúng) và nhánh **đủ**; khuyến nghị in đậm.

### 3.1 Nav pill tràn ở 768 (điểm 1) — **CẦN CHỦ REPO chọn A hay B**

- **A — ô tìm rộng từ `lg`, còn lại giữ `md` (khuyến nghị).** Trong `nav-pill.template.tsx`, ba class
  `md:w-64 md:justify-start md:gap-2.5 md:pr-2 md:pl-3.5` và hai `md:inline` (nhãn + `<kbd>`) đổi sang `lg:`.
  Ở `md` ô tìm là nút tròn như phone. Cộng lại ở 768: brand 156 + link 250/310 + tìm 36 + nút 162 + gap 30 =
  **634 (vi) / 694 (en) < 714** — vừa, en còn 20 px. Kèm `whitespace-nowrap` trên `NavBrand` text và mỗi
  `NavLinks` link (`ux#116`) để không lặp lại "Bắt / đầu" khi vừa sát. Diff: một file, ~6 class. Ở 1024 không
  đổi gì (tổng 914 < 958).
- **B — pill phone tới hết tablet dọc (`md:` → `lg:` toàn bộ).** Ba `hidden md:block` + `md:hidden` của
  `MobileMenu` đổi sang `lg`. Tablet dọc dùng menu `Sheet` như phone. Diff 4 class, không cần đo, nhưng 768 có
  đủ chỗ cho ba link và giấu đi thứ vừa ở `md` là bỏ phí một viewport phổ biến (iPad dọc).

Cả hai giữ `sticky top-4` và 54 px pill. Với A, nếu một ngôn ngữ mới dài hơn en, seam E2E ở §5 đỏ đúng chỗ.

### 3.2 `DocsSection` hai cột từ `md` (điểm 2)

- **Lười = đủ (khuyến nghị): hai cột từ `lg`.** `md:grid-cols-[260px_1fr] md:gap-7` → `lg:`. Ở 768 panel một
  cột: kicker + h2 + mô tả trên, snippet dưới với **~680 px** — cả 5 snippet hết cuộn (dài nhất 623). Ở 1024
  không đổi. Trang landing 768 từ 3 805 px lên ~4 100 px (mỗi panel thêm ~90 px) — đổi lấy không có khối code nào
  cuộn ngang trên tablet.
- Không chọn: `md:grid-cols-[200px_1fr]` (cột phải 434 — 3/5 vẫn cuộn), hay giảm `text-[13.5px]` của
  `CodeBlock` (14 px đã là sàn `ux#67` cho mono).

### 3.3 Danh sách 9 000 px trên phone (điểm 3)

- Lười: `grid-cols-2` ngay từ 375. Ô 161 px, nhưng `use-isomorphic-layout-effect` (28 ký tự mono 14 px ≈
  235 px) gập ba dòng ở gạch nối và `input-group`… vừa sát — và hook description ba dòng nữa. Không đủ.
- **Đủ (khuyến nghị): `Tile` là một *hàng* dưới `sm`.** `<Link>` thành `flex-row items-center gap-3` dưới `sm`,
  `sm:flex-col` trở lại tile dọc; `Swatch` `mb-3` → `max-sm:mb-0`; phần text bọc `min-w-0 flex-1` để preview
  vẫn `truncate`; số export ở góc giữ nguyên (`absolute top-3.5 right-3.5` vẫn đúng chỗ trên một hàng 64 px —
  hoặc đổi thành phần tử cuối hàng, `max-sm:static max-sm:ml-auto`). Hàng ≈ **64 px** thay vì 122 → `/components`
  từ 8 984 xuống ~5 200 px, `/hooks` (mô tả 2 dòng) ~4 000 → ~2 600. Swatch vẫn là chữ ký, chỉ đứng bên trái.
  `Tile` là một file, hai slice dùng chung nên tự có.
- Kèm **3 cột từ `md`** (`sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` trong `CatalogueList`): ở 768 tile
  232 px (1024 hôm nay 230, đã gập `use-isomorphic-layout-effect` ở gạch nối đúng như ảnh chụp) → trang từ
  6 204 xuống ~4 200 px. `md:col-span-2` của tile rộng vẫn đúng.

### 3.4 Palette trên phone (điểm 4)

- **Lười = đủ (khuyến nghị):** trên `className` của `CommandDialog` trong `search-palette.tsx` thêm
  `max-sm:top-4` (đã `translate-y-0`, `cn` merge `top-*` cùng họ nên thắng `top-1/3` của primitive); trên
  `CommandList` thêm `max-sm:max-h-[60dvh]` (`ux#20` — `dvh`, không `vh`); trong `CatalogueGroup` hàng:
  slug `whitespace-nowrap`, subpath `max-sm:hidden` — trên phone slug đã đủ phân biệt (`ux#113`), subpath là
  thứ trang chi tiết in lại ngay dòng đầu. Không đụng `packages/ui/command.tsx`.
- Không chọn: `Drawer` (bottom sheet) thay `CommandDialog` — thêm một primitive vào bundle cho một
  breakpoint, và `CommandDialog` neo đỉnh chính là hình dạng Spotlight/Raycast trên phone.

### 3.5 Hero chi tiết trên phone (điểm 5)

- Lười: `Swatch size="lg"` thêm `max-sm:size-20 max-sm:rounded-[24px]`. Bớt 40 px, vẫn xếp trên h1. Không đủ.
- **Đủ (khuyến nghị): dưới `sm` swatch đứng cạnh h1 trên một hàng.** `DetailHero` là `flex flex-col` dưới `sm`
  hôm nay; đổi phần đầu thành `grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4` **ở mọi breakpoint** —
  swatch cột 1, khối h1 + meta cột 2, hai action `col-span-2` (`sm:` như hiện tại, `lg:col-span-1` về cột 3).
  Swatch `max-sm:size-16 max-sm:rounded-[20px]` (64 px — cùng tỉ lệ 4:15 bo góc với 120/32). h1 `text-3xl`
  giữ. Panel hero từ 750 xuống ~**330 px**: swatch + slug + import + hai nút gọn trong màn đầu, còn chỗ cho
  kicker "Ví dụ". Từ `sm` bố cục cũ, một DOM cho mọi breakpoint, thứ tự đọc không đổi.
- Kèm: hai action dưới `sm` là `grid grid-cols-2` (mỗi nút ≥ 150 px rộng, `h-10`) thay vì hai hàng
  full-width — `ux#66`, và trang hook chỉ có một nút thì `col-span-2`.

### 3.6 Display heading ở 320 (điểm 6)

- **Lười = đủ:** `Hero` h1 `text-[2.5rem]` → `text-[clamp(2rem,10.5vw,2.5rem)]` (320 → 33.6 px, 375 → 39.4,
  từ 381 → 40) và `<br>` → `<br className="hidden sm:inline" />` để `text-balance` tự chia ba dòng đều dưới
  `sm` — gradient span là inline nên vẫn đổi màu đúng chữ; khoảng trắng trước `<br>` giữ để accessible name
  không dính. Lead `text-lg` → `text-base sm:text-lg`. `ListHeader` h1 cùng `clamp`. 320 cam kết "không tràn,
  không mồ côi" — không cam kết đẹp.

### 3.7 Hai thứ nhỏ, làm luôn trong cùng ticket

- **Ba card đếm ở 768** (`1.2fr 1fr 1fr` → 1fr = 225 px): "18 hook dùng chung" vỡ hai dòng lệch. `md:grid-cols-2`
  với card Storybook `md:col-span-2`, `lg:grid-cols-[1.2fr_1fr_1fr]` như cũ. Diff 3 class.
- **Sheet menu**: `NavActions` trong sheet là bốn nút tròn 36 px không nhãn nhìn thấy, trong khi sheet 288 px
  thừa chỗ (QR §9 `nav-label-icon`, `ux#22`). Thêm `layout: "pill" | "sheet"` cho `NavActions` như `NavLinks` đã
  có: `sheet` xếp dọc, mỗi control một hàng `h-11` icon + nhãn (nhãn lấy từ chính `aria-label` đang có —
  `documents.nav.npm`, `documents.nav.storybook`; theme toggle và ngôn ngữ giữ nguyên control, chỉ đặt cạnh nhãn).
  Không key catalogue mới. **Tuỳ chọn** — nếu chủ repo thấy đủ với `aria-label` + `title` thì bỏ.

## 4. Component map — không có gì mới

| Việc | File | Primitive |
|---|---|---|
| 3.1 | `features/layout/templates/nav-pill.template.tsx`, `components/nav/nav-brand.tsx`, `components/nav/nav-links.tsx` (`whitespace-nowrap`); B thêm `components/nav/mobile-menu.tsx` | `Button`, `Sheet` giữ |
| 3.2 | `components/page/docs-section.tsx` | `GlassPanel` giữ |
| 3.3 | `components/tile/tile.tsx`, `components/catalogue/catalogue-list.tsx` (3 cột `md`) | — |
| 3.4 | `features/layout/components/nav/search-palette.tsx` | `CommandDialog`, `CommandList` giữ, chỉ className |
| 3.5 | `components/detail/detail-hero.tsx`, `components/swatch/swatch.tsx` (nếu thêm cỡ) | `buttonVariants` giữ |
| 3.6 | `features/getting-started/components/hero.tsx`, `components/page/list-header.tsx` | — |
| 3.7 | `features/getting-started/components/catalogue-cards.tsx`, `features/layout/components/nav/nav-actions.tsx`, `mobile-menu.tsx` | — |

Không có composite mới trong `~/components`, không có primitive mới hay sửa trong `@monorepo/ui`, không đụng
`globals.css`.

## 5. Token delta, state, copy

- **Token:** không.
- **State:** không có state mới. `NavActions` nhận một prop layout (3.7, tuỳ chọn).
- **Copy cần dịch:** không. Nhãn trong sheet dùng lại `documents.nav.npm` / `documents.nav.storybook` đang là
  `aria-label`.
- **Seam test (thêm/đổi):**
  - `e2e/viewport.e2e.ts` (**mới**): với 320 / 375 / 414 / 768 / 1024 trên `/`, `/components`,
    `/components/dialog`: `document.documentElement.scrollWidth === innerWidth` (`ux#65`, `ux#69`) — đây là cái
    hôm nay không ai đo và 768 đang đỏ; `nav.boundingBox()` nằm trong viewport và `height ≤ 60` (pill không vỡ
    dòng) ở 768 **cả vi lẫn en** (`test.use({ locale })` hai lần — en là ngôn ngữ dài hơn).
  - Cùng file: ở 375 tile đầu của `/components` là một hàng — swatch và slug cùng `boundingBox().y` (±4) và tile
    `height < 80`; ở 768 lưới 3 cột (tile thứ 3 cùng `y` với tile 1, tile thứ 4 thấp hơn).
  - Cùng file: ở 375 mở palette bằng nút tìm, `getByRole("dialog").boundingBox().y < 40`.
  - `test/components/tile/tile.test.tsx` không đổi (DOM không đổi, chỉ class); `test/features/layout/**`
    không đổi.
  - `e2e/documents.e2e.ts` giữ nguyên: chạy trên Desktop Chrome 1280, không có điểm nào ở trên chạm tới.

## 6. Câu hỏi mở cho grill

1. **3.1 — A (ô tìm rộng từ `lg`, link vẫn từ `md`) hay B (pill phone tới hết 1023)?** A là khuyến nghị; B an
   toàn hơn cho ngôn ngữ thứ ba nhưng bỏ phí iPad dọc.
2. **3.3 — row tile dưới `sm` có làm "Tile" trong glossary cần một câu nữa không?** Đề xuất: thêm vào `CONTEXT.md`
   một mệnh đề "dưới `sm` là một hàng, swatch bên trái" — không đổi thuật ngữ.
3. **3.5 — swatch 64 px cạnh h1 trên phone, hay giữ 120 px và chấp nhận cuộn?** Khuyến nghị 64 — cùng chữ ký,
   vẫn nhận màu từ tile sang.
4. **3.7 sheet — có làm không?** Nếu có, `NavActions` thêm prop; nếu không, giữ icon-only.
5. **`ListHeader` trên 768**: `md:flex-row md:items-end` hiện đặt ô lọc cạnh h1 — có giữ, hay để ô lọc xuống dưới
   tới `lg`? Đo: ở 768 h1 387 px + lọc 336 px vừa 736, không vỡ. Khuyến nghị giữ.

## 7. Ngoài phạm vi

Không đổi palette, không đổi typography scale, không đổi backdrop, không thêm animation, không đụng
`packages/ui`. Không virtualize danh sách. Landscape phone không đụng. `prerender`/SEO không liên quan (SPA).

## 8. Chốt ở vòng grill — 2026-09-18

Ba vòng, 16 câu, mọi câu chọn phương án khuyến nghị. Glossary `apps/documents/CONTEXT.md` đã sửa cùng lúc:
**Tile** thêm mệnh đề "trên phone là một hàng, swatch bên trái — cùng bốn thành phần". Không ADR (Q12): mọi
quyết định là className theo breakpoint, đảo ngược trong một commit.

| # | Quyết định | Chốt |
|---|---|---|
| Q1 | Nav pill 768–1023 | **A** — ô tìm rộng (nhãn + `Ctrl K`) chỉ từ `lg`; ở `md` là nút tròn, ba link và bốn nút giữ `md`; `whitespace-nowrap` brand + link |
| Q2 | Tile dưới `sm` | **Một hàng**: swatch 36 px trái, slug + preview dọc giữa (`min-w-0`), số export cuối hàng; từ `sm` tile dọc như cũ |
| Q3 | Lưới danh sách | `sm:2 · md:3 · lg:4`, **cả hai** danh sách, trong `CatalogueList` |
| Q4 | `DocsSection` | **Hai cột từ `lg`**; 1024 để nguyên (2/5 snippet cuộn 9 px trong khối) |
| Q5 | Hero chi tiết phone | Grid `[auto_minmax(0,1fr)]` mọi breakpoint, swatch `max-sm:size-16 max-sm:rounded-[20px]`; **hai action xếp dọc full-width `h-10`, giữ nhãn** — không key catalogue mới |
| Q6 | Palette phone | `max-sm:top-4` (dialog) · `max-sm:max-h-[60dvh]` (list) · slug `whitespace-nowrap` · subpath `max-sm:hidden`; không đụng `packages/ui` |
| Q7 | 320 | h1 landing + `ListHeader` `text-[clamp(2rem,10.5vw,2.5rem)]`; `<br className="hidden sm:inline">`; lead `text-base sm:text-lg`. Cam kết "không tràn, không mồ côi", không cam kết đẹp |
| Q8 | Ba card 768 | `md:grid-cols-2`, Storybook `md:col-span-2`, `lg` giữ `1.2fr 1fr 1fr` |
| Q9 | Seam E2E | `e2e/viewport.e2e.ts` đủ (a)–(e) như §5; (b) chạy cả `vi-VN` lẫn `en-US` |
| Q10 | Sheet menu | **Làm, ticket riêng cuối cùng**: `NavActions` `layout: "pill" \| "sheet"`, sheet mỗi control một hàng `h-11` icon + nhãn từ `aria-label` sẵn có; cắt được nếu spec cần gọn |
| Q11 | `ListHeader` 768 | **Giữ** `md:flex-row md:items-end` |
| Q12 | ADR | **Không** |
| Q13 | Tile hook trên phone | Mô tả `line-clamp-2`, hàng cao tự nhiên (`min-h`, không khoá 64) — component vẫn 64 px |
| Q14 | E2E ở ticket nào | **Mỗi ticket nối assertion của mình vào cùng file**: tablet tạo file với (a)+(b), danh sách thêm (c)+(d), palette thêm (e) |
| Q15 | Cắt ticket | **5 ticket theo màn hình**: ① Tablet (Q1 Q4 Q8) · ② Danh sách (Q2 Q3 Q13) · ③ Chi tiết + palette phone (Q5 Q6) · ④ 320 + heading clamp (Q7) · ⑤ Sheet labels (Q10) |
| Q16 | Thứ tự | **① → ② → ③ chuỗi** (cùng ghi `viewport.e2e.ts`, GitHub dependency); ④ và ⑤ song song từ đầu, không đụng E2E |

Seam sau chốt (bổ sung §5): (c) đo tile **component** đầu tiên (`height < 80`), vì tile hook cao hơn theo Q13;
`test/components/tile/tile.test.tsx` và `test/features/layout/**` không đổi; `apps/documents/README.md`
§ Hình dạng và CLAUDE.md §1 (dòng `documents`) cập nhật ở ticket ①, ② hoặc một dòng cuối ở ticket ⑤.

## 9. Bước tiếp — spec #215

Spec đã đăng: [#215](https://github.com/qtuan02/monorepo/issues/215) (2026-09-18), năm ticket sub-issue:
① #216 tablet → ② #219 danh sách → ③ #220 chi tiết + palette (chuỗi, GitHub dependency); ④ #217 320 px và
⑤ #218 sheet labels độc lập. `/implement 216` bắt đầu.
