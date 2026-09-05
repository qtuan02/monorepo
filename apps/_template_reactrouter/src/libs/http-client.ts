import { createHttpClient } from "@monorepo/api/client";
import { TemplateService } from "@monorepo/api/template/template-service";

import { env } from "~/env";

/**
 * The one HTTP client, wired to the API this app talks to. `env` is validated at
 * module load, so there is no fallback baseURL to get wrong.
 *
 * Nothing here touches `window`, and that is a hard requirement rather than a
 * preference: this module is evaluated in the **server** bundle too — a loader,
 * an action or a `middleware` may import it — and a `window` read at module
 * scope would crash the render rather than the browser.
 *
 * No `getAuthToken` either, for the same reason the Next Template has none: this
 * app's session is an `HttpOnly` cookie (see `~/constants/cookies`), which the
 * browser attaches on its own and no script can read. A server-side call that
 * must act as the visitor forwards the cookie header explicitly at the call site
 * — one deliberate, visible step rather than an ambient one.
 */
const httpClient = createHttpClient({
  baseURL: env.PUBLIC_BASE_DOMAIN_API,
  timeout: 10_000,
});

/**
 * The service singleton every layer goes through — a loader on the server and a
 * TanStack Query hook in the browser alike. One singleton is also one mock seam
 * for tests: `vi.mock("~/libs/http-client")` covers both paths, and nothing in
 * the app mocks axios or a query hook.
 */
export const templateService = new TemplateService(httpClient);
