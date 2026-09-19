import { Sun } from "lucide-react";

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
  const { preference, setPreference } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Appearance"
          >
            <Sun className="size-4.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => setPreference(value as ThemePreference)}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
