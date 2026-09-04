---
status: ready-for-human
date: 2026-09-03
adr: ../../../docs/adr/0001-legacy-apps-outside-workspace.md, ../../../docs/adr/0002-i18n-one-package-many-flavors-icu-messages.md, ../../../docs/adr/0003-env-two-flavors-native-prefix.md
research: ../../../docs/research/personal-monorepo-rebuild.md
decisions: ./decisions.md
glossary: ../../../CONTEXT.md
tracker: markdown trong thư mục này (không glab, không gh)
---

# Spec: Dựng Skeleton cho `D:\Personal\monorepo` theo khuôn `medviet`

## Problem Statement

Target là monorepo pnpm 10 với sáu app (bốn Next.js 15.4, một Vite SPA, Storybook 8.6 trên Radix), lint bằng ESLint 9 + Prettier 3, `packages/ui`/`hook` build bằng rslib và publish npm qua changesets, không có CI, không có `.agents/`/`CLAUDE.md`, không có package dayjs/i18n/api/types. Mỗi app mới hiện phải dựng tay từ một `_template` Next 15 đã lỗi thời, thư viện lệch nhiều major so với latest (Next 16, Vite 8, Vitest 5, Storybook 10, TypeScript 7, lucide 1.x), và không có cách nào để AI agent làm việc nhất quán trong repo. Reference đã giải xong đúng những vấn đề này (Bun + Turbo + Biome, Base UI, package source-only, 41 rule + skill vendored, GitNexus, gate 4 job), nhưng reference không có app Next.js nào nên không copy nguyên khối được.

## Solution

Dựng **Skeleton** trong chính Target: root Bun + Turbo + Biome + TypeScript 7 + Node 24, tám package source-only (`env`, `ui`, `hook`, `dayjs`, `i18n`, `api`, `types`, `sentry`) theo shape của reference với mô hình **Flavor** cho package phụ thuộc Runtime, hai **Template app** (`_template_next` trên Next 16 App Router, `_template_vite` trên Vite 8 + React Router 8 declarative) cộng Storybook 10 trên Base UI, generator clone template theo Runtime, GitHub Actions chạy đúng bốn job Gate + `e2e` không chặn, và toàn bộ AI tooling (`CLAUDE.md`, `.agents/` rules/skills/plans, GitNexus, MCP) viết cho stack của Target. Sáu app cũ và hai package publish dời vào `legacy/` ngoài workspace (ADR-0001) để Gate của Skeleton xanh thật với 0 lỗi 0 warning; mỗi Legacy app quay lại `apps/` bằng ticket migrate riêng sau spec này.

## User Stories

