---
status: ready-for-agent
date: 2026-09-04
adr: ../../../docs/adr/0001-legacy-apps-outside-workspace.md, ../../../docs/adr/0002-i18n-one-package-many-flavors-icu-messages.md, ../../../docs/adr/0003-env-two-flavors-native-prefix.md, ../../../docs/adr/0004-npm-publish-qua-publish-shell.md
research: ../../../docs/research/legacy-unfreeze-and-npm-publish.md
glossary: ../../../CONTEXT.md
tracker: markdown trong thư mục này (không glab, không gh)
related: ../npm-publish/spec.md, ../personal-monorepo-rebuild/13-khoan-treo-cua-07-08.md
---

# Spec: Đưa bốn Legacy app về `apps/` qua migrate ticket, rồi xoá `legacy/`

## Problem Statement

Skeleton đã xanh nhưng `apps/` chỉ có hai Template app và Storybook; bốn app nghiệp vụ thật — `portfolio`, `assistant-ai`, `mcp`, `documents` — vẫn đóng băng trong `legacy/` trên Next 15 / Vite 6 / Vitest 2 / Radix, chỉ chạy được bằng pnpm trong thư mục riêng, không install, không Gate, không CI. ADR-0001 hứa "mỗi app quay lại `apps/` bằng một migrate ticket riêng" nhưng chưa có ticket nào tồn tại. Tài liệu vận hành của chúng nằm ở `legacy/docs/` lẫn với nội dung đã chết (pnpm, Vercel deploy cũ, `@monorepo/db` đã xoá, Sentry API cũ). `mcp` có một backend khác đang gọi nên không thể biến mất; `documents` mô tả 42 component Radix + 14 hook không còn tồn tại.

## Solution

Bốn migrate ticket theo đúng ADR-0001 — không `git mv`: mỗi app sinh bằng `gen:app` từ Template đúng Runtime rồi chuyển nghiệp vụ vào, Gate xanh 0 warning và ít nhất một spec `.e2e.ts` xanh local cho từng ticket. Thứ tự `portfolio` → `mcp-weather` (tên mới của `mcp`, giữ độc lập, clone `_template_next` giữ nguyên i18n/guard) → `assistant-ai` → `documents` (cuối, vì nó tài liệu hoá `@fe-monorepo/*` của topic `npm-publish`). Trước đó: ticket 13 §1 của topic cũ (một port mỗi app, generator gán port mới) và một commit vệ sinh hồ sơ. Các app Next deploy Vercel (giữ `vercel.json` cạnh Dockerfile của Template); Docker được chứng minh bằng một job CI `docker build` không push, non-blocking. Sentry DSN riêng mỗi app, key theo tên app. `assistant-ai` lên latest cả bộ AI SDK. Nội dung còn giá trị của `legacy/docs/` về README từng app khi app đó migrate. Kết thúc: xoá toàn bộ `legacy/` và mọi chỗ nhắc nó.

## User Stories

### Chung cho mọi ticket migrate

