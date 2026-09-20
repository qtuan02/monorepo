import { useNavigate } from "react-router";

import { ROUTES } from "~/constants/routes";
import { useSignOutMutation } from "~/hooks/api/auth";
import { queryClient } from "~/libs/query-client";
import { useAuthStore } from "~/stores/use-auth-store";

/** Shared by the header's SignOutButton and the sidebar current-user menu. */
export function useSignOut() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return useSignOutMutation({
    onSuccess: () => {
      queryClient.clear();
      logout();
      navigate(ROUTES.SIGN_IN, { replace: true });
    },
  });
}
