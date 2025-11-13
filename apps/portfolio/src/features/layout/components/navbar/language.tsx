"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@monorepo/ui/shadcn-ui/popover";
import { setCookie } from "cookies-next/client";
import { Check, ChevronDownIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

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
    [t],
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
        <div className="flex items-center gap-x-1 rounded-md px-2 py-0.5 text-base font-normal hover:cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50">
          <span className="text-xl [&>span]:rounded-full">
            {selectedLocale?.icon}
          </span>
          {selectedLocale?.countryCode}
          <ChevronDownIcon className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-fit min-w-48 border-gray-200 bg-white/50 p-2 backdrop-blur-md dark:border-gray-800 dark:bg-black/50"
        side="bottom"
        align="end"
      >
        <div className="flex flex-col gap-y-[1px] overflow-hidden rounded-sm">
          {LANGUAGE_ITEMS.map((item, index) => (
            <section
              key={`LANGUAGE_ITEM-${index}`}
              className="flex cursor-pointer items-center justify-between bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800"
              onClick={() => handleChangeLanguage(item.value)}
            >
              <div className="flex cursor-pointer items-center gap-x-2">
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
