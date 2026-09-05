// @vitest-environment node
//
// The cookie the guard reads is minted through the REAL session storage, so
// this file needs the node environment for the same two reasons
// `test/libs/session.server.test.ts` does: the `server` half of `~/env`, and
// `crypto.subtle` for the signature.

import { RouterContextProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { requireSession } from "~/features/auth/middleware/require-session";
import { userContext } from "~/features/auth/middleware/user-context";
import { commitSession, getSession } from "~/libs/session.server";

/**
 * The guard is called as the plain function it is, with the arguments the
 * framework would build — the shape `test/root.test.ts` uses for root's
 * middleware. `createRoutesStub` cannot stand in here: its route objects take
 * no `middleware` key, so a stub would prove nothing about the guard.
 *
 * `url` is built from the raw request URL on purpose. React Router 8.3 hands a
 * normalized one to middleware, but a guard that only works on the normalized
 * one is a guard whose `redirectTo` breaks the day that stops being true.
 */
function argsFor(url: string, cookie?: string) {
  return {
    request: new Request(url, { headers: cookie ? { cookie } : {} }),
    url: new URL(url),
    params: {},
    pattern: "/dashboard",
    context: new RouterContextProvider(),
  };
}

async function run(url: string, cookie?: string) {
  const args = argsFor(url, cookie);
  const next = vi.fn(async () => new Response(null));

  const outcome = await Promise.resolve(requireSession(args, next)).then(
    () => null,
    (thrown: unknown) => thrown,
  );

  return { args, next, thrown: outcome };
}

/** Exactly what the sign-in action puts on the wire, minus the attributes. */
async function signedCookie(user = { id: "u-1", name: "Nguyễn Văn A" }) {
  const session = await getSession();
  session.set("user", user);
  const [pair] = (await commitSession(session)).split(";");

  return pair ?? "";
}

function locationOf(thrown: unknown) {
  expect(thrown).toBeInstanceOf(Response);
  const response = thrown as Response;
  const location = response.headers.get("location");

  expect(location).not.toBeNull();

  return { response, url: new URL(location ?? "", "http://localhost") };
}

describe("requireSession", () => {
  it("bounces a visitor with no cookie to sign-in, remembering where they were going", async () => {
    const { thrown, next } = await run("http://localhost/dashboard");
    const { response, url } = locationOf(thrown);

    expect(response.status).toBe(302);
    expect(url.pathname).toBe("/sign-in");
    expect(url.searchParams.get("redirectTo")).toBe("/dashboard");
    // Thrown, so nothing below the guard ran — not even to build a response
    // that is then discarded.
    expect(next).not.toHaveBeenCalled();
  });

  it("keeps the query string inside redirectTo, so filters survive the round trip", async () => {
    const { thrown } = await run(
      "http://localhost/dashboard?tab=billing&page=3",
    );

    expect(locationOf(thrown).url.searchParams.get("redirectTo")).toBe(
      "/dashboard?tab=billing&page=3",
    );
  });

  it("writes the page into redirectTo when the request is the .data fetch of a client navigation", async () => {
    const { thrown } = await run(
      "http://localhost/dashboard.data?tab=billing&_routes=routes%2Fdashboard",
    );

    // The visitor asked for `/dashboard?tab=billing`; the router asked the
    // server for its loaders. Sending them back to the second after sign-in
    // would render a turbo-stream payload as a page.
    expect(locationOf(thrown).url.searchParams.get("redirectTo")).toBe(
      "/dashboard?tab=billing",
    );
  });

  it("redirects with replace, so Back does not return to the bounce", async () => {
    const { thrown } = await run("http://localhost/dashboard");

    // The one thing `replace()` adds over `redirect()`: the header the client
    // router reads to swap the history entry rather than push one.
    expect(locationOf(thrown).response.headers.get("X-Remix-Replace")).toBe(
      "true",
    );
  });

  it("treats a cookie with a broken signature exactly like no cookie", async () => {
    const cookie = await signedCookie();
    const tampered = cookie.endsWith("A")
      ? `${cookie.slice(0, -1)}B`
      : `${cookie.slice(0, -1)}A`;

    const { thrown, next } = await run("http://localhost/dashboard", tampered);

    expect(locationOf(thrown).url.pathname).toBe("/sign-in");
    expect(next).not.toHaveBeenCalled();
  });

  it("lets a signed cookie through and hands its user to the loaders below", async () => {
    const user = { id: "u-7", name: "Nguyễn Văn A" };
    const { args, next, thrown } = await run(
      "http://localhost/dashboard",
      await signedCookie(user),
    );

    expect(thrown).toBeNull();
    // Once: a guard that forgets `next` hangs the request, and one that calls
    // it twice runs every loader below twice.
    expect(next).toHaveBeenCalledTimes(1);
    expect(args.context.get(userContext)).toEqual(user);
  });
});
