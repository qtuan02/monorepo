import { setDayjsLocale } from "@monorepo/dayjs/set-locale";

import i18n from "~/libs/i18n";

/**
 * Bridges the two singletons. `@monorepo/dayjs` sits at the foundation layer and
 * deliberately does not depend on `@monorepo/i18n`, so the app — the only layer
 * that knows both — is what keeps dayjs's locale following the active language.
 *
 * In the browser that is the whole story, exactly as in `_template_vite`. On the
 * server it is **not**: this bridge is per process, not per request, and the
 * process singleton never moves off the default — which holds only because
 * `createI18n` keeps the browser detector out of a server graph (see
 * `~/libs/i18n`), and would silently become "whatever locale the host's ICU
 * reports" if that guard were dropped. So no
 * server-rendered component may lean on the global dayjs locale — a component
 * that formats `dddd` threads the request's language into `.locale()` itself,
 * which is what `dates-locale-render-input` already requires for the React
 * Compiler's sake and what makes the same component correct in both graphs.
 */
setDayjsLocale(i18n.language);
i18n.on("languageChanged", setDayjsLocale);
