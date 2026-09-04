---
status: done
---

# 01 — Prefactor: một port mỗi app và generator gán port mới; vệ sinh hồ sơ; README `_template_vite`

**What to build:** Một app sinh bằng `bun run gen:app` chạy `dev` và `e2e` **cạnh** Template sinh ra nó mà không va port, vì mỗi app khai dev port và e2e port ở đúng một chỗ và generator gán cặp port kế tiếp còn trống. Đồng thời tracker kể đúng chuyện: các ticket cũ hết ô "CI chưa chứng minh" đã lỗi thời, `legacy/README.md` không còn nói `.changeset/` giữ "release history", và `apps/_template_vite` có README như `_template_next`. Đây là điều kiện tiên quyết của mọi ticket migrate — ticket 13 §1 của topic `personal-monorepo-rebuild` được thực hiện ở đây.

**Blocked by:** None (can start immediately).

**Status:** `done` (2026-09-04) — bảy trên bảy ô có bằng chứng ghi trong Notes: Gate 4/4 xanh 0 warning (chạy hai lượt, kết quả trùng nhau), Playwright 7 + 6 passed, smoke test generator chạy thật (3002/3102 + 3003/3103, bốn dev server bind đồng thời, dọn sạch sau đó). **Hai sai lệch so với *chữ* của AC được ghi thẳng trong Notes chứ không giấu** — AC #1 (hai literal `3000` còn lại trong `apps/_template_next/Dockerfile`, là port *trong container*) và AC #7 (E2E port của `_template_vite` đi 3000 → 3100). Đọc hai mục "Sai lệch so với chữ của AC" trước khi dùng ticket này làm tiền lệ.

## Acceptance criteria

- [x] Mỗi Template app khai dev port và e2e port ở **một** chỗ (ví dụ một module `port` nhỏ hoặc trường trong `package.json` mà cả `vite.config.ts`/script `next dev --port` lẫn `playwright.config.ts` cùng đọc); mọi literal `3000`/`3001`/`3100`/`3101` còn lại chỉ nằm trong comment đã được sửa cho đúng (đọc cảnh báo của ticket 13 §1: sửa tay, cập nhật comment cùng lúc, không regex).
- [x] Generator `app` gán cặp port kế tiếp còn trống (quét `apps/*` để tìm port lớn nhất đang dùng, hoặc bảng phân bổ trong generator) và ghi vào đúng chỗ đó; smoke test: sinh một app Vite và một app Next vào thư mục tạm/nhánh tạm, chạy `dev` của Template và app sinh ra **đồng thời**, cả hai lên; xoá app thử sau khi ghi kết quả.
- [x] `.env.example` và README Template nói rõ port mặc định và cách generator gán; `PUBLIC_BASE_DOMAIN`/`NEXT_PUBLIC_BASE_DOMAIN` trong `.env.example` giữ nguyên (chúng là URL app tự biết, không phải port của server dev).
- [x] Ticket 13 của topic cũ: mục §1 đánh dấu đã làm và trỏ sang ticket này (không đổi `status` của 13 nếu §2/§3 còn treo).
- [x] Vệ sinh hồ sơ topic cũ (một commit docs riêng, trước phần code): ticket 01/06/07/08/09 tick lại ô "CI chưa chứng minh" với tham chiếu CI run #2 (`d964157`, 6/6 xanh) và hai ô `[ ]` còn lại của 06 được xử lý (tick hoặc ghi rõ vì sao không); `legacy/README.md` sửa dòng `.changeset/` (không có release history nào trong đó) và hai dòng `-public` trỏ ADR-0004; `legacy/docs/README.md` thêm một dòng đầu file nói đóng băng và có link chết (`VERCEL-DEPLOY.md`, `packages/db`).
- [x] `apps/_template_vite/README.md` mới, cùng khung với README của `_template_next` (mục đích, Runtime, env, port, lệnh, e2e trên Windows, Docker); CLAUDE.md §1 thêm dòng README vào cây của `_template_vite`.
- [x] Gate xanh 0 warning; `bunx playwright test --project=chromium` xanh trong cả hai Template (port đổi **cách khai**; đúng một giá trị đổi — E2E của `_template_vite` 3000 → 3100, lý do và cách quyết ghi ở Notes § "Sai lệch so với chữ của AC #7"); ghi output vào Notes.

