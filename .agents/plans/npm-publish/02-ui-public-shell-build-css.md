---
status: ready-for-agent
---

# 02 — `ui-public`: Publish shell, build rslib trong `@monorepo/ui`, inline hook, CSS entry

**What to build:** Cùng project Vite tạm của smoke test cài thêm tarball `@fe-monorepo/ui@2.0.0`, import `Button` từ `@fe-monorepo/ui/components/button`, `@import "@fe-monorepo/ui/globals.css"` cộng `@source` trỏ vào `dist/` của package, và typecheck + `vite build` xanh với Tailwind v4. `dist/` của `ui` không còn specifier `#components/*`, `#utils/cn`, `#hooks/*` hay `@monorepo/*` nào — hook duy nhất nó dùng (`useIsMobile`) được inline. Storybook và app trong repo vẫn import `@monorepo/ui/components/*` từ source.

**Blocked by:** 01 — đường build → shell → tarball → consumer đã chạy trên `hook`; smoke test chung đã có chỗ nối.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Workspace mới `packages/ui-public`: `package.json` viết tay (tên `@fe-monorepo/ui`, `2.0.0`, `exports` `./components/*`, `./utils/*`, `./globals.css` trỏ `dist/`, `sideEffects: ["./dist/globals.css"]`, `peerDependencies` literal `react`/`react-dom >=19` + `tailwindcss ^4`, `dependencies` là các runtime dep thật của `ui` với range literal chép từ version đã resolve trong `bun.lock` — không có `@fe-monorepo/hook`, không `catalog:`/`workspace:`), README cho consumer (cài, import subpath, CSS + ví dụ `@source`, peer, bảng 63 primitive, link Storybook), `dist/` gitignored.
- [ ] `@monorepo/ui` có `rslib.config.ts` + tsconfig build theo mẫu ticket 01; `autoExternal` cho dependencies/peer; `@monorepo/hook` **không** external mà được bundle vào; `src/hooks/` (landing pad không tồn tại) không làm build đỏ; `.tsx` → `.js` per-file dưới `dist/components/` và `dist/utils/`.
- [ ] Xác nhận rslib rewrite `#components/*` và `#utils/cn` thành đường dẫn tương đối `.js` trong cả `.js` lẫn `.d.ts` (spike ngày 2026-09-04 mới chứng minh với tsdown). Nếu rslib không tự làm, cấu hình `resolve.alias`/plugin và ghi vào Notes; nếu bất khả thi, dừng và báo — không đổi sang tsdown trong ticket này mà mở lại ADR-0004.
- [ ] Bước sau build sinh `dist/globals.css` từ `theme.css` + `globals.css` của `@monorepo/tailwind-config`, giữ nguyên hai `@custom-variant data-horizontal`/`data-vertical` (load-bearing, rule `architecture-ui-primitives`); có một assert (grep) trong smoke test rằng hai dòng đó có mặt.
- [ ] `guard:no-local-hooks` và `ui-add` vẫn chạy như cũ; `bun run --filter @monorepo/ui test` (utils) vẫn xanh; Storybook test `composeStories` vẫn xanh.
- [ ] `publish:smoke` mở rộng: pack cả hai shell, project tạm cài cả hai, thêm `tailwindcss` + `@tailwindcss/vite`, import `Button` + `useDebounce`, CSS + `@source`, `tsc --noEmit` + `vite build` xanh; assert thêm `dist/` của `ui` không chứa `#components`, `#utils`, `#hooks`, `@monorepo/`; assert CSS build ra có class của Button (bằng chứng `@source` hoạt động).
- [ ] `turbo.json` của `@monorepo/ui` khai `build.outputs` sang `dist/` của shell; cache hit lần hai.
- [ ] Gate xanh 0 warning + `bun run publish:smoke` xanh. Ghi output vào Notes.
- [ ] Không đổi `exports`/`imports` của `@monorepo/ui`, không đổi source primitive nào vì publish.

## Notes

(ghi kết quả verify; đặc biệt ghi cách rslib xử lý `#`-specifier và inline hook)
