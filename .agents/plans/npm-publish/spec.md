---
status: ready-for-agent
date: 2026-09-04
adr: ../../../docs/adr/0004-npm-publish-qua-publish-shell.md, ../../../docs/adr/0001-legacy-apps-outside-workspace.md
research: ../../../docs/research/legacy-unfreeze-and-npm-publish.md
glossary: ../../../CONTEXT.md
tracker: markdown trong thư mục này (không glab, không gh)
related: ../legacy-migrate/spec.md
---

# Spec: Publish `@fe-monorepo/ui` và `@fe-monorepo/hook` lên npm qua Publish shell

## Problem Statement

`@fe-monorepo/ui@1.0.2` và `@fe-monorepo/hook@1.0.0` đang nằm trên npm mô tả một bộ UI đã chết: 42 component Radix và 14 hook của repo trước khi dựng Skeleton. Bản thật hôm nay — 63 primitive `base-vega` trên Base UI trong `@monorepo/ui`, 5 hook trong `@monorepo/hook` — không ai ngoài repo cài được, vì decision 3 của spec Skeleton bỏ publish: mọi package `private`, source-only, không build. Toàn bộ dây chuyền cũ (rslib config, `.changeset/`, hai vỏ `-public`, workflow) đã bị gỡ hoặc đóng băng trong `legacy/`; hai vỏ trong git chỉ còn `package.json` + README, `dist/` không được track. Chủ repo muốn người khác dùng thật hai package này, tức cần semver, changelog, và provenance.

## Solution

Dựng lại đường publish theo [ADR-0004](../../../docs/adr/0004-npm-publish-qua-publish-shell.md): hai **Publish shell** `ui-public` và `hook-public` trong `packages/` (không phải kéo từ `legacy/` về — viết mới theo bề mặt hiện tại), mỗi shell là một `package.json` viết tay với deps literal; hai package nguồn `@monorepo/ui`, `@monorepo/hook` có thêm task `build` bằng **rslib** (bundleless, ESM + `.d.ts` per-file) đổ `dist/` sang shell tương ứng và vẫn `private`, source-only với mọi app trong repo. **Changesets** version và publish chỉ hai shell, qua `changesets/action` mở PR "Version Packages" và `npm publish` với trusted publishing OIDC + provenance khi PR đó merge. Bề mặt import subpath-only như trong repo; `@fe-monorepo/ui` inline hook nó dùng và ship một CSS entry chứa theme + hai `@custom-variant`. Bằng chứng "publish đúng" là một **consumer smoke test**: pack shell, cài tarball vào một project Vite tạm, import một component + một hook + CSS, typecheck và build xanh. `@fe-monorepo/hook` lên `2.0.0`; `@fe-monorepo/ui` lên `3.0.0` — số `2.0.0` của `ui` đã bị đốt trên npm (publish rồi unpublish 25/11/2025), xem ticket 05.

## User Stories

