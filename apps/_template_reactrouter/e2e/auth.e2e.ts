import type { APIRequestContext } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { BASE_URL } from "../playwright.config";

/**
 * The session, asserted where it actually lives: on the wire. Everything in the
 * first half reads the RAW response through the `request` fixture — no
 * browser, no hydration — because the properties this ticket exists for are
 * properties of responses: that a guarded page is answered with a redirect
 * before any of it is rendered, that the cookie carries the attributes that
 * keep it out of a script's reach, and that a cookie whose bytes were touched
 * buys nothing. A component test cannot see a `Set-Cookie` header; a
 * browser-driven test cannot tell a server redirect from a client one.
 *
 * The `request` fixture inherits no cookie jar, so every case states the exact
 * `cookie` it sends, and the two that must not share a jar build a fresh
 * context of their own.
 */

// Spelled out rather than imported from `~/constants/cookies`, for the same
// reason the i18n spec spells the language cookie: what is asserted is the
// contract with a browser, and a spec reading the same constant the server
// reads would keep passing if the name changed under both.
const SESSION_COOKIE = "template_reactrouter_session";

const ACCEPT_VI = { "Accept-Language": "vi-VN,vi;q=0.9" };

/** The `name=value` pair of the session cookie out of a `Set-Cookie` header. */
function sessionPairOf(setCookie: string) {
  const pair = setCookie
    .split("\n")
    .find((line) => line.startsWith(`${SESSION_COOKIE}=`))
    ?.split(";")[0];

  expect(pair).toBeDefined();

  return pair ?? "";
}

/** Signs in through the raw endpoint and returns the cookie pair to send back. */
async function signInRaw(request: APIRequestContext) {
  const response = await request.post("/sign-in", {
    form: { username: "template", password: "template" },
    headers: ACCEPT_VI,
    maxRedirects: 0,
  });

  expect(response.status()).toBe(302);

  return sessionPairOf(response.headers()["set-cookie"] ?? "");
}

/** The `Location` header parsed against the server's own origin. */
function locationOf(headers: Record<string, string>) {
  const location = headers.location;

  // A redirect with no `Location` is not a redirect; failing here names the
  // missing header instead of letting `new URL` complain about an empty string.
  if (!location) throw new Error("The response carries no Location header");

  return new URL(location, BASE_URL);
}