1. As a developer, I want một lệnh `bun install` ở root cài toàn bộ workspace từ `bun.lock`, so that không còn pnpm, `pnpm-workspace.yaml` hay `.npmrc` trong Skeleton.
2. As a developer, I want catalog version khai trong `package.json` root (`catalog` + `catalogs` đặt tên), so that mọi app/package dùng `catalog:` và bump một chỗ.
3. As a developer, I want `.nvmrc`, `engines`, `packageManager` cùng khóa Node 24 LTS và Bun 1.4, so that máy khác và CI chạy đúng runtime.
4. As a developer, I want một `biome.json` root duy nhất (format + lint + sort import, domain `react`/`turborepo`/`types`/`next`) thay ESLint + Prettier, so that `bun run check` là một pass và không còn config lint per-package.
5. As a developer, I want VS Code format-on-save và organize-imports qua extension Biome, so that editor và CI cho cùng kết quả.
6. As a developer, I want TypeScript 7 (tsgo) với `tsconfig` base strict chung trong `tooling/typescript`, so that `bun run typecheck` chạy nhanh và mọi workspace chung một chuẩn.
7. As a developer, I want `turbo.json` có task `topo`/`build`/`dev`/`typecheck`/`test`/`test:coverage`/`e2e`/`clean`/`ui-add` với `globalEnv` cho cả `PUBLIC_*` và `NEXT_PUBLIC_*`, so that cache của Turbo invalidate đúng khi env đổi và không còn task `lint`/`format` qua Turbo.
8. As a developer, I want sáu app cũ và hai package `-public` nằm trong `legacy/` ngoài workspace, so that Gate của Skeleton không bị chúng làm đỏ và git history vẫn còn.
9. As a developer, I want mọi package trong `packages/` là `private`, source-only, `exports` subpath vào `src`, không barrel, không build step, so that import luôn trỏ vào file cụ thể và không có `dist/` để đồng bộ.
10. As a developer, I want `@monorepo/env` có Flavor `vite` (`createEnv` + `baseEnvSchema` như reference, prefix `PUBLIC_`) và Flavor `next` (`@t3-oss/env-nextjs`, prefix `NEXT_PUBLIC_`, tách `server`/`client`), so that mỗi Runtime validate env bằng Zod theo đúng cơ chế inline của nó (ADR-0003).
11. As a developer, I want một `.env` root (gitignored) và một `.env.example` liệt kê cả hai nhóm biến, với app Next nạp qua `dotenv-cli`, so that env có một nguồn sự thật cho mọi Runtime.
12. As a developer, I want build fail sớm khi thiếu hoặc sai biến env, cả ở `vite build`/`next build` lẫn trong Docker builder stage bằng cách import chính `env.ts` của app, so that lỗi cấu hình không lọt vào container.
13. As a developer, I want `@monorepo/i18n` giữ một registry ngôn ngữ và một bộ locale JSON chuẩn ICU, với Flavor `i18next` cho Vite và Flavor `next-intl` cho Next, so that thêm ngôn ngữ hay sửa chuỗi làm ở một chỗ cho mọi Runtime (ADR-0002).
14. As a developer, I want Flavor `i18next` đọc ICU qua `i18next-icu`, so that cùng một JSON chạy được ở cả hai thư viện.
15. As a developer, I want `@monorepo/dayjs` là singleton đã extend plugin ở module scope, có bảng format, registry locale riêng bằng value và `setDayjsLocale`, so that mọi app format ngày qua một cấu hình và không app nào extend plugin lẻ.
16. As a developer, I want app bridge i18n với dayjs ở wiring site của app (`languageChanged` → `setDayjsLocale`), so that package dayjs không import package i18n và đồ thị import không có cạnh ngược.
17. As a developer, I want `@monorepo/ui` là bộ shadcn style `base-vega` trên `@base-ui/react` 1.7, đủ bộ registry, dùng subpath imports nội bộ `#components/*`/`#utils/cn` và script `ui-add`, so that `shadcn add --overwrite` không tạo diff giả và không còn gói Radix nào.
18. As a developer, I want composition qua `render` prop và state qua data-attribute trần (`data-open`), so that code khớp Base UI và rule `architecture-ui-primitives`.
19. As a developer, I want `tooling/tailwind` có theme, globals, postcss config, `@custom-variant dark`, hai `@custom-variant data-horizontal`/`data-vertical` và `isolation: isolate` ở root, so that slider/scrollbar/tabs của Base UI không vỡ layout âm thầm.
20. As a developer, I want `@monorepo/hook` chứa hook generic (debounce, media query, copy-to-clipboard, is-mobile) source-only, so that `@monorepo/ui` và các app dùng chung mà không có hooks folder trong package ui.
21. As a developer, I want `@monorepo/api` có `HttpClient` (axios, `HttpError` chuẩn hóa, `getAuthToken`/`onUnauthorized`) và một service placeholder `template-service`, cùng `@monorepo/types` có entity + params placeholder tương ứng, so that app đầu tiên gọi REST có shape sẵn để copy.
22. As a developer, I want `@monorepo/sentry` là wrapper `@sentry/nextjs` 10.x chỉ có Flavor Next, so that app Next bật Sentry bằng một import và app Vite không kéo theo nó.
23. As a developer, I want `_template_vite` là bản clone của template SPA reference (slice `auth`/`layout`/`home`, `ROUTES` constant, guard `ProtectedRoute`/`GuestRoute`, TanStack Query + key factory, Zustand persist, exception screens, page composites) trên Vite 8 + `@vitejs/plugin-react` 6 + React Compiler qua `@rolldown/plugin-babel`, React Router 8 declarative, so that app sau login clone được ngay và mọi rule của reference áp đúng.
24. As a developer, I want `_template_vite` có Dockerfile Bun builder → nginx runner, build-per-env qua ARG, `nginx.conf` SPA fallback, so that deploy self-host giống reference.
25. As a developer, I want `_template_next` là app Next 16.3 App Router với `cacheComponents: true`, `reactCompiler: true`, Turbopack, `proxy.ts`, route `[locale]` qua next-intl, env qua Flavor `next`, Sentry qua `@monorepo/sentry`, cùng cấu trúc slice `features/<feat>` và `components/` như template Vite, so that app có SEO/SSR clone được ngay và pattern mới của Next 16 được dạy từ đầu.
26. As a developer, I want `_template_next` có `output: "standalone"` và Dockerfile Bun builder → `node:24-alpine` runner chạy `node server.js` với user non-root, so that app Next self-host được mà vẫn deploy Vercel zero-config.
27. As a developer, I want Storybook 10.6 trên `@storybook/react-vite`, chỉ addon `addon-docs`, preview bọc `TooltipProvider` + `Toaster` + globals Tailwind, stories copy từ reference cho mọi primitive, so that xem được toàn bộ `@monorepo/ui` và phát hiện lỗi orientation bằng mắt.
28. As a developer, I want test story chạy bằng `composeStories` + jsdom trong Vitest thường (render mọi story, mở mọi overlay, test validate form), so that story được kiểm trong Gate `test` mà không cần addon-vitest hay browser.
29. As a developer, I want Vitest 5 + RTL + jsdom trong mọi app, `test/` soi gương `src/`, pin `TZ=UTC` trong config (không prefix CLI), setup pin ngôn ngữ `vi`, mock ở service singleton, so that test copy từ reference chạy và rule `testing-*` đúng với Target.
30. As a developer, I want `@monorepo/api` và `@monorepo/ui` có Vitest runner riêng (node env) cho phần framework-free, so that util và service class được test không cần DOM.
31. As a developer, I want Playwright 1.62 với spec `.e2e.ts`, hai project `chromium`/`watch`, `webServer` tự build + preview, `locale: vi-VN`, cho `_template_vite` (boot + sign-in) và `_template_next` (raw HTML SSR, 404 thật), so that hành vi chỉ thấy ở browser thật hoặc server thật có chỗ để assert.
32. As a developer, I want GitHub Actions trên `setup-bun` với bốn job required `check`/`typecheck`/`test`/`build` và job `e2e` `continue-on-error` chạy khi diff chạm `apps/`/`packages/`/`tooling/`, so that Gate được chứng minh ngoài máy cá nhân và E2E soak mà không chặn merge.
33. As a developer, I want `turbo/generators` có `package`/`tooling`/`app`, với `app` hỏi Runtime (`next`/`vite`) rồi clone đúng Template app, sửa tên, Dockerfile, root script `dev:<app>`/`build:<app>`, chạy `bun install` và `biome check --write`, so that tạo app mới là một lệnh.
34. As a developer, I want generator chạy qua binary `gen` thay vì `bunx turbo gen`, so that không dính bug cắt cụt tham số trên Windows.
35. As a developer, I want `CLAUDE.md` của Target viết theo cấu trúc §1–§9 của reference nhưng mô tả đúng Target (Runtime, Flavor, Legacy, hai Template), so that agent đọc một file là biết đặt gì ở đâu.
36. As a developer, I want `.agents/rules/` copy mười cluster của reference bằng tiếng Anh với scope `@monorepo`, rule `routing-*` sửa cho React Router 8, và cluster `next-*` viết mới (app router, server/client component, data fetching với `cacheComponents`, `proxy.ts`, next-intl, t3-env), so that mọi Runtime trong Skeleton đều có rule.
37. As a developer, I want `.agents/rules/_sections.md` và `.agents/README.md` đăng ký cluster `next` và index đủ rule, so that rule mới tìm được theo đúng quy trình §8 của reference.
38. As a developer, I want `.claude` là symlink tới `.agents`, với hướng dẫn bật `core.symlinks` + Developer Mode trên Windows ghi trong README, so that Claude Code nạp rules/skills/plans native mà repo chỉ có một thư mục nguồn.
39. As a developer, I want skill của mattpocock vendored qua `npx skills add` với `skills-lock.json` (kèm `writing-for-agents`, `wizard`), skill của Vercel (`react-best-practices`, `web-design-guidelines`) và bộ skill GitNexus, so that các workflow `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review` chạy trong Target như ở reference.
40. As a developer, I want `.mcp.json` project-scope khai Context7 và GitNexus, và `.gitnexus/` gitignored, so that index code intelligence và docs live có sẵn sau `npx gitnexus analyze`.
41. As a developer, I want `docs/agents/` (issue-tracker mô tả layout markdown trong `.agents/plans/`, triage-labels, domain), `docs/adr/` với ba ADR của Skeleton, `docs/research/`, `CONTEXT-MAP.md` + `CONTEXT.md` gốc, so that domain docs của Target có chỗ và skill biết đọc ở đâu.
42. As a developer, I want `.agents/plans/` là tracker: một thư mục theo chủ đề với `spec.md` + `NN-*.md` có `status` trong frontmatter, so that không phụ thuộc dịch vụ ngoài.
43. As a developer, I want README root mô tả cách clone (symlink), cài, chạy từng app, chạy Gate, tạo app mới, và trạng thái `legacy/`, so that người mới (kể cả tôi sau vài tháng) vào được ngay.
44. As a developer, I want Gate `bun run check && bun run typecheck && bun run test && bun run build` xanh với 0 lỗi và 0 warning trên Skeleton, so that mọi ticket sau có baseline sạch.
45. As a developer, I want `docker build` của hai Template và Storybook chạy được bằng tay từ Skeleton, so that đường self-host được chứng minh ít nhất một lần.
46. As a developer, I want Storybook mở thật và slider/scrollbar/tabs đúng orientation, so that bẫy `@custom-variant` không lọt qua vì jsdom không thấy.
47. As a maintainer of legacy apps, I want từng app trong `legacy/` vẫn mở được bằng toolchain cũ của nó cho tới khi được migrate, so that không có app nào mất hẳn khả năng chạy trong lúc chờ.
48. As a maintainer of legacy apps, I want một ghi chú trong `legacy/README` liệt kê từng app, Runtime của nó, và Template đích khi migrate, so that ticket migrate sau này có điểm bắt đầu.

