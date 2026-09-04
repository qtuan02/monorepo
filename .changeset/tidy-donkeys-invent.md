---
"@fe-monorepo/hook": major
---

Base UI, 63 primitive / 5 hook, API mới hoàn toàn.

`2.0.0` viết lại từ đầu, không phải bản nâng cấp của `1.0.0`. Bộ 14 hook cũ bị
thay bằng 5 hook: `use-debounce`, `use-media-query`, `use-is-mobile`,
`use-copy-to-clipboard`, `use-isomorphic-layout-effect`. Package giờ là ESM
subpath-only (`@fe-monorepo/hook/use-debounce`), không root entry và không CJS,
và peer là React >= 19. Mọi import cũ phải viết lại.
