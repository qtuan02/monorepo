"use client";

import { useTranslations } from "next-intl";
import { Home, Undo2 } from "lucide-react";
import { HexagonBackground } from "@web/web-ui/animate-ui/background-hexagon";
import { usePathname, useRouter } from "~/i18n/navigation";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
    <main className=" h-[calc(100vh-48px)] md:h-[calc(100vh-60px)] relative">
      <div className="flex flex-col gap-y-10 items-center z-1 absolute inset-x-0 mt-20">
        <h1 className="text-3xl md:text-6xl font-semibold">{t("error")}</h1>
        <div className="flex gap-x-3">
          <button
            key="button-exception-back"
            onClick={() => router.back()}
            className="cursor-pointer text-xl font-medium px-4 py-2 bg-gradient-to-r from-orange-300 to-orange-500 rounded-lg transition-all duration-500 text-white hover:opacity-80 flex items-center gap-x-1"
          >
            <Undo2 className="size-6" />
          </button>
          <button
            key="button-exception-home"
            onClick={() => router.push("/")}
            className="cursor-pointer text-xl font-medium px-4 py-2 bg-gradient-to-r from-orange-300 to-orange-500 rounded-lg transition-all duration-500 text-white hover:opacity-80 flex items-center gap-x-1"
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
