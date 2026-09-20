import { Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@monorepo/ui/components/dropdown-menu";

import type { ThemePreference } from "~/features/layout/provider/theme-provider";
import { useTheme } from "~/features/layout/provider/theme-provider";

/** Appearance: Light / Dark / System (copy — brief §7). */
export default function ThemeToggleButton() {
  const { t } = useTranslation();
  const { preference, setPreference } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label={t("chat.appearance.label")}
          >
            <Sun className="size-4.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="right" className="w-auto">
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => setPreference(value as ThemePreference)}
        >
          <DropdownMenuRadioItem value="light">
            {t("chat.appearance.light")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            {t("chat.appearance.dark")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            {t("chat.appearance.system")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
