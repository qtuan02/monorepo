import { createI18n } from "@monorepo/i18n/i18next/create-i18n";

import { LANGUAGE_COOKIE_NAME } from "~/constants/cookies";

/**
 * The app's one wiring site for i18next — the `i18next` Flavor of
 * @monorepo/i18n, the same one `_template_vite` uses, because this Runtime is a
 * Vite build too. The shared catalogue is ICU MessageFormat read through
 * `i18next-icu`: a placeholder is `{name}`, not react-i18next's `{{name}}`, and
 * a leftover `{{name}}` renders literally rather than throwing.
 *
 * What is different here, and what every server-side reader has to know: this
 * module is evaluated in the **server** bundle as well as the browser one, and
 * there the singleton is process-wide — one object shared by every request the
 * process is rendering at once. So on the server it is a template to clone, not
 * an instance to use:
 *
 * - Nothing on a request path may call `changeLanguage` on it. That write is a
 *   race with no lock, and its symptom is a page correctly rendered in someone
 *   else's language. `entry.server` clones it per request through
 *   `createRequestI18n` instead.
 * - It sits at `fallbackLng` on the server forever, and that is what makes it a
 *   usable template: `createI18n` registers `i18next-browser-languagedetector`
 *   only where a `document` exists, so on Node nothing is detected, no cookie is
 *   written, and the instance lands on the registry's default. Do not "simplify"
 *   that guard away — the package's own name is misleading here. Only its
 *   cookie and storage lookups check `document`; the `navigator` lookup checks
 *   `typeof navigator`, and Node 24 has that global, so an unguarded detector
 *   would put this singleton on the host's ICU locale (`en` on a stock
 *   `node:alpine`) while every Bun-run check on a laptop still showed `vi`.
 */
const i18n = createI18n({ cookieName: LANGUAGE_COOKIE_NAME });

export default i18n;
