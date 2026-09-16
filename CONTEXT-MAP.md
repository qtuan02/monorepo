# Context Map

Context gốc là chính repo — thuật ngữ dùng chung ở [`CONTEXT.md`](./CONTEXT.md).
Các context còn lại là Turborepo workspace (`apps/*`, `packages/*`), mỗi cái có
`CONTEXT.md` riêng, tạo lazily khi thuật ngữ đầu tiên của nó được chốt.

## Contexts

- [Root](./CONTEXT.md) — Reference · Target · Skeleton · Template app · Runtime · Flavor · Route module · Gate · Locale message · Publish shell.
- [`apps/portfolio`](./apps/portfolio/CONTEXT.md) — CV site; từ v2 thêm từ vựng hình dạng (khối tiêu chuẩn, cửa sổ terminal, dòng lệnh, highlight, bóng đặc, đảo cực, neutral override — ADR-0008).

`apps/portfolio` là workspace **đầu tiên** chốt được một thuật ngữ của riêng nó, ở vòng
grill 2026-09-06 của spec #103. Sáu app còn lại (ba Template, `documents`, `mcp-weather`,
`storybook`), tám package nguồn cộng hai Publish shell (ADR-0004) và hai tooling vẫn chưa —
từ vựng chúng dùng (Runtime, Flavor, Template app, Gate) đều là của context gốc. `CONTEXT.md`
ở mức workspace được `/domain-modeling` tạo khi có thuật ngữ thật để ghi, không dựng sẵn file
rỗng.

## Relationships

- **Mọi app → Runtime**: app chọn đúng một Runtime, và Runtime quyết định app clone từ
  Template app nào, dùng Flavor nào của `@monorepo/env` và `@monorepo/i18n`
  (xem [ADR-0002](./docs/adr/0002-i18n-one-package-many-flavors-icu-messages.md),
  [ADR-0003](./docs/adr/0003-env-two-flavors-native-prefix.md),
  [ADR-0005](./docs/adr/0005-runtime-react-router-framework-mode.md)).
- **Runtime → Flavor của `@monorepo/env`**: `vite` cho Vite client, `next` cho Next.js,
  `react-router` cho React Router framework — Flavor thứ ba là Flavor duy nhất có block
  `server` bên cạnh block `client`, vì framework mode build code server và code client
  trong cùng một bản build Vite, nên `~/env.ts` được đánh giá ở cả hai graph
  (xem [ADR-0003](./docs/adr/0003-env-two-flavors-native-prefix.md),
  [ADR-0006](./docs/adr/0006-env-flavor-react-router-self-contained.md)).
- **Runtime → nơi quyết định truy cập**: Vite client guard tại route tree
  (`~/features/auth/provider/`), Next.js guard trong `src/proxy.ts`, React Router framework
  guard bằng `middleware` trên một `layout()` pathless — hai Runtime SSR quyết định xong
  trước khi render và giữ session trong cookie `HttpOnly`, nên cả hai đều không có
  `~/stores/` cho session
  (xem [ADR-0007](./docs/adr/0007-ssr-auth-cookie-session-middleware.md)).
