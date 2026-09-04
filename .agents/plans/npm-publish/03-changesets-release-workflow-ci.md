---
status: done
---

# 03 — Changesets ở root, workflow `release` với trusted publishing, hai job CI không chặn

**What to build:** Một PR sửa `@monorepo/ui` hoặc `@monorepo/hook` được CI nhắc (không chặn) nếu thiếu changeset và được chạy smoke test tarball; khi merge vào `main`, `changesets/action` mở hoặc cập nhật PR "Version Packages" cho hai Publish shell; merge PR đó publish `@fe-monorepo/*` lên npm bằng `npm publish` với trusted publishing OIDC và provenance, push git tag, tạo GitHub Release. Changeset đầu tiên là `major` cho cả hai shell với note "Base UI, 63 primitive / 5 hook, API mới hoàn toàn". Lần chạy thật thuộc ticket 05.

**Blocked by:** 02 — hai shell và smoke test đã có.

**Status:** done

## Acceptance criteria

- [x] `@changesets/cli` là devDependency root; `.changeset/config.json` **mới** (không kéo từ `legacy/`), schema `@changesets/config` 4.x, `access: public`, `baseBranch: main`, `commit: false`, `updateInternalDependencies: patch`, `privatePackages: { version: false, tag: false }`, `ignore: []`; `.changeset/README.md` ngắn bằng tiếng Việt nói khi nào cần changeset.
- [x] Root scripts: `changeset`, `version-packages` (`changeset version`), `release` (build hai package nguồn qua Turbo rồi `changeset publish`). `changeset status` chạy được và chỉ liệt kê hai shell; `@monorepo/*` không bao giờ xuất hiện trong release plan.
- [x] Một changeset `major` cho `@fe-monorepo/hook` và một cho `@fe-monorepo/ui` được commit; `changeset version --snapshot`/`status` cho thấy `2.0.0` (shell khởi điểm `2.0.0` từ ticket 01/02 → chọn một trong hai: shell bắt đầu `1.x` cũ và changeset major đưa lên `2.0.0`, hoặc shell đã `2.0.0` và changeset đầu là `major` sẽ thành `3.0.0`; **quyết**: shell khởi điểm khai `1.0.2`/`1.0.0` đúng version đang có trên npm, changeset `major` đưa lên `2.0.0` — sửa lại `version` trong hai shell theo đó và ghi vào Notes).
- [x] `.github/workflows/release.yml`: trigger `push` lên `main`, `concurrency`, `permissions` `contents: write`, `pull-requests: write`, `id-token: write`; các bước checkout → setup Bun (cùng version `ci.yml`) → setup Node 24 → in `npm --version` và fail nếu < 11.5.1 (thêm bước nâng npm nếu cần) → `bun install --frozen-lockfile` → Gate 4 lệnh → `changesets/action@v2` với `version: bun run version-packages`, `publish: bun run release`, `createGithubReleases: true`. Không có `NPM_TOKEN` ở đâu cả; ghi rõ comment vì sao.
- [x] `ci.yml`: job `changes` mở rộng path cho `.changeset/**`, `packages/ui-public/**`, `packages/hook-public/**`; job `changeset-status` (`continue-on-error: true`) chạy `changeset status --since=origin/main` khi diff chạm `packages/ui|hook|ui-public|hook-public`; job `publish-smoke` (`continue-on-error: true`) chạy `bun run publish:smoke` với cùng điều kiện. Comment trong workflow ghi điều kiện chuyển hai job này sang chặn merge.
- [x] `workflow_dispatch` cho `release.yml` để có thể chạy tay lần đầu (vẫn trên `main`).
- [x] Gate xanh 0 warning; `bun run changeset status` xanh; `act`/dry-run không bắt buộc, nhưng YAML phải qua `biome check` (nếu Biome không lint YAML thì `bunx yaml-lint` hoặc `gh workflow view` sau khi push — ghi cách đã kiểm vào Notes).

