---
"@fe-monorepo/hook": major
---

`2.0.0` viết lại từ đầu, không phải bản nâng cấp của `1.0.0` (bản duy nhất từng lên npm).
Package giờ có 18 hook: 17 hook **Derived** từ [hooks-ts](https://github.com/michal-worwag/hooks-ts)
0.12.0 (MIT © 2024 Michał Worwąg) — `use-boolean`, `use-copy-to-clipboard`, `use-countdown`,
`use-counter`, `use-dark-mode`, `use-debounce`, `use-hover`, `use-isomorphic-layout-effect`,
`use-local-storage`, `use-media-query`, `use-network-status`, `use-on-screen`, `use-previous`,
`use-session-storage`, `use-throttle`, `use-timeout`, `use-toggle` — cộng `use-is-mobile`, hook
riêng của workspace. Mỗi hook Derived mở đầu bằng dòng `Derived from hooks-ts …` ghi file gốc và
commit; tarball mang thêm `LICENSE-hooks-ts` và README có mục "Third-party notices".

- **Breaking:** `useCopyToClipboard()` — `copy(text)` trả `Promise<void>` thay vì
  `Promise<boolean>`; đọc `copiedText` (là `text` khi copy thành công, `null` khi thất bại) thay
  vì giá trị trả về.
- **Breaking:** `useMediaQuery(query)` không còn tham số options (`defaultValue` /
  `initializeWithValue`); hook render `false` ở frame đầu trên cả server lẫn client rồi đọc
  `matchMedia` trong effect, nên không còn hydration mismatch nhưng cũng không còn đúng ngay
  frame đầu trên browser.

Bốn hook được vá để dùng được trên server: `useLocalStorage`/`useSessionStorage`/`useDarkMode`
không còn throw khi không có `window`, `useNetworkStatus` sửa dấu `isServer` bị đảo ngược ở
upstream. `useThrottle` giờ là throttle thật (upstream là debounce đội tên), `usePrevious` ghi
giá trị trước vào `useState` thay vì ref trong render (React Compiler không bỏ memo nữa),
`useDarkMode` nhận thêm options `{ storageKey, className, target }`.

Bản `1.0.0` đã phân phối 11 hook chép từ hooks-ts mà không kèm notice MIT nào; bản này là lần
đầu package mang đúng nghĩa vụ đó.