## Implementation Decisions

**Cấu trúc Skeleton.** `apps/` = `_template_next`, `_template_vite`, `storybook`. `packages/` = `env`, `ui`, `hook`, `dayjs`, `i18n`, `api`, `types`, `sentry`. `tooling/` = `tailwind`, `typescript` (đổi tên từ `toolings/`, bỏ `eslint`/`prettier`). `legacy/` = sáu app cũ + `ui-public` + `hook-public` + `.changeset`, không nằm trong `workspaces.packages` (ADR-0001). `turbo/generators` giữ vị trí cũ. Scope `@monorepo/*`.

**Root toolchain.** Bun 1.4 (`packageManager`, `bunfig.toml` `linker = "isolated"`, `bun.lock`), Node 24 LTS, Turbo 2.10, TypeScript 7.0, Biome 2.5. Migrate pnpm → Bun bằng `bun install` (tự đọc `pnpm-lock.yaml` và chuyển catalogs vào `package.json`), sau đó xóa file pnpm. Catalog root + catalogs đặt tên theo reference (`react19`, `tailwind4`, `tanstack-query5`, `react-router8`, `tanstack-table9`, `testing`) cộng `next16` cho nhóm Next. Mọi version lấy `npm latest` ngày 2026-09-03 theo Phần B của research; Vitest cố ý lấy 5.0.0 (đi trước reference). Biome: `biome migrate eslint/prettier --write` một lần rồi thay bằng bản copy `biome.json` của reference với domain `next` bật thêm, `useSortedClasses` tắt. Không giữ ESLint dưới bất kỳ dạng nào.

