import { useTranslation } from "react-i18next";

import type { LanguageCode } from "@monorepo/i18n/languages";
import { changeLanguage } from "@monorepo/i18n/change-language";
import { defaultLanguage, languages } from "@monorepo/i18n/languages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";
import { cn } from "@monorepo/ui/utils/cn";

import gbFlag from "~/assets/icons/gb.svg";
import vnFlag from "~/assets/icons/vn.svg";

// A language code is not a country code — "en" is shown with the UK flag, "vi"
// with Vietnam's — so the mapping is explicit rather than derived from the code.
const languageFlags: Record<LanguageCode, string> = {
  vi: vnFlag,
  en: gbFlag,
};

interface LanguageOptionProps {
  language: LanguageCode;
  /** Keeps the name for screen readers while the flag alone carries it visually. */
  hideLabel?: boolean;
}

function LanguageOption({ language, hideLabel }: LanguageOptionProps) {
  const { t } = useTranslation();

  return (
    <span className="flex items-center gap-2">
      {/* Decorative: the label beside it already names the language, so an alt
          text here would have a screen reader announce it twice. */}
      <img
        src={languageFlags[language]}
        alt=""
        aria-hidden="true"
        className="h-3.5 w-5 shrink-0 rounded-xs object-cover"
      />
      <span className={hideLabel ? "sr-only" : undefined}>
        {t(`language.${language}`)}
      </span>
    </span>
  );
}

interface SelectLanguageProps {
  triggerClassName?: string;
  /**
   * Flag-only trigger, for a dense bar where the language name would be the
   * widest control on the row. The dropdown itself always keeps its labels.
   */
  compact?: boolean;
}

// Auth-screen switcher, styled like the Template apps' SelectLanguage (flag +
// Select) instead of the Rail's icon-button dropdown — sign-in/sign-up sit on
// their own wide card, not a 16-wide icon rail, so the flag trigger reads
// better there. `LanguageToggleButton` stays the Rail's own control.
export function SelectLanguage({
  triggerClassName,
  compact,
}: SelectLanguageProps) {
  const { t, i18n } = useTranslation();
  // `i18n.language` keeps the detected code verbatim — a browser reports
  // "vi-VN", which no message file and no <SelectItem> is keyed by, so the
  // label would render as the raw key `language.vi-VN`. `resolvedLanguage` is
  // the registry entry actually in use ("vi").
  const currentLanguage = (i18n.resolvedLanguage ??
    defaultLanguage) as LanguageCode;

  return (
    <Select
      // Controlled, not `defaultValue`: the language lives in i18next, so this
      // value changes under the Select whenever anything else switches it.
      value={currentLanguage}
      onValueChange={(value) => changeLanguage(value as LanguageCode)}
    >
      {/* `[&>svg]:hidden` hides SelectTrigger's own chevron — the trigger's
          only direct-child <svg>, since the flag is a nested <img>. */}
      <SelectTrigger
        className={cn(
          "[&>svg]:hidden",
          // SelectValue is `flex-1`, so it spans the whole trigger and the
          // trigger's own `justify-center` has nothing left to centre — in
          // `compact` the flag is the only visible content, so centre it
          // inside the value instead, which is where the spare width is.
          compact && "*:data-[slot=select-value]:justify-center",
          triggerClassName,
        )}
      >
        <SelectValue placeholder={t("language.placeholder")}>
          <LanguageOption language={currentLanguage} hideLabel={compact} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {languages.map((language: LanguageCode) => (
          <SelectItem key={language} value={language}>
            <LanguageOption language={language} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
