---
"@fe-monorepo/ui": minor
---

`globals.css` tự khai `@source "./"` — consumer không còn phải gõ dòng `@source`.

Tailwind v4 không quét `node_modules`, và resolve `@source` tương đối với
stylesheet chứa nó, nên `dist/globals.css` giờ tự đăng ký thư mục `dist/` của
chính package. Setup còn hai dòng: `@import "tailwindcss"` rồi
`@import "@fe-monorepo/ui/globals.css"`. Dòng
`@source "../node_modules/@fe-monorepo/ui/dist"` cũ vẫn chạy nhưng thừa — xoá đi.
README thêm mục "Your own theme": khai lại token trên `:root` / `.dark` **sau**
dòng import, unlayered, và `@theme inline` cho token mới.