1. As a consumer ngoài repo, I want `bun add @fe-monorepo/ui @fe-monorepo/hook` cài được từ npm với version `2.x`, so that tôi dùng được bộ Base UI hiện tại mà không clone monorepo.
2. As a consumer, I want import theo subpath (`@fe-monorepo/ui/components/button`, `@fe-monorepo/hook/use-debounce`) đúng như tài liệu, so that bundle của tôi chỉ chứa primitive tôi dùng.
3. As a consumer, I want mỗi subpath có `.d.ts` đi kèm và không có `any` rò rỉ, so that TypeScript strict của tôi biết props của từng primitive.
4. As a consumer, I want một CSS entry `@fe-monorepo/ui/globals.css` gồm theme token và hai `@custom-variant data-horizontal`/`data-vertical`, so that slider, tabs, scroll-area render đúng mà tôi không phải chép theme bằng tay.
5. As a consumer dùng Tailwind v4, I want README chỉ rõ phải thêm `@source` trỏ vào `dist/` của package, so that class trong component được Tailwind quét dù nằm trong `node_modules`.
6. As a consumer, I want `peerDependencies` của hai package là range literal (`react >=19`, `react-dom >=19`, và với `ui` là `tailwindcss ^4`), so that package manager của tôi cảnh báo đúng thay vì gặp chuỗi `catalog:`.
7. As a consumer, I want `@fe-monorepo/ui` không depend `@fe-monorepo/hook` (hook nó dùng được inline), so that tôi cài một package khi chỉ cần UI và không lo lệch version giữa hai package.
8. As a consumer, I want `package.json` publish có `repository`, `license`, `sideEffects` đúng (`false`, trừ CSS), so that provenance link về đúng repo và bundler tree-shake được.
9. As a consumer, I want mỗi version trên npm có provenance attestation, so that tôi xác minh được tarball sinh từ workflow của repo này.
10. As a consumer, I want CHANGELOG.md trong mỗi package kể đúng những gì đổi giữa hai version, so that tôi biết có breaking change hay không trước khi bump.
11. As a developer trong repo, I want app và Storybook vẫn import `@monorepo/ui/components/*` từ source như trước, so that decision 3 không đổi với người viết app và không có `dist/` nào phải đồng bộ trong vòng dev.
12. As a developer, I want `bun run build` ở root chạy được task `build` của `@monorepo/ui` và `@monorepo/hook` qua Turbo với cache theo `dist/**`, so that Gate `build` chứng minh package build được trên mọi commit.
13. As a developer, I want build của `ui` và `hook` dùng rslib với `bundle: false`, `dts` qua TypeScript 7 (tsgo), `rootDir` tường minh, so that output là một-file-nguồn-một-file-đích và `.d.ts` sinh ra từ đúng compiler repo đang dùng.
14. As a developer, I want build xoá và ghi lại `dist/` của shell mỗi lần, so that file cũ không sót lại trong tarball khi một primitive bị xoá.
15. As a developer, I want `dist/` của `ui` không chứa specifier `#components/*`, `#utils/cn`, `#hooks/*` hay `@monorepo/*` nào, so that consumer resolve được mà shell không cần `imports` field.
16. As a developer, I want `typescript` pin `~7.0.x` trong catalog và ghi lý do, so that plugin dts của rslib không rơi ra ngoài peer range khi bump.
17. As a developer, I want `.changeset/` ở root với `config.json` theo schema `@changesets/config` 4.x, `access: public`, `baseBranch: main`, `privatePackages.version: false`, so that Changesets chỉ bao giờ bump hai shell và không đụng `@monorepo/*`.
18. As a developer, I want thêm một changeset bằng `bun changeset` (hoặc viết tay file `.changeset/*.md`) khi sửa `@monorepo/ui` hoặc `@monorepo/hook`, so that release note viết lúc còn nhớ vì sao đổi.
19. As a developer, I want một job CI không chặn chạy `changeset status` khi diff chạm `packages/ui`, `packages/hook` hoặc hai shell, so that tôi được nhắc thiếu changeset trước khi merge mà không bị chặn khi đổi chỉ là refactor nội bộ.
20. As a developer, I want workflow `release` chạy trên push `main`, dùng `changesets/action` để mở/cập nhật PR "Version Packages", và publish khi PR đó merge, so that không ai chạy `npm publish` từ máy cá nhân.
21. As a developer, I want workflow `release` có `permissions: id-token: write, contents: write, pull-requests: write` và dùng npm trusted publishing, so that không có `NPM_TOKEN` nào trong secret và provenance tự bật.
22. As a developer, I want workflow `release` chạy Gate (`check`, `typecheck`, `test`, `build`) trước bước publish, so that không có version nào lên npm từ một commit Gate đỏ.
23. As a developer, I want bước publish gọi `changeset publish` với npm CLI trên runner đủ mới cho trusted publishing (≥ 11.5.1) và ticket ghi cách kiểm version đó, so that lần chạy thật không đỏ vì một điều kiện không ai đo.
24. As a developer, I want git tag `@fe-monorepo/ui@3.0.0` / `@fe-monorepo/hook@2.0.0` được push khi publish, so that mỗi version trên npm trỏ về một commit.
25. As a developer, I want một consumer smoke test: script pack shell bằng `npm pack`, dựng project Vite + React 19 + Tailwind v4 tạm trong thư mục tạm, cài tarball, import `Button`, `useDebounce`, CSS entry, rồi `tsc --noEmit` và `vite build`, so that tarball được chứng minh dùng được đúng cách consumer sẽ dùng.
26. As a developer, I want smoke test đó chạy trong CI như một job riêng khi diff chạm `packages/{ui,hook,ui-public,hook-public}`, non-blocking trong đợt đầu với điều kiện chuyển sang chặn ghi trong workflow, so that lỗi packaging lộ ra trên PR chứ không trên npm.
27. As a developer, I want smoke test assert thêm rằng `package.json` trong tarball không chứa `catalog:`, `workspace:`, và `dist/` không chứa `#`-specifier hay `@monorepo/`, so that lớp lỗi từng gặp ở quy trình cũ (chọn nhầm package, specifier nội bộ lọt ra) bị bắt bằng máy.
28. As a developer, I want hai shell có Vitest tối thiểu (hoặc test nằm trong smoke test) và task `typecheck` không có gì để làm được khai rõ, so that `bun run test`/`typecheck` ở root không đỏ vì shell thiếu script.
29. As a developer, I want `bun run --filter @monorepo/ui ui-add` vẫn chạy như cũ và `guard:no-local-hooks` vẫn chặn `src/hooks/`, so that dây chuyền shadcn không bị build step làm hỏng.
30. As a developer, I want rslib bỏ qua `src/hooks/` (landing pad không tồn tại) và không đưa `#hooks/*` vào output, so that build không đỏ vì một alias chỉ tồn tại để CLI shadcn chạy.
31. As a developer, I want CSS entry của shell được sinh từ `@monorepo/tailwind-config` (theme + globals) lúc build chứ không chép tay, so that đổi token một chỗ là bản publish đổi theo.
32. As a developer, I want README của mỗi shell viết cho consumer ngoài: cài, import subpath, CSS + `@source`, peer, bảng primitive/hook, link Storybook, so that npm page tự đủ.
33. As a developer, I want CLAUDE.md §1 (`packages/` "ALL private, no build step"), §3, §6, `README.md`, `.agents/commands.md`, `legacy/README.md` (hai dòng `-public`, dòng `.changeset/`) và `.agents/knowledge-base.md` được sửa cho khớp ADR-0004, so that agent đọc tài liệu không "sửa" build step vì tưởng là drift.
34. As a developer, I want rule `quality-avoid-barrel-imports` và `architecture-ui-primitives` được bổ sung một đoạn nói rõ Publish shell và việc bề mặt publish vẫn subpath-only, so that review không hiểu nhầm `dist/` là barrel.
35. As a developer, I want `CONTEXT.md` giữ đúng định nghĩa **Publish shell** và `packages/ui`/`packages/hook` mỗi cái có `CONTEXT.md` riêng nếu ticket sinh ra thuật ngữ của riêng nó, so that vốn từ của repo không lệch với cây.
36. As a developer, I want spec `personal-monorepo-rebuild` không bị sửa ngoài ghi chú trỏ ADR-0004 ở decision 3, so that lịch sử quyết định còn đọc được.
37. As a developer, I want hai việc con người phải làm — cấu hình trusted publisher trên npmjs.com cho từng package (repo, workflow file name, environment), và bật "Allow GitHub Actions to create and approve pull requests" trên repo — nằm trong một ticket `ready-for-human` với checklist, so that lần chạy `release` đầu tiên không đỏ vì thiếu thao tác dashboard.
38. As a developer, I want lần publish đầu tiên (`ui@3.0.0`, `hook@2.0.0`) đi qua đúng quy trình changeset (một changeset `major` cho mỗi shell với note "Base UI, 63 primitive / 5 hook, API mới hoàn toàn"), so that quy trình được chứng minh ngay lần đầu chứ không phải một `npm publish` tay rồi mới bật workflow.
39. As a developer, I want Gate 4 job xanh 0 warning sau mỗi ticket của topic này, so that publish không mua bằng giá Gate.
40. As a developer, I want app `documents` (topic `legacy-migrate`) có thể chờ topic này chốt bề mặt publish, so that site tài liệu mô tả đúng cái người ngoài cài.

