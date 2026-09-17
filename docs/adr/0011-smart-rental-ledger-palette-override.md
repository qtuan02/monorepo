---
status: accepted
date: 2026-09-17
---

# `apps/smart-rental` mặc hình dạng "Hôm nay" — Building scope là tabs của shell, màn đầu là hàng đợi việc — và override accent dùng chung ở tầng app

`apps/smart-rental` là Portal vận hành cho chủ nhà, clone từ `_template_vite`, pha 1 (spec #127) port 1:1 prototype `fe-motel-rsbuild` trên Mock và không đổi vỏ. Research pha 2 ([`docs/research/smart-rental-rebuild.md`](../research/smart-rental-rebuild.md)) tìm ra hai lỗ hổng lớn hơn mọi lỗi vặt: Building scope áp không đều (7/18 màn quên) và Tổng quan là ảnh (Mock riêng, không suy từ dữ liệu). Bước design ([`docs/design/smart-rental-redesign.md`](../design/smart-rental-redesign.md)) đưa ba hướng, chủ repo chọn **C với bề mặt A** ở vòng grill 2026-09-17 và chốt 37 quyết định (§10 của brief).

Quyết định: **Building scope là một hàng tabs của shell** ngay dưới header (tối đa sáu Toà nhà, từ bảy đổi sang `Select`), không phải một `Select` ở góc phải — vì scope là *nơi đang đứng*, và một màn hình không thể "quên" thứ nằm trong shell. Màn đầu sau đăng nhập là **Hôm nay**: ba con số của scope và danh sách Việc cần làm suy từ dữ liệu, mỗi mục mang hành động làm ngay; biểu đồ xuống dưới. Mobile có bottom nav năm ô. Bề mặt là **phẳng**: hairline `--border`, không bóng ngoài `popover`/`dialog`, `--radius: 0.375rem`, số `tabular-nums`. Và app **override accent dùng chung ở tầng app**, trong `apps/smart-rental/src/globals.css`, khối unlayered như portfolio và documents: `--primary` navy `#1E3A5F` theo `colors#105` (Invoice & Billing), `--ring`/`--sidebar-primary` theo nó, nền `#F8FAFC`, chữ `#0F172A`, muted `#475569`, accent `#EFF6FF`; **giữ** `--success/--warning/--info/--destructive` và `--chart-*` của theme (một status không đổi nghĩa giữa các app — cùng điều kiện ADR-0009 đặt). Khối `.dark` viết sẵn cùng hue nhưng chưa có toggle. Chữ là IBM Plex Sans qua `@fontsource-variable/ibm-plex-sans` (có subset `vietnamese`), import từ `globals.css`. Theme dùng chung, `packages/ui`, và mọi app khác không đổi.

## Considered Options

- **Giữ neutral shadcn, chỉ sửa lớp nền** (hướng A không palette): không cần ADR — nhưng shadcn neutral là đen/xám, và back-office cần một accent hành động tách khỏi neutral để "Đã thuê", nút chính và tab đang chọn không cùng màu xám (defect C.1 #4 của research). Lý do khác ADR-0008 (CV không mặc brand nhà tuyển dụng) và ADR-0009 (site npm public không mặc brand EMR): ở đây là *công cụ vận hành cần một màu để chỉ hành động*, nên là ADR riêng.
- **Sửa `tooling/tailwind/theme.css` cho cả workspace**: một chỗ sửa — nhưng đó là quyết định cho bốn app khác và Storybook, không phải của app này.
- **Hướng B — sidebar tối + bento**: ấn tượng màn đầu — nhưng bento chỉ đẹp ở một màn (`styles#39` ghi *Do-Not: dense data tables*), 29 màn còn lại vẫn là A, và sidebar tối là nửa đường tới dark mode chưa ai quyết.
- **Scope là `Select` ở header như pha 1**: rẻ, không đổi shell — nhưng đó chính là hình dạng để 7 màn quên scope mà không ai thấy.
- **Tổng quan là bảng thống kê + biểu đồ** (pha 1): quen mắt — nhưng chủ nhà mở app để biết *phải làm gì hôm nay*, và mọi con số ở đó đang là ảnh.
- **Be Vietnam Pro**: đẹp nhất cho tiếng Việt — nhưng fontsource chỉ có bản static, import từng weight, lệch pattern một dòng của documents. IBM Plex Sans variable có subset `vietnamese` và hợp bảng số.

## Consequences

- `apps/smart-rental/src/globals.css` mang khối `:root`/`.dark` unlayered và `apps/smart-rental/test/globals.test.ts` (copy `contrast.ts` của portfolio) là hợp đồng: mỗi cặp nền/chữ đo AA, không import chéo app.
- `AppHeader`, `BuildingSelector` và test shell đổi hình; thêm `bottom-nav.tsx` trong slice `layout`. Test seam `test/pages/main.test.tsx` giữ.
- `ADR-0008` không còn đúng ở câu "app duy nhất override" — đã có ba; không sửa lại 0008, chuỗi ADR tự nói điều đó.
