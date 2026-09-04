---
status: done
---

# 04 — `@monorepo/i18n` hai Flavor trên một bộ locale ICU

**What to build:** Một chuỗi có interpolation và plural viết một lần trong `locales/vi.json`/`en.json` theo ICU MessageFormat render ra cùng kết quả ở Flavor `i18next` (Vite: `createI18n({ cookieName })` với detector cookie/navigator + `i18next-icu`) và Flavor `next-intl` (Next: request config + provider + middleware/proxy factory). Registry `languages.ts` (`vi`, `en`, `defaultLanguage`) là nơi duy nhất thêm ngôn ngữ; thêm code mà thiếu JSON thì typecheck đỏ (ADR-0002).

**Blocked by:** 01 — Nền root.

**Status:** done (2026-09-03)

- [x] `languages.ts`, `locales/<code>.json` (nội dung copy từ reference, chuyển `{{x}}` → `{x}` ICU), `change-language.ts` nằm ngoài mọi Flavor
- [x] Flavor `i18next`: `create-i18n.ts` như reference (`load: languageOnly`, `escapeValue: false`, detection cookie → navigator, cookie 1 năm) cộng `.use(ICU)` từ `i18next-icu`; i18next 26.x, react-i18next 17.x
- [x] Flavor `next-intl` 4.14.x: `getRequestConfig` đọc messages theo locale từ cùng JSON, helper tạo middleware/proxy với `locales` từ registry, provider cho client component
- [x] `exports` subpath `@monorepo/i18n/i18next/*`, `@monorepo/i18n/next-intl/*`, phần chung `@monorepo/i18n/languages` v.v.; JSON import tĩnh, không lazy
- [x] Vitest 5: cùng một key có `{count, plural, ...}` và `{name}` render giống nhau qua Flavor i18next (jsdom) và qua `next-intl` core (`createTranslator`) — đây là test chứng minh ADR-0002
- [x] Typecheck đỏ khi thêm code vào registry mà thiếu file JSON (giữ typed `messages` map như reference)
- [x] Gate xanh local và trên CI

---

## Kết quả (2026-09-03)

`D:\Personal\monorepo\packages\i18n`. 5 file / 43 test xanh, typecheck + Biome sạch.

- **Test chứng minh ADR-0002** (`test/locales/icu-parity.test.tsx`): cùng key `header.notificationSummary`
  (`{count, plural, ...}` + `{name}`) render **thật** qua `I18nextProvider` + `useTranslation` trong jsdom,
  và qua `createTranslator` của next-intl (không cần Next runtime); so từng cặp cho `vi`/`en` × count 0/1/5,
  **cộng assertion chuỗi tuyệt đối** để trường hợp "hai Flavor cùng sai" không lọt, cộng chốt
  `not.toBe(KEY)` chặn trường hợp key không phân giải.
- **Typecheck đỏ khi thiếu JSON** — đã kiểm chứng lại bằng tay: thêm `"ja"` vào registry → 2 lỗi
  (`languages.ts:30` ở `messages`, `create-i18n.ts:15` ở `resources`). Bonus: `LocaleMessages` neo vào
  `typeof vi` nên `en.json` thiếu key cũng đỏ.
- `messages` + `LocaleMessages` + `isLanguageCode` được **nâng lên `languages.ts`** (reference để `messages`
  trong `create-i18n.ts`) vì cả hai Flavor đều cần.
- **JSON không có entry `exports` riêng** — chỉ vào được qua `languages.ts`, nhập tĩnh. `"@monorepo/i18n"`
  (root) và `"/locales/vi.json"` cố ý **không** resolve.
- `next-intl` 4.14.2 **không có** entry `./proxy` (chỉ `./server ./config ./middleware ./navigation
  ./routing ./plugin ./extractor*`), nên `create-proxy.ts` dùng `createMiddleware` từ `next-intl/middleware`
  — đúng đường cho `proxy.ts` của Next 16.
- Root `package.json` thêm **một** entry catalog: `intl-messageformat ^11.2.14`. Bắt buộc —
  `i18next-icu` 2.4.4 khai nó là `peerDependency` (`>=10.3.3 <12.0.0`), không bundle, không có
  `peerDependenciesMeta`.

## Còn nợ (không chặn)

- `create-proxy.ts` và `provider.tsx` **không có test**: `create-proxy` không import được ngoài build Next
  (`next/server` + điều kiện `react-server`); bật `server.deps.inline` sẽ có rủi ro làm hỏng test jsdom của
  Flavor i18next. `provider.tsx` là wrapper siết kiểu, không có nhánh.
- `createRequestConfig` không gọi được trong test (ngoài `react-server`, next-intl trả về hàm ném lỗi);
  logic phân giải locale chỉ cover gián tiếp qua `isLanguageCode`.
- **Locale JSON vẫn còn từ vựng nghiệp vụ y tế** ("bệnh nhân", "khoa khám bệnh", "dược", "Nền tảng quản lý
  y tế") vì ticket nói rõ "nội dung copy từ reference". `common.brand` đã đổi thành `Monorepo` và ba
  namespace theo app đã bỏ. Muốn catalogue trung tính → **việc của ticket 07/08**.
- **Điều kiện để Flavor next-intl chạy thật ở ticket 08:** app Next phải khai
  `transpilePackages: ["@monorepo/i18n"]` (package source-only `.ts`/`.tsx`), **và** phải viết matcher
  thành literal trong `proxy.ts`, không `import I18N_PROXY_MATCHER`.
- Cấm ICU rich-text tag hiện chỉ được canh bằng test trong package này → nên thành rule/ADR ở **ticket 11**.
