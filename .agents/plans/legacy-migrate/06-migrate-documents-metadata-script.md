---
status: ready-for-human
---

# 06 — Migrate `documents` lên `_template_vite`; metadata sinh bằng script từ source `ui`/`hook`

**What to build:** Site tài liệu `apps/documents` mô tả đúng 63 primitive Base UI và 5 hook mà consumer cài từ npm (`@fe-monorepo/ui`, `@fe-monorepo/hook`): cách cài, import subpath, CSS + `@source`, peer; mỗi primitive/hook có trang riêng với bảng export, link Storybook để xem demo. Metadata (`components`, `hooks`, registry) **sinh bằng script** từ source `@monorepo/ui` và `@monorepo/hook` trước `dev`/`build`, nên `ui-add` thêm primitive là site tự cập nhật. App chạy trên `_template_vite`: React Router 8, Vitest 5, env `PUBLIC_` qua `env.ts`, test dưới `test/` soi gương `src/`.

**Blocked by:** 01 — port; **`npm-publish` 02** — bề mặt publish của `ui` (exports, CSS entry, `@source`) đã chốt, để site không viết lại lần nữa.

**Status:** `ready-for-human` (2026-09-04) — xem Notes: 6/8 ô đã đạt, hai ô còn lại chờ một lượt chạy CI.

## Acceptance criteria

- [x] `apps/documents` sinh bằng `gen:app` Runtime `vite`; bản cũ `legacy/documents` chỉ để đọc (cấu trúc, bảng route, cơ chế nạp metadata ở `legacy/docs/apps/DOCUMENTS.md` §"How metadata is loaded").
- [x] Script `generate-docs-metadata` (Bun, trong app) đọc `packages/ui/src/components/*.tsx` và `packages/hook/src/*.ts`: tên file → slug, named exports (parse bằng TypeScript compiler API hoặc `oxc-parser`, không regex thô), JSDoc nếu có → ghi JSON vào `src/generated/` (gitignored, sinh ở `predev`/`prebuild`; Turbo `inputs` khai hai thư mục nguồn để cache đúng). Có unit test đọc fixture nhỏ (một `.tsx` giả, một `.ts` giả) và assert output; có test bất biến: mọi file trong hai thư mục nguồn có mặt trong output (mẫu: `catalogue-invariants.test.ts` của `@monorepo/i18n`).
- [x] Nội dung viết cho consumer `@fe-monorepo/*`: trang "Bắt đầu" (cài, peer, CSS entry, `@source`, ví dụ Button), trang mỗi primitive/hook, bảng tổng; ví dụ import dùng tên npm, không `@monorepo/*`; link sang Storybook cho demo (URL Storybook qua `PUBLIC_DOCUMENTS_STORYBOOK_URL` trong `env.ts`, quy ước tên app của ticket 03).
- [x] Routing: `ROUTES` constant + tree trong `pages/main.tsx`, builder cho `/components/:slug` và `/hooks/:slug`; guard không cần (site public) — bỏ `ProtectedRoute`/`GuestRoute`/auth slice của Template nếu không dùng, ghi vào Notes; catch-all 404 giữ.
- [x] Env: `envPrefix` `PUBLIC_` (Template), không `VITE_`; `vercel.json` rewrite SPA giữ nếu deploy Vercel; Dockerfile/nginx của Template.
- [ ] Test: `test/` soi gương `src/` cho script và cho nhánh trang primitive (slug không tồn tại → 404); ít nhất một `.e2e.ts`: mở `/`, đi tới một trang primitive qua link, thấy bảng export; xanh local và trên job `e2e` CI.
- [x] README `apps/documents` (thay hai mục còn giá trị của `legacy/docs/apps/DOCUMENTS.md`: nạp metadata, bảng route); `legacy/README.md` dòng `documents` cập nhật.
- [ ] Gate xanh 0 warning; job `docker` xanh; output vào Notes.

## Notes

