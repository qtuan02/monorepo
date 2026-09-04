# Personal Monorepo (skeleton mới tại `D:\Personal\monorepo`)

Monorepo cá nhân được dựng lại theo khuôn của `medviet` (Bun + Turbo + Biome + Base UI), để mọi app mới clone từ một template và chạy chung một gate. Glossary này thuộc về context `D:\Personal\monorepo`; nó được nháp ở đây trong lúc grill và sẽ được chuyển về root của repo đó ở bước 1 (chưa có file nào ở target được sửa trong phiên này).

## Language

**Reference**:
Monorepo `medviet` tại `E:\MedViet\frontend\medviet` — nguồn của mọi khuôn (rule, config, package shape) được copy hoặc phỏng theo.
_Avoid_: source này, repo mẫu, medviet (khi đang nói về khuôn chứ không phải dự án)

**Target**:
Monorepo cá nhân tại `D:\Personal\monorepo` — nơi skeleton được dựng.
_Avoid_: repo mới, monorepo cá nhân, source ở D

**Skeleton**:
Trạng thái của Target sau bước setup: root config + `packages/*` + `tooling/*` + các Template app + Storybook, gate xanh, chưa có app nghiệp vụ nào.
_Avoid_: base, khung, bộ khung

**Legacy app**:
Một app hoặc package của Target từ trước khi dựng Skeleton, đã dời vào `legacy/` — ngoài `workspaces.packages`, không install/build/lint, chờ được migrate thành app trong `apps/`.
_Avoid_: app cũ, source hiện tại, app đóng băng

**Template app**:
App mẫu trong `apps/` được clone (bằng generator `app`) để tạo app mới; mỗi Template app ứng với đúng một Runtime. Hiện có `_template_next` và `_template_vite`; `_template_reactrouter` sẽ thêm khi có Runtime React Router framework.
_Avoid_: starter, boilerplate, app mẫu

**Runtime**:
Cách một app được thực thi, quyết định flavor nào của package dùng chung mà app đó dùng: **Vite client** (SPA, nginx), **Next.js** (App Router, Node standalone), và sau này **React Router framework** (SSR, `react-router-serve`).
_Avoid_: framework (mơ hồ với React), platform, môi trường

**Flavor**:
Biến thể theo Runtime của một package dùng chung, sống dưới một subpath riêng của cùng package (ví dụ `@monorepo/i18n/i18next/*` và `@monorepo/i18n/next-intl/*`). Phần không phụ thuộc Runtime (registry ngôn ngữ, locale JSON, base schema) nằm ngoài mọi flavor và được mọi flavor dùng chung.
_Avoid_: adapter, variant, phiên bản

**Gate**:
Bốn job chặn merge chạy trên toàn workspace: `check` (Biome), `typecheck`, `test`, `build`. Một bước setup chỉ được coi là xong khi Gate xanh với 0 lỗi và 0 warning.
_Avoid_: CI, pipeline (rộng hơn — CI còn có `e2e` không chặn)

**Locale message**:
Chuỗi dịch trong `packages/i18n/src/locales/<code>.json`, viết theo cú pháp **ICU MessageFormat** để một file phục vụ mọi Flavor (next-intl đọc trực tiếp; i18next đọc qua `i18next-icu`).
_Avoid_: translation string, resource, key dịch (đó là khoá, không phải chuỗi)
