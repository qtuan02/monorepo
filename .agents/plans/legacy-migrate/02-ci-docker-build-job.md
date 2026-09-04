---
status: ready-for-human
---

# 02 — Job CI `docker` build không push cho mọi app có Dockerfile

**What to build:** Mỗi PR chạm một app có Dockerfile, `packages/`, `tooling/`, `bun.lock` hoặc workflow được CI build image của app đó (không push) trong một job non-blocking, và kết quả nhìn thấy ngay trên PR. Chạy xanh cho hai Template là bằng chứng ticket 12 của topic `personal-monorepo-rebuild` còn thiếu; ticket 12 được đóng ở đây. Từ ticket 03 trở đi mỗi app migrate tự động được job này phủ.

**Blocked by:** None (can start immediately). Không cần máy Docker local — runner Ubuntu của GitHub Actions có Docker sẵn.

**Status:** `ready-for-human` (2026-09-04) — **không phải `done`, và không thể là `done` từ máy này.**
Ba trên sáu ô tick (#2 matrix, #5 docs, #6 Gate) và có bằng chứng trong Notes; hai ô còn lại (#3 job
xanh cho cả ba app, #4 lật ticket 12 + `spec.md`) đòi một lượt chạy trên GitHub Actions, mà máy này
không dựng được image (`command -v docker` rỗng) và không đọc được run (không có `gh`). Theo
[`docs/agents/triage-labels.md`](../../../docs/agents/triage-labels.md), `ready-for-human` là nhãn cho
đúng loại việc này — "genuinely cannot be automated … looking at a rendered page with human eyes" —
chứ không phải `ready-for-agent`, vì phần agent làm được đã làm hết. Ô AC #1 để trống **có chủ ý**:
tiền đề build ARG của nó sai, xem bảng dưới.

**Còn lại đúng ba bước, và ai làm:**

1. **Một người** push nhánh `feat/upgrade` (lượt này bị cấm chạy mọi lệnh git ghi).
2. **Một người** mở run và **mở riêng từng job matrix** — `docker (_template_next)`,
   `docker (_template_vite)`, `docker (storybook)`. `continue-on-error: true` làm cả workflow báo
   xanh kể cả khi cả ba đỏ, nên dấu tích tổng của run là vô nghĩa ở đây.
3. Dán URL run + bảng kết quả từng job vào `12-gate-cuoi-kiem-tay.md` § "Bằng chứng — job `docker`
   trên CI" (chỗ trống đã chừa sẵn), tick ô AC #3 ở đây, rồi mới xét AC #4. Nếu một image đỏ: sửa
   Dockerfile đó và ghi nguyên nhân vào cả hai ticket — đó chính là việc ô này chờ từ đầu.

## Acceptance criteria

- [ ] `ci.yml` có job `docker` với `continue-on-error: true` (cùng lý do và cùng câu ghi điều kiện chuyển sang chặn như job `e2e`), matrix theo app có Dockerfile (khởi điểm: `_template_vite`, `_template_next`, `storybook`), kích hoạt qua job `changes` với path filter `apps/<app>/**`, `packages/**`, `tooling/**`, `bun.lock`, workflow file; dùng `docker/build-push-action` với `push: false`, `load: false`, cache GitHub Actions, build ARG lấy từ `.env.example` (giá trị dev, không secret).
- [x] Matrix đọc danh sách app từ một chỗ dễ thêm (một biến YAML ở đầu workflow hoặc `find apps -name Dockerfile`), có comment nói ticket migrate chỉ cần thêm tên app (hoặc không cần gì nếu dùng `find`).
- [ ] Job xanh cho cả ba app trên CI của PR này; nếu một Dockerfile đỏ, sửa Dockerfile (đó chính là việc ticket 12 chờ) và ghi lại nguyên nhân vào Notes và vào ticket 12.
- [ ] Ticket 12 của topic cũ: cập nhật thân bài với URL run, đặt `status: done`; `spec.md` của topic cũ về `done` nếu đó là khoản cuối cùng nó chờ (đọc lại "Còn treo" của 12 trước khi đổi).
- [x] CLAUDE.md §6 và `.agents/commands.md`: câu về CI mô tả thêm job `docker` (non-blocking, khi nào chạy); glossary **Gate** không đổi.
- [x] Gate xanh 0 warning (chỉ YAML và docs thay đổi; ghi cách đã kiểm YAML vào Notes).

## Notes

### Máy này không dựng được image, và không đọc được run

Nói thẳng trước mọi thứ khác: **"job xanh cho cả ba app trên CI" đã được *viết* chứ chưa được
*chứng minh*.** Máy chạy lượt này không có Docker (`command -v docker` trả rỗng; đường
`/c/Program Files/Docker/Docker/resources/bin` có trong PATH nhưng thư mục không tồn tại — trùng
đúng phát hiện của ticket 12) và không có `gh`, nên không dựng được image tại chỗ và cũng không đọc
được một run nào. Job `docker` chưa chạy lần nào.

**Bước kế tiếp, chính xác:** push nhánh này, rồi **mở riêng từng job trong ba job của matrix** —
`continue-on-error: true` làm cả workflow báo xanh kể cả khi cả ba đỏ, nên nhìn dấu tích tổng là vô
nghĩa. Sau đó điền URL run vào chỗ trống đã chừa sẵn trong `12-gate-cuoi-kiem-tay.md` (mục "Bằng
chứng — job `docker` trên CI") cùng bảng kết quả từng app, tick ô AC #3 ở đây, rồi mới xét ô AC #4.

### Tiền đề sai trong AC #1: build ARG **không** lấy từ `.env.example`

AC #1 đòi "build ARG lấy từ `.env.example`". Đọc cả ba Dockerfile thì tiền đề đó không đúng, và job
cố ý **không** truyền `--build-arg` nào:

| Dockerfile | ARG khai | Env vào image bằng đường nào |
| --- | --- | --- |
| `apps/_template_vite/Dockerfile` | `BUN_VERSION=1.4.0`, `APP_DIRNAME`, `PROJECT`, `BUILD_ENV=example` | `COPY .env.${BUILD_ENV} .env` — tức chính `.env.example` đã commit, copy nguyên văn |
| `apps/_template_next/Dockerfile` | `BUN_VERSION=1` (floating — xem dưới), `APP_DIRNAME`, `PROJECT`, `BUILD_ENV=example` | như trên |
| `apps/storybook/Dockerfile` | `BUN_VERSION=1.4.0`, `APP_DIRNAME`, `PROJECT` | **không có `BUILD_ENV`** — image này không đọc `PUBLIC_*` nào |

Không ARG nào ánh xạ tới một key trong `.env.example`; env vào image dưới dạng **một file**, và
`.dockerignore` cố ý không ignore `.env.example` để đúng đường đó chạy được. `APP_DIRNAME`/`PROJECT`
thì `bun run gen:app` đã ghi sẵn vào từng Dockerfile
(`turbo/generators/config.ts:427-428`). Truyền `BUILD_ENV` cho đủ mặt AC sẽ sinh warning
"build-args were not consumed" trên image Storybook — trái chuẩn 0 warning của repo.

Nên **ô AC #1 để trống**: mọi vế khác của nó đã có (`continue-on-error: true`, `needs: changes`,
`if: needs.changes.outputs.app == 'true'`, `fail-fast: false`, matrix `fromJSON`, `push: false`,
`load: false`, `cache-from`/`cache-to` `type=gha` scope theo app, và câu "xoá một dòng này là job
thành gate" viết đúng giọng của khối `e2e`), nhưng vế cuối cùng cố ý không làm. Chủ ticket sửa chữ
của AC theo bảng trên là đóng được ô này.

### Matrix suy ra từ đĩa, không liệt kê

Job `changes` mọc thêm output `apps`:

```
find apps -mindepth 2 -maxdepth 2 -name Dockerfile \
  | sed -E 's#^apps/([^/]+)/Dockerfile$#"\1"#' | sort | paste -sd, -
```

Chạy thật pipeline này tại chỗ — lần đầu khi viết job, và **chạy lại ở lượt tài liệu cuối** để chắc
nó còn đúng: ra `["_template_next","_template_vite","storybook"]`, parse được thành mảng JSON 3 phần
tử, và cả ba `apps/<name>/Dockerfile` đều tồn tại.

**Một cạnh sắc thật, phát hiện giữa hai lần chạy đó:** pipeline đọc **đĩa**, không đọc
`git ls-files`. Trong lúc smoke test của ticket `legacy-migrate/01` còn để hai app thử
(`apps/tmp_smoke_*`, untracked) trên cây, đúng pipeline này ra **năm** phần tử. Trên CI thì vô hại vì
`actions/checkout` chỉ dựng lại file đã track, nên tai nạn chỉ lộ khi ai đó lỡ commit một app nháp.
Ai thêm allowlist/denylist hay lọc qua `git ls-files` thì ghi lý do ở đây; lượt này cố ý **không**
thêm, vì mọi cách lọc đều là một danh sách thứ hai sẽ trôi khỏi cái thứ nhất — đúng thứ comment của
job `changes` đang tránh. Dùng coreutils chứ không
`jq` vì máy này không có `jq` — viết bằng thứ chạy được tại chỗ thì mới kiểm được tại chỗ. Comment
phía trên nói rõ ticket migrate **không phải thêm gì**, và giải thích vì sao scope chỉ `apps/`:
`legacy/` còn bốn Dockerfile của app đóng băng nằm ngoài `workspaces.packages` (ADR-0001), không
dựng được.

Job `docker` dùng lại **chính** `changes.outputs.app` của job `e2e` thay vì thêm filter thứ hai: hai
danh sách path sẽ là cùng một regex mang hai cái tên, và cái thứ hai chắc chắn sẽ trôi khỏi cái thứ
nhất. Lý do đó viết trong comment của job `changes`.

### Cách đã kiểm YAML — và cái nó không kiểm

`Bun.YAML.parse` (Bun 1.4.0) trên toàn file, rồi assert từng field: `continue-on-error: true`,
`needs: changes`, `if: needs.changes.outputs.app == 'true'`, `fail-fast: false`,
`matrix.app: ${{ fromJSON(needs.changes.outputs.apps) }}`, và ba step với `push: false` /
`load: false` / `cache-from`+`cache-to`. Đây là **validator offline duy nhất** có trên máy này:
không có `actionlint`, không `yq`, không `python3`, không package yaml nào trong node_modules.

Nó chứng minh file **parse được và các key nằm đúng chỗ**. Nó **không** chứng minh schema của GitHub
Actions hợp lệ, và không chứng minh biểu thức `${{ }}` resolve đúng. Nếu run đầu tiên đỏ ngay ở dòng
`uses:` chứ không phải bên trong lượt build, đó là chỗ nhìn trước tiên.

**Hai pin `docker/*` — đã kiểm thật, và đã nâng (2026-09-04).** Bản đầu pin
`docker/setup-buildx-action@v3` / `docker/build-push-action@v6` **theo hiểu biết** và ghi hedge đúng
chỗ này. Lượt sau tải thẳng `action.yml` của cả hai từ `raw.githubusercontent.com` (HTTP 200):
`@v4` và `@v7` **có tồn tại**, cả sáu input đang dùng (`context`, `file`, `push`, `load`,
`cache-from`, `cache-to`) đều còn trên v7, và điểm quyết định là `runs.using` — v4/v7 khai
`node24`, còn v3/v6 khai `node20`, thứ runner sẽ dán một deprecation annotation lên **mỗi** leg
matrix. Ticket 12 vừa dọn đúng lớp annotation đó (`actions/upload-artifact` v5 → v7) và ghi lại "0
annotation"; giữ v3/v6 sẽ làm câu ghi ấy thành sai ngay ở lần push đầu tiên. Nên hai pin nâng lên
`@v4`/`@v7`, và comment trong `ci.yml` viết lại theo đúng lý do này thay vì câu cũ ("v3 và v6 là
major hiện hành") — câu đó sai.

### Ba sai lệch/rủi ro trong `ci.yml` — ghi ở đây, cố ý không sửa ở lượt này

1. **Path filter rộng hơn chữ của AC #1.** AC đòi filter `apps/<app>/**`; `ci.yml` dùng một regex chung
   `^(apps/|packages/|tooling/|bun.lock$|.github/workflows/ci.yml$)`, nên một diff chạm đúng một app
   vẫn dựng cả ba image. Chấp nhận được — `packages/`/`tooling/` thật sự ảnh hưởng mọi app, và cache
   `type=gha` scope theo app giữ giá cho lượt sau — nhưng đó là **vế thứ hai** của AC #1 không đạt,
   ngoài vế build ARG ở bảng trên. Người sửa chữ của AC #1 phải sửa cả hai vế.
2. **`grep -q` trong một pipeline có `pipefail` có thể bỏ sót một diff lớn.** Step `filter` chạy
   `printf '%s
' "$changed" | grep -qE "$pattern"`; `grep -q` thoát ngay ở match đầu tiên, nên với một
   diff vượt buffer của pipe, `printf` chết vì SIGPIPE (141), `pipefail` trả 141 cho cả pipeline, và
   nhánh `else` ghi `app=false` **cho một diff có chạm `apps/`** — bỏ qua cả `e2e` lẫn `docker` trong
   khi run vẫn báo xanh. Sửa rẻ: `if grep -qE "$pattern" <<<"$changed"; then`. **Không sửa ở lượt
   này** vì vòng lặp hai output đó thuộc session npm-publish đang chạy song song và đang nằm trong
   index của họ; đụng vào là xung đột. Ai chạm step `filter` lần sau thì sửa luôn.
3. **`.github/actions/setup-workspace/**` không nằm trong regex `app`.** Sửa composite action đó
   không kích lại `e2e`. Vô hại với `docker` (job này cố ý không dùng nó), nhưng nên thêm vào regex ở
   lần chạm tiếp theo.

### Drift có sẵn — báo chứ không sửa

`apps/_template_next/Dockerfile:1` pin `ARG BUN_VERSION=1` (tag trôi), trong khi `_template_vite` và
`storybook` pin `1.4.0`. Không sửa: không dựng được image thì không có bằng chứng nào về một defect,
và sửa Dockerfile "vì nghi ngờ" là đúng thứ AC #3 bảo đừng làm. **Nếu đúng một image đỏ sau một bản
Bun mới, đây là chỗ nghi trước tiên.** Một bất đối xứng nhỏ hơn: `apps/storybook/Dockerfile:47` copy
`nginx.conf` từ builder stage còn `apps/_template_vite/Dockerfile:75` copy từ build context; cả hai
chạy được với context là repo root nên không cản job này.

### Ticket 12 và `spec.md` — vì sao chưa lật

- **Ticket 12 giữ `ready-for-human`, nhưng lý do đã đổi.** `docs/agents/triage-labels.md` định nghĩa
  `done` là "Implemented **and** verified, with the verification recorded in the ticket's own body".
  Implemented: xong. Verified: chưa — không có run nào, nên không có URL nào để ghi mà không bịa.
  Thân ticket 12 đã tách ô Docker cũ làm hai (ba ô `docker build`, và hai kiểm hành vi container),
  đổi câu "cần một máy có Docker" thành "cần một lượt push và một người đọc run", và chừa sẵn chỗ
  trống cho URL cùng bảng kết quả từng job matrix, kèm điều kiện lật gồm bốn điểm.
- **`spec.md` không lật được, vì hai lý do độc lập.** Một: ticket 12 chưa `done`. Hai: US45 viết
  `docker build` chạy được **bằng tay** (và dòng 106 lặp lại nó trong danh sách kiểm tay), mà một job
  CI không thoả chữ "bằng tay". Ghi chú US45 đã được thêm ngay cuối mục User Stories của `spec.md`:
  người đóng spec phải chọn dứt khoát và ghi lại — hoặc sửa US45 nói job CI thay cho lượt chạy tay,
  hoặc giữ US45 và chạy một lượt `docker build` thật. Lật status mà chưa giải quyết chỗ đó là tái
  diễn đúng cái ticket 12 dòng 13 đã từ chối làm: frontmatter nói ngược thân bài.

### Hai kiểm hành vi container hiện không có chủ

Ticket 12 còn đòi `_template_vite` trả 404 cho file không tồn tại và `_template_next` trả trang SSR.
Job này dựng image chứ **không chạy container** (`load: false` là chữ của AC #1), nên nó không đóng
được hai ô đó. Hai đường đi đã ghi trong "Còn treo" của ticket 12: hoặc mở rộng job `docker` với
`load: true` + `docker run`/`curl` cho hai Template, hoặc chạy tay một lượt trên máy có Docker.
Không đường nào được chọn đơn phương ở lượt này vì AC #1 viết rõ `load: false`.

### CLAUDE.md và `.agents/commands.md`

Câu "A fifth job, `e2e`, …" ở cả hai file đã sai ngay khi có job non-blocking thứ hai, nên cả hai
được viết lại. **Rồi sai lần nữa trong cùng ngày** — session npm-publish thêm `changeset-status` và
`publish-smoke`, nên bản viết lại "hai job ngoài Gate, cùng path filter" đếm thiếu và mô tả sai bộ
lọc. Lượt tài liệu cuối sửa cả ba chỗ theo đúng `ci.yml` trên đĩa: **bốn** job ngoài Gate, tất cả
`continue-on-error: true`; `e2e` + `docker` dùng chung một path filter, còn `changeset-status` +
`publish-smoke` dùng bộ lọc thứ hai của riêng chúng (`changes.outputs.publish`). Ba chỗ đó là
CLAUDE.md §1 (dòng cây `ci.yml`, trước chỉ nhắc `e2e`), CLAUDE.md §6, và `.agents/commands.md` §CI.
Header của chính `ci.yml` đã nói "Four jobs sit outside it", nên ba câu này giờ khớp với nó. Glossary
**Gate** không đổi ở cả hai chỗ: CLAUDE.md §6 vẫn mở bằng "**The Gate** is exactly four of these —
`check`, `typecheck`, `test`, `build`", và `.agents/commands.md` vẫn giữ nguyên bảng bốn job cùng
câu "Those four are **the Gate**". `.agents/commands.md` nhận thêm hai ràng buộc của job `docker`
(build context là repo root; không truyền `--build-arg`, cùng lý do bảng ARG ở trên) và một câu nói
rõ nó không chạy container.

### Gate

Chạy đủ bốn lệnh sau khi mọi sửa đổi của lượt này (YAML + docs) đã nằm trên đĩa, 2026-09-04:

```
bun run check      → Checked 368 files in 20s. No fixes applied.   (0 diagnostic)
bun run typecheck  → Tasks: 14 successful, 14 total
bun run test       → Tasks: 10 successful, 10 total
bun run build      → Tasks:  5 successful,  5 total
```

Số task cao hơn con số 12/8/3 ghi ở ticket 12 vì session npm-publish chạy song song đã thêm
workspace — không phải drift của lượt này. **Số file của `check` cũng đang trôi vì lý do đó** (đo
được 367 → 368 → 423 → 490 trong cùng một ngày, tuỳ thời điểm session kia thêm file); nên đọc con số
này là "0 diagnostic", đừng đọc là một baseline cố định.

Lượt tài liệu cuối (chỉ sửa prose trong ticket + ba câu CI ở CLAUDE.md/`.agents/commands.md`) chạy
lại `bunx biome check .` → exit 0, `Checked 368 files in 75s. No fixes applied.` Biome không xử lý
`.yml` lẫn `.md`, nên với hai loại file đó cách bắt lỗi duy nhất vẫn là đọc lại — và đó chính là cái
lượt này làm với `ci.yml` (đối chiếu từng câu trong docs với job có thật trên đĩa). Biome không xử lý `.yml` lẫn `.md`, nên không file nào
lượt này chạm được formatter định hình lại; cách duy nhất bắt lỗi trong chúng là đọc lại.

### `ci.yml` của ticket này nằm trong commit của topic khác

Ghi lại để `git log` không kể sai. Phần `ci.yml` của ticket này — job `docker`, output `apps` mới của
job `changes`, và khối comment header viết lại — **chưa từng có commit riêng**. Nó đang nằm uncommitted
trong cây thì bị commit `2897278` ("feat(release): changesets, release workflow, two non-blocking CI
jobs") của topic `npm-publish` cuốn theo: stat của commit đó ghi `.github/workflows/ci.yml | 226 +++--`,
mà hai job `changeset-status`/`publish-smoke` của họ chỉ chiếm một phần nhỏ trong số đó.

Không mất gì và file trên đĩa đúng (`docker` có mặt, Gate xanh trên đó), nên **không viết lại lịch sử**
— rủi ro của một lượt rebase lớn hơn giá trị của attribution. Hệ quả phải biết: `git log --
.github/workflows/ci.yml` nay trỏ job `docker` về commit mang thông điệp của changesets, nên ai truy
nguồn job này phải đọc ticket này chứ không phải commit message.

Hai session viết song song vào một cây, ownership đã thống nhất bằng tin nhắn (`ci.yml` thuộc ticket
này) — chỗ hỏng là bước **stage**, không phải bước thoả thuận. Bài học cho lượt sau: khi biết có
session khác đang viết, `git add <đường dẫn cụ thể>` chứ đừng `git add .`/`git commit -a`, và commit
phần của mình sớm thay vì để uncommitted lâu trong cây chung.
