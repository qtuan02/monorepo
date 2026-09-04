---
status: done
---

# 05 — `@monorepo/ui` trên Base UI, style `base-vega`, đủ bộ registry

**What to build:** Developer chạy `bun run --filter @monorepo/ui ui-add <name>` và nhận đúng bản `base-vega` chính chủ từ registry shadcn, ghi vào package với import nội bộ `#components/*`/`#utils/cn`; mọi primitive của reference (đủ bộ registry hiện hành) có mặt, composition qua `render` prop, state qua data-attribute trần, không còn gói `@radix-ui/*` nào trong workspace. Package source-only, `private`, không barrel; util framework-free (`cn`, `build-pagination-pages`) có test node env.

**Blocked by:** 01 — Nền root; 02 — Package framework-free (cần `@monorepo/hook/use-is-mobile` cho sidebar).

**Status:** done (2026-09-04)

- [x] `components.json` `style: "base-vega"`, `tailwind.css` trỏ globals của package, aliases `#components`/`#utils/cn`, `package.json` `imports` khai `#components/*` và `#utils/cn`, `exports` `./components/*` (.tsx) và `./utils/*` (.ts) — riêng alias `hooks` lệch reference có chủ ý, xem "Alias `hooks`"
- [x] Danh sách component = danh sách của reference `packages/ui/src/components` (63 file); 61 file là output `shadcn add --overwrite` (CLI 4.20.1), 2 file (`data-table`, `date-picker`) **không sinh được** — xem "Hai file không phải registry item"
- [x] `@base-ui/react` 1.7.0, `class-variance-authority` 0.7.1, `tailwind-merge` 3.6.0, `lucide-react` 1.40.0, `react-day-picker` 10.0.1; không package nào trong workspace khai trực tiếp `@radix-ui/*`, `radix-ui`, `vaul`, `sonner` — xem "Radix trong lockfile"
- [x] Biome override cho `packages/ui/src/components/**` (tắt `a11y`, `noDocumentCookie`) có trong `biome.json` root (đã có sẵn từ ticket 01)
- [x] Vitest 5 node env cho utils; 17 test xanh
- [x] `bun run typecheck` xanh với TS 7 trên toàn bộ component
- [x] Gate xanh local (CI chờ push, giống ticket 01)

---

## Kết quả (2026-09-04)

`D:\Personal\monorepo\packages\ui` — 73 file, 8.530 dòng component. Gate local: `check` 141 file
0 lỗi 0 warning · `typecheck` 8/8 package · `test` 5/5 package, 112 test (ui đóng góp 17) ·
`build` 0 task (chưa package nào có script `build` — đúng thiết kế source-only).

Version thực tế trong `bun.lock` (checkbox 3 đòi ghi lại):

| Package | Version | Nguồn |
|---|---|---|
| `@base-ui/react` | 1.7.0 | `catalog:` |
| `class-variance-authority` | 0.7.1 | `catalog:` |
| `tailwind-merge` | 3.6.0 | `catalog:` |
| `lucide-react` | 1.40.0 | `catalog:` |
| `@tanstack/react-table` | 9.2.4 | `catalog:tanstack-table9` |
| `clsx` | 2.1.1 | `catalog:` |
| `react-day-picker` | 10.0.1 | registry |
| `@shadcn/react` | 0.3.1 | registry (`message-scroller`, `questionnaire`) |
| `recharts` | 3.8.0 | registry (`chart`) |
| `cmdk` | 1.1.1 | registry (`command`) |
| `date-fns` | 4.4.0 | registry (đi theo `react-day-picker`) |
| `embla-carousel-react` | 8.6.0 | registry (`carousel`) |
| `input-otp` | 1.5.0 | registry (`input-otp`) |
| `react-resizable-panels` | 4.12.3 | registry (`resizable`) |

`ui-add` **pin `shadcn@4.20.1`**, không `@latest` như reference: `@latest` làm 63 file drift ở lần
add sau mà không cảnh báo, và ticket đóng đinh CLI 4.20.x.

## Alias `hooks` — chỗ duy nhất lệch reference, và lý do

