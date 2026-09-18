# Design brief — redesign UI/UX `apps/documents`

> **Đã implement, spec #128** (tickets #131, #132, #136, #134, #135 merge vào `dev` 2026-09-16 → 2026-09-17; #138 là tổng kiểm + tài liệu này). Tài liệu này giữ nguyên nội dung quyết định của bước design — ba vòng, hướng D "Prism" §2c, 22 quyết định §10; nó là bản ghi *tại thời điểm quyết*, không phải mô tả app hiện tại. Hình dạng app sau redesign đọc ở [`apps/documents/README.md`](../../apps/documents/README.md) § Hình dạng và CLAUDE.md §1; quyết định kiến trúc (override toàn bộ palette ở tầng app) ghi thành [ADR-0009](../adr/0009-documents-prism-palette-override.md). Hai điểm đáng ghi: ngưỡng tile rộng là **10** export như §10 hàng 7, không phải ≥ 8 của §2c (#135); và Locale message `exportCount` không bị bỏ hẳn mà thành `detail.exportSummary` — dòng meta của hero chi tiết vẫn cần "· 10 export" (#136, #138).

- **Ngày:** 2026-09-16
- **Bước:** design, chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`, không `--persist`, vòng 1–2 không dùng `colors.csv`/`typography.csv` (app đã có `tooling/tailwind/theme.css`); vòng 3 dùng cả hai vì chủ repo yêu cầu **palette riêng** thay teal EMR — đúng trường hợp "app chưa có brand" của §7a.
- **Đầu vào:** code `apps/documents` tại `51ab2b1`, `tooling/tailwind/theme.css`, `packages/ui/src/components/*` (surface primitive), `packages/i18n/src/locales/vi.json` (namespace `documents.*`), `apps/documents/e2e/documents.e2e.ts` + `test/**` (những gì đang được pin).
- **Đầu ra:** tài liệu này + ba mockup HTML tĩnh trong [`docs/design/documents-redesign/`](./documents-redesign/) — vòng 1 (hướng 0, bị từ chối), vòng 2 (A/B/C, §2b, bị từ chối) và vòng 3 (**hướng D Prism**, §2c). Bản ghi tại thời điểm chọn, không phải nguồn sự thật; hình dạng app sau khi ship đọc ở README của app.
- **Cách đọc trích dẫn:** `products#NN`, `styles#NN`, `ui-reasoning#NN`, `ux#NN`, `shadcn#NN` = hàng `No=NN` trong file cùng tên dưới `.agents/skills/ui-ux-pro-max/data/` (`ux` = `ux-guidelines.csv`, `shadcn` = `stacks/shadcn.csv`). Grep bằng `^NN,`.

---

## 1. Chẩn đoán — vì sao site trông "chưa được design"

Sáu điểm, xếp theo tác động. Tất cả là **FACT** đọc từ code, không phải cảm tính.

### 1.1 `font-mono` đang không render mono — lỗi cấu hình, không phải lỗi thiết kế

`theme.css` map `--font-mono: var(--font-mono)` vào một biến **app phải tự khai**. `apps/portfolio/src/globals.css` khai; `apps/documents/src/globals.css` **không** (chỉ có `@import` + `@source`). Hệ quả: mọi `font-mono` trong site — slug ở sidebar, brand `@fe-monorepo`, badge subpath, bảng peer, bảng export — compile ra `font-family: var(--font-mono)` không resolve được → **kế thừa sans**. Chỉ `<pre><code>` còn mono nhờ UA stylesheet.

`products#17` (Design System/Component Library) yêu cầu *"Clear hierarchy + code-like structure"*, `ui-reasoning#17` yêu cầu *"Monospace + Clear typography"*. Site đã viết đúng class cho điều đó và đang mất trắng vì thiếu ba dòng CSS. **Sửa cái này trước, rẻ nhất, thấy ngay.**

### 1.2 Thanh header teal đặc là thứ ồn nhất trang, và không mang thông tin

`header.template.tsx` là `bg-primary text-primary-foreground` — vỏ app-shell của sản phẩm EMR bê sang site tài liệu. Ba bề mặt xếp chồng: teal (header) / trắng (sidebar) / xám `#f8f8f9` (trang). `styles#1` (Minimalism & Swiss) và `styles#50` (Swiss Modernism 2.0) cùng nói: *"single vibrant accent, accent for emphasis only"*; `products#30` (Documentation): *"Clean hierarchy + minimal color"*.

Bằng chứng code cho thấy thanh teal đang bị chống lại chứ không được thiết kế: `header-external-links.tsx` khai `iconLinkClassName` để ghi đè `hover:bg-accent` của primitive *"vì nó washes out on the primary bar"*; `SidebarTrigger` và `SelectLanguage` mỗi cái cõng 3–5 class ghi đè màu. Bỏ thanh teal = **xoá** bốn cụm override đó.

### 1.3 Card ở `/components` lặp cùng một thông tin ba lần

`component-card.tsx` render: `button` (slug) → `components/button` (subpath = `components/` + slug) → badge `2 export`. Dòng hai là dòng một thêm tiền tố; dòng ba là một con số không ai lọc theo. 63 card × 3 dòng như nhau = một lưới không có gì để mắt bám vào. `description` của cả 63 entry là `null` (generator không tìm thấy JSDoc), nên card **không có** câu mô tả để bù.

Thứ card *có thể* mang mà sidebar không mang: **danh sách export** (`Button, buttonVariants`). Đó là câu trả lời cho câu hỏi thật của người đọc — "file này export gì?" — trước cả khi mở trang.

### 1.4 Trang chi tiết nói slug bốn lần và danh sách export hai lần

`component-detail.template.tsx`: h1 `button` → badge `components/button` → section **Import** (`import { Button, buttonVariants } from ".../button"`) → section **Export** (bảng một cột: `Button`, `buttonVariants`) → section **Demo** (một nút) → link "Về danh sách". Ba `h2` cùng cỡ cho ba khối mà một khối là một nút. Bảng export **là** dòng import viết dọc.

Bảng vẫn đáng giữ (E2E + unit test pin `role="cell"`, và screen reader điều hướng theo bảng tốt hơn theo một dòng code), nhưng section **Demo** không đáng một `h2` — nó là **action** của trang, thuộc về title band.

### 1.5 Không có skip link trên trang có 71 link trước nội dung

Sidebar liệt kê 3 section + 63 primitive + 5 hook = 71 link, đứng trước `<main>` trong DOM. `ux#45` (Skip Links, Medium): *"No skip link on nav-heavy pages → 100 tabs to reach content"*. `styles#8` (Accessible & Ethical) liệt kê skip link trong bộ hiệu ứng bắt buộc. `ux#41` (Keyboard Navigation, High).

### 1.6 Sidebar 71 link không có ô tìm; bộ lọc chỉ có ở hai trang danh sách

`ui-reasoning#17` `must_have: constraint:search`; `ui-reasoning#30` `constraint:search-first`; `products#167` (Wiki/Reference) *"Table of contents sidebar + search"*. Sidebar hôm nay là TOC đúng nghĩa nhưng người đọc đang ở trang `button` muốn nhảy sang `dialog` phải cuộn 63 dòng hoặc quay về `/components` để lọc. `SidebarInput` đã được `sidebar.tsx` export và `~/utils/filter-catalogue.ts` đã có — hai nửa của tính năng đang nằm sẵn ở hai chỗ.

### Những chỗ nhỏ hơn, ghi để ticket không bỏ sót

| Chỗ | FACT | Nguồn |
|---|---|---|
| `not-found.tsx` | `text-gray-800`, `bg-white`, gradient text, SVG inline có `stroke="#1E1E1E"` — class màu thô ngoài token, vỡ ở dark theme | `quality-styling-tailwind`, `shadcn#4` |
| Empty state khi lọc rỗng | một `<p>` xám giữa trang, không có action | `ux#79`, `ux#90` (*"Try X instead"*, action *xoá bộ lọc*) |
| Mô tả section/trang | `text-sm` (14px) cho **prose** — trang tài liệu đọc nhiều | `ux#67` (16px body trên mobile), `ux#72` |
| `max-w-3xl` cho đoạn văn | 48rem ≈ 90 ký tự ở 15px | `ux#73`/`ux#21` (65–75ch → `max-w-prose`) |
| Cảnh báo `@source` ở Getting Started | tô bằng `destructive` (đỏ = lỗi) cho một **cảnh báo** | theme có `--warning`; `ux#37` màu phải đi kèm icon/chữ |
| `CodeBlock` | `bg-muted` trong khi theme khai riêng `--code` / `--code-foreground` / `--code-highlight` cho đúng việc này | `shadcn#4` |
| Footer | `FooterViewportSize` (nhãn `Mobile/Tablet/Window 1440×900`) là widget triage của app nội bộ, thừa với consumer npm | YAGNI |
| Viền card | `--border #f0f0f0` trên nền `#f8f8f9` gần vô hình; theme đã có `--input #e3e3e3` *"a step darker so fields read on the tinted bg"* | dùng token có sẵn, **không** override neutral (đó là đặc quyền riêng của `portfolio`, ADR-0008) |

---

## 2. Hướng — vòng 1 bị từ chối, vòng 2 đưa ba hướng

### 2.0 Hướng 0 (2026-09-16, **bị chủ repo từ chối**: *"design không đẹp lắm, khác đi"*)

Vòng 1 đọc `products#17`/`#30` → Minimalism & Swiss + Accessible, và đề xuất *giữ nguyên hình dạng, sửa lặp và sửa lỗi* (§3 dưới). Đúng nhưng không đẹp — cùng lỗi v1 của portfolio (`portfolio-redesign-v2.md` §1.2): tối giản hiểu thành *ít thứ*, và ít thứ không tự thành thiết kế. Mockup vòng 1 ([`documents-redesign/mockup-v1-huong-0.html`](./documents-redesign/mockup-v1-huong-0.html)) trông như bản hiện tại bớt teal. Giữ lại §3 làm **lớp nền dùng chung** (skip link, ô tìm sidebar, card mang export, action lên title band) — ba hướng dưới đều đứng trên nó — nhưng hình dạng thị giác lấy từ §2b.

### 2b. Ba hướng — khác nhau ở bề mặt và hình dạng, không phải ở token

Mockup: [`documents-redesign/mockup-v2-ba-huong.html`](./documents-redesign/mockup-v2-ba-huong.html) (commit trong repo, mở bằng trình duyệt), ba frame cùng trang Getting Started. Ba hướng cùng giữ: `ROUTES`, sidebar TOC, Storybook là nơi duy nhất có preview, không HTTP, không store.

#### Hướng A — Midnight (dark-first developer docs)

`styles#7` Dark Mode (OLED) + `products#81` Developer Tool (*"Dark syntax theme + Blue focus"*) + `products#163` API Developer Portal (*"Dark code theme + Brand accent + Syntax colors"*). `ui-reasoning#81` anti-pattern: *"Light mode default"* cho dev tool.

- Toàn site chạy **`.dark` mặc định** — theme đã có đủ token, `--primary #75cdc0` là nguồn sáng duy nhất: brand tile có glow nhẹ (`styles#7`: *"Minimal glow text-shadow 0 0 10px"*), nav active có gạch teal trái + nền teal 8%, một radial-gradient teal mờ sau hero.
- Hero: tag pill `v1.0.0 · ESM only · React 19`, headline 44px hai dòng với một cụm teal, lead 17px, rồi **một cửa sổ terminal** (thanh ba chấm + tab bun/npm/pnpm + lệnh cài) là CTA duy nhất. Dưới hero: ba **stat tile** `63 / 5 / 0 root entry`.
- Code block dùng `--code`/`--code-highlight` và **tô màu tối thiểu** (string / keyword / comment — ba màu, không cần highlighter: snippet là hằng, tô bằng `<span>` lúc viết). Card primitive: viền trên gradient teal khi hover.
- Ô tìm ở header với `Kbd ⌘K` → hướng này **có** `CommandDialog` (`shadcn#22`): search-first là idiom của docs dark.
- **Được:** trông như docs của một library thật (Vercel/Radix/shadcn); teal của EMR ở dark đẹp hơn ở light; syntax color cho code có chỗ đứng. **Mất:** cần toggle sáng/tối (25 dòng, `localStorage` + class `.dark` lên `<html>`, không store) và kiểm tra contrast dark riêng (`ux#36`); in ra giấy xấu (không ai in docs này).

#### Hướng B — Journal (editorial Swiss)

`styles#66` Editorial Grid + `styles#50` Swiss Modernism 2.0 + một nhúm `styles#47` Exaggerated Minimalism (*"oversized typography, single vibrant accent"*). `products#167` Wiki: *"heading hierarchy + citation grey + TOC sidebar"*.

- **Masthead** thay header app-shell: tên site chữ nhỏ in hoa giãn chữ trên, `@fe-monorepo` 22px dưới, nav ở giữa in hoa, meta version bên phải, **đường kẻ 2px đen** cắt ngang. Không có thanh màu, không có tile.
- Headline `clamp(48px, 6vw, 84px)` weight 800 tracking −.045em, tối đa 11ch: *"Hai gói, không có root entry."* Dưới nó một **deck** hai cột: đoạn dẫn 18px có drop cap, bên phải ba **con số 64px** `63 / 05 / 00`.
- Section = lưới `96px | 1fr`: số thứ tự **40px teal weight 800** bên trái, `h2` 26px + prose 16px `max-w-60ch` bên phải, hairline giữa các section. Code block là **đoạn trích** — không nền, viền trái 3px đen — vì trang này là giấy.
- Sidebar là mục lục báo: nhãn in hoa 10.5px giãn .16em có hairline dưới, mỗi slug kèm **số export tabular** bên phải.
- **Được:** khác hẳn mọi docs site đang có; typography làm hết việc, không cần một token màu mới; in ra đẹp. **Mất:** cần **mực đen** — `--foreground #3d4c63` của theme làm giấy trắng trông mờ, nên hướng này cần override `--foreground`/`--border` ở tầng app **giống portfolio** (ADR-0008 đang nói portfolio là app duy nhất làm vậy → phải mở lại ADR hoặc ghi ADR-0009); và người đọc là dev, không phải độc giả tạp chí — có thể thấy "màu mè ngược".

#### Hướng C — Bento (showcase theo ô)

`styles#39` Bento Box Grid + `landing#28` Bento Grid Showcase (*"Hero > Bento Grid > Detail Cards > CTA; scannable value props; mobile stack"*). `products#17` landing pattern *"Feature-Rich Showcase"*.

- Nền `#f2f2f4`, header **không có thanh**: brand là một pill trắng có bóng, nav là pill segmented (ô đang chọn nền đen), bốn control tròn bên phải.
- Trang Getting Started là **lưới 6 cột, hàng 150px**: ô hero 4×2 (headline 40px + lệnh cài trong một capsule có tab), ô teal 2×1 với số **72px** `63 primitive` và mũi tên ↗, ô đen 2×1 `5 hook`, ô tối 3×2 chứa snippet stylesheet (tô ba màu như A), ô peer với chip, ô Storybook CTA, ô "hay dùng" là dải chip slug. Bo `22px`, bóng hai lớp mềm, hover `scale(1.02)` (`styles#39`), tắt dưới `prefers-reduced-motion`.
- `/components`: bento tiếp — ô to hơn cho primitive nhiều export (`alert-dialog` 12 export = 2×1), ô thường 1×1; hoặc giữ lưới đều nếu thấy loạn (`styles#39` anti: *"dense data tables"*, mà 63 ô là gần ranh giới đó).
- **Được:** "đẹp" theo nghĩa phổ thông nhất, thấy ngay ở màn đầu; ô teal/ô đen tạo tương phản mà không cần override token. **Mất:** trang chi tiết (`/components/button`) không có gì để bento — hướng này đẹp ở landing rồi rơi về hướng 0 ở 68 trang còn lại, trừ khi chi tiết cũng chia ô (Import ô, Export ô, Storybook ô) — làm được, xem §3.3; radius 22px lệch khỏi `--radius 0.625rem` của theme → một token `--radius` override ở app (một dòng, như portfolio đặt `0px`).

#### So nhanh

| | A Midnight | B Journal | C Bento |
|---|---|---|---|
| Token delta | fonts + `.dark` mặc định | fonts + **override neutral** (cần ADR) | fonts + `--radius` |
| Việc ngoài §3 | toggle theme, `CommandDialog`, tô màu snippet | masthead, deck, số section to | bento grid landing + list, tile variants |
| Mobile | như hiện tại | masthead xếp dọc, số nhỏ lại | ô xếp một cột (`landing#28`) |
| Trang chi tiết có "được" gì không | có — terminal + syntax color | có — số to, hairline | ít — cần chia ô |
| Rủi ro | contrast dark | ADR-0008, "màu mè ngược" | 63 ô loạn |

Khuyến nghị của bước design: **A** — là idiom đúng của loại sản phẩm này (`ui-reasoning#81`/`#163`), tận dụng `.dark` đã có sẵn trong theme mà chưa app nào dùng, và đẹp đều trên cả 68 trang chứ không chỉ landing. B nếu chủ repo muốn site "không giống ai"; C nếu ưu tiên ấn tượng màn đầu.

> **Kết quả vòng 2 (2026-09-16):** chủ repo chọn B lúc đầu, rồi rút lại — *"các bản trước tôi chưa thích lắm"*. Hỏi lại hai câu, câu trả lời định hình vòng 3: **(1)** chất muốn có = kính mờ + gradient (Apple/Linear), chiều sâu nhiều tầng bóng, và một chút màu/hình học (Bauhaus/Memphis); **(2)** bốn bản trước hỏng vì **layout vẫn là sidebar + nội dung** và **palette teal EMR không hợp**. Hai điều đó loại cả bốn: hướng 0/A/B/C đều giữ sidebar cố định, và ba trong bốn giữ teal.

### 2c. Vòng 3 — Hướng D "Prism" (2026-09-16)

Mockup: [`documents-redesign/mockup-v3-prism.html`](./documents-redesign/mockup-v3-prism.html) — ba frame: landing, danh sách với ⌘K đang mở, trang chi tiết.

**Tổ hợp style** (mỗi cái trả lời một ý của chủ repo):

| Ý | Hàng CSV | Lấy gì |
|---|---|---|
| Kính mờ + gradient | `styles#3` Glassmorphism | *backdrop blur 10–20px, viền 1px trắng 0.2, phản chiếu, Z-depth*; nền phía sau phải *vibrant* — kính trên nền phẳng là kính vô nghĩa |
| Aurora phía sau | `styles#65` Gradient Mesh / Aurora | *multi-stop, iridescent* cho **hero và nền**, và chính hàng đó cảnh báo *"avoid: text-heavy content"* → aurora chỉ ở phần trên, **tan dần về nền phẳng** trước khi tới đoạn văn |
| Chiều sâu, sang | `styles#46` Dimensional Layering | *elevation 4 mức, backdrop-filter, highlight cho tầng trên* → bốn bóng đặt tên `--sh-1…4`, panel nào cũng cùng thang |
| Màu, hình học | `styles#69` Bauhaus + `styles#44` Memphis | vòng tròn vàng, ô vuông hồng xoay, tam giác cyan, lưới chấm, sọc lime — **năm khối, opacity thấp, sau lớp kính**, không bao giờ đè lên chữ. `styles#69` nói *"avoid: data-heavy"* nên hình chỉ là nền, không phải thành phần |
| Không sidebar | `ux#89`/`ux#90` Search, `shadcn#22` Command | **⌘K `CommandDialog`** là điều hướng chính vào 68 trang; nav kính chỉ mang ba mục; trang chi tiết có **trước/sau theo bảng chữ cái** thay cho danh sách bên |
| Bố cục landing | `landing#28` Bento Grid Showcase + `landing#32` Hero-Centric | hero giữa → ba card nổi (63 / 5 / Storybook) → các section là panel kính đánh số `01 / 05` |

**Palette riêng — override ở tầng app, không đụng `theme.css`.** Join `products#17` → `colors#17` (Design System/Component Library: *"Indigo brand + doc hierarchy"*): primary `#4F46E5`, secondary `#6366F1`, accent `#EA580C`, background `#EEF2FF`, foreground `#312E81`, card `#FFFFFF`, muted `#EBEEF8` / `#475569`, border `#C7D2FE`, ring `#4F46E5`. Aurora và swatch lấy thêm bốn stop từ `styles#3`/`#65`/`#44`: violet `#8B5CF6`, cyan `#22D3EE`, pink `#F472B6`, amber `#FBBF24` (+ lime `#A3E635` cho sọc). Status colors giữ của theme. Đây là app **thứ hai** override palette dùng chung sau `portfolio` — và lần này override **toàn bộ accent + neutral**, không chỉ neutral → cần ADR (xem §9.5).

**Bố cục từng màn:**

- **Shell.** Không `Sidebar`. Một `nav` **pill kính** nổi, `sticky top-4`, giữa trang, `max-w-[980px]`: brand (ô conic-gradient 30px) · ba link (mục đang mở = nền `foreground`, chữ trắng) · ô tìm giả (`⌘K`, mở `CommandDialog`) · ba nút tròn (ngôn ngữ, npm, Storybook). Mobile: pill co còn brand + ô tìm + một nút menu mở `Sheet`. Skip link giữ. Aurora + năm khối hình học là `position:absolute` trong một `div aria-hidden` ở `LayoutTemplate`, cường độ giảm theo trang (landing đậm, list/detail nhạt).
- **Landing.** Hero căn giữa: tag pill kính (`v1.0.0 · ESM · React 19`), h1 60px weight 800 tracking −.04em với dòng hai **gradient text** indigo→violet→pink→accent, lead 18px, và **capsule lệnh cài** kính đậm (tab bun/npm/pnpm + lệnh + nút copy tròn đen). Dưới đó **ba card nổi** cùng hàng: `63 primitive` (swatch conic indigo/cyan), `5 hook` (swatch pink/amber), và card thứ ba **đặc indigo** làm CTA Storybook. Rồi các section là **panel kính** lưới `260px | 1fr`: cột trái `01 / 05` mono indigo + h2 + mô tả, cột phải code block **nền indigo đậm** (`#312E81` 94%) chữ `#E0E7FF`, string cyan, keyword violet; cảnh báo `@source` nền amber 22%.
- **Danh sách.** Lưới **4 cột** tile kính; mỗi tile: **swatch gradient 38px** (hue sinh từ hash slug, `style={{"--h": n}}` — giá trị runtime, đúng ngoại lệ của `quality-styling-tailwind`), slug mono 600, một dòng export, số export ở góc. Tile **rộng 2 cột** cho primitive ≥ 8 export (18 cái: `sidebar` 24, `combobox`/`menubar` 16, …) — lưới bất đối xứng của `styles#39` nhưng quy tắc là **dữ liệu**, không tay xếp. Hover: nhấc 3px + bóng tầng 4. Lọc rỗng → `Empty` trên panel kính.
- **Chi tiết.** Thanh công cụ kính: `Component / dialog` + hai nút `← date-picker` `direction →` (trước/sau trong catalogue đã sort). Hero kính đậm: swatch 120px bo 32 · h1 slug mono 44px · meta `@fe-monorepo/ui/components/dialog · 10 export` · hai action dọc bên phải (Storybook đen đặc, npm kính). Dưới: hai panel cạnh nhau `1.25fr | 1fr` — **Import** (code block indigo) và **Export** (chip mono trên nền trắng; `Table` không còn — xem §9.6).
- **Dark mode.** `styles#3` cảnh báo *"dark text on dark"*: kính tối là `rgba(17,16,40,.55)` trên nền `#0B0A1F`, aurora giảm opacity một nửa, chữ `#E0E7FF`. Có toggle (25 dòng `localStorage` + class `.dark`) — là **phần của hướng**, không còn là câu hỏi mở.
- **Motion.** Aurora trôi rất chậm (`60s`, `transform` only) và hover nhấc tile 200ms — hai thứ duy nhất; cả hai tắt dưới `prefers-reduced-motion` (`ux#9`). Không stagger, không parallax.
- **Chữ.** Sans geometric cho display (Outfit — `typography#11` Geometric Modern, hợp vòng tròn/ô vuông Bauhaus), sans hệ thống cho prose, JetBrains Mono (`typography#9` Developer Mono) cho mọi thứ là mã. Hai gói `@fontsource-variable/*` import từ `globals.css` (`quality-imports` § Webfonts) — offline lúc build, không Google Fonts runtime. Mockup dùng system stack vì quy ước mockup không font ngoài; chữ thật đậm hơn mockup.

**Giá phải trả, nói trước:**

- Kính + blur là hiệu ứng **có điều kiện** (`styles#3`: *risk:conditional, contrast-text-4.5*): mọi chữ trên panel kính phải đo trên nền aurora *tệ nhất* (chỗ blob pink/amber), không phải trên nền `#EEF2FF`. Panel 58% trắng + blur 18px cho nền hiệu dụng ≥ `#E8E8F4`; `#312E81` trên đó ≈ 9:1, `#475569` ≈ 5.2:1 — đủ, nhưng test `globals.test.ts` kiểu portfolio phải đo cặp này.
- `backdrop-filter` trên 63 tile cùng lúc là cost GPU (`styles#14`: *drivers: blur*); tile dùng kính **mờ ít** (blur 8px) hoặc chỉ hero/nav/panel lớn dùng blur 18px. Quyết ở ticket, đo ở Storybook/E2E, không đoán.
- `--radius` của theme là `0.625rem`; hướng này dùng `18px` panel, `999px` pill, `32px` swatch → override `--radius: 1.125rem` một dòng (như portfolio đặt `0px`), pill/swatch viết className.
- Hai app override palette khiến câu *"portfolio là app duy nhất override neutral"* trong ADR-0008 sai — không sửa ADR-0008 (nó ghi đúng thời điểm của nó), viết **ADR-0009** cho `documents` với lý do riêng: site tài liệu cho gói npm public không nên mặc brand của một sản phẩm EMR nội bộ.

---

## 3. Lớp nền dùng chung (từ vòng 1) — bố cục từng màn

> Ba hướng §2b đều đứng trên các sửa đổi dưới đây; mockup vòng 1 vẽ chúng ở dạng trần. Hướng được chọn sẽ phủ bề mặt của nó lên.

### 3.1 Shell — header trung tính, sidebar có ô tìm, skip link

```
┌─ skip link (chỉ hiện khi focus) ─────────────────────────────────────────────┐
│ [≡] [▣ @fe-monorepo]                                  [vi ▾] │ [npm] [Storybook] │  ← header: bg-background/95 backdrop-blur border-b, h-14
├────────────┬─────────────────────────────────────────────────────────────────┤
│ [🔍 Tìm…]  │  main (SidebarInset)                                            │
│ NỘI DUNG   │  ┌ max-w-5xl ─────────────────────────────────────────────┐   │
│ ▸ Bắt đầu  │  │ …                                                       │   │
│   Component│  └─────────────────────────────────────────────────────────┘   │
│   Hook     │                                                                 │
│ COMPONENT  │                                                                 │
│   accordion│                                                                 │
│   alert    │                                                                 │
│   …        │                                                                 │
│ HOOK       │                                                                 │
│   use-…    │                                                                 │
└────────────┴─────────────────────────────────────────────────────────────────┘
```

- **Header** bỏ `bg-primary`; brand giữ ô vuông teal `size-8` làm accent duy nhất; ba control còn lại dùng ghost mặc định của primitive (xoá `iconLinkClassName` + hai cụm `triggerClassName`/`className` override).
- **Sidebar** thêm `SidebarHeader` chứa `SidebarInput` lọc cả ba nhóm bằng `filterCatalogue` (debounce 300ms như list page, `patterns-debounce-search-input`); khi lọc rỗng, nhóm rỗng ẩn, và một dòng `Empty` nhỏ hiện "Không có kết quả cho “x”" + nút xoá. Thêm `SidebarRail` (mép kéo, có sẵn, một dòng). Giữ `collapsible="offcanvas"`.
- **Skip link** là một `<a href="#main">` trong `LayoutTemplate`, `sr-only focus:not-sr-only` — `SidebarInset` nhận `id="main"`. Một dòng JSX + một key i18n.
- Footer: giữ copyright + version, **bỏ** `FooterViewportSize`.

### 3.2 Getting Started — quick start ở band đầu, section đánh số

`products#163` landing pattern *"Quick Start + Interactive Docs"*, `styles#50` *"mathematical spacing, asymmetric balance"*.

```
Bắt đầu                                                   ← h1
Hai gói được publish … import đúng một file mình cần.     ← text-base, max-w-prose
[bun] [npm] [pnpm]
┌ bun add @fe-monorepo/ui @fe-monorepo/hook       [copy] ┐  ← install tabs NẰM TRONG hero, trước đường kẻ
└────────────────────────────────────────────────────────┘
──────────────────────────────────────────────────────────
01  Peer dependency                                       ← số mono teal + h2
    …
02  Nối stylesheet
    [code]
    ⚠ Tailwind v4 không quét node_modules …               ← Alert variant warning, có icon
03  Ví dụ đầu tiên
04  Không có root entry
05  Đi tiếp                    [Xem primitive] [Xem hook]
```

- `DocsSection` nhận thêm `index?: number` → render `01` bằng `font-mono text-primary text-xs tabular-nums` trước `h2`. Đây là toàn bộ "Swiss" của trang: một cột số bên trái tạo nhịp dọc mà không cần card hay nền.
- Cảnh báo `@source` chuyển sang `Alert` primitive (`variant` warning nếu có, không thì `border-warning bg-warning/10` + icon `TriangleAlert`) — `ux#37`.
- Prose `text-base` `max-w-prose`; meta/caption giữ `text-sm`.

### 3.3 Trang chi tiết — title band mang action, hai section thay vì ba

```
← Component                                               ← link nhỏ, trên cùng (thay link "Về danh sách" ở đáy)
button                          [Mở trên Storybook ↗] [npm ↗]   ← h1 mono + hai action
components/button · 2 export                              ← meta line mono, muted
──────────────────────────────────────────────────────────
Import
┌ import { Button, buttonVariants } from "@fe-monorepo/ui/components/button" [copy] ┐
Export
│ Button          │
│ buttonVariants  │
```

- `PageHeader` nhận `actions?: ReactNode` (giống `page-header.tsx` của `_template_next`); `StorybookLink` vào đó. Section **Demo** cùng câu mô tả biến mất → key `documents.components.detail.demo*` bớt hai.
- Bảng export **giữ nguyên** primitive `Table` (test pin `cell`), chỉ đổi cell sang mono thật (§1.1) và viền `border-input`.
- Link quay lại lên đầu (`ux#4`/`ux#88` User Freedom): người đọc quyết định đi hay ở trước khi cuộn, không phải sau bảng 12 dòng. Không cần `Breadcrumb`: sâu 2 cấp, `ux#6` nói 3+ mới dùng.
- Trang hook giống hệt, không có nút Storybook.

### 3.4 Danh sách — card mang export, bỏ hai dòng lặp

```
Component                                                 ← h1
Mỗi dòng là một subpath … xem demo trên Storybook.        ← text-base
[🔍 Lọc theo tên…]                              63 component
┌ accordion ───────────────┐ ┌ alert ───────────────────┐ ┌ alert-dialog ────────────┐
│ Accordion, AccordionContent,│ Alert, AlertAction,      │ AlertDialog, AlertDialogAction,
│ AccordionItem, +1        │ AlertDescription, +1      │ AlertDialogCancel, +9    │
└──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
```

- Card = slug (mono, semibold) + **một dòng export** (mono xs muted, tối đa 3 tên + `+n`, `truncate` — `ux#84`). Bỏ subpath và badge count.
- Viền `border-input`, hover `border-primary`, focus ring giữ. Grid 1/2/3 cột giữ.
- Rỗng → `Empty` primitive: tiêu đề "Không có kết quả cho “x”", mô tả "Thử tên ngắn hơn", action `Xoá bộ lọc` (`ux#90`).
- Card hook giữ câu mô tả từ i18n (5 hook có), thêm dòng export như trên, bỏ badge.

**Biến thể B** (không khuyến nghị, ghi để grill có cái so): bảng `slug | export | Storybook` 63 hàng. Dày hơn theo chiều ngang, đọc như bảng tra; nhưng E2E và mobile (`ux#71`) đều phải làm lại, và card sau khi bỏ hai dòng lặp đã đạt cùng mục đích.

---

## 4. Component map — không thêm primitive, không thêm dependency

| Việc | Primitive (`@monorepo/ui`) | Có sẵn? |
|---|---|---|
| Ô tìm sidebar | `SidebarHeader` + `SidebarInput` | ✓ export từ `sidebar.tsx` |
| Mép kéo sidebar | `SidebarRail` | ✓ |
| Empty state (sidebar, list, 404) | `Empty` · `EmptyHeader` · `EmptyTitle` · `EmptyDescription` · `EmptyContent` | ✓ `empty.tsx` |
| Cảnh báo `@source` | `Alert` · `AlertTitle` · `AlertDescription` | ✓ `alert.tsx` |
| Action ở title band | `buttonVariants` trên `<a>` (`architecture-ui-primitives` — link không đi qua `Button`) | ✓ đã dùng |
| Phím tắt sidebar `⌘B` trong tooltip trigger | `Kbd` | ✓ `kbd.tsx` — tuỳ chọn, một dòng |
| Bảng export / peer | `Table` | giữ |
| `~/components` mới | không — chỉ **sửa** `page-header.tsx` (thêm `actions`), `docs-section.tsx` (thêm `index`), `not-found.tsx` (viết lại trên `Empty`), `code-block.tsx` (token `code`) | |
| Lọc | `~/utils/filter-catalogue.ts` + `@monorepo/hook/use-debounce` | ✓ tái dùng |

Không cần `Command`/`CommandDialog` (`shadcn#22`) cho vòng này: `SidebarInput` lọc-tại-chỗ rẻ hơn và không cần phím tắt để khám phá. Thêm palette `⌘K` khi catalogue có nhóm thứ tư hoặc khi search cần nhảy sang nội dung trong trang.

---

## 5. Token delta — vòng 1–2: không override theme, chỉ khai thứ đang thiếu

> **Vòng 3 (hướng D) thay đổi mục này:** palette riêng (indigo, §2c) override accent + neutral ở tầng app, `--radius: 1.125rem`, hai gói `@fontsource-variable` (Outfit, JetBrains Mono). Phần dưới vẫn đúng cho ba dòng font system stack làm fallback và cho lý do khối override phải nằm unlayered (xem `apps/portfolio/src/globals.css`).

`tooling/tailwind/theme.css` giữ nguyên. Thay đổi duy nhất là `apps/documents/src/globals.css`:

```css
@layer base {
  :root {
    /* theme.css maps every font-* utility onto a variable the app owns —
       without these three lines `font-mono` renders as inherited sans. */
    --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    --font-heading: var(--font-sans);
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  }
}
```

- **System stack, không webfont**: cùng lý do `portfolio` ghi — Dockerfile và CI không được phụ thuộc mạng lúc build; `@fontsource` là một dependency nữa cho một site năm trang. Thêm khi chủ repo muốn một chữ mono "có nhận diện" (JetBrains Mono / Geist Mono), và khi đó qua `@fontsource-variable/*` import từ `globals.css` như `quality-imports` § Webfonts.
- **Viền**: đổi `border-border` → `border-input` ở card, bảng và code block. Là chọn token có sẵn, không phải đổi giá trị token.
- **Không** thêm token nào; **không** đụng neutral (`--foreground`, `--border`). Nếu sau này thấy `#3d4c63` vẫn quá mờ cho chữ đọc dài, đó là việc của `theme.css` cho mọi app, không phải override riêng — khác `portfolio`.
- `::selection` chưa được áp ở workspace globals (portfolio ghi chú điều này) — thêm hai dòng như portfolio nếu muốn, không bắt buộc.

---

## 6. State list

| Màn | State | Hiển thị |
|---|---|---|
| Sidebar | filter rỗng kết quả | nhóm rỗng ẩn; `Empty` nhỏ trong sidebar + nút xoá |
| Sidebar | đang ở trang X | `SidebarMenuButton isActive` (đã có) — `ux#3` |
| List | lọc rỗng | `Empty` + action "Xoá bộ lọc" |
| List | đang gõ (chưa qua debounce) | không có state riêng — input bind giá trị tức thời |
| Detail | slug không tồn tại | `NotFound` viết lại trên `Empty`, vẫn h1 "Không tìm thấy" + slug (test pin) |
| CodeBlock | đã copy | icon `Check` + `aria-label` "Đã sao chép" (đã có) |
| Toàn site | keyboard focus | ring của primitive; skip link hiện khi focus |
| Toàn site | `prefers-reduced-motion` | không có motion nào ngoài `transition-colors` 200ms → không cần nhánh riêng (`ux#9` thoả bằng cách không có gì để tắt) |
| Toàn site | dark | **không** trong vòng này — xem §9.1 |

---

## 7. Copy cần dịch (`documents.*`, cả `vi.json` và `en.json`)

Thêm:

- `nav.skipToContent` — "Bỏ qua tới nội dung" / "Skip to content"
- `nav.searchPlaceholder` — "Tìm component, hook…" / "Search components, hooks…"
- `nav.searchLabel` — "Tìm trong tài liệu" / "Search the docs"
- `search.emptyHint` — "Thử một tên ngắn hơn, hoặc xoá bộ lọc." / "Try a shorter name, or clear the filter."
- `components.exportPreviewMore` — `{count, plural, other {+#}}` (ICU, một message; giống hai locale)
- `components.detail.storybook` — "Mở trên Storybook" / "Open in Storybook" (thay `demoLink` có `{name}`)
- `home.css.sourceWarningTitle` — "Thiếu dòng @source" / "Missing the @source line" (tiêu đề của `Alert`)

Bỏ: `components.detail.demo`, `components.detail.demoDescription`, `components.detail.demoLink`, `components.exportCount`, `hooks.exportCount`. Giữ nguyên mọi key còn lại — h1 "Bắt đầu", "Không tìm thấy", nhãn searchbox "Lọc danh sách" đều đang được E2E pin.

---

## 8. Những gì không đổi

- Runtime Vite, `ROUTES`, năm trang, catch-all trong shell, không guard, không HTTP, không store.
- `scripts/generate-docs-metadata.ts` và shape `DocsEntry` — card lấy export từ dữ liệu đã có, không cần trường mới.
- `CodeBlock` không highlight (quyết định cũ, lý do bundle vẫn đúng).
- Storybook là nơi duy nhất có preview và bảng props.
- `Table` cho export và peer; các `role="cell"` E2E/unit đang assert vẫn tồn tại.
- `SelectLanguage` và cookie ngôn ngữ.

---

## 9. Câu hỏi mở — cần chủ repo trả lời ở grill

### 9.0 Chọn hướng — **CẦN CHỦ REPO**

Vòng 2: chọn B rồi rút lại. Vòng 3: **hướng D Prism** (§2c, `mockup-v3-prism.html`) — chốt hay chỉnh? Nếu chốt, §9.1–§9.3 dưới đã có câu trả lời trong §2c (dark có toggle; Outfit + JetBrains Mono qua fontsource; tile kính thay card); còn lại §9.4–§9.6.

### 9.5 ADR-0009 — `documents` override palette dùng chung — **CẦN CHỦ REPO**

Hướng D thay toàn bộ accent + neutral của `theme.css` ở tầng app (indigo thay teal). Đây là ADR vì đủ ba điều kiện: khó đảo (mọi màn, mọi test contrast), gây ngạc nhiên (app thứ hai làm vậy, ADR-0008 nói portfolio là duy nhất), và là trade-off thật (sửa `theme.css` cho cả workspace vs override một app). Đề xuất: override ở app, lý do *"site cho gói npm public không mặc brand EMR nội bộ"*. Đồng ý viết ADR-0009 ở grill?

### 9.6 Bảng export → chip — **CẦN CHỦ REPO**

Hướng D vẽ export là chip mono trong panel kính thay `Table` một cột. E2E và unit test đang pin `role="cell"` (`Button`, `buttonVariants`, `Avatar`) → ticket phải đổi assertion sang `getByText`/`listitem`. Giữ `Table` (an toàn, xấu hơn) hay đổi chip (đúng hướng, sửa 3 test)?

### 9.1 Dark mode — **CẦN CHỦ REPO**

`theme.css` đã có đủ `.dark`; `products#81`/`#163` thiên về dark code theme cho dev tool. Nhưng `_template_vite` không có toggle, `zustand` **không** nằm trong `package.json` của app này, và cả site chỉ có một khối code mỗi trang. Khuyến nghị: **không làm vòng này**; token `code` + `border-input` + bỏ class màu thô ở `not-found` đã làm site "dark-ready" để thêm toggle sau (một `useSyncExternalStore` trên `localStorage` + class `.dark` lên `<html>`, ~25 dòng, không cần store).

### 9.2 Mono có nhận diện hay system stack — **CẦN CHỦ REPO**

§5 chọn system stack. Nếu muốn site "trông như docs của một library thật" thì một mono có nhận diện (Geist Mono / JetBrains Mono qua `@fontsource-variable`) là thứ thay đổi cảm nhận nhiều nhất sau §1.1, với giá một dependency và ~100KB. Quyết ở grill.

### 9.3 Card hay bảng cho `/components` — **CẦN CHỦ REPO**

§3.4 khuyến nghị card-sửa-nội-dung; biến thể B là bảng. Chọn một.

### 9.4 Giữ hay bỏ `FooterViewportSize`

Brief nói bỏ. Nếu chủ repo còn dùng site này để triage bug layout của chính nó thì giữ — một dòng, không ảnh hưởng gì khác.

---

## 10. Chốt ở vòng grill — 2026-09-16 (hướng D)

Ba vòng hỏi, 22 quyết định, chủ repo chọn đúng khuyến nghị ở mọi câu. Mọi mục §9 đã có câu trả lời ở đây. Từ vựng ghi ở [`apps/documents/CONTEXT.md`](../../apps/documents/CONTEXT.md); quyết định kiến trúc ở [ADR-0009](../adr/0009-documents-prism-palette-override.md).

| # | Quyết định | Chốt |
|---|---|---|
| 1 | Override palette | Chín token `colors#17` (primary/secondary/accent/background/foreground/card/muted/border/ring) + `popover`/`input`/`selection` suy ra + `--radius: 1.125rem`. Status, chart, sidebar token giữ của theme. Khối unlayered trong `src/globals.css`. |
| 2 | ADR | ADR-0009 riêng cho `documents`; ADR-0008 không sửa. |
| 3 | Font | `@fontsource-variable/outfit` (display) + `@fontsource-variable/jetbrains-mono` (mã), import từ `globals.css`, vào `catalog:` mặc định. Body system sans. |
| 4 | Dark mode | Làm ngay: port `theme-provider.tsx` của portfolio (context + `localStorage` + class `.dark`, không `next-themes`), nút toggle trong nav pill. |
| 5 | Nav mobile | Cùng `CommandDialog`; nav pill co còn brand + nút tìm + nút menu mở `Sheet` chứa ba mục. Bộ lọc tại chỗ ở hai trang danh sách giữ (E2E pin "Lọc danh sách"). |
| 6 | Export | Chip mono trong `<ul>`; ba test đổi `role="cell"` → `role="listitem"`. |
| 7 | Tile | Hue = hash(slug), `style={{"--h": n}}`; rộng 2 cột khi `exports.length >= 10` (13/63); hook lưới đều. |
| 8 | Blur | `backdrop-filter` 18px ở đúng năm chỗ: nav pill, hero, capsule lệnh, panel section, `CommandDialog`. Tile trắng 75% không blur. |
| 9 | Aurora | Tĩnh, CSS thuần, không keyframe; reduced-motion chỉ còn hover tile. |
| 10 | Backdrop | Component `aria-hidden` trong slice `layout`, `intensity: "full" \| "soft"`; `full` khi `pathname === ROUTES.HOME`, `soft` còn lại (opacity nửa, 2/5 khối). |
| 11 | Trước/sau | Theo thứ tự catalogue đã sort, trong cùng catalogue, ẩn ở hai đầu. |
| 12 | Getting Started | Giữ năm section (cài đặt vào hero; bốn panel `01/04`…); thêm `home.hero.*`. |
| 13 | Footer | Bỏ `FooterViewportSize`; một dòng mỏng copyright + version, không kính. |
| 14 | Test token | `test/globals.test.ts` như portfolio; copy `test/support/contrast.ts` sang app (không import chéo app); đo contrast từng cặp ở cả hai theme trên **nền kính hiệu dụng**. |
| 15 | Ticket | Sáu ticket theo lớp: (1) globals + font + dark + test token + ADR · (2) shell: nav pill, `Sheet`, `⌘K`, Backdrop, skip link, footer · (3) landing · (4) list tile · (5) detail: hero, trước/sau, chip · (6) i18n + E2E + README + CLAUDE §1. (1)→(2)→{3,4,5} song song→(6). |
| 16 | Dark palette | *Indigo night*: nền `#0B0A1F`, kính `rgba(21,20,46,.6)`, chữ `#E0E7FF`, viền `rgba(199,210,254,.18)`, primary `#818CF8`; aurora opacity nửa. Cùng hue với light. |
| 17 | Theme mặc định | Theo `prefers-color-scheme` lần đầu, nhớ lựa chọn trong `localStorage`. |
| 18 | Nhãn phím tắt | Theo nền tảng: `⌘K` trên Mac, `Ctrl K` nơi khác (đọc `navigator.platform` lúc render); handler bắt `metaKey \|\| ctrlKey` như `sidebar.tsx`. `CommandDialog` nhận `title`/`description` từ i18n. |
| 19 | Hero copy | vi: *"Primitive Base UI, mỗi import một file."* — dòng hai gradient; en dịch tương ứng. |
| 20 | Nav khi cuộn | Luôn hiện, `sticky top-4`. |
| 21 | E2E mới | Ba spec: (a) mở palette bằng phím, gõ `dialog`, Enter → `/components/dialog`; (b) toggle → `html.dark`, reload vẫn dark; (c) từ `/components/dialog` bấm sau → `/components/direction`. Bốn spec cũ đổi selector. |
| 22 | Glossary | Sáu thuật ngữ: Catalogue · Panel kính · Backdrop · Swatch · Tile · Nav pill. |

Những gì §3 (lớp nền vòng 1) còn áp dụng: skip link, `not-found` và empty state trên `Empty`, `PageHeader actions`, prose `text-base` / `max-w-prose`, cảnh báo `@source` trên `Alert` warning, `CodeBlock` dùng token `code`. Những gì §3 **không** còn áp dụng: `SidebarInput`, `SidebarRail`, card `border-input` (thay bằng tile), `DocsSection index` (thay bằng panel `01/04`).

## 11. Bước tiếp

1. `/to-spec` → một issue `spec` từ §2c + §10.
2. `/to-tickets` theo hàng 15 của §10.
3. `/implement` từng ticket; ticket (1) tự thấy khác ngay và không phụ thuộc gì.
