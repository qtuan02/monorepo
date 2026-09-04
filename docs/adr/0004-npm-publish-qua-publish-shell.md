---
status: accepted
date: 2026-09-04
---

# Publish `ui` và `hook` lên npm trở lại, qua Publish shell và Changesets + `npm publish`

Decision 3 của spec Skeleton bỏ publish npm: mọi package `private`, source-only, không build step. Chủ repo cần `@fe-monorepo/ui` và `@fe-monorepo/hook` tồn tại trên npm cho người khác dùng thật (semver, changelog, provenance). Quyết định: hai package nguồn `packages/ui`, `packages/hook` **vẫn** `private` và source-only đối với mọi app trong repo, nhưng có thêm một task `build` (rslib, per-file ESM + `.d.ts`) đổ vào hai **Publish shell** `packages/ui-public`, `packages/hook-public` — mỗi shell là một `package.json` viết tay với deps literal, không `catalog:`, không `workspace:`. Changesets version và publish **chỉ** hai shell, qua `changesets/action` với trusted publishing OIDC của npm. `@fe-monorepo/ui` inline hook nó dùng vào `dist/` thay vì depend `@fe-monorepo/hook`; bề mặt import là subpath-only như trong repo; CSS (theme + hai `@custom-variant` load-bearing) ship như một entry của shell.

## Considered Options

- **Publish thẳng từ `packages/ui`/`hook`** (bỏ `private`, đổi `exports` sang `dist/`): một nguồn sự thật, nhưng `package.json` chứa `catalog:`/`workspace:` mà `npm publish` không hiểu, còn `bun publish` — thứ strip được chúng — chưa có provenance/OIDC ([oven-sh/bun#15601](https://github.com/oven-sh/bun/issues/15601), [#22423](https://github.com/oven-sh/bun/issues/22423)). Với mục tiêu "người khác dùng thật", provenance thắng.
- **Changesets version + `bun publish`**: chạy được, mất provenance vì lý do trên.
- **tsdown thay rslib**: spike cùng ngày cho thấy cả hai emit đúng với TypeScript 7 (rslib cần `rootDir` tường minh vì TS5011). Chọn rslib vì là tool bản cũ đã dùng; không phải quyết định khó đảo — đổi tool chỉ đụng config build.
- **`ui-public` depend `@fe-monorepo/hook`**: đúng "một nguồn" hơn, nhưng phải rewrite specifier lúc build và giữ version khớp tay giữa hai shell; `ui` chỉ dùng một hook nên inline rẻ hơn.

## Consequences

- Decision 3 vẫn đúng cho `env`, `i18n`, `dayjs`, `api`, `types`, `sentry`, `tailwind-config`, `tsconfig`; chỉ `ui` và `hook` có `build`, và app trong repo vẫn import source qua `exports` trỏ `src/`. CLAUDE.md §1 ("ALL private, no build step"), `README.md`, `.agents/commands.md`, `legacy/README.md` phải sửa cho khớp.
- Tên npm (`@fe-monorepo/*`) khác tên workspace (`@monorepo/*`, decision 4); consumer ngoài và code trong repo import hai tên khác nhau, có chủ đích.
- Shell là thứ duy nhất Changesets nhìn thấy: `privatePackages.version` tắt để `@monorepo/*` không bao giờ bị bump; một PR sửa `packages/ui` hoặc `hook` cần một changeset cho shell tương ứng, được nhắc bằng một job CI không chặn.
- Hai bước không tự động hoá được: cấu hình trusted publisher trên npmjs.com cho từng package, và bật "Allow GitHub Actions to create and approve pull requests" trên repo.
- Consumer Tailwind v4 phải khai `@source` trỏ vào `dist/` của package vì Tailwind bỏ qua `node_modules`; README của shell nói điều đó.
