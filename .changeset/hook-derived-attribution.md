---
"@fe-monorepo/hook": major
---

Bốn hook là **Derived** từ [hooks-ts](https://github.com/michal-worwag/hooks-ts) 0.12.0
(MIT © 2024 Michał Worwąg), giờ có notice; hai hook đổi chữ ký theo hooks-ts.

- `use-debounce`, `use-media-query`, `use-copy-to-clipboard`,
  `use-isomorphic-layout-effect` mở đầu bằng dòng `Derived from hooks-ts …` ghi
  file gốc và commit; tarball mang thêm `LICENSE-hooks-ts` và README có mục
  "Third-party notices". `use-is-mobile` là code riêng của workspace.
- **Breaking:** `useCopyToClipboard()` — `copy(text)` trả `Promise<void>` thay vì
  `Promise<boolean>`; đọc `copiedText` (là `text` khi copy thành công, `null` khi
  thất bại) thay vì giá trị trả về.
- **Breaking:** `useMediaQuery(query)` không còn tham số options
  (`defaultValue` / `initializeWithValue`); hook render `false` ở frame đầu trên
  cả server lẫn client rồi đọc `matchMedia` trong effect, nên không còn hydration
  mismatch nhưng cũng không còn đúng ngay frame đầu trên browser.

Bản `1.0.0` đã phân phối 11 hook chép từ hooks-ts mà không kèm notice MIT nào;
bản này là lần đầu package mang đúng nghĩa vụ đó.
