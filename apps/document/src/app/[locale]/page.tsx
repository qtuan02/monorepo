import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { NextParams } from "~/types/common";
import { auth } from "~/libs/auth";
import HomeTemplate from "~/features/home/templates/home.template";

export default async function HomePage({
  params,
}: {
  params: NextParams;
}) {
  const { locale } = await params;

  // Validate session on server side for security
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/${locale}/sign-in`);
  }

  return <HomeTemplate />;
}