## Notes

Làm ngày 2026-09-04. Gate xanh 0 warning, `publish:smoke` xanh:

```
bun run check         → Checked 368 files in 21s. No fixes applied.
bun run typecheck     → Tasks: 14 successful, 14 total
bun run test          → Tasks: 10 successful, 10 total
bun run build         → Tasks:  5 successful,  5 total
bun run publish:smoke → OK - publish smoke test passed
```

Không con số nào đổi so với ticket 02: ticket này không thêm workspace nào, và
`.changeset/` không phải workspace.

### Version khởi điểm, và release plan

Theo đúng nhánh **quyết** trong AC 3: hai shell hạ về đúng version đang có trên
npm — `@fe-monorepo/ui` `1.0.2`, `@fe-monorepo/hook` `1.0.0` (xác nhận bằng
`npm view @fe-monorepo/<pkg> version`) — và một changeset `major` cho mỗi cái đưa
cả hai lên `2.0.0`. Kiểm bằng cách chạy thật `changeset version` rồi revert:

```
bunx changeset status --verbose
  major
    @fe-monorepo/hook -> 2.0.0   (.changeset/tidy-donkeys-invent.md)
    @fe-monorepo/ui   -> 2.0.0   (.changeset/quiet-pandas-repeat.md)
```

Không `@monorepo/*`, không app, không `tooling/*` nào xuất hiện — `privatePackages`
tắt cả `version` lẫn `tag`, nên release plan chỉ có thể chứa hai shell. Chạy
`changeset version` thật một lần cũng xác nhận nó ghi `CHANGELOG.md` đúng chỗ và
bump đúng hai `package.json`; cả bốn thay đổi đó đã được revert, PR "Version
Packages" trên CI mới là nơi chúng được sinh ra thật.

### Những chỗ lệch so với ticket, và lý do

- **Tên input của `changesets/action@v2` là kebab-case, không phải tên v1 trong
  AC.** AC viết `version:` / `publish:` / `createGithubReleases:` — đó là API của
  **v1**. v2 (bản duy nhất tương thích `@changesets/cli` 3.x, mà 3.0.1 là bản
  đang cài) đổi thành `version-script` / `publish-script` /
  `create-github-releases`. Một input không tồn tại không báo lỗi, nó chỉ **không
  được đọc**: giữ tên v1 nghĩa là action chạy `changeset version` mặc định và
  không bao giờ publish. Đã dùng tên v2, đọc từ README của chính branch `v2`.
  Cũng lưu ý `changesets/action@v2` là một **branch** chứ không phải moving tag —
  repo đó không có tag `v2`, chỉ có `v2.0.0`/`v2.1.0`/`v2.1.1` và branch `v2`.
- **Dùng `.github/actions/setup-workspace` thay cho bốn bước rời trong AC.** AC
  liệt kê checkout → setup Bun → setup Node 24 → `bun install --frozen-lockfile`.
  Composite action đó *là* đúng bốn bước ấy cộng cache và `.env` seed, và nó là
  thứ cả bốn job Gate trong `ci.yml` đã dùng — nên "cùng version Bun với
  `ci.yml`" trở thành **cấu trúc** thay vì một con số chép giữa hai file. Bước
  kiểm npm nằm sau nó, vì npm không tham gia việc install.
- **`changes` được thêm output thứ hai (`publish`), không nới `app`.** AC nói "mở
  rộng path cho `.changeset/**`, hai shell". Hai shell đã nằm trong `^packages/`
  của `app` rồi; thứ duy nhất thật sự mới là `.changeset/`. Nới `app` để chứa nó
  sẽ chạy `e2e` + `docker` cho một diff chỉ có release note. Comment cũ của job
  `changes` đã viết sẵn điều kiện tách: *"Split them only once one of the two
  genuinely wants a path the other does not"* — đây đúng là lúc đó. `publish` phủ
  `packages/{ui,hook,ui-public,hook-public}/`, `tooling/tailwind/`, `.changeset/`,
  `bun.lock`, `ci.yml`; **không** phủ `apps/`.
  `tooling/tailwind/` có mặt vì `dist/globals.css` được sinh từ đó, nên nó đổi
  bytes publish.
