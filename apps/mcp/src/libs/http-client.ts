import { createHttpClient } from "@monorepo/api/client";
import { TemplateService } from "@monorepo/api/template/template-service";

import { env } from "~/env";

/**
 * The one HTTP client, wired to the API this app talks to. `env` is validated at
 * module load, so there is no fallback baseURL to get wrong.
 *
 * No `getAuthToken`: this app's session is an `HttpOnly` cookie (see
 * `~/constants/cookies`), which the browser attaches on its own and no script
 * can read. A server-side call that needs to act as the visitor forwards the
 * cookie header explicitly at the call site instead — one deliberate, visible
 * step rather than an ambient one.
 */
const httpClient = createHttpClient({
  baseURL: env.NEXT_PUBLIC_BASE_DOMAIN_API,
  timeout: 10_000,
});

/**
 * The service singleton every layer goes through — a Server Component's cached
 * loader and a Client Component's TanStack Query hook alike. One singleton is
 * also one mock seam for tests.
 */
export const templateService = new TemplateService(httpClient);
