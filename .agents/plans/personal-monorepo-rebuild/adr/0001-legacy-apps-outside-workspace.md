---
status: proposed
---

# App cũ dời ra `legacy/` ngoài workspace thay vì giữ trong `apps/` và lọc bằng Turbo

Khi root của Target đổi sang Bun + Biome + `packages/ui` trên Base UI, sáu app hiện có (bốn Next.js 15, một Vite SPA, Storybook 8.6) và hai package `-public` không còn cài, typecheck hay build được cùng Skeleton. Chúng được chuyển nguyên vào `legacy/`, thư mục **không** nằm trong `workspaces.packages`, giữ git history nhưng không được `bun install`, `turbo run` hay `biome check` chạm tới; mỗi app quay lại `apps/` bằng một ticket migrate riêng.

## Considered Options

- Giữ trong `apps/` và loại khỏi Gate bằng `--filter` của Turbo: `bun install` vẫn resolve chúng, catalog phải chứa đồng thời Next 15/16 và Storybook 8/10, và "0 lỗi 0 warning" không đạt được thật.
- Branch/repo mới cho Skeleton: sạch nhưng tách history và phải merge lại.

## Consequences

Gate của Skeleton là gate thật ngay từ bước 1. Đổi lại, cho tới khi migrate xong, app trong `legacy/` chỉ chạy được bằng toolchain cũ (pnpm) trong thư mục của nó, và không có gì trong repo ngăn nó thối dần.
