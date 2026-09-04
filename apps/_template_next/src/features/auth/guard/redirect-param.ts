/**
 * The query parameter the proxy guard writes and the sign-in form reads back.
 *
 * It lives beside the guard rather than in `~/constants` because it is part of
 * that one contract: the module that sets it and the module that consumes it are
 * the only two callers, and both belong to the auth slice.
 */
export const SIGN_IN_REDIRECT_PARAM = "redirectTo";