## Implementation Decisions

**Hình dạng workspace.** Hai workspace mới `packages/ui-public` và `packages/hook-public` (tên npm `@fe-monorepo/ui`, `@fe-monorepo/hook`; tên workspace trùng tên npm để `changeset` và `--filter` gọi được), `version` khởi điểm khai đúng số đang có trên npm (`ui` `2.0.0`, `hook` `1.0.0`) để changeset `major` đưa lên `3.0.0`/`2.0.0` — xem ticket 05 về việc `ui@2.0.0` đã bị đốt, `publishConfig.access: public`, `files: ["dist", "README.md", "CHANGELOG.md"]`, `type: module`, `sideEffects: false` (với `ui`: `["./dist/globals.css"]`), `repository` trỏ repo GitHub với `directory`, `license: MIT`. `exports` trỏ `dist/` với condition `types` trước `import`; `ui` có `./components/*`, `./utils/*`, `./globals.css`; `hook` có `./*`. Không root entry, không `require`/CJS (package `type: module`, React 19, consumer hiện đại). Không có `dependencies` nào là `catalog:`/`workspace:`; `dependencies` của `ui` là các runtime dep thật (Base UI, cva, clsx, tailwind-merge, lucide, cmdk, embla, input-otp, react-day-picker, react-resizable-panels, recharts, `@tanstack/react-table`, date-fns) với range literal chép từ version đã resolve trong `bun.lock`; `peerDependencies`: `react`, `react-dom` `>=19`, và `tailwindcss ^4` cho `ui`. Shell không có `src/`, không `tsconfig` build; có `package.json`, `README.md`, `CHANGELOG.md` (Changesets tạo), và `dist/` gitignored.