**Mô hình Flavor.** Package phụ thuộc Runtime tách subpath theo Flavor; phần chung nằm ngoài Flavor. `@monorepo/env`: `vite` (createEnv + baseEnvSchema như reference, prefix `PUBLIC_`) và `next` (t3-env, `server`/`client`/`shared`, prefix `NEXT_PUBLIC_`); `.env` một file ở root, Next nạp qua dotenv-cli (ADR-0003). `@monorepo/i18n`: registry `languages` + `locales/<code>.json` ICU dùng chung; Flavor `i18next` (createI18n với cookie detector + `i18next-icu`) và Flavor `next-intl` (request config, middleware/proxy factory, provider) (ADR-0002). `@monorepo/sentry`: chỉ Flavor Next. `@monorepo/dayjs`, `hook`, `ui`, `api`, `types`: không có Flavor.

**Template Vite.** Clone nguyên slice và infra của template SPA reference; khác biệt: scope, React Router 8 declarative (import từ `react-router` và `react-router/dom`), Vite 8 + plugin-react 6 + `@rolldown/plugin-babel` với `reactCompilerPreset`, Vitest 5, Flavor `vite` của env/i18n. Dockerfile Bun → nginx, build-per-env, validate env bằng import `env.ts`.

**Template Next.** Next 16.3 App Router, `cacheComponents` + `reactCompiler` bật, Turbopack, `proxy.ts` Node runtime, route `[locale]` với next-intl, `output: standalone`. Cấu trúc thư mục lặp lại tinh thần slice của reference (`features/<feat>`, `components/`, `hooks/api` cho TanStack Query phía client, `libs/` wiring) với route module trong `app/`. Dockerfile Bun builder → `node:24-alpine`, `node server.js`, user `node`. Vercel không cần file riêng.

