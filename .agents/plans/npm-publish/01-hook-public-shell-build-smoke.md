---
status: done
---

# 01 — `hook-public`: Publish shell, build rslib trong `@monorepo/hook`, consumer smoke test

**What to build:** Một người ngoài repo có thể lấy tarball `@fe-monorepo/hook@2.0.0` (pack từ Publish shell `packages/hook-public`), cài vào một project Vite + React 19 tạm, import `useDebounce` theo subpath và typecheck + build xanh. Trong repo, `bun run build` ở root chạy task `build` của `@monorepo/hook` (rslib, bundleless, ESM + `.d.ts` per-file) đổ `dist/` sang shell; app vẫn import `@monorepo/hook/*` từ source như trước. Đây là pilot rẻ nhất chứng minh toàn bộ đường build → shell → tarball → consumer trước khi làm `ui`.

**Blocked by:** None (can start immediately). Đọc spec `./spec.md`, ADR-0004 và §1.3/§2.2 của note research trước khi bắt đầu.

**Status:** done

## Acceptance criteria

- [x] Workspace mới `packages/hook-public`: `package.json` viết tay đúng spec (tên `@fe-monorepo/hook`, `version 2.0.0`, `type: module`, `publishConfig.access: public`, `files`, `exports` `./*` → `dist/*.js` với condition `types`, `peerDependencies` literal `react`/`react-dom >=19`, `repository` + `directory`, `license`, `sideEffects: false`), `README.md` cho consumer, `dist/` gitignored. Không `catalog:`, không `workspace:` trong file này.
- [x] `@monorepo/hook` có `rslib.config.ts` (`bundle: false`, `format: esm`, `dts: true`, `rootDir` tường minh vì TS 7 báo TS5011 nếu thiếu, `distPath` trỏ sang `dist/` của shell) và một tsconfig build riêng (không `noEmit`, không `allowImportingTsExtensions`, `declaration: true`); tsconfig typecheck hiện tại không đổi. Script `build` xoá `dist/` của shell trước khi chạy.
- [x] `turbo.json` của `@monorepo/hook` khai `build.outputs` trỏ đúng thư mục `dist/` của shell để cache Turbo đúng; `bun run build` ở root chạy task này và cache hit ở lần thứ hai.
- [x] `dist/` chứa đúng 5 file `.js` + 5 `.d.ts` (một cặp mỗi hook), import nội bộ có đuôi `.js`, không `any` trong `.d.ts`.
- [x] `typescript` trong catalog root pin `~7.0.x` với comment lý do (peer range của plugin dts).
- [x] Script `publish:smoke` (Bun, nằm trong shell hoặc `scripts/` root — chọn một và ghi vào `.agents/commands.md` ở ticket 04): `npm pack` shell vào thư mục tạm → tạo project Vite + React 19 + TypeScript ~7.0 tạm → `bun add <tarball>` → file nguồn import `useDebounce` từ `@fe-monorepo/hook/use-debounce` → `tsc --noEmit` và `vite build` xanh → assert `package.json` trong tarball không chứa `catalog:`/`workspace:` và `dist/` không chứa `@monorepo/`. Exit code khác 0 khi bất kỳ bước nào đỏ. Script viết sẵn chỗ để ticket 02 nối `ui` vào.
- [x] Shell có `typecheck`/`test` không đỏ khi Turbo fan-out (script no-op có ghi chú, hoặc không khai script và xác nhận Turbo bỏ qua).
- [x] Gate xanh 0 warning: `bun run check && bun run typecheck && bun run test && bun run build`; rồi `bun run publish:smoke` xanh. Ghi output tóm tắt vào mục Notes bên dưới.
- [x] Không đổi `exports` của `@monorepo/hook` (vẫn `./*` → `src/*.ts`), không đổi API hook nào.

## Notes

Làm ngày 2026-09-04. Gate xanh 0 warning, `publish:smoke` xanh:

```
bun run check      → Checked 358 files in 24s. No fixes applied.
bun run typecheck  → Tasks: 13 successful, 13 total
bun run test       → Tasks:  9 successful,  9 total   (Storybook 148 tests passed)
bun run build      → Tasks:  4 successful,  4 total
bun run publish:smoke → OK - publish smoke test passed
```