**Build.** Task `build` sống trong package nguồn: `@monorepo/ui` và `@monorepo/hook` mỗi cái có `rslib.config.ts`, `format: esm`, `bundle: false`, `dts: true` (TS 7 → tsgo tự chọn), `syntax` theo target hiện đại, `output.distPath` trỏ sang `../<name>-public/dist`, `autoExternal` cho dependencies/peer, và với `ui` thêm `@monorepo/hook` vào danh sách bundle vào (inline) kèm rewrite để không còn specifier `@monorepo/hook` trong output. Một tsconfig build riêng (`tsconfig.build.json`) extends base, tắt `noEmit`, tắt `allowImportingTsExtensions`, đặt `rootDir` = `src`, `declaration: true`; tsconfig hiện tại cho typecheck không đổi. Script `build` xoá `dist/` của shell trước khi chạy. Với `ui`, một bước sau build ghép `theme.css` + `globals.css` của `@monorepo/tailwind-config` (giữ nguyên hai `@custom-variant`) thành `dist/globals.css`. `turbo.json` root đã có `build.outputs: ["dist/**"]`; hai package nguồn khai `outputs` trỏ sang `dist/` của shell để cache đúng. Vai trò của `tooling/typescript/compiled-package.json` (thực chất là preset `jsx: preserve` cho `ui`, `noEmit`) được ghi rõ trong CLAUDE.md, không đổi tên trong topic này.

**Inline hook.** `ui` dùng đúng một hook (`useIsMobile` trong sidebar). rslib bundle module đó vào output của `ui` (qua cấu hình external loại trừ `@monorepo/hook`); kết quả `dist/` của `ui` không import `@fe-monorepo/hook`. Nếu sau này `ui` dùng nhiều hook hơn, xem lại tại ADR-0004.

