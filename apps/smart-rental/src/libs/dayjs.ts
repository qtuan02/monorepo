import { setDayjsLocale } from "@monorepo/dayjs/set-locale";

import i18n from "~/libs/i18n";

/**
 * Bridges the two singletons. `@monorepo/dayjs` sits at the foundation layer and
 * deliberately does not depend on `@monorepo/i18n`, so the app — the only layer
 * that knows both — is what keeps dayjs's locale following the active language.
 * Without this, `.format("dddd")` would stay Vietnamese after a switch to English.
 */
setDayjsLocale(i18n.language);
i18n.on("languageChanged", setDayjsLocale);
