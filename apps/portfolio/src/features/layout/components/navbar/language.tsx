"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { setCookie } from "cookies-next/client";
import { Check, ChevronDownIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { LOCALE_COOKIE_NAME } from "~/constants/common";
import { LANGUAGES } from "~/constants/languages";
import { getPathname, usePathname } from "~/i18n/navigation";

const Language = () => {
  const router = useRouter();
  const curLocale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Navbar");
  const searchParams = useSearchParams();

  const LANGUAGE_ITEMS = useMemo(
    () => [
      {
        ...LANGUAGES.vi,
        label: t("vi_language"),
        icon: <span className="fi fi-vn fis"></span>,
      },
      {
        ...LANGUAGES.en,
        label: t("en_language"),
        icon: <span className="fi fi-us fis"></span>,
      },
    ],
    [t]
  );

  const selectedLocale = useMemo(() => {
    return LANGUAGE_ITEMS.find((item) => item.value === curLocale);
  }, [curLocale, LANGUAGE_ITEMS]);

  const handleChangeLanguage = (value: string) => {
    if (value === curLocale) return;

    setCookie(LOCALE_COOKIE_NAME, value);
    const newPathname = getPathname({
      href: { pathname },
      locale: value,
    });

    if (searchParams.toString())
      router.replace(`${newPathname}?${searchParams.toString()}`);
    else router.replace(newPathname);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-x-1 text-base font-normal hover:cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 py-1">
          <span className="[&>span]:rounded-full text-xl">
            {selectedLocale?.icon}
          </span>
          {selectedLocale?.countryCode}
          <ChevronDownIcon className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="backdrop-blur-md border-gray-200 dark:border-gray-800 w-fit min-w-48 p-2"
        side="bottom"
        align="end"
      >
        <div className="flex flex-col bg-gray-100 dark:bg-gray-900 rounded-sm overflow-hidden">
          {LANGUAGE_ITEMS.map((item, index) => (
            <section
              key={`LANGUAGE_ITEM-${index}`}
              className="flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-2"
            >
              <div
                className="flex items-center gap-x-2 cursor-pointer"
                onClick={() => handleChangeLanguage(item.value)}
              >
                <span className="[&>span]:rounded-full">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.value === selectedLocale?.value && (
                <Check className="size-4" />
              )}
            </section>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Language;