**Storybook.** 10.6 + react-vite, `addon-docs` duy nhất, preview và stories copy từ reference (cùng bộ base-vega), test qua `composeStories` + jsdom với setup stub ResizeObserver/pointer capture. Không addon-vitest (tránh lỗi tsgo).

**Testing infra.** Vitest 5: mỗi app và `api`/`ui` có runner riêng chạy qua Turbo task `test` (không dùng `test.projects` root); `TZ=UTC` pin trong config; setup pin ngôn ngữ; mock ở service singleton. Playwright 1.62 với `testMatch` `.e2e.ts`, project `chromium` (CI) và `watch` (headed), `webServer` tự build; template Next chạy server thật và assert raw HTML.

**CI.** GitHub Actions một workflow: `check`, `typecheck`, `test`, `build` required; `e2e` `continue-on-error: true`, ảnh Playwright khớp version, không route qua Turbo để giữ `PLAYWRIGHT_BROWSERS_PATH`. Bun cache theo `bun.lock`.

**Generator.** Port ba generator của reference; `app` thêm prompt Runtime, clone `_template_next` hoặc `_template_vite`, sửa `package.json`, Dockerfile ARG, root scripts, rồi `bun install` + Biome. Scripts root gọi binary `gen` trực tiếp.

**AI tooling.** `CLAUDE.md` mới theo cấu trúc reference (§1 structure với Runtime/Flavor/Legacy, §2 data flow cho cả hai Runtime, §3 lookup, §4 read-what, §5 clusters gồm `next`, §6 commands, §7/§7a skills + override tiếng Việt, §7b plans = tracker, §8 authoring, §9 agent docs) và khối GitNexus sinh bởi `gitnexus analyze`. `.agents/` với `rules/` (copy + đổi scope + sửa `routing-*` + cluster `next-*` mới), `skills/` (mattpocock qua `npx skills add` với lock file; Vercel; GitNexus), `plans/` (tracker), `settings.json` (`plansDirectory`), `README.md`, `commands.md`, `knowledge-base.md`. `.claude` symlink → `.agents`; `.mcp.json` project-scope (Context7, GitNexus). `docs/agents/` mô tả tracker markdown, `docs/adr/` nhận ba ADR, `CONTEXT-MAP.md` + `CONTEXT.md` từ nháp trong thư mục plan này.

