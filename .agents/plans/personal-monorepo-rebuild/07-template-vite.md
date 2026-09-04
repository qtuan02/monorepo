---
status: done
---

# 07 — `_template_vite`: SPA mẫu trên Vite 8 + React Router 8, kèm e2e job CI

**What to build:** `bun run dev:template-vite` mở app SPA có sign-in (GuestRoute), shell header/body/footer với clock đổi theo ngôn ngữ, home sau ProtectedRoute, exception screens, đổi ngôn ngữ vi/en bằng cookie, gọi API qua service singleton + TanStack Query — đúng những gì template SPA của reference làm, nhưng trên Vite 8, `@vitejs/plugin-react` 6 + React Compiler qua `@rolldown/plugin-babel`, React Router 8 declarative, Flavor `vite` của env và Flavor `i18next` của i18n. Suite Vitest 5 copy từ reference xanh; Playwright chạy boot + sign-in trên bundle production; `docker build` Bun → nginx thành công; job `e2e` non-blocking xuất hiện trong CI.

**Blocked by:** 02 — framework-free packages; 03 — env; 04 — i18n; 05 — ui.

> Chạy từ session ở reference (`E:\MedViet\frontend\medviet`), ghi sang `D:\Personal\monorepo` bằng đường dẫn tuyệt đối, lệnh dùng `--cwd`/`git -C` — xem "Cách chạy ticket" trong `decisions.md`. Không sửa gì ở reference.

