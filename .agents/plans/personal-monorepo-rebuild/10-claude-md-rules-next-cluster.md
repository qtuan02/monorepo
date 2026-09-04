---
status: done
---

# 10 — `CLAUDE.md` của Target và `.agents/rules` (copy + cluster `next-*` mới)

**What to build:** Một agent mở Target, đọc `CLAUDE.md` và biết: hai Runtime, mô hình Flavor, Legacy, đặt gì ở đâu (§3) cho cả app Vite lẫn app Next, đọc rule nào cho việc nào (§4), lệnh nào để chạy Gate (§6), skill nào cho workflow (§7) với override tiếng Việt (§7a), tracker là markdown trong `.agents/plans/` (§7b). `.agents/rules/` có đủ mười cluster của reference đã đổi scope, `routing-*` đúng với React Router 8, và cluster `next-*` mới mô tả pattern thật của `_template_next`.

**Blocked by:** 07 — `_template_vite`; 08 — `_template_next`.

> Chạy từ session ở reference (`E:\MedViet\frontend\medviet`), ghi sang `D:\Personal\monorepo` bằng đường dẫn tuyệt đối, lệnh dùng `--cwd`/`git -C` — xem "Cách chạy ticket" trong `decisions.md`. Không sửa gì ở reference.

**Status:** done (viết 2026-09-04 trên nhánh `feat/upgrade`, chưa commit; đã qua một lượt review đối kháng + fix — xem "Lệch so với ticket")

- [x] `.agents/rules/` copy mọi rule reference (tiếng Anh), thay `@medviet`→`@monorepo`, thay ví dụ đường dẫn reference bằng của Target, bỏ đoạn về `_template_reactrouter`/Harbor/GitLab không áp dụng. Reference có 45 file rule, Target có 48: 3 file bỏ (xem ô dưới), 6 file `next-*` thêm. Quét `@medviet|medviet|_template_reactrouter|manage-form|health-checkup|gitlab|glab|Harbor|Turnstile` trên `.agents/` + `CLAUDE.md` chỉ còn các câu phủ định cố ý (`routing-constants.md` nói `react-router-dom` **không được cài**; hai ghi chú "đã bỏ ba rule"). Mọi link `../../…` trong rule (43 link) đều trỏ tới file có thật
- [x] `routing-constants`, `routing-route-guards`: import từ `react-router`/`react-router/dom`, ví dụ khớp `_template_vite`; **quyết định về ba rule framework-mode: BỎ** — xem "Quyết định: ba rule framework-mode" bên dưới
- [x] Cluster `next-*` mới đủ sáu rule: `next-app-router-structure`, `next-server-vs-client-components`, `next-data-fetching`, `next-proxy-guards`, `next-i18n-next-intl`, `next-env-t3`. Mỗi file có front-matter `title`/`impact`/`impactDescription`/`tags` theo `_template.md` và có cả khối ❌ lẫn ✅. Mọi ví dụ đối chiếu được với code thật của `_template_next` (matcher của `proxy.ts`, `revalidateTag(TAG, "hours")` hai tham số, `"use cache"` + `cacheLife`/`cacheTag`, `localePrefix: "as-needed"`, ba khối của `env.ts`)
- [x] `_sections.md` đăng ký prefix `next` (11 heading, id khớp đúng 11 prefix có trên đĩa); `.agents/README.md` index đủ 46 rule + 2 file meta, kiểm hai chiều bằng set-difference (0 rule thiếu index, 0 dòng index trỏ file không tồn tại); các cluster khác đã rà lại — xem "Lệch so với ticket" #2 về câu mô tả cluster `testing-*`
- [x] `CLAUDE.md` viết mới theo cấu trúc §1–§9 của reference; §7a giữ tiếng Việt; chưa có khối GitNexus (`grep -c gitnexus` = 2, đều là prose, không có marker `gitnexus:start/end`). §1 đối chiếu cây thật (8 package, 63 primitive trong `packages/ui/src/components`, `legacy/` 6 app + 2 package `-public` + `.changeset` + `docs`), §6 đối chiếu `package.json` thật (15 script, `.nvmrc` 24.20.0, `bun@1.4.0`, Biome 2.5.12, Playwright 1.62.1) và `.github/workflows/ci.yml` thật
- [x] `.agents/settings.json` `plansDirectory: ".agents/plans"`; `.agents/plans/.gitkeep` — cả hai có, `settings.json` đúng 3 dòng JSON hợp lệ
- [x] Gate xanh (rule/markdown không ảnh hưởng Gate nhưng Biome không được báo gì mới) — `bun run check` → `Checked 350 files in 18s. No fixes applied.`, exit 0. Cả bốn lệnh Gate exit 0 (xem bảng trong `09-generator-runtime.md`)

---

## Quyết định: ba rule framework-mode → **bỏ**, không giữ kèm nhãn

