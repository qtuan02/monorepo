import { Navigate, Outlet } from "react-router";

import { ROUTES } from "~/constants/routes";
import { useAuthStore } from "~/stores/use-auth-store";

/**
 * The mirror of `ProtectedRoute`: it wraps routes that only make sense while
 * signed OUT. Without it, an authenticated user can navigate back to the
 * sign-in form and submit it again.
 */
export default function GuestRoute() {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
