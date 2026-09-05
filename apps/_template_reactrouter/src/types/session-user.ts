/**
 * What the session cookie carries about who is signed in. It lives in the
 * foundation layer rather than in the `auth` slice because `~/libs/session.server`
 * names it, and `~/libs` sits below `~/features` in the import graph — a slice
 * type imported from a lib would point that arrow upward.
 *
 * It is the payload of
 * a signed cookie, so it stays small on purpose: a real app stores an id and
 * whatever the shell needs to render a name, and reads the rest from a service
 * on demand rather than growing the cookie.
 */
export interface SessionUser {
  id: string;
  name: string;
}
