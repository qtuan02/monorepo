# Quyết định đã chốt — dựng lại `D:\Personal\monorepo` theo khuôn `medviet`

> Phiên grill ngày 2026-09-03. Nghiên cứu nền: [`docs/research/personal-monorepo-rebuild.md`](../../../docs/research/personal-monorepo-rebuild.md). Glossary: [`CONTEXT.md`](../../../CONTEXT.md) ở root (nháp ở đây lúc grill, đã chuyển đi — xem § "Ghi chú khi copy" cuối file). ADR: [`docs/adr/0001..0003`](../../../docs/adr/), cùng đường đi. Bước tiếp theo lúc đó: `/to-spec` → `spec.md` trong thư mục này, rồi `/to-tickets` → `NN-*.md`. Không dùng glab; mọi thứ ở đây, và không có file nào trong Target được sửa cho tới khi ticket đầu tiên chạy.

## Cách chạy ticket

Mọi ticket được `/implement` **từ session mở ở reference** (`E:\MedViet\frontend\medviet`) — skill, rules, tracker markdown đều nằm ở đây; Target chưa có `.agents/` cho tới ticket 11. Quy ước khi thực thi:

- File của Target ghi/đọc bằng **đường dẫn tuyệt đối** `D:\Personal\monorepo\...` (Bash: `/d/Personal/monorepo/...`).
- Lệnh chạy trong Target không đổi cwd của session: `bun --cwd /d/Personal/monorepo run check`, `bunx --cwd ... turbo ...`, `git -C /d/Personal/monorepo ...`; Playwright chạy `bunx playwright test` với cwd là thư mục app của Target (config phải nằm trong app).
- Gate của một ticket = bốn lệnh trên chạy với `--cwd` Target; Gate của reference **không** được đụng (không có thay đổi nào ở reference ngoài thư mục plan này và `docs/research/`).
- Trạng thái ticket cập nhật trong file `NN-*.md` ở đây; ticket 12 mới copy cả thư mục sang Target.

## Quyết định (18)

