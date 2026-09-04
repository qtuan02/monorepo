---
status: done
---

# 03 — `@monorepo/env` hai Flavor: `vite` và `next`

**What to build:** Một app Vite gọi Flavor `vite` (`createEnv(schema, import.meta.env)` + `baseEnvSchema` prefix `PUBLIC_`) và một app Next gọi Flavor `next` (`@t3-oss/env-nextjs` với `server`/`client`/`shared`, prefix `NEXT_PUBLIC_`) đều nhận object env đã typed, và cả hai **throw ngay khi thiếu hoặc sai biến** với message đọc được. Một `.env` root là nguồn duy nhất; `.env.example` liệt kê đủ hai nhóm (ADR-0003).

**Blocked by:** 01 — Nền root.

**Status:** done (2026-09-03)

- [x] Flavor `vite`: `createEnv` nhận `(schema, runtimeEnv)`, `safeParse`, throw kèm `z.prettifyError`; `baseEnvSchema` gồm `PUBLIC_APP_ENV`, `PUBLIC_BASE_DOMAIN`, `PUBLIC_BASE_DOMAIN_API` với `z.url({ protocol: /^https?$/ })`; import zod dạng namespace `import * as z`
- [x] Flavor `next`: `createEnv` wrapper t3-env 0.13.x với base `client` (`NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_BASE_DOMAIN`, `NEXT_PUBLIC_BASE_DOMAIN_API`) và cách app `.extend` thêm key `server`/`client`; dùng `experimental__runtimeEnv`
- [x] `exports` subpath tách rõ hai Flavor (ví dụ `@monorepo/env/vite/*`, `@monorepo/env/next/*`); phần chung (nếu có) nằm ngoài Flavor
- [x] `.env.example` root cập nhật đủ biến hai nhóm với giá trị dev; README của package nêu vì sao hai tiền tố (trỏ ADR-0003)
- [x] Vitest 5 node env: mỗi Flavor có test parse thành công, throw khi thiếu, throw khi URL sai scheme; Flavor `next` test được mà không cần Next runtime
- [x] Gate xanh local và trên CI

---

## Kết quả (2026-09-03)

`D:\Personal\monorepo\packages\env`. 17 test xanh (node env), typecheck + Biome sạch.

- `exports`: `./vite/*`, `./next/*`, `./*`. Phần chung là `@monorepo/env/http-url` (`httpUrlSchema` =
  `z.url({ protocol: /^https?$/ })`), nằm ngoài cả hai Flavor. Không có root entry `"."`.
- Ngoài checkbox, dòng "What to build" còn nêu `shared` — đã bổ sung cho Flavor `next` kèm 2 test.
- `.env.example` root thêm một khối comment: biến **server-only không mang tiền tố** (Next đọc thẳng
  `process.env`, t3-env khai dưới `server`); hiện chưa có biến nào.

## Còn nợ (không chặn)

- **Cast `parseNextEnv = createT3Env as unknown as T3CreateEnv`** che mất việc kiểm tên option của t3-env
  (`experimental__runtimeEnv`, `emptyStringAsUndefined`, `shared`, `isServer`, `onValidationError`). Nếu bản
  sau đổi tên option thì typecheck vẫn xanh mà runtime hỏng. Giảm thiểu: catalog pin **exact** `0.13.11`, và
  17 test runtime phủ cả nhánh server lẫn client. Đã đọc `dist/` của `@t3-oss/env-nextjs` + `env-core`
  0.13.11 để xác nhận đúng 6 tên option.
- **Chưa verify bằng `next build` thật** rằng Next inline literal `process.env.NEXT_PUBLIC_*` viết trong
  `env.ts` của app. Không verify được ở đây vì chưa có app Next — **kiểm ở ticket 08**, bằng cách in giá trị
  trong một client component của bundle production.
- `@t3-oss/env-core` còn trong catalog nhưng không package nào dùng (Flavor next chỉ dùng `env-nextjs`).
- `@t3-oss/env-nextjs` nằm ở `dependencies`, nên app Vite kéo theo ~3 package ESM không dùng đến. Giữ
  nguyên (chuyển sang optional peerDependency sẽ bắt mọi app Next tự khai) — ghi nhận để quyết sau.
