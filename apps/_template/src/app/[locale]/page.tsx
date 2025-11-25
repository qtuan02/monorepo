import { cn } from "@fe-monorepo/ui";

import type { NextParams } from "~/types/common";
import { ButtonSentryError } from "~/components/button/button-sentry-error";
import { env } from "~/env";

export default async function HomePage({ params }: { params: NextParams }) {
  const { locale } = await params;
  return (
    <>
      <div className={cn("text-red-500")}>
        This is {locale} and {env.NEXT_PUBLIC_ENV} Home Page
      </div>
      <ButtonSentryError />
    </>
  );
}
