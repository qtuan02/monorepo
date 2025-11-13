"use client";

import { useMemo } from "react";
import { cn } from "@monorepo/ui/libs/cn";
import { useTranslations } from "next-intl";

import NextLink from "~/components/next-link";
import { usePathname } from "~/i18n/navigation";

const Menu = () => {
  const pathname = usePathname();
  const t = useTranslations("Navbar");

  const MENU_ITEMS = useMemo(
    () => [
      {
        label: t("about"),
        href: "/about",
      },
      {
        label: t("component"),
        href: "/docs",
      },
    ],
    [t],
  );

  const isActiveRoute = (itemPath: string) => pathname.startsWith(itemPath);

  return MENU_ITEMS.map((item, index) => (
    <NextLink
      key={`MENU_ITEM-${index}`}
      href={item.href}
      className={cn(
        "relative origin-bottom px-2 py-0.5 text-lg font-medium transition-transform duration-300 before:absolute before:inset-x-2 before:bottom-1 before:h-0.5 before:origin-left before:transition-transform before:duration-500",
        isActiveRoute(item.href)
          ? "scale-105 underline-offset-4 before:scale-x-100 before:bg-black dark:before:bg-white"
          : "text-gray-500 before:scale-x-0 hover:scale-105 hover:before:scale-x-100 hover:before:bg-gray-500",
      )}
    >
      {item.label}
    </NextLink>
  ));
};

export default Menu;
