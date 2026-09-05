import { expect, test } from "@playwright/test";

import { BASE_URL } from "../playwright.config";
import { ACCEPT_VI, signInRaw } from "./support/session";

/**
 * The boundary between the two data paths, asserted from both sides.
 *
 * The dashboard puts loader data and TanStack Query data on one screen on
 * purpose, and the property worth proving is that they land at different times:
 * the session card is in the bytes the server sends, and the template list is
 * not — it is fetched by the browser after paint. Only a raw fetch can tell the
 * two apart, because by the time a browser has finished hydrating, both are on
 * screen and indistinguishable.
 *
 * There is no backend behind `PUBLIC_BASE_DOMAIN_API` in an E2E run, which is
 * not a gap here but the second case: a missing backend has to degrade to a
 * visible error state rather than take the page down with it.
 */

test.describe("the two data paths, on the raw document", () => {
  test("sends the session in the HTML and leaves the query's data out of it", async ({
    playwright,
  }) => {
    // A context with no jar, so the cookie sent is exactly the one asserted.
    const raw = await playwright.request.newContext({
      baseURL: BASE_URL,
      storageState: { cookies: [], origins: [] },
    });

    try {
      const pair = await signInRaw(raw);

      const response = await raw.get("/dashboard", {
        headers: { ...ACCEPT_VI, cookie: pair },
        maxRedirects: 0,
      });

      expect(response.status()).toBe(200);

      const html = await response.text();

      // Loader data: the user's name can only be here because the server read
      // the session cookie before rendering.
      expect(html).toContain("Nguyễn Văn A");
      // And the section around the query is server rendered too — the heading
      // is static markup, so its presence is what makes the absence below a
      // statement about the DATA rather than about the whole section.
      expect(html).toContain("Danh sách template");

      // Query data: not in the document, by construction. React Query does not
      // fetch during a server render, and nothing dehydrates its cache into the
      // payload — one value, one home. What the server sends is the skeleton.
      expect(html).toContain('data-slot="skeleton"');

      // The discriminator, and the reason this is not just "the rows are
      // absent": with no backend in an E2E run the rows would be missing from
      // ANY implementation, so their absence proves nothing. The failure is
      // what tells the two apart. Fetched in a `loader`, the refused connection
      // happens on the server and its error state — or a 500 — is in these very
      // bytes. Fetched after paint, the server never touches the backend at all,
      // so the status is 200 and the error text only appears once the browser
      // has tried (the next test).
      expect(html).not.toContain("Đã có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      await raw.dispose();
    }
  });
});

test.describe("the dashboard list, in the browser", () => {
  test("degrades to a visible error state when the backend is unreachable", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Tài khoản").fill("template");
    await page.getByLabel("Mật khẩu").fill("template");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

    // The loader half is unaffected: a failed widget must not take the page
    // with it, which is the whole reason the list fetches on its own.
    await expect(
      page.getByRole("heading", { level: 2, name: "Nguyễn Văn A" }),
    ).toBeVisible();

    // Nothing answers on `PUBLIC_BASE_DOMAIN_API` in an E2E run, so this is the
    // real error branch — reached through the query, not simulated.
    //
    // A longer timeout than the project's 5s default, and it is the price of
    // the branch being real: the query is configured with `retry: 1`, so the
    // state is only reached after two refused connections and the delay between
    // them — measured at roughly six seconds here. Shortening it would mean
    // stubbing the failure, which would no longer prove that a missing backend
    // degrades this way.
    await expect(
      page.getByText("Đã có lỗi xảy ra, vui lòng thử lại."),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Thử lại" })).toBeVisible();
  });
});
