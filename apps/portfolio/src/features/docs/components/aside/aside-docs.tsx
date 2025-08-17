"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { getDataDocs } from "../../utils/get-data-docs";
import { useTranslations } from "next-intl";
import { usePathname } from "~/i18n/navigation";
import { cn } from "@repo/ui/libs/cn";
import NextLink from "~/components/next-link";

const DEFAULT_VALUE = ["get-started", "components", "open-source", "hooks", "animations"];

const AsideDocs = () => {
  const t = useTranslations();
  const pathname = usePathname();

  const ASIDE_ITEMS = getDataDocs(t);

  const isActiveRoute = (itemPath: string) => {
    if (itemPath === "/docs/introduction")
      return pathname === "/docs" || pathname === "/docs/introduction";
    return pathname === itemPath;
  };

  return (
    <div className="flex flex-col gap-y-4 p-2">
      <Accordion
        type="multiple"
        className="w-full space-y-0.5"
        defaultValue={DEFAULT_VALUE}
      >
        {ASIDE_ITEMS.map((item) => (
          <AccordionItem
            value={item.key}
            className="border-b-0"
            key={`aside-docs-item-${item.key}`}
          >
            <AccordionTrigger className="focus-visible:ring-0 mb-0.5 uppercase py-1.5 px-3 cursor-pointer text-base font-semibold flex items-center hover:underline">
              {item.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col pb-0 gap-y-0.5">
              {item.children.map((child) => (
                <NextLink
                  key={`aside-docs-children-item-${child.key}`}
                  href={child.href}
                  replace
                  className={cn(
                    "py-1.5 px-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-base md:text-sm font-medium rounded-md cursor-pointer",
                    isActiveRoute(child.href) &&
                      "!bg-gray-200 dark:!bg-gray-800"
                  )}
                >
                  {child.label}
                </NextLink>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default AsideDocs;