## Notes

### Hình dạng đã chốt — `ports.env` + `ports.ts`

Mỗi app khai đúng hai con số ở `apps/<app>/ports.env` (`PORT=` và `E2E_PORT=`, hai dòng dữ liệu giữa
một header dài giải thích chính chúng). Cạnh đó là `apps/<app>/ports.ts` — **byte-identical ở cả hai
Template**, không mang tên app — đọc file kia bằng
`readFileSync(new URL("./ports.env", import.meta.url))` và xuất `DEV_PORT` / `E2E_PORT`. Nó chỉ
import `node:fs`, không import gì từ `src/`, không đọc `process.env` (Biome override `apps/**` cấm).

Ba kênh tiêu thụ, không kênh nào còn giữ literal:

- **Vite:** `vite.config.ts` import `./ports.ts` → `server.port = DEV_PORT`, cộng một block `preview`
  mới (`port: E2E_PORT`). `playwright.config.ts` import `E2E_PORT`; hai cờ `--port … --strictPort`
  trong `webServer.command` đã bị xoá, `command` giờ là `bun run build && bun run preview`.
- **Next:** không có kênh config nào cho port, nên `dev`/`start` trong `package.json` nạp chính file
  đó qua dotenv-cli — `dotenv -e ./ports.env -e ../../.env -- next dev|start`. `build` không đổi.
  `playwright.config.ts` import `E2E_PORT` và ép qua `webServer.env: { PORT: String(E2E_PORT) }`.
- **Generator:** `turbo/generators/config.ts` đọc và ghi lại đúng hai dòng đó (xem mục dưới).

Chọn một file `.env` chứ không phải một module TypeScript vì đây là hình dạng **duy nhất** mà cả một
script trong `package.json` lẫn một TS config đều đọc được; và vì Biome bỏ qua đuôi `.env`, regex của
generator bám vào một file dữ liệu không formatter nào định hình lại được.

### Sai lệch so với chữ của AC #7: E2E port của `_template_vite` đi 3000 → 3100

AC ở trên có hai vế đọc ngược nhau: phần liệt kê literal ghi `3000`/`3001`/`3100`/`3101` — mà `3100`
**không tồn tại ở đâu trong repo trước lượt này** — còn dấu ngoặc cuối bài nói "port đổi cách khai,
không đổi giá trị". Lượt này đọc phần liệt kê là có thẩm quyền và **lấy** con số mới: dev và e2e của
Template Vite trước đây là cùng một 3000, đúng cái bẫy mà comment của chính file cảnh báo (một
`bun run dev` bỏ quên sẽ được `reuseExistingServer` nhận làm server E2E và lượt chạy vẫn xanh). Bốn
giá trị còn lại giữ nguyên: Vite dev 3000, Next dev 3001, Next e2e 3101, Storybook 6006.

Nếu chủ ticket từ chối: đặt `E2E_PORT=3000` trong `apps/_template_vite/ports.env` và **không** cần
đổi gì khác — nhưng va dev/e2e mà ticket này sinh ra để đóng sẽ sống sót, bị `reuseExistingServer`
che đi.

Ba thay đổi hành vi đi kèm, đều nên nêu trong commit message:

- `server.strictPort: true` — port dev bận giờ là lỗi cứng thay vì âm thầm trôi sang 3001 (tức dev
  port của Template Next).
- `preview.strictPort: true` — thay hai cờ đã xoá khỏi `webServer.command`.
- `preview.open: false` — phải viết ra, vì `preview.open` fallback về `server.open` (đang `true`),
  nên trước đây mỗi lượt e2e đều bật một cửa sổ trình duyệt không dùng tới.

### Generator gán cặp port

`RuntimeSpec.portFiles` và hai chuỗi `portFiles` bị **xoá** — đó là prose người dùng đọc mà compiler
không giữ đúng được, và bản Vite vốn đã thiếu cờ `--port 3000` nằm trong `webServer.command`. Thay
vào đó: `readPorts()` (ném lỗi khi file chỉ khai một trong hai dòng), `nextFreePortPair()` (quét mọi
`apps/*/ports.env`, chọn **slot thấp nhất mà CẢ hai port đều trống**, bỏ qua bản clone vừa tạo theo
tên), `assignPorts()` (ném lỗi khi bản clone không có `ports.env`). Action chèn sau ba lần
`renameInApp`. Action cuối cùng — trước đây bảo người dùng tự sửa port bằng tay, nay là lời khuyên
sai — được viết lại: đọc lại `ports.env` từ đĩa và báo đúng cặp app đang giữ.

