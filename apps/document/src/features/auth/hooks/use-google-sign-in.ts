import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { authClient } from "~/libs/auth-client";
import { useOAuthPopup } from "./use-oauth-popup";

interface UseGoogleSignInOptions {
  locale: string;
}

/**
 * Hook for handling Google OAuth sign-in with popup
 * @param options - Configuration options including locale
 * @returns Object with sign-in handler and loading state
 */
export function useGoogleSignIn({ locale }: UseGoogleSignInOptions) {
  const t = useTranslations("SignIn");
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect URL from query params, default to home
  const redirectTo = searchParams.get("redirect") || "/";

  const { openPopup } = useOAuthPopup({
    onSuccess: () => {
      toast.success(t("sign_in_success"));
      window.location.href = redirectTo;
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error === "popup_blocked_error" ? t("popup_blocked_error") : t("sign_in_error"));
      setIsLoading(false);
    },
    onClose: () => {
      setIsLoading(false);
    },
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      // Create callback URL for popup with popup flag
      const callbackURL = `/${locale}/auth/callback?redirect=${encodeURIComponent(redirectTo)}&popup=true`;

      // Get OAuth URL from Better Auth with disableRedirect to prevent parent window redirect
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        disableRedirect: true, // This prevents automatic redirect on parent window
      });

      if (!response.data?.url) {
        throw new Error("Failed to get OAuth URL");
      }

      // Open popup with OAuth URL
      const popupOpened = openPopup(response.data.url, "Google Sign In");

      if (!popupOpened) {
        setIsLoading(false);
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("sign_in_error"));
      setIsLoading(false);
    }
  };

  return {
    handleGoogleSignIn,
    isLoading,
  };
}

