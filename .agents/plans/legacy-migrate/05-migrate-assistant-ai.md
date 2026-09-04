---
status: ready-for-agent
---

# 05 — Migrate `assistant-ai` lên `_template_next` với bộ AI SDK mới nhất

**What to build:** Người dùng mở `apps/assistant-ai`, chat với Gemini qua route handler `/api/chat`, và model gọi được tool thời tiết của `mcp-weather` qua `MCP_DOMAIN`. App chạy trên `_template_next`, dùng `ai`, `@ai-sdk/google`, `@ai-sdk/react`, `@assistant-ui/react`, `@assistant-ui/react-ai-sdk` bản mới nhất qua catalog `ai-sdk`; không còn Radix; store model là Zustand global theo rule. E2E boot app và mở màn chat với key giả.

**Blocked by:** 04 — `mcp-weather` là dependency runtime (MCP_DOMAIN) và là mẫu cho route handler + env server; 03 — quy ước env.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] `apps/assistant-ai` sinh bằng `gen:app` Runtime `next`; `app/` ở root của bản cũ chuyển thành `src/app/[locale]/…` theo Template; màn chat là một slice `features/chat/` với template default-export; route handler `/api/chat` mỏng, logic gọi model + MCP client trong slice (`server/` hoặc helper server-only).
- [ ] Catalog đặt tên `ai-sdk` trong `package.json` root gồm `ai`, `@ai-sdk/google`, `@ai-sdk/react`, `@assistant-ui/react`, `@assistant-ui/react-ai-sdk`, `@modelcontextprotocol/sdk` (dùng chung với `mcp-weather`), latest lúc làm; mọi breaking change (API `streamText`/`useChat`, transport của assistant-ui) xử lý và ghi tóm tắt vào Notes.
- [ ] `@radix-ui/react-slot` và mọi Radix bị gỡ; UI dựng từ `@monorepo/ui` (render prop của Base UI thay `asChild`); `motion`, `react-markdown`, `remark-gfm` qua catalog nếu giữ.
- [ ] Store chọn model: `stores/use-model-store.ts` (global, typed interface, narrow selector), không persist token nào; danh sách model là constant.
- [ ] `env.ts`: `GOOGLE_GENERATIVE_AI_API_KEY` (server, bắt buộc ở môi trường thật, optional khi build với key giả — quyết cách để `next build` không cần key thật và ghi vào Notes), `MCP_DOMAIN` (server, optional, `httpUrlSchema`), `NEXT_PUBLIC_ASSISTANT_AI_SENTRY_DSN`; `.env.example`, Docker ARG cập nhật.
- [ ] E2E trên bản build: màn chat render, ô nhập và nút gửi có accessible name; gửi một tin với key giả → UI hiện lỗi có cấu trúc thay vì treo (mock ở seam thấp nhất: provider hoặc fetch); một spec raw HTML + locale như Template. Xanh local và trên job `e2e` CI; job `docker` xanh.
- [ ] README `apps/assistant-ai` (thay `legacy/docs/apps/ASSISTANT-AI.md`): key Gemini, `MCP_DOMAIN` trỏ `mcp-weather`, model mặc định; `legacy/README.md` dòng `assistant-ai` cập nhật.
- [ ] Gate xanh 0 warning; output vào Notes.

## Notes
