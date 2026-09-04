---
status: done
---

# 02 — Package framework-free: `@monorepo/dayjs`, `hook`, `types`, `api`

**What to build:** Một app bất kỳ (chưa tồn tại — dùng test của package để chứng minh) import được `@monorepo/dayjs` và nhận singleton đã extend plugin, format theo bảng format, đổi locale qua `setDayjsLocale` với fallback; import hook generic từ `@monorepo/hook/<name>`; import `HttpClient`/`HttpError` từ `@monorepo/api/client` và service placeholder `template-service` với params/entity từ `@monorepo/types`. Cả bốn package source-only, `private`, `exports` subpath vào `src`, không barrel, không build step; `api` và `dayjs` có Vitest 5 runner node env chạy trong Gate.

**Blocked by:** 01 — Nền root.

**Status:** done (2026-09-03)

- [x] `@monorepo/dayjs`: `dayjs.ts` (utc → timezone, customParseFormat, relativeTime, side-effect locale `vi`/`en`, không `tz.setDefault`), `formats.ts` 7 hằng, `locales.ts` registry bằng value, `set-locale.ts`; `exports` có root entry duy nhất trong workspace + subpath; tsconfig không `dom`
- [x] `@monorepo/hook`: debounce, media-query, is-mobile, copy-to-clipboard copy từ reference; không `index.ts`
- [x] `@monorepo/types`: entity + params placeholder `Template`/`TemplateListParams` như reference
- [x] `@monorepo/api`: `client.ts` (axios, `createHttpClient` với `getAuthToken`/`onUnauthorized`, `HttpError` với `statusCode`/`isUnauthorized`…), `template/template-service.ts` placeholder; không import React/TanStack
- [x] Vitest 5.0.x node env cho `api` (HttpClient + HttpError + service unwrap raw body) và `dayjs` (format table, thứ tự plugin, `setDayjsLocale` fallback, `TZ=UTC` pin trong config); test copy/port từ reference và xanh
- [x] Breaking của Vitest 5 khi port test (clearMocks mặc định, `vi.mock` top-level) được xử lý và ghi vào ticket
- [x] Gate xanh local và trên CI

---

## Kết quả (2026-09-03)

Bốn package ở `D:\Personal\monorepo\packages\{dayjs,hook,types,api}`. Gate xanh: 7/7 typecheck,
`api` 18+4 test, `dayjs` 13 test, Biome 0 warning.

**Quyết định thiết kế đáng ghi:**

- **Seam test của `api` là `adapter` của chính axios, không phải `vi.mock("axios")`.** `HttpClient` forward
  `AxiosRequestConfig` xuống, mà `adapter` là field hợp lệ của config đó — nên test truyền stub adapter theo
  từng request. Mock cả module axios sẽ vô hiệu hoá đúng thứ cần kiểm chứng: hai interceptor (gắn
  `Authorization`, chuẩn hoá `HttpError`). Stub adapter phải tự settle status (reject bằng `AxiosError` có
  `response`), vì trong axios chính adapter mới quyết định thành/bại.
- `client.test.ts` và `template-service.test.ts` là **viết mới theo hình dạng reference**, không phải port —
  reference không có test cho `client.ts`; test của nó (`test/ksk/*`, `test/portal/*`) toàn bộ là business
  MedViet, port thẳng sẽ kéo domain sang.
- `@monorepo/dayjs` là package **duy nhất trong workspace** có root entry `"."` trong `exports`.

## Breaking của Vitest 5 (checkbox 6) — đã xử lý

| # | Breaking | Xử lý ở đây |
|---|---|---|
| 1 | `clearMocks` lật mặc định `false` → **`true`** | Nêu tường minh `clearMocks: true` trong cả hai config. Sau v5 một config trống mang nghĩa **ngược** với v4, người đọc không phân biệt được "chọn" hay "thừa kế". Mọi mock được tạo và prime **trong thân test**, không `beforeAll` nào prime mock. |
| 2 | `vi.mock` / `vi.hoisted` ngoài top-level giờ **throw** (v4 chỉ warn) | Không dùng `vi.mock` ở đâu cả — seam là adapter + constructor injection. |
| 3 | Assertion async không `await` giờ làm **fail** test | Mọi `.resolves` / `.rejects` đều `await`. Chỗ cần soi field của error dùng helper `rejection()` bắt bằng try/catch, vì `message` của `Error` là non-enumerable nên `toMatchObject` là bẫy. |
| 4 | Vitest 5 **không còn tìm config ở thư mục cha** | Mỗi package chạy test có `vitest.config.ts` riêng. |
| 5 | `test.env.TZ` không ăn dưới pool `threads`/`vmThreads` | Pin TZ ở **cả hai** chỗ: `process.env.TZ` module scope **và** `env: { TZ: "UTC" }`. Vẫn không có prefix CLI nào (xem `testing-timezone`). |
| 6 | Report mặc định vào `.vitest/` | `.gitignore` của Target đã có sẵn dòng đó. |
| 7 | `test.sequential` bị gỡ; `toThrow("")` đổi ngữ nghĩa; `-t` đổi separator; `coverage.include/exclude` đổi cách match | Không cái nào chạm code ở đây. |

## Còn nợ (không chặn)

- `packages/hook` ship 5 hook chưa có test nào (giống reference). Muốn test cần thêm jsdom +
  `@testing-library/react` + script `test`.
- Không package nào có script `test:coverage`; task `test:coverage` của Turbo vì thế không có việc.
  Không nằm trong Gate nên không chặn.
