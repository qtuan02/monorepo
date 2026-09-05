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
//
// Imported, never a `public/` URL string: Vite resolves an asset import at build
// time, so a renamed file is a build error rather than a runtime 404 — see
// .agents/rules/quality-imports.md § Static assets for the rest of the reasoning.
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

/**
 * Switching language here is a **state change, not a navigation** — this Runtime
 * keeps the language in a cookie rather than in the URL, so there is no path to
 * replace (contrast `_template_next`, whose switcher calls
 * `router.replace(pathname, { locale })`). `changeLanguage` re-renders the tree
 * in place and the i18next detector caches the choice into
 * `template_reactrouter_lang`, which is what makes the NEXT server render agree
 * with what the visitor is looking at.
 *
 * It lives in `~/components` rather than inside the `layout` slice because a
 * shared component may not be reached into from another slice, and the header is
 * not its only consumer: the sign-in screen
 * (`~/features/auth/templates/sign-in.template`) renders outside the shell and
 * would otherwise be the one screen with no way to switch language.
 */
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
      // value changes under the Select whenever anything else switches it —
      // and Base UI reads a default exactly once, then warns that an
      // uncontrolled Select's default moved. `value` makes the language a real
      // render input, the same reason .agents/rules/dates-locale-render-input.md
      // threads it into dayjs rather than trusting the global.
      value={currentLanguage}
      onValueChange={(value) => changeLanguage(value as LanguageCode)}
    >
      {/* No aria-label: `compact` hides the language name visually but keeps it
          in the trigger for screen readers, so the accessible name is the same
          in both modes — an aria-label here would replace it with a static
          string and drop the current value. */}
      {/* `[&>svg]:hidden` hides SelectTrigger's own chevron. The chevron is the
          trigger's only direct-child <svg> — the flag is a nested <img> — so the
          selector cannot catch anything else. It is a className rather than a
          prop because @monorepo/ui's SelectTrigger always renders the icon, and
          that package is not edited from an app: the control here is a flag the
          whole 36px square is already a target for, so a second glyph beside it
          only crowds the header bar. */}
      <SelectTrigger
        className={cn(
          "[&>svg]:hidden",
          // SelectValue is `flex-1`, so it spans the whole trigger and the
          // trigger's own `justify-center` has nothing left to centre — in
          // `compact` the flag is the only visible content, so it would sit at
          // the value's left edge inside a square button. Centre it inside the
          // value instead, which is where the spare width actually is.
          compact && "*:data-[slot=select-value]:justify-center",
          triggerClassName,
        )}
      >
        <SelectValue placeholder={t("language.placeholder")}>
          <LanguageOption language={currentLanguage} hideLabel={compact} />
        </SelectValue>
      </SelectTrigger>
      {/* No className override here: SelectContent/SelectItem already carry
          the popover token pair, which reads correctly in both themes. */}
      <SelectContent align="start">
        {languages.map((language: LanguageCode) => (
          <SelectItem key={language} value={language}>
            <LanguageOption language={language} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
