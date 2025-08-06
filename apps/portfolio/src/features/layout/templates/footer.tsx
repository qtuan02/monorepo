"use client";

import { cn } from "@repo/ui/libs/cn";
import { Component, Home, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import NextLink from "~/components/next-link";
import { usePathname } from "~/i18n/navigation";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations("Navbar");

  const MENU_ITEMS = useMemo(
    () => [
      {
        label: t("home"),
        href: "/",
        icon: <Home size={20} />,
      },
      {
        label: t("about"),
        href: "/about",
        icon: <ReceiptText size={20} />,
      },
      {
        label: t("component"),
        href: "/docs",
        icon: <Component size={20} />,
      },
    ],
    [t]
  );

  const isActiveRoute = (itemPath: string) => pathname === itemPath;

  return (
    <footer className="fixed bottom-4 flex md:hidden left-4 w-[calc(100%-32px)] rounded-full h-14 bg-gray-100 backdrop-blur-lg shadow-inherit dark:bg-gray-800">
      <div className="flex items-center w-full h-full px-6">
        {MENU_ITEMS.map((item, index) => (
          <NextLink
            key={`FOOTERP-ITEM-${index}`}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-x-2 px-4",
              isActiveRoute(item.href) && "text-orange-500"
            )}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </NextLink>
        ))}
      </div>
    </footer>
  );
}
