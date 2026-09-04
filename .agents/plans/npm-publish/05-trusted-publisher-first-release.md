---
status: ready-for-human
---

# 05 — Bật trusted publisher trên npm, bật GitHub setting, release `2.0.0` đầu tiên

**What to build:** Lần đầu workflow `release` chạy thật: PR "Version Packages" được mở trên `main`, merge nó publish `@fe-monorepo/hook@2.0.0` và `@fe-monorepo/ui@2.0.0` với provenance, tạo git tag và GitHub Release. Hai bước đầu chỉ con người làm được trên dashboard; bước cuối là quan sát và ghi kết quả.

**Blocked by:** 03 — workflow và changeset đã có. (04 không gate, nhưng nên `done` trước để tài liệu đúng khi người ngoài đọc npm page.)

**Status:** ready-for-human

## Checklist cho người

- [ ] Trên npmjs.com, với **từng** package `@fe-monorepo/hook` và `@fe-monorepo/ui` (Settings → Publishing access / Trusted publisher): chọn GitHub Actions, điền owner/repo, tên workflow file đúng `release.yml`, environment để trống (hoặc đúng tên nếu workflow dùng `environment`). Tài khoản phải là maintainer của cả hai package (đã publish `1.x` trước đây).
- [ ] Trên GitHub repo → Settings → Actions → General: bật "Allow GitHub Actions to create and approve pull requests"; xác nhận workflow permissions cho phép `contents: write` (hoặc workflow tự khai `permissions`).
- [ ] Merge nhánh chứa ticket 01–04 vào `main`; quan sát `release.yml` chạy: Gate xanh, `changesets/action` mở PR "Version Packages" với CHANGELOG cho hai shell ở `2.0.0`.
- [ ] Merge PR "Version Packages"; quan sát bước publish: log `npm publish` có `provenance`, không hỏi token; tag `@fe-monorepo/hook@2.0.0`, `@fe-monorepo/ui@2.0.0` và hai GitHub Release xuất hiện.

## Acceptance criteria (agent kiểm sau khi người làm xong)

- [ ] `npm view @fe-monorepo/hook@2.0.0 --json` và `npm view @fe-monorepo/ui@2.0.0 --json` trả về đúng version, `dist.attestations` có mặt (provenance), `dependencies`/`peerDependencies` là range literal.
- [ ] Từ một thư mục ngoài repo: `bun add @fe-monorepo/ui @fe-monorepo/hook` rồi chạy đúng các bước của `publish:smoke` nhưng với package từ registry thay vì tarball → xanh.
- [ ] Ghi vào Notes: URL run của `release.yml`, số PR "Version Packages", output `npm view` rút gọn, và bất kỳ bước dashboard nào khác với checklist trên (để lần sau không mò).

## Notes
