# `apps/documents` — glossary

Context của app `documents` (Runtime Vite client): site tài liệu cho hai Publish shell
`@fe-monorepo/ui` và `@fe-monorepo/hook`, đọc bởi consumer cài từ npm. Thuật ngữ dùng chung của
repo (Runtime, Flavor, Template app, Gate, Locale message, Publish shell) ở
[`CONTEXT.md`](../../CONTEXT.md) gốc; file này chỉ ghi từ vựng riêng của app, chốt lần đầu ở
vòng grill 2026-09-16 của redesign hướng D "Prism"
([brief](../../docs/design/documents-redesign.md) §2c, [ADR-0009](../../docs/adr/0009-documents-prism-palette-override.md)).

## Language

**Catalogue**:
Danh sách entry của một gói được publish — một cho component, một cho hook — sinh lúc build từ
source của `packages/ui` và `packages/hook`, không viết tay. Một entry là slug, subpath, chuỗi
import và danh sách export; thứ tự trong catalogue là thứ tự hiển thị và thứ tự trước/sau.
_Avoid_: registry, metadata (là cách sinh ra nó, không phải nó), danh sách component.

**Panel kính**:
Bề mặt nội dung của site: nền trắng bán trong suốt, làm mờ những gì phía sau, một viền sáng và
bóng nhiều tầng cùng một thang (utility `glass`, component `GlassPanel`). Là mọi bề mặt nội dung
của site: nav pill, palette tìm kiếm; ở Getting Started là hero, capsule lệnh cài, ba card nổi và
bốn section đánh số; ở trang chi tiết là thanh công cụ, hero và hai panel Import / Export; và panel
404 tại chỗ. Tile **không** phải panel kính, footer cũng không.
_Avoid_: card, glass card, surface.

**Backdrop**:
Lớp trang trí `aria-hidden` nằm sau mọi panel: bốn vệt màu aurora và năm khối hình học
(vòng, ô vuông xoay, tam giác, lưới chấm, sọc), tan dần về nền phẳng trước khi tới đoạn văn.
Có hai mức — **full** ở Getting Started, **soft** ở mọi trang khác (nửa độ đậm, chỉ vòng và lưới
chấm) — và không chuyển động; dưới `md` chỉ còn aurora, vì khối hình sẽ đè lên tiêu đề.
_Avoid_: background, hero gradient, hình nền.

**Swatch**:
Ô gradient nhận diện của một entry, hue sinh xác định từ slug nên cùng slug luôn cùng màu ở tile,
ở palette tìm kiếm và ở hero trang chi tiết. Không mang nghĩa; là chữ ký thị giác của entry.
_Avoid_: icon, avatar, màu category (không có category nào cả).

**Tile**:
Một entry trong lưới danh sách: swatch, slug, một dòng export và số export. Bề mặt trắng đục
không làm mờ; rộng hai cột khi entry có từ mười export trở lên — quy tắc là dữ liệu, không xếp tay.
Trên phone tile là **một hàng**, swatch bên trái — cùng bốn thành phần, chỉ khác cách xếp; từ
tablet trở lên là ô dọc như mọi khi (chốt ở vòng responsive 2026-09-18).
_Avoid_: card, bento box, ô, row (hàng là cách xếp của tile, không phải một thứ khác).

**Nav pill**:
Thanh điều hướng duy nhất của site: một panel kính dạng viên thuốc, dính đầu trang, mang brand,
ba mục, ô mở palette tìm kiếm và các nút tròn (ngôn ngữ, theme, npm, Storybook). Site không có
sidebar; palette tìm kiếm (`⌘K` / `Ctrl K`) và nút trước/sau là cách vào 68 trang còn lại.
_Avoid_: header, sidebar, thanh menu.