**Trạng thái: `ready-for-human` (2026-09-04) — không phải `done`, và không thể là `done` từ máy này.**
Sáu trên tám ô đã tick và có bằng chứng dưới đây. Hai ô còn lại (#6 phần "xanh trên job `e2e` CI",
#8 phần "job `docker` xanh") đòi một lượt chạy trên GitHub Actions: máy này không dựng được image
(`command -v docker` rỗng), không đọc được run (không có `gh`), và lượt này bị cấm mọi lệnh git ghi
nên chưa push được nhánh. Cùng bức tường đã đẩy ticket 02 sang nhãn này — xem
[`docs/agents/triage-labels.md`](../../../docs/agents/triage-labels.md).

**Còn lại đúng ba bước:** một người push `feat/upgrade`; mở riêng job `e2e` và job matrix
`docker (documents)` (cả hai `continue-on-error: true` nên dấu tích tổng của workflow vô nghĩa ở
đây); dán URL run vào mục "Bằng chứng CI" ở cuối, tick #6 và #8, rồi đổi `status: done`.

### App được sinh, không copy tay

`gen run app --args documents vite`. Generator gán port **3003 dev / 3103 e2e** vào
`apps/documents/ports.env`. `legacy/documents/` và `legacy/docs/apps/DOCUMENTS.md` chỉ được đọc.

### Đây không phải bản port 1-1, và đó là điểm chính

Site cũ tài liệu hoá component **của workspace** và render preview sống bằng **63 file
`previews/**` viết tay**. Site mới tài liệu hoá **hai gói npm mà người ngoài cài** —
`@fe-monorepo/ui` (63 primitive) và `@fe-monorepo/hook` (5 hook) — và bỏ toàn bộ 63 file preview,
thay bằng link sang Storybook. Bề mặt publish lấy nguyên từ ticket `npm-publish` 02
(`packages/{ui,hook}-public/package.json` + README), không viết lại lần nữa.

Hệ quả về đặt tên, và đây là chỗ dễ sai nhất: **ví dụ hiển thị cho người đọc dùng tên npm**
(`@fe-monorepo/ui/components/button`), trong khi **code của chính app import tên workspace**
(`@monorepo/ui/...`). Lẫn hai cái là lỗi nội dung nghiêm trọng — người đọc copy vào dự án của họ sẽ
cài trật gói. Có một bất biến canh đúng chuyện này (xem dưới).

### Bỏ phần Template không dùng

Site public nên `ProtectedRoute` / `GuestRoute` / slice `auth` / `use-auth-store` đều bị bỏ, cùng
`hooks/api`, `libs/http-client`, `libs/query-client`, `libs/query-key-factory` và TanStack Query —
app không gọi backend nào. Catch-all 404 giữ nguyên. `ROUTES` có builder cho `/components/:slug` và
`/hooks/:slug`.

### Script sinh metadata

`scripts/generate-docs-metadata.ts` (thi hành) + `scripts/docs-metadata.ts` (nửa thuần, để test
được). Parse bằng **oxc-parser**, không regex thô. Chạy ở `predev` / `prebuild` / `pretest`, ghi
JSON vào `src/generated/` (gitignored). `turbo.json` của app khai `inputs` gồm hai thư mục nguồn nên
thêm một primitive là cache miss đúng chỗ.

Hai điều đáng ghi về hành vi của nó:

- File không parse được thì **throw kèm tên file**, không im lặng bỏ qua. Im lặng ở đây nghĩa là
  một primitive biến mất khỏi site mà không ai biết.
- Bỏ `export type` khỏi bảng export, vì bảng đó liệt kê thứ người dùng gọi được.

### Ba bất biến, và một cái vừa được thêm sau review

`test/generated/catalogue-invariants.test.ts` so **bằng tập hợp** giữa listing thư mục nguồn và slug
trong catalogue — không phải đếm số cứng 63/5, vốn sẽ xanh giả khi thêm một primitive và bỏ một cái
khác. Ngoài ra nó bắt: `importPath` phải mang tên npm chứ không phải tên workspace, và mọi entry
phải có ít nhất một export (bảng rỗng nghĩa là parser mất module, không phải primitive không export
gì).

**Bất biến thứ tư, thêm trong lượt review này:** mô tả mỗi hook được lấy bằng khoá i18n dựng động
từ slug (`documents.hooks.items.<slug>.description`, dùng ở `hook-card.tsx` và
`hook-detail.template.tsx`), mà i18next trả lại chính khoá khi thiếu. Nghĩa là thêm
`packages/hook/src/use-foo.ts` — đúng thao tác mà bất biến ở trên **bắt buộc** phải làm để nó còn
xanh — sẽ hiển thị nguyên chuỗi `documents.hooks.items.use-foo.description` cho người đọc ở hai chỗ,
mà không gì đỏ: repo không khai `CustomTypeOptions` cho i18next nên `t()` nhận mọi string và
`typecheck` vẫn xanh. Bất biến mới đòi khoá đó tồn tại trong **mọi** ngôn ngữ cho **mọi** slug sinh
ra.

Đã chứng minh nó phân biệt được, chứ không chỉ thêm rồi thấy xanh: xoá tạm
`vi.documents.hooks.items.use-debounce` thì test đỏ với `expected [ 'vi: use-debounce' ] to deeply
equal []`, và test trang chi tiết cũng phơi ra chuỗi khoá thô. Đã khôi phục.

### Hai lỗi khác do review tìm ra và đã sửa

1. **Cookie ngôn ngữ vẫn là `template_monorepo_lang`** — trùng từng ký tự với `_template_vite`,
   trong khi `apps/portfolio` migrate cùng lượt đã đổi thành `portfolio_lang`. Hai app trên cùng
   domain sẽ giành nhau một giá trị, đúng thứ comment của Template cảnh báo. Đổi thành
   `documents_lang`.
2. **`<html lang="vi">` là hằng số trong `index.html`** và không chỗ nào chạm
   `document.documentElement.lang`. Một SPA Vite không bao giờ render lại entry HTML, nên đổi ngôn
   ngữ sang tiếng Anh vẫn để screen reader đọc bằng luật phát âm tiếng Việt. `libs/i18n.ts` nay
   đồng bộ thuộc tính đó lúc khởi động và trên mỗi `languageChanged` — cùng hình dạng cầu nối mà
   `libs/dayjs.ts` đã dùng. Runtime Next không cần vì root layout sở hữu `<html>`.

### Job `e2e` trên CI trước đây không chạy app này

`.github/workflows/ci.yml` hardcode đúng hai step cho hai Template, nên 4 spec của `documents` chưa
bao giờ chạy trên CI — trong khi filter `changes.app` vẫn bật job và job **báo xanh**. Step nay tự
khám phá mọi app có `playwright.config.ts`, có `set +e` và bảng đếm lỗi để một app đỏ không nuốt mất
các app sau; `upload-artifact` đổi sang glob `apps/*/playwright-report/`. Ticket migrate sau không
phải sửa file này. Điều này quan trọng riêng với app này: spec `boots without a console error` là
chỗ **duy nhất** kiểm được `PUBLIC_DOCUMENTS_STORYBOOK_URL` đã bake vào bundle có parse nổi lúc boot
(Vite bake mà không validate), và spec đầu tiên là chỗ duy nhất chứng minh script metadata đã chạy
trong một build thật.

### Verify — output thật

```
bun run check      → Checked 503 files in 26s. No fixes applied.   (0 diagnostic)
bun run typecheck  → Tasks: 16 successful, 16 total
bun run test       → Tasks: 12 successful, 12 total
bun run build      → Tasks:  7 successful,  7 total
```

```
apps/documents → 4 passed (10.6s)     (bunx playwright test --project=chromium, cwd = thư mục app)
apps/documents test → 40 passed (7 file)
```

Trong log `webServer` của lần chạy E2E: `generate-docs-metadata: 63 components, 5 hooks →
src/generated/` rồi `vite build ✓ 2396 modules transformed`. Nghĩa là spec "đi từ trang chủ tới
trang một primitive" đang chứng minh catalogue **sinh từ `packages/ui/src/components`** trong một
build thật, chứ không phải một danh sách hard-code.

### Còn treo, đã ghi nhận chứ không lặng lẽ bỏ qua

Vòng review sinh 32 phát hiện; 10 cái nặng nhất được một agent phản biện kiểm chứng (mặc định bác
bỏ nếu không tự xác nhận được), 7 sống sót và đã xử lý. **22 phát hiện còn lại chưa ai kiểm chứng.**
Đáng theo dõi nhất thuộc app này:

- `turbo.json` task `test` khai hai thư mục nguồn ui/hook nhưng có thể thiếu thư mục thứ ba mà test
  thật sự đọc: `apps/storybook/src/stories` (bất biến link Storybook đọc nó).
- Footer bê nguyên từ Template nội bộ: mọi trang của một site tài liệu **công khai** đang hiển thị
  `footer.support` = "Cần hỗ trợ? Liên hệ quản trị hệ thống của đơn vị."
- `index.html` không có `<meta name="description">` cho một site tài liệu public.
- Trang chi tiết hook không có cột **Signature**, trong khi README được publish của chính gói thì có.
- Comment ở `select-language.tsx:64` còn nguyên văn Template (nhắc `SignInTemplate` và
  `routing-route-guards.md`, hai thứ app này đã bỏ).
- `messages` trong `@monorepo/i18n/languages` là import tĩnh `{ vi, en }`, nên mọi app bundle **toàn
  bộ** catalogue của **mọi** app — hai namespace mới làm chuyện này rõ hơn trước.

### Phiên bản gói — cố ý không in ra

Site **không in số version** của `@fe-monorepo/*` ở bất cứ đâu; trang "Bắt đầu" nói "cài bản mới
nhất" và link npm. Lý do đo được: lúc viết, `packages/ui-public/package.json` ghi `2.0.0` còn artefact
sẽ publish là `3.0.0` (npm đốt vĩnh viễn số `2.0.0` đã unpublish tháng 11/2025), và `hook` đi
`1.0.0 → 2.0.0` — hai shell lệch major. Đọc manifest lúc build sẽ render một phiên bản **không bao
giờ tồn tại trên npm**. Version là việc của Changesets; chi tiết vì sao thiếu `2.0.0` nằm trong
`packages/ui-public/README.md`. **Đừng thêm số version vào site.**

### Bằng chứng CI — **còn trống, chờ ba bước ở đầu mục Notes**

```
URL run:
job e2e (documents):
job docker (documents):
```