`routing-typed-href`, `routing-middleware-guards`, `patterns-loader-vs-query` **không** được viết vào Target.

**Lý do.** Cả ba mô tả Runtime React Router framework mode. Spec đặt Runtime đó ngoài phạm vi Skeleton và Target không có Template app nào cho nó. Một rule mô tả shape mà repo không chứa là documentation debt: agent đọc `.agents/README.md` sẽ thấy nó như một lựa chọn thật, và checkbox "index đủ rule" của chính ticket này sẽ index nó như thể có `loader` để viết. Phương án "giữ lại kèm nhãn *áp dụng khi có Runtime React Router framework*" bị loại vì nhãn không ngăn được việc đó — nó chỉ thêm một lớp điều kiện mà người đọc phải tự áp dụng đúng.

**Khôi phục.** Cả ba lấy lại **nguyên văn** từ reference `E:\MedViet\frontend\medviet\.agents\rules\` vào ngày Template app thứ ba xuất hiện. Chúng giữ prefix `routing-`/`patterns-` nên không phải đăng ký prefix mới trong `_sections.md`. Quyết định + đường khôi phục đã ghi ở hai chỗ trong chính Target để người diff với reference thấy đây là chủ ý chứ không phải thiếu sót: `.agents/rules/_sections.md:19` (blockquote trong section Routing) và `CLAUDE.md:225` (ghi chú dưới §5).

**Hệ quả đã xử lý.** 10 cross-link `[[...]]` trỏ tới ba rule này, nằm trong 5 file còn lại. Bảy link được trỏ lại sang rule `next-*` mang shape tương đương (`[[next-data-fetching]]`, `[[next-proxy-guards]]`, `[[next-app-router-structure]]`); ba link biến mất cùng đoạn văn chứa chúng. Không còn `[[...]]` treo trong thư mục (kiểm bằng set-difference toàn bộ link target với danh sách filename). Hai chỗ trong `apps/_template_next` còn trỏ đích danh `.agents/rules/patterns-loader-vs-query.md` — `src/features/home/server/home-catalogue.ts` và `README.md` — đã được sửa sang `next-data-fetching.md` trong lượt fix.

## Lệch so với ticket (và vì sao)

1. **Ba rule framework-mode bị bỏ hẳn** thay vì "giữ lại có nhãn" — ticket cho phép cả hai, lựa chọn và lý do ở trên.

2. **Không tạo `testing-setup.md` / `testing-mocking.md` / `testing-timezone.md` / `testing-incremental.md`.** Reference `CLAUDE.md` §4/§7a trỏ tới bốn file này, nhưng **reference cũng không có chúng**: `.agents/rules/testing-*` của reference chỉ có `testing-coverage.md` và `testing-playwright.md` (bốn file kia bị gỡ khỏi reference từ trước, khôi phục được ở `9bec2b8^` theo memory). Viết mới bốn rule từ đầu là *sáng tác*, không phải "copy rule của reference". Nên: `CLAUDE.md` của Target **không** link tới bốn file đó, và những sự thật chúng mang (cây `test/` soi gương `src/`, mock ở service singleton trong `~/libs/http-client`, pin `TZ=UTC` nằm trong `vitest.config.ts`) được phát biểu thẳng trong §3/§6/§7a. Lượt review bắt được rằng bản đầu vẫn quảng cáo "the service-singleton mock seam" trong mô tả cluster `testing-*` ở `_sections.md:64` và `CLAUDE.md` §5 — tức là hứa một rule không tồn tại; đã sửa hai mô tả xuống đúng những gì hai file thật mang.

3. **`next` được đăng ký là section 3 trong `_sections.md`** (sau Routing, trước React) chứ không phải section 11 nối đuôi. Thứ tự của registry là ngữ nghĩa: `routing` và `next` là hai cluster hình-theo-Runtime và agent chọn giữa chúng như **một** quyết định; đẩy `next` xuống cuối tách hai nửa của quyết định đó ra xa nhau tám section.

4. **Nhiều rule phải sửa nội dung chứ không chỉ đổi scope** — 13/40 file. Đáng kể nhất: `quality-imports.md` phải **đảo ngược** khẳng định của reference rằng không có `#hooks/*` (Target *có*, trong `packages/ui/package.json`, kèm `scripts/guard-no-local-hooks.ts` giải thích vì sao — giữ nguyên câu của reference là tự mâu thuẫn với một file cùng repo); `quality-avoid-barrel-imports.md` phải mô tả shape `exports` thứ ba (`@monorepo/env` và `@monorepo/i18n` xuất theo Flavor `./vite/*`/`./next/*`, `./i18next/*`/`./next-intl/*`, không phải glob phẳng); `architecture-shared-components.md` phải bỏ `~/constants/layout.ts`, `PAGE_CONTAINER_CLASS` và `page-back-button.tsx` (không tồn tại ở Target — xem ticket 07); `architecture-ui-primitives.md` sửa "61 primitive" thành 63 và bỏ hai link ADR-0001 (ADR-0001 của Target là "legacy apps outside workspace", không phải quyết định Base UI); `forms-schema-driven.md` giữ quy ước `import * as z` nhưng bỏ lý do "musl build của CI" (CI của Target là GitHub Actions `ubuntu-latest`, glibc — không có build musl nào để hỏng), neo lại vào cơ chế thật; `testing-playwright.md` viết lại toàn bộ phần CI theo `.github/workflows/ci.yml` thật và thêm mục "Running it locally on Windows".