| # | Chủ đề | Quyết định | Hệ quả ràng buộc |
|---|---|---|---|
| 1 | Legacy app | Dời 6 app + 2 package `-public` + changesets vào `legacy/`, ngoài `workspaces.packages`. Migrate sau, mỗi app một ticket riêng. | Gate xanh phải đạt trên Skeleton thật, không filter. ADR-0001. |
| 2 | Template app | `apps/_template_next` (Next 16 App Router) + `apps/_template_vite` (SPA) + `apps/storybook`. React Router framework là Template thứ ba, làm sau. | Generator `app` phải biết Runtime. |
| 3 | Publish npm | Bỏ. Mọi package `private: true`, source-only `exports: {"./*": "./src/*.ts"}`, không barrel, không build step. | Rule `quality-avoid-barrel-imports` áp toàn bộ. rslib/changesets không có trong Skeleton. |
| 4 | Scope | Giữ `@monorepo/*`. | Import path legacy không đổi khi migrate. |
| 5 | Packages | `env`, `ui`, `hook`, `dayjs`, `i18n`, `api`, `types`, `sentry`. | `api`/`types` là placeholder `template-service` như reference; `sentry` chỉ có Flavor Next. |
| 6 | Vitest | **5.0.0** (latest tuyệt đối, đi trước reference 4.1.x). | Khi copy `vitest.config.ts`/`setup`/test từ reference phải xử lý: `clearMocks` mặc định true, `vi.mock` top-level, `-t` khớp `suite > test`, report vào `.vitest/`. `composeStories` + Vitest 5 chưa xác minh — ticket Storybook phải verify. |
| 7 | React Router | **8.3.1 declarative** cho `_template_vite`. Import từ `react-router` / `react-router/dom`, không có `react-router-dom`. | Sửa rule `routing-constants` (câu "never import from react-router"). Sàn Node ≥22.22, React ≥19.2.7 — thoả. |
| 8 | Node | **24 LTS** (`.nvmrc` 24.20.0, `engines >=24.14`, `@types/node` 24.x, `node:24-alpine`). | Không lấy 26 Current. |
| 9 | i18n | Một package `@monorepo/i18n`, nhiều Flavor theo Runtime: `i18next/*` (Vite), `next-intl/*` (Next), sau này `react-router/*`. Registry `languages.ts` + `locales/<code>.json` dùng chung, JSON viết **ICU MessageFormat**; Flavor i18next đọc qua `i18next-icu` 2.4.4. | ADR-0002. Locale JSON legacy (react-i18next `{{x}}` hoặc next-intl) khi migrate phải chuyển về ICU. |
| 10 | Env | Một package `@monorepo/env`, hai Flavor: `vite` (`createEnv(schema, import.meta.env)` như reference, prefix `PUBLIC_`) và `next` (`@t3-oss/env-nextjs` 0.13.11, prefix `NEXT_PUBLIC_`). Một `.env` root; app Next nạp qua `dotenv-cli` 11 (`dotenv -e ../../.env -- next dev`). | ADR-0003. `.env.example` root liệt kê cả hai nhóm biến. Dockerfile validate bằng import `env.ts` của app. |
| 11 | Deploy Next | `output: "standalone"` + Dockerfile Bun builder → `node:24-alpine` runner, build-per-env ARG như ADR-0004 reference. Vercel zero-config vẫn chạy. | Template không khoá vào một nơi deploy. |
| 12 | Lint | Chỉ Biome 2.5.12, một `biome.json` root copy từ reference + domain `next: "recommended"`. Không ESLint. | Chấp nhận mất rule Next-specific ngoài domain `next`, lint React Compiler, sort class Tailwind (`useSortedClasses` tắt như reference). |
| 13 | Next 16 | `cacheComponents: true` + `reactCompiler: true` ngay trong `_template_next`; Turbopack mặc định; `proxy.ts` (Node runtime) thay `middleware.ts`. | Rule cluster `next-*` viết theo mô hình này. Legacy migrate về phải tuân. |
| 14 | Storybook | 10.6.0 + `@storybook/react-vite`, chỉ addon `addon-docs`; test bằng `composeStories` + jsdom qua Vitest thường; stories copy từ reference (cùng bộ shadcn base-vega). Không `addon-vitest`. | Né lỗi addon-vitest với TS 7. |
| 15 | CI | `.github/workflows/ci.yml`: `check`/`typecheck`/`test`/`build` required, `e2e` (Playwright 1.62.1) `continue-on-error: true` khi diff chạm `apps/`/`packages/`/`tooling/`. Bun qua `oven-sh/setup-bun`. | Dịch tinh thần `.gitlab-ci.yml`, không copy file. |
| 16 | Rules | Copy `.agents/rules/` tiếng Anh, thay `@medviet`→`@monorepo`, sửa `routing-*` cho RR8, **viết mới cluster `next-*`** (App Router, server/client component, data fetching + `cacheComponents`, `proxy.ts`, next-intl, t3-env). `CLAUDE.md` viết lại theo cấu trúc §1–§9 của reference. `.claude` → `.agents` symlink (cần `core.symlinks` + Developer Mode). | Đăng ký prefix `next` trong `_sections.md`. |
| 17 | Tracker | Markdown trong `.agents/plans/<topic>/` của Target (`spec.md` + `NN-*.md`). `docs/agents/issue-tracker.md` mô tả layout này. Không glab/gh. | Skill to-tickets/implement/triage đọc file này. |
| 18 | Generator | Port `turbo/generators/config.ts` (3 generator `package`/`tooling`/`app`); `app` thêm prompt Runtime `next` \| `vite`, clone Template tương ứng, sinh Dockerfile + root script. Gỡ `init`/"Acme". Chạy qua binary `gen` (workaround `bunx turbo gen` trên Windows). | — |

## Mặc định đã nêu và không bị phản đối

- `_template_vite` copy nguyên slice `auth`/`layout`/`home` của reference, đổi scope và import RR8.
- `packages/ui`: `components.json` `"style": "base-vega"`, `imports` `#components/*`/`#utils/cn`, dựng lại toàn bộ bằng `shadcn add` (CLI 4.20.1); `tooling/tailwind` copy kèm hai `@custom-variant data-horizontal/data-vertical` và `#root { isolation: isolate }`.
- Version còn lại lấy `npm latest` ngày 2026-09-03 theo Phần B của research (Vite 8.2.2, plugin-react 6.1.1 + `@rolldown/plugin-babel` 0.2.3 + React Compiler 1.0.0, TS 7.0.2, Turbo 2.10.12, Bun 1.4.0, React 19.2.8, TanStack Query 5.102.8, zustand 5.0.15, zod 4.5.4, RHF 7.87.0 + resolvers 5.9.1, Tailwind 4.3.3, lucide 1.40.0, Base UI 1.7.0, jsdom 30.0.1, jest-dom 7.0.1, next-intl 4.14.2, `@sentry/nextjs` 10.73.0, dayjs 1.11.23, i18next 26.4.1).
- ADR của Target nháp ở `./adr/`, chuyển về `docs/adr/` của Target ở ticket đầu tiên; CONTEXT.md tương tự về root của Target.

## Quyết định phát sinh khi chạy ticket (19–22, ngày 2026-09-04, ticket 12)

Bốn quyết định này không có trong phiên grill 2026-09-03; chúng phát sinh khi US44 ("0 lỗi **và 0 warning**") gặp thực tế của lượt Gate cuối. Bằng chứng đầy đủ ở `12-gate-cuoi-kiem-tay.md`.

