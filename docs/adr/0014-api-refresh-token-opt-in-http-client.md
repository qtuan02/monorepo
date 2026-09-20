---
status: accepted
date: 2026-09-18
---

# Refresh-token là option opt-in của `createHttpClient` trong `@monorepo/api`, không phải axios riêng của từng app

`apps/chat` là app đầu tiên trong workspace nối một backend thật có access token ngắn hạn (15 phút) và refresh token trong cookie `HttpOnly` (`SameSite=None; Secure`, 14 ngày). Backend trả **403** — không phải 401 — khi access token hết hạn, và app nguồn (`chat-socket-fe`, `libs/axios.ts`) giải bằng một response interceptor: gặp 401/403 lần đầu → gọi `/auth/refresh` (dedupe bằng một promise module) → cất token mới → gửi lại đúng request gốc một lần; refresh hỏng → xoá cache query + đăng xuất. `createHttpClient` hiện chỉ có `getAuthToken` và `onUnauthorized` (bắn khi 401 rồi throw), không `withCredentials`, không retry, và cố ý **không lộ axios instance** để "cái gì fail, fail thế nào" đọc được từ một interface. Hai điều đó xung đột: giữ refresh flow thì không dùng được client của package, dùng client của package thì mất refresh.

Quyết định, chốt ở vòng grill 2026-09-18: mở rộng `HttpClientOptions` **một lần trong package**, opt-in — `withCredentials?: boolean` và một callback kiểu `onAuthError?: (error: HttpError) => Promise<string | null>` được gọi khi response là 401 **hoặc** 403 trên một request chưa retry và không phải request auth; trả token mới → client gửi lại request gốc đúng một lần với header mới; trả `null` (hoặc throw) → client throw `HttpError` gốc như hiện tại và `onUnauthorized` vẫn chạy. Dedupe song song (nhiều request cùng 403 → một lần refresh) nằm trong package, có test ở `packages/api/test`. App không cài thì hành vi client không đổi một byte.

## Considered Options

- **App giữ `libs/axios.ts` riêng trong `~/libs/http-client.ts`**: port nhanh nhất — nhưng là HTTP layer thứ hai trong workspace (`CLAUDE.md` §2 "one mock seam and no second HTTP layer"), service class của `@monorepo/api` không nhận được nó, nên toàn bộ service phải ở lại trong app và app tiếp theo nối backend thật sẽ copy lại cùng interceptor.
- **Bỏ silent refresh, chỉ refresh lúc boot (`useSessionCheck`) và mở rộng `onUnauthorized` bắt cả 403**: ít code nhất — nhưng đổi hành vi: người dùng đang gõ tin bị đá về đăng nhập mỗi 15 phút, đúng thứ refresh cookie tồn tại để tránh.
- **Lộ axios instance ra cho app tự đăng ký interceptor**: chạm đúng cái package cố ý đóng; mở rồi thì không đóng lại được.

## Consequences

- `packages/api/src/client.ts` thêm hai option và một nhánh retry; `HttpError` không đổi. Test cover: 403 → refresh → retry thành công; refresh trả `null` → throw + `onUnauthorized`; N request song song → một lần refresh; request auth (`/auth/*`) không bao giờ retry — app truyền danh sách path hoặc tự trả `null` trong callback.
- 403 được coi là "auth error" ở tầng client, không phải "forbidden": đây là contract của backend `chat-socket`; một backend khác trả 403 cho thiếu quyền vẫn opt-out được bằng cách không cài `onAuthError`.
- Cookie `SameSite=None; Secure` đòi HTTPS ở prod và `withCredentials` ở client; ở `http://localhost` Chrome vẫn gửi cookie `Secure` cho localhost — chưa xác minh với backend thật, ghi ở research note §C.3.
- Glossary `apps/chat/CONTEXT.md` ghi **Session** là hình thứ ba trong repo (token in-memory + refresh cookie), bên cạnh token persist của Template Vite và cookie session SSR của ADR-0007. `apps/mcp` / `apps/smart-rental` khi nối backend thật dùng lại option này thay vì viết interceptor.
