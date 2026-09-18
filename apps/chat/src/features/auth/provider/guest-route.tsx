import { Navigate, Outlet } from "react-router";

import { ROUTES } from "~/constants/routes";
import RouteGuardLoading from "~/features/auth/components/route-guard-loading";
import { useSessionCheck } from "~/features/auth/hooks/use-session-check";

/**
 * The mirror of `ProtectedRoute`: it wraps routes that only make sense while
 * signed OUT. Without it, an authenticated user can navigate back to the
 * sign-in form and submit it again — and it runs the same session check, so
 * landing on `/sign-in` with a still-good refresh cookie but nothing in the
 * store bounces straight to `/` instead of flashing the form first.
 */
export default function GuestRoute() {
  const { token, isCheckingSession } = useSessionCheck();

  if (isCheckingSession) {
    return <RouteGuardLoading />;
  }

  if (token) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
