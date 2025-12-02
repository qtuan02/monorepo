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
    <main className="relative flex min-h-[calc(100vh-48px)] md:min-h-[calc(100vh-60px)] items-center justify-center overflow-hidden">
      <HoleBackground className="absolute inset-0" />
      
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
            <div className="relative flex size-24 items-center justify-center rounded-full bg-primary/5 backdrop-blur-sm">
              <SearchX className="size-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="mb-2 text-6xl font-bold tracking-tight text-foreground md:text-8xl">
          404
        </div>
        
        <h1 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
          {t("not_found")}
        </h1>
        
        <p className="mb-8 text-muted-foreground md:text-lg">
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
          <Button
            onClick={() => router.push("/")}
            size="lg"
            className="group"
          >
            <Home className="mr-2 size-4 transition-transform group-hover:scale-110" />
            Go Home
          </Button>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
