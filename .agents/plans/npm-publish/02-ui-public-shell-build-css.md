---
status: done
---

# 02 — `ui-public`: Publish shell, build rslib trong `@monorepo/ui`, inline hook, CSS entry

**What to build:** Cùng project Vite tạm của smoke test cài thêm tarball `@fe-monorepo/ui@2.0.0`, import `Button` từ `@fe-monorepo/ui/components/button`, `@import "@fe-monorepo/ui/globals.css"` cộng `@source` trỏ vào `dist/` của package, và typecheck + `vite build` xanh với Tailwind v4. `dist/` của `ui` không còn specifier `#components/*`, `#utils/cn`, `#hooks/*` hay `@monorepo/*` nào — hook duy nhất nó dùng (`useIsMobile`) được inline. Storybook và app trong repo vẫn import `@monorepo/ui/components/*` từ source.

**Blocked by:** 01 — đường build → shell → tarball → consumer đã chạy trên `hook`; smoke test chung đã có chỗ nối.

**Status:** done

## Acceptance criteria

- [x] Workspace mới `packages/ui-public`: `package.json` viết tay (tên `@fe-monorepo/ui`, `2.0.0`, `exports` `./components/*`, `./utils/*`, `./globals.css` trỏ `dist/`, `sideEffects: ["./dist/globals.css"]`, `peerDependencies` literal `react`/`react-dom >=19` + `tailwindcss ^4`, `dependencies` là các runtime dep thật của `ui` với range literal chép từ version đã resolve trong `bun.lock` — không có `@fe-monorepo/hook`, không `catalog:`/`workspace:`), README cho consumer (cài, import subpath, CSS + ví dụ `@source`, peer, bảng 63 primitive, link Storybook), `dist/` gitignored.
- [x] `@monorepo/ui` có `rslib.config.ts` + tsconfig build theo mẫu ticket 01; `autoExternal` cho dependencies/peer; `@monorepo/hook` **không** external mà được bundle vào; `src/hooks/` (landing pad không tồn tại) không làm build đỏ; `.tsx` → `.js` per-file dưới `dist/components/` và `dist/utils/`. *(Kết quả đạt, cơ chế khác — xem "Hook: không bundle được, và cách thay thế".)*
- [x] Xác nhận rslib rewrite `#components/*` và `#utils/cn` thành đường dẫn tương đối `.js` trong cả `.js` lẫn `.d.ts`. *(Tự làm được trong `.js`; `.d.ts` cần restate alias thành `compilerOptions.paths` — ghi bên dưới.)*
- [x] Bước sau build sinh `dist/globals.css` từ `theme.css` + `globals.css` của `@monorepo/tailwind-config`, giữ nguyên hai `@custom-variant data-horizontal`/`data-vertical`; có một assert (grep) trong smoke test rằng hai dòng đó có mặt.
- [x] `guard:no-local-hooks` và `ui-add` vẫn chạy như cũ; `bun run --filter @monorepo/ui test` (utils) vẫn xanh; Storybook test `composeStories` vẫn xanh.
- [x] `publish:smoke` mở rộng: pack cả hai shell, project tạm cài cả hai, thêm `tailwindcss` + `@tailwindcss/vite`, import `Button` + `useDebounce`, CSS + `@source`, `tsc --noEmit` + `vite build` xanh; assert thêm `dist/` của `ui` không chứa `#components`, `#utils`, `#hooks`, `@monorepo/`; assert CSS build ra có class của Button.
- [x] `turbo.json` của `@monorepo/ui` khai `build.outputs` sang `dist/` của shell; cache hit lần hai.
- [x] Gate xanh 0 warning + `bun run publish:smoke` xanh. Ghi output vào Notes.
- [x] Không đổi `exports`/`imports` của `@monorepo/ui`, không đổi source primitive nào vì publish.

## Notes

Làm ngày 2026-09-04. Gate xanh 0 warning, `publish:smoke` xanh:

```
bun run check         → Checked 367 files in 66s. No fixes applied.
bun run typecheck     → Tasks: 14 successful, 14 total
bun run test          → Tasks: 10 successful, 10 total
bun run build         → Tasks:  5 successful,  5 total
bun run publish:smoke → OK - publish smoke test passed
```

Ba con số Turbo đều +1 so với ticket 01 (13/9/4) vì đúng một lý do: `@monorepo/ui` giờ có
task `build`. `typecheck` và `test` khai `dependsOn: ["^topo", "^build"]`, nên task đó bị kéo
vào cả hai đồ thị — không workspace nào mọc thêm script.

`npm pack --dry-run` trong shell: **143 file, 61.7 kB** (348.6 kB unpacked) — `README.md`,
`package.json`, và 141 file `dist/`: 65 `.js` + 65 `.d.ts` (63 primitive + 2 util), 10 file
`internal/` (hook vendor), `globals.css`. `git check-ignore` xác nhận `dist/` bị
`.gitignore:40` bắt.

