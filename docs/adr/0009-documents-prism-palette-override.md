---
status: accepted
date: 2026-09-16
---

# `apps/documents` mặc hình dạng "Prism" — không sidebar, panel kính trên backdrop aurora — và override toàn bộ palette dùng chung ở tầng app

`apps/documents` là site tài liệu cho hai Publish shell `@fe-monorepo/ui` và `@fe-monorepo/hook`, clone từ `_template_vite` và vì thế mặc nguyên vỏ app-shell EMR: thanh header teal `bg-primary`, sidebar trắng 71 link, nền `#f8f8f9`, chữ `#3d4c63`. Bước design chạy ba vòng trong ngày 2026-09-16 ([`docs/design/documents-redesign.md`](../design/documents-redesign.md)): vòng 1 (Minimalism & Swiss, giữ vỏ) và vòng 2 (ba hướng Midnight / Journal / Bento) đều bị chủ repo từ chối với hai lý do nói thẳng — *layout vẫn là sidebar + nội dung* và *palette teal EMR không hợp*. Vòng 3 dựng hướng D "Prism" từ hai câu trả lời đó, chủ repo chọn bằng mắt trên mockup rồi chốt 22 quyết định ở vòng grill (§7 của brief).

Quyết định: `apps/documents` **bỏ sidebar** — điều hướng là một nav pill kính dính đầu trang, một `CommandDialog` (`⌘K` / `Ctrl K`) nhóm Component / Hook, và nút trước/sau theo thứ tự catalogue trên trang chi tiết; mọi bề mặt nội dung là **panel kính** trên một **backdrop** aurora + năm khối hình học tĩnh, hai mức cường độ theo route; mỗi entry có một **swatch** gradient sinh từ slug, tile rộng hai cột khi có từ mười export. Và app **override palette dùng chung ở tầng app**, trong `apps/documents/src/globals.css`, khối unlayered như portfolio: chín token theo `colors#17` của skill design (indigo `#4F46E5` primary, nền `#EEF2FF`, chữ `#312E81`, viền `#C7D2FE`, accent cam `#EA580C`, …) cộng `popover`/`input`/`selection` suy ra và `--radius: 1.125rem`; dark là *indigo night* cùng hue (nền `#0B0A1F`, chữ `#E0E7FF`, primary nâng `#818CF8`), không phải xám của theme và không phải đảo cực; status, chart và sidebar token giữ của theme. Chữ display là Outfit, mã là JetBrains Mono, cả hai qua `@fontsource-variable` import từ `globals.css`; body là system sans. Theme dùng chung, `packages/ui`, và mọi app khác không đổi.

## Considered Options

