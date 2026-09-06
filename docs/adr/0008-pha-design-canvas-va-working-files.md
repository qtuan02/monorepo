---
status: accepted
date: 2026-09-05
---

# Pha design đứng trước grill; Design canvas là nơi xem và sửa, working files commit trong `docs/design/` là nguồn thật

Workflow skill của repo (`/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` → `/code-review`) không có bước nào **sinh** ra design: `web-design-guidelines` chỉ review, `prototype/UI.md` chỉ dựng variant trên route đã có, và một spec viết bằng lời không đủ để chủ repo sửa bố cục nhiều vòng cho đúng ý. Quyết định: thêm pha **design** ngay sau `research` và **trước** `/grill-with-docs`, chạy bằng skill `design` bundled của Claude Code — Claude seed các artboard `.dc.html` thành một **Design canvas** (Artifact chạy editor Claude Design, có version), chủ repo sửa tay trong canvas rồi Save, Claude đọc lại bằng `Artifact read` + `seed-canvas.mjs --extract`, lặp đến khi chốt. Nguồn thật của design về phía repo là **working files** (`artboards/*.dc.html` + `canvas.json`) commit trong `docs/design/<topic>/` cùng `brief.md` và `design-handoff.md`; canvas chỉ là nơi xem và chỉnh, giữ lịch sử version. Khi chủ repo nói "chốt", một skill của repo (`design-handoff`, không vào `skills-lock.json`) extract lần cuối, commit, ghim URL + version, và viết **Design handoff** — screen inventory theo Runtime, component map lên `@monorepo/ui` / `~/components`, token delta so với `tooling/tailwind/theme.css`, state list, copy cần dịch — làm input cho grill và là thứ spec dẫn tới. Nền tảng: [`docs/research/ui-ux-skills-design-workflow.md`](../research/ui-ux-skills-design-workflow.md).

## Considered Options

- **Design sau grill**: domain chốt trước, design chỉ minh hoạ. Nhưng grill khi đó không có artefact cụ thể để stress-test — screen inventory và token delta của handoff mới cho grill câu hỏi thật (màn này data từ loader hay Query, guard ở đâu, ICU key nào); và skill `design` đã có vòng hỏi riêng về hướng thẩm mỹ (2–4 Direction cho chủ repo chọn), grill lặp lại là thừa.
- **Chỉ ghi URL Artifact + version, không commit `.dc.html`**: repo gọn, nhưng Artifact nằm trên hạ tầng Anthropic theo retention của tài khoản; mất nó là `/to-tickets` và `/implement` mất nguồn cite. Repo `qtuan02/monorepo` là public nên mockup sẽ public — chấp nhận, cùng kỷ luật với issue body.
- **claude.ai/design bản đầy đủ + `DesignSync`** (đẩy `packages/ui` lên một design-system project, vẽ trên web app): editor mạnh hơn và có handoff bundle, nhưng cơ chế handoff về repo và skill `/design-sync` chưa xác minh trên máy này, và design sống ngoài repo. Để thử riêng sau khi canvas chạy được 2–3 topic; theo dõi bằng một issue.
- **UI UX Pro Max** (`nextlevelbuilder/ui-ux-pro-max-skill`) làm xương sống: output là markdown quyết định style + CSV search, không có mockup, không có vòng sửa tay — không đáp ứng yêu cầu cốt lõi. Giữ vai phụ, cài **global** dùng thử (cần Python 3 trên máy dev), chỉ cho style direction khi app chưa có brand và tra checklist `--stack shadcn` / `--domain ux`; không vendor vào `.agents/skills/` (≈3,5 MB dữ liệu, `${CLAUDE_PLUGIN_ROOT}` chỉ đúng khi cài plugin, hash drift). Không cài skill `design` của họ vào project vì nó override `/design` bundled.
- **Mở rộng skill `to-spec` vendored để đọc `.dc.html`**: vi phạm §8 CLAUDE.md — sửa skill vendored làm drift hash trong `skills-lock.json`.

## Consequences

