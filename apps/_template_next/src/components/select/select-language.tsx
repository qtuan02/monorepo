"use client";

import { useLocale, useTranslations } from "next-intl";

import type { LanguageCode } from "@monorepo/i18n/languages";
import { languages } from "@monorepo/i18n/languages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";

import { usePathname, useRouter } from "~/i18n/navigation";

interface SelectLanguageProps {
  triggerClassName?: string;
}

/**
 * The language switcher. A Next app changes language by **navigating**, not by
 * mutating an i18next singleton — so this replaces the current URL with the same
 * page under another locale, and the visitor stays exactly where they were.
 *
 * `usePathname` here is next-intl's, not `next/navigation`'s: it returns the
 * path *without* the locale prefix, which is what makes `router.replace(pathname,
 * { locale })` the whole implementation.
 */
export function SelectLanguage({ triggerClassName }: SelectLanguageProps) {
  const t = useTranslations();
  const locale = useLocale() as LanguageCode;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      // Controlled: the locale lives in the URL, so it changes under this Select
      // whenever anything else navigates. Base UI reads a `defaultValue` exactly
      // once and then warns that an uncontrolled value moved.
      value={locale}
      onValueChange={(value) => {
        router.replace(pathname, { locale: value as LanguageCode });
      }}
    >
      <SelectTrigger className={triggerClassName} size="sm">
        {/* Children rather than `items`: without either, Base UI renders the raw
            value ("vi") instead of the label. */}
        <SelectValue placeholder={t("language.placeholder")}>
          {t(`language.${locale}`)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {languages.map((language) => (
          <SelectItem key={language} value={language}>
            {t(`language.${language}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
