---
status: ready-for-agent
---

# 04 — Tài liệu và rule khớp ADR-0004

**What to build:** Một agent (hoặc người) mở CLAUDE.md, README, `.agents/commands.md`, `.agents/knowledge-base.md`, `legacy/README.md` và hai rule liên quan không còn thấy câu nào mâu thuẫn với cây: `packages/` giờ có hai Publish shell, `ui`/`hook` có task `build` chỉ để nạp shell, app trong repo vẫn import source, bề mặt publish subpath-only, consumer cần `@source`, và có ba lệnh mới (`changeset`, `publish:smoke`, `release`).

**Blocked by:** 03 — mọi lệnh và workflow được mô tả đã tồn tại.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] CLAUDE.md §1: mục `packages/` sửa câu "ALL private, source-only, no build step" thành mô tả đúng (private + source-only với app trong repo; `ui` và `hook` có `build` đổ vào Publish shell theo ADR-0004); thêm hai dòng `ui-public/`, `hook-public/` với vai trò shell; ghi vai trò thật của `tooling/typescript/compiled-package.json` (preset `jsx: preserve`, `noEmit`, không phải config build).
- [ ] CLAUDE.md §3: thêm dòng "Đổi bề mặt publish của ui/hook → sửa shell + thêm changeset"; §6: thêm `changeset`, `publish:smoke`, `release` (ghi rõ `release` chỉ chạy trên CI); §7b/§9 không đổi.
- [ ] `.agents/commands.md`: ba lệnh mới với ràng buộc (Windows: script smoke dùng thư mục tạm của hệ điều hành, không `/tmp`).
- [ ] `README.md` root: mục packages/publish cập nhật; `legacy/README.md`: hai dòng `ui-public`/`hook-public` và dòng `.changeset/` trỏ ADR-0004 và nói rõ thư mục legacy này sẽ xoá ở ticket dọn của topic `legacy-migrate`.
- [ ] `.agents/knowledge-base.md`: mục mới về publish (shell, inline hook, `@source`, trusted publishing, vì sao không `bun publish`).
- [ ] Rule `quality-avoid-barrel-imports`: một đoạn ngắn nói `dist/` của shell không phải barrel và bề mặt publish vẫn subpath-only; rule `architecture-ui-primitives`: ghi chú CSS entry và `@source` cho consumer ngoài. Rule vẫn tiếng Anh, ~vài dòng, có ví dụ import thật.
- [ ] `.agents/README.md` index không cần dòng mới (không có rule mới); xác nhận.
- [ ] `docs/research/legacy-unfreeze-and-npm-publish.md` không sửa (là snapshot); `CONTEXT.md` giữ định nghĩa **Publish shell**, cập nhật nếu ticket 01–03 làm nó lệch.
- [ ] `bun run check` xanh (Biome format markdown không áp nhưng không được có lỗi mới); `bun run typecheck` xanh vì không đụng code.

## Notes
