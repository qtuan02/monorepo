# Personal Monorepo — glossary gốc

Monorepo cá nhân, dựng lại theo khuôn của `medviet` (Bun + Turbo + Biome + Base UI),
để mọi app mới clone từ một Template app và chạy chung một Gate. Đây là `CONTEXT.md`
của context gốc (root); mỗi workspace có `CONTEXT.md` riêng khi thuật ngữ đầu tiên của
nó được chốt — xem [`CONTEXT-MAP.md`](./CONTEXT-MAP.md).

## Language

**Reference**:
Monorepo `medviet` tại `E:\MedViet\frontend\medviet` — nguồn của mọi khuôn (rule, config, package shape) được copy hoặc phỏng theo.
_Avoid_: source này, repo mẫu, medviet (khi đang nói về khuôn chứ không phải dự án)

**Target**:
Chính repo này — nơi Skeleton được dựng.
_Avoid_: repo mới, monorepo cá nhân, source ở D

**Skeleton**:
Trạng thái của Target sau bước setup: root config + `packages/*` + `tooling/*` + các Template app + Storybook, gate xanh, chưa có app nghiệp vụ nào.
_Avoid_: base, khung, bộ khung

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

**Publish shell**:
Workspace `packages/<name>-public` chỉ gồm một `package.json` viết tay (tên npm `@fe-monorepo/<name>`, version, deps literal — không `catalog:`, không `workspace:`) và README; nhận `dist/` được build từ package nguồn `packages/<name>` và là thứ duy nhất Changesets nhìn thấy khi publish. Package nguồn vẫn `private`, source-only. Hiện có hai: `ui-public` và `hook-public`.
_Avoid_: package public, bản publish, package npm (mơ hồ với package nguồn)