test.describe("session guard, on the raw document", () => {
  test("answers a signed-out request for the dashboard with a redirect, not a page", async ({
    request,
  }) => {
    // `maxRedirects: 0`, because the status IS the assertion: a 200 here would
    // mean the guard decided while rendering, after the bytes had gone out.
    const response = await request.get("/dashboard", {
      headers: ACCEPT_VI,
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);

    const location = locationOf(response.headers());

    expect(location.pathname).toBe("/sign-in");
    // Asserted on the DECODED value: the header carries `%2Fdashboard`, and
    // what matters is what the sign-in loader will read back out of it.
    expect(location.searchParams.get("redirectTo")).toBe("/dashboard");
    // And nothing of the guarded page leaked into the redirect body.
    expect(await response.text()).not.toContain("Nguyễn Văn A");
  });

  test("keeps the query string inside redirectTo", async ({ request }) => {
    const response = await request.get("/dashboard?x=1", {
      headers: ACCEPT_VI,
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    // `/dashboard?x=1` as ONE value — not `x=1` spilled into the sign-in URL's
    // own query, which is the shape a naive string concatenation produces.
    expect(locationOf(response.headers()).searchParams.get("redirectTo")).toBe(
      "/dashboard?x=1",
    );
  });

  test("mints an HttpOnly, SameSite=Lax cookie on sign-in, and no Secure flag on a local build", async ({
    request,
  }) => {
    const response = await request.post("/sign-in", {
      form: { username: "template", password: "template" },
      headers: ACCEPT_VI,
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
    expect(locationOf(response.headers()).pathname).toBe("/dashboard");

    const setCookie = response.headers()["set-cookie"] ?? "";

    expect(setCookie).toContain(`${SESSION_COOKIE}=`);
    // Unreadable from JavaScript, and withheld from a cross-site POST — the
    // two attributes that let this app have no auth store at all.
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    // The E2E server is built against the committed `.env.example`'s
    // `PUBLIC_APP_ENV=local`, and a `Secure` cookie is never sent over plain
    // http — so its absence here is what lets this very spec sign in.
    expect(setCookie).not.toContain("Secure");
  });

  test("serves the dashboard to the cookie it minted, and nothing to a cookie with one byte changed", async ({
    playwright,
  }) => {
    // A context of its own, with no jar: the fixture would otherwise store the
    // sign-in cookie and quietly send it along with the tampered one below.
    const raw = await playwright.request.newContext({
      baseURL: BASE_URL,
      storageState: { cookies: [], origins: [] },
    });

    try {
      const pair = await signInRaw(raw);

      const signedIn = await raw.get("/dashboard", {
        headers: { ...ACCEPT_VI, cookie: pair },
        maxRedirects: 0,
      });

      expect(signedIn.status()).toBe(200);
      // The user's name is session data, so it can only be in the HTML if the
      // server read it out of the cookie before rendering.
      expect(await signedIn.text()).toContain("Nguyễn Văn A");

      // The last character is inside the HMAC, so the flip lands on a byte the
      // signature covers. Whatever it decodes to now, it is not what was signed.
      const tampered = pair.endsWith("A")
        ? `${pair.slice(0, -1)}B`
        : `${pair.slice(0, -1)}A`;

      const forged = await raw.get("/dashboard", {
        headers: { ...ACCEPT_VI, cookie: tampered },
        maxRedirects: 0,
      });

      // Not a 400, not a 500: a cookie that fails its signature is simply no
      // cookie, and the visitor is treated as signed out.
      expect(forged.status()).toBe(302);
      expect(locationOf(forged.headers()).pathname).toBe("/sign-in");
    } finally {
      await raw.dispose();
    }
  });
});

test.describe("session, in the browser", () => {
  test("signs in through the form, is kept off sign-in, and signs out only by POST", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    // The screen is chromeless, and the only form on the page: the fields are
    // reached by their labels, the way a password manager would.
    await page.getByLabel("Tài khoản").fill("template");
    await page.getByLabel("Mật khẩu").fill("template");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // The action's redirect, followed by the client router: the dashboard
    // renders with the session card, and the name in it is what the cookie
    // carries.
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Nguyễn Văn A" }),
    ).toBeVisible();

    // The guest half: a signed-in visitor asking for sign-in is answered with
    // the dashboard instead, by the server, before the form is ever rendered.
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/dashboard$/);

    // A GET to the sign-out URL — what a prefetch or an <img src> would fire —
    // goes home and changes nothing: the dashboard still answers afterwards.
    await page.goto("/sign-out");
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Nguyễn Văn A" }),
    ).toBeVisible();

    // The real sign-out is the form's POST. It lands on home, and the next
    // request for the dashboard is bounced again — with `redirectTo` pointing
    // back at it, so signing in would return here.
    await page.getByRole("button", { name: "Đăng xuất" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in\?redirectTo=%2Fdashboard$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Đăng nhập" }),
    ).toBeVisible();
  });

  test("returns the visitor to the page they were bounced from", async ({
    page,
  }) => {
    // Asked for the dashboard first, so the guard writes `redirectTo` and the
    // sign-in loader puts it in the form — the round trip that makes the
    // parameter worth carrying at all.
    await page.goto("/dashboard?x=1");
    await expect(page).toHaveURL(/\/sign-in\?redirectTo=/);

    await page.getByLabel("Tài khoản").fill("template");
    await page.getByLabel("Mật khẩu").fill("template");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    // Query string included: `/dashboard?x=1`, not a bare `/dashboard`.
    await expect(page).toHaveURL(/\/dashboard\?x=1$/);
  });
});
