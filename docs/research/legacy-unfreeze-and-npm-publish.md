# Mở băng `legacy/` và publish npm trở lại — khảo sát hiện trạng trước khi viết spec

> Ngày kiểm tra: **2026-09-04**, nhánh `feat/upgrade`, HEAD `7a882ac`. Nguồn: chỉ primary sources — file thật trong repo (đường dẫn kèm số dòng), `git log`/`git show` (kèm hash), `npm view` trên registry, tarball thật của `@changesets/cli@3.0.1` và các package con (`npm pack` rồi grep), và docs chính chủ của Changesets, `changesets/action`, Bun, npm. Mọi claim có citation; chỗ chưa verify được ghi rõ **"chưa xác minh"**.
>
> **Phạm vi:** đây là bước khảo sát cho sáu yêu cầu của chủ repo (changeset → npm; `ui-public`/`hook-public`; bốn app còn nằm trong `legacy/`; "mang docs ra ngoài"; ticket còn thiếu; vòng verify). Không có file nào ngoài note này được sửa. Kết luận ở đây là đầu vào cho một phiên `/grill-with-docs` → `/to-spec`, không thay thế nó.

## Tóm tắt kết luận

**Đúng ở thời điểm này:**

1. **Không còn dấu vết nào của changesets trong Skeleton.** `legacy/.changeset/` chỉ có `README.md` boilerplate và một `config.json` (schema `@changesets/config@3.1.1`, `access: public`, `ignore: ["@monorepo/documents"]`), không có changeset nào đang chờ. `@changesets/cli` không có trong `package.json` root, `grep -c changesets bun.lock` = 0, `.github/workflows/` chỉ có `ci.yml` và không có chữ `publish`/`NPM_TOKEN` nào. (§1)
2. **`legacy/ui-public` và `legacy/hook-public` là hai "vỏ publish", không phải hai package có source.** Trong git mỗi thư mục chỉ có `package.json` + `README.md`; thư mục `dist/` đang nằm trên đĩa là artefact build cũ **không được track** (`.gitignore:40` `dist/`). Source và bước build (rslib, `scripts/copy-dist.js`) nằm ở `packages/ui`/`packages/hook` **cũ**, đọc được ở commit `7edc303`. Cả hai tên đã có trên npm: `@fe-monorepo/ui@1.0.2` (2025-11-25), `@fe-monorepo/hook@1.0.0` (2026-01-07), mỗi cái đúng một version. (§2)
3. **Changesets 3.0.1 không biết Bun và không biết `catalog:`.** `PublishTool` là union đóng `npm | pnpm | yarn`; với workspace Bun, `getPublishTool` rơi về `npm publish`. `bun publish`/`bun pm pack` thì có strip `catalog:` và `workspace:`, còn `npm publish` không có khái niệm đó. Không một byte "catalog" nào trong năm package của changesets đã grep. (§1)
4. **Chưa có ticket migrate nào.** `.agents/plans/` chỉ có topic `personal-monorepo-rebuild` (13 ticket + `spec.md` + `decisions.md`); spec đó ghi rõ migrate legacy và publish npm là **Out of Scope**. (§3, §5)
5. **Gate đã xanh thật trên CI** (run #2, commit `d964157`: 6/6 job, 0 annotation); còn treo duy nhất `docker build` (ticket 12 `ready-for-human`) và ba khoản kỹ thuật ở ticket 13 (`ready-for-agent`). (§6)

**Mâu thuẫn với quyết định đã ghi — phải giải bằng ADR/spec, không phải bằng một PR:**

- Yêu cầu 1 và 2 (publish npm, hai package `-public`) **đảo ngược decision 3** ("Publish npm: **Bỏ**. Mọi package `private: true`, source-only… rslib/changesets không có trong Skeleton") — được lặp ở `spec.md` US9 + Out of Scope, `legacy/README.md` ("Publishing is dropped, see decision 3"), `README.md:121` ("Nothing here is published to npm"), `.agents/commands.md` § Build, và CLAUDE.md §1 (`packages/` "ALL `private: true`, source-only"). Theo CLAUDE.md §8, một quyết định kiến trúc đổi chiều cần một ADR mới (`docs/adr/0004-…`) và sửa §1/§3 của CLAUDE.md.
- Yêu cầu 3 ("`apps/` thiếu bốn app") **không** mâu thuẫn với ADR-0001 *nếu* hiểu là "migrate từng app qua ticket riêng, clone từ Template rồi đổ business code vào" — đó chính là đường ADR-0001 và `legacy/README.md` đã vạch. Nó **chỉ** mâu thuẫn nếu hiểu là "`git mv legacy/<app> apps/<app>`": đó đúng là phương án ADR-0001 đã cân nhắc và loại ("Giữ trong `apps/` và loại khỏi Gate bằng `--filter`… '0 lỗi 0 warning' không đạt được thật").
- Yêu cầu 4 ("mang docs ra ngoài") chạm `legacy/README.md` dòng "`docs/` — rewritten per app as it migrates; `docs/` at the root is now ADRs, agent docs and research" và CLAUDE.md §7b ("Architecture and design docs go to `docs/`"). Không có `docs/guides/` hay chỗ nào cho "hướng dẫn dùng app" — cần quyết định điểm đến trước khi di chuyển.

---

## §1. `.changeset` để publish npm

### 1.1 Hiện trạng trong repo

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| `.changeset/` cũ ở đâu? | `legacy/.changeset/` — chuyển tới đó ở commit `1c9eaa1` ("rebuild the root on Bun…, freeze legacy apps") | `git log --oneline -- legacy/` |
| Trong đó có gì? | `README.md` (518 B, boilerplate của `changeset init`) và `config.json` (303 B). **Không có** file changeset `.md` nào đang chờ | `ls -la legacy/.changeset/` |
| `config.json` nói gì? | `$schema` `@changesets/config@3.1.1`, `changelog: @changesets/cli/changelog`, `commit: false`, `access: public`, `baseBranch: main`, `updateInternalDependencies: patch`, `ignore: ["@monorepo/documents"]` | `legacy/.changeset/config.json` |
| Lịch sử changeset | Chỉ từng có hai file: `.changeset/giant-wasps-ask.md` (target `@monorepo/prettier-config: patch`) và `good-lines-stay.md` (target `"@fe-monorepo/ui-public": major` — một tên package **chưa bao giờ tồn tại**); cả hai thêm ở `e609614`, xoá ở `7837e77` | `git log --all --diff-filter=A --name-only -- '.changeset/*.md'`; `git show e609614:.changeset/*.md` |
| `@changesets/cli` ở root? | **Không.** Root `package.json` `devDependencies` = biome, tsconfig, `@turbo/gen`, `@types/node`, turbo, typescript. `bun.lock` không chứa chuỗi `changesets` | `package.json`; `grep -c changesets bun.lock` → `0` |
| Root cũ có gì? | `@changesets/cli ^2.27.9` + script `changeset`, `changeset:version`, `changeset:publish`, `build:package:ui`, `build:package:hook` | `git show 7edc303:package.json` |
| Workflow publish? | **Không.** `.github/workflows/` chỉ có `ci.yml`; `grep -rn "publish\|NPM_TOKEN\|changeset" .github/` không ra gì. Từng có `.github/workflows/deploy-vercel-manual.yml` (thêm `a5498c2`, xoá `259a942`) — deploy Vercel, không phải npm | `ls .github/workflows/`; `git log --all --name-status -- .github/workflows/deploy-vercel-manual.yml` |
| Version latest | `@changesets/cli` **3.0.1** (npm, `time.modified` 2026-08-19); `@changesets/config` **4.0.0** → `config.json` cũ đang trỏ schema 3.1.1 | `npm view @changesets/cli version time.modified`; `npm view @changesets/config version` |

Tài liệu cũ `legacy/docs/others/CHANGESET.md` mô tả quy trình pnpm: `pnpm changeset` → `pnpm changeset:version` → `pnpm build:package:ui` (rslib + copy dist sang `-public`) → `pnpm changeset:publish`. Quy trình này có một lỗ hổng đã lộ ngay trong tài liệu: bước "Select package" chọn `@monorepo/ui`/`@monorepo/hook` (private, không publish) trong khi thứ được version/publish là `@fe-monorepo/ui`/`@fe-monorepo/hook` — hai tên không liên hệ gì với nhau trong graph của changesets, nên `changeset version` không thể tự bump đúng package.

### 1.2 Một setup chạy được cần gì (theo docs chính chủ)

**`config.json`** ([docs/config-file-options.md](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md)):

- `ignore` — "those changesets will be skipped until they are removed from this array"; **hai ràng buộc**: "If the package is mentioned in a changeset that also includes a package that is not ignored, publishing will fail" và "If the package requires one of its dependencies to be updated as part of a publish, publishing will also fail". Docs nói thẳng nó "DESIGNED FOR TEMPORARY USE" — loại trừ vĩnh viễn thì dùng `private: true`, không dùng `ignore`. → `ignore: ["@monorepo/documents"]` trong config cũ là dùng sai công cụ; app đã `private` rồi.
- `privatePackages` — mặc định `{ version: false, tag: false }`: package `private` không được version, không được tag. Với repo này (8 package private + 3 app private) mặc định đó là thứ ta muốn.
- `access` — mặc định `"restricted"`; `"public"` cho scope public. `publishConfig.access` trong từng `package.json` ghi đè.
- `updateInternalDependencies` — `"patch"` cập nhật range của dependent ở mọi patch; Changesets luôn cập nhật khi range cũ không còn thoả.

**`changeset version`** — cập nhật `version`, viết `CHANGELOG.md`, xoá file changeset ([docs/command-line-options.md](https://github.com/changesets/changesets/blob/main/docs/command-line-options.md)). Với `workspace:` range: giữ nguyên tiền tố `workspace:` khi ghi range mới, và bỏ qua `workspace:*`/`^`/`~` (mã nguồn `packages/apply-release-plan/src/version-package.ts`, hàm `getDependencyVersionEdits`, qua Context7).

**`changeset publish`** — "going into each package, checking if the version it has in its `package.json` is published on npm, and if it is not, running the `npm publish`"; tạo git tag, **không** push tag. Flag: `--otp`, `--tag`, `--from-pack-dir <dir>`, `--git-tag` (mặc định true). CLI 3.0.1 có thêm lệnh `pack`, `publish-plan`, `git-tag` (đọc từ `dist/index.mjs` trong tarball; docs `command-line-options.md` **chưa** liệt kê `pack`/`git-tag`).

**`changesets/action` v2** ([action.yml](https://raw.githubusercontent.com/changesets/action/main/action.yml), [README](https://raw.githubusercontent.com/changesets/action/main/README.md)): input `publish-script` ("The command to use to build and publish packages"), `version-script` (mặc định `changeset version`), `commit-message`/`pr-title` (mặc định "Version Packages"), `pr-draft`, `pr-base-branch`, `create-github-releases` (true), `push-git-tags` (true), `push-with-git-cli`, `cwd`, `github-token`; output `published`, `published-packages`, `has-changesets`, `pr-number`; chạy trên Node 24. Yêu cầu: repo đã checkout **và `@changesets/cli` đã cài**; permission `contents: write`, `pull-requests: write`, `id-token: write` "if using trusted publishing"; bật "Allow GitHub Actions to create and approve pull requests" trong Settings → Actions → General. "Setting the `GITHUB_TOKEN` environment variable does not configure the action" — token tuỳ chỉnh phải đi qua input `github-token`.

**Auth và provenance** ([changesets.dev/guide/automating](https://changesets.dev/guide/automating), [docs.npmjs.com/trusted-publishers](https://docs.npmjs.com/trusted-publishers), [docs.npmjs.com/generating-provenance-statements](https://docs.npmjs.com/generating-provenance-statements)):

- Changesets khuyên **trusted publishing (OIDC)**; token-based "is no longer recommended" (token hết hạn 90 ngày, token bypass-2FA bị deprecate). Mẫu token-based vẫn có: `actions/setup-node` với `registry-url: https://registry.npmjs.org/` + `env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` trên step `changesets/action/publish@v2`; `.npmrc` là `//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`.
- Trusted publishing: npm CLI **≥ 11.5.1**, Node **≥ 22.14.0**, cấu hình **trên npmjs.com theo từng package** (điền đúng **tên file workflow**, ví dụ `release.yml`), job cần `id-token: write`; provenance được sinh **tự động** nhưng chỉ khi "Publishing from a public repository, Publishing a public package". Provenance thủ công: npm ≥ 9.5.0, `npm publish --provenance` hoặc `NPM_CONFIG_PROVENANCE=true` hoặc `publishConfig.provenance: true`, và `package.json` phải có `repository` **public, khớp case-sensitive**.
- **Chưa xác minh:** version npm đi kèm Node 24.20.0 trên runner có ≥ 11.5.1 không — cần `npm --version` trong job trước khi chốt trusted publishing.

### 1.3 Caveat Bun + `catalog:` + `workspace:` — đây là chỗ quyết định công cụ

Đọc thẳng trong tarball `@changesets/cli@3.0.1` (`dist/getPublishPlan.mjs:553-565`):

```js
async function getPublishTool(packages) {
	let packageManager = packages.tool.type;
	if (!["npm","pnpm","yarn"].includes(packageManager))
		packageManager = (await detect({ cwd: packages.rootDir }))?.name ?? "npm";
	if (packageManager === "pnpm") return pnpm_exports;
	if (packageManager === "yarn") { /* berry only */ return yarn_exports; }
	return npm_exports;
}
```

- `packages.tool.type` đến từ `@manypkg/get-packages` (`^3.1.0`), và `@manypkg/tools` **có** `BunTool` (`type: "bun"`, nhận diện qua `bun.lockb`/`bun.lock` — `dist/manypkg-tools.js:117-137`). Với repo này type là `"bun"` → không nằm trong danh sách → `detect()` của `package-manager-detector` cũng trả `bun` → không phải pnpm, không phải yarn → **`npm_exports`**, tức `exec("npm", ["publish", …])` (`getPublishPlan.mjs:239`). `PublishTool` là union đóng `"npm" | "pnpm" | "yarn"` (`packages/cli/src/lib/types.ts`), không có chỗ cắm bun.
- `changeset pack` cũng gọi `publishTool.pack` → `npm pack` (`dist/pack.mjs`), nên đường `pack` → `publish --from-pack-dir` **không** né được npm.
- `grep -rni catalog` trên tarball của `@changesets/cli@3.0.1`, `get-dependents-graph@3.0.0`, `assemble-release-plan@7.0.0`, `apply-release-plan@8.0.0`, `should-skip-package@1.0.0` → **0 kết quả**. CHANGELOG của `cli` và `get-dependents-graph` cũng không có entry nào về "catalog" hay "bun" (chỉ có `workspace:` từ 1.1.0/1.2.3). Không tìm thấy issue nào với query `is:issue catalog: bun` trong `changesets/changesets`.
- Hệ quả cụ thể: `changeset version` chạy được trên workspace Bun (nó chỉ sửa JSON); nhưng **`changeset publish` sẽ để nguyên chuỗi `catalog:`/`workspace:*` trong `package.json` được publish**, vì `npm publish` không biết hai protocol đó. **Chưa xác minh bằng cách chạy thật** — suy ra từ mã nguồn trên + việc npm không có protocol này; ticket nên có một `npm publish --dry-run` hoặc `bun pm pack` để nhìn tarball trước khi tin.
- `get-dependents-graph` có `isProtocolRange = range.includes(":")` và đánh `valid = false` cho một dependency **nội bộ workspace** không dùng `workspace:` mà có dấu `:` (`dist/index.mjs:30,76`). Dependency ngoài (`react: catalog:react19`) bị `if (!match) continue` bỏ qua → `catalog:` **không** làm hỏng graph; chỉ cần dependency nội bộ vẫn là `workspace:*` (đúng như `packages/ui` → `@monorepo/hook` hiện tại).

Phía Bun ([bun.sh/docs/cli/publish](https://bun.sh/docs/cli/publish), [bun.sh/docs/install/catalogs](https://bun.sh/docs/install/catalogs)): "`bun publish` packs your package into a tarball and **strips catalog and workspace protocols from the `package.json`, resolving versions if necessary**"; "When you run `bun publish` or `bun pm pack`, Bun replaces `catalog:` references in your `package.json` with the resolved version numbers". Token qua `NPM_CONFIG_TOKEN`; có `--dry-run`, `--tag`, `--access`, `--otp`. **Không có** `--provenance` (issue [oven-sh/bun#15601](https://github.com/oven-sh/bun/issues/15601), open) và **không** hỗ trợ OIDC trusted publishing ([#22423](https://github.com/oven-sh/bun/issues/22423), open).

**Ba đường khả dĩ, mỗi đường mất một thứ:**

| Đường | Được | Mất |
|---|---|---|
| A. Changesets cho `version` + changelog + `git-tag`; **`bun publish`** từng package trong `publish-script` của action | `catalog:`/`workspace:` được strip đúng; một lệnh mỗi package | Không có provenance/OIDC (Bun chưa hỗ trợ) → phải dùng `NPM_TOKEN` 90 ngày; `changeset publish` không được gọi nên phải tự lo "đã publish chưa" (Bun trả lỗi khi version trùng — đủ dùng nếu chỉ hai package) |
| B. Changesets trọn bộ, `npm publish` | Trusted publishing + provenance | **Không được** dùng `catalog:`/`workspace:` trong package publish: peer/deps viết range literal, và không được depend `workspace:*` vào package private nào — nghĩa là `packages/ui` không được import `@monorepo/hook` |
| C. `changeset pack` → không đi | — | `pack` cũng là `npm pack`, cùng vấn đề với B |

Đường B chỉ khả thi nếu chấp nhận hard-code version trong hai package publish (mất chính lợi ích catalog) — với hai package thì chi phí nhỏ, và có thể giữ `catalog:` cho `devDependencies` (npm không đưa devDependencies vào tarball, còn peer/dependencies phải là literal). Đây là câu hỏi cho phiên grill, không quyết ở đây.

## §2. `packages/ui-public` và `packages/hook-public`

### 2.1 Hai package hôm nay là gì

| | `legacy/ui-public` | `legacy/hook-public` |
|---|---|---|
| `name` / `version` | `@fe-monorepo/ui` / `1.0.2` | `@fe-monorepo/hook` / `1.0.0` |
| `private` | không có (publish được) | không có |
| `license` / `type` | MIT / `module` | MIT / `module` |
| `publishConfig` | `{ access: "public" }` | `{ access: "public" }` |
| `files` | `dist`, `README.md`, `package.json` | như bên |
| `exports` | `.` (types/require/import/default → `dist/index.*`), `./libs/*`, `./components/*`, `./globals.css` | `.`, `./hooks/*` |
| `peerDependencies` | `react >=18`, `react-dom >=18` | `react >=18`, `react-dom >=18` |
| `dependencies` | 26 gói `@radix-ui/*`, `cmdk`, `date-fns`, `input-otp`, `next-themes`, `react-day-picker ^9`, `react-resizable-panels ^3`, `vaul`, và **8 entry `catalog:`** (`@hookform/resolvers`, `class-variance-authority`, `embla-carousel-react`, `lucide-react`, `react-hook-form`, `sonner`, `tailwind-merge`, `zod`) trỏ vào pnpm catalog **không còn tồn tại** | không có |
| Build script / tsconfig / src / test | **không có gì** — thư mục chỉ có `package.json`, `README.md` (+ `dist/` **untracked**) | như bên |
| `dist/` trên đĩa | `index.{js,cjs,d.ts}`, `globals.css`, `components/` (168 file), `libs/cn.*` | `index.*`, `hooks/` (14 hook × 4 file) |
| Đã publish? | **Có**: `versions = ['1.0.2']`, `dist-tags.latest 1.0.2`, `time.modified 2025-11-25` | **Có**: `versions = ['1.0.0']`, `time.modified 2026-01-07` |
| README | Radix + shadcn, hướng dẫn `@import "@fe-monorepo/ui/globals.css"`, `next-themes`, import barrel `from "@fe-monorepo/ui"` hoặc `/components/button`, `/libs/cn` | 14 hook (`useIsClient`, `useLocalStorage`, `useFetch`, `useCountdown`, …) |

`git ls-files legacy/ui-public/dist legacy/hook-public/dist` → **0** — `dist/` chỉ có trên máy này. `packages/ui-public/CHANGELOG.md` từng xuất hiện trong lịch sử (`git log --all --name-only`) nhưng không còn trong cây; lịch sử release thực chất chỉ còn trên registry.

**Bước build thật nằm ở package cũ** (`git show 7edc303:packages/ui/package.json`): `"build:package": "rslib build && node scripts/copy-dist.js"`, `@rslib/core 0.17.0` + `@rsbuild/plugin-react 1.4.1` (pnpm catalog cũ). `rslib.config.ts`: entry `./src/**` (ui loại `src/v1/**`), `tsconfigPath ./tsconfig.build.json`, hai target `esm` (dts: true) + `cjs`, `bundle: false`, `minify: true`, `distPath ./dist`, `pluginReact()`. `tsconfig.build.json` bật `declaration`, `declarationMap`, `outDir ./dist`, paths `@/*`. `scripts/copy-dist.js` `cpSync` `../dist` → `../../ui-public/dist`. Và `packages/ui` cũ có **barrel** `src/index.ts` (46 dòng `export * from "./components/…"`) — thứ mà rule `quality-avoid-barrel-imports` cấm.

### 2.2 So với `packages/ui` và `packages/hook` hiện tại

| | `packages/ui` (nay) | `packages/hook` (nay) |
|---|---|---|
| `private` | `true` | `true` |
| `exports` | `./components/*` → `src/components/*.tsx`, `./utils/*` → `src/utils/*.ts` (không root entry) | `./*` → `src/*.ts` |
| `imports` (nội bộ) | `#components/*`, `#hooks/*` (landing pad, thư mục không tồn tại), `#utils/cn` | — |
| deps | `@base-ui/react catalog:`, **`@monorepo/hook: workspace:*`**, `@shadcn/react`, `@tanstack/react-table catalog:tanstack-table9`, cva, clsx, cmdk, date-fns, embla, input-otp, `lucide-react catalog:`, `react-day-picker ^10`, `react-resizable-panels ^4`, `recharts`, `tailwind-merge catalog:` | không có |
| peer | `react: catalog:react19` | `react: catalog:react19` |
| script | typecheck, test (Vitest, utils only), `ui-add`, `guard:no-local-hooks` — **không có build** | typecheck — không có build, không có test |
| tsconfig | extends **`@monorepo/tsconfig/compiled-package.json`** (duy nhất trong workspace) | extends `base.json` |
| nội dung | 63 primitive base-vega trên Base UI (CLAUDE.md §1) | **5** hook (`use-copy-to-clipboard`, `use-debounce`, `use-is-mobile`, `use-isomorphic-layout-effect`, `use-media-query`) — bản cũ có 14 |

**`tooling/typescript/compiled-package.json`** — nội dung thật:

```json
{ "extends": "./base.json",
  "compilerOptions": { "plugins": [{ "name": "next" }], "module": "ESNext",
    "moduleResolution": "Bundler", "allowJs": true, "jsx": "preserve", "noEmit": true } }
```

Tên gợi "package được compile" nhưng nó **`noEmit: true`** và cắm plugin `next`; research note trước (`docs/research/personal-monorepo-rebuild.md:261`) ghi nó là biến thể "dùng riêng cho app Next.js" mà reference không có. Hôm nay thứ duy nhất extends nó là `packages/ui/tsconfig.json` (để có `jsx: preserve` cho `.tsx`), trong khi `apps/_template_next/tsconfig.json` extends `base.json`. Nó **không** sinh được `dist/` — thiếu `declaration`, `outDir`, và `base.json` còn bật `allowImportingTsExtensions` (chỉ hợp lệ khi `noEmit`). Nếu publish quay lại, cần một tsconfig build riêng (hoặc một bundler tự lo dts), và nên đổi tên/ghi rõ vai trò của file này trong CLAUDE.md §1.

**Một package publish được cần thêm gì so với `ui`/`hook` hiện tại** (tổng hợp từ 2.1 và §1.3):

1. Bỏ `private: true` (hoặc giữ private cho bản nguồn và tạo lại "vỏ" — nhưng mô hình vỏ + copy dist là thứ đã sinh ra lỗi "chọn package sai" ở §1.1; nếu làm lại, publish thẳng từ `packages/hook`/`packages/ui` và để tên npm khác tên workspace qua `name`).
2. `version`, `repository` (bắt buộc cho provenance), `files`, `sideEffects` (`false`, trừ file CSS nếu ship), README.
3. Một bước **build → `dist/`** (JS + `.d.ts`) và `exports` trỏ vào dist với condition `types`. Công cụ chưa chốt: rslib 1.0.0 (research trước), `tsdown`, hay `bun build` + `tsc --emitDeclarationOnly` — **chưa xác minh** cái nào chạy với TypeScript 7 (tsgo); `tsc --noEmit` đã chứng minh chạy, `emitDeclarationOnly` thì chưa.
4. `exports` hiện trỏ `.tsx` — với dist phải đổi đuôi; subpath imports `#components/*` là chuẩn Node nên vẫn dùng được trong package publish, **nhưng** phải map sang `./dist/...` và `#hooks/*` (thư mục không tồn tại) phải bỏ khỏi bản publish.
5. `peerDependencies` literal (`react: ">=19"`), không `catalog:` (xem §1.3 đường B) — hoặc chấp nhận đường A với `bun publish`.
6. `packages/ui` depend `@monorepo/hook: workspace:*` → npm không cài được package private: hoặc publish `hook` trước và `ui` depend theo version, hoặc inline hook vào ui.
7. Tailwind: `packages/ui` dựa `@monorepo/tailwind-config` (theme + hai `@custom-variant data-horizontal/data-vertical` load-bearing — rule `architecture-ui-primitives`). Bản cũ ship `dist/globals.css`; bản mới phải quyết ship CSS nào, và consumer phải khai `@source` cho Tailwind v4 quét class trong `node_modules` — **chưa xác minh** cách reference/shadcn khuyên.
8. `turbo.json` root đã có `build.outputs: ["dist/**"]` và `.gitignore` đã có `dist/` — hạ tầng cache có sẵn; chỉ thiếu task `build` trong hai package.
9. Rule "no barrel" (decision 3, `quality-avoid-barrel-imports`): consumer ngoài thường muốn root entry; nếu thêm `index.ts` cho bản publish thì phải ghi ngoại lệ vào rule (research trước §0.5 đã lường: "rule 'no barrel'… **không** áp cho hai package đó").

## §3. `apps/` thiếu `assistant-ai`, `documents`, `mcp`, `portfolio`

### 3.1 Điều đã được quyết

- **ADR-0001** (`docs/adr/0001-legacy-apps-outside-workspace.md`): sáu app + hai package `-public` "được chuyển nguyên vào `legacy/`, thư mục **không** nằm trong `workspaces.packages`… **mỗi app quay lại `apps/` bằng một ticket migrate riêng**". Phương án bị loại: "Giữ trong `apps/` và loại khỏi Gate bằng `--filter` của Turbo: `bun install` vẫn resolve chúng, catalog phải chứa đồng thời Next 15/16 và Storybook 8/10, và '0 lỗi 0 warning' không đạt được thật". Hệ quả ghi nhận: "không có gì trong repo ngăn nó thối dần".
- **`legacy/README.md`**: "Each app comes back into `apps/` through its own migrate ticket, **cloned onto the Template app for its Runtime and then re-populated with its business code**." Bảng app → Runtime → Template: `portfolio`/`assistant-ai`/`mcp` → Next.js → `apps/_template_next`; `documents` → Vite client → `apps/_template_vite`; `_template` cũ → "migrate nothing, delete once the other four are done"; `storybook` cũ → đã dựng lại. Migrate = bỏ pnpm/ESLint/Prettier/rslib/changesets, không khôi phục.
- **`spec.md` Out of Scope**: "Migrate bất kỳ Legacy app nào… mỗi cái là ticket riêng sau Skeleton, gồm cả quyết định `middleware.ts` vs `proxy.ts` và bộ `ai@7` cho assistant-ai." **`decisions.md` § Chưa quyết**: bộ `ai@7`; Edge runtime cho middleware.
- **`.agents/knowledge-base.md:229-236`**: "Do not mine a legacy app for terminology, patterns, or 'how we do X here'".

Vậy "move them into `apps/`" **không** trái ADR-0001 nếu làm qua ticket migrate (clone Template → đổ code). Nó trái ADR-0001 nếu `git mv` nguyên khối. Để thay đổi điều đó cần một ADR mới ghi `status: superseded`/`supersedes` (ADR có `status` front-matter theo CLAUDE.md §8) và phải trả lời lại đúng câu ADR-0001 đã hỏi: catalog phải chứa Next 15 lẫn 16, Vite 6 lẫn 8, và Gate đỏ.

### 3.2 Bốn app, đo từ `package.json` và cây thư mục

Version cụ thể của các `catalog:` cũ lấy từ `git show 7edc303:pnpm-workspace.yaml` (catalog `next15`: next 15.4.8, `@t3-oss/env-nextjs` 0.13.8, jiti 2.6.1, `@sentry/nextjs` ^10.25.0, `@next/third-parties` 15.4.8; catalog mặc định: vite ^6, plugin-react ^4.3, react-router ^7, vitest ^2.1, jsdom ^25, zod 4.1.13, zustand ^5.0.8, motion ^12, lucide 0.536, TS ^5.8).

| | `portfolio` | `assistant-ai` | `mcp` | `documents` |
|---|---|---|---|---|
| Framework | Next **15.4.8** (`catalog:next15`), `next.config.js` + jiti import `./src/env` | Next 15.4.8, `next.config.ts` + jiti `./env` | Next 15.4.8, `next.config.ts` | Vite **^6** + `@vitejs/plugin-react ^4`, React Router **^7**, Vitest ^2, jsdom ^25 |
| Runtime (vocab repo) | Next App Router (`src/app/`) — khớp `_template_next` | Next App Router (`app/` ở root, không `src/`) — khớp `_template_next` | **Next nhưng thực chất là server**: `src/app/api/mcp/route.ts` dựng `McpServer` + `StreamableHTTPServerTransport`; `page.tsx` chỉ là placeholder tĩnh. `_template_next` mang theo `[locale]`, next-intl, `proxy.ts`, session guard — không cái nào cần. Cần quyết định: clone Template rồi gỡ, hay một Runtime server thuần (chưa có trong `CONTEXT.md`) | Vite client SPA — khớp `_template_vite` |
| Cấu trúc | `src/{app,components,constants,features,utils}`, `src/middleware.ts`, `instrumentation*.ts`, `sentry.{server,edge}.config.ts`, `Dockerfile`, `public/` ảnh, `app/{[...rest],global-error,manifest.ts,not-found,provider,robot.ts,sitemap.xml/route.ts}` | `app/{api/chat/route.ts,assistant.tsx,layout,page}`, `components/`, `constants/models.ts`, `lib/mcp-client.ts`, `stores/model-store.ts` | `src/app/{layout,page,api/mcp/route.ts}`, `src/types/weather.ts`, `src/utils/openweathermap.ts` | `src/{app.tsx,main.tsx,components,constants,contexts,hooks,pages,types,utils}`, `tests/{components,lib,pages}`, `src/test/setup.ts`, `Dockerfile`, `vercel.json` |
| Env schema | `src/env.ts`: `@t3-oss/env-nextjs` với `extends: [envBase]` từ `@monorepo/env` **cũ** (shape không còn), `server: {}`, `client: {}` | `env.ts` cùng shape, server `GOOGLE_GENERATIVE_AI_API_KEY`, `MCP_DOMAIN` (optional) | `env.ts` cùng shape, server `OPENWEATHERMAP_API_KEY` | **không có** `env.ts`; `vite.config.ts` `envPrefix: "VITE_"` (Skeleton dùng `PUBLIC_`), docs nói dùng `@monorepo/env/vite` với `VITE_DOCUMENTS_DOMAIN`/`VITE_STORYBOOK_DOMAIN` |
| Test | không | không | không | có: 10+ file dưới `tests/components/*.test.tsx` (+ `lib`, `pages`), `vitest.config.ts` — **layout `tests/` khác quy ước `test/` soi gương `src/`** |
| Port | `next dev` mặc định 3000 | 3000 (`legacy/docs/apps/ASSISTANT-AI.md`) | docs nói `localhost:3001/api/mcp` | `server.port: 3000` — **trùng `_template_vite`** (ticket 13 §1) |
| Deps lệch catalog hiện tại | `@monorepo/sentry` (API cũ `Sentry.withSentryConfig` → nay `withSentry`, `initSentry*`), `@next/third-parties 15.4.8` (catalog `next16` 16.3.4), `next-themes ^0.4.6`, `react-markdown ^9.1.0` (research trước: 10 bỏ `className`), `motion` (không có trong catalog) | `ai ^5.0.95` → 7, `@ai-sdk/google ^2` → 4, `@assistant-ui/react ^0.11.39` → 0.15.x, `react-ai-sdk ^1.1.11` → ≥1.4, `react-markdown ^0.11.4`, `@modelcontextprotocol/sdk ^1.0.4`, `@radix-ui/react-slot` (Radix — cấm theo decision), `motion`, `zustand catalog:` (nay 5.0.15), `remark-gfm` | `@modelcontextprotocol/sdk ^1.0.4`, `zod catalog:` (4.1 → 4.5, research trước ghi zod 4.5 có soundness fix) | `react-router ^7` → 8.3.1 (import từ `react-router`, không `react-router-dom`), Vitest 2 → 5 (`clearMocks` mặc định true, `vi.mock` top-level), jsdom 25 → 30, `@monorepo/hook`/`@monorepo/ui` shape cũ |
| Ràng buộc riêng | `src/middleware.ts` → `proxy.ts` (Node runtime, decision 13); Sentry DSN cũ theo app (`NEXT_PUBLIC_SENTRY_PORTFOLIO_DSN`) vs `.env.example` mới chỉ có một `NEXT_PUBLIC_SENTRY_DSN`; `vercel.json` | Phụ thuộc `mcp` qua `MCP_DOMAIN` (e2e thật cần cả hai); `app/` ở root sẽ phải về `src/app/[locale]` nếu clone Template | Chỉ một route handler; không i18n, không auth | Nội dung là **metadata của ui/hook cũ**: `constants/components.json`, `hooks.json`, `registry.tsx` mô tả 42 component Radix + 14 hook → phải sinh lại cho 63 primitive Base UI + 5 hook; `dist/`, `.cache/`, `.turbo/` trên đĩa đều untracked |

Ba thư mục `legacy/portfolio`, `legacy/assistant-ai`, `legacy/mcp` có `vercel.json`; `legacy/.env` (887 B, untracked) còn để boot app cũ (`legacy/README.md`).

### 3.3 Ticket migrate đang có

**Không có.** `find .agents/plans -type f` chỉ trả topic `personal-monorepo-rebuild` (13 ticket + `spec.md` + `decisions.md`) và `.gitkeep`. Không ticket nào có chữ "migrate" trong tên; `git log --diff-filter=A -- .agents/plans/` chỉ có ba commit (`125dc9c`, `86cbe87`, `d964157`). Bảng ticket đầy đủ ở §5.

## §4. "Mang docs ra ngoài" — inventory `legacy/docs/`

Cây hiện tại: `legacy/docs/README.md`, `apps/{ASSISTANT-AI,DOCUMENTS,MCP,STORYBOOK}.md`, `packages/{DATABASE.MD,SENTRY.md}`, `others/CHANGESET.md` — **8 file**. `docs/` mới ở root: `adr/` (0001–0003), `agents/` (`issue-tracker.md`, `triage-labels.md`, `domain.md`), `research/` (1 file + note này). Không có chỗ nào cho "hướng dẫn dùng/vận hành một app" ngoài README của chính app (`apps/_template_next/README.md` có; `apps/_template_vite` **không có** README).

| File (dòng) | Nội dung | Bị thay thế bởi | Đề xuất | Lý do |
|---|---|---|---|---|
| `README.md` (224) | Mục lục docs cũ, lệnh `pnpm dev:<app>`, bảng app/package, quy ước viết docs | `README.md` root, CLAUDE.md §1/§6, `.agents/commands.md` | **Để đóng băng**, xoá cùng `legacy/` khi rỗng | Trỏ tới `others/VERCEL-DEPLOY.md` (xoá ở `7edc303`) và `packages/db` (xoá ở `35fdd18`) — link chết sẵn; toàn bộ lệnh là pnpm |
| `apps/ASSISTANT-AI.md` (33) | API key Gemini, kiến trúc `/api/chat`, model `gemini-2.5-flash` | chưa có gì | **Gộp vào `apps/assistant-ai/README.md`** khi ticket migrate chạy; tới lúc đó để nguyên | `legacy/README.md`: "rewritten per app as it migrates"; nội dung là README của app, không phải ADR/research |
| `apps/DOCUMENTS.md` (439) | Mô tả app, metadata JSON + registry, routing SPA, Vercel rewrites, env `VITE_*`, troubleshooting Windows/pnpm | chưa có gì; phần "Testing", "Build" lỗi thời (pnpm, `node ../../node_modules/...` shim) | **Trích** hai mục "How metadata is loaded" và bảng route sang README app mới; phần còn lại bỏ | Hơn nửa file mô tả cơ chế pnpm/Vercel không còn; bảng route và cơ chế metadata là thứ duy nhất còn giá trị |
| `apps/MCP.md` (49) | API key OpenWeatherMap, ba tool (`hello-world`, `get-weather`, `get-forecast`), `MCP_DOMAIN` cho assistant-ai | chưa có gì | **Gộp vào README app** khi migrate | Nội dung nhỏ, đúng phạm vi một README |
| `apps/STORYBOOK.md` (66) | Storybook 8.6, stories dưới `packages/ui/src/stories/`, env `VITE_*`, Vercel | `apps/storybook` mới (Storybook 10, stories ở `apps/storybook/src/stories/`), CLAUDE.md §1, ticket 06 | **Để đóng băng / xoá cùng `legacy/storybook`** | Mọi đường dẫn, version, prefix env đều sai với Skeleton |
| `others/CHANGESET.md` (135) | Quy trình pnpm changeset → rslib → publish; bảng `@monorepo/*` → `@fe-monorepo/*` | decision 3 (bỏ publish) | **Không di chuyển.** Nếu publish quay lại, viết mới từ spec (§1.2–1.3), không sửa file này | Quy trình sai ngay từ bước chọn package (§1.1) và toàn bộ lệnh pnpm/rslib đã bị gỡ |
| `packages/DATABASE.MD` (236, tiếng Việt) | `@monorepo/db` Prisma 7 đa DB | không có gì thay thế — package đã xoá (`35fdd18` "remove database infrastructure") | **Để đóng băng** (`wontfix`), xoá cùng `legacy/` | Mô tả một package không còn trong bất kỳ nhánh nào của cây hiện tại |
| `packages/SENTRY.md` (202) | API cũ `Sentry.withSentryConfig`, `init from @monorepo/sentry/client`, `global-error.tsx`, DSN theo app | `packages/sentry/README.md` (API mới `withSentry`, `initSentryClient/Server/Edge`, `captureRequestError`), rule `next-env-t3`, ticket 08 | **Để đóng băng**; một dòng vào `.agents/knowledge-base.md` khi migrate `portfolio` về khác biệt DSN | API đã đổi toàn bộ; điều duy nhất còn giá trị là danh sách project Sentry (`portfolio_v1`) — thuộc ticket migrate portfolio |

Điểm đến hợp lệ theo CLAUDE.md §7b/§8: quyết định kiến trúc → `docs/adr/`; nghiên cứu → `docs/research/`; thuật ngữ → `CONTEXT.md`/`CONTEXT-MAP.md`; "project facts and gotchas" → `.agents/knowledge-base.md`; hướng dẫn chạy app → README của app. Nếu chủ repo muốn một thư mục `docs/guides/` (hay `docs/apps/`) cho hướng dẫn dài hơn README, đó là thay đổi cấu trúc cần ghi vào CLAUDE.md §1 và §7b — chưa có quyết định.

## §5. Ticket/issue còn thiếu và bất nhất đang có

### 5.1 Tracker theo `docs/agents/issue-tracker.md` và `triage-labels.md`

Layout: một thư mục theo topic, `spec.md` + `NN-<slug>.md`, front-matter bắt buộc `status` với tập giá trị **đóng**: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`, `in-progress`, `done`. Cạnh block: dòng `**Blocked by:**`; một ticket mở khoá khi mọi ticket nó nêu là `done`. `done` = "Implemented **and** verified, with the verification recorded in the ticket's own body".

| Topic | Ticket | `status` | **Blocked by** |
|---|---|---|---|
| `personal-monorepo-rebuild` | `spec.md` | `ready-for-human` | — (US45 `docker build` chưa chứng minh) |
| | 01 `nen-root-legacy-ci` | done | None |
| | 02 `packages-framework-free` | done | 01 |
| | 03 `env-two-flavors` | done | 01 |
| | 04 `i18n-two-flavors-icu` | done | 01 |
| | 05 `ui-base-ui-base-vega` | done | 01; 02 |
| | 06 `storybook-10-composestories` | done | 05 |
| | 07 `template-vite` | done | 02; 03; 04; 05 |
| | 08 `template-next-sentry` | done | 03; 04; 05 |
| | 09 `generator-runtime` | done | 07; 08 |
| | 10 `claude-md-rules-next-cluster` | done | 07; 08 |
| | 11 `skills-mcp-gitnexus-docs` | done | 09; 10 |
| | 12 `gate-cuoi-kiem-tay` | **ready-for-human** | 11 |
| | 13 `khoan-treo-cua-07-08` | **ready-for-agent** | — |
| | `decisions.md` | (không có front-matter — file phụ, hợp lệ theo issue-tracker.md) | |

Mọi giá trị `status` đều nằm trong tập đóng. Không có topic nào khác.

### 5.2 Bất nhất tìm thấy

1. **Ticket `done` nhưng thân bài còn ô `[~]`/`[ ]` nói "CI chưa chứng minh"** — 01:24, 06:21, 07:24, 08:25, 09:19 đều ghi "`feat/upgrade` chưa push". CI đã xanh ở run #2 (`d964157`, ghi trong ticket 12), tức các ô đó nay đã đúng nhưng chưa được tick lại. Không sai về bản chất, sai về hồ sơ: người đọc ticket 07 vẫn thấy CI "chưa chứng minh".
2. **Ticket 06 `done` với hai ô `[ ]`** (06:19 `docker build`, 06:20 checklist kiểm tay) ghi "chuyển sang ticket 12": checklist đã làm ở 12 (8/8), Docker thì chưa — vẫn treo.
3. **07 và 08 `done` với việc tự nhận "thuộc ticket này" mà chưa làm** — ticket 13 đã nêu và nhận cả ba khoản; ghi lại ở đây để bảng đủ.
4. `legacy/.changeset/config.json` `ignore: ["@monorepo/documents"]` trỏ một package ngoài workspace, và dùng `ignore` cho việc `private: true` đã làm (docs Changesets nói `ignore` là tạm thời).
5. `legacy/README.md` nói `.changeset/` "kept only so the release history is readable" — trong đó **không có** lịch sử release nào (chỉ README + config); lịch sử duy nhất là `git log` và registry npm.
6. `legacy/docs/README.md` link tới `others/VERCEL-DEPLOY.md` và `packages/db` — cả hai không tồn tại.
7. CLAUDE.md §1 liệt kê `compiled-package.json` mà không nói vai trò; nội dung thật là `noEmit` + plugin `next` (§2.2) — cái tên hứa một thứ file không làm.
8. Research trước (`personal-monorepo-rebuild.md` §0.5) để mở "Giữ hay bỏ changesets + hai package `-public`?" → grill chốt "bỏ" (decision 3). Yêu cầu hiện tại mở lại đúng câu đó; phải ghi thành quyết định mới chứ không sửa decision 3 tại chỗ.
9. `apps/_template_vite` không có `README.md` trong khi `apps/_template_next` có — không phải lỗi tracker, nhưng liên quan §4 (điểm đến của docs per app).

### 5.3 Ticket chưa tồn tại mà sáu yêu cầu cần

Đề xuất một topic mới `.agents/plans/legacy-unfreeze/` (hoặc hai topic tách `npm-publish/` và `legacy-migrate/` nếu muốn chạy song song bằng hai session — `issue-tracker.md` cho phép nhiều topic, chỉ cần số ticket không mơ hồ khi gọi `/implement NN`). Danh sách dưới là **ứng viên**, chưa phải ticket; số thứ tự sẽ do `/to-tickets` đặt.

| Ứng viên | Việc | Mở rộng / thay thế cái gì đang có | Cần quyết trước |
|---|---|---|---|
| P0 | ADR-0004 "publish npm trở lại": tên package (`@fe-monorepo/*` đã có trên npm hay tên mới), package nào (`hook`, `ui`), công cụ build, đường A/B ở §1.3, trusted publishing hay token | Đảo một phần **decision 3**; sửa CLAUDE.md §1 (`packages/` "ALL private"), `README.md:121`, `commands.md` § Build, `legacy/README.md` hai dòng `-public` | Grill |
| P1 | `packages/hook` publish được: build → `dist/`, tsconfig build, `exports` dist, `files`, `sideEffects`, `repository`, peer literal; `bun publish --dry-run` xem tarball | Không ticket nào | P0 |
| P2 | `packages/ui` publish được: như P1 + quyết `@monorepo/hook` (publish trước / inline), CSS + Tailwind `@source`, `#hooks/*` khỏi bản publish, ngoại lệ barrel nếu có | Sửa rule `quality-avoid-barrel-imports`, `architecture-ui-primitives` nếu thêm root entry | P1 |
| P3 | `.changeset/` về root với `config.json` schema 4.0.0 + `.github/workflows/release.yml` (`changesets/action@v2`, permission `contents/pull-requests/id-token`, repo setting "Allow GitHub Actions to create and approve pull requests", cấu hình trusted publisher trên npmjs.com hoặc secret `NPM_TOKEN`); cập nhật `ci.yml` nếu `changes` job cần biết `.changeset/` | Không ticket nào | P0 (đường A/B), P1 |
| M0 | Ticket 13 §1 (port một chỗ, generator gán port mới) — **điều kiện tiên quyết** cho mọi app clone từ Template chạy cạnh Template | Ticket 13 đã `ready-for-agent` | — |
| M1 | Migrate `portfolio` → `gen:app` (Runtime `next`): `middleware.ts` → `proxy.ts`, Sentry API mới + DSN duy nhất, `react-markdown` 10, `motion`, `next-themes`, `manifest`/`robots`/`sitemap`, Dockerfile của Template; xoá `vercel.json` hay giữ (Vercel zero-config, decision 11) | `legacy/README.md` bảng; decisions.md "Chưa quyết" (Edge) | Edge runtime? (decisions.md) |
| M2 | Migrate `mcp` — **`needs-info`**: Runtime nào (Template Next rút gọn vs server thuần); nếu server thuần thì thêm Runtime vào `CONTEXT.md` và CLAUDE.md §1 | — | Grill |
| M3 | Migrate `assistant-ai`: bộ `ai@7`/`@ai-sdk/google@4`/`@ai-sdk/react@4`/`@assistant-ui/react-ai-sdk ≥1.4` (decisions.md "Chưa quyết"), bỏ `@radix-ui/react-slot` (Base UI), `app/` → `src/app/[locale]`, e2e cần `mcp` | — | M2 (MCP_DOMAIN) |
| M4 | Migrate `documents` → `gen:app` (Runtime `vite`): RR8, Vitest 5, `PUBLIC_` thay `VITE_`, `env.ts`, `tests/` → `test/` soi gương `src/`, **sinh lại** `components.json`/`hooks.json`/`registry.tsx` cho 63 primitive + 5 hook | — | M0; nên sau P2 nếu app này tài liệu hoá package publish |
| M5 | Xoá `legacy/_template`, `legacy/storybook`, `legacy/ui-public`, `legacy/hook-public`, `legacy/.changeset`, `legacy/docs` theo `legacy/README.md` ("delete once the other four are done"); gỡ `!legacy` khỏi `biome.json:20`, đoạn `legacy/` khỏi CLAUDE.md §1, `CONTEXT.md` "Legacy app", `knowledge-base.md` § Legacy, `.gitignore:9` | — | M1–M4, P1–P3 |
| D1 | Docs: README cho `apps/_template_vite` (đang thiếu); quy ước "README per app" ghi vào CLAUDE.md §3; nội dung §4 chuyển khi từng app migrate | `legacy/README.md` dòng `docs/` | Quyết định điểm đến (§4) |
| V1 | `_template_vite` validate env lúc `build` (ticket 13 § "cố ý không nằm", ticket 12 "bất đối xứng") | — | — |
| H1 | Vệ sinh hồ sơ: tick lại ô CI ở 01/06/07/08/09, sửa hai dòng `legacy/README.md` (§5.2 #5) và link chết `legacy/docs/README.md` (hoặc ghi rõ đóng băng) | Ticket 01/06/07/08/09 | — |

## §6. Vòng verify

Đọc từ `.github/workflows/ci.yml`, `package.json` root, `turbo.json`, `apps/*/turbo.json`, `.agents/commands.md`, ticket 12. **Không lệnh nào được chạy trong khảo sát này.**

| Việc | Lệnh (từ root) | Ràng buộc |
|---|---|---|
| Format + lint + sort import | `bun run check` (= `biome check .`); `check:fix` (`--write`, safe fixes); `check:changed` (`--changed --no-errors-on-unmatched`); `format`/`format:fix` chỉ formatter | Một pass từ root, **không qua Turbo** (domain `types` scan cả project). `legacy/` bị loại ở `biome.json:20` (`!legacy`), không phải ở CI. `useImportType`/`useExportType` đã nâng `error` (decision 22) — "0 warning" là thứ Gate tự giữ, đừng đồng bộ ngược từ reference |
| Typecheck | `bun run typecheck` (= `turbo run typecheck`, `dependsOn ^topo, ^build`, outputs `.cache/tsbuildinfo.json`; app Next thêm `.next/types/**`) | TS 7 (tsgo); mọi workspace extends `@monorepo/tsconfig/base.json` trừ `packages/ui` (§2.2) |
| Test | `bun run test` (= `turbo run test`); `test:coverage` có report v8, **không ngưỡng, không gate**; một app: `bun run --filter @monorepo/<ws> test:watch`; một file: `bun run --filter @monorepo/i18n test test/locales/icu-parity.test.tsx` | **Không** prefix `TZ=UTC` — pin nằm trong từng `vitest.config.ts` (cả `process.env.TZ` lẫn `env.TZ`, vì `test.env.TZ` không ăn dưới pool `threads` của Vitest 5); cú pháp prefix không hợp lệ trên PowerShell. Vitest 5: `clearMocks` mặc định true, mỗi workspace cần `vitest.config.ts` riêng. Test ở `<ws>/test/` soi gương `src/`; mock ở service singleton `~/libs/http-client` |
| Build | `bun run build` (= `turbo run build`, outputs `dist/**`); `build:template-vite` / `build:template-next` một app + deps | Cần `.env` ở root (`cp .env.example .env`) — clone mới không có thì `_template_next` **đỏ** (đúng thiết kế), còn `_template_vite`/`storybook` **xanh với bundle hỏng** (ticket 12 "bất đối xứng"). `_template_next:build` `cache: false` (decision 19, symlink >100 byte trong tar). `chunkSizeWarningLimit` 800/1500 và `checks.pluginTimings: false` cho storybook (decision 20–21) |
| E2E | `bun run e2e` (= `turbo run e2e`, `cache: false`, `passThroughEnv PLAYWRIGHT_BROWSERS_PATH`); `e2e:headed:template-vite` / `:template-next` (project `watch`, một cửa sổ, `reuseContext`, không phải bằng chứng) | **Trên Windows chạy `bunx playwright test --project=chromium` với cwd là thư mục app** — gọi qua script `bun run` treo lúc launch Chromium. `webServer` tự build + serve (vite preview / `next start` port 3101), không bật dev server trước. `locale: vi-VN` pin trong config; spec `.e2e.ts` ở `apps/<app>/e2e/`. **Không chặn merge** (`continue-on-error: true`) |
| Gate | `bun run check && bun run typecheck && bun run test && bun run build` | Đúng bốn job `check`/`typecheck`/`test`/`build` trong `ci.yml`, chạy trên `ubuntu-latest`, mỗi job qua composite `setup-workspace` (Node từ `.nvmrc`, Bun từ `packageManager`, cache `.bun-cache` theo `bun.lock`, `bun install --frozen-lockfile`, `cp .env.example .env`). Trigger: `push` mọi nhánh + `workflow_dispatch`, không `pull_request`; `concurrency` cancel-in-progress |
| E2E trên CI | job `e2e`, `needs: changes` (job `git diff` tự viết, chạy khi diff chạm `apps/`, `packages/`, `tooling/`, `bun.lock`, `ci.yml`; nhánh mới/dispatch coi là chạm) | Container `mcr.microsoft.com/playwright:v1.62.1-noble` **phải khớp** `@playwright/test` trong catalog `testing` (1.62.1, không caret); gọi `bun run --filter @monorepo/<app> e2e` **không qua `turbo run`**; cài `unzip` trước `setup-bun` (image không có — lỗi run #1); upload report `if: always()`, `actions/upload-artifact@v7` |
| Docker | `docker build` ba image (`_template_vite`, `_template_next`, `storybook`) | Kiểm tay, **chưa từng chạy** (ticket 12: máy không còn Docker; `node .next/standalone/.../server.js` trên Windows chết `EPERM` vì symlink) |
| Tạo app | `bun run gen:app` (binary `gen`, không `bunx turbo gen` — cắt tham số trên Windows) | App clone giữ nguyên port Template (ticket 13 §1) |

**Trạng thái CI theo ticket 12** (`.agents/plans/personal-monorepo-rebuild/12-gate-cuoi-kiem-tay.md`, commit `7a882ac` "record the first two CI runs"):

- **Run #1** (`2b89265`): bốn job Gate xanh (`check` 38s · `typecheck` 28s · `test` 45s · `build` 44s); `e2e` **đỏ** vì `Unable to locate executable file: unzip` trong image Playwright → `setup-bun` chết → `bun: command not found` exit 127; workflow vẫn báo `success` nhờ `continue-on-error` — đúng cái giá ticket 07 đã cảnh báo.
- **Run #2** (`d964157`): **6/6 job xanh** (`changes` 6s · `check` 41s · `typecheck` 15s · `test` 26s · `build` 39s · `e2e` 132s cho cả hai Template), `check-runs` **0 annotation**.
- Local (`0708b4b`): Gate 4/4 exit 0, 169 test (ui 17 · env 17 · dayjs 13 · api 22 · i18n 43 · `_template_next` 39 · `_template_vite` 11 · storybook 148), `grep -i "warn|(!)|⚠|▲"` trên bốn log chỉ còn logo Next; Playwright 7/7 + 6/6; clone mới `bun install --frozen-lockfile` không đổi `bun.lock`.
- Còn treo: `docker build` (lý do ticket 12 là `ready-for-human`); `e2e` vẫn `continue-on-error`; `next start` với `output: standalone` in warning trong log e2e (ticket 13 §2).

## Đề xuất thứ tự thực hiện

Nguyên tắc: mỗi ticket kết thúc bằng Gate xanh 0 warning (US44); việc nào đảo một quyết định đã ghi thì đi qua ADR trước khi có ticket.

1. **Grill + ADR trước, một phiên cho ba câu** (P0, M2, điểm đến docs §4): (a) publish npm — có hay không, tên, package nào, đường A (`bun publish`, không provenance) hay B (`npm publish` qua Changesets, không `catalog:`/`workspace:` trong package publish, có trusted publishing); (b) `mcp` là Runtime gì; (c) docs per app nằm ở README app hay một `docs/<thư mục mới>`. Đầu ra: ADR-0004 (publish) và có thể ADR-0005 (Runtime server), `CONTEXT.md` cập nhật, rồi `/to-spec` → `/to-tickets` cho topic mới.
2. **Ticket 13 §1 (M0) trước mọi migrate** — không có nó, app đầu tiên sinh từ Template va port với Template và không chạy song song được để kiểm.
3. **Hai luồng song song sau đó** (hai topic, hai session, không đụng file nhau):
   - *Publish*: P1 (`hook`, không phụ thuộc gì — pilot rẻ nhất để chứng minh build + `dry-run` + tarball sạch) → P2 (`ui`) → P3 (`.changeset/` + `release.yml`; cấu hình npmjs.com là việc `ready-for-human`).
   - *Migrate*: M1 `portfolio` (Next thuần, không dịch vụ ngoài, có Dockerfile để cuối cùng chứng minh US45) → M2 `mcp` → M3 `assistant-ai` (cần `mcp` cho `MCP_DOMAIN`) → M4 `documents` cuối cùng, vì nội dung của nó là tài liệu của `ui`/`hook` và nên đợi bề mặt publish (P2) chốt.
4. **Docs (D1)** đi kèm từng ticket migrate (README app), không tách thành đợt riêng; `legacy/docs` giữ đóng băng cho tới M5.
5. **M5 dọn `legacy/`** khi bốn app và hai package đã về; đồng thời gỡ mọi chỗ nhắc `legacy/` (`biome.json`, CLAUDE.md, `CONTEXT.md`, `knowledge-base.md`, `.gitignore`).
6. **H1 + V1** bất kỳ lúc nào rảnh — nhỏ, không chặn gì, nhưng H1 nên làm trước khi mở topic mới để ticket cũ không kể một chuyện CI đã hết đúng.

Phụ thuộc chéo đáng nhớ: P2 ↔ M4 (documents mô tả ui/hook); M2 → M3 (MCP_DOMAIN); M0 → M1–M4 (port); P0 → P1 (tên và đường publish); ticket 12 (Docker) vẫn là điều kiện để `spec.md` cũ về `done`, và M1 là cơ hội đầu tiên có một máy/job build image thật.

## Nguồn

**Repo (nhánh `feat/upgrade`, HEAD `7a882ac`):**
`CLAUDE.md` §1, §2, §3, §6, §7a, §7b, §8 · `README.md:18,114-138` · `CONTEXT.md:18-41` · `package.json` root · `turbo.json` · `apps/{_template_next,_template_vite,storybook}/turbo.json` · `biome.json:20` · `.gitignore:9,33,40` · `.env.example` · `.github/workflows/ci.yml` · `.github/actions/setup-workspace/action.yml` · `.agents/commands.md` · `.agents/knowledge-base.md:229-236` · `.agents/plans/personal-monorepo-rebuild/{spec.md,decisions.md,01…13}` (front-matter, dòng `Blocked by`, ô `[ ]`/`[~]` qua `grep`) · `docs/agents/{issue-tracker,triage-labels}.md` · `docs/adr/0001-legacy-apps-outside-workspace.md`, `0002-…`, `0003-…` · `docs/research/personal-monorepo-rebuild.md:261,324`, §0.5 · `legacy/README.md` · `legacy/.changeset/{README.md,config.json}` · `legacy/docs/**` (8 file) · `legacy/{ui-public,hook-public}/{package.json,README.md}` · `legacy/{assistant-ai,mcp,portfolio}/{package.json,env.ts|src/env.ts,next.config.*}` · `legacy/documents/{package.json,vite.config.ts}` · `legacy/mcp/src/app/api/mcp/route.ts` · `legacy/assistant-ai/app/api/chat/route.ts` · `packages/{ui,hook}/package.json` · `packages/{env,sentry}/README.md` · `tooling/typescript/{base,compiled-package}.json` · `apps/*/tsconfig.json`, `packages/*/tsconfig.json` (`grep '"extends"'`).

**Git:** `git log --oneline -- legacy/` (`1c9eaa1`) · `git log --oneline --all -- .changeset/ legacy/.changeset/` (`e609614`, `7837e77`, `35fdd18`, `1c9eaa1`) · `git log --all --diff-filter=A --name-only -- '.changeset/*.md'` · `git show e609614:.changeset/{giant-wasps-ask,good-lines-stay}.md` · `git show 7edc303:{package.json,pnpm-workspace.yaml,packages/ui/package.json,packages/hook/package.json,packages/ui/rslib.config.ts,packages/hook/rslib.config.ts,packages/ui/tsconfig.build.json,packages/ui/scripts/copy-dist.js,packages/ui/src/index.ts}` · `git ls-tree 7edc303 packages/ui/ packages/hook/ packages/hook/src/hooks/` · `git log --all --name-status -- docs/others/VERCEL-DEPLOY.md` (`4f5a4a5` A, `7edc303` D) · `git log --all --diff-filter=A -- .github/` (`a5498c2`, `1c9eaa1`) · `git log --all --name-status -- .github/workflows/deploy-vercel-manual.yml` (`259a942` D) · `git log --all -- packages/db/` (`1fcec00`, `40594a0`, `35fdd18`) · `git log --diff-filter=A -- .agents/plans/` (`125dc9c`, `86cbe87`, `d964157`) · `git ls-files legacy/documents/{dist,.cache,.turbo} legacy/{ui,hook}-public/dist legacy/.env` → 0.

**Registry / lệnh:** `npm view @fe-monorepo/ui name version versions dist-tags time.modified` → `1.0.2`, `2025-11-25T14:25:51Z` · `npm view @fe-monorepo/hook …` → `1.0.0`, `2026-01-07T15:05:32Z` · `npm view @changesets/cli version time.modified` → `3.0.1`, `2026-08-19` · `npm view @changesets/config version` → `4.0.0` · `bun --version` → `1.4.0` · `grep -c changesets bun.lock` → `0` · `npm pack` + `tar` + `grep` trên `@changesets/cli@3.0.1` (`dist/getPublishPlan.mjs:239,347,553-565`, `dist/pack.mjs`, `dist/publish.mjs:50-60`, `dist/index.mjs` danh sách `cli.command`, `package.json` deps `@manypkg/get-packages ^3.1.0`, `package-manager-detector ^1.6.0`), `@changesets/get-dependents-graph@3.0.0` (`dist/index.mjs:30-38,50-83`), `@changesets/assemble-release-plan@7.0.0`, `@changesets/apply-release-plan@8.0.0`, `@changesets/should-skip-package@1.0.0`, `@manypkg/tools` (`dist/manypkg-tools.js:117-137,687`).

**Docs chính chủ:**
- Changesets: [docs/config-file-options.md](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md) · [docs/command-line-options.md](https://github.com/changesets/changesets/blob/main/docs/command-line-options.md) · [docs/intro-to-using-changesets.md](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md) · [docs/automating-changesets.md](https://github.com/changesets/changesets/blob/main/docs/automating-changesets.md) → [changesets.dev/guide/automating](https://changesets.dev/guide/automating) · `packages/cli/CHANGELOG.md`, `packages/get-dependents-graph/CHANGELOG.md` (raw) · mã nguồn `packages/apply-release-plan/src/{version-package,utils}.ts`, `packages/assemble-release-plan/src/determine-dependents.ts`, `packages/cli/src/lib/types.ts`, `packages/cli/src/cli.ts` (qua Context7 `/changesets/changesets`) · [github.com/changesets/changesets/issues?q=is:issue catalog: bun](https://github.com/changesets/changesets/issues?q=is%3Aissue+catalog%3A+bun) → không kết quả.
- `changesets/action`: [action.yml](https://raw.githubusercontent.com/changesets/action/main/action.yml) · [README.md](https://raw.githubusercontent.com/changesets/action/main/README.md).
- Bun: [bun.sh/docs/cli/publish](https://bun.sh/docs/cli/publish) · [bun.sh/docs/install/catalogs](https://bun.sh/docs/install/catalogs) · [oven-sh/bun#15601](https://github.com/oven-sh/bun/issues/15601) (`--provenance`, open) · [oven-sh/bun#22423](https://github.com/oven-sh/bun/issues/22423) (OIDC, open).
- npm: [docs.npmjs.com/trusted-publishers](https://docs.npmjs.com/trusted-publishers) · [docs.npmjs.com/generating-provenance-statements](https://docs.npmjs.com/generating-provenance-statements).

**Chưa xác minh (ghi rõ trong bài):** hành vi thực tế của `npm publish` với chuỗi `catalog:`/`workspace:*` trong `package.json` (suy từ mã nguồn, chưa chạy `--dry-run`); version npm đi kèm Node 24.20.0 trên runner có ≥ 11.5.1 cho trusted publishing; công cụ build nào (rslib 1.0 / tsdown / `bun build` + `tsc --emitDeclarationOnly`) chạy với TypeScript 7 tsgo; cách consumer Tailwind v4 quét class trong package publish (`@source`); mọi thứ về Docker (chưa có máy).
