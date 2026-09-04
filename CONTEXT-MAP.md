# Context Map

Context gốc là chính repo — thuật ngữ dùng chung ở [`CONTEXT.md`](./CONTEXT.md).
Các context còn lại là Turborepo workspace (`apps/*`, `packages/*`), mỗi cái có
`CONTEXT.md` riêng, tạo lazily khi thuật ngữ đầu tiên của nó được chốt.

## Contexts

- [Root](./CONTEXT.md) — Reference · Target · Skeleton · Legacy app · Template app · Runtime · Flavor · Gate · Locale message · Publish shell.

Chưa có context nào ở mức workspace. Skeleton đã đủ ba app (`_template_next`,
`_template_vite`, `storybook`), tám package nguồn cộng hai Publish shell (ADR-0004) và hai
tooling, nhưng chưa workspace nào chốt thuật ngữ **của riêng nó** — từ vựng đang dùng
(Runtime, Flavor, Template app, Gate) đều là của context gốc. `CONTEXT.md` đầu tiên ở mức
workspace sẽ được `/domain-modeling` tạo khi có thuật ngữ thật để ghi, không dựng sẵn file
rỗng.

`legacy/` **không** phải một context và cố ý nằm ngoài bản đồ này: các app trong đó đóng
băng trên toolchain cũ, mô tả hình dạng repo đang rời khỏi. Bảng app → Runtime → Template
đích ở [`legacy/README.md`](./legacy/README.md); đừng lấy từ vựng từ đó.

## Relationships

- **Mọi app → Runtime**: app chọn đúng một Runtime, và Runtime quyết định app clone từ
  Template app nào, dùng Flavor nào của `@monorepo/env` và `@monorepo/i18n`
  (xem [ADR-0002](./docs/adr/0002-i18n-one-package-many-flavors-icu-messages.md),
  [ADR-0003](./docs/adr/0003-env-two-flavors-native-prefix.md)).
- **Legacy app → Template app**: bảng app → Runtime → Template đích ở
  [`legacy/README.md`](./legacy/README.md), theo
  [ADR-0001](./docs/adr/0001-legacy-apps-outside-workspace.md).
