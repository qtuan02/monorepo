---
status: done
---

# 01 — Nền root Bun + Turbo + Biome + TS 7, dời Legacy ra ngoài workspace, CI bốn job

**What to build:** Developer clone Target, chạy `bun install` rồi `bun run check && bun run typecheck && bun run test && bun run build` và thấy xanh với 0 lỗi 0 warning — trên một workspace chưa có app nào, chỉ có `tooling/typescript` và `tooling/tailwind`. Sáu app cũ, hai package `-public` và changesets nằm trong `legacy/` ngoài workspace, kèm README liệt kê từng Legacy app, Runtime của nó và Template đích. Push lên GitHub thì workflow chạy đúng bốn job Gate và xanh. Ba ADR nháp và `CONTEXT.md` từ thư mục plan này nằm ở đúng chỗ trong Target (`docs/adr/`, root).

**Blocked by:** None — can start immediately.

> Chạy từ session ở reference (`E:\MedViet\frontend\medviet`), ghi sang `D:\Personal\monorepo` bằng đường dẫn tuyệt đối, lệnh dùng `--cwd`/`git -C` — xem "Cách chạy ticket" trong `decisions.md`. Không sửa gì ở reference.

**Status:** done (chạy 2026-09-03, commit `1c9eaa1` trên nhánh `feat/upgrade`; ô CI chờ push — xem "Còn treo")

- [x] `bun install` sinh `bun.lock`; `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc` bị xoá; `workspaces.packages` = `apps/*`, `packages/*`, `tooling/*`; catalog root + catalogs đặt tên (`react19`, `tailwind4`, `tanstack-query5`, `react-router8`, `tanstack-table9`, `testing`, `next16`) với version `npm latest` ngày chạy — xem bảng version bên dưới. **Lệch ticket:** install chạy *sau* khi đã xoá file pnpm và dời Legacy, không migrate từ `pnpm-lock.yaml` — xem "Lệch so với ticket" #1
- [x] `packageManager` Bun 1.4.0, `engines` Node ≥24.14.0 / Bun ≥1.2.0, `.nvmrc` `24.20.0` (Node 24 LTS hiện tại), `bunfig.toml` `linker = "isolated"`
- [x] `turbo.json` copy từ reference (không task `lint`/`format`; cũng bỏ `push`/`studio` theo user story 7), `globalEnv` = `["PUBLIC_*", "NEXT_PUBLIC_*"]`, `globalDependencies` `[".env"]`
- [x] `biome.json` root copy từ reference, thêm domain `next: "recommended"`, `nursery.useSortedClasses: "off"` (khai tường minh, Biome 2.5.12 nhận key này); `toolings/eslint` và `toolings/prettier` không còn; `.vscode/settings.json` trỏ `biomejs.biome` với `fixAll.biome` + `organizeImports.biome`
- [x] `tooling/typescript` (base.json strict, giữ nguyên — đã trùng reference) và `tooling/tailwind` (theme + globals copy từ reference: `@custom-variant dark`, `data-horizontal`, `data-vertical`, `#root { isolation: isolate }`, `postcss-config.mjs`) tồn tại, scope `@monorepo`
- [x] TypeScript 7.0.2, `bun run typecheck` chạy `tsc --noEmit` qua Turbo và xanh
- [x] `legacy/` chứa `_template`, `portfolio`, `assistant-ai`, `mcp`, `documents`, `storybook`, `ui-public`, `hook-public`, `.changeset`; không nằm trong `workspaces.packages`; `legacy/README.md` liệt kê app → Runtime → Template đích
- [x] `.env.example` root có hai nhóm biến (`PUBLIC_*`, `NEXT_PUBLIC_*`) với giá trị dev; `.gitignore` copy từ reference, thêm `.gitnexus/`, `legacy/**/node_modules`
- [x] `docs/adr/0001..0003` và `CONTEXT.md` root của Target là bản chuyển từ `.agents/plans/personal-monorepo-rebuild/` (ADR đổi `status: accepted`, thêm `date: 2026-09-03`); `CONTEXT-MAP.md` root trỏ tới nó
- [~] `.github/workflows/ci.yml` trên `oven-sh/setup-bun` với bốn job `check`/`typecheck`/`test`/`build`, cache theo `bun.lock` — **file đã viết, chưa push nên chưa chứng minh xanh**
- [x] Gate xanh local với 0 lỗi 0 warning

