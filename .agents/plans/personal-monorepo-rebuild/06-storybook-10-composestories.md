---
status: done
---

# 06 — Storybook 10.6 cho `@monorepo/ui`, test story bằng `composeStories` trên Vitest 5

**What to build:** `bun run dev:storybook` mở Storybook 10.6 với một story cho mỗi primitive của `@monorepo/ui` (copy từ reference), docs page tự sinh, overlay (dialog/popover/select/tooltip/drawer) mở đúng và không bị che. `bun run test` trong app storybook render mọi story và mở mọi overlay qua `composeStories` + jsdom, cộng test hành vi validate form — đây là ticket chứng minh Vitest 5 chạy được với `composeStories` của Storybook 10.6. Người review mở Storybook thật và xác nhận slider/scrollbar/tabs đúng orientation (bẫy `@custom-variant` mà jsdom không thấy).

**Blocked by:** 05 — `@monorepo/ui`.

> Chạy từ session ở reference (`E:\MedViet\frontend\medviet`), ghi sang `D:\Personal\monorepo` bằng đường dẫn tuyệt đối, lệnh dùng `--cwd`/`git -C` — xem "Cách chạy ticket" trong `decisions.md`. Không sửa gì ở reference.

**Status:** done (implement xong từ trước; xác minh lại 2026-09-04 khi chạy Gate; ô CI và ô checklist orientation đã có bằng chứng ở ticket 12, ô `docker build` vẫn treo — xem "Còn treo")

- [x] `apps/storybook` với `storybook`, `@storybook/react`, `@storybook/react-vite`, `@storybook/addon-docs` cùng version 10.6.x (qua `catalog:storybook10`, cả bốn pin `10.6.0`); `main.ts` đúng ba khoá `stories` + `addons: ["@storybook/addon-docs"]` + `framework: "@storybook/react-vite"`; không `addon-essentials`/`blocks`/`test`/`addon-vitest`
- [x] `preview.tsx` copy từ reference (TooltipProvider + Toaster + StoryFrame, `import "../src/globals.css"`, decorator bỏ qua StoryFrame khi `layout: "fullscreen"`); Tailwind qua PostCSS như reference (`postcss.config.mjs` re-export `@monorepo/tailwind-config/postcss-config`)
- [x] `src/stories/*.stories.tsx` copy đủ bộ từ reference, đổi scope; `introduction.stories.tsx` viết cho Target. Kiểm hai chiều: 63 primitive trong `packages/ui/src/components/` ↔ 63 story cùng tên, không primitive nào thiếu story; file thứ 64 là `form.stories.tsx` (composition, không map 1-1 với primitive) — đúng bằng số story của reference. `src/introduction.stories.tsx` (ở `src/`, không phải `src/stories/`, giống reference) là bản viết riêng: liệt kê stack thật của Target (React 19, Base UI, Tailwind v4, Vite 8, Storybook 10, Bun workspaces). `grep -rn medviet` trên `src/`/`.storybook/`/`test/` không trả gì
- [x] `vitest.config.ts` + `vitest.setup.ts` (jsdom, stub ResizeObserver/pointer capture/matchMedia cho Base UI), `test/stories.test.tsx` + `test/form-stories.test.tsx` copy từ reference và **xanh trên Vitest 5**. `composeStories` của Storybook 10.6 **tương thích Vitest 5** — không phải pin riêng 4.1.x cho app này. Bằng chứng: `bun run test --force` (cache 0) → `@monorepo/storybook: Test Files 3 passed (3), Tests 148 passed (148)`. `vitest.setup.ts` đi qua `setProjectAnnotations([previewAnnotations])` + `beforeAll(annotations.beforeAll)` nên story chạy qua đúng decorator của `preview.tsx`. **Lệch ticket (thêm):** có file test thứ ba `test/date-picker-stories.test.tsx` — xem "Lệch so với ticket" #1
- [ ] Dockerfile + nginx.conf cho storybook-static copy từ reference; `docker build` chạy được (kiểm tay, ghi kết quả) — **để nguyên chưa tick, và đây là chủ ý**: file có (`Dockerfile`, `nginx.conf`) nhưng vẫn **chưa có log `docker build` nào**. Ticket 12 nhận ô này và cũng không chạy được: máy chạy phiên đó **không còn Docker** (`C:\Program Files\Docker` rỗng, `Get-Command docker/podman` không trả gì, `wsl -l -v` không có distribution) — ticket 12 ô tương ứng vẫn `[ ]` và ghi đầy đủ ở "Còn treo" của nó. Theo `docs/agents/triage-labels.md`, `done` là "implemented **and** verified, with the verification recorded in the ticket's own body"; ở đây không có gì để ghi, nên tick sẽ là bịa bằng chứng. Gỡ ô này cần **một máy có Docker**, hoặc để một job CI dựng image
- [x] Checklist kiểm tay: Slider ngang/dọc, ScrollArea, Tabs vertical, Separator hiển thị đúng; Dialog/Popover/Tooltip không bị z-index che — **đã chạy thật ở ticket 12**, xem [`12-gate-cuoi-kiem-tay.md`](./12-gate-cuoi-kiem-tay.md) § "Bằng chứng — kiểm tay" → "Storybook — checklist orientation + z-index của ticket 06": phục vụ `apps/storybook/dist` qua static server, mở từng story bằng `iframe.html?id=…` trong Chromium thật và đọc **computed style** chứ không nhìn bằng mắt — **8/8**. Một dè dặt phải giữ nguyên: bộ story hiện tại **không có story Slider dọc**, nên chiều dọc của Slider chỉ được chứng minh **gián tiếp** qua Separator + ScrollArea (cùng hai `@custom-variant`); muốn phủ trực tiếp thì thêm một story `Vertical` cho Slider
- [x] Root script `dev:storybook`; Gate xanh local và trên CI — **script có** (`"dev:storybook": "turbo watch dev -F @monorepo/storybook..."`), **Gate local xanh**, và **CI run #2 (`d964157`) xanh cả sáu job, 0 annotation** (`check` 41s · `typecheck` 15s · `test` 26s · `build` 39s; xem ticket 12 § "Bằng chứng — CI")