| # | Chủ đề | Quyết định | Hệ quả ràng buộc |
|---|---|---|---|
| 19 | Turbo cache của `_template_next:build` | Khai `"cache": false` trong `apps/_template_next/turbo.json`, kèm comment giải thích. | Task này **vốn đã** không cache: `next build` sinh `.next/node_modules/<pkg>-<hash>` là symlink **tuyệt đối** vào `node_modules/.bun/…` (`import-in-the-middle`, `require-in-the-middle` — dependency OpenTelemetry của `@sentry/nextjs`), target dài 99 và 118 ký tự, vượt trường `linkname` 100 byte của định dạng tar mà Turbo dùng; archive ghi hỏng nên không entry cache nào được tạo (ba lần chạy liên tiếp `0 cached`). Khai tường minh chỉ làm hết warning và thôi nói dối về việc có cache. **Cách sửa mà ticket 08 đề xuất đã kiểm và sai:** loại hai đường dẫn đó khỏi `outputs` làm cache chạy được nhưng bản restore chết ngay khi boot (`Cannot find module 'require-in-the-middle-33b9b380c3ed9e62'`) — Turbopack phát `externalRequire("<pkg>-<hash>")` và resolve qua chính `.next/node_modules`, nên chúng là artifact runtime. Muốn cache thật thì phải rút ngắn target (đổi `bunfig.toml` `linker` sang `hoisted`), và độ dài vẫn phụ thuộc đường dẫn checkout nên CI có thể tái phát — đã cân nhắc và loại. |
| 20 | Warning `chunks larger than 500 kB` | Nâng `build.chunkSizeWarningLimit`: **800** cho `_template_vite`, **1500** cho `storybook`. Không chia chunk. | `vendor` của `_template_vite` là một cục **có chủ ý** (deps tách khỏi app chunk để một sửa đổi app không bust cache của chúng) và ~684 kB / 219 kB gzip; mọi mảnh của nó đều load ở first paint, nên chia nhỏ chỉ lách ngưỡng chứ không dời được byte nào khỏi critical path. Với `storybook`, hai chunk vượt ngưỡng là bundle của **chính Storybook** (`iframe.js` ~1.23 MB, `DocsRenderer` ~754 kB) — không có quyết định chunking nào để làm khác. Ngưỡng vẫn đủ thấp để một dependency nặng rơi nhầm vào app chunk còn kêu. |
| 21 | Warning `PLUGIN_TIMINGS` của Rolldown | Tắt bằng `checks.pluginTimings: false`, **chỉ** cho `apps/storybook`. | Rolldown chỉ phát khi build vượt 3s và thời gian plugin lệch hẳn — nên nó **đến và đi theo tải máy**, biến "0 warning" thành thứ phụ thuộc laptop bận hay rảnh. Hai hook chiếm thời gian là `storybook:react-docgen-plugin` (~4.500 lần gọi) và `vite:css`, đều của Storybook, không tinh chỉnh được từ repo này. **Không** tắt cho `_template_vite`: ở đó cảnh báo sẽ nói về plugin của chính app và đáng nhìn. Hai chi tiết dễ sai: phải đặt trong `viteFinal` của `.storybook/main.ts` (builder-vite ghép `build` của nó đè lên `vite.config.ts` được auto-discover), và dưới khoá **`rolldownOptions`**, không phải `rollupOptions` — `checks` là input riêng của Rolldown và bị rơi ở khoá tên-Rollup. |
| 22 | Hai rule Biome mức `warn` | `style.useImportType` và `style.useExportType` nâng từ `warn` lên **`error`**. | Đang 0 vi phạm nên nâng không tốn gì, và biến "0 warning" từ một trạng thái may mắn thành thứ Gate tự giữ. **Là chỗ lệch có chủ ý so với reference `medviet`**, nơi cả hai vẫn là `warn` — đừng "đồng bộ" ngược lại khi copy `biome.json` lần sau. |

## Version thực tế lúc Gate cuối (2026-09-04) so với bảng 2026-09-03

Đối chiếu bảng "Version thực tế (`npm latest`, 2026-09-03)" trong `01-nen-root-legacy-ci.md` với version **đã resolve** trong `bun.lock` / `node_modules/.bun/` của Target.