---

## Version thực tế (`npm latest`, 2026-09-03)

Khớp Phần B của research; không có số nào lệch.

| | |
|---|---|
| Toolchain | Bun **1.4.0** (đã `bun upgrade` máy local từ 1.3.14 để lockfile và `packageManager` cùng một binary) · Node **24.20.0** (LTS) · Turbo **2.10.12** · `@turbo/gen` **2.10.12** · Biome **2.5.12** · TypeScript **7.0.2** · `@types/node` **^24.13.3** (cố tình *không* lấy latest 26.4.1 — quyết định 8 khoá Node 24) |
| catalog | `@base-ui/react` ^1.7.0 · `@hookform/resolvers` ^5.9.1 · `@rolldown/plugin-babel` ^0.2.3 · `@t3-oss/env-core` 0.13.11 · `@vitejs/plugin-react` 6.1.1 · axios ^1.20.0 · `babel-plugin-react-compiler` 1.0.0 · cva 0.7.1 · clsx ^2.1.1 · dayjs ^1.11.23 · i18next ^26.4.1 · `i18next-browser-languagedetector` ^8.2.1 · `i18next-icu` ^2.4.4 · lucide-react 1.40.0 · postcss ^8.5.28 · react-error-boundary ^6.1.4 · react-hook-form ^7.87.0 · react-i18next ^17.0.13 · tailwind-merge ^3.6.0 · tw-animate-css 1.4.0 · vite 8.2.2 · zod ^4.5.4 · zustand 5.0.15 |
| `react19` | react/react-dom **19.2.8** · `@types/react` **19.2.18** · `@types/react-dom` **19.2.7** (`overrides.@types/react` = 19.2.18, như reference) |
| `tailwind4` | tailwindcss / `@tailwindcss/postcss` / `@tailwindcss/vite` ^4.3.3 · tailwind-scrollbar 4.0.2 |
| `tanstack-query5` | `@tanstack/react-query`(+devtools) ^5.102.8 |
| `react-router8` | react-router · `@react-router/dev` · `/node` · `/serve` — **8.3.1** |
| `tanstack-table9` | `@tanstack/react-table` ^9.2.4 · `@tanstack/react-virtual` ^3.14.10 |
| `testing` | vitest + `@vitest/coverage-v8` **^5.0.0** · jsdom ^30.0.1 · RTL ^16.3.3 · jest-dom ^7.0.1 · user-event ^14.6.7 · `@playwright/test` **1.62.1** (pin không caret — phải khớp tag image CI) |
| `next16` | next + `@next/third-parties` **16.3.4** · next-intl ^4.14.2 · `@t3-oss/env-nextjs` 0.13.11 · `@sentry/nextjs` ^10.73.0 · dotenv-cli ^11.0.0 · jiti ^2.7.0 |

## Lệch so với ticket (và vì sao)

