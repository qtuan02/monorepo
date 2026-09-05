import type { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";

import { BASE_URL } from "../../playwright.config";

/**
 * What a raw-document spec needs to hold a session, shared by the specs that
 * assert on responses rather than on a browser.
 *
 * The Vite Template's `e2e/support/auth-session.ts` seeds a persisted store
 * through `page.addInitScript`; there is nothing to seed here, because this
 * app's session is an `HttpOnly` cookie no script can write. The only way in is
 * the endpoint itself, so this signs in for real and hands back the cookie to
 * send on the next request.
 */

// Spelled out rather than imported from `~/constants/cookies`: what is asserted
// is the contract with a browser, and a spec reading the same constant the
// server reads would keep passing if the name changed under both.
export const SESSION_COOKIE = "template_reactrouter_session";

/**
 * The `request` fixture does not inherit the project's `locale`, so a raw spec
 * asking for Vietnamese text has to say so itself.
 */
export const ACCEPT_VI = { "Accept-Language": "vi-VN,vi;q=0.9" };

/** The `name=value` pair of the session cookie out of a `Set-Cookie` header. */
export function sessionPairOf(setCookie: string) {
  const pair = setCookie
    .split("\n")
    .find((line) => line.startsWith(`${SESSION_COOKIE}=`))
    ?.split(";")[0];

  expect(pair).toBeDefined();

  return pair ?? "";
}

/** Signs in through the raw endpoint and returns the cookie pair to send back. */
export async function signInRaw(request: APIRequestContext) {
  const response = await request.post("/sign-in", {
    form: { username: "template", password: "template" },
    headers: ACCEPT_VI,
    maxRedirects: 0,
  });

  expect(response.status()).toBe(302);

  return sessionPairOf(response.headers()["set-cookie"] ?? "");
}

/** The `Location` header parsed against the server's own origin. */
export function locationOf(headers: Record<string, string>) {
  const location = headers.location;

  // A redirect with no `Location` is not a redirect; failing here names the
  // missing header instead of letting `new URL` complain about an empty string.
  if (!location) throw new Error("The response carries no Location header");

  return new URL(location, BASE_URL);
}
