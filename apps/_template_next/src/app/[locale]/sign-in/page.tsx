import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import SignInTemplate from "~/features/auth/templates/sign-in.template";

interface SignInPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return { title: t("auth.signIn.title"), robots: { index: false } };
}

/**
 * The guest screen, outside the `(shell)` group so it renders with no header or
 * footer. `searchParams` is handed down **unawaited**: awaiting it here would
 * make the whole page runtime-data, while the template awaits it inside a
 * `<Suspense>` and keeps the form in the static shell.
 */
export default function SignInPage({ searchParams }: SignInPageProps) {
  return <SignInTemplate searchParams={searchParams} />;
}
