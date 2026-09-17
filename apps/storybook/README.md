# `@monorepo/storybook`

Workshop cho `@monorepo/ui` (63 primitive Base UI) và `@monorepo/hook` (18 hook) —
mặt tiền công khai của hai gói **được publish lên npm** (`@fe-monorepo/ui`,
`@fe-monorepo/hook`, xem ADR-0004). Mỗi trang primitive trên `apps/documents`
nhúng story `Default` của app này qua iframe làm ví dụ sống, và nút "Storybook"
mở thẳng trang Docs của primitive đó — nên quy ước ở đây là quy ước người đọc
`documents` nhìn thấy, không chỉ là gu riêng của app.

```bash
bun run --filter @monorepo/storybook dev      # http://localhost:6006
bun run --filter @monorepo/storybook build     # storybook build → dist/
bun run --filter @monorepo/storybook test      # Vitest — mọi story compose qua preview.tsx thật
```

Không có `ports.env` — port `6006` là literal duy nhất trong `package.json`, đặt
ngoài dải `3000+n` / `3100+n` vì app không có E2E server của riêng nó.

## Contract với `documents` — bất biến

- `title` của mọi primitive là `Storybook/<Name>`, của mọi hook là `Hooks/use<Name>`.
  `apps/documents/scripts/generate-docs-metadata.ts` dẫn xuất id
  `storybook-<slug>--docs` / `storybook-<slug>--default` /
  `hooks-<slug>--default` từ đúng hai prefix này — đổi prefix là phá link đã
  deploy.
- Mọi file có story tên **`Default`**. Đây là story `documents` nhúng qua iframe
  làm ví dụ đầu tiên người đọc thấy, nên `args` mặc định của nó luôn là tổ hợp
  đẹp nhất, không phải tổ hợp đơn giản nhất. Ngoại lệ duy nhất: `accordion`
  (hai story `Single`/`Multiple`, bảng override của generator chọn `single` —
  ghi ở README của `documents`; convention test mirror qua `NO_DEFAULT_EXPORT`).
- Trang **Introduction** đứng ngoài hai prefix trên (`title: "Introduction"`,
  top-level) — generator của `documents` không dẫn xuất gì từ nó nên đổi tên
  story bên trong (`Welcome`) không ảnh hưởng contract.

## Stage, width, dark mode — `preview.tsx`

Một decorator toàn cục bọc mọi story (trừ `parameters.layout === "fullscreen"`)
trong một **stage panel**: vùng ngoài `bg-background` chỉ còn một rim mỏng, bên
trong là khung `rounded-xl border bg-card` căn giữa nội dung với min-height cố
định — chọn sao cho stage lấp gần hết chiều cao 320px của iframe `documents`
nhúng `Default` vào. `documents` bỏ khung riêng của iframe (`border`/`bg-card`)
đúng vì khung duy nhất giờ ở đây.

Width của nội dung bên trong stage khai qua `parameters.stage.width`, một thang
bốn giá trị — không tự bọc `max-w-*`/`w-[…]` ở wrapper story nữa:

| `stage.width` | Class | Khi nào dùng |
| --- | --- | --- |
| `sm` | `max-w-sm` | một control đơn lẻ, hẹp |
| `md` (mặc định khi không khai) | `max-w-md` | phần lớn story |
| `lg` | `max-w-lg` | card, form nhiều field |
| `full` | không giới hạn | bảng, layout rộng, carousel |

Kiểu `Parameters` của `@storybook/react` được mở rộng (module augmentation
trong `preview.tsx`) để `stage.width` chỉ nhận bốn giá trị trên — một giá trị
ngoài thang là lỗi typecheck. Convention test (dưới) là lớp kiểm thứ hai, chạy
được kể cả khi augmentation không bắt lỗi. Width *bên trong* một component (một
cột table, một `Skeleton` `w-3/5`) là nội dung, không phải wrapper — giữ
nguyên, không đổi sang `parameters.stage.width`.

Dark mode là một toolbar item **theme** (`light`/`dark`, icon chuẩn của
Storybook, `initialGlobals.theme = "light"`) cộng một decorator tự viết — không
cài `@storybook/addon-themes`. Decorator đồng bộ class `dark` lên
`document.documentElement` bằng một effect (hợp lệ theo
`react-effects-sync-only`: đây là đồng bộ vào một external system, không phải
tính toán state). Đồng bộ ở `documentElement` — không phải một wrapper div — là
lý do một overlay portal ra `body` (Dialog, Popover, Tooltip, Toast) cũng đổi
theme: `@custom-variant dark` của theme là `:where(.dark, .dark *)`.

`options.storySort.order = ["Introduction", "Storybook", "Hooks"]` giữ thứ tự
sidebar ổn định giữa các lần build.

## Từ vựng tên story

Chỉ dùng khi component có đúng trục đó — không ép khuôn:

| Tên | Trục | Ví dụ |
| --- | --- | --- |
| `Default` | *(bắt buộc mọi file)* | — |
| `Variants` | trục `variant` của `cva` | Button, Badge, Alert |
| `Sizes` | trục `size` | Button, Input, Avatar |
| `States` | disabled / invalid / loading / checked… | Button, Checkbox |
| `Orientation` | trục kỹ thuật `horizontal`/`vertical` | Slider, Tabs, ScrollArea, Separator |
| `Stacking` | overlay mở trên nội dung có z-index | Dialog, Popover, Tooltip, Sheet |

`Orientation` và `Stacking` là story **kiểm tra kỹ thuật** — tên cố định, tách
khỏi story "đẹp", vì jsdom không thấy layout nên một regression ở hai trục này
chỉ lộ ra khi mở bằng mắt. Một story composition (`WithIcon`, `InCard`…) giữ
tên mô tả, không gán vào bảng trên.

