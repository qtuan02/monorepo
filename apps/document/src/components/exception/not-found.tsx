"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Home, RotateCcw, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@monorepo/ui";
import { HoleBackground } from "@monorepo/ui/animate-ui/background-hole";

import { usePathname, useRouter } from "~/i18n/navigation";

function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Exception");

  const params = new URLSearchParams({
    error: "404",
    from: `${pathname}${searchParams?.toString() ? `?${searchParams}` : ""}`,
    ts: String(Date.now()),
  }).toString();

  useEffect(() => {
    if (pathname === "/resource") return;
    router.replace(`/resource?${params}`);
  }, [router, params, pathname]);

  return (
    <main className="relative flex min-h-[calc(100vh-48px)] items-center justify-center overflow-hidden md:min-h-[calc(100vh-60px)]">
      <HoleBackground className="absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="bg-primary/10 absolute inset-0 animate-pulse rounded-full" />
            <div className="bg-primary/5 relative flex size-24 items-center justify-center rounded-full backdrop-blur-sm">
              <SearchX className="text-primary size-12" />
            </div>
          </div>
        </div>

        <div className="text-foreground mb-2 text-6xl font-bold tracking-tight md:text-8xl">
          404
        </div>

        <h1 className="text-foreground mb-4 text-2xl font-semibold md:text-3xl">
          {t("not_found")}
        </h1>

        <p className="text-muted-foreground mb-8 md:text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
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

export default NotFound;
