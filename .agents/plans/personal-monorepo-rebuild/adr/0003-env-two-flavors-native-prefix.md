---
status: proposed
---

# Env hai Flavor, mỗi Flavor giữ tiền tố chuẩn của Runtime, một `.env` ở root

Next.js chỉ inline biến `NEXT_PUBLIC_*` vào bundle client và chỉ đọc `.env` trong thư mục app; Vite inline theo `envPrefix` cấu hình được và đọc `.env` theo `envDir`. `@monorepo/env` có hai Flavor: `vite` (`createEnv(schema, import.meta.env)` như reference, prefix `PUBLIC_`) và `next` (`@t3-oss/env-nextjs`, prefix `NEXT_PUBLIC_`, tách `server`/`client`). Tên biến giữ tiền tố **chuẩn của từng Runtime**; `.env` vẫn **một file ở root** (gitignored, `.env.example` commit) và app Next nạp nó qua `dotenv-cli` trước `next dev/build`.

## Considered Options

- Vite dùng luôn `NEXT_PUBLIC_` (`envPrefix: "NEXT_PUBLIC_"`) để một tên biến cho mọi Runtime: một schema chung, nhưng tên biến mang chữ "NEXT" trong app không phải Next.
- Vite `PUBLIC_*`, Next map lại qua `experimental__runtimeEnv`: không chạy, Next không inline biến thiếu tiền tố `NEXT_PUBLIC_` vào browser.
- Mỗi app một `.env`: bỏ dotenv-cli nhưng biến chung chép nhiều nơi, khác reference.

## Consequences

`.env.example` root liệt kê hai nhóm biến (`PUBLIC_*` cho Vite, `NEXT_PUBLIC_*` cho Next) và giá trị chung như BASE_DOMAIN_API xuất hiện hai lần. Dockerfile của cả hai Runtime vẫn bake per-env qua ARG và validate bằng cách import `env.ts` của chính app (ADR-0004 của reference). Flavor Next bắt buộc phân loại biến thành `server`/`client`; schema phẳng `PUBLIC_*` của reference không copy sang được.
