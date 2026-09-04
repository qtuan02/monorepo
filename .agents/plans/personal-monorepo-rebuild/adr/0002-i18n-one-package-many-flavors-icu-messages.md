---
status: proposed
---

# Một package i18n nhiều Flavor theo Runtime, locale JSON chuẩn ICU

Target có nhiều Runtime (Vite client, Next.js App Router, sau này React Router framework) và mỗi Runtime có thư viện i18n riêng phù hợp (react-i18next; next-intl). Thay vì một package cho mỗi thư viện hoặc một thư viện ép cho mọi Runtime, `@monorepo/i18n` giữ **một** registry ngôn ngữ (`languages.ts`) và **một** bộ `locales/<code>.json` viết theo **ICU MessageFormat**, còn phần wiring nằm dưới subpath theo Flavor (`i18next/*`, `next-intl/*`). Flavor i18next đọc ICU qua `i18next-icu`; next-intl đọc ICU sẵn.

## Considered Options

- JSON tách theo Flavor (`locales/i18next/`, `locales/next-intl/`): không thêm plugin nhưng mọi chuỗi trùng chép hai nơi và trôi nhau.
- Chỉ share `languages.ts`, JSON nằm trong từng app: đúng cách next-intl khuyến nghị nhưng khác reference, và mất chỗ duy nhất để thêm ngôn ngữ.
- i18next SSR thủ công cho Next (pattern locize): một thư viện cho cả repo nhưng phải tự viết `getT`/`useT`/middleware, không có plugin chính chủ cho Server Component.

## Consequences

Cú pháp interpolation trong toàn repo là ICU (`{name}`, `{count, plural, ...}`), không phải `{{name}}` của i18next; locale legacy khi migrate phải chuyển đổi. Thêm một ngôn ngữ vẫn là hai edit trong package (registry + JSON), giống reference. Package `@monorepo/dayjs` tiếp tục giữ registry locale riêng bằng value, không import `@monorepo/i18n`.