1. As a developer, I want mỗi app mới sinh bằng `bun run gen:app` từ Template đúng Runtime, so that app có sẵn env Flavor, i18n Flavor, Gate, e2e, Dockerfile, và không copy tay một dòng config nào.
2. As a developer, I want mỗi app có dev port và e2e port riêng, được generator gán và khai ở đúng một chỗ, so that app chạy cạnh Template và cạnh nhau (ticket 13 §1 là điều kiện tiên quyết).
3. As a developer, I want Gate 4 job xanh 0 warning sau mỗi ticket, so that không app nào về `apps/` bằng cách làm Gate thành gate giả.
4. As a developer, I want mỗi app có ít nhất một spec `.e2e.ts` chạy trên bản build (`next start`/`vite preview`) và xanh local qua `bunx playwright test --project=chromium`, so that route, guard, proxy và đường boot được chứng minh chứ không chỉ typecheck.
5. As a developer, I want job `e2e` trên CI tự chạy cho app mới (đã match `apps/`), vẫn `continue-on-error: true`, với điều kiện chuyển sang chặn merge ghi trong workflow (N run liên tiếp không flaky sau khi bốn app về), so that đợt migrate không bị flaky chặn nhưng lộ trình thành gate thật được ghi.
6. As a developer, I want mỗi app có `README.md` (mục đích, env, port, lệnh, deploy) và `apps/_template_vite` cũng có README, so that tài liệu vận hành sống cạnh app thay vì trong `legacy/docs/`.
7. As a developer, I want mọi dependency của app đi qua catalog root (thêm catalog đặt tên khi cần, ví dụ `ai-sdk`), so that không version nào hardcode trong `package.json` app.
8. As a developer, I want mọi test unit/component của app nằm ở `apps/<app>/test/` soi gương `src/`, so that khớp rule `testing-coverage`.
9. As a developer, I want mỗi app Next extend schema env trong `env.ts` của nó với key theo tên app (`NEXT_PUBLIC_<APP>_SENTRY_DSN`, `<APP>_…` cho secret) và thêm dev value vào `.env.example`, so that root `.env` dùng chung không làm hai app giành một key.
10. As a developer, I want quy ước key env theo tên app ghi vào CLAUDE.md §3 và `packages/env/README.md`, so that app thứ năm không phát minh cách khác.
11. As a developer, I want một job CI `docker` không chặn, chạy `docker build` (không push) cho mỗi app có Dockerfile khi diff chạm Dockerfile hoặc app đó, so that lời hứa "image build được" của ticket 12 có bằng chứng lặp lại được; ticket 12 đóng khi job này xanh cho hai Template.
12. As a developer, I want các app Next giữ `vercel.json` (hoặc cấu hình tương đương) cạnh Dockerfile của Template, và ticket xác nhận `output: "standalone"` không xung đột với Vercel zero-config, so that deploy thật vẫn ở Vercel còn Docker chỉ là bằng chứng build.
13. As a developer, I want mọi import router trong app Vite từ `react-router` (không `react-router-dom`), mọi Next app dùng `proxy.ts` thay `middleware.ts`, Sentry qua API mới của `@monorepo/sentry`, so that app khớp rule của Runtime và không mang code Next 15 sang.
14. As a developer, I want không còn gói Radix, ESLint, Prettier, `@t3-oss/env-nextjs` trực tiếp, hay `jiti` trong app nào, so that quyết định của Skeleton không bị app cũ kéo ngược.
15. As a developer, I want `legacy/README.md` cập nhật dòng của từng app khi app đó migrate xong (đến khi xoá cả thư mục), so that trạng thái đóng băng luôn đúng với cây.

### `portfolio` (Next, ticket đầu)

16. As a visitor, I want site portfolio render đầy đủ nội dung trong HTML đầu tiên, có `<title>`, `manifest`, `robots`, `sitemap`, so that SEO không kém bản cũ.
17. As a visitor, I want `/vi` là mặc định không prefix và `/en/...` có prefix, so that URL cũ (nếu có) không vỡ và i18n theo đúng Flavor next-intl.
18. As a developer, I want nội dung của portfolio (feature, component, asset ảnh) chuyển vào slice dưới `features/` và asset dưới `assets/` theo rule, so that không route module nào giữ nghiệp vụ.
19. As a developer, I want Sentry của portfolio dùng DSN riêng qua key theo tên app, so that lỗi của portfolio không lẫn với Template.
20. As a developer, I want `react-markdown` lên major mới nhất và `motion`/`next-themes` được thêm catalog nếu giữ dùng, so that không dependency nào ở version chết.
21. As a developer, I want portfolio là app đầu tiên đi qua job `docker` và job `e2e` CI, so that hai job đó được chứng minh trên một app thật trước ba app còn lại.

### `mcp-weather` (Next, độc lập)

22. As a backend khác đang gọi MCP, I want endpoint `/api/mcp` giữ nguyên hợp đồng (Streamable HTTP, ba tool `hello-world`, `get-weather`, `get-forecast`, không auth), so that migrate không làm đứt client đang chạy.
23. As a developer, I want app tên `mcp-weather` (workspace `@monorepo/mcp-weather`), clone `_template_next` **giữ nguyên** i18n, guard, proxy, chỉ thêm route handler và giữ trang placeholder, so that app khớp Template và không phát minh Runtime mới.
24. As a developer, I want `OPENWEATHERMAP_API_KEY` là server env khai trong `env.ts` của app (không prefix) với dòng trong `.env.example`, so that build fail sớm khi thiếu key trong môi trường cần nó.
25. As a developer, I want `@modelcontextprotocol/sdk` và `zod` ở version mới nhất theo catalog, so that server MCP không kẹt ở SDK 1.0.
26. As a developer, I want một e2e gọi `/api/mcp` bằng `request` fixture (initialize + list tools) trên bản build, so that hợp đồng được chứng minh không cần trình duyệt.
27. As a developer, I want README của `mcp-weather` ghi rõ URL, ba tool, key cần, và app nào đang gọi nó, so that tài liệu `legacy/docs/apps/MCP.md` được thay thế.

### `assistant-ai` (Next)

