import { createI18n } from "@monorepo/i18n/i18next/create-i18n";

import { LANGUAGE_COOKIE_NAME } from "~/constants/cookies";

/**
 * The app's one wiring site for i18next — the `i18next` Flavor of
 * @monorepo/i18n, which is what a Vite Runtime uses (a Next app takes the
 * `next-intl` Flavor instead).
 *
 * The shared catalogue is ICU MessageFormat, read through `i18next-icu`: a
 * placeholder is `{name}`, not react-i18next's `{{name}}`, and a plural is one
 * `{count, plural, ...}` message rather than a `_one`/`_other` key pair. A
 * leftover `{{name}}` does not throw — it renders literally.
 */
const i18n = createI18n({ cookieName: LANGUAGE_COOKIE_NAME });

export default i18n;
