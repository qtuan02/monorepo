# `@monorepo/api`

`createHttpClient({ baseURL, timeout })` trả về một `HttpClient` bọc axios, và
**cố ý không lộ axios instance** — mọi thứ có thể fail, và cách nó fail, phải
đọc được từ interface này. Mỗi service class trong `src/<system>/<domain>-service.ts`
nhận một `HttpClient` qua constructor và trả `Promise<T>` **không có envelope**
— `client.get<T>()` trả thẳng `response.data`.

## Option cơ bản

| Option | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `baseURL` | bắt buộc | origin của backend |
| `timeout` | `10_000` | ms |
| `getAuthToken` | không | đọc lại **mỗi request**, gắn `Authorization: Bearer <token>` nếu có |
| `onUnauthorized` | không | bắn khi response là 401, sau khi đã normalize thành `HttpError` |

Không cài `getAuthToken` → client không gắn header nào cả. Không cài
`onUnauthorized` → 401 vẫn throw `HttpError` như mọi status khác.

## Refresh opt-in: `withCredentials` + `onAuthError`

Xem [ADR-0014](../../docs/adr/0014-api-refresh-token-opt-in-http-client.md) —
lý do và các phương án đã cân nhắc.

```ts
export const httpClient = createHttpClient({
  baseURL: env.PUBLIC_CHAT_BASE_DOMAIN_API,
  withCredentials: true, // cookie HttpOnly đi kèm request cross-origin
  getAuthToken: () => useAuthStore.getState().accessToken,
  onAuthError: async (error) => {
    // Path không muốn refresh (auth endpoint) → tự trả null, client không cần biết path.
    try {
      const { accessToken } = await refreshTokenService.refresh();
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    } catch {
      useAuthStore.getState().logout();
      return null;
    }
  },
});
```

- **`withCredentials`** truyền thẳng xuống axios — chỉ có ý nghĩa khi backend
  thật sự set cookie `HttpOnly` cross-origin.
- **`onAuthError`** chạy khi response là **401 hoặc 403** trên một request
  **chưa retry**. Trả về token mới → client gửi lại đúng request gốc **một
  lần** với header `Authorization` mới, kết quả của lần gửi lại là kết quả trả
  về. Trả `null` hoặc throw → client throw `HttpError` gốc, `onUnauthorized`
  vẫn chạy y như trước (không có `onAuthError`).
- **403 được coi là auth error** ở tầng client — đây là contract của backend
  đầu tiên cần nó (`apps/chat`), không phải "forbidden nghĩa là thiếu quyền".
  Một backend trả 403 cho lý do khác vẫn opt-out được bằng cách không cài
  `onAuthError`.
- **Dedupe**: nhiều request cùng fail 401/403 song song chỉ gọi `onAuthError`
  **một lần** — request thứ hai trở đi chờ chung promise của lần gọi đầu, rồi
  cùng retry với token nó trả về. Dedupe theo **client instance**, cùng chỗ
  `getAuthToken` được đọc lại mỗi request thay vì capture lúc khởi tạo.
- **Không vòng lặp**: request retry lại fail (401/403 hay bất kỳ) sẽ throw
  thẳng — cờ retry gắn trên chính request object nên `onAuthError` không bao
  giờ gọi lần thứ hai cho cùng một request gốc.
- Không cài `onAuthError` → hành vi client không đổi một byte so với trước.

Test ở [`test/client.test.ts`](./test/client.test.ts).