## Args policy — lá vs compound

- **Primitive lá** (root là một element mà props của nó là toàn bộ story —
  Button, Badge, Input, Switch…): `Default` chạy bằng `args`, **không** `render`;
  meta khai `argTypes` tường minh — `control: "select"` cho đúng các trục
  `cva`, `control: "boolean"` cho state — để tab Controls sống trên trang Docs.
  Không dựa vào docgen suy union từ `VariantProps`.
- **Primitive compound** (Dialog, Select, Card, Field, Table…): `Default` giữ
  `render()`, meta khai `subcomponents` liệt kê anatomy, và tắt Controls cho
  story đó (`parameters.controls.disable`).

Bỏ mọi `args: {}` thừa — nó không làm gì ngoài gợi ý sai rằng Controls đang
sống. Một compound có props bắt buộc không có default (`DataTable` `columns`/`data`,
`Chart`, `InputOTP`) buộc TypeScript đòi `args` dù `render` tự cấp — chỗ đó viết
`args: {} as Story["args"]` kèm một dòng comment, và chỉ chỗ đó.

## Thế giới Northwind

Mọi copy trong story tiếng Anh, có chủ đích, cùng một "thế giới" —
**Northwind**, một team workspace giả ở domain `northwind.dev`. Fixtures ở
`src/support/`, tách theo entity, mỗi file named export, không barrel:

| File | Giữ |
| --- | --- |
| `people.ts` | 8 người (`northwindPeople`) + `currentPerson` (người "tôi" của phần lớn story), `tomasReyes`, `hanaSato` — tên người luôn import, không spell literal |
| `projects.ts` | 4 project — Atlas (billing migration), Beacon (onboarding), Comet (mobile app), Delta (design system) |
| `invoices.ts` | invoice `INV-…`, trạng thái `paid`/`pending`/`overdue` |
| `notifications.ts` | thông báo gắn với một người |
| `conversation.ts` | một thread chat Northwind (`northwindConversation`, `conversationOpener`/`conversationReply`) cho Attachment, Bubble, Message, MessageScroller, Questionnaire |

Sửa cast/project/invoice thì sửa ở đây — mọi story import theo đường dẫn file
(`~/support/people`, …), không có barrel để import qua.

## Test — bốn seam quy ước, cộng ba test hành vi

1. **`test/stories.test.tsx`** *(có sẵn)* — compose mọi story dưới
   `src/stories/*.stories.tsx` qua `preview.tsx` thật, render và mở mọi
   trigger. Đây là bằng chứng stage/theme decorator không phá story nào.
2. **`test/story-conventions.test.tsx`** — cùng `import.meta.glob`, nhưng gồm
   cả `introduction.stories.tsx`. Với mọi module: có export `Default` (trừ
   Introduction, giữ tên `Welcome`); `title` bắt đầu `Storybook/`/`Hooks/` hoặc
   là `Introduction`; `parameters.stage.width` nếu có thì thuộc thang bốn giá
   trị; `Default` có `render` ⇒ Controls tắt + `subcomponents` không rỗng;
   `Default` không `render` dưới `Storybook/` ⇒ `argTypes` không rỗng. Áp cho
   mọi file — ngoại lệ duy nhất là `NO_DEFAULT_EXPORT` (`accordion`, xem trên).
3. **`test/preview-decorators.test.tsx`** — compose một story mẫu
   (`button.stories.tsx`) với `initialGlobals: { theme: "dark" }` qua
   `composeStory`'s thứ ba, khẳng định `documentElement` mang/mất class `dark`;
   ép `parameters.stage.width = "sm"` và khẳng định wrapper mang `max-w-sm`;
   compose story Introduction (`layout: "fullscreen"`) và khẳng định không có
   stage.
4. **`apps/documents/test/…/component-detail.template.test.tsx`** và bản hook
   — khẳng định `src` của iframe mang `globals=theme:dark` khi dark, không
   mang gì khi light.

Ba test còn lại kiểm hành vi chứ không kiểm quy ước: `form-stories.test.tsx`
(Controller ↔ zodResolver ↔ FieldError qua story `Form`), `date-picker-stories.test.tsx`
(mask `dd/MM/yyyy` của `DatePickerInput` qua story `WithInput`), và
`command-selected.test.tsx` — pin `data-selected="true"` của cmdk và cách `command.tsx`
style nó; ở đây vì runner của `packages/ui` là node, không có jsdom.

`bun run test:coverage` không có ngưỡng gate (xem `testing-coverage`); bốn seam
trên là thứ giữ quy ước không trôi, thay cho một rule trong `.agents/rules/`.

## Checklist mắt thường

Gate xanh không chứng minh một story "đẹp" — jsdom không layout, không paint.
Trước khi đóng một ticket họ primitive:

1. `bun run --filter @monorepo/storybook dev`, mở từng story ở cả hai theme
   (toolbar **theme**).
2. Nhìn `Default` qua iframe trên trang primitive tương ứng của
   `apps/documents` (dev hoặc bản đã deploy) — đây là thứ người đọc thật sự
   thấy.
3. Với primitive có `Orientation`/`Stacking`: xác nhận trục kỹ thuật đúng bằng
   mắt — Slider/Tabs/ScrollArea/Separator giữ chiều, Dialog/Popover/Tooltip mở
   trên nội dung chứ không bị che.

Không có visual regression test, không `@storybook/addon-vitest`, không
snapshot ảnh — xem Out of Scope của spec #168.
