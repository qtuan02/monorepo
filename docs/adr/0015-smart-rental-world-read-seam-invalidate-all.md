---
status: accepted
date: 2026-09-18
---

# `apps/smart-rental` — một seam đọc **World**, một seam ghi invalidate-tất-cả

Sau round 3 (ADR-0013), bảy hook derived (`dashboard`, `task`, `cycle`, `report`, `reconciliation`, `tenant`, `compliance`) mỗi cái tự ghép 3–8 mảng Mock, tự áp Building scope (24 chỗ `buildingId ===`, hai bản `scope<T>` y hệt), tự gọi `deriveInvoiceStatus` (4 nơi); `buildCycleRows` nhận 9 tham số positional và `cycle-progress` gọi nó thiếu tham số thứ 9 nên KPI Kỳ ở Hôm nay lệch màn Kỳ sau "Sửa chỉ số cũ". Phía ghi, `onSuccess` của mỗi mutation liệt kê tay các key phải invalidate — `dashboard`/`report`/`tenant`/`compliance`/`cycle` không mutation nào invalidate cả, nên "Thu tiền" xong KPI đứng yên 60 s; commit `804f861` là một cạnh vá tay trong ~20 cạnh thiếu. Ba họ bản sao lưu sẵn (`Room.tenant`, `Tenant.contractEnd/room/rentAmount…`, `Building.activeContracts/occupancyRate…`) không mutation nào ghi nhưng sáu màn đọc làm sự thật — ADR-0012 §2 đang bị vi phạm chứ không bị thách thức.

Quyết định, chốt ở vòng grill 2026-09-18 (architecture review `apps/smart-rental`):

1. **Một seam đọc — World.** `buildWorld(arrays, scope, today)` là hàm thuần trong `~/utils/world.ts`; `readWorld(scope, today = new Date())` trong `~/libs/mock-world.ts` bind nó vào Mock và là **hàm duy nhất** ngoài `mutationFn` được chạm `~/constants/mock`. World trả về mọi mảng đã scope (`BuildingScope = string | null`, cấm `""`), trạng thái suy ra đã suy (Hoá đơn, Hợp đồng, Chỉ số), tên đã nối (`RoomView.tenant`, `TenantView.contractEnd`, `BuildingView.occupancyRate`… tính từ Hợp đồng live). Tám util mà một `queryFn` gọi trực tiếp nhận `(world, params)` thay cho danh sách mảng; util lá per-entity (`invoice-status`, `contract-status`, `utility-anomaly`, `invoice-payments`) giữ nguyên. Khi `be-motel` có endpoint, `readWorld` là đúng một hàm đổi.
2. **Bản sao lưu sẵn của họ "sống" và "tổng hợp" bị xoá khỏi Mock và type** — World tính lại dưới cùng tên trên `*View`, màn hình đọc không đổi. Tên trên **chứng từ** (`Invoice.tenant/room/floor`, `Contract.tenant/room/floor`) giữ nguyên: Hoá đơn và Hợp đồng là văn bản, tên lúc lập là đúng nghiệp vụ.
3. **Một seam ghi — invalidate tất cả sau mọi mutation thành công**, một dòng `MutationCache.onSuccess` trong `~/libs/query-client.ts` cạnh `onError` đã có. Mọi `onSuccess` liệt kê key trong hook bị xoá; không hook nào import `*QueryKeys` của hook khác. Mọi mutation throw `HttpError`.
4. Seam được giữ bằng **test quét text** (như `root.test.ts` của Template React Router cấm `new QueryClient(`): không file `~/hooks/api/*` nào import `~/constants/mock` hay `*QueryKeys` của file khác.

## Considered Options

- **Bảng tĩnh `entity → derived keys` trong `writeMock`**: invalidate chính xác hơn — nhưng bảng là thứ phải nuôi mỗi khi thêm một derived read, tức đúng lớp lỗi hôm nay dời lên một tầng. Mock in-memory ≤100 dòng, mọi derived read O(n): invalidate-tất-cả rẻ hơn một bảng sai. Khi có backend thật thì thu hẹp theo endpoint, tại cùng một chỗ.
- **Mỗi derived hook khai báo `dependsOn`, writer suy ra**: đúng chiều phụ thuộc nhất — nhưng thêm một registry runtime cho một Mock sắp bị thay.
- **Một query `useGetWorld`, mọi derived hook là `select` trên nó**: một cache entry, rất deep — nhưng interface của bảy hook là contract backend tương lai (ADR-0012: "chỉ lời gọi trong `queryFn` biến mất"); gộp thành `select` rồi lại tách khi có bảy endpoint.
- **Chỉ gom `scope()` và `deriveStatus` thành hai helper**: nhỏ nhất — nhưng chữ ký 7–9 positional còn nguyên, lỗi "thiếu một mảng" vẫn mở.
- **Giữ field trong Mock, World ghi đè lúc đọc**: diff nhỏ nhất — nhưng Mock mang giá trị sai và `mock-integrity` phải bỏ qua chúng.

## Consequences

- Ticket A (seam ghi + vá một dòng `cycle-progress` + `HttpError`) độc lập và merge trước; B (World + 8 util + 7 hook) là lõi; C (xoá bản sao, `*View`, màn hình) đứng sau B.
- `mock/invoices.ts` import `buildCycleDueDate` từ `~/utils` (Mock phụ thuộc util) được giữ: đó là lý do Mock và đường ghi thống nhất hạn thu.
- Glossary `apps/smart-rental/CONTEXT.md` thêm **World** cùng ngày. ADR-0012 §2 không đổi; ADR này là cách nó được thực thi.
