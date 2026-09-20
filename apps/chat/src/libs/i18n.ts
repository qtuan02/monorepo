import { createI18n } from "@monorepo/i18n/i18next/create-i18n";

import { LANGUAGE_COOKIE_NAME } from "~/constants/cookies";

/**
 * The app's one wiring site for i18next — the `i18next` Flavor of
 * @monorepo/i18n (Vite Runtime). Copy lives under the `chat.*` namespace of
 * the shared ICU catalogue (`packages/i18n/src/locales/*.json`).
 */
const i18n = createI18n({ cookieName: LANGUAGE_COOKIE_NAME });

export default i18n;
