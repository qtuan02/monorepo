import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { HydratedRouter } from "react-router/dom";

import { defaultLanguage, isLanguageCode } from "@monorepo/i18n/languages";

import i18n from "~/libs/i18n";
// Side-effect import: keeps dayjs's locale following the active language, so a
// `dddd` formatted outside a component is right after a switch too.
import "~/libs/dayjs";

/**
 * What the server actually rendered this document in, read back off the
 * attribute `root.tsx`'s `Layout` emitted.
 *
 * Reading the DOM rather than re-detecting is the whole point. The server
 * negotiated from the request (cookie, then `Accept-Language`); the browser
 * detector negotiates from `document.cookie` and `navigator.language`. Those two
 * disagree more often than they look — a first visit has no cookie yet, and a
 * `SameSite=Strict` cookie is withheld on a cross-site entry navigation — and
 * every disagreement is a hydration mismatch that makes React throw the
 * server's markup away and re-render the page in the other language.
 */
const serverLanguage = document.documentElement.lang;
const language = isLanguageCode(serverLanguage)
  ? serverLanguage
  : defaultLanguage;

/*
 * The switch has to be RESOLVED before `hydrateRoot` is called, not merely
 * scheduled: hydrating first and switching second is exactly the flash of
 * re-rendered markup this is here to avoid. With the catalogue inline i18next
 * applies the language synchronously, so this settles in the same microtask —
 * awaiting it is what keeps that true the day the catalogue moves behind a
 * backend plugin.
 *
 * It also re-writes the language cookie as a side effect (`caches: ["cookie"]`),
 * which is how a visitor whose language was negotiated from `Accept-Language`
 * gets a cookie the next server render can read directly.
 */
function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        {/* The same shape `entry.server` renders, with the singleton where the
            per-request clone was: in the browser there is one visitor, so there
            is nothing to isolate. */}
        <I18nextProvider i18n={i18n}>
          <HydratedRouter />
        </I18nextProvider>
      </StrictMode>,
    );
  });
}

/*
 * Hydrate on BOTH settlements. `hydrateRoot` is the only thing that attaches
 * React to the document, so reaching it only from the fulfilment handler makes a
 * rejected `changeLanguage` — the failure the "backend plugin" line above
 * anticipates — leave the server's markup on screen with nothing behind it: no
 * switcher, no client navigation, no error boundary, and a single unhandled
 * rejection as the only trace. A page hydrated in the language i18next happens
 * to hold is a mismatch React recovers from; a page that never hydrates is not
 * recoverable at all.
 */
void i18n.changeLanguage(language).then(hydrate, (error: unknown) => {
  console.error(error);
  hydrate();
});
