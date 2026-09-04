---
status: ready-for-human
---

# 05 — Bật trusted publisher trên npm, bật GitHub setting, release `2.0.0` đầu tiên

**What to build:** Lần đầu workflow `release` chạy thật: PR "Version Packages" được mở trên `main`, merge nó publish `@fe-monorepo/hook@2.0.0` và `@fe-monorepo/ui@2.0.0` với provenance, tạo git tag và GitHub Release. Hai bước đầu chỉ con người làm được trên dashboard; bước cuối là quan sát và ghi kết quả.

**Blocked by:** 03 — workflow và changeset đã có. (04 không gate, nhưng nên `done` trước để tài liệu đúng khi người ngoài đọc npm page.) **Và một chặn mới, thấy khi chuẩn bị ticket này:** `@fe-monorepo/ui@2.0.0` đã tồn tại rồi bị unpublish trên npm, nên số đó không dùng lại được — xem mục ngay dưới, phải quyết trước khi merge bất cứ thứ gì vào `main`.

**Status:** ready-for-human

## ⛔ Chặn: `@fe-monorepo/ui@2.0.0` là số đã bị đốt

`npm view @fe-monorepo/ui time` liệt kê **bảy** version từng được publish, trong khi
`versions` chỉ còn một:

```
versions: [ '1.0.2' ]
time: 0.0.1  2025-11-24 · 1.0.0  2025-11-24 · 1.0.1  2025-11-25
      2.0.0  2025-11-25T08:20:09.888Z   ← đã publish rồi unpublish
      0.1.0  2025-11-25 · 0.1.1  2025-11-25 · 1.0.2  2025-11-25  ← bản còn sống
```