- **`pr-title`/`commit-message` đổi khỏi mặc định "Version Packages".** Mặc định
  của action là chuỗi trần đó; repo viết Conventional Commits, và commit duy nhất
  không ai gõ tay không nên là commit phá quy ước. Dùng
  `chore(release): version packages` cho cả hai. Vẫn là đúng PR mà ticket/ADR gọi
  là "Version Packages".

### Điều xác minh được, đáng nhớ

- **YAML kiểm bằng `Bun.YAML.parse`, không phải Biome.** Biome 2.5.12 không lint
  YAML (`biome check .` đọc 368 file và không đụng `.github/workflows/*.yml`), và
  `bunx yaml-lint` sẽ kéo một package chỉ để làm một việc Bun 1.4 đã có sẵn:
  `bun -e 'Bun.YAML.parse(await Bun.file(f).text())'`. Cả hai workflow parse
  xanh, và dump ra đúng 9 job trong `ci.yml` (4 Gate + `changes` + 4 non-blocking)
  và 1 job trong `release.yml` với đúng ba permission.
- **Bước `filter` của `changes` chạy thật, không chỉ đọc.** Trích `run` ra khỏi
  YAML, thay hai expression `${{ }}` bằng SHA thật rồi chạy bằng `bash` với
  `GITHUB_OUTPUT` trỏ vào file tạm. Ba nhánh đều đúng: một range chạm
  `packages/ui-public` → `app=true publish=true`; base toàn số 0 → cả hai `true`;
  một range không chạm gì → cả hai `false`. Năm path mẫu cũng đúng:
  `.changeset/config.json` → `app=false publish=true`,
  `apps/_template_vite/src/x.tsx` → `publish=false`,
  `packages/ui/src/components/button.tsx` → `publish=true`,
  `packages/i18n/src/languages.ts` → `publish=false`.
- **`changeset status --since=origin/main` không thấy changeset chưa `git add`.**
  Chạy lần đầu với hai file untracked → "Some packages have been changed but no
  changesets were found", exit 1; `git add .changeset` xong thì ra đúng release
  plan. Trên CI mọi thứ đã commit nên không gặp, nhưng chạy tay ở local thì phải
  stage trước — nếu không sẽ tưởng config sai.
  Job cũng phải `git fetch --no-tags origin main:refs/remotes/origin/main` trước:
  `actions/checkout` chỉ fetch ref được push, nên `origin/main` không tồn tại
  trên đĩa và lệnh sẽ chết vì unknown revision thay vì báo thiếu changeset.
- **`bun.lock` có ghi `version` của workspace, nhưng `--frozen-lockfile` không
  quan tâm.** Đây là cái bẫy đáng lo nhất của quy trình: PR "Version Packages"
  bump `package.json` của hai shell lên `2.0.0` mà không đụng `bun.lock`, và lần
  chạy publish sau đó mở đầu bằng `bun install --frozen-lockfile`. Đã test đúng
  tình huống ấy (đặt `hook-public` thành `2.0.0` trong khi lock vẫn `1.0.0`):
  install xanh, "no changes". `bun install --lockfile-only` cũng **không** cập
  nhật lại field đó, nên thêm nó vào `version-packages` chỉ là một dòng nói dối —
  không thêm.
- **`&&` trong script `release` chạy được qua Bun shell.** Kiểm bằng một script
  probe thay `changeset publish` bằng `echo`: Turbo chạy xong thì vế sau chạy. (Sau
  code review, vế đầu là `bun run build:publishable` thay vì lệnh `turbo` viết thẳng.)