Cấp phát "cặp trống thấp nhất" trả slot của app đã xoá về pool; đánh đổi là hai nhánh cùng xoá hai
app khác nhau rồi cùng sinh app mới có thể phát trùng cặp. Dải cạn ở slot 99, generator ném lỗi bảo
nới cả hai dải thay vì tự chọn số.

### Đã đo, không đoán

- **dotenv-cli 11 precedence, cả hai chiều.** `override` là falsy trong `cli.js`: file `-e` đầu tiên
  thắng file sau, và một biến **đã có sẵn trong environment** thắng cả hai. Đó chính là cơ chế làm
  `webServer.env: { PORT }` của Playwright đè lên dev port mà script `start` cấp — đo cả hai chiều.
  **Đừng** "sửa" bằng `-o`/`--override` của dotenv-cli: làm vậy là phá đúng cơ chế đè này.
- **Next 16.3.4 đọc `PORT`** cho cả `dev` lẫn `start` (`.default(3000).env('PORT')` trong `bin/next`).
- **Vite 8.2.2 inject `import.meta.url` theo từng module** trong config bundle (plugin
  `inject-file-scope-variables` lọc `id: /\.[cm]?[jt]s$/`), nên `ports.ts` đọc file cạnh nó chạy đúng
  khi Vite bundle config. `loadConfigFromFile` trả về `server={port:3000,strictPort:true,open:true}`
  và `preview={port:3100,strictPort:true,open:false}`.
- **Bun 1.4.0 không expose `npm_package_*` lồng nhau** — chỉ có `npm_package_json`. Đây là lý do một
  khối `ports` trong `package.json` bị loại từ đầu.
- **Biome bỏ qua `ports.env`** (`biome check` báo path bị ignored, exit 0), nên regex của generator an
  toàn hơn hẳn regex trên một dòng TypeScript.
- Một sai lệch nhỏ so với chữ của thiết kế: `ports.ts` dùng `source.match(pattern)` chứ không phải
  `pattern.exec(source)?.[1]`. Biome gắn `noUnnecessaryConditions` cho mọi kiểm null trên
  `RegExp.exec`, mà Gate đòi 0 warning. Ngữ nghĩa không đổi — không regex nào mang cờ `g`.

### Sai lệch so với chữ của AC #1: hai literal `3000` trong Dockerfile của Next

AC #1 đòi "mọi literal `3000`/`3001`/`3100`/`3101` còn lại chỉ nằm trong comment đã được sửa cho
đúng". Sau lượt này còn đúng **hai** literal không nằm trong comment, cả hai ở
`apps/_template_next/Dockerfile`: `ENV PORT=3000` (dòng 67 sau khi thêm comment) và `EXPOSE 3000`.

Chúng **không** phải dev port hay E2E port của app: đó là port *trong* container, và container có
network namespace riêng nên nó không thể va với bất cứ server nào trên máy dev — 3000 ở đây chỉ trùng
số với dev port của Template Vite chứ không liên quan. Chúng có từ trước ticket này, generator không
viết lại chúng, và không file nào trong app tham chiếu chéo tới chúng. Lượt cuối thêm **một comment
ba dòng** ngay trên `ENV PORT=3000` nói đúng những điều đó, và `.agents/commands.md` § Development
cũng nêu đích danh hai literal này ngay sau câu "Neither number is written in a script or a config",
để câu đó không đọc thành lời hứa rộng hơn sự thật. `apps/_template_vite/Dockerfile` và
`apps/storybook/Dockerfile` đều `EXPOSE 80` nên chỉ Template Next có hình dạng này.

Ô AC #1 vẫn `[x]` vì tinh thần của nó — hai port của app khai đúng một chỗ — đã đạt trọn; nhưng chữ
của nó thì không, và chỗ này là để một người đọc sau không phải tự phát hiện điều đó.

### README của app clone: một giới hạn đã biết, không phải một ô đã đóng

