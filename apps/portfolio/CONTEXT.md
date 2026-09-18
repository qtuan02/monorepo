# `apps/portfolio` — glossary

Context của app `portfolio` (Runtime Next). Thuật ngữ dùng chung của repo (Runtime, Flavor,
Template app, Gate, Locale message) ở [`CONTEXT.md`](../../CONTEXT.md) gốc; file này chỉ ghi
từ vựng riêng của app, chốt lần đầu ở vòng grill 2026-09-06.

## Language

**CV site**:
Chính app này: một trang, đọc theo thứ tự một bản CV — hero → giới thiệu → quá trình làm việc →
dự án → kỹ năng → học vấn → liên hệ. Một cột trên điện thoại; từ tablet dọc (`md`) là **cột đọc** + **rail**
(xem dưới), thứ tự DOM không đổi. Quá trình làm việc là phần chính; dự án là
phần phụ **học và demo**, đáng một link chứ không đáng một pitch (#125). Người đọc là nhà tuyển dụng và crawler.
_Avoid_: portfolio (gợi ý dự án đứng trước công việc), landing page, trang cá nhân

Từ redesign v2 (spec #113, 2026-09-16, [ADR-0008](../../docs/adr/0008-portfolio-neubrutalist-neutral-override.md))
trang có thêm một tầng từ vựng về **hình dạng**; cấu trúc CV ở trên không đổi.

**Khối tiêu chuẩn** (`StandardBlock`):
Hình khối duy nhất mọi section sau hero vẽ lên — viền 2px, bóng đặc, góc vuông, nền card — và là
một component (`src/features/home/components/standard-block.tsx`), không phải hằng className.
Mang cả nửa `print:` của mình. Mười khối trên trang từ #125; E2E đếm đúng số đó.
_Avoid_: card (gợi primitive `Card` bo tròn của `@monorepo/ui`, đã bỏ), box.

**Cửa sổ terminal**:
Riêng hero: một khối tiêu chuẩn có thêm thanh tiêu đề (ba chấm + đường dẫn), thân in theo thứ tự
một shell — dấu nhắc + lệnh rồi nội dung. Ẩn dụ dùng đúng một lần trên trang; không section nào
khác có thanh tiêu đề. Thanh tiêu đề và dòng lệnh là trang trí (`aria-hidden`, không in).
_Avoid_: window cho bất kỳ khối nào khác.

**Dòng lệnh**:
Cặp dấu nhắc `$` + tên lệnh (`whoami`, `cat role.txt`, `current --job`) mở đầu một mục trong hero.
Tên lệnh là **code**: giữ tiếng Anh ở mọi locale, chỉ văn xuôi sau nó dịch; `test/messages.test.ts`
ghim hai locale giống hệt nhau ở `portfolio.hero.commands.*`.
_Avoid_: prompt (mơ hồ với prompt của AI), lời chào.

**Highlight**:
Cặp token vàng `--highlight` / `--highlight-foreground`, đúng **hai vai**: nền nút Email ở hero và
badge giải VDA 2025 ở hàng Arobid. Không phải accent thứ hai dùng tự do — indigo vẫn là màu của
link, dấu nhắc, số thứ tự, focus ring.
_Avoid_: accent (đã là tên của cặp indigo `--accent`), vàng "nền".

**Bóng đặc** (hard shadow):
Bóng lệch góc `4px 4px 0 0`, không blur, màu `--hard-shadow` — token riêng để light (đen) và dark
(trắng) đổi cùng viền. Utility `shadow-hard`, dock dùng chung từ #124.
_Avoid_: drop shadow, elevation.

**Đảo cực**:
Cách dark mode của app này quan hệ với light: nền gần đen, chữ + viền + bóng gần trắng — bản âm
của light chứ không phải bản làm mờ. Hệ quả: mọi tỉ lệ tương phản đo lại riêng cho dark.
_Avoid_: dark mode "dịu", dimmed.

**Rail**:
Cột bên phải từ `md` — 2/5 ở tablet dọc, 1/3 từ `lg` — dính khi cuộn ở cả hai, chứa phần tham
chiếu — kỹ năng, học vấn, liên hệ, sở thích (section 5–8). Bên trái là **cột đọc** — 3/5 rồi 2/3 —
giới thiệu, quá trình làm việc, dự án (section 2–4). Ngưỡng `md` chốt ở vòng responsive
2026-09-18: một cột 720 px cho ~100 ký tự/dòng. Hero trải cả hai. Hai nhóm đúng là thứ tự DOM cắt làm đôi, nên không có gì được sắp lại
về mặt đọc. (#123)
_Avoid_: sidebar (gợi điều hướng), cột phụ.

**Lún** (press):
Trạng thái hover của **mọi** khối tiêu chuẩn, hero lẫn khối tĩnh, và của thanh dock: khối dịch 2px
về phía bóng và bóng rút từ 4px về 2px (utility `shadow-hard-pressed`, cặp với `shadow-hard`).
Trên trang này lún là chất liệu, không phải lời hứa bấm được (#124 mở rộng từ #123, vốn chỉ cho
khối bấm được). Riêng **control trong dock** không lún theo hover — thanh đã lún rồi — mà lún 1px
khi bấm (`:active`). Ngược với "nhấc" (lift) của v1. Ngoại lệ (2026-09-18): dưới `sm` dock là **thanh chạm đáy**
(xem dưới) và không lún — một thanh full-width dịch 2px sẽ hở khe; control trong nó vẫn lún 1px khi bấm.
_Avoid_: lift, hover scale.

**Neutral override**:
Hai token `--foreground` và `--border` app đẩy về hai cực ở tầng app (`src/globals.css`, unlayered),
khác với theme EMR dùng chung; `--muted-foreground` cố ý **không** thuộc nhóm này. App duy nhất
trong workspace làm vậy; hợp đồng ghim ở `test/globals.test.ts`.
_Avoid_: đổi theme, sửa `tooling/tailwind`.

**Thanh chạm đáy** (dock dưới `sm`):
Hình dạng của dock trên điện thoại từ vòng responsive 2026-09-18: cùng `<nav>` và năm control ấy,
nhưng trải hết bề rộng viewport, chạm mép dưới, chỉ còn viền trên, không bóng, không lún; nhãn ngôn
ngữ rút thành mã (`VI`/`EN`). Từ `sm` trở lại là **pill nổi** — khối `w-max` giữa màn, có
bóng đặc và lún — đúng dock của v2. Một dock, hai hình theo breakpoint; không phải bottom nav
(không điều hướng trong app).
_Avoid_: bottom nav, tab bar, dock "mobile" như một component riêng.