Reference đặt `"hooks": "@medviet/hook"` trong `components.json` để lần `ui-add` sau CLI không sinh
lại bản sao hook trong package UI. **Cấu hình đó không chạy được trên CLI 4.20.x.** 4.20 validate
*mọi* alias trước khi làm gì, và dựng alias candidate từ `exports` của package đích: `@monorepo/hook`
khai subpath-only (`{"./*": "./src/*.ts"}`), nên nó sinh key méo `@monorepo/hook/*/*` và alias không
bao giờ khớp. Kết quả là `Could not resolve the following aliases: hooks`, CLI dừng, không file nào
được ghi.

Đã thử và **loại** ba đường:

| Cách | Kết quả |
|---|---|
| `tsconfig.paths` `"@monorepo/hook/*": [...]` | vẫn 404 alias — CLI khớp key chính xác, `/*` không match tên trần |
| `tsconfig.paths` `"@monorepo/hook": ["../hook/src"]` | alias resolve, nhưng CLI đòi `components.json` trong `packages/hook` (nó coi đó là workspace đích để ghi file) |
| thêm `components.json` vào `packages/hook` | vẫn hỏng ở bước resolve alias của chính `packages/ui` |

Đường duy nhất còn lại là cho `@monorepo/hook` một root entry `"."` — mà
`quality-avoid-barrel-imports` cấm (chỉ `dayjs` được phép). Nên **cấu hình của reference và một
`ui-add` chạy được là loại trừ nhau trên 4.20.x**; `ui-add` của reference hiện đang hỏng, chưa ai phát
hiện vì chưa chạy lại trên CLI này.

Chốt ở Target: `"hooks": "#hooks"` + `imports` khai `"#hooks/*": "./src/hooks/*.ts"`, trỏ vào thư mục
**cố ý không tồn tại**. Nó là **bãi đáp, không phải chỗ ở**: CLI thả hook xuống đó, rồi
`scripts/guard-no-local-hooks.ts` (chạy cuối `ui-add`) **fail** và chỉ đúng việc phải làm — chuyển sang
`@monorepo/hook`, sửa import, xoá `src/hooks/`. Đó chính là đường `sidebar.tsx` đã đi để thành
`import { useIsMobile } from "@monorepo/hook/use-is-mobile"`. Trạng thái code cuối cùng vì thế **giống
hệt reference**; chỉ đường đi tới đó là khác, và giờ nó tự canh chứ không dựa vào trí nhớ.

> Ticket 10 (rules) phải sửa `quality-imports.md` cho Target: câu "The map covers components and `cn`
> only — there is no `#hooks/*`" đúng với reference nhưng **sai với Target**. Viết lại kèm lý do trên.

## Hai file không phải registry item

`data-table` và `date-picker` **không** `shadcn add` được: `/r/styles/base-vega/{data-table,date-picker}.json`
trả 404, trong khi trang docs của chúng vẫn sống — shadcn để chúng ở dạng *guide/composition*
(`date-picker` = `Popover` + `Calendar`; `data-table` = guide trên `table` + `@tanstack/react-table` v9).
Reference đã ghi đúng điều này trong `docs/research/shadcn-base-components-inventory.md`, và hai file
của reference là **compose tay theo guide**, không phải output CLI.

Nên hai file này được **copy từ reference** (chỉ đổi `@medviet/dayjs` → `@monorepo/dayjs` trong một
comment), và `@tanstack/react-table` thêm từ `catalog:tanstack-table9` (9.2.4 — đúng major mà guide
hiện hành viết cho). **Chạy `ui-add` sẽ không tái sinh chúng**; ai xoá nhầm phải copy lại hoặc compose
lại theo docs.

## Radix trong lockfile

Checkbox 3 viết "không có `@radix-ui/*` … trong lockfile" — **đọc theo nghĩa đen thì không bao giờ tick
được**. Lockfile có 17 entry `@radix-ui/*`, tất cả transitive qua `cmdk@1.1.1`, thứ mà registry item
`command` bắt buộc. Không `package.json` nào trong workspace khai trực tiếp, không có `radix-ui` (meta),
không `vaul`, không `sonner`, không file nào trong `src` import `@radix-ui`. Reference ở trạng thái y
hệt (24 entry, cùng nguồn `cmdk`). Tiêu chí thật là **"không package nào trong workspace khai trực
tiếp"** — đã sửa lại lời checkbox cho đúng.