Chính sách npm ([docs.npmjs.com/policies/unpublish](https://docs.npmjs.com/policies/unpublish)):
*"Once `package@version` has been used, you can never use it again. You must publish a
new version even if you unpublished the old one."* Sáu số kia (`0.0.1`, `1.0.0`, `1.0.1`,
`2.0.0`, `0.1.0`, `0.1.1`) đều đã bị đốt vĩnh viễn cho package này.

Hệ quả: release plan hiện tại (`1.0.2` + changeset `major` → **`2.0.0`**) sẽ chạy ngon
qua `changeset version`, mở PR "Version Packages" đẹp đẽ, rồi **chết ở đúng bước
`npm publish`** với `E403 You cannot publish over the previously published versions:
2.0.0`. Lúc đó version bump đã merge vào `main` rồi, nên gỡ ra tốn hơn nhiều so với
quyết bây giờ.

`@fe-monorepo/hook` **không** dính: nó chỉ có đúng `1.0.0` trong `time`, nên `2.0.0`
còn trống.

Ba đường ra, phải chọn **trước** khi merge (việc này sửa `packages/ui-public/package.json`
và `.changeset/quiet-pandas-repeat.md`, tức là quay lại quyết định của ticket 03 —
không thuộc phạm vi file này):

| | Làm gì | `@fe-monorepo/ui` ra | Đánh đổi |
| --- | --- | --- | --- |
| **A (khuyến nghị)** | Đặt `version` của `packages/ui-public` về `2.0.0` (đúng như ticket 01/02 để ban đầu), giữ changeset `major` | **`3.0.0`** | Hai shell lệch số (`hook` `2.0.0`, `ui` `3.0.0`) — không sao, chúng độc lập, `ui` không depend `hook`. Phải sửa câu "`2.0.0` viết lại từ đầu" trong `.changeset/quiet-pandas-repeat.md` |
| B | Đặt `version` về `2.0.0` và đổi changeset của `ui` thành `patch` | `2.0.1` | CHANGELOG ghi breaking change dưới mục "Patch Changes" — sai ngữ nghĩa, và semver nói dối với người cài |
| C | Xin npm support giải phóng `2.0.0` | `2.0.0` | Chính sách nói thẳng là không; đừng chặn release để chờ |

**ĐÃ CHỌN (2026-09-04): phương án A.** Chủ repo quyết. Đã áp dụng, nên phần
chặn ở trên là lịch sử — không còn phải quyết gì trước khi merge:

- `packages/ui-public/package.json` → `version: 2.0.0`; `hook-public` giữ `1.0.0`.
- `.changeset/quiet-pandas-repeat.md` giữ `major`, sửa câu mở đầu thành `3.0.0` và
  nói rõ vì sao nhảy qua `2.0.0`.
- `spec.md` (dòng 19, 46, 60, 66, 90, 108), ticket 03 Notes và
  `packages/ui-public/README.md` đã cập nhật theo. Ticket 01/02 giữ nguyên như history.

Release plan sau khi sửa, kiểm bằng `bunx changeset status --output`:

```
@fe-monorepo/ui:   2.0.0 -> 3.0.0 (major)
@fe-monorepo/hook: 1.0.0 -> 2.0.0 (major)
```

**Mọi chỗ dưới đây viết `<v>` là: `ui` = `3.0.0`, `hook` = `2.0.0`.**

## Checklist cho người

Giá trị thật của repo này, dùng nguyên văn khi điền form (đã xác minh bằng
`git remote -v`, đọc `.github/workflows/release.yml`, và `npm view`):

| Chỗ điền | Giá trị |
| --- | --- |
| Organization or user | `qtuan02` |
| Repository | `monorepo` |
| Workflow filename | `release.yml` (chỉ tên file, **không** phải `.github/workflows/release.yml`) |
| Environment name | **để trống** — `release.yml` không khai `environment:` ở job nào |
| Tài khoản npm | `qtuan02` (`quoctuan200702@gmail.com`) — đang là maintainer duy nhất của **cả hai** package |

- [ ] **0 · Quyết cái chặn ở trên.** Không có bước nào dưới đây cứu được một số
      version đã bị đốt.

- [ ] **1 · Trusted publisher cho `@fe-monorepo/ui`.**
      Đăng nhập [npmjs.com](https://www.npmjs.com) bằng tài khoản `qtuan02` →
      avatar → **Packages** → chọn `@fe-monorepo/ui` → tab **Settings** → khối
      **Trusted publishing** (npm docs:
      [docs.npmjs.com/trusted-publishers](https://docs.npmjs.com/trusted-publishers)).
      Chọn **GitHub Actions**, điền đúng bốn ô trong bảng trên (Environment name để
      trống), rồi **Save**.
      *Biết là xong khi:* khối Trusted publishing hiện một dòng
      `GitHub Actions · qtuan02/monorepo · release.yml` thay cho form rỗng.

- [ ] **2 · Trusted publisher cho `@fe-monorepo/hook`.** Y hệt bước 1, cùng bốn giá
      trị (cùng repo, cùng `release.yml`). Trusted publisher là cấu hình **theo
      package**, không phải theo tài khoản — làm một cái không tự lan sang cái kia,
      và thiếu một cái thì `changeset publish` publish được package này rồi chết ở
      package kia, để lại release nửa vời.

- [ ] **3 · GitHub: cho Actions mở PR.**
      `https://github.com/qtuan02/monorepo/settings/actions` → mục **Workflow
      permissions** ở cuối trang → tick **"Allow GitHub Actions to create and approve
      pull requests"** → **Save**.
      Hai ô radio ngay trên nó (`Read repository contents...` / `Read and write
      permissions`) **không cần đổi**: `release.yml` tự khai `permissions:` ở job,
      và một khai báo trong workflow luôn thắng mặc định của repo. Ô tick kia thì
      ngược lại — không permission block nào cấp được nó.
      *Biết là xong khi:* tải lại trang, ô vẫn còn tick.

- [ ] **4 · Merge nhánh chứa ticket 01–04 vào `main`.** Quan sát Actions →
      workflow **Release**: bốn lệnh Gate xanh, bước
      *"Check npm can do trusted publishing (>= 11.5.1)"* in ra số npm thật của
      runner (ghi số đó vào Notes — đây là lần đầu đo được), rồi
      `changesets/action` mở PR tựa đề `chore(release): version packages`.
      *Biết là xong khi:* PR đó tồn tại, diff của nó bump `version` hai shell và
      thêm `CHANGELOG.md` cho mỗi cái, và xoá hai file trong `.changeset/`.
      **Chưa có gì lên npm ở bước này.**

- [ ] **5 · Merge PR `chore(release): version packages`.** Workflow **Release** chạy
      lần hai, lần này vào nhánh publish.
      *Biết là xong khi:* log có `npm publish` cho cả hai package, **không** hỏi
      token và **không** báo `ENEEDAUTH`; tag `@fe-monorepo/hook@<v>` và
      `@fe-monorepo/ui@<v>` xuất hiện ở
      `https://github.com/qtuan02/monorepo/tags`; và hai GitHub Release tương ứng
      xuất hiện ở tab Releases. Trang npm của mỗi package hiện huy hiệu
      **Provenance** kèm link về đúng run này.

- [ ] **6 · Bàn giao lại cho agent.** Dán vào Notes: URL của cả hai run
      `release.yml`, số PR "Version Packages", số npm của runner ở bước 4, và bất kỳ
      chỗ nào dashboard hiển thị khác với checklist trên. Rồi chạy
      `bun run verify:release` (mục dưới).

### Nếu bước 5 đỏ

| Lỗi trong log | Gần như chắc là |
| --- | --- |
| `E403 ... cannot publish over the previously published versions` | Đúng cái chặn ở đầu file — version đã bị đốt |
| `ENEEDAUTH` / hỏi token | Trusted publisher chưa lưu, hoặc lưu sai tên workflow (phải là đúng chuỗi `release.yml`), hoặc điền Environment name trong khi workflow không có `environment:` |
| Chết ở bước mở PR, không tới publish | Bước 3 chưa bật |
| `npm ... cannot do trusted publishing` | npm trên runner < 11.5.1 và bước tự nâng cũng không cứu được — đọc số in ra ngay trên dòng đó |

## Acceptance criteria (agent kiểm sau khi người làm xong)

Cả ba gạch đầu dòng đầu chạy bằng **một lệnh**, từ root repo, sau khi đã pull `main`
(script đọc version cần kiểm từ chính `package.json` của hai shell, tức là con số PR
"Version Packages" vừa ghi vào):

```bash
bun run verify:release              # hoặc: bun run verify:release --version=2.0.0
```

- [ ] `npm view @fe-monorepo/hook@<v> --json` và `@fe-monorepo/ui@<v> --json` trả về
      đúng version, `dist.attestations` có mặt (provenance), `dependencies`/
      `peerDependencies` là range literal (không `catalog:`, không `workspace:`).
- [ ] Từ một thư mục ngoài repo: `bun add @fe-monorepo/ui @fe-monorepo/hook` rồi chạy
      đúng các bước của `publish:smoke` nhưng với package từ registry thay vì tarball
      → xanh. (`scripts/verify-release.ts` dựng project tạm trong `os.tmpdir()`, cài
      từ registry, rồi chạy lại đúng phần còn lại của smoke test — import subpath,
      CSS + `@source`, `tsc --noEmit`, `vite build`.)
- [ ] Ghi vào Notes: URL run của `release.yml`, số PR "Version Packages", output
      `npm view` rút gọn, và bất kỳ bước dashboard nào khác với checklist trên (để
      lần sau không mò).

## Notes

### Chuẩn bị ngày 2026-09-04 (agent, trước khi người chạy)

Không cấu hình gì trên npmjs.com, không đổi setting GitHub, không publish gì. Chỉ
đọc, đo, và viết checklist ở trên.

**Audit `.github/workflows/release.yml` theo yêu cầu của npm trusted publishing —
đạt hết, không sửa một dòng nào:**

| Điểm | Kết quả | Chỗ |
| --- | --- | --- |
| Tên file đúng `release.yml` | đạt | `.github/workflows/release.yml` |
| `id-token: write` | đạt | dòng 71 |
| `contents: write` | đạt | dòng 64 |
| `pull-requests: write` | đạt | dòng 69 |
| `push` lên `main` | đạt | dòng 31–32 |
| `workflow_dispatch` | đạt | dòng 36 (job còn có `if: github.ref == 'refs/heads/main'` ở dòng 61) |
| `concurrency` | đạt | dòng 41–43, `cancel-in-progress: false` |
| `environment:` | **không có** → ô Environment name trên form npm để **trống** | không xuất hiện ở đâu trong file |
| Không `NPM_TOKEN`/`NODE_AUTH_TOKEN` | đạt | grep cả repo (trừ `node_modules`): chỉ khớp trong comment giải thích và trong `spec.md`/ticket/research — không có `.npmrc` nào trong repo |
| Bước kiểm npm ≥ 11.5.1 fail thật | đạt | dòng 95–110: `sort -V` lấy min của (`11.5.1`, `$current`); khác `11.5.1` nghĩa là thấp hơn → `npm install -g npm@latest`, đo lại, vẫn thấp thì `::error::` + `exit 1` |
| `changesets/action` nhận đúng script | đạt | dòng 141–149 |

Một chỗ **ticket/spec viết sai mà workflow viết đúng**, đừng "sửa lại cho khớp
spec": AC của ticket 03 và `spec.md` gọi input là `version:` / `publish:` /
`createGithubReleases:` — đó là tên của **v1**. Đọc `action.yml` của
`changesets/action@v2.1.1` (fetch từ raw.githubusercontent.com) thì input chỉ có
`publish-script`, `version-script`, `create-github-releases`, `commit-message`,
`pr-title`, `pr-draft`, `pr-base-branch`, `push-git-tags`, `push-with-git-cli`,
`cwd`, `github-token`. Workflow đang dùng đúng bộ kebab-case. Đổi về tên v1 =
action im lặng chạy `changeset version` mặc định và **không bao giờ publish**.

Hai thứ nữa đọc được trong `node_modules`, đều thuận:

- `@changesets/cli@3.0.1` publish bằng `exec("npm", ["publish", "--json",
  "--access", <access>, "--tag", <tag>])` trong cwd của từng package
  (`dist/getPublishPlan.mjs:239`), tức là npm CLI tự lo OIDC — đúng đường mà bước
  kiểm ≥ 11.5.1 đang bảo vệ.
- `sanitizeEnv` của nó (`getPublishPlan.mjs:97`) chỉ xoá `NPM_CONFIG_OTP` /
  `npm_config_otp`, **không** đụng `ACTIONS_ID_TOKEN_REQUEST_URL` /
  `ACTIONS_ID_TOKEN_REQUEST_TOKEN`, nên token OIDC đi lọt sang tiến trình con.
  Không có `npm whoami` ở đâu trong package, nên không có cửa nào fail sớm vì
  "chưa đăng nhập".

`.github/actions/setup-workspace` pin Node từ `.nvmrc` (24.20.0), nên npm trên
runner là bản bundled của Node 24 — dư ngưỡng trên giấy, nhưng con số thật vẫn
phải đọc từ log lần chạy đầu (bước 4 của checklist).

**Release plan — đúng `2.0.0` như ticket 03 quyết, và đó chính là vấn đề:**

```
$ bun run changeset status
🦋 changeset v3.0.1
Packages to be bumped:
- major
  - @fe-monorepo/hook
  - @fe-monorepo/ui

$ bunx changeset status --verbose
- major
  - @fe-monorepo/hook -> 2.0.0    (.changeset/tidy-donkeys-invent.md)
  - @fe-monorepo/ui   -> 2.0.0    (.changeset/quiet-pandas-repeat.md)

$ bunx changeset status --since=origin/main    # cùng kết quả, không có --verbose thì không in số
```

Hai file changeset đúng hai tên npm và đúng `major`; `packages/ui-public` khai
`1.0.2`, `packages/hook-public` khai `1.0.0` — khớp version đang sống trên npm.
Không có `@monorepo/*`, app, hay `tooling/*` nào trong plan.

**Registry, chỉ đọc (`npm view`, không login, không publish):**

| | `@fe-monorepo/hook` | `@fe-monorepo/ui` |
| --- | --- | --- |
| `dist-tags` | `{ latest: "1.0.0" }` | `{ latest: "1.0.2" }` |
| `versions` (còn sống) | `["1.0.0"]` | `["1.0.2"]` |
| `time` (đã từng publish) | chỉ `1.0.0` | `0.0.1`, `1.0.0`, `1.0.1`, **`2.0.0`**, `0.1.0`, `0.1.1`, `1.0.2` |
| maintainers | `qtuan02 <quoctuan200702@gmail.com>` | `qtuan02 <quoctuan200702@gmail.com>` |
| `_npmUser` / `_npmVersion` khi publish | `qtuan02` / npm 10.9.4 | `qtuan02` / npm 10.9.4 |
| `dist.attestations` | không có | không có |

Hai bản `1.x` đang nằm đó được publish bằng npm 10.9.4 nên **không** có provenance —
đúng như dự kiến, và cũng là lý do `verify:release` kiểm `dist.attestations`: nó
phân biệt được "publish qua trusted publishing" với "ai đó `npm publish` từ máy
mình". `npm view @fe-monorepo/ui@2.0.0` trả `E404` (đã unpublish), còn tài khoản
maintainer của hai package là **một và cùng một** — nên bước 1/2 của checklist làm
được bằng cùng một lần đăng nhập.

**Script mới `scripts/verify-release.ts` + root script `verify:release`:**

Phần dùng chung với `publish-smoke.ts` được tách ra
`scripts/lib/consumer-smoke.ts` (bảng `SHELLS`, `scaffoldConsumer`,
`assertInstalledShell`, `assertBuiltCss`, `run`/`check`/`step`/`reportFailures`),
vì hai script chỉ khác nhau ở **chỗ package đến từ đâu** — tarball `npm pack` so
với registry. Đã chạy lại `bun run publish:smoke` sau khi tách: vẫn xanh, cùng 16
dòng `ok` và cùng câu `OK - publish smoke test passed`, nên việc tách không phá
thứ đang chạy được.

`verify-release.ts` mặc định đọc version cần kiểm từ `package.json` của chính hai
shell (sau khi PR "Version Packages" merge, đó **là** version vừa release), có
`--version=<v>` để ép và `--keep` để giữ thư mục tạm. Thư mục tạm nằm trong
`os.tmpdir()` chứ không phải `/tmp` — máy dev là Windows.

Chưa chạy xanh được, và đúng ra phải vậy: `2.0.0` chưa tồn tại. Đường lỗi đã test:

```
$ bun run verify:release --version=2.0.0
> Read what the registry published
  npm view @fe-monorepo/hook@2.0.0 exited with 1
  npm error code E404 ...
  FAIL @fe-monorepo/hook@2.0.0 is on the registry
  ...
2 assertion(s) failed:
  - @fe-monorepo/hook@2.0.0 is on the registry
  - @fe-monorepo/ui@2.0.0 is on the registry
error: script "verify:release" exited with code 1
```

Gate trên phần đã thêm: `bun run check` → `Checked 492 files ... No fixes applied.`
(0 lỗi), `bun run typecheck` → 16/16 successful, và `bunx tsc -p scripts/tsconfig.json`
→ exit 0 (`scripts/` không phải workspace nên `turbo run typecheck` không với tới
nó; `scripts/tsconfig.json` đã được nới `include` cho hai file mới).

### Những việc CHỈ con người làm được, đúng thứ tự

1. ~~Quyết cách xử lý `@fe-monorepo/ui@2.0.0` đã bị đốt~~ — xong, phương án A (commit `fc94565`).
2. npmjs.com → `@fe-monorepo/ui` → Settings → Trusted publishing → GitHub Actions.
3. npmjs.com → `@fe-monorepo/hook` → Settings → Trusted publishing → GitHub Actions.
4. GitHub → Settings → Actions → General → "Allow GitHub Actions to create and
   approve pull requests".
5. Merge vào `main`, rồi merge PR `chore(release): version packages`.

### Sau khi người làm xong (agent điền)

_Chưa chạy._ Dán vào đây: URL hai run `release.yml`, số PR "Version Packages", số
npm của runner, output `bun run verify:release`.

### Đọc version ở đâu — hai luật ngược nhau, cả hai đều đúng

Ghi lại vì hai luật này nhìn như mâu thuẫn (cùng nói về
`packages/*-public/package.json`) và rất dễ áp nhầm chỗ:

| | Đọc version từ đâu | Vì sao |
| --- | --- | --- |
| `scripts/verify-release.ts` | **manifest của shell** | Chạy *sau* khi PR "Version Packages" merge, trên `main` đã pull — lúc đó manifest chính là version đã publish. Và nó là nguồn duy nhất không mục khi hai shell trôi số khác nhau; số hard-code sẽ sai ở lần release kế tiếp. |
| Trang cài đặt của `apps/documents` (topic `legacy-migrate`) | **không đọc manifest** | Render *trước* khi PR đó merge, nên manifest đang là số sẽ **không bao giờ tồn tại** trên npm (hôm nay `ui-public` ghi `2.0.0`, bản publish là `3.0.0`). Trang đó dùng `bun add @fe-monorepo/ui` không kèm version. |

Khác nhau ở **thời điểm đọc so với lúc merge PR Version Packages**, không phải ở
file. Hệ quả thứ hai: hai shell nay khác major (`ui` `3.0.0`, `hook` `2.0.0`),
nên không có "một version dùng chung" — `bun add @fe-monorepo/ui@^3
@fe-monorepo/hook@^3` là sai âm thầm. Vì thế `verify:release` bỏ cờ `--version=`
và chỉ nhận `--ui-version=` / `--hook-version=` (commit `81ae2a0`).

### Assert provenance đã được chứng minh là có phân biệt

Chạy `bun run verify:release` lúc chưa release: nó đọc `hook@1.0.0` từ manifest,
tìm thấy bản legacy đó trên npm, và **fail** đúng ở `dist.attestations`. Đó là
câu trả lời đúng — `1.0.0` ngày xưa publish bằng token, không phải trusted
publishing. Nghĩa là một dòng provenance xanh ở bước 6 thật sự có ý nghĩa, chứ
không phải assert gật bừa mọi thứ nó tìm thấy.