- `docs/design/<topic>/` là thư mục mới bên cạnh `docs/research/` và `docs/adr/`; **`!docs/design`** vào `files.includes` của `biome.json` (working files do `seed-canvas.mjs` sở hữu, format lại là diff ồn mỗi vòng, giống `.react-router/`; viết không có `/**` vì Biome 2.5 tự cảnh báo `useBiomeIgnoreFolder` với dạng kia, và đó cũng là dạng `!**/build` bên cạnh đang dùng) và **`docs/design/**/*.html`** + **`!docs/design/**/*.dc.html`** vào `.gitignore` (file seeded ≈2,5 MB chỉ là bao bì). Hai pattern chứ không phải một `*.canvas.html`: `seed-canvas.mjs` đặt tên file seeded **theo tên của design** — nó còn chủ động từ chối các tên chung như `design.html`/`canvas.html` — nên không có hậu tố cố định để bám, và đuôi file là dấu hiệu duy nhất đáng tin. Vì `*.dc.html` cũng khớp `*.html`, dòng phủ định phải đứng sau (git lấy pattern khớp cuối cùng).
- Sau khi spec mở, canvas **vẫn sửa được**: mỗi lần sửa là một version mới, phải cập nhật handoff và comment vào spec issue; spec luôn trỏ một version cụ thể. Không có cơ chế khoá canvas.
- Token delta chia hai loại: **thêm** token → một ticket "token delta → `theme.css`" chặn các ticket UI; **đổi** token brand hiện có (port từ web-emr) → ADR trước, vì ảnh hưởng mọi app.
- `prototype/UI.md` không bị thay: `/to-tickets` quyết theo từng ticket khi màn hình đã tồn tại và handoff còn nghi ngờ bố cục. Canvas không embed screenshot primitive từ Storybook — bước 0 của skill `design` đã lift giá trị thật từ `theme.css` và `packages/ui`.
- Feedback ngoài chủ repo đi qua comment trên spec issue (comment trên Artifact không có với plan Pro/Max).
- Bốn term mới trong `CONTEXT.md`: **Design brief**, **Direction**, **Design canvas**, **Design handoff**. Brief và handoff viết tiếng Việt theo §7a; `brief.md` do Claude viết ở đầu bước design từ research note + `theme.css` + `packages/ui`, chủ repo duyệt rồi mới seed Direction.
- Điều kiện vận hành nằm ngoài code: tài khoản có capability Artifact `self`/`artifact` (đã xác minh trong phiên chốt ADR này) để Save hoạt động; không có nó thì bước sửa tay thu về xem + export PNG/PDF + nói cho Claude sửa.

## Cập nhật 2026-09-05 — canvas chạy local-only, bản chốt là một commit

