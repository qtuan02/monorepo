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
  /** The trigger's accessible name; its visible text is the current language. */
  label?: string;
  /** Styles the popup, so a host can draw it in its own grammar. */
  contentClassName?: string;
  /** Styles each option the same way. */
  itemClassName?: string;
  /** Which side of the trigger the popup opens on; Base UI flips it on collision. */
  side?: "top" | "bottom";
  /**
   * Base UI's default lays the popup *over* the trigger with the selected item
   * on top of it, the macOS way. `false` opens it beside the trigger as a
   * plain menu, which is what a trigger inside a bar wants.
   */
  alignItemWithTrigger?: boolean;
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
export function SelectLanguage({
  triggerClassName,
  label,
  contentClassName,
  itemClassName,
  side,
  alignItemWithTrigger,
}: SelectLanguageProps) {
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
      <SelectTrigger className={triggerClassName} size="sm" aria-label={label}>
        {/* Children rather than `items`: without either, Base UI renders the raw
            value ("vi") instead of the label. Below `sm` there is no room for
            the full name (spec #211), so the trigger shows the bare locale
            code instead — not a catalogue key, just `locale.toUpperCase()`. */}
        <SelectValue placeholder={t("language.placeholder")}>
          <span className="sm:hidden">{locale.toUpperCase()}</span>
          <span className="hidden sm:inline">{t(`language.${locale}`)}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        side={side}
        alignItemWithTrigger={alignItemWithTrigger}
        className={contentClassName}
      >
        {languages.map((language) => (
          <SelectItem key={language} value={language} className={itemClassName}>
            {t(`language.${language}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