- **npm ≥ 11.5.1 vẫn chưa đo được trên runner** — chỉ đo được ở máy dev
  (Node v24.17.0, npm 11.15.0, thừa xa ngưỡng). Bước trong workflow in số thật,
  tự `npm install -g npm@latest` nếu thấp hơn, rồi fail nếu vẫn thấp — nên con số
  runner sẽ xuất hiện trong log lần chạy đầu (ticket 05 ghi lại).

### Sửa sau `/code-review`

Hai review agent (Standards + Spec) chạy trên diff staged. Những gì đã sửa:

- **`release.yml` thiếu branch guard, và đó là lỗ nghiêm trọng nhất trong ticket.**
  Trigger `push` đã khoá `main`, nhưng `workflow_dispatch` thì không: nó bắn được
  từ bất kỳ branch nào, và `action.yml` của v2 khai `pr-base-branch` mặc định là
  `github.ref_name`. Dispatch từ một feature branch không có changeset nào → action
  đi thẳng sang `publish-script` và **publish `@fe-monorepo/*` lên npm từ một
  branch chưa merge**. `concurrency: release-${{ github.ref }}` không chặn được vì
  ref khác thì group khác. Thêm `if: github.ref == 'refs/heads/main'` ở job.
- **Ghim `changesets/action@v2.1.1` thay vì `@v2`.** Notes phía trên đã đo được
  `@v2` là một **branch** chứ không phải moving tag, nhưng lại không rút kết luận.
  `actions/checkout@v7` và bạn bè là moving major của chính GitHub; đây là action
  third-party giữ `contents: write` + quyền publish npm, nên nó đáng cái pin chặt
  hơn. AC viết `changesets/action@v2` — vẫn là v2, chỉ là bản cụ thể.
- **Bỏ trùng `--filter @monorepo/ui --filter @monorepo/hook`.** Cặp filter đó viết
  hai lần (script `release` và step build của job `publish-smoke`); shell thứ ba sẽ
  bắt sửa hai file. Gom thành root script `build:publishable`, hai chỗ gọi nó.
- **`publish_paths` thiếu chính `scripts/`.** US26 chỉ liệt kê
  `packages/{ui,hook,ui-public,hook-public}`, nhưng hệ quả là sửa
  `scripts/publish-smoke.ts` thì job `publish-smoke` **không chạy** — cái test tự
  miễn cho mình. Thêm `scripts/`, và thêm `release.yml` cạnh `ci.yml`. Đã kiểm lại
  7 path mẫu: `scripts/publish-smoke.ts`, `.github/workflows/release.yml`,
  `.changeset/x.md`, `packages/ui/src/components/button.tsx`,
  `tooling/tailwind/theme.css` → `true`; `apps/_template_vite/src/x.tsx`,
  `packages/i18n/src/languages.ts` → `false`.
- **`changeset-status` bỏ qua trên `main`.** Ở đó `origin/main` *là* commit đang
  test, nên `--since` so nó với chính nó, không thấy package nào đổi, và báo xanh
  mà không khẳng định gì. Thêm `github.ref != 'refs/heads/main'` vào `if`.
- **`create-github-releases: true` đúng là mặc định của v2** (đọc `action.yml`).
  Giữ dòng đó nhưng comment nói rõ nó là mặc định — nó ở lại vì "một git tag và một
  GitHub Release cho mỗi version" là lời hứa trong ADR-0004, không phải hệ quả tình
  cờ.

Hai finding **không** sửa, có lý do:

- **Changeset của `hook` mở đầu bằng "Base UI, 63 primitive / 5 hook".** Reviewer
  đúng: CHANGELOG của package hook không nên nói về Base UI và 63 primitive, và
  `.changeset/README.md` trong cùng diff còn dặn "viết note cho người cài package".
  Nhưng AC của ticket viết thẳng: *"Changeset đầu tiên là `major` cho cả hai shell
  với note 'Base UI, 63 primitive / 5 hook, API mới hoàn toàn'"* — spec thắng. Đoạn
  thứ hai của mỗi changeset đã nói đúng chuyện của riêng package đó. Muốn bỏ câu
  chung thì sửa AC trước.