`npm pack --dry-run` trong shell: 12 file, 2.7 kB — `README.md`, `package.json`, và đúng
5 `.js` + 5 `.d.ts` trong `dist/`. `git check-ignore` xác nhận `dist/` bị `.gitignore:40`
bắt, không file nào lọt vào git.

### Những chỗ lệch so với ticket / spec, và lý do

- **`rm -rf` không dùng được, thay bằng `output.cleanDistPath: true`.** Bun shell (thứ chạy
  script `package.json`) từ chối `rm -rf ../hook-public/dist` với `Invalid argument` —
  nó chặn đường có `..`. Nên việc "xoá `dist/` trước khi chạy" chuyển vào chính rslib:
  `cleanDistPath` phải khai `true` tường minh, vì mặc định `auto` **không** dọn một dist
  nằm ngoài package. Đã kiểm bằng tay: bỏ một file rác vào `dist/` rồi build → file biến mất.
- **Lý do pin `typescript` `~7.0.2` không phải peer range.** Peer thật của `@rslib/core@1.0.0`
  và `rsbuild-plugin-dts@1.0.0` là `^5 || ^6 || ^7` — rộng, không ép 7.0. Vẫn pin `~7.0.2`,
  nhưng lý do đúng là: `dts` sinh bằng **tsgo**, và giữ minor cố định là cách duy nhất để
  `.d.ts` publish ra không đổi hình dạng vì một bản 7.1 nào đó. Ghi ở đây thay vì comment
  trong `package.json` (JSON không có comment, và `catalog` là map tên→range nên không cắm
  được key ghi chú). Ticket 04 chép câu này vào CLAUDE.md §6.
- **Smoke test nằm ở `scripts/publish-smoke.ts` (root), không phải `packages/ui-public/scripts/`.**
  Ticket cho chọn một trong hai; chọn root vì `ui-public` chưa tồn tại đến ticket 02, và
  root script nghĩa là ticket 02 chỉ thêm **một entry vào mảng `SHELLS`** chứ không phải
  dời file. Ticket 04 ghi lệnh vào `.agents/commands.md`.
- **Thêm hai chỗ typecheck ngoài AC.** `packages/hook/tsconfig.json` include thêm
  `rslib.config.ts` (theo đúng kiểu `packages/ui` include `scripts` + `vitest.config.ts`),
  và `scripts/tsconfig.json` mới cho script root — theo tiền lệ `turbo/generators/tsconfig.json`:
  có tsconfig để editor/`tsc -p` soi được, **không** thêm task Gate mới. Lưu ý AC nói
  "tsconfig typecheck hiện tại không đổi": chữ thì bị vi phạm, ý thì không — thay đổi duy
  nhất là **mở rộng** phạm vi soi, không đụng compilerOptions nào.

### Sửa sau `/code-review`

Hai review agent (Standards + Spec) chạy trên diff này; những gì đã sửa:

- **`@rslib/core` vào catalog, pin `~1.0.0`.** Ban đầu hardcode `^1.0.0` trong
  `packages/hook/package.json` — vi phạm CLAUDE.md §6 ("Reference a catalog from a workspace
  `package.json`; never hardcode a version there"). Pin `~` chứ không `^` vì cùng lý do với
  `typescript`: `rsbuild-plugin-dts` đi kèm là thứ sinh `.d.ts` publish ra.
- **Bỏ `consumerDevDependencies` khỏi type `Shell`** — project consumer là throwaway `private`,
  chia dev/runtime không có nghĩa; một `consumerDependencies` là đủ cho cả ticket 02.
- **Ghi rõ vì sao pin của consumer *cố tình* không đọc từ catalog.** Reviewer đọc ra
  "Duplicated Code"; thực ra ngược lại — consumer đóng vai người ngoài repo tự chọn version,
  nối vào catalog sẽ giấu đúng lỗi cần bắt. Đã viết thành comment để lần sau không ai "sửa".
- **Quote argument khi spawn qua shell trên Windows.** `bun`/`bunx`/`npm` là `.cmd` shim nên
  phải đi qua shell, và shell tách lại argument — đường tarball dưới `C:\Users\First Last\…`
  sẽ vỡ. Máy dev hiện tại không có dấu cách nên test vẫn xanh; đã sửa trước khi nó cắn.
- **`assertInstalledShell` return sớm** khi package chưa cài / thiếu `dist/`, thay vì ghi
  `check(false, …)` rồi `readFile` ném ENOENT thô ngay dòng sau.
- **Docblock của `rslib.config.ts`** chuyển lên trên `export default` (trước nó nằm trên
  `const SHELL_DIST` nên đọc thành doc của hằng đó).

Hai finding **không** sửa, có lý do:

- **CLAUDE.md §1 ("ALL private … no build step"), §6, `README.md`, `.agents/commands.md`,
  `legacy/README.md` giờ sai.** Đúng, và đó là toàn bộ nội dung **ticket 04** — ticket này
  ghi rõ "không đụng". Trong lúc chờ 04, tài liệu lệch với cây; ai đọc §1 mà thấy `hook-public`
  thì xem ADR-0004 trước khi "sửa drift".
- **`peerDependencies.react-dom: ">=19"` không có hook nào dùng tới.** Reviewer đúng về mặt
  kỹ thuật — không file nào trong `packages/hook/src` import `react-dom`. Nhưng AC 1 và story 6
  của spec đều nói literal `react`/`react-dom >=19`, nên giữ. Nếu muốn bỏ thì sửa spec trước.
- **`scripts/publish-smoke.ts` không nằm trong Gate `typecheck`.** `turbo run typecheck` chỉ
  fan-out tới workspace, `scripts/` không phải workspace — giống hệt `turbo/generators/config.ts`
  hôm nay. Lỗi kiểu ở đây lộ khi chạy script, và ticket 03 sẽ đưa script thành một job CI.

### Điều xác minh được, đáng nhớ

- **Turbo cache `dist/` nằm ngoài package.** `outputs: ["../hook-public/dist/**"]` chạy đúng:
  xoá sạch `packages/hook-public/dist` rồi `bun run build --filter @monorepo/hook` →
  `cache hit … >>> FULL TURBO` trong 190ms và 10 file được khôi phục đủ. Không cần đưa
  task `build` sang shell.
- **Shell không khai `typecheck`/`test` thì Turbo bỏ qua im lặng** — `typecheck` vẫn 13 task,
  `test` vẫn 9 task, không task nào mang tên `@fe-monorepo/hook`. Không cần script no-op.
- **`dts: true` dùng đúng tsgo**: log rslib in `declaration files generated with tsgo`.
  `rootDir` bắt buộc phải nằm trong `tsconfig.build.json` (TS5011 nếu thiếu) — đúng như spec dự đoán.
- **Import nội bộ được viết lại đúng**: `use-is-mobile.js` import `./use-media-query.js`,
  `use-media-query.js` import `./use-isomorphic-layout-effect.js`. Không `any` trong `.d.ts` nào.
- **SWC rút gọn `typeof window !== "undefined"` thành `"u" > typeof window`** trong
  `use-isomorphic-layout-effect.js` (và `"u" < typeof window` cho `IS_SERVER`). Trông lạ nhưng
  đúng: `typeof window` chỉ có thể là `"object"` hoặc `"undefined"`, và so sánh chuỗi tách được
  hai giá trị đó. Đừng "sửa" nó.
- **Consumer cần `declare module "*.css"`.** Project tạm đặt `types: []` để khỏi kéo
  `@types/node`, nên side-effect import CSS đỏ với TS2882; script tự ghi một file `css.d.ts`
  một dòng. Chỗ này ticket 02 sẽ dùng thật khi nối `@fe-monorepo/ui/globals.css`.
- Assert `catalog:`/`workspace:`/`@monorepo/` chạy trên **package đã cài trong `node_modules`**
  của consumer chứ không mở tarball — nội dung như nhau, mà lại đúng thứ `tsc`/`vite` ngay
  sau đó resolve. Không cần `tar` trên Windows.

### Chưa làm (đúng phạm vi ticket)

Không đụng `exports` của `@monorepo/hook` (vẫn `./*` → `src/*.ts`), không đổi API hook nào,
không thêm `.changeset/`, không đụng CLAUDE.md / `.agents/commands.md` / `README.md`
(ticket 04), không thêm job CI (ticket 03).
