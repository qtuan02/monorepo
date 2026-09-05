import type { i18n as I18n } from "i18next";
import i18next from "i18next";

import type { LanguageCode } from "../languages";

/**
 * Clones the shared i18next singleton for the duration of ONE server render,
 * fixed to `language`. Wrap the render in `<I18nextProvider i18n={instance}>`
 * from `entry.server`, and hand the clone — never the singleton — to it.
 *
 * The singleton is a module-scope object, so on a server it is shared by every
 * request the process is handling at once. Calling `changeLanguage` on it per
 * request is therefore a race with no lock: two overlapping renders write the
 * same field, and whichever wrote last decides the language BOTH of them paint.
 * That failure is invisible under any load a developer generates by hand, and
 * shows up in production as a page served in someone else's language. A clone
 * carries its own `language` and its own translator, so there is no shared
 * field left to race over.
 *
 * `cloneInstance` shares the resource store and the initialized plugins — the
 * ICU formatter included — so this costs an object per request and not a
 * re-read of the catalogue.
 *
 * What keeps the clone usable the moment it is returned is that catalogue being
 * inline: i18next takes the synchronous branch whenever it already holds
 * `resources`, which `createI18n` passes. `initAsync: false` is insurance rather
 * than the mechanism — it pins that branch for the day the catalogue moves
 * behind a backend plugin, where the default would defer the load into a
 * `setTimeout` and a synchronous server render would translate through a
 * language that had not been applied yet.
 *
 * The singleton still has to be initialized first, by `createI18n` at the app's
 * `~/libs/i18n.ts` wiring site. This clones what that call set up; it does not
 * stand in for it.
 */
export function createRequestI18n(language: LanguageCode): I18n {
  return i18next.cloneInstance({ lng: language, initAsync: false });
}