`turbo/generators/config.ts` viết lại `package.json`, hai ARG trong Dockerfile và `ports.env` của bản
clone — **không** viết lại `README.md`. Nên một app sinh từ Template vẫn mang H1 `# @monorepo/_template_vite`
và vẫn ghi "Dev 3000 và E2E 3100", trong khi `ports.env` của chính nó đã là 3002/3102. Hai con số đó
là prose, nên không typecheck hay lint nào bắt được.

Lượt cuối **không** mở rộng generator để sửa (đó là thay đổi hành vi, không phải việc của một lượt
dọn hồ sơ), mà thêm một câu vào dòng `Port` của **cả hai** README nói thẳng: generator không viết lại
README, nên trong một app clone hãy đọc `ports.env` của chính nó. Nếu sau này muốn đóng hẳn: thêm một
`renameInApp` cho `README.md` trong `assignPorts`/action clone, hoặc bỏ hai con số khỏi bảng và chỉ
trỏ sang `ports.env`.

### Hồ sơ đã dọn

Ticket 01/06/07/08/09 của `personal-monorepo-rebuild`: ô "CI chưa chứng minh" `[~]`→`[x]`, trích CI
run #2 (`d964157`, 6/6 xanh, 0 annotation, `check` 41s · `typecheck` 15s · `test` 26s · `build` 39s ·
`e2e` 132s). Run #1 (`2b89265`) được nêu tên trong mọi bản viết lại như lượt **không** được trích:
`e2e` của nó đỏ dưới `continue-on-error`. Ticket 09 sửa thêm mệnh đề cũ "`turbo/` chưa track" — chính
`d964157` bác nó. Hai ô `[ ]` còn lại của 06: ô orientation/z-index `[x]` (ticket 12 đã chạy thật,
computed style trong Chromium thật trên `apps/storybook/dist`, 8/8; giữ caveat không có story Slider
dọc), ô `docker build` **để nguyên `[ ]`** vì không có log nào để ghi — `triage-labels.md` định nghĩa
`done` là verification ghi trong chính thân ticket.

`legacy/README.md`: dòng `.changeset/` nói đúng cái đang có (`README.md` + `config.json`, không
changelog — `find legacy -iname "CHANGELOG*"` trả rỗng, history nằm ở npm và git); hai dòng `-public`
trỏ ADR-0004; và bullet `**rslib + changesets**` — chỗ thứ ba mâu thuẫn với ADR-0004 — được viết lại.
`legacy/docs/README.md`: blockquote cảnh báo ngay dưới H1, và **một tiền đề của AC được sửa theo sự
thật**: `packages/db` không hề được README đó link tới (chỉ `legacy/docs/packages/DATABASE.MD` nhắc),
nên câu cảnh báo nói nó chưa bao giờ được mang vào `legacy/` thay vì gọi là link chết. Bảy link chết
thật được liệt kê đủ: `../apps/portfolio/README.md`, năm `../packages/*/README.md`, và
`./others/VERCEL-DEPLOY.md` (mục này trước ghi "sáu" — bỏ sót link cuối, dù blockquote vẫn nêu đủ
cả bảy; đã kiểm lại từng đường bằng `test -e`).

**Một ràng buộc chéo phải biết:** hai dòng `-public` và bullet `rslib + changesets` trong
`legacy/README.md` giờ trỏ `docs/adr/0004-npm-publish-qua-publish-shell.md` — file thuộc session
npm-publish đang chạy song song. Hôm nay ba đoạn đó đúng (ADR có thật, `status: accepted`,
`packages/ui-public` và `packages/hook-public` đều tồn tại trên đĩa). Nếu ADR đó bị rút lại, ba đoạn
này thành sai và phải sửa cùng lúc.

### Smoke test generator — đã chạy thật, và đọc lại từ đĩa

Chạy 2026-09-04, sau khi mọi sửa đổi của lượt này đã nằm trên đĩa. Cách chạy **không tương tác**
(ghi lại để lượt sau không phải suy ra lần nữa): `@turbo/gen` nhận plop bypass args qua `-a`, map theo
thứ tự vào hai prompt `name` và `runtime`.

