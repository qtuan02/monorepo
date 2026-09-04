import { expect, test } from "@playwright/test";

/**
 * The browser half of i18n, which the raw-document specs structurally cannot
 * reach: that hydration matches what the server sent, that switching language
 * re-renders the page in place, and that the choice survives a reload.
 *
 * The project pins `locale: "vi-VN"`, so a page opened here arrives in
 * Vietnamese without the spec asking for it.
 */
test.describe("app shell", () => {
  test("switches language in place, and remembers the choice", async ({
    page,
  }) => {
    // Collected BEFORE the navigation: a hydration mismatch is reported once,
    // during hydration, and React logs it rather than throwing — so a spec that
    // only looked at the rendered result would never see it.
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Template React Router" }),
    ).toBeVisible();
    // The tab comes from `meta`, which runs outside React and reads root's
    // loader data. Asserted on both sides of the switch below, because that is
    // the one pair the body and the tab can disagree on.
    await expect(page).toHaveTitle(/^Template React Router/);

    // An attribute React never rendered, so React never reconciles it away — but
    // a document the server sent again would not carry it. If the switch below
    // navigated or reloaded instead of re-rendering in place, it is gone.
    await page.evaluate(() =>
      document.body.setAttribute("data-e2e-document", "first"),
    );

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Tiếng Anh" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: "React Router Template" }),
    ).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute(
      "data-e2e-document",
      "first",
    );
    // And no locale prefix appeared: the language is a cookie here, not a path
    // segment (contrast `_template_next`, whose switcher lands on `/en`).
    await expect(page).toHaveURL(/\/$/);
    // The attribute follows the instance the tree renders in, which is why
    // `root.tsx` reads it off i18next rather than off the root loader — loader
    // data does not change when the language does.
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    // And the tab followed. `meta`'s language is frozen at the language the
    // document was requested in, so this only holds because `root.tsx`'s `App`
    // revalidates on `languageChanged` — without it the body is English while
    // the title is still Vietnamese, which no assertion above would notice.
    await expect(page).toHaveTitle(/^React Router Template/);

    // The detector cached the choice into the language cookie, so the NEXT
    // server render negotiates from it instead of from `Accept-Language` — a
    // full reload, not a client navigation, is what proves that.
    await page.reload();

    await expect(
      page.getByRole("heading", { level: 1, name: "React Router Template" }),
    ).toBeVisible();
    await expect(page.locator("body")).not.toHaveAttribute("data-e2e-document");

    // Asserted as "nothing was logged at all", and NOT as "nothing matching
    // /hydrat/i" — that filter reads like the stricter assertion and is in fact
    // vacuous here. `webServer` serves the production build, where React ships
    // its messages as numeric codes: a real mismatch on this page logs
    //
    //   Minified React error #418; visit https://react.dev/errors/418?args[]=…
    //
    // which contains no "hydration", no "did not match", and nothing else a
    // wording-based filter could be written against. Verified by rewriting the
    // served document's `lang` in flight with `page.route`, so `entry.client`
    // hydrated a Vietnamese tree as English: that is the message it produced.
    //
    // An empty list is the only form of this assertion that can fail, and the
    // reason it is worth the noise it will one day catch: React recovers from a
    // mismatch by silently re-rendering, so the console is the ONLY place the
    // bug this ticket exists to prevent is observable at all.
    expect(consoleErrors).toEqual([]);
  });
});