- **`bun.lock` sẽ drift sau release.** PR "Version Packages" bump `package.json` mà
  không bump `version` trong lock. Đã test `--frozen-lockfile` chịu được, và
  `--lockfile-only` không cập nhật lại field đó, nên không có gì để thêm mà không
  nói dối. Ghi lại để lần sau không ai đi truy.

### Về commit này

Commit mang **cả** phần `ci.yml` chưa commit của topic khác đang nằm sẵn trong
working tree khi ticket này bắt đầu: job `docker`, output `apps` của job `changes`,
và comment port E2E (3100/3101) — thuộc `personal-monorepo-rebuild` ticket 12/13,
không có ở HEAD `fb83356`. Hai review agent đều gọi tên nó (Divergent Change /
scope). Không tách được vì cùng một file, và người dùng chọn commit chung; commit
message ghi rõ dòng nào không thuộc ticket 03.

Gate sau khi sửa: `check` 368 file 0 warning, `typecheck` 14/14, `test` 10/10,
`build` 5/5, `publish:smoke` xanh, `bunx changeset status --verbose` vẫn ra đúng
hai shell → `2.0.0`.

### Chưa làm (đúng phạm vi ticket)

Không đụng CLAUDE.md / `.agents/commands.md` / `README.md` / `legacy/README.md` /
`.agents/knowledge-base.md` / rule (**ticket 04** — tài liệu vẫn lệch với cây
đúng như ticket 01 và 02 để lại). Không cấu hình trusted publisher trên npmjs.com,
không bật "Allow GitHub Actions to create and approve pull requests" (**ticket
05**, `ready-for-human`) — thiếu hai thứ đó thì lần chạy `release` đầu tiên đỏ ở
bước mở PR hoặc bước publish, không phải ở đây. Không chạy `changeset publish`
thật ở bất kỳ đâu.

`CONTEXT.md`, `CONTEXT-MAP.md`, `decisions.md` và một loạt file của topic khác vẫn
lệch trong working tree; commit của ticket này không chạm tới chúng.

### Sửa sau, ngày 2026-09-04 — quyết định version của ticket này bị lật

Quyết trong AC ở trên ("shell khởi điểm khai `1.0.2`/`1.0.0`, changeset `major`
đưa cả hai lên `2.0.0`") **không chạy được cho `ui`**. Ticket 05 kiểm registry và
thấy `@fe-monorepo/ui@2.0.0` đã từng được publish rồi unpublish ngày 25/11/2025;
npm không cho tái sử dụng một version đã dùng, nên `changeset version` sẽ ra
`2.0.0` ngon lành rồi `npm publish` chết với `E403` — sau khi bump đã merge vào
`main`.

Đã chọn phương án A của ticket 05: `packages/ui-public/package.json` đặt
`version: 2.0.0`, giữ changeset `major`, nên `ui` publish ra **`3.0.0`**.
`hook` không dính (chỉ từng có `1.0.0`) và vẫn ra `2.0.0`.

```
$ bunx changeset status --output=…
@fe-monorepo/ui:   2.0.0 -> 3.0.0 (major)
@fe-monorepo/hook: 1.0.0 -> 2.0.0 (major)
```

Hai shell lệch số nhau là chấp nhận được: chúng độc lập, `ui` không depend
`hook`. `spec.md`, `.changeset/quiet-pandas-repeat.md` và
`packages/ui-public/README.md` đã cập nhật theo. Ticket 01/02 giữ nguyên như
history (CLAUDE.md §7b: ticket đã xong là lịch sử, rule/spec mới thắng).
