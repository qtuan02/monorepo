import { cn } from "@repo/ui/libs/cn";
import { env } from "~/env";
import { NextParams } from "~/types/common";

export default async function HomePage({ params }: { params: NextParams }) {
  const { locale } = await params;
  return (
    <div className={cn("text-red-500")}>
      This is {locale} and {env.NEXT_PUBLIC_ENV} Home Page
    </div>
  );
}
