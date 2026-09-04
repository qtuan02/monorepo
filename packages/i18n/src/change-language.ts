import i18next from "i18next";

import type { LanguageCode } from "./languages";

/**
 * Switches the active language of the i18next singleton, constrained to the
 * registry — i18next's own `changeLanguage` takes any string and would accept
 * an unsupported code.
 *
 * This is the switch for the i18next Flavor. A Next app changes language by
 * navigating to the other locale prefix, so it never calls this.
 */
export const changeLanguage = (language: LanguageCode) =>
  i18next.changeLanguage(language);
