import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { LanguageCode } from "@monorepo/i18n/languages";
import { changeLanguage } from "@monorepo/i18n/change-language";
import { defaultLanguage, languages } from "@monorepo/i18n/languages";
import { Button } from "@monorepo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@monorepo/ui/components/dropdown-menu";

/**
 * Language: one radio item per registry entry — the same dropdown shape as
 * `ThemeToggleButton`, so the Rail's two settings read as a pair. The
 * Templates' `SelectLanguage` (flag + Select) is the wrong width for a
 * 16-wide Rail of icon buttons.
 */
export default function LanguageToggleButton() {
  const { t, i18n } = useTranslation();
  // `resolvedLanguage`, not `language`: the detector keeps "vi-VN" verbatim,
  // which no radio item is keyed by.
  const current = i18n.resolvedLanguage ?? defaultLanguage;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label={t("chat.language.label")}
          >
            <Languages className="size-4.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuRadioGroup
          value={current}
          onValueChange={(value) => changeLanguage(value as LanguageCode)}
        >
          {languages.map((code) => (
            <DropdownMenuRadioItem key={code} value={code}>
              {t(`language.${code}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
