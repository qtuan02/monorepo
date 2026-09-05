import { expect, test } from "@playwright/test";

/**
 * Language negotiation, asserted on the RAW document. The whole point of doing
 * i18n on this Runtime is that the first response is already in the visitor's
 * language — so the proof has to be a response body, not a rendered page: a
 * browser-driven assertion would pass just as happily if the language were
 * corrected by JavaScript after paint.
 *
 * The `request` fixture inherits neither the project's `locale: "vi-VN"` nor any
 * cookie the browser holds, so each case here states its own headers and there
 * is nothing ambient left to explain a result.
 */

// The cookie name is `~/constants/cookies`'s value, spelled out rather than
// imported: what is being asserted is the contract with a browser, and a spec
// that reads the same constant the server reads would keep passing if the name
// changed under both.
const LANGUAGE_COOKIE = "template_reactrouter_lang";

test.describe("language negotiation", () => {
  test("renders the page in the language the browser asked for", async ({
    request,
  }) => {
    const response = await request.get("/", {
      headers: { "Accept-Language": "en-GB,en;q=0.9" },
    });

    expect(response.status()).toBe(200);

    const html = await response.text();

    expect(html).toMatch(/<html[^>]*\slang="en"/);
    // `meta` translated on the server through `getFixedT`, not a hard-coded
    // string: the two languages word the product name differently, so this can
    // only pass if the request's language reached a function outside the tree.
    // Asserted whole, and with the ICU argument resolved: a `getFixedT` handed
    // no `appEnv` renders the literal `{appEnv}`, so the parenthesis is what
    // separates "translated on the server" from "looked a key up".
    expect(html).toContain(
      "<title>React Router Template — Monorepo (local)</title>",
    );
    // A label that exists in English only, so no amount of fallback produces it.
    expect(html).toContain("Route table");
    expect(html).not.toContain("Bảng route");
  });

  test("lets the stored choice win over the browser's header", async ({
    request,
  }) => {
    const response = await request.get("/", {
      headers: {
        "Accept-Language": "en-GB,en;q=0.9",
        // What the i18next detector wrote the last time this visitor switched.
        cookie: `${LANGUAGE_COOKIE}=vi`,
      },
    });

    const html = await response.text();

    // An explicit choice must beat a default the visitor never picked — the
    // same order the detector runs in the browser (`["cookie", "navigator"]`).
    expect(html).toMatch(/<html[^>]*\slang="vi"/);
    expect(html).toContain("Bảng route");
    // `meta` runs outside the React tree, off root's loader data rather than off
    // the provider — a second, independent path the negotiated language has to
    // reach — so the tab has to follow the cookie exactly as the body does.
    expect(html).toContain(
      "<title>Template React Router — Monorepo (local)</title>",
    );
  });

  test("falls back to the default language when the request says nothing", async ({
    request,
  }) => {
    const response = await request.get("/", {
      headers: { "Accept-Language": "de-DE,de;q=0.9" },
    });

    const html = await response.text();

    // `de` is not in the registry, so it is skipped rather than indexed into
    // the catalogue.
    expect(html).toMatch(/<html[^>]*\slang="vi"/);
  });

  test("keeps overlapping requests in their own languages", async ({
    request,
  }) => {
    // The behavioural half of the proof that `entry.server` clones i18next
    // instead of switching the shared singleton. A process-wide `changeLanguage`
    // would pass every test above — each one is alone on the server — and can
    // only fail here, which is the shape the real bug takes in production.
    //
    // A burst rather than a single pair: React starts the render in a microtask,
    // so the window a racy implementation loses is between one request writing
    // the language and its own render running, and only genuinely interleaved
    // handlers land inside it. Twelve in flight costs a second and makes that
    // interleaving likely rather than incidental. It is still a net rather than
    // a proof — what forecloses the race by construction is
    // `test/entry.server.test.ts`, which fails if `changeLanguage` appears in
    // this Runtime's server entry at all.
    const wanted = Array.from({ length: 12 }, (_, index) =>
      index % 2 === 0 ? "vi" : "en",
    );

    const documents = await Promise.all(
      wanted.map((language) =>
        request
          .get("/", { headers: { "Accept-Language": language } })
          .then((response) => response.text()),
      ),
    );

    expect(
      documents.map((html) => html.match(/<html[^>]*\slang="(\w+)"/)?.[1]),
    ).toEqual(wanted);
    // The body has to agree with the attribute it was sent under: an instance
    // whose language moved mid-render would still emit the `lang` it started in.
    expect(documents.map((html) => html.includes("Bảng route"))).toEqual(
      wanted.map((language) => language === "vi"),
    );
  });
});
