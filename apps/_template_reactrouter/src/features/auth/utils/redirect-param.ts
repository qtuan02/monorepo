/**
 * The query parameter the session guard writes and the sign-in route reads back.
 *
 * It lives beside the guard rather than in `~/constants` because it is part of
 * that one contract: the middleware that sets it and the route that consumes it
 * are the only two callers, and both belong to the auth slice.
 */
export const SIGN_IN_REDIRECT_PARAM = "redirectTo";