```
bunx gen run app -a tmp_smoke_vite vite   → exit 0, "apps/tmp_smoke_vite took ports 3002 (dev) and 3102 (e2e)"
bunx gen run app -a tmp_smoke_next next   → exit 0, "apps/tmp_smoke_next took ports 3003 (dev) and 3103 (e2e)"
```

Con số **đọc lại từ chính bốn file `ports.env`**, không lấy lời generator tự khai — tám số phân biệt:
`_template_vite` 3000/3100, `_template_next` 3001/3101, `tmp_smoke_vite` 3002/3102, `tmp_smoke_next`
3003/3103. Dây nối cũng được kiểm: `vite.config.ts` (dòng 43, 59) và cả hai `playwright.config.ts`
(dòng 3) import `DEV_PORT`/`E2E_PORT` từ `./ports.ts`.

**Bind sống, bốn server cùng lúc** — đây mới là bằng chứng của AC #2, không phải một lượt `bun run e2e`
xanh (`reuseExistingServer` biến va port thành pass):

| URL | Kết quả | App tự xưng trong log |
| --- | --- | --- |
| `http://localhost:3000/` | HTTP 200 | `➜ Local: http://localhost:3000/` (`_template_vite`) |
| `http://localhost:3001/` | HTTP 200 | `- Local: http://localhost:3001` (`_template_next`) |
| `http://localhost:3002/` | HTTP 200 | `➜ Local: http://localhost:3002/` (`tmp_smoke_vite`) |
| `http://localhost:3003/` | HTTP 200 | `- Local: http://localhost:3003` (`tmp_smoke_next`) |

Không server nào trôi cổng, và `strictPort` ở cả hai config làm một lần va port thành lỗi cứng chứ
không phải một lần rơi cổng im lặng.

**Bẫy teardown trên Windows, ghi lại để lượt sau không dính:** dừng shell chạy nền **không** giết
tiến trình node con — cả bốn cổng vẫn trả 200 sau đó. Phải
`Get-NetTCPConnection -LocalPort <p> -State Listen` rồi `Stop-Process` theo PID chủ, sau đó `curl` lại
từng cổng và chờ `rc=7` mới coi là đã tắt.

**Dọn sạch, kiểm ở trạng thái cuối (lượt tài liệu này tự kiểm lại):**

- `ls -d apps/*/` → chỉ còn `_template_next`, `_template_vite`, `storybook`.
- Sáu dòng script generator thêm vào root `package.json` đã gỡ đúng sáu dòng: `diff` với ảnh chụp
  trước lượt sinh **rỗng**, `node -e JSON.parse` hợp lệ, và hai vùng của session npm-publish
  (`publish:smoke`, catalog `typescript ~7.0.2`) còn nguyên — cùng với các vùng khác của session đó
  (`changeset`/`version-packages`/`release`, `@changesets/cli`, catalog `@rslib/core`).
  *(Bản trước của ghi chú này trích một md5 của root `package.json`. Đã bỏ: session npm-publish thêm
  script sau lần đo đó nên con số ấy không còn dựng lại được, và một trích dẫn không kiểm lại được thì
  còn hại hơn không có. `diff` rỗng mới là bài kiểm.)*
- `bun.lock` có nhận hai stanza workspace của hai app thử (thuần cộng thêm, nằm ở worktree). Dọn bằng
  một lượt `bun install` bình thường — `2 packages removed`; `grep -c tmp_smoke bun.lock` → **0**,
  `git diff --stat bun.lock` rỗng, và `@rslib/core` của session kia còn nguyên. Không
  `bun install --force`, không `clean`, không sinh lại lockfile.

Chuỗi `tmp_smoke` duy nhất còn trong cây là prose của chính ghi chú này.

### Ticket 13 §1 — đã lật, và lật từ ticket này

Năm ô của §1 đi `[ ]`→`[x]` (bản ghi trước của mục này viết `[~]`→`[x]`; `git diff` của ticket 13 cho
thấy trạng thái cũ là `[ ]`, nên câu đó đã được sửa ở cả hai chỗ). Frontmatter của 13 **giữ nguyên**
`ready-for-agent` vì §2 và §3 còn treo đủ — đúng điều kiện AC #4 đặt ra.

### Hai cạnh sắc còn lại, đã ghi chứ không sửa

