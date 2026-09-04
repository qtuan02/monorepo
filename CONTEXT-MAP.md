# Context Map

Context gốc là chính repo — thuật ngữ dùng chung ở [`CONTEXT.md`](./CONTEXT.md).
Các context còn lại là Turborepo workspace (`apps/*`, `packages/*`), mỗi cái có
`CONTEXT.md` riêng, tạo lazily khi thuật ngữ đầu tiên của nó được chốt.

## Contexts

- [Root](./CONTEXT.md) — Reference · Target · Skeleton · Template app · Runtime · Flavor · Gate · Locale message · Publish shell.

Chưa có context nào ở mức workspace. Repo đã có bảy app (hai Template, `portfolio`,
`documents`, `mcp-weather`, `assistant-ai`, `storybook`), tám package nguồn cộng hai Publish
shell (ADR-0004) và hai tooling, nhưng chưa workspace nào chốt thuật ngữ **của riêng nó** — từ vựng đang dùng
(Runtime, Flavor, Template app, Gate) đều là của context gốc. `CONTEXT.md` đầu tiên ở mức
workspace sẽ được `/domain-modeling` tạo khi có thuật ngữ thật để ghi, không dựng sẵn file
rỗng.

## Relationships

- **Mọi app → Runtime**: app chọn đúng một Runtime, và Runtime quyết định app clone từ
  Template app nào, dùng Flavor nào của `@monorepo/env` và `@monorepo/i18n`
  (xem [ADR-0002](./docs/adr/0002-i18n-one-package-many-flavors-icu-messages.md),
  [ADR-0003](./docs/adr/0003-env-two-flavors-native-prefix.md)).
