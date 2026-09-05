// @vitest-environment node
//
// The real session storage, so the node environment — see
// `test/libs/session.server.test.ts` for the two reasons.

import { describe, expect, it } from "vitest";

import { SESSION_COOKIE_NAME } from "~/constants/cookies";
import { commitSession, getSession } from "~/libs/session.server";
import * as signOut from "~/routes/sign-out";

async function signedCookie() {
  const session = await getSession();
  session.set("user", { id: "u-1", name: "Nguyễn Văn A" });
  const [pair] = (await commitSession(session)).split(";");

  return pair ?? "";
}

function argsFor(
  method: "GET" | "POST",
  cookie: string,
  headers: Record<string, string> = {},
) {
  const url = "http://localhost/sign-out";

  return {
    request: new Request(url, { method, headers: { cookie, ...headers } }),
    url: new URL(url),
    params: {},
    pattern: "/sign-out",
    context: {} as never,
  };
}

async function thrownBy(run: () => unknown) {
  const thrown = await Promise.resolve()
    .then(run)
    .then(
      () => null,
      (error: unknown) => error,
    );

  expect(thrown).toBeInstanceOf(Response);

  return thrown as Response;
}

describe("route: sign-out", () => {
  it("is a resource route — nothing to render", () => {
    // No default export is what makes the framework answer this URL with the
    // action's or loader's `Response` alone, instead of a document.
    expect("default" in signOut).toBe(false);
  });

  it("destroys the session on POST and sends the visitor home", async () => {
    const cookie = await signedCookie();
    const response = await thrownBy(() =>
      signOut.action(argsFor("POST", cookie)),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    // What a browser needs to drop the cookie: the same name, already expired.
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie.startsWith(`${SESSION_COOKIE_NAME}=`)).toBe(true);
    expect(setCookie).toMatch(/Expires=Thu, 01 Jan 1970/);
  });

  it("accepts a POST from its own origin, scheme aside", async () => {
    // What a browser sends for the dashboard's own form — and, behind a TLS
    // proxy, with a scheme the server never sees. Host is what is compared.
    const response = await thrownBy(() =>
      signOut.action(argsFor("POST", "", { origin: "https://localhost" })),
    );

    expect(response.status).toBe(302);
  });

  it("refuses a POST from another origin, so a foreign page cannot sign anyone out", async () => {
    // The framework's own CSRF check skips resource routes, so this is the
    // only thing standing between an auto-submitted cross-site form and an
    // expiring `Set-Cookie` the browser would honour.
    const cookie = await signedCookie();
    const response = await thrownBy(() =>
      signOut.action(
        argsFor("POST", cookie, { origin: "https://evil.example" }),
      ),
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("sends a GET home without touching the cookie", async () => {
    // A GET can be fired by a prefetch or an `<img src>`; it must never sign
    // anyone out. The redirect carries no `Set-Cookie`, so the session the
    // browser holds is exactly the one it had.
    const response = await thrownBy(() => signOut.loader());

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
