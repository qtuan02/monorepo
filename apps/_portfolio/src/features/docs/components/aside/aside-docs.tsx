"use client";

import { useTranslations } from "next-intl";

import useIsClient from "@monorepo/ui/hooks/use-is-client";
import useLocalStorage from "@monorepo/ui/hooks/use-local-storage";
import { cn } from "@monorepo/ui/libs/cn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@monorepo/ui/shadcn-ui/accordion";

import NextLink from "~/components/next-link";
import { PORTFOLIO_ASIDE_DOCS } from "~/constants/common";
import { usePathname } from "~/i18n/navigation";
import { getDataDocs } from "../../utils/get-data-docs";

const DEFAULT_VALUE = [
  "get-started",
  "components",
  "expands",
  "animations",
  "hooks",
];

const AsideDocs = () => {
  const t = useTranslations();
  const pathname = usePathname();

  const isClient = useIsClient();
  const [value, setValue] = useLocalStorage(
    PORTFOLIO_ASIDE_DOCS,
    DEFAULT_VALUE,
  );

  const ASIDE_ITEMS = getDataDocs(t);

  const isActiveRoute = (itemPath: string) => {
    if (itemPath === "/docs/introduction")
      return pathname === "/docs" || pathname === "/docs/introduction";
    return pathname === itemPath;
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col gap-y-4 p-2">
      <Accordion
        type="multiple"
        className="w-full space-y-0.5"
        defaultValue={value}
        onValueChange={(value) => setValue(value)}
      >
        {ASIDE_ITEMS.map((item) => (
          <AccordionItem
            value={item.key}
            className="border-b-0"
            key={`aside-docs-item-${item.key}`}
          >
            <AccordionTrigger className="mb-0.5 flex cursor-pointer items-center px-3 py-1.5 text-base font-semibold uppercase hover:underline focus-visible:ring-0">
              {item.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-y-0.5 pb-0">
              {item.children.map((child) => (
                <NextLink
                  key={`aside-docs-children-item-${child.key}`}
                  href={child.href}
                  replace
                  className={cn(
                    "cursor-pointer rounded-md px-3 py-1.5 text-left text-base font-medium hover:translate-x-1 hover:bg-gray-100 hover:transition-transform md:text-sm dark:hover:bg-gray-700",
                    isActiveRoute(child.href) &&
                      "!bg-gray-200 font-semibold dark:!bg-gray-800",
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
