---
status: ready-for-agent
---

# 03 — Changesets ở root, workflow `release` với trusted publishing, hai job CI không chặn

**What to build:** Một PR sửa `@monorepo/ui` hoặc `@monorepo/hook` được CI nhắc (không chặn) nếu thiếu changeset và được chạy smoke test tarball; khi merge vào `main`, `changesets/action` mở hoặc cập nhật PR "Version Packages" cho hai Publish shell; merge PR đó publish `@fe-monorepo/*` lên npm bằng `npm publish` với trusted publishing OIDC và provenance, push git tag, tạo GitHub Release. Changeset đầu tiên là `major` cho cả hai shell với note "Base UI, 63 primitive / 5 hook, API mới hoàn toàn". Lần chạy thật thuộc ticket 05.

**Blocked by:** 02 — hai shell và smoke test đã có.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] `@changesets/cli` là devDependency root; `.changeset/config.json` **mới** (không kéo từ `legacy/`), schema `@changesets/config` 4.x, `access: public`, `baseBranch: main`, `commit: false`, `updateInternalDependencies: patch`, `privatePackages: { version: false, tag: false }`, `ignore: []`; `.changeset/README.md` ngắn bằng tiếng Việt nói khi nào cần changeset.
- [ ] Root scripts: `changeset`, `version-packages` (`changeset version`), `release` (build hai package nguồn qua Turbo rồi `changeset publish`). `changeset status` chạy được và chỉ liệt kê hai shell; `@monorepo/*` không bao giờ xuất hiện trong release plan.
- [ ] Một changeset `major` cho `@fe-monorepo/hook` và một cho `@fe-monorepo/ui` được commit; `changeset version --snapshot`/`status` cho thấy `2.0.0` (shell khởi điểm `2.0.0` từ ticket 01/02 → chọn một trong hai: shell bắt đầu `1.x` cũ và changeset major đưa lên `2.0.0`, hoặc shell đã `2.0.0` và changeset đầu là `major` sẽ thành `3.0.0`; **quyết**: shell khởi điểm khai `1.0.2`/`1.0.0` đúng version đang có trên npm, changeset `major` đưa lên `2.0.0` — sửa lại `version` trong hai shell theo đó và ghi vào Notes).
- [ ] `.github/workflows/release.yml`: trigger `push` lên `main`, `concurrency`, `permissions` `contents: write`, `pull-requests: write`, `id-token: write`; các bước checkout → setup Bun (cùng version `ci.yml`) → setup Node 24 → in `npm --version` và fail nếu < 11.5.1 (thêm bước nâng npm nếu cần) → `bun install --frozen-lockfile` → Gate 4 lệnh → `changesets/action@v2` với `version: bun run version-packages`, `publish: bun run release`, `createGithubReleases: true`. Không có `NPM_TOKEN` ở đâu cả; ghi rõ comment vì sao.
- [ ] `ci.yml`: job `changes` mở rộng path cho `.changeset/**`, `packages/ui-public/**`, `packages/hook-public/**`; job `changeset-status` (`continue-on-error: true`) chạy `changeset status --since=origin/main` khi diff chạm `packages/ui|hook|ui-public|hook-public`; job `publish-smoke` (`continue-on-error: true`) chạy `bun run publish:smoke` với cùng điều kiện. Comment trong workflow ghi điều kiện chuyển hai job này sang chặn merge.
- [ ] `workflow_dispatch` cho `release.yml` để có thể chạy tay lần đầu (vẫn trên `main`).
- [ ] Gate xanh 0 warning; `bun run changeset status` xanh; `act`/dry-run không bắt buộc, nhưng YAML phải qua `biome check` (nếu Biome không lint YAML thì `bunx yaml-lint` hoặc `gh workflow view` sau khi push — ghi cách đã kiểm vào Notes).

## Notes

(ghi version khởi điểm đã chọn cho hai shell, npm CLI version thấy trên runner nếu đã push, và output verify)
