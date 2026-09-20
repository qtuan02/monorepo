import { setDayjsLocale } from "@monorepo/dayjs/set-locale";

import i18n from "~/libs/i18n";

/**
 * Bridges the two singletons: `@monorepo/dayjs` deliberately does not depend
 * on `@monorepo/i18n`, so the app keeps dayjs's locale following the active
 * language (see dates-dayjs-singleton.md).
 */
setDayjsLocale(i18n.language);
i18n.on("languageChanged", setDayjsLocale);