28. As a user, I want giao diện chat hoạt động với model Gemini và có thể gọi tool qua MCP của `mcp-weather`, so that tính năng cũ không mất.
29. As a developer, I want bộ AI SDK lên latest (`ai`, `@ai-sdk/google`, `@ai-sdk/react`, `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`) qua catalog `ai-sdk`, và breaking change được xử lý trong ticket, so that app không mang nợ upgrade từ ngày đầu.
30. As a developer, I want `app/` ở root chuyển thành `src/app/[locale]/` theo Template, store model chuyển vào `stores/` theo rule Zustand, `@radix-ui/react-slot` thay bằng primitive `@monorepo/ui` (Base UI), so that app khớp Runtime Next của repo.
31. As a developer, I want `GOOGLE_GENERATIVE_AI_API_KEY` (server) và `MCP_DOMAIN` (server, optional) khai trong `env.ts`, so that env của app đi qua đúng Flavor.
32. As a developer, I want e2e của assistant-ai chạy được không cần key thật (mock ở service singleton hoặc route handler khi thiếu key), so that CI không cần secret để chứng minh app boot.

### `documents` (Vite, cuối)

33. As a consumer của `@fe-monorepo/ui`/`hook`, I want site tài liệu mô tả đúng 63 primitive Base UI và 5 hook với cách cài, import subpath, CSS + `@source`, so that tài liệu khớp cái tôi cài từ npm.
34. As a developer, I want metadata (`components.json`, `hooks.json`, registry) **sinh bằng script** từ source `@monorepo/ui` và `@monorepo/hook` trước build, so that thêm primitive bằng `ui-add` là site tự cập nhật.
35. As a developer, I want app sinh từ `_template_vite`: React Router 8, Vitest 5, env prefix `PUBLIC_` qua `env.ts`, `tests/` cũ về `test/` soi gương `src/`, so that app khớp Runtime Vite của repo.
36. As a developer, I want bảng route và cơ chế nạp metadata từ `legacy/docs/apps/DOCUMENTS.md` được viết lại trong README của app, so that phần còn giá trị của tài liệu cũ không mất.
37. As a developer, I want ticket `documents` **chờ** ticket `ui` của topic `npm-publish` `done`, so that site không phải viết lại lần nữa khi bề mặt publish đổi.

### Dọn `legacy/`

38. As a developer, I want khi bốn app và hai shell đã về, xoá toàn bộ `legacy/` (kể cả `_template`, `storybook`, `docs`, `.changeset`, `ui-public`, `hook-public`, README), so that repo không còn cây chết; git history vẫn giữ.
39. As a developer, I want gỡ mọi chỗ nhắc `legacy/`: `biome.json`, `.gitignore`, CLAUDE.md §1/§4, `CONTEXT.md` (thuật ngữ **Legacy app** chuyển thành ghi chú lịch sử hoặc xoá), `CONTEXT-MAP.md`, `docs/agents/domain.md`, `.agents/knowledge-base.md`, `README.md`, so that tài liệu không mô tả một thư mục không tồn tại.
40. As a developer, I want ADR-0001 được đánh dấu hoàn tất (status giữ `accepted`, thêm một dòng "đã thực hiện xong ngày …"), so that người đọc biết ADR đã đi hết vòng đời.

## Implementation Decisions

**Đường migrate.** Đúng ADR-0001: `gen:app` sinh app mới trong `apps/`, sau đó chuyển code nghiệp vụ từ `legacy/<app>` vào theo rule (slice dưới `features/`, asset dưới `assets/`, env trong `env.ts`, test dưới `test/`). Không `git mv` thư mục app. Mỗi ticket đọc `legacy/<app>` như tài liệu tham khảo; sau khi ticket `done`, thư mục legacy của app đó vẫn để yên tới ticket dọn cuối (để so sánh hành vi khi cần).

**Điều kiện tiên quyết.** Ticket 13 §1 của topic `personal-monorepo-rebuild` (một port mỗi app; generator gán port kế tiếp cho dev và e2e) phải `done` trước ticket migrate đầu tiên. Phân bổ port dự kiến: `portfolio` 3002/3102, `mcp-weather` 3003/3103, `assistant-ai` 3004/3104, `documents` 3005/3105 (Template giữ 3000/3001 và 3100/3101, Storybook 6006); con số cuối do generator quyết, spec chỉ đòi "khác nhau và khai một chỗ".

**Vệ sinh hồ sơ trước khi bắt đầu.** Một commit docs riêng, không ticket: tick lại ô "CI chưa chứng minh" ở ticket 01/06/07/08/09 của topic cũ với tham chiếu CI run #2, sửa hai dòng trong `legacy/README.md` (`.changeset/` không giữ "release history"; `-public` giờ trỏ ADR-0004), ghi rõ `legacy/docs/README.md` có link chết và đóng băng.

