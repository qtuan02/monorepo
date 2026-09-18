import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";

import { ROUTES } from "~/constants/routes";
import { useSignOutMutation } from "~/hooks/api/auth";
import { queryClient } from "~/libs/query-client";
import { useAuthStore } from "~/stores/use-auth-store";

export default function SignOutButton() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const signOut = useSignOutMutation({
    onSuccess: () => {
      queryClient.clear();
      logout();
      navigate(ROUTES.SIGN_IN, { replace: true });
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={signOut.isPending}
      onClick={() => signOut.mutate()}
    >
      {signOut.isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