### Hook: không bundle được, và cách thay thế

AC nói "`@monorepo/hook` không external mà được bundle vào". **Không cấu hình nào của rslib
làm được điều đó ở bundleless mode** — giới hạn của tool, không phải của config: tài liệu
`output.autoExternal` nói thẳng *"This feature is exclusive to bundle mode and does not apply
to bundleless mode"*. Ở bundleless, mọi specifier không tương đối đều external, hết. Đã thử
và đều hỏng:

- `resolve.alias` trỏ `@monorepo/hook/use-is-mobile` sang `../hook/src/use-is-mobile.ts`:
  output giữ nguyên specifier cũ. Externalize chạy **trước** alias nên alias không tới lượt.
- `compilerOptions.paths` trỏ sang `../hook/src/*`: tsgo đỏ TS6059 (ngoài `rootDir`), còn
  phía `.js` vẫn external như cũ.

Cách đang dùng đạt đúng **kết quả** AC muốn (`dist/` không còn `@monorepo/*`, shell không
depend `@fe-monorepo/hook`) bằng hai mảnh trong `rslib.config.ts`:

1. `lib[1]` biên dịch `../hook/src/*.ts` (rootDir riêng, `tsconfig.hook.json`) vào
   `dist/internal/` — từ **source** chứ không copy `hook-public/dist`, nên không sinh ràng
   buộc thứ tự build giữa hai package.
2. `lib[0].output.externals` map `@monorepo/hook/use-is-mobile` →
   `../internal/use-is-mobile.js`. Rspack ghi thẳng specifier đó vào `sidebar.js`.

Hai hệ quả cần biết trước khi sửa:

- **`../internal/` đúng vì mọi file output nằm sâu đúng một cấp** (`components/`, `utils/`).
  Thêm một file ngay `src/*.tsx` mà nó import hook thì đường dẫn đó sai. Hai thứ chặn:
  `assertRelativeImportsResolve()` trong `scripts/build.ts` (thêm sau code review — xem cuối
  file) làm build đỏ ngay, và smoke test import `SidebarProvider` nên `vite build` cũng phải
  resolve đường này thật. Assert specifier thì **không** bắt được, vì nó đọc đường dẫn *nói
  gì* chứ không phải nó *tới đâu*.
- **Vendor cả 5 hook, không chỉ closure 3 file.** Bundleless chỉ emit file nằm trong entry,
  nên danh sách chọn tay sẽ đẻ ra import treo (`./use-media-query.js` không tồn tại) vào ngày
  đồ thị import của `hook` đổi. 5 file = 2.6 kB, và không file nào với tới được từ `exports`
  của shell.

Nếu sau này `ui` dùng thêm hook: `lib[1]` đã bọc cả package, chỉ cần thêm một dòng vào
`externals`.

### `#`-specifier: `.js` tự xong, `.d.ts` thì không

Đo được cả hai chiều:

- **`.js` không cần cấu hình gì.** Rspack resolve `imports` field của chính
  `packages/ui/package.json`, thấy `#components/button` → `src/components/button.tsx` nằm
  trong source root, nên coi là nội bộ và redirect thành `./button.js`.
- **`.d.ts` thì hỏng im lặng.** tsgo không đi qua đường đó: bỏ `paths` khỏi
  `tsconfig.build.json` rồi build lại, **mọi** `.d.ts` ship `#components/button` — specifier
  không consumer nào resolve được, và không thứ gì trong repo bắt được, vì `#` chạy tốt từ
  bên trong package. Chữa bằng cách viết lại chính ba alias đó thành `compilerOptions.paths`.

`#hooks/*` được giữ trong `paths` dù `src/hooks/` cố tình không tồn tại: TS không báo lỗi cho
path mapping không có file, và ngày `ui-add` thả một hook vào đó thì `.d.ts` được redirect
đúng thay vì ship `#hooks/...` (`guard:no-local-hooks` vẫn là thứ chặn nó ở lại).

### CSS entry là **fragment**, không phải entry Tailwind đầy đủ

`scripts/build.ts` sinh `dist/globals.css` bằng cách inline `theme.css` vào `globals.css` của
`@monorepo/tailwind-config` và **bỏ đúng một dòng**: `@import "tailwindcss";`. Lý do:
`tailwindcss` nằm ở `peerDependencies` — consumer sở hữu entry Tailwind của họ, và ship thêm
một `@import "tailwindcss"` nữa sẽ emit preflight cùng toàn bộ layer utility hai lần. README
viết đúng ba dòng consumer phải gõ, và smoke test dùng đúng ba dòng đó.