**Runtime và hình dạng từng app.** `portfolio`, `mcp-weather`, `assistant-ai` → Runtime Next (`_template_next`): `[locale]`, next-intl, `proxy.ts` với session guard, env Flavor next, Sentry, `output: standalone`, Dockerfile. `mcp-weather` giữ nguyên tất cả những thứ đó dù route handler không dùng; route `/api/mcp` nằm ngoài `[locale]` và matcher của proxy đã bỏ qua `/api`. `documents` → Runtime Vite (`_template_vite`). Không Runtime mới, không đổi `CONTEXT.md` về Runtime.

**Env.** Quy ước key theo tên app cho mọi giá trị app-specific: `NEXT_PUBLIC_PORTFOLIO_SENTRY_DSN`, `NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN`, `NEXT_PUBLIC_MCP_WEATHER_SENTRY_DSN`; secret server không prefix nhưng vẫn mang tên app khi có thể trùng (`MCP_WEATHER_OPENWEATHERMAP_API_KEY` hay giữ `OPENWEATHERMAP_API_KEY` — ticket chọn, ưu tiên tên app khi hai app có thể cần key cùng loại). Template giữ `NEXT_PUBLIC_SENTRY_DSN` làm mẫu; `@monorepo/sentry` nhận DSN qua tham số từ `env.ts` của app, không đọc tên key cố định (nếu hiện tại nó đọc cố định thì ticket `portfolio` sửa package). `.env.example` thêm từng key với dev value hoặc comment. Docker build ARG cập nhật theo.

**Deploy.** Ba app Next deploy Vercel: giữ `vercel.json` (rewrite/headers nếu có) và ticket kiểm `output: "standalone"` + `dotenv -e ../../.env` không phá Vercel build (Vercel đọc env từ dashboard, không từ `.env` root — ticket ghi rõ và có thể tách script `build` cho Vercel). Dockerfile của Template giữ nguyên. Job CI `docker`: một job non-blocking trong `ci.yml`, matrix theo app có Dockerfile (hai Template + app mới), chạy `docker build` với build ARG từ `.env.example`, không push, kích hoạt qua job `changes` khi diff chạm `apps/<app>/**`, `packages/**`, `tooling/**`, `bun.lock`, hoặc workflow. Ticket 12 của topic cũ đóng khi job này xanh cho hai Template; trách nhiệm đó thuộc ticket `portfolio`.

**`assistant-ai`.** Catalog mới `ai-sdk` gồm `ai`, `@ai-sdk/google`, `@ai-sdk/react`, `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`, `@modelcontextprotocol/sdk` ở latest lúc ticket chạy. Route chat là route handler dưới `src/app/api/`; client MCP đọc `MCP_DOMAIN` từ `env`. Store model là Zustand global trong `stores/`. UI dựng từ `@monorepo/ui` (không Radix). E2E boot app và mở màn chat với key giả; gọi model thật không nằm trong e2e.

**`documents`.** Sinh từ `_template_vite`. Script `generate-docs-metadata` (Bun) trong app đọc `packages/ui/src/components/*.tsx` và `packages/hook/src/*.ts` (tên file, named exports, JSDoc/props từ `.d.ts` nếu có sau build của topic `npm-publish`) → JSON trong `src/generated/` (gitignored hoặc committed — ticket chọn, ưu tiên sinh lúc `prebuild`/`predev` và gitignore). Nội dung viết cho consumer `@fe-monorepo/*` (cài, import, CSS, `@source`), link sang Storybook cho demo tương tác. Ticket này `**Blocked by:**` ticket `ui` của topic `npm-publish`.

**Docs cũ.** Không tạo `docs/guides/`. Khi migrate: `ASSISTANT-AI.md` → README `assistant-ai`; `MCP.md` → README `mcp-weather`; hai mục của `DOCUMENTS.md` (nạp metadata, bảng route) → README `documents`; `SENTRY.md` chỉ để lại một dòng knowledge-base về DSN theo app; `STORYBOOK.md`, `DATABASE.MD`, `CHANGESET.md`, `README.md` cũ: đóng băng rồi xoá cùng `legacy/`. `apps/_template_vite` được thêm README (đang thiếu) trong ticket đầu tiên chạm Runtime Vite hoặc trong commit vệ sinh.

