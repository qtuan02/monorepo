import { MoonIcon, SunIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";

import type { Theme } from "~/libs/theme-provider";
import { useTheme } from "~/libs/theme-provider";

interface ThemeToggleButtonProps {
  className?: string;
}

/**
 * The catalogue key naming what a press switches *to* — shared with the
 * sheet-menu row label in `nav-actions.tsx`, so the two never drift apart.
 */
export function nextThemeLabelKey(
  resolvedTheme: Theme,
): "documents.nav.theme.toLight" | "documents.nav.theme.toDark" {
  return resolvedTheme === "dark"
    ? "documents.nav.theme.toLight"
    : "documents.nav.theme.toDark";
}

/**
 * Swaps light and dark. Both icons are always rendered and `dark:hidden` /
 * `dark:block` decide which shows, so the button is the CSS's to paint; the
 * label is the one thing that follows the state, because it names the theme
 * the press will switch *to*.
 */
export default function ThemeToggleButton({
  className,
}: ThemeToggleButtonProps) {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={t(nextThemeLabelKey(resolvedTheme))}
      className={className}
      onClick={() => setTheme(nextTheme)}
    >
      <SunIcon className="size-4.5 dark:hidden" />
      <MoonIcon className="hidden size-4.5 dark:block" />
    </Button>
  );
}
