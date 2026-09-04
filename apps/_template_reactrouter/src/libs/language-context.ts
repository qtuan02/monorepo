import { createContext } from "react-router";

import type { LanguageCode } from "@monorepo/i18n/languages";
import { defaultLanguage } from "@monorepo/i18n/languages";

/**
 * The language of the request being rendered, decided once by `root.tsx`'s
 * `middleware` and read by everything downstream of it — the root `loader` and,
 * crucially, `entry.server`, which gets the very same `RouterContextProvider`
 * as its fifth argument.
 *
 * That threading is what makes this file necessary at all. `@react-router/serve`
 * passes no `getLoadContext` — it calls `createRequestHandler({ build, mode })`
 * and nothing else — but the server runtime creates a fresh
 * `RouterContextProvider` per request when none is supplied and hands that one
 * object to the middleware chain, every loader, and the document render. So the
 * stock runner needs no change; the context just has to live somewhere both an
 * entry and a route module may import.
 *
 * It lives in `~/libs` rather than in `root.tsx` because `entry.server` reads
 * it, and an entry importing a route module would point the import graph
 * upward (see architecture-circular-dependencies).
 *
 * The default value is not decoration: `RouterContextProvider.get()` throws when
 * a context was never set and was created without one, so a request that somehow
 * reached a render with no middleware run degrades to the default language
 * instead of a 500.
 */
export const languageContext = createContext<LanguageCode>(defaultLanguage);
