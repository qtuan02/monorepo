import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { toast } from "@monorepo/ui/components/toast";

import { ROUTES } from "~/constants/routes";
import { queryClient } from "~/libs/query-client";
import { useAuthStore } from "~/stores/use-auth-store";

/**
 * Shared by the sign-in form and the sign-up form's "Yes, sign in" step —
 * both end a mutation with the same access token and the same landing.
 */
export function useSignInSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  return (accessToken: string) => {
    // A previous session's data must not be served to whoever just signed
    // in, the same reason ~/libs/http-client's onUnauthorized clears it.
    queryClient.clear();
    setToken(accessToken);
    toast.add({ title: t("chat.auth.toast.signedIn"), type: "success" });
    navigate(ROUTES.HOME, { replace: true });
  };
}
