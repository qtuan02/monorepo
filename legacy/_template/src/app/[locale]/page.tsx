import { cn } from "@monorepo/ui/libs/cn";

import type { NextParams } from "~/types/common";
import { ButtonSentryError } from "~/components/button/button-sentry-error";
import { env } from "~/env";

export default async function HomePage({ params }: { params: NextParams }) {
  const { locale } = await params;

  return (
    <div className={cn("container mx-auto px-4 py-8")}>
      <h1 className={cn("mb-4 text-2xl font-bold")}>Welcome to Template</h1>
      <p className={cn("text-muted-foreground mb-4")}>
        Current locale: {locale}
      </p>
      <p className={cn("text-muted-foreground mb-4")}>
        Environment: {env.NEXT_PUBLIC_ENV}
      </p>
      <div className={cn("mt-8")}>
        <p className={cn("text-muted-foreground mb-2 text-sm")}>
          Example: Sentry Error Test Button
        </p>
        <ButtonSentryError />
      </div>
    </div>
  );
}