`tw-animate-css` và `tailwind-scrollbar` là **`dependencies` thật của shell**, không phải
peer: `dist/globals.css` `@import`/`@plugin` chúng, và Tailwind resolve hai specifier đó
tương đối với chính file CSS trong `node_modules`. `ui` dùng cả hai (`animate-in`,
`fade-in-0`, `zoom-in-95`, `slide-in-from-*`; `scrollbar-thin`, `scrollbar-none`,
`scrollbar-gutter-stable`), nên thiếu chúng là component mất animation và scrollbar mà không
báo gì.

Script tự chặn drift: **throw** nếu `globals.css` upstream không còn dòng
`@import "tailwindcss";` hoặc `@import "./theme.css";` để thay, và throw nếu file sinh ra mất
một trong hai `@custom-variant`. Không bước nào chép tay.

### Smoke test: hai thay đổi ngoài việc thêm shell

- **Assert CSS build ra strip nháy trước khi so.** Vite minify, nên
  `[data-orientation="vertical"]` ra thành `[data-orientation=vertical]`. Hai fragment đang
  assert: `.whitespace-nowrap` (utility gốc của Button — bằng chứng `@source` khiến Tailwind
  quét package trong `node_modules`) và `[data-orientation=vertical]` (bằng chứng hai
  `@custom-variant` vừa ship vừa được compile).

**Đã test ngược:** bỏ dòng `@source` khỏi CSS consumer → cả hai assert đỏ, trong khi
`vite build` vẫn xanh và vẫn emit stylesheet. Đúng lớp lỗi mà Tailwind v4 không bao giờ báo.

### Những lựa chọn nhỏ, và lý do

- **`build` là `bun scripts/build.ts`, không phải `rslib build`.** Script sở hữu hai việc
  quanh rslib: dọn `dist/` của shell trước, sinh CSS sau. `cleanDistPath` để `false` ở **cả
  hai** lib — dist root của `lib[0]` là thư mục **cha** của `lib[1]`, nên để rslib dọn là mở
  cửa cho race. (Ticket 01 chỉ có một lib nên `cleanDistPath: true` ở đó là đủ.)
- **Range `dependencies` chép đúng range workspace khai**, sau khi giải `catalog:` ra giá trị
  thật: catalog nói `^1.7.0` thì shell nói `^1.7.0`, catalog nói `1.40.0` thì shell nói
  `1.40.0`. Bản publish do đó rộng đúng bằng repo, không rộng hơn. (Bản đầu nới hết thành
  caret; xem "Sửa sau `/code-review`".)
- **`date-fns` giữ làm `dependencies` trực tiếp** dù không file nào trong `packages/ui/src`
  import nó (nó là dep của `react-day-picker`). Spec liệt kê tường minh; để lại là vô hại.
- **`any` trong `.d.ts` có, nhưng không rò từ đây**: mọi chỗ đều là
  `React.ReactElement<unknown, string | React.JSXElementConstructor<any>>` — kiểu của chính
  React, đi ra từ `useRender.ComponentProps`. Ticket 02 không có AC cấm `any` (khác 01); ghi
  lại để lần sau không ai đi truy.
- **Turbo cache `dist/` ngoài package chạy đúng lần thứ hai:** xoá sạch
  `packages/ui-public/dist` rồi `bun run build --filter @monorepo/ui` →
  `cache hit … >>> FULL TURBO` trong 218ms, khôi phục đủ 141 file, `globals.css` có mặt.

### Chưa làm (đúng phạm vi ticket)

Không đụng `exports`/`imports` của `@monorepo/ui`, không sửa file nào trong `packages/ui/src`,
không thêm `.changeset/` (ticket 03), không thêm job CI (ticket 03), không đụng CLAUDE.md /
`.agents/commands.md` / `README.md` / rule (ticket 04).

`CONTEXT.md`, `CONTEXT-MAP.md` và `decisions.md` vẫn lệch khỏi HEAD trong working tree — đó là
phần thuật ngữ **Publish shell** viết ở giai đoạn `/to-spec`, ticket 01 cũng để lại. Nó thuộc
ticket 04; đừng commit lẻ.

### Sửa sau `/code-review`

Hai review agent (Standards + Spec) chạy trên commit `816c39f`. Hai trục **độc lập** chỉ ra
cùng hai chỗ, nên cả hai đều sửa:

- **Pin lại 5 dependency mà repo cố tình pin cứng.** Shell đang nới tất cả thành caret; đúng
  ra range publish phải **chép đúng range workspace khai** (giải `catalog:` ra giá trị thật),
  chứ không tự nới. Đã đổi `class-variance-authority` `^0.7.1`→`0.7.1`, `lucide-react`
  `^1.40.0`→`1.40.0`, `recharts` `^3.8.0`→`3.8.0`, `tailwind-scrollbar` `^4.0.2`→`4.0.2`,
  `tw-animate-css` `^1.4.0`→`1.4.0`. 11 dep còn lại giữ caret vì workspace cũng khai caret.
  Lý lẽ "caret cho consumer dedupe" trong bản đầu sai chỗ: nó **phát minh** một quyết định
  version mới thay vì chuyển tiếp quyết định repo đã cân nhắc, và cho consumer cài minor mà
  Gate chưa từng chạy qua.
