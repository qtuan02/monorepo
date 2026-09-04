---
"@fe-monorepo/ui": major
---

Base UI, 63 primitive / 5 hook, API mới hoàn toàn.

`2.0.0` viết lại từ đầu, không phải bản nâng cấp của `1.0.2`. 42 primitive trên
Radix bị thay bằng 63 primitive shadcn style `base-vega` trên Base UI, nên
`asChild` không còn (dùng `render`), state attribute là dạng bare
(`data-open`/`data-checked`) thay vì `data-[state=…]`, và mọi props đi theo Base
UI. Package là ESM subpath-only (`@fe-monorepo/ui/components/button`), không root
entry và không CJS; peer là React >= 19 và Tailwind ^4; và có một CSS entry mới
`@fe-monorepo/ui/globals.css` mang theme token cùng hai `@custom-variant`
`data-horizontal`/`data-vertical` — thiếu nó thì slider, tabs và scroll-area mất
kích thước. Consumer Tailwind v4 phải thêm `@source` trỏ vào `dist/` của package;
README có ba dòng cần gõ.
