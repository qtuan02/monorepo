import { Suspense } from "react";

import type { NextParams } from "~/types/common";
import SignInTemplate from "~/features/auth/templates/sign-in.template";

export default async function SignInPage({ params }: { params: NextParams }) {
  const { locale } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInTemplate locale={locale} />
    </Suspense>
  );
}