- **Bỏ `importsFrom`, trả assert về `text.includes()` như ticket 01.** Bản đầu nới hợp đồng
  assert (substring → dạng có nháy) chỉ vì `dist/globals.css` mang comment nhắc `@monorepo/ui`
  ở dạng văn xuôi — tức là sửa cái thước thay vì sửa cái sai. Cái sai thật: một file publish
  không nên trỏ người đọc tới package không tồn tại trên npm. Đã sửa đúng một cụm từ trong
  `tooling/tailwind/globals.css` ("in `@monorepo/ui`" → "in the UI package"), và
  `buildGlobalsCss` giờ **throw** nếu file sinh ra còn chuỗi `@monorepo/`, kèm câu chỉ thẳng
  chỗ phải sửa. Assert của `hook-public` do đó không bị đụng tới, và lỗi lộ ở build chứ không
  phải ở smoke test.

Ngoài ra, sửa theo trục Standards:

- **Thêm `assertRelativeImportsResolve()` vào `scripts/build.ts`.** Reviewer chỉ đúng chỗ yếu
  nhất của thiết kế: prefix `../internal/` trong `externals` chỉ đúng khi mọi file output nằm
  sâu đúng một cấp, và **không gì** chặn một `src/x.tsx` mới làm nó sai — assert specifier
  kiểm tra đường dẫn *nói gì*, không kiểm tra nó *tới đâu*. Guard mới duyệt mọi `.js`/`.d.ts`
  trong `dist/` và kiểm tra từng specifier tương đối resolve ra file có thật (`.d.ts` map
  `.js`→`.d.ts`). **Đã test ngược:** đổi prefix thành `../../internal/` → build đỏ với
  `sidebar.js → ../../internal/use-is-mobile.js`. Nó cũng phủ luôn nỗi lo "vendor thiếu file
  trong closure".
- **Ghi rõ vì sao `run()` trong `packages/ui/scripts/build.ts` không quote argument** như bản
  trong `scripts/publish-smoke.ts`: mọi argument ở đây là literal không dấu cách, còn đường
  duy nhất có thể có dấu cách (cwd) đi qua option chứ không qua command line. Hai bản shim
  lệch nhau là **có lý do**, không phải drift.
- **Comment cho `assertBuiltCss`** giải thích vì sao nó chạy một lần cho mọi shell trong khi
  `assertInstalledShell` chạy per-shell: consumer build ra **một** stylesheet từ tất cả.

Theo trục Spec:

- **README nói hết base layer nó ship.** Story 4 chỉ nói "theme token + hai `@custom-variant`",
  còn fragment thật mang thêm `*`, `body` (kể cả `position: relative`), `#root` và
  `.flex-center`. Giữ nguyên nội dung (spec cấm chép tay, nên phải sinh từ `globals.css` thật)
  nhưng README giờ liệt kê đủ, nói vì sao có `position: relative`, nói `#root` là vô hại nếu
  app dùng id khác, và chỉ đường cho ai muốn tự sở hữu phần đó.

Ba finding **không** sửa, có lý do:

- **CLAUDE.md §1/§6, README, `.agents/commands.md` giờ sai.** Đúng, và đó là toàn bộ nội dung
  **ticket 04**; ticket này ghi rõ "không đụng". Giống hệt tình trạng ticket 01 để lại.
- **`@shadcn/react ^0.3.1` là dep `0.x` không có trong danh sách spec liệt kê.** Nó có thật
  trong `packages/ui/src` (`message-scroller.tsx`, `questionnaire.tsx` import
  `@shadcn/react/*`), range chép đúng workspace, nên đây là spec liệt kê thiếu chứ không phải
  code thừa. Ghi lại ở đây thay vì sửa spec.
- **`any` trong `.d.ts` (story 3) chỉ đạt một phần và không có assert máy nào giữ.** Đúng.
  `any` đến từ `React.ReactElement<unknown, string | React.JSXElementConstructor<any>>` — kiểu
  của chính React — nên một assert "không `any`" sẽ đỏ vĩnh viễn và vô nghĩa. Ticket 04 nên ghi
  giới hạn này vào ADR-0004 thay vì thêm test.

Gate sau khi sửa: `check` 367 file 0 warning, `typecheck` 14/14, `test` 10/10, `build` 5/5,
`publish:smoke` xanh.
