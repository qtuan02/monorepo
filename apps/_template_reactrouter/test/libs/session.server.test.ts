// @vitest-environment node
//
// The real storage, not a mock, so this needs the environment where two things
// are legal: reading the `server` half of `~/env` (jsdom's copy throws on it by
// name), and `crypto.subtle`, which React Router signs cookies with and which
// jsdom does not provide.

import { describe, expect, it } from "vitest";

import { SESSION_COOKIE_NAME } from "~/constants/cookies";
import { env } from "~/env";
import {
  commitSession,
  destroySession,
  getSession,
  getSessionUser,
} from "~/libs/session.server";

const user = { id: "u-1", name: "Nguyễn Văn A" };

/** Mints a signed cookie the way the sign-in action does. */
async function signedCookie() {
  const session = await getSession();
  session.set("user", user);

  return commitSession(session);
}

/** The `Cookie` header a browser would send back from a `Set-Cookie` line. */
function requestWith(setCookie: string) {
  const [pair] = setCookie.split(";");

  return new Request("http://localhost/dashboard", {
    headers: pair ? { cookie: pair } : {},
  });
}

describe("session.server", () => {
  it("round-trips the user through a signed cookie", async () => {
    const setCookie = await signedCookie();

    expect(setCookie.startsWith(`${SESSION_COOKIE_NAME}=`)).toBe(true);
    await expect(getSessionUser(requestWith(setCookie))).resolves.toEqual(user);
  });

  it("reads a request with no cookie as no session", async () => {
    await expect(
      getSessionUser(new Request("http://localhost/dashboard")),
    ).resolves.toBeNull();
  });

  it("reads a cookie with one byte flipped as no session — the signature is what is checked", async () => {
    const setCookie = await signedCookie();
    const [pair = "", ...attributes] = setCookie.split(";");
    // The last character is inside the HMAC, so the flip cannot land on a
    // byte the signature does not cover.
    const flipped = pair.endsWith("A")
      ? `${pair.slice(0, -1)}B`
      : `${pair.slice(0, -1)}A`;

    await expect(
      getSessionUser(requestWith([flipped, ...attributes].join(";"))),
    ).resolves.toBeNull();
  });

  it("sets the attributes that keep the cookie out of reach of scripts and cross-site posts", async () => {
    const setCookie = await signedCookie();

    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Path=/");
    expect(setCookie).toContain("Max-Age=28800");
  });

  it("marks the cookie Secure everywhere except the local environment", async () => {
    const setCookie = await signedCookie();

    // Decided from validated app config at build time, not from
    // `process.env.NODE_ENV` — so the assertion is against the same value the
    // storage read, whatever the repo-root `.env` on this machine says.
    expect(setCookie.includes("Secure")).toBe(env.PUBLIC_APP_ENV !== "local");
  });

  it("destroys a session by expiring the cookie", async () => {
    const session = await getSession();
    const setCookie = await destroySession(session);

    // What a browser needs to drop the cookie: the same name, and a lifetime
    // already in the past.
    expect(setCookie.startsWith(`${SESSION_COOKIE_NAME}=`)).toBe(true);
    expect(setCookie).toMatch(/Expires=Thu, 01 Jan 1970/);
  });
});
