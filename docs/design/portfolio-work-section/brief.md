# Design brief — `portfolio-work-section`

> Đề bài cho pha **design** của section **work** (Experience) trên trang CV `apps/portfolio`.
> Viết bởi Claude ở đầu bước design theo ADR-0008; chủ repo duyệt trước khi vẽ Direction nào.
> Nguồn: [`docs/research/ui-ux-skills-design-workflow.md`](../../research/ui-ux-skills-design-workflow.md),
> [`tooling/tailwind/theme.css`](../../../tooling/tailwind/theme.css), danh mục primitive
> [`packages/ui/src/components/`](../../../packages/ui/src/components).
>
> **Trạng thái:** đã chốt 2026-09-05 — xem [`design-handoff.md`](./design-handoff.md) ·
> Ticket [#95](https://github.com/qtuan02/monorepo/issues/95) · Spec [#92](https://github.com/qtuan02/monorepo/issues/92)

---

## 1. App, Runtime, vị trí trong code

| | |
|---|---|
| App | `@monorepo/portfolio` — trang CV cá nhân, public, một màn duy nhất |
| Runtime | **Next** (App Router, `cacheComponents`, `reactCompiler`), cluster rule `next-*` |
| Route | `/` và `/en` — `src/app/[locale]/(shell)/page.tsx`, **không** guard, **không** `generateMetadata` riêng |
| Slice | `~/features/home` — section là `components/work-section.tsx`, render bởi `templates/home.template.tsx` ở vị trí thứ ba (`delay = 0.08 × 5`) |
| Dữ liệu | **Hằng số của slice** — `WORK_ITEMS` trong `~/features/home/constants/resume.ts`. Không backend, không `"use cache"`, không TanStack Query. Cố ý: payload cached phải serializable còn `WORK_ITEMS` mang `StaticImageData` |
| Copy | `packages/i18n/src/locales/{vi,en}.json`, namespace `portfolio.work.*` — ICU, đã có đủ cả hai ngôn ngữ |
| Shell | Một cột đọc `max-w-2xl` (672px) `px-6`, dock cố định đáy màn; section không tự quyết chiều rộng |

**Hình dạng hiện tại** (`work-section.tsx` + `resume-card.tsx`): tiêu đề `h2` `text-xl font-bold`, rồi 4 hàng cách nhau `gap-y-5`. Mỗi hàng là logo tròn 48px bên trái + cột phải gồm dòng tiêu đề (tên công ty ⟷ khoảng thời gian, `tabular-nums`), dòng phụ (chức danh), và thân mở sẵn (`defaultExpanded`) gồm `ul` bullet + một dòng tech stack. Header là accordion WAI-ARIA (`h3` bọc đúng một `button`, `aria-expanded`), thân animate bằng `motion/react`. Không dùng `Card` — cố ý, có ghi lý do trong comment của component.

## 2. Nội dung thật phải vẽ đúng

Bốn role, thứ tự mới → cũ. Số bullet **không đều nhau** — Direction nào giả định "mỗi thẻ 3 dòng" là sai đề:

| id | Công ty | Chức danh (vi) | Thời gian | Bullet | Tech stack |
|---|---|---|---|---|---|
| `fptis` | FPT IS | Kỹ sư phần mềm | 02/2026 – Hiện tại | **6** | 5 mục |
| `arobid` | AROBID | Lập trình viên Frontend | 02/2025 – 02/2026 | **6** | **10 mục** |
| `dcorp` | D-CORP | Lập trình viên Frontend | 03/2024 – 02/2025 | **5** | theo `WORK_ITEMS` |
| `wisdom` | Wisdom | Kỹ sư phần mềm | 03/2023 – 09/2023 | **3** | theo `WORK_ITEMS` |

Bullet là câu dài (60–220 ký tự), nhiều câu mở đầu bằng tên dự án + dấu gạch ngang (`TradeXpo — nền tảng triển lãm số: …`). Bản `en` dài hơn bản `vi` ở phần lớn dòng. Logo là ảnh thật (`png`/`jpg`) trong `~/assets/logos/`, tỉ lệ và nền không đồng nhất.

## 3. Giá trị thật đã lift (bước 0 của skill `design`)

Không Direction nào được tự bịa palette: app đã có brand port từ web-emr. Artboard dùng đúng các giá trị dưới đây.

**Màu — light** (`:root` trong `theme.css`; hex là nguồn web-emr ghi trong chính file đó):

| Token | oklch | hex nguồn | Dùng ở section này |
|---|---|---|---|
| `--background` | `oklch(0.9794 0.0013 286.38)` | `#f8f8f9` | nền trang |
| `--foreground` | `oklch(0.4134 0.0432 258.79)` | `#3d4c63` | tiêu đề, chức danh, bullet |
| `--muted-foreground` | `oklch(0.5032 0 0)` | `#646464` | khoảng thời gian, danh sách tech stack |
| `--card` | `oklch(1 0 0)` | `#ffffff` | nền logo (`bg-background` hiện tại) |
| `--border` | `oklch(0.9551 0 0)` | `#f0f0f0` | viền logo |
| `--primary` | `oklch(0.6591 0.1012 181.55)` | `#38a696` | **chưa dùng** ở section này |
| `--accent` / `--accent-foreground` | `oklch(0.987 0.018 188.41)` / `oklch(0.5992 0.082 182.46)` | `#eefffd` / `#3e9084` | **chưa dùng** |
| `--secondary` / `--muted` | `oklch(0.9642 0 0)` | `#f3f3f3` | **chưa dùng** |
| `--ring` | `oklch(0.8919 0.0466 184.56)` | `#bae6df` | focus |

**Màu — dark** (`.dark`): `--background oklch(0.145 0 0)`, `--foreground oklch(0.985 0 0)`, `--card oklch(0.205 0 0)`, `--muted-foreground oklch(0.708 0 0)`, `--border oklch(1 0 0 / 10%)`, `--primary oklch(0.7893 0.0875 183.49)` (`#75cdc0`), `--accent oklch(0.35 0.0382 184.2)`. Trang có theme toggle thật (View Transition wipe), nên **mỗi Direction phải trả lời được nó trông thế nào ở dark**, dù artboard chính vẽ light.

**Radius:** `--radius: 0.625rem` (10px) → `sm 6px` · `md 8px` · `lg 10px` · `xl 14px` · `2xl 18px`. Logo hiện tại là `rounded-full`.

**Font:** app **không** có webfont — `--font-sans` là system stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`), `--font-heading` = `--font-sans`, `--font-mono` là system mono. Lý do ghi trong `apps/portfolio/src/globals.css`: `next/font/google` tải lúc build, làm `docker build` và CI phụ thuộc mạng Google. Artboard dùng đúng stack này — cũng là thứ duy nhất export PNG/PDF không làm hỏng, vì Google Fonts không embed khi export.

**Kích thước đang dùng:** logo 48px · tiêu đề section 20px/bold · tên công ty 12px→14px (`sm:`)/semibold · thời gian 12px→14px `tabular-nums` · chức danh 12px normal · bullet 12px→14px, `space-y-1` · khoảng cách hàng 20px · khoảng cách tiêu đề↔danh sách 12px.

**Primitive `@monorepo/ui` sẵn có, liên quan tới section này:** `accordion` · `collapsible` · `badge` · `card` · `avatar` · `separator` · `item` · `hover-card` · `tooltip` · `scroll-area` · `skeleton` · `button` (63 primitive tổng cộng, style shadcn `base-vega` trên Base UI). Composite dùng chung của app: `~/components/{exception,icons,select}` — **không** có `PageHeader`/`PageContent` ở app này (đó là của `_template_next`).

## 4. Ràng buộc

Từ research note và rule của repo — mọi Direction phải nằm trong đó:

- **Không đổi brand.** Token delta chỉ được *ghi* trong handoff, không áp dụng trong ticket này. Thêm token → ticket riêng; đổi token brand hiện có → ADR trước (spec #92).
- **Không bịa palette mới.** Portfolio đã có theme; vai (a) *style direction* của UI UX Pro Max không dùng ở đây.
- **Mọi màu/radius/font trên artboard phải quy được về token trên**; nếu không thì nó là một dòng token delta có chủ ý, không phải một hex lỡ tay.
- **Mọi vùng UI phải quy được về** một primitive `@monorepo/ui`, một composite `~/components`, hoặc một mục "cần thêm" — kể cả khi bản vẽ tự do hơn code hiện tại.
- **Copy là ICU trong `packages/i18n`**, `{name}` chứ không `{{name}}`, không rich-text tag. Text mới trên artboard = một key mới phải liệt kê ở handoff kèm `vi` + `en`.
- **Icon là inline SVG** trong artboard (không emoji), map sang `lucide-react` `size-4`/`size-5` khi implement.
- **Bố cục dùng flex/grid + `gap`**, đặt được cạnh nhau ở nhiều kích thước khung; ảnh là `<img>` trỏ tương đối sang asset thật của app, không nhúng base64 và không copy vào `artboards/`.
- **Server Component là mặc định.** Phần tương tác (đóng/mở, hover) là client island; chữ phải nằm trong HTML đầu tiên vì trang này là thứ crawler đọc.
- **A11y không được lùi:** hàng hiện tại là accordion WAI-ARIA đúng chuẩn — một Tab stop, `aria-expanded`. Direction nào bỏ heading hoặc biến hàng thành `div` click được là một bước lùi phải nói rõ.
- Section giữ `id="work"` — dock ở `~/features/layout/constants/navbar.ts` neo vào nó.

## 5. Vấn đề cần design giải quyết

Không phải "làm cho đẹp hơn" chung chung. Ba điều cụ thể ở bản hiện tại:

1. **Bốn thẻ mở sẵn = một bức tường chữ.** 20 bullet dài liên tiếp trong một cột 672px; người lướt CV không có chỗ nghỉ mắt và không thấy được cấu trúc "4 nơi, 3 năm".
2. **Tech stack là một câu văn.** 10 tên công nghệ nối bằng dấu phẩy ở `arobid` đọc như văn xuôi, trong khi đó là thứ nhà tuyển dụng quét đầu tiên.
3. **Không có tín hiệu thời gian.** Bốn khoảng thời gian nằm rời ở góc phải mỗi hàng; không nhìn ra đây là một dòng thời gian liên tục.

Điều **không** phải vấn đề, đừng "sửa": thứ tự mới → cũ, logo tròn 48px, cột đọc hẹp, và việc section này không dùng `Card`.

## 6. Direction — 2–4 hướng low-fi để chủ repo chọn

Sẽ vẽ sau khi brief được duyệt. Mỗi Direction là một artboard low-fi trả lời cùng ba vấn đề trên bằng một thái độ khác hẳn, và mỗi cái phải nói rõ: mở sẵn hay gập, tech stack hiển thị thế nào, thời gian thể hiện ra sao, và nó tốn thêm bao nhiêu token/primitive.

> **Direction đã chọn:** **A · Rail thời gian, gập mặc định** (2026-09-05). Một vạch dọc nối bốn logo thành dòng thời gian; vai trò hiện tại mở sẵn và mang viền `--primary` 2px, ba vai trò cũ gập lại còn ba chip + `+n công nghệ`. Ba hướng không chọn (B thẻ `Card`, C cột lịch editorial, D tóm tắt + chi tiết) giữ ở mục 2 “Đã loại” của canvas để biết đã cân nhắc gì.

## 7. Design canvas — **chỉ local, không publish, không công cụ**

Chủ repo chốt 2026-09-05: pha design **không dùng web**, không publish Artifact lên claude.ai. Chốt tiếp 2026-09-06 ([#100](https://github.com/qtuan02/monorepo/issues/100)): cũng **không cài thêm gì** — bỏ seed, bỏ file bao bì. Canvas sống hoàn toàn trong repo, và phụ thuộc duy nhất để xem nó là **một browser**.

| | |
|---|---|
| **Canvas** | `docs/design/portfolio-work-section/artboards/` — bảy `.dc.html`, mỗi file một artboard, HTML tĩnh tự chứa, CSS inline lift từ `theme.css`. Đây **là** canvas, không phải nguồn để sinh ra nó |
| **File để xem** | [`artboards/index.html`](./artboards/index.html) — lưới `<iframe>`, commit cùng chỗ. Double-click là mở; mục 1 Direction A (Main light · Dark · Mobile 390px · States), mục 2 “Đã loại” ba Direction B/C/D thu nhỏ |
| **Ảnh** | `<img src>` trỏ tương đối sang `apps/portfolio/src/assets/logos/` — asset thật của app, không bản sao nào để trôi |
| **Vòng sửa** | Chủ repo mở `index.html`, nói cần đổi gì → Claude sửa `.dc.html` → F5. Không seed, không re-seed, không nút Save (Save cần trang hosted, mà ở đây không có) |

Đây đúng là nhánh dự phòng ADR-0008 đã lường trước ("không có capability đó thì bước sửa tay thu về xem + export PNG/PDF + nói cho Claude sửa"), nhưng nó **lệch** với AC "≥2 vòng Save trên canvas" của ticket #95 và với cách ADR-0008 mô tả vòng lặp. Chỗ lệch ghi ở comment #95; ADR-0008 đã sửa theo ở hai mục "Cập nhật".

> **Bản đã chốt:** bảy `.dc.html` + `index.html` trong [`artboards/`](./artboards) tại commit
> [`b3720a3`](https://github.com/qtuan02/monorepo/commit/b3720a3d4a3f1d823fccdda285cb979f94f74a56).
> Không có số version Artifact — danh tính một bản chốt ở đây là **commit** của thư mục đó, và commit
> này thay bản đầu tiên (2026-09-05) vì #100 đổi cơ chế hiển thị chứ không đổi thiết kế.
> Design handoff: [`design-handoff.md`](./design-handoff.md).

## 8. Phạm vi

Pilot **dừng ở Design handoff**. Không grill, không implement section trong ticket #95 — redesign thật là một topic sau, đi qua đúng pipeline này từ bước grill.
