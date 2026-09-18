import { Navigate, Outlet } from "react-router";

import { ROUTES } from "~/constants/routes";
import RouteGuardLoading from "~/features/auth/components/route-guard-loading";
import { useSessionCheck } from "~/features/auth/hooks/use-session-check";

/**
 * Wraps every route that needs a session. Pages below it never check the token
 * themselves — that check would then live in as many places as there are pages,
 * and drift in each one.
 *
 * It is a route wrapper (`<Outlet />`), not a wrapper around `LayoutTemplate`:
 * the shell also hosts the catch-all 404, which stays reachable without a
 * session, so the check sits *inside* the shell rather than in front of it.
 *
 * The store's token is only half of Session — a reload has none of it but
 * still carries the `HttpOnly` refresh cookie, so the guard asks the backend
 * before it decides rather than bouncing on an empty store alone.
 *
 * `replace` is mandatory: without it the blocked URL stays in history and Back
 * walks the user straight into the route they were just bounced out of.
 *
 * Role-based access is not implemented yet. If it lands it becomes a sibling
 * wrapper — `<RoleRoute allow={[...]} />` nested inside this one, reading
 * permissions as server state through `~/hooks/api`, not from a store.
 */
export default function ProtectedRoute() {
  const { token, isCheckingSession } = useSessionCheck();

  if (isCheckingSession) {
    return <RouteGuardLoading />;
  }

  if (!token) {
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  return <Outlet />;
}
