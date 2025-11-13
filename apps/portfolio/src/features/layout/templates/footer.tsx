"use client";

import { useMemo } from "react";
import { cn } from "@monorepo/ui/libs/cn";
import { Component, Home, ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";

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
    [t],
  );

  const isActiveRoute = (itemPath: string) => {
    if (itemPath === "/") return pathname === "/";
    return pathname.startsWith(itemPath);
  };

  return (
    <footer className="fixed bottom-4 left-4 z-50 flex h-14 w-[calc(100%-32px)] rounded-full bg-gray-100/50 shadow-inherit backdrop-blur-lg md:hidden dark:bg-gray-800/50">
      <div className="flex h-full w-full items-center justify-between px-6">
        {MENU_ITEMS.map((item, index) => (
          <NextLink
            key={`footer-item-${index}`}
            href={item.href}
            className={cn(
              "flex w-20 flex-col items-center gap-x-2",
              isActiveRoute(item.href) && "text-orange-500",
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