Pilot [#95](https://github.com/qtuan02/monorepo/issues/95) chạy ngay sau khi ADR này được chấp nhận, và
chủ repo chốt thêm một điều kiện ADR chưa lường: **không publish gì lên web** — không Artifact trên
claude.ai, không dịch vụ ngoài. Design ở lại trong repo; `qtuan02/monorepo` vốn public nên mockup vốn đã
public, không cần thêm một bản sao trên hạ tầng ngoài.

Đây đúng là nhánh dự phòng đoạn cuối phần Consequences đã lường trước ("không có capability đó thì bước
sửa tay thu về xem + export PNG/PDF + nói cho Claude sửa"), chỉ khác ở chỗ nó được chọn chứ không phải bị
ép. Bốn chỗ trong ADR này phải đọc lại theo:

- **Không có Artifact, không có URL, không có số version.** Danh tính một bản chốt là **commit** của
  `docs/design/<topic>/artboards/`. Mọi chỗ trên nói "ghim URL + version" đọc là "ghim commit"; spec vẫn
  trỏ một bản cụ thể chứ không phải "bản mới nhất".
- **Không có nút Save**, vì Save cần một trang hosted. Vòng lặp là: chủ repo mở file seeded bằng browser,
  nói cần đổi gì → Claude sửa `.dc.html` → re-seed → mở lại.
- **`seed-canvas.mjs --extract` vẫn là công cụ đọc lại**, nhưng đối tượng của nó là file seeded local chứ
  không phải một trang published. Không còn `Artifact read`, và không còn conflict giữa hai người Save.
- **Capability Artifact không còn là điều kiện vận hành.** Điều kiện còn lại chỉ là skill `design` bundled
  có mặt ở phiên đang chạy — `.agents/skills/design-handoff/SKILL.md` nói cách tìm `seed-canvas.mjs` của
  nó thay vì hard-code một đường dẫn theo version Claude Code.

Phần còn lại của ADR — design đứng trước grill, working files là nguồn thật, phân loại token delta,
UI UX Pro Max giữ vai phụ, bốn term trong `CONTEXT.md` — không đổi.

## Cập nhật 2026-09-06 — zero-tooling: artboard HTML tĩnh + `index.html`, skill `design` của repo

Mục cập nhật trên bỏ được Artifact, nhưng vẫn để lại một lớp công cụ giữa chủ repo và design: skill
`design` **bundled** phải có mặt ở đúng phiên đang chạy (hai file trong một thư mục tạm theo version
Claude Code, phải `find` mỗi phiên), `node` để seed, một file seeded ≈2,5 MB gitignore, rồi `--extract`
ngược lại khi chốt — cộng UI UX Pro Max cài global cần Python 3. Chủ repo đặt lại yêu cầu: **giảm phụ
thuộc tối đa, không cài thêm bất kỳ thứ gì**, một dev clone repo là chạy được pha design.

Note research [`design-phase-minimal-dependency.md`](../research/design-phase-minimal-dependency.md)
(2026-09-06) chỉ ra phần lớn lớp đó là thừa: 7/7 artboard `.dc.html` của pilot đã là **HTML tĩnh thuần**
mở thẳng bằng browser được; canvas mở từ `file://` là **Read-only** nên `--extract` luôn trả về đúng bản
đã commit — hai bước đầu của `design-handoff` đang bảo vệ một trường hợp không thể xảy ra; và trên
`file://` Chrome load được cả ảnh trỏ tương đối leo bốn cấp sang `apps/<app>/src/assets/` lẫn một
`index.html` lưới `<iframe>`, không cần cờ nào. Quyết định: **phương án zero-tooling**. Sáu chỗ trên phải
đọc lại theo:

- **Không còn seed, không còn `--extract`, không còn file seeded.** Design canvas **là** tập
  `artboards/*.dc.html` — mỗi file một artboard, HTML tĩnh tự chứa, CSS inline lift từ `theme.css` — cộng
  một `index.html` commit cùng chỗ. Chủ repo double-click `index.html`; vòng sửa là nói cần đổi gì →
  Claude sửa `.dc.html` → F5. Không có bước re-seed ở giữa, và bước chốt không đọc lại gì ngoài chính
  các file đã commit.
- **`canvas.json` bỏ ở mọi topic.** Thứ tự và phân trang của editor giờ là bố cục của `index.html` (mục 1
  Direction đã chọn + artboard chi tiết, mục 2 "Đã loại" thu nhỏ); annotation đã nằm trong `brief.md`, và
  Direction nào thắng cũng đọc từ `brief.md` chứ không phải từ metadata.
- **Skill `design` là của repo**, `.agents/skills/design/`, viết theo §8 và **cố ý trùng tên** để đè bản
  bundled trong project này. Nó không seed, không gọi `node`, không chạm mạng. Cùng với `design-handoff`,
  đó là hai skill của repo không nằm trong `skills-lock.json`.
- **Ảnh trỏ tương đối sang asset thật của app** (`apps/<app>/src/assets/…`), không copy vào `artboards/`
  — hết mối lo một bản sao trôi khỏi bản gốc, và mockup nhìn đúng như màn hình thật.
- **Đuôi `.dc.html` giữ nguyên, nhưng chỉ vì không đổi tên là đổi ít nhất** — không phải một lời hứa
  "seed lại được khi cần": `canvas.json` đã bỏ, nên không còn đường quay lại canvas pan/zoom mà không
  dựng lại metadata. Dòng `<script src="./support.js">` bỏ.
- **UI UX Pro Max bỏ hẳn** — không còn vai phụ, không còn phụ thuộc Python nào repo phải nhớ. Note
  research cũ [`ui-ux-skills-design-workflow.md`](../research/ui-ux-skills-design-workflow.md) giữ nguyên
  làm lịch sử.

Hệ quả trên hai file cấu hình: **hai dòng `docs/design/**/*.html` + `!docs/design/**/*.dc.html` trong
`.gitignore` bỏ** — không còn bao bì để loại trừ, mọi file dưới `docs/design/` đều là nguồn thật và đều
track. `!docs/design` trong `biome.json` **ở lại**, nhưng lý do đổi: không phải "output của một seed
helper", mà là mockup Claude viết tay với inline style — format lại chỉ sinh diff ồn.

Phụ thuộc còn lại của cả pha design: **một browser**. Phần còn lại của ADR — design đứng trước grill,
working files commit là nguồn thật, một **commit** của `artboards/` định danh một bản chốt, phân loại
token delta (thêm → ticket chặn; đổi token brand → ADR trước), bốn term trong `CONTEXT.md` — không đổi.
Hai chỗ trong Consequences ở trên chỉ đổi **cách đọc**, không đổi ý: "chủ repo duyệt rồi mới seed
Direction" đọc là "rồi mới **vẽ** Direction", và "bước 0 của skill `design`" nay là skill của repo, không
phải bản bundled. Nghĩa của **Design canvas** trong `CONTEXT.md` cũng đã viết lại theo mục này, dù bản
thân term thì vẫn là một trong bốn term đó.