**Changesets.** `@changesets/cli` là devDependency root; `.changeset/config.json` mới (không kéo từ `legacy/`), schema 4.x, `changelog: @changesets/cli/changelog`, `commit: false`, `access: public`, `baseBranch: main`, `updateInternalDependencies: patch`, `privatePackages: { version: false, tag: false }`, `ignore: []`. Root script `changeset`, `version-packages` (= `changeset version`), `release` (= `bun run build --filter '...[shell]' && changeset publish`). Changeset đầu tiên: `major` cho cả hai shell.

**Workflow.** `.github/workflows/release.yml`: trigger `push` lên `main`, `concurrency` theo workflow, `permissions` gồm `contents: write`, `pull-requests: write`, `id-token: write`; các bước: checkout, setup Bun (cùng version với `ci.yml`), setup Node 24 (để có npm CLI mới cho trusted publishing — ticket phải in `npm --version` và fail sớm nếu < 11.5.1), `bun install --frozen-lockfile`, Gate 4 lệnh, rồi `changesets/action@v2` với `version: bun run version-packages`, `publish: bun run release`, `createGithubReleases: true`. Không `NPM_TOKEN`; provenance đến từ OIDC. `ci.yml`: thêm job `changeset-status` (non-blocking, `continue-on-error: true`, chạy `changeset status --since=origin/main` khi job `changes` báo diff chạm `packages/ui|hook|ui-public|hook-public`), và job `publish-smoke` (non-blocking đợt đầu) chạy consumer smoke test. Mở rộng danh sách path của job `changes` cho `.changeset/` và hai shell.

**Consumer smoke test.** Một script Bun trong `packages/ui-public/scripts/` (dùng chung cho hai shell): `npm pack --pack-destination <tmp>` từng shell; tạo project tạm với `package.json` khai React 19, `react-dom`, `tailwindcss ^4`, `@tailwindcss/vite`, `vite`, `typescript ~7.0`, `@types/react`; cài hai tarball bằng `bun add <file>`; viết `src/main.tsx` import `Button` từ `@fe-monorepo/ui/components/button`, `useDebounce` từ `@fe-monorepo/hook/use-debounce`, CSS `@import "@fe-monorepo/ui/globals.css"` + `@source`; chạy `tsc --noEmit` và `vite build`; assert thêm bằng đọc `package.json` trong tarball (không `catalog:`/`workspace:`) và grep `dist/` (không `#components`, `#utils`, `#hooks`, `@monorepo/`). Exit code khác 0 khi bất kỳ bước nào đỏ. Root script `publish:smoke`.

**Tài liệu và rule.** CLAUDE.md §1 mô tả hai shell và câu "ALL private, source-only, no build step" sửa thành "private, source-only với app trong repo; `ui` và `hook` có thêm `build` đổ vào Publish shell (ADR-0004)"; §3 thêm dòng "Đổi bề mặt publish → sửa shell + changeset"; §6 thêm ba lệnh `changeset`, `publish:smoke`, `release` (chỉ CI). `.agents/commands.md`, `README.md`, `legacy/README.md`, `.agents/knowledge-base.md` sửa tương ứng. Rule `quality-avoid-barrel-imports` thêm một đoạn: shell export subpath vào `dist/`, không barrel; rule `architecture-ui-primitives` thêm ghi chú CSS entry và `@source` cho consumer ngoài.

**Không đụng.** `packages/ui/src`, `packages/hook/src` không đổi API vì publish. `exports` của hai package nguồn giữ nguyên trỏ `src/`. Không thêm `index.ts` ở đâu cả.

## Testing Decisions

Test tốt ở đây kiểm **hành vi nhìn từ ngoài**: tarball cài được, import resolve được, kiểu đúng, CSS có, build consumer xanh. Không test nội dung `rslib.config.ts`, không snapshot `dist/`.

