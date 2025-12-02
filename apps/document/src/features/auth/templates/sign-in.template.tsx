"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Separator,
} from "@monorepo/ui";

import { LanguageToggle } from "~/features/layout/components/language-toggle";
import { authClient } from "~/libs/auth-client";

const signInSchema = z.object({
  email: z.string(),
  password: z.string(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInTemplate({ locale }: { locale: string }) {
  const t = useTranslations("SignIn");
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Get redirect URL from query params, default to home
  const redirectTo = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            toast.success(t("sign_in_success"));
            window.location.href = redirectTo;
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || t("sign_in_error"));
            setIsLoading(false);
          },
        },
      );
      if (result.data) {
        setIsLoading(false);
      }
    } catch {
      toast.error(t("sign_in_error"));
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    // Open popup window immediately (before async call) to avoid popup blocker
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      "about:blank",
      "Google Sign In",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,directories=no,status=no`,
    );

    if (!popup) {
      setIsGoogleLoading(false);
      toast.error(t("popup_blocked_error"));
      return;
    }

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
        popup.close();
        throw new Error("Failed to get OAuth URL");
      }

      // Navigate popup to OAuth URL (not parent window)
      popup.location.href = response.data.url;

      // Listen for message from popup
      const messageListener = (event: MessageEvent) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data?.type === "OAUTH_SUCCESS") {
          window.removeEventListener("message", messageListener);
          popup.close();
          toast.success(t("sign_in_success"));
          window.location.href = redirectTo;
          setIsGoogleLoading(false);
        } else if (event.data?.type === "OAUTH_ERROR") {
          window.removeEventListener("message", messageListener);
          popup.close();
          toast.error(event.data.error || t("sign_in_error"));
          setIsGoogleLoading(false);
        }
      };

      window.addEventListener("message", messageListener);

      // Check if popup is closed manually
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener("message", messageListener);
          setIsGoogleLoading(false);
        }
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("sign_in_error"));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="bg-background relative flex h-screen w-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("email_placeholder")}
                  autoComplete="email"
                  className="h-11"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("password_placeholder")}
                  autoComplete="current-password"
                  className="h-11"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? t("signing_in") : t("sign_in")}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">
                  {t("or_continue_with")}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              <svg className="mr-2 size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isGoogleLoading ? t("signing_in") : t("sign_in_with_google")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
