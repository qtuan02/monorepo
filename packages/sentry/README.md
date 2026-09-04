# `@monorepo/sentry`

Wrapper mỏng quanh `@sentry/nextjs` — **chỉ có Flavor Next** (quyết định 5). App
Vite không kéo package này theo, và không có subpath nào cho nó.

Package là source-only, `exports` subpath, không barrel, không build step: mỗi
symbol nằm trong file mang đúng tên nó.

| Subpath | Dùng ở | Nội dung |
| --- | --- | --- |
| `@monorepo/sentry/client` | `src/instrumentation-client.ts` | `initSentryClient`, `captureRouterTransitionStart` |
| `@monorepo/sentry/server` | `src/instrumentation.ts` (`NEXT_RUNTIME === "nodejs"`) | `initSentryServer` |
| `@monorepo/sentry/edge` | `src/instrumentation.ts` (`NEXT_RUNTIME === "edge"`) | `initSentryEdge` |
| `@monorepo/sentry/capture-request-error` | `src/instrumentation.ts` | `captureRequestError` |
| `@monorepo/sentry/next-config` | `next.config.ts` | `withSentry` |
| `@monorepo/sentry/options` | — | `SentryRuntimeOptions`, `buildSentryInitOptions` |

## Không có DSN thì SDK tắt

`buildSentryInitOptions` đặt `enabled: Boolean(dsn)`. Thiếu
`NEXT_PUBLIC_SENTRY_DSN` trong `.env` thì SDK vẫn được cài nhưng im lặng: không
request, không log, mọi lời gọi `Sentry.*` trong app là no-op. Nhờ vậy ba file
instrumentation gọi thẳng `initSentry*` mà không cần `if` — và một bản clone
repo chưa có credential vẫn `next build` được.

`tracesSampleRate` mặc định **0**, cố ý: một template lỡ bật 100% sẽ đốt quota
của project thật ngay lần đầu ai đó dán DSN vào.

## Ba runtime, ba file

Next nạp chúng ở ba thời điểm khác nhau, nên chúng là ba module riêng chứ không
phải ba nhánh `if` trong một file: build edge không được kéo theo SDK của Node.

Xem `apps/_template_next/src/instrumentation.ts` và
`apps/_template_next/src/instrumentation-client.ts` để có bản wiring đầy đủ.
