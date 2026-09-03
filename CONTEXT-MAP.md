# Context Map

Context gốc là chính repo — thuật ngữ dùng chung ở [`CONTEXT.md`](./CONTEXT.md).
Các context còn lại là Turborepo workspace (`apps/*`, `packages/*`), mỗi cái có
`CONTEXT.md` riêng, tạo lazily khi thuật ngữ đầu tiên của nó được chốt.

## Contexts

- [Root](./CONTEXT.md) — Reference · Target · Skeleton · Legacy app · Template app · Runtime · Flavor · Gate · Locale message.

Chưa có context nào ở mức workspace: Skeleton mới có `tooling/*`, và các Template app
được dựng ở ticket 07/08.

## Relationships

- **Mọi app → Runtime**: app chọn đúng một Runtime, và Runtime quyết định app clone từ
  Template app nào, dùng Flavor nào của `@monorepo/env` và `@monorepo/i18n`
  (xem [ADR-0002](./docs/adr/0002-i18n-one-package-many-flavors-icu-messages.md),
  [ADR-0003](./docs/adr/0003-env-two-flavors-native-prefix.md)).
- **Legacy app → Template app**: bảng app → Runtime → Template đích ở
  [`legacy/README.md`](./legacy/README.md), theo
  [ADR-0001](./docs/adr/0001-legacy-apps-outside-workspace.md).
