"use client";

import { cn } from "@repo/ui/libs/cn";
import { Component, Home, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import NextLink from "~/components/next-link";
import { usePathname } from "~/i18n/navigation";
import DocsMenu from "../components/navbar/docs-menu";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations("Navbar");

  const MENU_ITEMS = useMemo(
    () => [
      {
        label: t("home"),
        href: "/",
        icon: <Home className="size-5" />,
      },
      {
        label: t("about"),
        href: "/about",
        icon: <ReceiptText className="size-5" />,
      },
      {
        label: t("component"),
        href: "/docs",
        icon: <Component className="size-5" />,
      },
    ],
    [t]
  );

  const isActiveRoute = (itemPath: string) => {
    if (itemPath === "/") return pathname === "/";
    return pathname.startsWith(itemPath);
  };

  return (
    <footer className="fixed z-50 bottom-4 flex md:hidden left-4 w-[calc(100%-32px)] rounded-full h-14 bg-gray-100 backdrop-blur-lg shadow-inherit dark:bg-gray-800">
      <div className="flex items-center justify-between w-full h-full px-6">
        {MENU_ITEMS.map((item, index) => (
          <NextLink
            key={`footer-item-${index}`}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-x-2 w-20",
              isActiveRoute(item.href) && "text-orange-500"
            )}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </NextLink>
        ))}
        <DocsMenu key="footer-item-menu" />
      </div>
    </footer>
  );
}
