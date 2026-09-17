---
"@fe-monorepo/ui": patch
---

`dist/internal/` chỉ còn hai file `sidebar` thật sự dùng (`use-is-mobile`,
`use-media-query`) thay vì cả bộ hook, và tarball mang thêm `LICENSE-hooks-ts`:
`use-media-query` là Derived từ [hooks-ts](https://github.com/michal-worwag/hooks-ts)
0.12.0 (MIT © 2024 Michał Worwąg). README có mục "Third-party notices". Không đổi
API.
