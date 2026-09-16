# Design brief v2 — redesign hình dạng `apps/portfolio`

> **Đã implement, spec #113** (tickets #114–#121 merge vào `dev` 2026-09-16; #122 là tổng kiểm + tài liệu này). Tài liệu này giữ nguyên nội dung quyết định của bước design — chẩn đoán §1, ba hướng §2, mười hai quyết định §7; nó là bản ghi *tại thời điểm quyết*, không phải mô tả app hiện tại. Hình dạng app sau redesign đọc ở [`apps/portfolio/README.md`](../../apps/portfolio/README.md) và CLAUDE.md §1; quyết định kiến trúc (override neutral ở tầng app, hợp đồng token mới) ghi thành [ADR-0008](../adr/0008-portfolio-neubrutalist-neutral-override.md). Hai điểm §7 để ngỏ đã chốt trong ticket: ảnh chân dung **bỏ Lens** (#116), OG **giữ Geist** và vẽ lại bằng viền/khối (#121).

- **Ngày:** 2026-09-07
- **Bước:** design (§7a CLAUDE.md), chạy bằng `ui-ux-pro-max` ở chế độ đọc CSV tĩnh — không Python, không `--design-system`, không `--persist`.
- **Đầu vào:** code `apps/portfolio` tại `d8f1ee3`, `tooling/tailwind/theme.css`, `apps/portfolio/src/globals.css`, và [`docs/design/portfolio-rebuild.md`](./portfolio-rebuild.md) (brief v1, đã implement).
- **Đầu ra:** tài liệu này + một mockup HTML tĩnh **4 bản cạnh nhau** để chốt bằng mắt trước khi viết code.
  Mockup nằm ngoài repo, trong scratchpad của phiên; nó là vật dùng-một-lần cho việc chọn, không phải nguồn sự thật.