5. **Sau review đối kháng, ba chỗ sai sự thật được sửa.** (a) `quality-avoid-barrel-imports.md:96` import `baseEnvSchema` từ `@monorepo/env/next/schema` — module đó xuất `baseClientSchema`, `baseEnvSchema` chỉ có ở Flavor `vite`, nên ví dụ không compile được **và** mâu thuẫn với `next-env-t3.md:28` ("There is no `.extend()` on this side"); đã sửa. (b) `CLAUDE.md` §7 và `.agents/README.md` dẫn đường dẫn `.agents/plans/personal-monorepo-rebuild/11-*.md` trong khi `.agents/plans/` mới chỉ có `.gitkeep` (thư mục plan do **ticket 12** copy sang) — trớ trêu là ngay trong câu dặn "đừng link một `SKILL.md` chưa tồn tại"; đã đổi thành gọi tên ticket, không kèm path. (c) Hai comment trong `_template_next` còn dùng từ vựng "loader-vs-query" cho một cơ chế không Runtime nào của repo này có (`template-list.tsx`, `e2e/server-rendering.e2e.ts`) — đã đổi sang "server-cache-vs-Query", khớp tiêu đề rule.

6. **Bác một finding của review: `biome.json` *có* domain `next`.** Review báo thiếu vì chỉ đọc `linter.domains` ở top level; domain thật nằm trong `overrides`, scope vào `apps/_template_next/**`. Đã chứng minh bằng probe: một `<img>` trong `apps/_template_next/src/*.tsx` bật `lint/performance/noImgElement`, cùng file đó dưới `apps/_template_vite/src/` thì không. Và scope hẹp là **cách duy nhất** dùng được ở đây: thử đưa `next: "recommended"` lên `linter.domains` thì `bun run check` sinh 3 warning `noImgElement` mới ở `apps/_template_vite/src/components/select/select-language.tsx:42`, `apps/storybook/src/stories/aspect-ratio.stories.tsx:20`, `apps/storybook/src/stories/card.stories.tsx:84` — hai workspace đó không có `next/image`, và ticket 12 đòi 0 warning. Thí nghiệm đã revert; `biome.json` không bị đụng.

## Còn treo

- **`README.md` root của Target vẫn là bản trước Skeleton** — mô tả `apps/{_template,assistant-ai,documents,mcp,portfolio}`, `toolings/{eslint,prettier}`, `packages/{ui-public,hook-public}`, và link tới `docs/apps/*.md` nay đã nằm dưới `legacy/docs/`. Mọi link chết, mọi câu sai với cây hiện tại. Là deliverable của **ticket 11**, nhưng cho tới lúc đó file được đọc nhiều nhất của repo đang mâu thuẫn với `CLAUDE.md` — nên đưa nó lên đầu ticket 11 thay vì cuối.

- **`CONTEXT-MAP.md` root nói "các Template app được dựng ở ticket 07/08"** — viết trước khi 07/08 chạy; hai app đã có. Thuộc lượt docs của **ticket 11**.

- **§7 liệt skill theo decision 39 (`writing-for-agents`, không có `ask-matt`/`teach`/`improve-codebase-architecture`)**, và mở đầu bằng ghi chú "**Not installed yet** — ticket 11". Danh sách thật chỉ chốt khi **ticket 11** chạy `npx skills add`; đối chiếu lại §7 với `skills-lock.json` sinh ra lúc đó.

- **`.agents/README.md` cũng nằm trong checklist của ticket 11** (cạnh `commands.md` và `knowledge-base.md`), trong khi ticket 10 giao index rule cho lượt này. File hiện tại **là** index rule và có ghi chú trỏ ticket 11 cho hai file kia — ticket 11 phải *mở rộng* nó, đừng ghi đè, kẻo mất index.

- **§7a nhắc lại khẳng định của `decisions.md` rằng launch Chromium từ script `bun run` treo trên Windows** và cách vòng là `bunx playwright test` với cwd là thư mục app. Lượt này chạy e2e đúng theo cách đó và **xanh** (7 spec Vite, 6 spec Next), nhưng không thử lại chiều `bun run` để xác nhận nó vẫn treo. Nếu lượt kiểm tay của **ticket 12** thấy `bun run --filter … e2e` chạy bình thường trên máy hiện tại thì xoá câu đó.
