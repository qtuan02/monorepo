"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@monorepo/ui";
import { HexagonBackground } from "@monorepo/ui/animate-ui/background-hexagon";

import { usePathname, useRouter } from "~/i18n/navigation";

function Error() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Exception");

  const params = new URLSearchParams({
    error: "500",
    from: `${pathname}${searchParams?.toString() ? `?${searchParams}` : ""}`,
    ts: String(Date.now()),
  }).toString();

  useEffect(() => {
    if (pathname === "/resource") return;
    router.replace(`/resource?${params}`);
  }, [router, params, pathname]);

  return (
    <main className="relative flex min-h-[calc(100vh-48px)] items-center justify-center overflow-hidden md:min-h-[calc(100vh-60px)]">
      <HexagonBackground className="absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="bg-destructive/20 absolute inset-0 animate-ping rounded-full" />
            <div className="bg-destructive/10 relative flex size-24 items-center justify-center rounded-full backdrop-blur-sm">
              <AlertTriangle className="text-destructive size-12" />
            </div>
          </div>
        </div>

        <div className="text-foreground mb-2 text-6xl font-bold tracking-tight md:text-8xl">
          500
        </div>

        <h1 className="text-foreground mb-4 text-2xl font-semibold md:text-3xl">
          {t("error")}
        </h1>

        <p className="text-muted-foreground mb-8 md:text-lg">
          Something went wrong on our end. We&apos;re working to fix it.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="lg"
            className="group"
          >
            <RotateCcw className="mr-2 size-4 transition-transform group-hover:-rotate-180" />
            Go Back
          </Button>
          <Button onClick={() => router.push("/")} size="lg" className="group">
            <Home className="mr-2 size-4 transition-transform group-hover:scale-110" />
            Go Home
          </Button>
        </div>
      </div>
    </main>
  );
}

export default Error;
