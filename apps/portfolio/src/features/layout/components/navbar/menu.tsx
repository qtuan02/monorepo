"use client";

import { cn } from "@monorepo/ui/libs/cn";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
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
    [t]
  );

  const isActiveRoute = (itemPath: string) => pathname.startsWith(itemPath);

  return MENU_ITEMS.map((item, index) => (
    <NextLink
      key={`MENU_ITEM-${index}`}
      href={item.href}
      className={cn(
        "px-2 font-medium transition-transform duration-300 origin-bottom py-0.5 text-lg relative before:absolute before:bottom-1 before:inset-x-2 before:h-0.5 before:origin-left before:transition-transform before:duration-500",
        isActiveRoute(item.href)
          ? "underline-offset-4 scale-105 before:scale-x-100 before:bg-black dark:before:bg-white"
          : "before:scale-x-0 text-gray-500 hover:before:bg-gray-500 hover:scale-105  hover:before:scale-x-100"
      )}
    >
      {item.label}
    </NextLink>
  ));
};

export default Menu;
