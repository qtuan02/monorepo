import { createCookieSessionStorage } from "react-router";

import type { SessionUser } from "~/types/session-user";
import { SESSION_COOKIE_NAME } from "~/constants/cookies";
import { env } from "~/env";

/**
 * The session as a signed cookie — this Runtime's counterpart of the Next
 * Template's `signInAction` writing `SESSION_COOKIE_NAME`, and its wiring site
 * in the same sense `~/libs/i18n` is: one place the framework primitive is
 * configured, imported by everything that reads or writes a session.
 *
 * `.server` in the file name is a contract with the build, not a naming habit:
 * `react-router build` refuses to bundle a `.server` module into the client
 * graph, so importing this from a component fails the build instead of
 * shipping the cookie secret to every browser. It is imported only from the
 * server-only exports of a route module (`loader`, `action`, `middleware`) and
 * from the auth slice's middleware files — never from a component.
 *
 * `env` is read at module load, and the seam that follows from it: on jsdom
 * the `server` half of `~/env` throws BY NAME on access, so a jsdom test that
 * imports a route module reaching this file has to `vi.mock("~/libs/session.server")`.
 * Tests of the storage itself run on the node environment and use the real one
 * (`test/libs/session.server.test.ts`).
 *
 * `SessionUser` comes from `~/types`, not from the `auth` slice: `~/libs` sits
 * below `~/features` in the import graph, and even a type-only import from a
 * slice would point that arrow upward.
 */
interface SessionData {
  user: SessionUser;
}

/** Eight hours — long enough for a shift, short enough to expire overnight. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const sessionStorage = createCookieSessionStorage<SessionData>({
  cookie: {
    name: SESSION_COOKIE_NAME,
    // The whole point: unreadable from JavaScript, so it cannot leak through
    // an XSS the way a token in localStorage would.
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    // Signed, so a cookie whose bytes were touched reads as NO session rather
    // than as a tampered one — `getSession` verifies the HMAC and hands back
    // an empty session when it fails. What it is signed with is the one
    // `server` key of `~/env`, validated at build and at boot.
    secrets: [env.TEMPLATE_REACTROUTER_SESSION_SECRET],
    // Read from validated app config rather than `process.env.NODE_ENV`: a
    // `secure` cookie is never sent over plain http, so hard-coding `true`
    // would break local development on http://localhost. Decided at build
    // time, the same rule the Next Template applies (`react-router-serve` has
    // no `trust proxy`, so a per-request check would not be reliable anyway).
    secure: env.PUBLIC_APP_ENV !== "local",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

/**
 * Who the request's cookie says is signed in, or `null`. The only read the
 * middleware needs, so the guard never handles a `Session` object at all.
 *
 * A missing cookie, a cookie signed with another secret and a cookie with one
 * byte flipped all land here as `null` — that is what signing buys, and it is
 * what `test/libs/session.server.test.ts` pins.
 */
export async function getSessionUser(
  request: Request,
): Promise<SessionUser | null> {
  const session = await getSession(request.headers.get("Cookie"));

  return session.get("user") ?? null;
}
