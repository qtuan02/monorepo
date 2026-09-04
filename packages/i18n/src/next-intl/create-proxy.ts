import createMiddleware from "next-intl/middleware";

import type { I18nRouting } from "./create-routing";

/**
 * The locale-negotiating proxy for a Next Runtime.
 *
 * There is no `next-intl/proxy` entry point: `proxy.ts` is Next 16's new name
 * for `middleware.ts` and the handler contract is unchanged, so this is still
 * `createMiddleware`. Keeping it here means an app's `~/proxy.ts` is a default
 * export plus the matcher literal from `./proxy-matcher`.
 *
 * This module only resolves inside a Next build — `next-intl/middleware` imports
 * `next/server`, which a plain ESM resolver cannot reach because `next` ships no
 * `exports` map. Anything that has to be readable from a test belongs beside it,
 * not in here.
 */
export function createI18nProxy(routing: I18nRouting) {
  return createMiddleware(routing);
}