- Developer nào export sẵn `PORT` trong shell sẽ thấy `bun run dev` bind số đó thay vì `ports.env`.
  Turbo chặn dưới `turbo watch dev`, nhưng không chặn dưới `bun run --filter` trực tiếp. Đã ghi trong
  comment `webServer`.
- `ports.env` mang đuôi `.env` và nằm cạnh app nên có thể bị đọc nhầm là app config per-app — thứ
  ADR-0003 nói không tồn tại. Giảm thiểu bằng header dài trong chính file, dòng cây trong CLAUDE.md §1
  và đoạn trong `.agents/commands.md`; vẫn là một hazard tài liệu thật.

### Gate và Playwright

Gate chạy **hai lượt** (lúc bắt đầu kiểm, và lại sau smoke test generator), kết quả trùng khít:

```
bun run check      exit 0 | exit 0   → Checked 368 files in 20s. No fixes applied.
bun run typecheck  exit 0 | exit 0   → Tasks: 14 successful, 14 total
bun run test       exit 0 | exit 0   → Tasks: 10 successful, 10 total
bun run build      exit 0 | exit 0   → Tasks:  5 successful,  5 total
```

Test đếm được: `_template_next` 39 passed/6 file, `_template_vite` 11 passed/4 file, `storybook`
148 passed/3 file.

**Quét warning** `grep -inE "warn|(!)|⚠|▲"` trên cả bốn log, cả hai lượt: `check` 0, `typecheck` 0,
`test` 0, `build` **1** — và đúng một dòng đó là logo `▲ Next.js 16.3.4 (Turbopack)`. Tức **0 warning**
thật. Hai điều nói thẳng để con số này đọc đúng: (1) `typecheck` và `test` là cache hit `FULL TURBO` ở
cả hai lượt — Turbo phát lại stdout nguyên văn nên bài quét vẫn có giá trị, nhưng đó không phải một
lượt chạy nguội; (2) số file `check` là 368 chứ không phải 367 như ghi chú cũ, vì session npm-publish
thêm file — không phải drift của lượt này.

Playwright, chạy đúng hình dạng Windows của CLAUDE.md §7a (cwd là thư mục app, gọi qua `bunx`):

```
apps/_template_vite $ bunx playwright test --project=chromium   → exit 0, 7 passed (6.8s)
apps/_template_next $ bunx playwright test --project=chromium   → exit 0, 6 passed (15.5s)
```

**Một warning thật trong log `webServer` của Next, không thuộc Gate và cố ý chưa sửa:**
`'"next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.'`
— `next.config.ts:42` để `output: "standalone"` còn `playwright.config.ts` chạy `bun run build && bun run start`.
Hệ quả phải ghi cho đúng: **6 spec xanh chứng minh `next start` boot được, không chứng minh cái server
standalone mà Dockerfile thực sự ship boot được.** Khoản này thuộc ticket 13 §2 và comment trong
`next.config.ts` đã gọi tên nó.

### Lượt tài liệu cuối (sau các lượt chạy ở trên)

Lượt cuối cùng chỉ chạm **comment và prose**, không đổi một dòng hành vi nào:
`apps/*/ports.ts` (docblock nói dối: bản trong `_template_next` nhắc `vite.config.ts`, file không tồn
tại trong app đó — viết lại cho đúng ở cả hai Runtime, hai file vẫn byte-identical, md5
`59989db13fa62d162a312325ac63cc24`), một comment ba dòng trong `apps/_template_next/Dockerfile`, một
comment trong `turbo/generators/config.ts` (nới câu "can never be handed out twice" cho đúng phạm vi),
một câu trong dòng `Port` của hai README, cộng CLAUDE.md · `.agents/commands.md` · các ticket.
Kiểm lại sau lượt đó: `bun -e 'import("./ports.ts")'` trong cả hai app trả đúng 3000/3100 và
3001/3101 (tức reader vẫn chạy dưới Bun sau khi sửa comment), và `bunx biome check .` → exit 0,
`Checked 368 files in 75s. No fixes applied.`, 0 diagnostic. **Bốn lệnh Gate không chạy lại ở lượt
cuối** — lượt đó không chạm một dòng hành vi nào, và Biome là formatter/linter duy nhất đọc các file
đã sửa; ai muốn chắc tuyệt đối thì chạy lại đủ bốn lệnh, chi phí bằng đúng một lượt Gate.
