import { locale } from "next/root-params";

import { createRequestConfig } from "@monorepo/i18n/next-intl/create-request-config";

/**
 * The module next-intl's plugin loads for every request (wired in
 * `next.config.ts`). It is a single default export because the whole callback
 * lives in `@monorepo/i18n`; this file only supplies what is app-specific.
 *
 * The locale is read through `next/root-params` — the getter is named after the
 * `[locale]` segment — rather than next-intl's deprecated `requestLocale`, which
 * reads a header and would opt the entire render out of `cacheComponents`.
 */
export default createRequestConfig({
  // Pinned rather than guessed from the request: a server formats dates in
  // whatever zone the container happens to run in otherwise, so the same
  // timestamp would render differently on a laptop and in Docker.
  timeZone: "Asia/Ho_Chi_Minh",
  resolveLocale: locale,
});
