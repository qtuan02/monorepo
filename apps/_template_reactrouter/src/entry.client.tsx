import { StrictMode, startTransition, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { HydratedRouter } from "react-router/dom";

import type { LanguageCode } from "@monorepo/i18n/languages";
import { defaultLanguage, isLanguageCode } from "@monorepo/i18n/languages";
import { readLanguageCookie } from "@monorepo/i18n/resolve-language";

import { LANGUAGE_COOKIE_NAME } from "~/constants/cookies";
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

/**
 * The visitor's stored choice, read BEFORE the switch below — which is the
 * only moment it can still be read. `changeLanguage` re-writes the language
 * cookie with whatever it is handed (`caches: ["cookie"]`), so once the tree is
 * being hydrated in the server's language, the cookie already says the same.
 *
 * Usually the two agree: the server negotiated from this very cookie. They
 * disagree on a PRERENDERED document, which was rendered once at build time
 * in the registry default and served off disk with no negotiation at all. For
 * that page the stored choice has to survive hydration — see
 * `RestoreStoredLanguage`.
 */
const storedLanguage = readLanguageCookie(
  document.cookie,
  LANGUAGE_COOKIE_NAME,
);

interface RestoreStoredLanguageProps {
  language: LanguageCode | undefined;
}

/**
 * Puts the visitor's stored choice back once hydration has committed. Rendered
 * beside `<HydratedRouter>` — it emits no DOM, so the server's markup still
 * matches — and its effect is what runs strictly AFTER React has attached to
 * the document, which is the ordering nothing outside the tree can promise.
 *
 * The switch cannot happen before hydration: the markup on disk is in the
 * build's language, and a tree hydrated in another one is the mismatch this
 * whole file exists to avoid. So the page is hydrated as sent, then switched in
 * place — and the switch re-writes the cookie, undoing the build-language value
 * the pre-hydration switch cached. On a server-rendered page the two languages
 * are equal and this does nothing.
 */
function RestoreStoredLanguage({ language }: RestoreStoredLanguageProps) {
  useEffect(() => {
    if (language && language !== i18n.resolvedLanguage) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  return null;
}

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
          <RestoreStoredLanguage language={storedLanguage} />
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
