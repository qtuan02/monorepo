// @vitest-environment node
//
// The rest of this package's suite runs on jsdom, and that is precisely why this
// file exists: with a `document` in scope the browser detector is registered and
// everything below passes for the wrong reason. What is guarded here is the
// server graph — the one an SSR Runtime's `build/server/index.js` actually runs
// on, and the one no jsdom spec can reach.

import { describe, expect, it } from "vitest";

import { createI18n } from "../../src/i18next/create-i18n";
import { defaultLanguage } from "../../src/languages";

/**
 * `i18next-browser-languagedetector` is named for a browser but is not confined
 * to one: only its cookie and storage lookups check `document`, while the
 * `navigator` lookup checks `typeof navigator` — a global Node has had since 21.
 * So an unguarded detector puts the process-wide singleton on the host's ICU
 * locale (`en` on a stock `node:alpine`) and leaves it at the registry default
 * under Bun, which ships no `navigator`. Same build, two languages, decided by
 * the runtime that happened to start it.
 *
 * Nothing user-visible breaks the day that drifts — an SSR Runtime clones per
 * request and threads the language explicitly — but the app-side comments that
 * say "the server singleton sits at the fallback" stop being true, and so does
 * the `~/libs/dayjs` bridge that pins the process-wide dayjs locale from it.
 */
describe("createI18n on a server", () => {
  it("initializes at the registry default rather than at the host's locale", () => {
    // Stated, not assumed: without a `navigator` here the assertion below would
    // hold even with the guard removed, and this file would prove nothing.
    expect(typeof navigator).not.toBe("undefined");
    expect(typeof document).toBe("undefined");

    const i18n = createI18n({ cookieName: "monorepo_lang" });

    expect(i18n.resolvedLanguage).toBe(defaultLanguage);
  });
});