**Không có package nào lệch.** Mọi số đều resolve đúng bảng: vitest 5.0.0 · jsdom 30.0.1 · RTL 16.3.3 · jest-dom 7.0.1 · user-event 14.6.7 · `@vitest/coverage-v8` 5.0.0 · next 16.3.4 · next-intl 4.14.2 · `@sentry/nextjs` 10.73.0 · dotenv-cli 11.0.0 · jiti 2.7.0 · tailwind 4.3.3 (+ postcss/vite/oxide) · tailwind-scrollbar 4.0.2 · tailwind-merge 3.6.0 · zod 4.5.4 · zustand 5.0.15 · dayjs 1.11.23 · i18next 26.4.1 · react-i18next 17.0.13 · i18next-icu 2.4.4 · i18next-browser-languagedetector 8.2.1 · intl-messageformat 11.2.14 · axios 1.20.0 · postcss 8.5.28 · react-error-boundary 6.1.4 · RHF 7.87.0 + resolvers 5.9.1 · Base UI 1.7.0 · `@rolldown/plugin-babel` 0.2.3 · TanStack Query 5.102.8 · TanStack Table 9.2.4 · clsx 2.1.1 · react/react-dom 19.2.8 · `@types/react` 19.2.18 · `@types/react-dom` 19.2.7 · react-router 8.3.1 · storybook + `@storybook/react` + `/react-vite` + `/addon-docs` 10.6.0 · `@playwright/test` 1.62.1 · vite 8.2.2 · `@vitejs/plugin-react` 6.1.1 · babel-plugin-react-compiler 1.0.0 · cva 0.7.1 · lucide-react 1.40.0 · tw-animate-css 1.4.0 · `@t3-oss/env-core` + `/env-nextjs` 0.13.11 · TypeScript 7.0.2 · Turbo + `@turbo/gen` 2.10.12 · Biome 2.5.12 · `@types/node` 24.13.3 · Bun 1.4.0.

Ba ghi chú, không phải lệch version:

- **Node của máy là `v24.17.0`, `.nvmrc` ghi `24.20.0`.** `engines.node` là `>=24.14.0` nên thoả, và không có gì trong Gate phụ thuộc số patch. Đây là khác biệt duy nhất giữa số ghi trong plan và số chạy thật.
- **`@tanstack/react-virtual` (^3.14.10) và `@next/third-parties` (16.3.4) khai trong catalog nhưng chưa cài.** Catalog chỉ resolve khi một package trỏ `catalog:` vào nó; hiện chưa app nào cần. Không phải thiếu sót — chúng chờ app nghiệp vụ đầu tiên.
- **`postcss` và `@testing-library/jest-dom` mỗi cái có hai bản trong `node_modules/.bun/`** (8.5.28 + 8.5.23; 7.0.1 + 6.9.1). Bản thứ hai của mỗi cặp là transitive của dependency khác; linker `isolated` giữ cả hai đúng như thiết kế, và bản mà workspace dùng là bản trong bảng.

## Ghi chú khi copy thư mục plan sang Target (ticket 12)

Thư mục này được nháp ở reference (`medviet`) vì Target chưa có `.agents/` cho tới ticket 11; bản trong repo này là bản chính thức từ ticket 12 trở đi, bản ở reference đóng băng làm lịch sử.

**`adr/` và `CONTEXT.md` cố ý KHÔNG được copy sang.** Hai thứ đó đã được *chuyển* — không phải sao chép — về đúng chỗ của chúng ở ticket 01, đúng như `docs/agents/issue-tracker.md` mô tả (`adr/` = "drafted here, **moved** to `docs/adr/` when the first ticket runs"; `CONTEXT.md` = "before it **moves** to the workspace it belongs to"):

- ADR → [`docs/adr/0001..0003`](../../../docs/adr/), `status: accepted` + `date: 2026-09-03`. Bản nháp vẫn là `status: proposed` và không có `date`, nên giữ nó ở đây vừa trùng lặp vừa sai với §8 của `CLAUDE.md`.
- Glossary → [`CONTEXT.md`](../../../CONTEXT.md) ở root, được [`CONTEXT-MAP.md`](../../../CONTEXT-MAP.md) trỏ tới. Bản nháp còn viết Target ở ngôi thứ ba ("monorepo cá nhân tại `D:\Personal\monorepo`"), câu đó chỉ đúng khi đọc từ reference.

Bản nháp của cả hai còn trong lịch sử phiên grill ở reference nếu cần đối chiếu.

**Ký hiệu checkbox dùng trong các ticket ở đây:** `[x]` xong, `[ ]` chưa, `[~]` xong một phần — luôn kèm câu giải thích ngay trên dòng đó và một mục trong `## Còn treo`. `issue-tracker.md` không quy định ký hiệu nào, đây là quy ước của riêng thư mục topic này và được dùng nhất quán từ ticket 01.

## Chưa quyết (ngoài phạm vi Skeleton, để ticket migrate app)

- `assistant-ai`: bộ `ai@7` + `@ai-sdk/google@4` + `@ai-sdk/react@4` + `@assistant-ui/react-ai-sdk ≥1.4`; đọc migration guide AI SDK v6/v7 khi migrate.
- Từng app Next legacy có cần Edge runtime cho middleware không (quyết định giữ `middleware.ts` hay `proxy.ts` khi migrate).