- **Giữ sidebar, chỉ đổi bề mặt** (vòng 1, và cả ba hướng vòng 2): rẻ nhất, không đụng điều hướng — nhưng chính hình dạng sidebar + nội dung là thứ chủ repo gọi tên là "giống template", và không bề mặt nào che được điều đó. Bị từ chối bốn lần.
- **Giữ teal EMR, chỉ override neutral như portfolio**: một tiền lệ đã có (ADR-0008), test đã có hình mẫu — nhưng chủ repo nói thẳng teal không hợp, và một site tài liệu cho gói npm **public** mặc brand của một sản phẩm EMR nội bộ là điều người ngoài không có cách nào hiểu. Đây là lý do khác với portfolio (ở đó là "CV không mặc brand nhà tuyển dụng"), nên là một ADR riêng chứ không phải sửa ADR-0008.
- **Sửa `tooling/tailwind/theme.css` sang indigo cho cả workspace**: một chỗ sửa — nhưng bốn app khác (ba Template, `mcp-weather`) đang mặc đúng palette EMR, và Storybook preview `@monorepo/ui` cũng vậy. Override ở tầng app giữ tầm ảnh hưởng đúng bằng nơi cần.
- **Override cả status color**: đồng bộ hue hơn — nhưng `destructive`/`success`/`warning`/`info` của theme đã đo AA và một status không nên đổi nghĩa giữa các app. Giữ.
- **Dark mode xám trung tính** (`.dark` của theme): an toàn, đã đo — nhưng kính trên nền xám mất hết chất Prism; **đảo cực** như portfolio thì kính + aurora ra âm bản không đo được. Chọn indigo night, đo lại từng cặp ở dark.
- **`Sheet` chứa toàn bộ 71 link trên mobile**: quen tay — nhưng là sidebar đội lốt. Mobile dùng cùng `CommandDialog`, `Sheet` chỉ mang ba mục.
- **Aurora trôi**: đẹp ở demo — nhưng vô hình khi đang đọc và thêm một nhánh reduced-motion. Tĩnh; thêm sau nếu thiếu.
- **Blur mọi bề mặt kể cả 63 tile**: đồng nhất — nhưng `backdrop-filter` trên 63 phần tử là cost GPU thật (`styles#14` ghi *drivers: blur*), và tile nằm dưới vùng aurora đã tan nên blur không thấy khác. Kính đúng năm chỗ, tile trắng đục.
- **Bảng export giữ `Table`**: không đụng ba test đang pin `role="cell"` — nhưng bảng một cột là danh sách, và chip trong `<ul>` đúng ngữ nghĩa hơn. Đổi test.
- **System stack toàn bộ, không webfont**: đúng cam kết của portfolio (build offline) — nhưng kính + aurora với chữ Segoe UI mất nửa cái "sang". `@fontsource-variable` vẫn offline lúc build (font nằm trong `node_modules`, không gọi Google Fonts), nên cam kết đó vẫn giữ; cái giá là hai dependency và ~200KB font.

## Consequences

- **Hai app override palette, hai lý do khác nhau.** ADR-0008 vẫn đúng tại thời điểm của nó ("portfolio là app duy nhất override neutral"); từ ADR này câu đó hết đúng, và câu thay thế là: *một app override palette dùng chung khi nó không phải sản phẩm EMR và có lý do ghi thành ADR*. Ba Template app và `mcp-weather` không đổi.
- **Hợp đồng token là test.** `apps/documents/test/globals.test.ts` (copy `contrast.ts` từ portfolio — app không import chéo app) ghim: đúng bộ token override ở cả `:root` lẫn `.dark`, khối unlayered, `--radius` có đơn vị, và **contrast đo trên nền kính hiệu dụng** (trắng 58% + blur trên vùng aurora tệ nhất) chứ không trên nền phẳng. Ai thêm bớt token thì sửa test trước.
- **Không còn `Sidebar` trong app này**; `docs-sidebar.tsx` xoá. Bốn E2E hiện có đổi selector (tile, chip), thêm ba spec: mở palette bằng phím và Enter vào `/components/dialog`; toggle theme rồi reload vẫn `html.dark`; trước/sau từ `dialog` sang `direction`.
- **Swatch là chữ ký, không phải category.** Hue = hash(slug); hai slug trùng hue là bình thường. Ai muốn màu theo nhóm phải thêm dữ liệu nhóm vào catalogue trước — hôm nay không có.
- **Backdrop và blur là nơi hiệu năng lộ ra.** Blur giới hạn năm chỗ; backdrop là CSS thuần không keyframe. Thêm chuyển động hay thêm blur phải đo (Storybook/E2E), không đoán.
- **Giá phải trả, đã nhận**: kính kén contrast (mọi cặp đo ở cả hai theme), hai dependency font, và site trông khác hẳn Storybook (vẫn palette EMR) — hai thứ cạnh nhau cố ý khác nhau, như `@fe-monorepo/*` và `@monorepo/*` cố ý khác tên.
- **Đảo ngược** là việc của một app: revert `apps/documents/src/globals.css` và slice `layout`; theme và app khác không dịch chuyển.