1. **Không migrate từ `pnpm-lock.yaml`.** Thứ tự chạy là: dời Legacy → xoá file pnpm → viết `package.json` mới → `bun install`. Migrate lockfile cũ chỉ có nghĩa khi dependency set được giữ; ở đây workspace mới chỉ còn `tooling/*` và mọi version đều nhảy major, nên bun sẽ resolve lại từ đầu bất kể có đọc `pnpm-lock.yaml` hay không — mà chạy trước khi dời Legacy thì lại install cả sáu app cũ. Kết quả cuối (bun.lock có, file pnpm không còn) giống hệt.
2. **`packages/{env,hook,ui,sentry}` bị xoá, không dời vào `legacy/`.** Ticket liệt kê đúng 9 mục cho `legacy/`, và ticket 02–05 dựng lại bốn package này *từ reference*, không port bản cũ. Bản cũ đọc lại ở commit `7edc303` — đã ghi vào `legacy/README.md`.
3. **`docs/{README.md,apps,others,packages}` dời vào `legacy/docs/`.** Chúng mô tả các app vừa vào `legacy/`; user story 41 định nghĩa `docs/` của Skeleton là `adr/` + `agents/` + `research/`. Giữ nguyên tại chỗ thì `docs/` vừa lạc đề vừa sai sự thật.
4. **`turbo/generators/` bị xoá.** Generator `init` hiện tại là bản "Acme" sinh `eslint.config.ts` và chạy `pnpm i` + `prettier` — cả ba đều không còn tồn tại, và nó là nguồn duy nhất còn lại của warning `noUnnecessaryConditions` (Gate đòi 0 warning). Ticket 09 port từ reference về đúng vị trí cũ; `@turbo/gen` vẫn nằm trong devDependencies chờ nó.
5. **Thêm `.gitattributes` (`* text=auto eol=lf`).** Máy này để `core.autocrlf=true`, còn `biome.json` ép `lineEnding: "lf"` → mọi file checkout ra CRLF là 1 lỗi format/file. Không có file này thì Gate không thể xanh trên Windows. Cũng là thứ ticket 11 cần cho hash của symlink `.claude`.
6. **Xoá `.vscode/launch.json`.** Nó launch `pnpm dev` trong `apps/nextjs` — một app chưa từng tồn tại trong repo này. Ticket 08 thêm lại một cấu hình debug thật cho `_template_next` nếu cần.
7. **Bổ sung so với ticket:** `.github/actions/setup-workspace/action.yml` (composite action: pin Node từ `.nvmrc`, pin Bun từ `packageManager`, cache `.bun-cache` theo `bun.lock`, `bun install --frozen-lockfile`, `cp .env.example .env`) — GitHub Actions không có YAML anchor, nên bốn job dùng chung một action thay vì chép năm bước bốn lần. Ba job `typecheck`/`test`/`build` thêm cache `.turbo/cache` theo job + ref.

## Còn treo

- **Ô CI chưa tick:** commit nằm ở nhánh `feat/upgrade` (`1c9eaa1`), `dev` giữ nguyên tại `7edc303`. Cần `git push -u origin feat/upgrade` để workflow chạy lần đầu. Trigger là `push` trên **mọi** nhánh + `workflow_dispatch`; cố tình không có `pull_request` — check gắn vào commit, nên required check của một PR khớp luôn run của push, thêm trigger thứ hai chỉ chạy đúp bốn job.
- **`README.md` root vẫn là bản pnpm/sáu app** — sai với repo hiện tại, nhưng nó là deliverable của ticket 11 (cần `dev:*` và `gen:app` đã tồn tại mới viết đủ). Đọc nó lúc này sẽ lạc đường.
- **`turbo run test`/`build` in `WARNING No tasks were executed`** vì chưa package nào có script tương ứng. Exit code 0, không phải warning của Gate; tự hết từ ticket 02.
- **`#root { isolation: isolate }` trong `tooling/tailwind/globals.css`** đúng cho Runtime Vite, nhưng App Router của Next không render vào `#root`. Ticket 08 phải quyết định selector tương đương cho Next (thêm vào globals hay đặt ở layout của app).
- **Đã `bun upgrade` máy local lên 1.4.0.** `bun install` lần tới ở reference `medviet` (pin `bun@1.3.14`) sẽ chạy bằng 1.4.0 và có thể làm churn `bun.lock` của repo đó — kiểm `git status bun.lock` ở medviet trước khi commit bất cứ gì bên đó.
