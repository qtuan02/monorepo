import { createI18n } from "@monorepo/i18n/i18next/create-i18n";
import { defaultLanguage } from "@monorepo/i18n/languages";

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

/**
 * Keep `<html lang>` following the active language.
 *
 * `index.html` can only ship one literal, and a Vite SPA never re-renders it —
 * so without this the attribute stays at whatever the file was authored with,
 * and a visitor reading the English site is announced to a screen reader with
 * Vietnamese pronunciation rules. It is also what a translation prompt and
 * `lang`-scoped CSS key off. The Next Runtime has no equivalent because its
 * root layout owns `<html>` and re-renders per locale.
 */
function syncDocumentLanguage(language: string): void {
  document.documentElement.lang = language;
}

syncDocumentLanguage(i18n.resolvedLanguage ?? defaultLanguage);
i18n.on("languageChanged", syncDocumentLanguage);

export default i18n;
