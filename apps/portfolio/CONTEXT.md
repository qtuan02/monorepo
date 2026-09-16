# `apps/portfolio` — glossary

Context của app `portfolio` (Runtime Next). Thuật ngữ dùng chung của repo (Runtime, Flavor,
Template app, Gate, Locale message) ở [`CONTEXT.md`](../../CONTEXT.md) gốc; file này chỉ ghi
từ vựng riêng của app, chốt lần đầu ở vòng grill 2026-09-06.

## Language

**CV site**:
Chính app này: một trang, một cột, đọc theo thứ tự một bản CV — hero → giới thiệu → quá trình
làm việc → dự án → kỹ năng → học vấn → liên hệ. Quá trình làm việc là phần chính; dự án cá nhân
là phần phụ chứng minh bằng link. Người đọc là nhà tuyển dụng và crawler.
_Avoid_: portfolio (gợi ý dự án đứng trước công việc), landing page, trang cá nhân

Từ redesign v2 (spec #113, 2026-09-16, [ADR-0008](../../docs/adr/0008-portfolio-neubrutalist-neutral-override.md))
trang có thêm một tầng từ vựng về **hình dạng**; cấu trúc CV ở trên không đổi.

**Khối tiêu chuẩn** (`StandardBlock`):
Hình khối duy nhất mọi section sau hero vẽ lên — viền 2px, bóng đặc, góc vuông, nền card — và là
một component (`src/features/home/components/standard-block.tsx`), không phải hằng className.
Mang cả nửa `print:` của mình. Mười hai khối trên trang; E2E đếm đúng số đó.
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
(trắng) đổi cùng viền. Utility `shadow-hard`; dock spell riêng vì không phải khối của trang.
_Avoid_: drop shadow, elevation.

**Đảo cực**:
Cách dark mode của app này quan hệ với light: nền gần đen, chữ + viền + bóng gần trắng — bản âm
của light chứ không phải bản làm mờ. Hệ quả: mọi tỉ lệ tương phản đo lại riêng cho dark.
_Avoid_: dark mode "dịu", dimmed.

**Neutral override**:
Hai token `--foreground` và `--border` app đẩy về hai cực ở tầng app (`src/globals.css`, unlayered),
khác với theme EMR dùng chung; `--muted-foreground` cố ý **không** thuộc nhóm này. App duy nhất
trong workspace làm vậy; hợp đồng ghim ở `test/globals.test.ts`.
_Avoid_: đổi theme, sửa `tooling/tailwind`.