- **Seam duy nhất:** consumer smoke test trên tarball (`npm pack` → project Vite tạm → `tsc --noEmit` + `vite build`), kèm ba assert tĩnh về tarball. Đây là seam cao nhất có thể — cao hơn cả `changeset publish --dry-run`, vì nó chứng minh điều consumer thật sẽ làm.
- **Không có** unit test cho build script; lỗi build lộ ở Gate `build`.
- **Vitest của `@monorepo/ui`** (utils) và các test Storybook `composeStories` giữ nguyên — chúng đã chứng minh source; publish không thêm test ở lớp đó.
- **Prior art:** `apps/storybook/test/stories.test.tsx` (render mọi story) là cách repo chứng minh primitive chạy; `apps/_template_next/e2e` fetch raw HTML là cách repo chứng minh "thứ ship đúng" thay vì "thứ trong source đúng" — smoke test theo cùng tinh thần đó cho tarball.
- **Verify từng ticket:** `bun run check && bun run typecheck && bun run test && bun run build`, rồi `bun run publish:smoke`; `changeset status` để thấy release plan; lần release đầu quan sát workflow `release` mở PR rồi publish, kiểm `npm view @fe-monorepo/ui@3.0.0 --json` có `dist.attestations`.

## Out of Scope

- Publish bất kỳ package nào khác (`dayjs`, `i18n`, `env`, `api`, `types`, `sentry`, `tailwind-config`); nếu cần, một ADR mới.
- Root entry / barrel cho bản publish; CJS output; React 18.
- Đổi `@monorepo/*` thành `@fe-monorepo/*` trong repo (decision 4 giữ).
- `ui-public` depend `hook-public` (inline thay thế).
- Migrate app `documents` (topic `legacy-migrate`), dù nó là nơi tài liệu hoá hai package này.
- Xoá `legacy/ui-public`, `legacy/hook-public`, `legacy/.changeset` (ticket dọn `legacy/` của topic `legacy-migrate`).
- Đổi tool build sang tsdown; đổi TypeScript.
- Biến job `changeset-status`/`publish-smoke` thành chặn merge (điều kiện chuyển được ghi trong workflow, quyết sau).

## Further Notes

- Spike ngày 2026-09-04 (scratchpad, không commit) đã chứng minh: TypeScript 7.0.2 trong repo emit JS + `.d.ts`; rslib 1.0.0 `bundle: false` + `dts` chạy xanh trên `hook` sau khi thêm `rootDir` (TS5011); tsdown cũng xanh trên cả `hook` và `ui` với tsconfig hiện có và tự rewrite `#components/*` → đường dẫn tương đối `.js`. Với rslib, ticket phải xác nhận `#`-specifier được rewrite tương đương (hoặc cấu hình `resolve.alias`) — đây là điểm chưa chạy thật với rslib trên `ui`.
- Điều **chưa xác minh**: npm CLI đi kèm Node 24 trên runner có ≥ 11.5.1 không (nếu không, thêm bước `npm install -g npm@latest`); trusted publishing yêu cầu tên workflow file khớp cấu hình trên npmjs.com — ghi rõ tên `release.yml` trong ticket `ready-for-human`.
- Tailwind v4 bỏ qua `node_modules` khi quét; README shell phải có ví dụ `@source "../node_modules/@fe-monorepo/ui/dist";`. Reference shadcn không publish package — đây là hướng đi riêng của repo, ADR-0004 ghi.
- Thứ tự gợi ý cho `/to-tickets`: (1) `hook` → shell + build + smoke test; (2) `ui` → shell + build + inline hook + CSS + smoke test mở rộng; (3) `.changeset/` + `release.yml` + hai job CI + docs/rule; (4) `ready-for-human`: npm trusted publisher + GitHub setting, rồi lần release đầu tiên (`ui@3.0.0`, `hook@2.0.0`) và ghi kết quả.
