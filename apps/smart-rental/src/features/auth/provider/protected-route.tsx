import { Navigate, Outlet } from "react-router";

import { ROUTES } from "~/constants/routes";
import { useAuthStore } from "~/stores/use-auth-store";

/**
 * Wraps every route that needs a session. Pages below it never check the token
 * themselves — that check would then live in as many places as there are pages,
 * and drift in each one.
 *
 * It is a route wrapper (`<Outlet />`), not a wrapper around `LayoutTemplate`:
 * the shell also hosts the catch-all 404, which stays reachable without a
 * session, so the check sits *inside* the shell rather than in front of it.
 *
 * `replace` is mandatory: without it the blocked URL stays in history and Back
 * walks the user straight into the route they were just bounced out of.
 */
export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);

  if (!token) {
    return <Navigate to={ROUTES.AUTH_LOGIN} replace />;
  }

  return <Outlet />;
}