**Dọn cuối.** Ticket cuối xoá `legacy/` toàn bộ (`git rm -r`), gỡ `!legacy` khỏi `biome.json`, dòng `legacy` khỏi `.gitignore`, đoạn `legacy/` khỏi CLAUDE.md §1 và bảng §4, thuật ngữ **Legacy app** trong `CONTEXT.md` (đổi thành ghi chú "đã hoàn tất, xem ADR-0001" hoặc xoá — ticket chọn, ưu tiên xoá và để ADR kể chuyện), `CONTEXT-MAP.md`, `docs/agents/domain.md`, `.agents/knowledge-base.md` § Legacy, `README.md` mục clone symlink nếu nhắc legacy. Cập nhật `legacy/README.md` không cần nữa vì file bị xoá.

## Testing Decisions

Test tốt kiểm hành vi người dùng hoặc client nhìn thấy trên **bản build**: trang render nội dung, route đúng locale, endpoint trả đúng hợp đồng, app boot với env hợp lệ. Không test markup thuần, không test plumbing của query hook riêng lẻ.

- **Seam chính:** Playwright E2E của từng app trên bản build, seam có sẵn của Template (`next start` / `vite preview`, `request` fixture để fetch raw HTML hoặc gọi API không trình duyệt, `Accept-Language` tự gửi). Không thêm seam mới. Không so snapshot với app legacy chạy bằng pnpm.
- **Gate 4 job** là điều kiện của mọi ticket; e2e chạy local bắt buộc, CI non-blocking.
- **Vitest + RTL** cho logic thuần và nhánh người dùng chạm được (`documents`: script sinh metadata có unit test đọc một fixture nhỏ; `assistant-ai`: store và guard nếu có; `portfolio`: helper nếu có). Mock ở service singleton trong `libs/http-client`, không mock axios hay hook.
- **Job CI `docker`** là seam cho Dockerfile; không có test nào khác cho Docker.
- **Prior art:** `apps/_template_next/e2e/*.e2e.ts` (raw HTML, 404 thật, redirect với `maxRedirects: 0`), `apps/_template_vite/e2e/*.e2e.ts` + `support/auth-session.ts` (seed session qua `addInitScript`), `apps/_template_vite/test/**` soi gương `src/`, `packages/i18n/test/catalogue-invariants.test.ts` (test bất biến trên dữ liệu — mẫu cho test metadata của `documents`).
- **Verify từng ticket:** `bun run check && bun run typecheck && bun run test && bun run build`; `bunx playwright test --project=chromium` từ thư mục app; xem job `e2e` và `docker` trên CI của PR; ghi kết quả vào thân ticket trước khi `done`.

## Out of Scope

- `git mv` app legacy vào `apps/` hay đưa `legacy/` vào workspace.
- Runtime mới (Server/Hono) hay `_template_server`; `mcp-weather` là Next.
- Thêm auth cho `/api/mcp`; đổi hợp đồng MCP.
- Gộp `mcp-weather` vào `assistant-ai`.
- Tạo `docs/guides/`; di chuyển nguyên `legacy/docs/` ra ngoài.
- Biến `e2e`/`docker` thành job chặn merge (điều kiện được ghi, quyết sau).
- Mọi thứ về publish npm (topic `npm-publish`), trừ việc `documents` chờ nó.
- Migrate `legacy/_template` và `legacy/storybook` (đã được thay thế; chỉ xoá).
- Tính năng mới cho bất kỳ app nào; migrate là 1:1 trên khuôn mới, trừ upgrade dependency đã quyết (AI SDK latest, react-markdown, RR8, Vitest 5).

## Further Notes

- Đọc `docs/research/legacy-unfreeze-and-npm-publish.md` §3.2 trước mỗi ticket: bảng đo từng app (framework, cấu trúc, env, test, port, dependency lệch catalog, ràng buộc riêng) là điểm xuất phát; §4 là bảng số phận từng file docs cũ.
- Decisions.md của topic cũ có mục "Chưa quyết" về Edge runtime và bộ AI SDK: Next 16 `proxy.ts` chỉ chạy Node nên không còn gì để quyết về Edge; AI SDK đã quyết latest ở đây.
- `legacy/.env` (untracked) chứa giá trị các app cũ chạy lần cuối — nguồn để điền `.env` root khi migrate; không commit.
- Thứ tự gợi ý cho `/to-tickets`: (0) commit vệ sinh hồ sơ + README `_template_vite`; (1) ticket 13 §1 nếu chưa `done` (thuộc topic cũ, chỉ tham chiếu); (2) `portfolio` + job `docker` + quy ước env theo tên app; (3) `mcp-weather`; (4) `assistant-ai` (`**Blocked by:**` mcp-weather); (5) `documents` (`**Blocked by:**` ticket `ui` của `npm-publish`); (6) dọn `legacy/` (`**Blocked by:**` 2–5 và ticket cuối của `npm-publish`).