**Status:** done (implement xong từ trước; xác minh lại 2026-09-04 — Gate 4/4 xanh, Playwright 7/7 xanh; ô CI đã chứng minh bằng CI run #2 `d964157`, ô docker build vẫn treo ở ticket 12 — xem "Còn treo")

- [~] Cấu trúc `src/` giống reference; scope `@monorepo` — **có** `assets/icons`, `components/{exception,select}`, `constants/{routes,cookies}`, `features/{auth,layout,home}`, `hooks/api`, `libs/{http-client,i18n,dayjs,query-client,query-key-factory}`, `pages`, `stores`, `types`, `utils`, `env.ts`, `globals.css`, `vite-env.d.ts`. **Thiếu ba thứ ticket nêu và đó là chủ ý:** không có `components/page/`, không có `constants/layout.ts`, không có `components/exception/exception-state.tsx` — xem "Lệch so với ticket" #1
- [x] React Router 8.3.x: import từ `react-router` / `react-router/dom`, không có `react-router-dom`; `ROUTES` constant + guard trong `features/auth/provider` giữ nguyên hình. Kiểm: mọi `from "react-router…"` trong `src/`+`test/`+`e2e/` đều là `"react-router"` (một specifier duy nhất), và `grep -rn react-router-dom` trên cả app (trừ `node_modules`) không trả gì
- [x] `vite.config.ts`: `envDir: "../../"`, `envPrefix: "PUBLIC_"`, `resolve.tsconfigPaths: true`, `@tailwindcss/vite`, `react()` v6 + `babel({ presets: [reactCompilerPreset()] })` chạy sau nó (plugin-react 6 đi qua oxc và không còn nhận Babel plugin); Vite 8.2.2 build xanh
- [x] `libs/dayjs.ts` bridge `languageChanged` → `setDayjsLocale`; header clock thread `i18n.resolvedLanguage` vào `.locale()` — `header-clock.tsx:38` là `dayjs(now).locale(i18n.resolvedLanguage ?? defaultLanguage)`, đúng cả hai nửa của rule `dates-locale-render-input` (dùng `resolvedLanguage` chứ không `language`, và fallback lấy từ registry)
- [x] Vitest 5 + RTL + jsdom, `test/` soi gương `src/`, `TZ=UTC` trong config, setup pin `vi`, mock ở service singleton; test copy từ reference xanh; breaking Vitest 5 ghi vào ticket. Bốn file test soi đúng đường dẫn dưới `src/` (`test/env.test.ts`, `test/features/auth/components/sign-in-form.test.tsx`, `test/features/auth/provider/protected-route.test.tsx`, `test/features/home/templates/home.template.test.tsx`); `process.env.TZ = "UTC"` đặt trong `vitest.config.ts` **không** ở dòng lệnh (cú pháp đó không hợp lệ trên PowerShell); `vitest.setup.ts` `await i18n.changeLanguage("vi")` trong `beforeAll`. Breaking Vitest 5 đã xử lý — xem "Lệch so với ticket" #2
- [x] Playwright 1.62.x: `testMatch` `.e2e.ts`, project `chromium` + `watch`, `webServer` build + preview `--strictPort`, `locale: vi-VN`; spec boot + sign-in (fixture `signIn(page)` qua `addInitScript`) xanh local. Chạy thật 2026-09-04: `cd apps/_template_vite && bunx playwright test --project=chromium` → **7 passed (6.0s)**, gồm `auth.e2e.ts` (redirect route protected → sign-in, redirect launcher → sign-in, hiện đủ hai field, từ chối password < 6 ký tự, mở thẳng launcher card khi đã sign-in) và `home.e2e.ts` (render app shell, boot không console error)
- [~] Dockerfile bốn stage + `nginx.conf` SPA fallback; `docker build --build-arg BUILD_ENV=example` thành công (kiểm tay, ghi log) — **file đúng hình** (`base` → `pruner` `turbo prune --docker` → `builder` validate env + `ARG BUILD_ENV=example` → `nginx:stable-alpine` runner; `nginx.conf` có `try_files $uri $uri/ /index.html`, `no-store` cho index, `immutable` cho `/assets/`), **nhưng chưa có log `docker build` nào được ghi**; chuyển sang ticket 12
- [x] `turbo.json` app flip `dev` persistent; root scripts `dev:template-vite`/`build:template-vite` — cả ba có
- [x] CI thêm job `e2e` `continue-on-error: true`, ảnh Playwright khớp version, chỉ chạy khi diff chạm `apps/`/`packages/`/`tooling/`, không route qua Turbo — job `e2e` trong `.github/workflows/ci.yml` (trích theo tên job, không theo số dòng: số dòng đã trôi một lần khi job `docker` được thêm): `needs: changes`, `if: needs.changes.outputs.app == 'true'`, `continue-on-error: true`, `image: mcr.microsoft.com/playwright:v1.62.1-noble` (khớp pin `@playwright/test` 1.62.1 không caret), gọi `bun run --filter @monorepo/_template_vite e2e` trực tiếp
- [x] Gate xanh local và trên CI — **local xanh** (4/4, exit 0); **CI run #2 (`d964157`) xanh cả sáu job, 0 annotation**: `check` 41s · `typecheck` 15s · `test` 26s · `build` 39s, và job `e2e` (cả hai Template) 132s (xem ticket 12 § "Bằng chứng — CI")

---

## Bằng chứng (2026-09-04)

Chạy trên Target sau khi dọn sạch smoke test của ticket 09.

| Lệnh | Exit | Phần liên quan tới app này |
|---|---|---|
| `bun run check` | 0 | `Checked 350 files in 18s. No fixes applied.` |
| `bun run typecheck` | 0 | `@monorepo/_template_vite:typecheck` → `tsc --noEmit --emitDeclarationOnly false` |
| `bun run test --force` | 0 | `Test Files 4 passed (4), Tests 11 passed (11)` |
| `bun run build --force` | 0 | `✓ built in 1.90s` |
| `bunx playwright test --project=chromium` | 0 | `7 passed (6.0s)` |

Playwright chạy bằng `bunx` với cwd là thư mục app, theo `decisions.md` § "Cách chạy ticket".

## Review đối kháng (2026-09-04)

Một lượt review đối kháng đã chạy trên toàn bộ diff của Skeleton. **App này không bị sửa gì** — không finding nào rơi vào `apps/_template_vite`. Hai kết quả liên quan, ghi lại vì cả hai đều dạy điều gì đó về app này:

- Finding nặng nhất của cả lượt nằm ở app anh em **`_template_next`** (ticket 08): hàm lọc `redirectTo` của màn sign-in là một **open redirect** — `/\evil.example` lách qua phép kiểm `startsWith("//")`, vì spec URL coi backslash trong scheme đặc biệt là `/`, nên trình duyệt resolve `Location` thành `https://evil.example/`. Đã sửa bằng cách *parse* rồi so origin, kèm 7 test. Template SPA này **không** có bề mặt tương đương (guard là `<Navigate to={ROUTES.SIGN_IN} replace />`, không mang `redirectTo` từ query string), nên không có gì để sửa — nhưng nếu sau này thêm `redirectTo` vào `GuestRoute`/`ProtectedRoute` thì phải mượn nguyên hàm `safeRedirectTo` của bên kia, đừng viết lại bằng prefix check.
- Review có báo `biome.json` thiếu domain `next`; **bác bỏ** — nó nằm trong `overrides` scope vào `apps/_template_next/**`. Liên quan ở đây vì thí nghiệm đưa domain lên top level sinh ngay một warning `noImgElement` trong chính app này (`src/components/select/select-language.tsx:42`): SPA không có `next/image`, nên scope hẹp là bắt buộc. Thí nghiệm đã revert, `biome.json` không bị đụng.

## Lệch so với ticket (và vì sao)

1. **Không có `components/page/`, `constants/layout.ts`, `components/exception/exception-state.tsx`.** Ticket liệt `components/{exception,page,select}` và `constants/{routes,cookies,layout}` theo hình của reference. Ở Target, `components/page/` (chỉ `page-header.tsx` + `page-content.tsx`) tồn tại **trong `_template_next`** chứ không trong `_template_vite`, và **cả hai** template viết container ngang thẳng vào `className` (`container mx-auto px-4 sm:px-6 lg:px-8`) thay vì import một hằng dùng chung. Ở reference, `~/constants/layout.ts` tồn tại vì bốn phần tử trong bốn file phải thẳng mép trái với nhau; ở template SPA của Target thì shell không tách thành nhiều file như thế, nên hằng đó sẽ là một chỉ mục dùng một lần — đúng thứ rule `quality-styling-tailwind` bảo không được nâng lên `~/constants/*.ts`. `page-back-button.tsx` cũng không được port vì không màn hình nào gọi. Đánh `[~]` chứ không `[x]` vì ticket có nêu đích danh ba thứ này; `.agents/rules/architecture-shared-components.md` của Target đã được sửa cho khớp thực tế (ticket 10) nên rule và code không mâu thuẫn.

2. **Breaking của Vitest 5 đã xử lý (ghi lại theo yêu cầu của decision 6).** `clearMocks` giờ mặc định `true` — `vitest.config.ts` khai lại tường minh để người đọc biết giá trị là được *chọn*, và `vitest.setup.ts` bỏ `vi.clearAllMocks()` trong `afterEach` (đã thành cách viết thứ hai của một đảm bảo runner cho sẵn). `afterEach` giờ chỉ còn `cleanup()`. Không gặp breaking nào khác trên suite này.

3. **`vite.config.ts` thêm `define: { __APP_VERSION__ }` và `build.rollupOptions.output.codeSplitting`** (nhóm `node_modules` thành chunk `vendor`) — không có trong ticket. Cái đầu để footer nêu được build đang chạy; cái sau để một sửa đổi trong app không bust cache của dependency.

## Còn treo

- **Ô docker build** để nguyên chưa tick, chuyển sang **ticket 12** — ticket đó đã đòi thêm một thứ mà chỉ container mới trả lời được: `_template_vite` phải trả **404 cho file không tồn tại** thay vì trả index.html.

- **Ô CI đã tick (2026-09-04)** — **CI run #2** (`d964157`) xanh cả sáu job với **0 annotation**, gồm job `e2e` chạy cả hai Template trong 132s. Đáng ghi vì chính ticket này viết ra job `e2e` với `continue-on-error: true` và cảnh báo nó sẽ che lỗi: ở **run #1** (`2b89265`) nó che thật — bốn job Gate xanh, `e2e` **đỏ** vì image Playwright thiếu `unzip`, mà cả run vẫn báo `success`. Nên chỉ trích run #2. Lưu ý ranh giới: run #2 chứng minh `e2e` **chạy được trên CI**, không biến `e2e` thành merge gate — `continue-on-error: true` vẫn còn nguyên. Chi tiết ở ticket 12 § "Bằng chứng — CI".

- **Build log có warning**, và ticket 12 đòi *0 warning trong log build*:

  ```
  @monorepo/_template_vite:build: (!) Some chunks are larger than 500 kB after minification. Consider:
  @monorepo/_template_vite:build: - Using dynamic import() to code-split the application
  @monorepo/_template_vite:build: - Use build.rolldownOptions.output.codeSplitting to improve chunking
  @monorepo/_template_vite:build: - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```

  Chunk `vendor` là 684.28 kB (gzip 219.15 kB) — trên ngưỡng mặc định 500 kB. Exit code 0 nên Gate không đỏ, nhưng US44 đòi 0 warning. Đáng chú ý là config **đã** khai `codeSplitting` mà lời khuyên của warning vẫn trỏ đúng vào nó, tức là nhóm `vendor` một cục là nguyên nhân. Phải quyết: chia nhỏ thật, hay nâng `build.chunkSizeWarningLimit` kèm lý do. `@monorepo/storybook` có **cùng** warning (ticket 06) — nên quyết một lần cho cả hai.

- **Đã xử lý ở `legacy-migrate` 01 (2026-09-04).** Mỗi app khai cặp port đúng **một** chỗ ở `apps/<app>/ports.env`, `apps/<app>/ports.ts` là reader chung cho `vite.config.ts` và `playwright.config.ts`, và generator `gen:app` gán cặp còn trống thấp nhất rồi ghi thẳng vào `ports.env` của bản clone. E2E của Template này chuyển 3000 → **3100**; không còn `const PORT` hay `--port 3000 --strictPort` ở đâu nữa. Văn bản gốc của khoản treo, giữ làm bối cảnh:

  > **Port 3000 bị ghi cứng ở hai chỗ** (`vite.config.ts` `server.port`, `playwright.config.ts` `const PORT` + `--port 3000 --strictPort` trong `webServer.command`), và generator `gen:app` clone nguyên văn — nên app đầu tiên sinh từ template này va port với chính nó. Smoke test của **ticket 09** đã ghi đầy đủ; bản sửa bền vững (mỗi app khai **một** port mà cả hai config cùng đọc) thuộc ticket này. Lưu ý khi sửa: các literal port đang nằm giữa những comment giải thích chính chúng, nên đổi bằng regex sẽ biến comment thành lời nói dối.
