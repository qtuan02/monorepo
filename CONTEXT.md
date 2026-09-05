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
App mẫu trong `apps/` được clone (bằng generator `app`) để tạo app mới; mỗi Template app ứng với đúng một Runtime. Có ba: `_template_vite`, `_template_next` và `_template_reactrouter`.
_Avoid_: starter, boilerplate, app mẫu

**Runtime**:
Cách một app được thực thi, quyết định Flavor nào của package dùng chung mà app đó dùng: **Vite client** (SPA, nginx), **Next.js** (App Router, Node standalone), và **React Router framework** (SSR, `react-router-serve`).
_Avoid_: framework (mơ hồ với React), platform, môi trường

**Flavor**:
Biến thể theo Runtime của một package dùng chung, sống dưới một subpath riêng của cùng package (ví dụ `@monorepo/i18n/i18next/*` và `@monorepo/i18n/next-intl/*`). Phần không phụ thuộc Runtime (registry ngôn ngữ, locale JSON, base schema) nằm ngoài mọi flavor và được mọi flavor dùng chung.
_Avoid_: adapter, variant, phiên bản

**Route module**:
Lớp mỏng ở tầng top của Runtime React Router framework — một file dưới `src/routes/` mà bảng route trỏ tới — sở hữu phần chỉ framework cung cấp được (`loader`, `action`, `meta`, `middleware`) và render template của slice; là hình dạng tương đương `~/pages/` của Vite client và `page.tsx` của Next.js.
_Avoid_: page, screen, route file

**Gate**:
Bốn job chặn merge chạy trên toàn workspace: `check` (Biome), `typecheck`, `test`, `build`. Một bước setup chỉ được coi là xong khi Gate xanh với 0 lỗi và 0 warning.
_Avoid_: CI, pipeline (rộng hơn — CI còn có `e2e` không chặn)

**Locale message**:
Chuỗi dịch trong `packages/i18n/src/locales/<code>.json`, viết theo cú pháp **ICU MessageFormat** để một file phục vụ mọi Flavor (next-intl đọc trực tiếp; i18next đọc qua `i18next-icu`).
_Avoid_: translation string, resource, key dịch (đó là khoá, không phải chuỗi)

**Publish shell**:
Workspace `packages/<name>-public` chỉ gồm một `package.json` viết tay (tên npm `@fe-monorepo/<name>`, version, deps literal — không `catalog:`, không `workspace:`) và README; nhận `dist/` được build từ package nguồn `packages/<name>` và là thứ duy nhất Changesets nhìn thấy khi publish. Package nguồn vẫn `private`, source-only. Hiện có hai: `ui-public` và `hook-public`.
_Avoid_: package public, bản publish, package npm (mơ hồ với package nguồn)

**Design brief**:
Đề bài của một pha design: màn hình/app/Runtime cần vẽ, ràng buộc từ research, và Direction đã chọn. Là thứ `research` bàn giao cho bước design và là input đầu tiên của Design canvas.
_Avoid_: yêu cầu, mô tả, prompt

**Direction**:
Một artboard low-fi thể hiện một hướng thẩm mỹ cho cùng đề bài; bước design vẽ 2–4 Direction khác hẳn nhau để chủ repo chọn đúng một trước khi vẽ chi tiết.
_Avoid_: phương án, style, concept

**Design canvas**:
Artifact chạy editor Claude Design cho một topic, gồm nhiều artboard; có version — mỗi lần chủ repo sửa tay rồi Save, hoặc Claude re-seed rồi republish, là một version mới. Là nơi duy nhất design được xem và chỉnh sửa; nguồn thật vẫn là working files commit trong repo.
_Avoid_: mockup (mơ hồ giữa canvas và một artboard), bản vẽ, design

**Design handoff**:
Tài liệu chuyển giao từ design sang spec và implement, viết sau khi Design canvas được chốt ở một version: screen inventory theo Runtime, component map (mỗi vùng UI → primitive/composite có sẵn hay cần thêm), token delta so với theme dùng chung, state list, và copy cần dịch. Là input của grill và được spec dẫn tới.
_Avoid_: design system (đụng với theme + primitive đã có), spec (handoff không quyết định kỹ thuật), tài liệu design
