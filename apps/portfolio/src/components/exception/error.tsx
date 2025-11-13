"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HexagonBackground } from "@monorepo/ui/animate-ui/background-hexagon";
import { Home, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { usePathname, useRouter } from "~/i18n/navigation";

const Error = () => {
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
    <main className="relative h-[calc(100vh-48px)] md:h-[calc(100vh-60px)]">
      <div className="absolute inset-x-0 z-1 mt-20 flex flex-col items-center gap-y-10">
        <h1 className="text-3xl font-semibold md:text-6xl">{t("error")}</h1>
        <div className="flex gap-x-3">
          <button
            key="button-exception-back"
            onClick={() => router.back()}
            className="flex cursor-pointer items-center gap-x-1 rounded-lg bg-gradient-to-r from-orange-300 to-orange-500 px-4 py-2 text-xl font-medium text-white transition-all duration-500 hover:opacity-80"
          >
            <Undo2 className="size-6" />
          </button>
          <button
            key="button-exception-home"
            onClick={() => router.push("/")}
            className="flex cursor-pointer items-center gap-x-1 rounded-lg bg-gradient-to-r from-orange-300 to-orange-500 px-4 py-2 text-xl font-medium text-white transition-all duration-500 hover:opacity-80"
          >
            <Home className="size-6" />
          </button>
        </div>
      </div>
      <HexagonBackground className="absolute inset-0 flex items-center justify-center" />
    </main>
  );
};

export default Error;
