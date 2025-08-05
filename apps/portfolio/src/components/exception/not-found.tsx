"use client";

import { useTranslations } from "next-intl";
import NextLink from "../next-link";
import { Home } from "lucide-react";

const NotFound = () => {
  const t = useTranslations("Exception");
  return (
    <main className="flex flex-col gap-y-10 items-center h-screen">
      <h1 className="text-6xl font-bold mt-20">{t("not_found")}</h1>
      <NextLink
        href="/"
        className="text-xl font-medium px-4 py-2 bg-orange-500 rounded-lg transition-all duration-500 text-white hover:bg-orange-600 flex items-center gap-x-1"
      >
        <Home className="size-6" />
      </NextLink>
    </main>
  );
};

export default NotFound;
