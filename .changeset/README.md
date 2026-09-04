# Changesets

Thư mục này là hàng đợi release của **hai Publish shell** — và chỉ hai package đó:

| Workspace | Tên trên npm |
| --- | --- |
| `packages/ui-public` | `@fe-monorepo/ui` |
| `packages/hook-public` | `@fe-monorepo/hook` |

Mọi package khác trong repo là `private: true`, và `privatePackages` trong
`config.json` khai `version: false` / `tag: false`, nên Changesets không bao giờ
bump `@monorepo/*`, một app, hay một workspace `tooling/*`. Chạy
`bun run changeset status` để nhìn release plan trước khi tin điều đó.

## Khi nào cần một changeset

Khi thay đổi của bạn **đổi thứ consumer ngoài repo nhận được**:

- sửa, thêm, xoá một primitive trong `packages/ui/src/components/` hoặc một hook
  trong `packages/hook/src/`;
- đổi `exports`, `dependencies`, `peerDependencies` của một shell;
- đổi CSS entry (`dist/globals.css`) — tức là đổi token hoặc `@custom-variant`
  trong `tooling/tailwind/`;
- đổi cách build đổ file vào `dist/` (rslib config, `packages/ui/scripts/build.ts`).

Không cần khi thay đổi chỉ sống trong repo: một app, Storybook, test, tài liệu,
hay refactor nội bộ không đổi bề mặt publish. Job `changeset-status` trong
`ci.yml` **nhắc** chứ không chặn, đúng vì ranh giới này là chuyện phán đoán.

## Cách viết

```bash
bun run changeset          # chọn shell, chọn major/minor/patch, viết note
```

Lệnh này ghi một file `.changeset/<tên-ngẫu-nhiên>.md`; commit nó cùng thay đổi
của bạn. Viết note cho **người cài package**, không cho người đọc diff: nói cái
gì đổi và phải sửa gì, không nói file nào bị sửa.

`major` khi consumer phải sửa code mới nâng được, `minor` khi thêm bề mặt mới,
`patch` cho sửa lỗi. `@fe-monorepo/ui` không depend `@fe-monorepo/hook`
(ADR-0004: hook được inline vào `dist/internal/`), nên một thay đổi chạm cả hai
cần **hai** entry trong changeset, không phải một.

Không ai chạy `changeset version` hay `changeset publish` bằng tay:
`.github/workflows/release.yml` mở PR "Version Packages" khi có changeset trên
`main`, và publish khi PR đó merge — xem [ADR-0004](../docs/adr/0004-npm-publish-qua-publish-shell.md).
