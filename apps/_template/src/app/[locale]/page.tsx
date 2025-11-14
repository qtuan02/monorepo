import { cn } from "@monorepo/ui/libs/cn";

import type { NextParams } from "~/types/common";
import { env } from "~/env";
import { Link } from "~/i18n/navigation";

export default async function HomePage({ params }: { params: NextParams }) {
  const { locale } = await params;
  return (
    <>
      <div className={cn("text-red-500")}>
        This is {locale} and {env.NEXT_PUBLIC_ENV} Home Page
      </div>
      <Link href="/sentry-error">Sentry Trigger</Link>
    </>
  );
}
