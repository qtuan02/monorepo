# Design handoff — `portfolio-work-section`

> Bản chốt của pha **design** cho section **work** (Experience) trên trang CV `apps/portfolio`.
> Đọc cùng [`brief.md`](./brief.md) (đề bài, giá trị thật đã lift, Direction đã chọn) và các artboard
> trong [`artboards/`](./artboards). Đây là artefact `/grill-with-docs` stress-test, `/to-spec` dẫn tới,
> `/to-tickets` cắt ticket theo, và `/implement` mở cạnh ticket.
>
> **Direction đã chọn:** A · Rail thời gian, gập mặc định.
> **Bản đã chốt:** `artboards/` tại commit
> [`b3720a3`](https://github.com/qtuan02/monorepo/commit/b3720a3d4a3f1d823fccdda285cb979f94f74a56)
> — pilot [#95](https://github.com/qtuan02/monorepo/issues/95) · spec [#92](https://github.com/qtuan02/monorepo/issues/92)
>
> Không có URL Artifact và không có số version: pha design của repo này chạy **local-only, zero-tooling**
> (brief §7). Danh tính một bản chốt là **commit** của `artboards/` — commit trên là bản mới nhất, thay
> commit đầu tiên (2026-09-05) vì [#100](https://github.com/qtuan02/monorepo/issues/100) đổi **cơ chế
> hiển thị**, không đổi thiết kế: ảnh trỏ sang asset thật của app, `index.html` thay `canvas.json`. Xem
> canvas bằng cách mở [`artboards/index.html`](./artboards/index.html) — không có bước seed nào.
>
> **Phạm vi:** pilot dừng ở đây. Handoff này **không** implement gì — redesign thật là một topic sau,
> đi qua đúng pipeline từ `/grill-with-docs`.

---

## 1. Screen inventory

Một section, không phải một màn hình mới — nên bảng dưới đây có đúng một dòng.

| | |
|---|---|
| App | `@monorepo/portfolio` |
| Runtime | **Next** (App Router, `cacheComponents`, `reactCompiler`) — cluster rule `next-*` |
| Route / segment | `/` và `/en` → `src/app/[locale]/(shell)/page.tsx`; section là phần thứ ba của `home.template.tsx` |
| Guard | **Không** — trang public; `proxy.ts` của app này chỉ negotiate locale, không có nhánh session |
| Dữ liệu | **Hằng số của slice**: `WORK_ITEMS` trong `~/features/home/constants/resume.ts`. Không loader, không `"use cache"`, không TanStack Query |
| Vì sao không `"use cache"` | Payload cached phải serializable, còn `WORK_ITEMS` mang `StaticImageData`; lý do đã ghi trong comment của chính file đó — Direction A không đổi điều này |
| Server / client | Section là **Server Component**; chỉ hàng gập/mở là client island (`resume-card.tsx` đang `"use client"`) |
| Neo | `id="work"` — dock ở `~/features/layout/constants/navbar.ts` trỏ vào; **không được đổi** |
| Breakpoint | Một cột `max-w-2xl` (672px) `px-6` của shell; artboard vẽ desktop 720px, dark, và 390px |

Direction A **không** thêm route, segment, guard hay nguồn dữ liệu nào. Mọi thay đổi nằm trong hai file
component của slice.

## 2. Component map

Mỗi vùng UI trong artboard → nơi nó tồn tại trong code. Không mục nào để trống.

| Vùng UI trong artboard | Ánh xạ | Ghi chú |
|---|---|---|
| Tiêu đề `h2` "Kinh nghiệm làm việc" | **có sẵn** — `work-section.tsx`, không đổi | `text-xl font-bold` |
| Khung section + `BlurFade` stagger | **có sẵn** — `work-section.tsx` + `~/features/home/components/blur-fade.tsx` | không đổi |
| Một hàng (logo + header + body) | **có sẵn, sửa** — `~/features/home/components/resume-card.tsx` | không dùng `Card` là cố ý, giữ nguyên (comment trong file) |
| Logo tròn 48px | **có sẵn** — `next/image` + `rounded-full border object-contain` | artboard đổi nền `bg-background` → `bg-card`; **không** dùng `@monorepo/ui/components/avatar` — nó crop, còn logo cần `object-contain` |
| Viền brand 2px quanh logo vai trò hiện tại | **có sẵn, thêm class** — `border-2 border-primary` trên cùng `<Image>` | một prop boolean mới trên `ResumeCard` |
| Header là accordion (heading > button, `aria-expanded`) | **có sẵn** — shape WAI-ARIA đang có trong `resume-card.tsx` | **không** thay bằng `@monorepo/ui/components/accordion`: primitive đó dựng `Accordion`/`Item`/`Trigger`/`Panel` như một nhóm, còn mỗi hàng ở đây độc lập |
| Chevron xoay | **có sẵn** — `ChevronRightIcon` từ `lucide-react` | artboard hiện chevron mờ 45% cả khi chưa hover (hôm nay `opacity-0` tới hover) |
| Khoảng thời gian dạng text (vai trò cũ) | **có sẵn** — `text-muted-foreground tabular-nums` | không đổi |
| Pill khoảng thời gian + chấm (vai trò hiện tại) | **primitive có sẵn, override tại call site** — `@monorepo/ui/components/badge` + `className` | `Badge` mặc định đã `rounded-4xl` (đúng hình pill ở cỡ nhỏ); không variant nào cho `bg-accent text-accent-foreground`, nên override `className`. Tiền lệ nằm ngay trong slice này: `skills-section.tsx` đã làm đúng vậy (`<Badge className="rounded-sm px-1.5 …">`) |
| Chip công nghệ | **primitive có sẵn, override tại call site** — `Badge` + `className` | `bg-muted text-muted-foreground rounded-sm text-xs`; `--muted` chứ không `--secondary` (hai token cùng giá trị `oklch(0.9642 0 0)`, chọn theo ngữ nghĩa: chip là thông tin phụ, không phải một hành động phụ) |
| Nhóm chip có tràn `+n công nghệ` | **cần thêm — composite của slice** `~/features/home/components/tech-chip-list.tsx` | thứ duy nhất thật sự mới: nhận `techStack` + số chip hiện, render `Badge` cho từng chip và một `Badge` cuối cho phần tràn. Xem mục 6 câu hỏi 1 |
| Rail thời gian dọc nối bốn logo | **cần thêm — layout trong `work-section.tsx`** | một `<div>` `absolute left-[23px] w-0.5 bg-border` trong container `relative`; **không** phải `@monorepo/ui/components/separator` — cái đó là `role="separator"`, còn đây là trang trí |
| Danh sách bullet | **có sẵn** — `ul.list-inside.list-disc` trong `resume-card.tsx` | artboard nới khoảng cách dòng; giữ `<ul>`/`<li>` |
| Thân gập/mở | **có sẵn** — `motion.div` trong `resume-card.tsx` | xem mục 6 câu hỏi 3 |

**Không cần `ui-add` primitive nào**, và chỉ **một** composite thật sự mới: `tech-chip-list`. Nó thuộc
slice `home` chứ không phải `~/components`, vì chỉ section này dùng nó — `architecture-shared-components`
giữ `~/components` cho thứ **nhiều hơn một** slice dùng.

## 3. Token delta

**Delta màu / radius / font = 0.** Mọi giá trị trên artboard quy được về `tooling/tailwind/theme.css`:

| Giá trị trong artboard | Token | Class |
|---|---|---|
| `oklch(0.9794 0.0013 286.38)` nền | `--background` | `bg-background` |
| `oklch(0.4134 0.0432 258.79)` chữ | `--foreground` | `text-foreground` |
| `oklch(0.5032 0 0)` period, chip | `--muted-foreground` | `text-muted-foreground` |
| `oklch(1 0 0)` nền logo | `--card` | `bg-card` |
| `oklch(0.9551 0 0)` viền logo, rail | `--border` | `border` / `bg-border` |
| `oklch(0.6591 0.1012 181.55)` viền brand, chấm | `--primary` | `border-primary` / `bg-primary` |
| `oklch(0.987 0.018 188.41)` nền pill | `--accent` | `bg-accent` |
| `oklch(0.5992 0.082 182.46)` chữ pill, `+n` | `--accent-foreground` | `text-accent-foreground` |
| `oklch(0.9642 0 0)` nền chip | `--muted` (`--secondary` cùng giá trị; chọn theo ngữ nghĩa) | `bg-muted` |
| `9999px` | — | `rounded-full` |
| `6px` | `--radius-sm` | `rounded-sm` |
| font stack | `--font-sans` | mặc định |
| dark: `0.145` · `0.985` · `0.205` · `0.708` · `1 0 0 / 10%` · `0.269` · `0.7893 0.0875 183.49` · `0.35 0.0382 184.2` | `--background --foreground --card --muted-foreground --border --muted --primary --accent` ở `.dark` | tự đổi theo class |

Direction A **dùng** bốn token trước đây section này chưa chạm — `--primary`, `--accent`,
`--accent-foreground`, `--muted` — nhưng cả bốn đã có sẵn trong theme port từ web-emr. **Không có
dòng "thêm", không có dòng "đổi"**, nên topic này **không** cần ticket token delta và **không** cần ADR.

**Bốn giá trị không phải token nhưng cũng không nằm trên scale Tailwind** — delta *type scale*, không phải
delta *theme*, nhưng vẫn phải quyết ở ticket vì `quality-styling-tailwind` cấm arbitrary-value px:

| Giá trị | Vấn đề | Đề xuất |
|---|---|---|
| chip `font-size: 11px` | scale gần nhất `text-xs` = 12px | dùng `text-xs`, chấp nhận chip cao thêm ~1px |
| mobile company `13px`, period `11px` | cùng lý do | `text-sm` / `text-xs` |
| pill `padding: 3px 10px` | `py-0.5` = 2px, `py-1` = 4px | `px-2.5 py-1` |
| chấm trong pill `6px` | `size-1.5` = 6px khớp, nhưng artboard mobile vẽ `5px` | thống nhất `size-1.5` ở mọi breakpoint |

## 4. State list

Section này **không có** loading, empty hay error: dữ liệu là hằng số của slice, có mặt trong HTML đầu
tiên, không có request nào để hỏng. Cũng **không có** guarded/guest — trang public. Ghi rõ ở đây để
`/to-tickets` không cắt một ticket skeleton cho thứ không tồn tại (`patterns-loading-skeletons` không áp
dụng vào section này).

Trạng thái thật của một hàng, đúng thứ tự artboard `States.dc.html`:

| # | Trạng thái | Hình dạng |
|---|---|---|
| 1 | **Gập** — mặc định cho ba vai trò cũ | header + 3 chip + `+n công nghệ`; chevron mờ 45%, không xoay; không bullet |
| 2 | **Hover** | chevron rõ hẳn và dịch phải 4px; nền hàng ngả `accent` |
| 3 | **Focus bàn phím** | ring 3px `--ring` quanh cả vùng bấm; **một** Tab stop mỗi hàng |
| 4 | **Mở** | chevron xoay 90°; bullet hiện; chip nở hết danh sách (10 chip ở `arobid`) |
| 5 | **Vai trò hiện tại** — mặc định mở | viền logo 2px `--primary`; period thành pill `accent` có chấm `primary` |
| — | **Dark** | mọi token tự đổi theo `.dark`; `Dark.dc.html` xác nhận pill và chip vẫn đọc được |
| — | **390px** | period ở cùng dòng tiêu đề, chức danh xuống dòng riêng, chip còn 2 + `+n` |

Đảo mặc định là thay đổi hành vi lớn nhất của Direction A: hôm nay cả bốn hàng `defaultExpanded`, sau đó
chỉ hàng đầu mở.

## 5. Copy

Namespace `portfolio.work.*` trong `packages/i18n/src/locales/{vi,en}.json`. Mọi key hiện có **giữ
nguyên** — không role, period hay bullet nào đổi chữ.

**Key mới cần thêm** (ICU, `{count}` chứ không `{{count}}`, không rich-text tag):

| Key | `vi` | `en` |
|---|---|---|
| `portfolio.work.moreTech` | `+{count, plural, other {# công nghệ}}` | `+{count, plural, one {# more} other {# more}}` |
| `portfolio.work.current` | `Vai trò hiện tại` | `Current role` |

`portfolio.work.current` là nhãn ẩn (`sr-only`, hoặc `aria-label` của pill): pill phân biệt vai trò hiện
tại **chỉ bằng màu và một chấm**, mà màu không phải một kênh thông tin — mục soát `web-design-guidelines`
bắt đúng chỗ này.

**Key thành thừa:** `portfolio.work.techStack` (`"Công nghệ:"` / `"Tech Stack:"`). Direction A thay câu
`Công nghệ: a, b, c` bằng chip, nên nhãn không còn chỗ đứng. Hai lựa chọn — xoá hẳn, hoặc giữ làm
`aria-label` cho nhóm chip. Đề xuất **giữ và đổi vai**: một nhóm chip không có nhãn thì screen reader đọc
ra một chuỗi tên sản phẩm rời rạc. Quyết ở ticket.

`portfolio.work.toggle` (`"Xem chi tiết công việc"`) giữ nguyên, vẫn là `aria-label` của nút.

Tên công ty và `techStack` **không** dịch — danh từ riêng, đã nằm trong `WORK_ITEMS`, đúng như comment
của `types/resume.ts` giải thích.

## 6. Câu hỏi mở cho grill

1. **`+n công nghệ` không làm được bằng CSS thuần.** Artboard desktop hiện 3 chip + `+7`, artboard 390px
   hiện 2 chip + `+8`. Số trong nhãn phụ thuộc số chip đang hiện, mà số chip đang hiện phụ thuộc
   breakpoint — CSS ẩn được chip nhưng không sửa được chữ. Ba lối: (a) cố định 3 chip ở mọi breakpoint và
   để nó wrap trên 390px; (b) `useIsMobile` từ `@monorepo/hook`, đổi lại nhãn phụ thuộc client và HTML đầu
   tiên sai một nhịp; (c) bỏ số, để `+ thêm`. Đề xuất **(a)** — rẻ nhất và giữ section là Server Component.
   Cần chốt trước khi cắt ticket.

2. **Đảo mặc định gập/mở có làm mất nội dung với crawler không?** Trang này là thứ crawler đọc. Ba thân
   gập lại vẫn nằm trong HTML (chỉ `height: 0`), nên về index là không mất — nhưng cần xác nhận đây đúng
   là ý muốn: 20 bullet vẫn ở trong document, chỉ người đọc mới không thấy ngay.

3. **Thân gập animate `height`.** `resume-card.tsx` đang `animate={{ height }}`, còn
   `web-design-guidelines` nói chỉ animate `transform` / `opacity`. Hôm nay gần như vô hại vì mọi hàng mở
   sẵn và không ai bấm; với Direction A nó thành tương tác chính, chạy trên bốn hàng. Đổi sang
   grid-rows / `transform`, hay chấp nhận?

4. **Không chỗ nào trong `apps/portfolio` honour `prefers-reduced-motion`** — không `BlurFade`, không
   `motion.div` của thân, không View Transition của theme toggle. Direction A thêm chuyển động chứ không
   bớt. Đây là một ticket riêng của app, hay một dòng trong ticket UI?

5. **Rail thời gian là trang trí hay ngữ nghĩa?** Bản vẽ là một vạch `absolute` nối bốn logo. Nếu chỉ
   trang trí thì `aria-hidden` là xong; nếu nó có nghĩa "liên tục từ 2023 đến nay" thì khoảng cách giữa
   các logo đang **không** tỉ lệ với thời gian — quãng nghỉ 09/2023 → 03/2024 nhìn giống hệt
   02/2025 → 02/2026 — và một người đọc kỹ sẽ hiểu sai.

6. **`ResumeCard` cũng phục vụ `education-section.tsx`.** Thêm prop cho viền brand, pill, chip và đảo
   `defaultExpanded` làm component phình theo hướng chỉ `work` dùng. Tách một `WorkRow` riêng cho slice,
   hay giữ một component nhiều prop?

7. **Chip `+7 công nghệ` mang màu `accent-foreground` như một link nhưng không bấm được.** Đổi sang
   `muted-foreground`, hay làm nó bấm được thật (mở hàng)?