---

## Bằng chứng Gate (2026-09-04)

Chạy trên Target, sau khi đã dọn sạch smoke test của ticket 09 (`git status` trở lại đúng trạng thái đầu phiên):

| Lệnh | Exit | Phần liên quan tới app này |
|---|---|---|
| `bun run check` | 0 | `Checked 350 files in 18s. No fixes applied.` |
| `bun run typecheck` | 0 | `@monorepo/storybook:typecheck` → `tsc --noEmit --emitDeclarationOnly false`, 12/12 task |
| `bun run test --force` | 0 | `@monorepo/storybook: Test Files 3 passed (3), Tests 148 passed (148)` |
| `bun run build --force` | 0 | `@monorepo/storybook:build` → `storybook build --output-dir dist`, `Output directory: D:/Personal/monorepo/apps/storybook/dist` |

148 test là con số đáng chú ý của ticket này: nó là toàn bộ 64 story render qua `composeStories` cộng phần mở overlay và test validate form — tức là câu hỏi rủi ro nhất của decision 6 ("`composeStories` + Vitest 5 chưa xác minh") đã có câu trả lời **có**.

## Review đối kháng (2026-09-04)

Một lượt review đối kháng đã chạy trên toàn bộ diff của Skeleton. **App này không bị sửa gì** — không finding nào rơi vào `apps/storybook`, và Gate của nó xanh trước lẫn sau lượt fix. Hai kết quả liên quan gián tiếp, ghi lại để không phải truy lại:

- Finding nặng nhất của cả lượt nằm ở **`_template_next`** (ticket 08): hàm lọc `redirectTo` của màn sign-in là một **open redirect** — một dấu backslash lách qua phép kiểm `//`. Đã sửa bằng cách *parse* URL rồi so origin, kèm test. Không đụng tới app này.
- Review có báo `biome.json` thiếu domain `next`; **bác bỏ** — domain nằm trong `overrides` scope vào `apps/_template_next/**`. Đáng biết ở đây vì thí nghiệm đưa nó lên top level sinh ngay 2 warning `noImgElement` trong `apps/storybook/src/stories/` (`aspect-ratio.stories.tsx:20`, `card.stories.tsx:84`) — Storybook không có `next/image`, nên scope hẹp là bắt buộc chứ không phải tuỳ chọn. Thí nghiệm đã revert.

