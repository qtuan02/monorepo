import { redirect } from "next/navigation";

import type { AuthProviderProps } from "~/types/auth";
import LayoutTemplate from "~/features/layout/templates/layout.template";
import { extractLocale } from "~/utils/path-helpers";

export function AuthProvider({
  children,
  session,
  pathname,
}: AuthProviderProps) {
  if (session && pathname.includes("/sign-in")) {
    const locale = extractLocale(pathname);
    redirect(`/${locale}`);
  }

  if (session && !pathname.includes("auth/callback")) {
    return <LayoutTemplate>{children}</LayoutTemplate>;
  }

  return <>{children}</>;
}
