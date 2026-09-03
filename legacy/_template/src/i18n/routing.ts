import { defineRouting } from "next-intl/routing";

import { LOCALE_COOKIE_NAME } from "~/constants/common";

export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: "en",
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
  },
});