## Lệch so với ticket (và vì sao)

1. **Có file test thứ ba, `test/date-picker-stories.test.tsx`.** Ticket chỉ nêu `stories.test.tsx` + `form-stories.test.tsx`. Date picker là primitive duy nhất mà hành vi phụ thuộc `TZ` và locale, nên tách riêng để nó không kéo theo cả `stories.test.tsx` khi đỏ. Thêm, không thay.

2. **`vitest.setup.ts` không có `vi.clearAllMocks()` trong `afterEach`.** Reference có. Vitest 5 đặt `clearMocks: true` làm mặc định (và `vitest.config.ts` khai lại tường minh), nên hook đó là cách viết thứ hai của một đảm bảo runner đã cho — đây đúng là loại breaking-change của Vitest 5 mà decision 6 dặn phải xử lý khi copy từ reference.

3. **Stub trong `vitest.setup.ts` rộng hơn reference.** Ngoài ResizeObserver/matchMedia/pointer-capture còn có `IntersectionObserver`, `scrollIntoView`, `getAnimations`, và `ResizeObserver` **trả về một box khác 0** (640×320) thay vì no-op. Lý do nằm ngay trong file: jsdom không layout, nên mọi đo đạc thật là 0, và `ResponsiveContainer` của Recharts từ chối vẽ ở 0×0 rồi in ra stderr — với `chart.stories.tsx` trong bộ story thì no-op là không đủ.

## Còn treo

- **Hai ô kiểm tay đã tách đôi kết quả (cập nhật 2026-09-04).** Cả hai từng chuyển sang **ticket 12**, là ticket sở hữu lượt kiểm tay cuối; ticket đó chạy xong một ô và không chạy được ô kia.

  - **Checklist orientation + z-index — xong, đã tick.** Ticket 12 đo bằng computed style trong Chromium thật trên `apps/storybook/dist`: **8/8**. Đây đúng là lượt kiểm mà ticket này viết ra để đòi, vì jsdom **không** bắt được nó — hai `@custom-variant data-horizontal/data-vertical` trong `tooling/tailwind/globals.css` mà mất đi thì Tailwind sinh ra *không CSS và không lỗi*, và 148 test vẫn xanh. Dè dặt còn lại: không có story Slider dọc, nên trục dọc của Slider chứng minh gián tiếp qua Separator + ScrollArea.
  - **`docker build` — vẫn chưa tick, và không tick theo suy đoán.** Máy chạy ticket 12 không còn Docker/podman/WSL, nên không có log nào để ghi. Đọc Dockerfile thấy "đúng hình" không phải là "build được". Ô này chờ một máy có Docker, hoặc một job CI dựng image.

- **Ô CI đã tick** — **CI run #2** (`d964157`) xanh cả sáu job, 0 annotation. Không trích run #1 (`2b89265`): job `e2e` của nó **đỏ** và bị `continue-on-error: true` che. Chi tiết ở ticket 12 § "Bằng chứng — CI".

- **Build log của `@monorepo/storybook` có warning**, và ticket 12 đòi *0 warning trong log build*:

  ```
  @monorepo/storybook:build: (!) Some chunks are larger than 500 kB after minification. Consider:
  @monorepo/storybook:build: - Using dynamic import() to code-split the application
  @monorepo/storybook:build: - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```

  Exit code vẫn 0, nên Gate không đỏ. Nhưng US44 và ticket 12 nói **0 warning**, nên phải quyết một trong hai: chia chunk thật, hay nâng `build.chunkSizeWarningLimit` với lý do ghi lại. `_template_vite` có **cùng** warning này (ticket 07), nên nên quyết một lần cho cả hai chỗ thay vì hai lần khác nhau.
