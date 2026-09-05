// @vitest-environment node
//
// Real signed cookies, so the node environment — see require-session.test.ts.

import { RouterContextProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { guestOnly } from "~/features/auth/middleware/guest-only";
import { commitSession, getSession } from "~/libs/session.server";

async function run(method: "GET" | "POST", cookie?: string) {
  const url = "http://localhost/sign-in";
  const args = {
    request: new Request(url, {
      method,
      headers: cookie ? { cookie } : {},
    }),
    url: new URL(url),
    params: {},
    pattern: "/sign-in",
    context: new RouterContextProvider(),
  };
  const next = vi.fn(async () => new Response(null));

  const thrown = await Promise.resolve(guestOnly(args, next)).then(
    () => null,
    (error: unknown) => error,
  );

  return { next, thrown };
}

async function signedCookie() {
  const session = await getSession();
  session.set("user", { id: "u-1", name: "Nguyễn Văn A" });
  const [pair] = (await commitSession(session)).split(";");

  return pair ?? "";
}

describe("guestOnly", () => {
  it("lets a signed-out visitor reach the sign-in screen", async () => {
    const { next, thrown } = await run("GET");

    expect(thrown).toBeNull();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("sends a signed-in visitor to the dashboard instead", async () => {
    const { next, thrown } = await run("GET", await signedCookie());

    expect(thrown).toBeInstanceOf(Response);
    const response = thrown as Response;
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/dashboard");
    expect(response.headers.get("X-Remix-Replace")).toBe("true");
    expect(next).not.toHaveBeenCalled();
  });

  it("bounces a POST from a session-holding tab the same way, so it never mints a second cookie", async () => {
    // Middleware runs before the action, so this is the case where mounting
    // the guard on the route rather than inside the loader earns its keep: a
    // loader-only check would let the form's POST straight through.
    const { next, thrown } = await run("POST", await signedCookie());

    expect((thrown as Response).headers.get("location")).toBe("/dashboard");
    expect(next).not.toHaveBeenCalled();
  });
});
