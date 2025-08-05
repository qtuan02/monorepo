"use client";

import { cn } from "@repo/ui/libs/cn";
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

  const isActiveRoute = (itemPath: string) => pathname.includes(itemPath);

  return (
    <div className="flex items-center gap-x-1">
      {MENU_ITEMS.map((item, index) => (
        <NextLink
          key={`MENU_ITEM-${index}`}
          href={item.href}
          className={cn(
            "px-2 font-medium hover:scale-105 ",
            isActiveRoute(item.href)
              ? "underline underline-offset-4 text-black dark:text-white"
              : "text-gray-500"
          )}
        >
          {item.label}
        </NextLink>
      ))}
    </div>
  );
};

export default Menu;