**Thứ tự phụ thuộc.** Nền root → legacy dời ra → packages (env, dayjs, i18n, hook, types, api, tailwind tooling, ui, sentry) → `_template_vite` → `_template_next` → storybook → generator + CI → AI tooling → gate cuối + kiểm tay. Mỗi bước kết thúc bằng Gate xanh trên phần đã có.

## Testing Decisions

**Test tốt** ở đây là test chứng minh hành vi người dùng hoặc contract của package, không phải cấu hình: một page render đúng chuỗi tiếng Việt, guard redirect đúng, service class gọi đúng path và unwrap đúng body, `createEnv` throw khi thiếu biến, `setDayjsLocale` fallback đúng, ICU plural render đúng ở cả hai Flavor i18n, story mở overlay không crash. Không test rằng `biome.json` có key X hay `turbo.json` có task Y; thứ đó Gate đã chứng minh bằng cách chạy.

**Seam chính là Gate**: `check` + `typecheck` + `test` + `build` trên toàn workspace, local và GitHub Actions. Mọi ticket dừng ở đây.

**Module được test (Vitest 5):** `@monorepo/env` (cả hai Flavor: parse thành công, throw có message khi thiếu/sai), `@monorepo/dayjs` (format table, locale fallback, thứ tự plugin), `@monorepo/i18n` (registry, ICU interpolation/plural qua Flavor i18next; Flavor next-intl test mức request config), `@monorepo/api` (HttpClient + HttpError + service placeholder, node env), `@monorepo/ui` utils (node env), `_template_vite` (copy suite reference: pages, guards, components, hooks với mock service singleton), `_template_next` (route/page với next-intl provider, `env.ts`), `storybook` (`stories.test` render mọi story + `form-stories.test`).

**Playwright (không chặn):** `_template_vite` boot bundle production + sign-in flow; `_template_next` fetch raw HTML có nội dung SSR và 404 thật.

**Kiểm tay, ghi vào ticket dưới dạng checklist:** `docker build` ba image; Storybook mở thật soi orientation; `git ls-files -s .claude` mode 120000 sau clone trên Windows.

**Prior art:** toàn bộ `test/` của template SPA reference, `packages/api/test`, `packages/ui/test`, `apps/storybook/test`, hai file e2e của reference; rule `testing-setup`, `testing-mocking`, `testing-timezone`, `testing-playwright`.

## Out of Scope

- Migrate bất kỳ Legacy app nào (portfolio, assistant-ai, mcp, `_template` cũ, documents) hay hai package `-public`; mỗi cái là ticket riêng sau Skeleton, gồm cả quyết định `middleware.ts` vs `proxy.ts` và bộ `ai@7` cho assistant-ai.
- `_template_reactrouter` (Runtime React Router framework) và Flavor `react-router` của i18n/env.
- Publish npm, changesets, rslib trong Skeleton.
- ESLint dưới bất kỳ dạng nào; sort class Tailwind tự động.
- `@storybook/addon-vitest`, Vitest browser mode, `test.projects` root-level.
- Ingress/K8s/Vercel config ngoài repo; Sentry DSN thật; Turnstile.
- Sửa bất kỳ thứ gì trong reference `medviet` (research và plan này nằm ở reference chỉ vì tracker của Target chưa tồn tại).

## Further Notes

- Vitest 5 là lựa chọn cố ý đi trước reference; nếu `composeStories` của Storybook 10.6 không chạy với Vitest 5, ticket Storybook ghi nhận và đề xuất quay về 4.1.x cho riêng app storybook, không âm thầm hạ toàn repo.
- Hai package `api`/`types` là placeholder có chủ đích để giữ shape; không nhồi domain giả.
- Khi copy rule từ reference, giữ tiếng Anh để diff với upstream; chỉ `CLAUDE.md §7a` và tài liệu tiếng Việt.
- Ba ADR nháp ở `./adr/` của thư mục plan này; ticket đầu tiên chuyển chúng và `CONTEXT.md` về Target.
- Số liệu version trong spec là `npm latest` ngày 2026-09-03; khi ticket chạy muộn hơn, lấy latest tại thời điểm chạy và ghi vào ticket, không sửa lại spec.