- **Lý do có v2:** v1 tự đặt ràng buộc *"giữ vỏ, đổi ruột"* và được duyệt ở grill, nên toàn bộ 9 ticket
  (#104–#112) chỉ đụng tới **nội dung, typography, motion, print** — không ticket nào đổi bố cục. Kết quả
  đúng brief nhưng không phải thứ chủ repo muốn: trang trông phẳng hơn bản cũ. v2 chỉ giải quyết
  **hình dạng thị giác**; dữ liệu CV, i18n, print, OG của v1 giữ nguyên.
- **Cách đọc trích dẫn:** `products#NN`, `styles#NN`, `landing#NN`, `typography#NN`, `ui-reasoning#NN`
  = hàng `No=NN` trong file cùng tên dưới `.agents/skills/ui-ux-pro-max/data/`. Grep được bằng `^NN,`.

---

## 1. Chẩn đoán — vì sao trang trông "chưa được design"

Ba nguyên nhân, xếp theo mức độ ảnh hưởng. Cả ba đều là **FACT** đọc được từ code, không phải cảm tính.

### 1.1 Bố cục chính là anti-pattern mà dataset nêu đích danh

`products#11` (Portfolio/Personal) ghi anti-pattern: **"Corporate templates + Generic layouts"**.
Trang hiện tại là đúng định nghĩa đó — một cột `max-w-2xl` căn giữa, bảy section xếp dọc, mỗi section
mở bằng `h2 text-xl font-bold`, cùng một nhịp từ trên xuống dưới. Không có lưới, không có điểm neo thị
giác, không có gì để mắt bám vào ngoài thứ tự đọc.

`products#11` khuyến nghị primary style **Motion-Driven + Minimalism & Swiss Style** và landing pattern
**Storytelling-Driven**. Trang hiện tại không lấy phần "Swiss" (lưới, tương phản cỡ chữ, kỷ luật đường
kẻ) — nó chỉ lấy phần "Minimalism" hiểu theo nghĩa *ít thứ*, mà ít thứ không tự thành thiết kế.

### 1.2 Vòng v1 chọn nhánh `reduce-motion` mà không bù lại bằng cấu trúc

`ui-reasoning#11` có hai nhánh: `if_creative_field → style:brutalism` và
`if_minimal_portfolio → constraint:reduce-motion`. v1 chọn nhánh thứ hai — hợp lý cho một CV. Nhưng
motion là thứ **duy nhất** đang tạo cảm giác "có thiết kế" trong bản cũ (~40 `BlurFade`, badge nhấc lên
khi hover). Gỡ nó đi mà không đưa vào cấu trúc thay thế thì phần còn lại là văn bản xếp dọc. Đây là lỗi
của bước design v1, không phải lỗi của ticket nào.

### 1.3 Neutral kế thừa từ EMR làm trang mất hết cấu trúc nhìn thấy được

`theme.css` là palette của sản phẩm EMR. Hai token quan trọng nhất cho cảm giác "sắc nét":

| Token | Giá trị light | Hệ quả |
|---|---|---|
| `--foreground` | `#3d4c63` (xanh-xám) | Chữ không bao giờ thật sự đen; toàn trang mờ một tầng |
| `--border` | `#f0f0f0` | Viền card và đường phân cách gần như vô hình trên nền `#f8f8f9` |

`styles#50` và `styles#66` đều yêu cầu **"High contrast: Black #000000, White #FFFFFF"**. v1 đã override
bảy token accent sang indigo (`globals.css`) nhưng **không đụng vào neutral** — nên accent thì có mà nền
tảng tương phản thì không. Đây là thay đổi rẻ nhất, tác động lớn nhất, và **áp dụng cho cả ba hướng dưới**.

---

## 2. Ba hướng để chọn

Ba hướng khác nhau ở **hình dạng**, không phải ở token. Mỗi hướng đều giữ nguyên: dữ liệu CV, hai
locale, `@media print`, `opengraph-image.tsx`, nhánh `prefers-reduced-motion`, và Server Component mặc định.

### Hướng A — Swiss editorial

`styles#50 Swiss Modernism 2.0` + `styles#66 Editorial Grid / Magazine`, chữ `typography#5 Minimal Swiss`.

- Bỏ cột giữa. Lưới bất đối xứng: **rail trái dính** 220px (ảnh, tên, chức danh, mục lục đánh số, liên hệ,
  nút in CV) + cột nội dung bên phải. Mobile: rail xếp lên đầu, một cột.
- Section header = **số accent + chữ nhỏ in hoa giãn chữ + đường kẻ kéo hết chiều ngang** (`01 — KINH NGHIỆM`).
- Work: mỗi việc là một hàng `[mốc thời gian 104px] [nội dung]`, phân cách bằng hairline. **Không card,
  không accordion** — ba gạch đầu dòng luôn hiện.
- Tech stack là **chữ ngăn bằng dấu ·**, không phải 13 badge — badge nhiều làm mắt đọc thành nhiễu.
- Tương phản mạnh: chữ gần đen, đường kẻ nhìn thấy được, accent chỉ ở số section và gạch chân link.
- **Được:** trông như một CV được thiết kế, in ra đẹp, không lỗi mốt, hợp người đọc là tech lead lẫn HR.
- **Mất:** không "wow"; rail dính cần xử lý riêng cho mobile và cho print.

### Hướng B — Bento

`styles#39 Bento Box Grid` + `landing#28 Bento Grid Showcase`.

- Trang thành **bảng điều khiển về mình**: ô danh tính lớn (3×2), ô ảnh, ô **"đang làm"** nền accent,
  bốn ô số liệu (2+ năm / 3 công ty / 2 gói npm / VDA 2025), rồi hai ô lớn Kinh nghiệm và Kỹ năng cạnh
  nhau, cuối cùng ba ô dự án.
- Radius 20px, viền nhạt, hover nhấc 3px + shadow — `styles#39` cho phép `hover scale 1.02`.
- Mobile: mọi ô xếp dọc thành thẻ, đọc rất tự nhiên.
- **Được:** quét được trong 5 giây, hợp gu "portfolio dev 2025", số liệu tự nói thay lời.
- **Mất:** là hình dạng phổ biến nhất hiện nay nên ít khác biệt; và ô số liệu cần con số đứng được —
  "2+ năm" là mốc đã chốt ở v1, nếu thấy yếu thì bỏ ô đó.

### Hướng C — Terminal / neubrutalist

`styles#38 Neubrutalism` + `typography#17 Brutalist Raw`, đi theo nhánh `ui-reasoning#11 if_creative_field`.

- Monospace toàn trang bằng `ui-monospace` **có sẵn trong system stack** — không thêm webfont, nên không
  đụng ràng buộc "Docker build không được gọi Google Fonts" đang ghi trong `globals.css`.
- Hero là một khối cửa sổ terminal: `$ whoami` → tên, `$ cat role.txt` → định vị.
- Viền cứng 2px, bóng đổ đặc `4px 4px 0`, không bo góc, badge vuông màu vàng.
- **Được:** cá tính cao nhất, nhớ được ngay, rất "developer".
- **Mất:** kén người đọc — ăn điểm với tech lead, có thể trừ điểm với HR truyền thống; và in ra giấy thì
  viền đen dày tốn mực, phải viết nhánh print riêng.

---

## 3. Token delta — áp dụng cho cả ba hướng

Viết trong `apps/portfolio/src/globals.css`, cùng chỗ và cùng kiểu **unlayered** như bảy token accent hiện
có (lý do đã ghi trong comment ở file đó: `theme.css` vào bằng `@import` nên nằm ngoài mọi `@layer`).

| Token | Từ | Sang | Vì |
|---|---|---|---|
| `--foreground` | `#3d4c63` | gần đen, hue trung tính | `styles#50`/`#66` yêu cầu tương phản cao; màu hiện tại là "normal text" của EMR |
| `--border` | `#f0f0f0` | đậm hơn ~3 bậc | viền hiện tại vô hình, nên mọi card/divider không tồn tại về mặt thị giác |
| `--muted-foreground` | `#646464` | giữ hoặc đậm nhẹ | đã đạt 4.5:1, chỉ chỉnh nếu nền đổi |

**Cảnh báo (xác minh 2026-09-07): §3 hiện đang bị chính test của v1 cấm.**
`test/globals.test.ts:184-188` khẳng định app override **đúng bảy** token và không token nào khác
(kiểm bằng cách so tập key có giá trị `oklch(` trong `:root` và `.dark` với `ACCENT_TOKENS`), còn
`:218-223` đòi `override["muted-foreground"]` phải là `undefined`. Nghĩa là thêm `--foreground` và
`--border` sẽ làm đỏ test ở cả light lẫn dark, và `--muted-foreground` thì bị chặn thẳng.

Đây không phải bug — đó là hợp đồng v1 cố ý viết ra: *"app này chỉ đổi màu thương hiệu, không đụng
neutral chung"*. Redesign v2 đổi chính hợp đồng đó, nên ticket token phải **sửa test có chủ đích**
thành *"bảy token accent cộng hai neutral được liệt kê tên"*, chứ không phải nới lỏng cho xanh.

**Không** đụng `destructive`/`success`/`warning`/`info`, chart, sidebar — chúng thuộc theme chung của mọi app.

---

## 4. Những gì không đổi

- Dữ liệu CV trong `~/features/home/constants/resume.ts` và namespace `portfolio.*` ở `packages/i18n`.
- Timeline A (Dcorp → Arobid → MedViet), badge VDA 2025, "2+ năm".
- `@media print`, `opengraph-image.tsx` theo locale, `proxy.ts`, `metadata-image-path.ts`.
- Nhánh `prefers-reduced-motion` và kỷ luật một fade mỗi section.
- Server Component mặc định; island vẫn chỉ là fade, lens, hàng mở rộng, dock, theme toggle.
- Thứ tự đọc Hero → About → Work → Projects → Skills → Education → Contact, đang được pin bởi
  `test/features/home/templates/home.template.test.tsx`. Hướng B gộp About vào ô danh tính nên nếu chọn B
  thì test đó phải sửa theo, có chủ đích chứ không phải vá cho xanh.

---

## 5. Quyết định — chọn **hướng C** (2026-09-07)

Chủ repo chọn **C — Terminal / neubrutalist** sau khi xem mockup bốn bản. A và B không theo tiếp.
Phần còn lại của tài liệu chỉ nói về C.

---

## 6. Những gì hướng C phải trả lời trước khi mở ticket

C là hướng cá tính nhất nên cũng là hướng có nhiều ràng buộc kỹ thuật thật nhất. Mười điểm dưới đây
là thứ mockup tĩnh **không** trả lời được, xếp theo mức chặn. Mỗi điểm có đề xuất sẵn để vòng grill chỉ
việc gật hoặc bác, trừ bốn điểm đánh dấu **CẦN CHỦ REPO** thì phải chọn.

### 6.1 Dark mode — **CẦN CHỦ REPO**

Ngữ pháp của neubrutalism là viền đen cứng cộng bóng đổ đặc màu đen trên nền trắng. Trong dark mode
bóng đen tan vào nền, và cả hệ thống sụp. App lại **có** theme toggle kèm hiệu ứng wipe, nên không né được.
Hai lối:

- **Đảo cực:** nền gần đen, viền và bóng đổ màu sáng (`#faf9f5`). Giữ đúng ngữ pháp, nhưng dark mode
  trông "âm bản" chứ không giống bản sáng.
- **Nâng nền card:** giữ viền tối, đẩy nền card sáng hơn nền trang. An toàn hơn, nhưng mất gần hết cảm
  giác brutalist trong dark.

### 6.2 Màu vàng — **CẦN CHỦ REPO**

Mockup dùng vàng `#ffe14d` cho nút chính và badge giải thưởng. `styles#38` cho vàng là màu idiomatic
của neubrutalism. Nhưng v1 đã pin đúng **bảy** token indigo, và `test/globals.test.ts` đang khoá tập
token, vị trí đặt, hue và từng tỉ lệ tương phản. Thêm vàng nghĩa là mở rộng bộ test đó. Hai lối: bỏ vàng
và dùng indigo làm nền nút, hay nhận vàng làm accent thứ hai và đo lại contrast cho cả hai theme.

### 6.3 Mono toàn trang hay mono cộng sans — **CẦN CHỦ REPO**

`typography#17` là Mono + Mono. Nhưng gạch đầu dòng ở đây là câu tiếng Việt dài, có dấu, và monospace
làm đoạn văn tiếng Việt khó đọc hơn hẳn ở cỡ chữ nhỏ (`ux#67`, `ux#72`). Lối thứ ba, nhiều site
neubrutalist dùng: **mono cho tiêu đề, nhãn, mốc thời gian, tech stack; sans cho văn xuôi**. Giữ được chất
terminal ở chỗ mắt nhìn thấy đầu tiên mà không bắt người đọc nhai một trang mono.

### 6.4 Dock đáy — **CẦN CHỦ REPO**

Dock hiện tại là thành phần kiểu macOS, bo tròn, có magnification. Đặt cạnh trang neubrutalist thì lạc
điệu. Vướng mắc: dock **đang là nơi duy nhất chứa theme toggle**, nên bỏ nó thì phải tìm chỗ mới cho nút
đổi sáng tối. Ba lối: giữ và vẽ lại vuông viền cứng, bỏ hẳn và đưa toggle lên đầu trang, hay bỏ dock và
để toggle nằm trong khối terminal ở hero.

### 6.5 `--radius: 0` là một dòng, và nó đúng chỗ

Mọi primitive của `@monorepo/ui` đọc `--radius` từ `theme.css`. Đặt `--radius: 0` trong
`apps/portfolio/src/globals.css` là làm vuông toàn bộ trang bằng một dòng, kể cả `Select` đổi ngôn ngữ và
`Skeleton` fallback của nó. **Đề xuất: làm vậy.** Lưu ý `Avatar` bo tròn bằng class chứ không bằng token,
nên ảnh chân dung vẫn tròn nếu không sửa riêng.

### 6.6 Viền 2px không phải việc của token

Primitive dùng `border` 1px cộng `border-border`. C cần 2px gần đen. Không có token nào làm được, nên
2px phải viết ở className của chính các component trong slice `portfolio`. **Đề xuất:** override
`--border` sang gần đen để primitive dùng chung tự đậm lên, còn khối riêng của trang (cửa sổ terminal,
box công việc, box dự án) thì 2px. Trộn 1px với 2px mà không có lý do sẽ đọc thành lỗi.

### 6.7 Print phải có nhánh riêng

Viền 2px đen cộng bóng đổ đặc 4px trên mọi khối là rất tốn mực, và thanh tiêu đề cửa sổ terminal (ba
chấm cộng `tuan@portfolio`) in ra giấy chỉ là nhiễu. **Đề xuất:** trong `@media print` bỏ hết bóng đổ, hạ
viền xuống 1px, ẩn thanh tiêu đề cửa sổ. Phần `@media print` hiện có ở cuối `globals.css` là chỗ đặt.

### 6.8 Chuỗi lệnh và i18n

C thay "Xin chào, mình là Tuấn 👋" bằng `$ whoami`. **Đề xuất:** tên lệnh (`whoami`, `cat role.txt`,
`current --job`) là **code, giữ nguyên tiếng Anh ở cả hai locale**; chỉ phần văn xuôi sau lệnh mới dịch.
Như vậy `vi.json` và `en.json` không lệch nhau về cấu trúc, và key `portfolio.hero.greeting` cũ được thay
chứ không phải bỏ trống. `catalogue-invariants.test.ts` vẫn phải xanh.

### 6.9 Ảnh chân dung

Mockup C không có ảnh. Một CV thì có mặt người vẫn hơn. **Đề xuất:** giữ ảnh, đặt trong khối terminal ở
hero, cắt **vuông** chứ không tròn, giữ Lens hay bỏ tuỳ vòng grill.

### 6.10 OG image — vướng mắc kỹ thuật thật

`opengraph-image.tsx` render bằng Satori, và Satori **không đọc được font hệ thống**: muốn chữ monospace
trên thẻ chia sẻ thì phải nhúng một file font vào repo. Điều đó đụng thẳng ràng buộc "không thêm
webfont" đang ghi trong `globals.css`. Hai lối: giữ OG bằng sans như hiện tại và chấp nhận thẻ chia sẻ
khác chất với trang, hay commit một file mono vào `src/assets` chỉ để Satori dùng.

### 6.11 Bốn section chưa có trong mockup

C mới vẽ Hero, Work, Projects, Skills. Còn **About, Education, Contact, Hobbies**. About đã bị gộp vào
hero dưới dạng `cat role.txt`. `test/features/home/templates/home.template.test.tsx:25-34` pin **tám**
section theo đúng thứ tự `hero, about, work, projects, skills, education, contact, hobbies` bằng
`toEqual` trên mảng `section[id]` — tức pin cả thành phần, thứ tự lẫn số lần xuất hiện. Test thứ hai
(`:37-60`) pin outline heading: đúng một `h1`, và không cấp heading nào nhảy quá một bậc. Bỏ hay gộp
section nào cũng là sửa test có chủ đích, không phải vá cho xanh.

---

## 7. Chốt ở vòng grill — 2026-09-07

Mười hai quyết định, đóng toàn bộ §6. Cột cuối ghi hệ quả kỹ thuật phải làm theo.

| # | Quyết định | Chốt | Hệ quả |
|---|---|---|---|
| 1 | Cửa sổ terminal | **Chỉ ở hero.** Khối khác là box viền cứng, không thanh tiêu đề | Ẩn dụ dùng một lần; §6.1 đóng |
| 2 | Monospace | **Mono + sans.** Mono cho tiêu đề, nhãn, mốc thời gian, tech stack, chuỗi lệnh; sans cho văn xuôi | Hai họ chữ, đều từ system stack; không webfont |
| 3 | Màu vàng | **Nhận, đúng hai vai**: nền nút chính và badge giải thưởng | Làm đỏ 4 test trong `test/globals.test.ts`; phải có sắc vàng riêng cho dark |
| 4 | Dark mode | **Đảo cực.** Nền gần đen, viền và bóng đổ màu sáng | Đo lại toàn bộ tương phản cho theme tối |
| 5 | Ảnh chân dung | **Giữ, cắt vuông, trong khối terminal ở hero, bỏ Lens** | `Avatar` bo tròn hard-code trong `packages/ui` nên phải override bằng className ở app; xoá `lens.tsx` |
| 6 | Hợp đồng neutral | **Mở rộng** thành bảy token accent cộng hai neutral được liệt kê tên | Sửa `test/globals.test.ts:184-188` và `:218-223` có chủ đích |
| 7 | Dock đáy | **Giữ, vẽ lại vuông**, viền cứng, bỏ phóng to icon | Nút đổi theme không phải chuyển chỗ; `dock.tsx` bỏ magnification |
| 8 | OG image | **Giữ Geist sans, không nhúng font** | Vẽ lại thẻ theo ngữ pháp mới bằng viền và khối; cam kết build không ra mạng còn nguyên |
| 9 | Cấu trúc section | **Giữ tám section** | `home.template.test.tsx` không đổi |
| 10 | Chuyển động | **Bỏ hết fade theo section** | Xoá `blur-fade.tsx`, `blur-fade-text.tsx` và dây `delay` trong template; chỉ còn wipe khi đổi theme |
| 11 | Chuỗi lệnh, i18n | **Tên lệnh giữ tiếng Anh ở cả hai locale**; chỉ văn xuôi sau lệnh mới dịch | `vi.json` và `en.json` không lệch cấu trúc |
| 12 | Bản in | **Làm nhẹ khi in**: bỏ bóng đổ, viền mỏng, ẩn thanh tiêu đề cửa sổ | Viết trong `@media print` đã có ở cuối `globals.css` |

| 13 | Bố cục desktop (sau review, 2026-09-16) | **Hai cột kiểu CV** từ `lg`: khung `max-w-6xl`, hero trải hết, cột đọc 2/3 (About, Work, Projects hai cột) + rail 1/3 dính (Skills, Education, Contact, Hobbies). Thứ tự DOM không đổi | Spec #113 giữ cột 672px của v1 nên khối mới bị bó; ticket #123 |
| 14 | Hover (sau review, 2026-09-16) | **Mọi** khối tiêu chuẩn và thanh dock lún 2px về phía bóng, bóng rút 4→2px; control trong dock lún 1px khi bấm, không theo hover | `--shadow-hard-pressed`; #123 giới hạn ở khối bấm được, #124 mở ra toàn trang theo yêu cầu chủ repo |
| 15 | Chọn ngôn ngữ (2026-09-16) | Vào dock, control thứ năm sau nút đổi theme; shell không còn chrome trên nội dung. Popup vẽ theo ngữ pháp trang: viền 2px, bóng đặc, mono, mở lên trên thanh, không zoom | #124, #125 |
| 16 | Dự án (2026-09-16) | Hạ xuống vai **học và demo**: một khối, ba hàng tên + link + một câu + stack mono, ghi chú tính chất ở đầu; bỏ bullet và badge loại; tiêu đề "Dự án học và demo" | #125 — chủ repo: chưa cái nào đủ đẳng cấp production |

**Hệ quả suy ra, không hỏi lại:** đặt `--radius: 0` ở `apps/portfolio/src/globals.css` để vuông
badge/card/button/skeleton/select bằng một dòng, và vuông nốt hai chỗ bo tròn hard-code còn lại là logo
công ty trong `resume-card.tsx:147` và các icon trong dock. Điều này theo thẳng từ quyết định 5 và 7.

---

## 8. Bước tiếp

**Spec = issue #113** (nhãn `spec` + `ready-for-agent`, mở 2026-09-16). **Tickets = sub-issue #114–#122** (2026-09-16): frontier ban đầu #114 token và #115 prefactor; #116 hero và #117 Work ← #114, #115; #118 năm section ← #117; #119 dock và #121 OG ← #114; #120 print ← #116, #118, #119; #122 tổng kiểm ← tất cả. Tiếp theo: `/implement <số>` theo frontier → `/code-review`.
Ticket đầu tiên là **token delta ở §3 cộng `--radius: 0`**, vì mọi ticket sau đều vẽ trên nền đó.