## Sửa tay trên file registry (giữ Biome xanh)

Năm file, tất cả trùng đúng chỗ reference đã sửa và ghi lý do:

- `chart.tsx` — `key={index}` → `key={key}` ở tooltip và legend (biến `key` đã tính sẵn ngay trên);
  `biome-ignore lint/security/noDangerouslySetInnerHtml` cho `ChartStyle` (nội dung dựng từ
  `ChartConfig` của caller). **Lưu ý:** tham số `index` của `.map` ở nhánh tooltip phải **giữ lại** —
  nó vẫn được truyền cho `formatter(...)`; bỏ đi là lỗi TS2304 (đã vấp và sửa).
- `sidebar.tsx` — import `@monorepo/hook/use-is-mobile`; hai dependency array thừa `setOpenMobile`
  (fix `--unsafe` của Biome, không đổi hành vi).
- `field.tsx` — `uniqueErrors?.length == 1` → `.length === 1`; `key={index}` → `key={error.message}`
  (map đã dedupe *theo message*, nên message là khoá duy nhất).
- `slider.tsx` — `key={index}` → `` key={`slider-thumb-${index}`} `` + `biome-ignore` có lý do (thumb
  là positional theo định nghĩa).
- `scroll-area.tsx` — bỏ `import * as React` không dùng.

## Test

- `test/utils/build-pagination-pages.test.ts` — port từ reference (11 case), giữ nguyên regression test
  cho bug "gán side của ellipsis theo array index"; một comment nhắc màn hình MedViet đã viết lại trung
  tính.
- `test/utils/cn.test.ts` — **viết mới**, reference không có. `cn` là một dòng, nhưng là dòng mà 63
  primitive đều kết thúc bằng nó; 6 case khoá đúng *contract* mà primitive dựa vào (điều kiện falsy
  rụng; class của caller thắng khi cùng property), tức thứ mà một major của `tailwind-merge` có thể phá
  âm thầm.

## Còn nợ (không chặn)

- **`bun run build` chạy 0 task.** Đúng thiết kế (source-only), nhưng nghĩa là job `build` của Gate hiện
  chưa chứng minh gì. Nó chỉ có việc từ ticket 07 (template Vite) trở đi.
- **CI chưa chạy.** Nhánh `feat/upgrade` chưa push, y như ticket 01 để lại. `.github/workflows/ci.yml`
  đã có.
- **Verify bằng mắt là việc của ticket 06.** jsdom không tính layout, nên bẫy `@custom-variant`
  `data-horizontal`/`data-vertical` (42 chỗ dùng trong package này) chỉ lộ trong Storybook thật.
- **`tooling/tailwind/globals.css` đặt `isolation: isolate` trên `#root`** — hình dạng của Vite. App
  Next (ticket 08) không có `#root`, nên overlay portal sẽ mất stacking context. Ticket 08 phải mở rộng
  selector, không phải copy nguyên.
- **`date-picker.tsx` tự cài mini date-library** (`defaultFormatDate`/`defaultParseDate`/`maskDateText`
  + literal `"dd/MM/yyyy"`), đi ngược `dates-dayjs-singleton`. Comment trong file đã nói app inject cặp
  format/parse của mình; biến chúng thành prop **bắt buộc** là quyết định của ticket 07/08, không phải
  chỗ này (ticket cấm sửa tay ngoài chỗ reference đã ghi lý do).
- **Chuỗi tiếng Việt hard-code** trong `date-picker.tsx` (`"Chọn ngày"`, `aria-label="Mở lịch"`) và
  `data-table.tsx` (`"Không có kết quả."`, `aria-label="Trang đầu"`…). Nhất quán với
  `defaultLanguage = "vi"` của `@monorepo/i18n`, nhưng chỉ `emptyMessage` là prop — phần còn lại không
  override được. Đưa hết ra prop có default là việc của ticket 07/08.
- `data-table.tsx` dùng `useEffect` sync `pageSize` xuống table và selector `(state) => state` — cả hai
  thừa hưởng từ reference, có comment giải thích, chưa đụng.
