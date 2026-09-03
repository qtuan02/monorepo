import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@monorepo/ui/libs/cn";

import type { Theme } from "~/utils/theme-utils";
import { useTheme } from "~/contexts/theme-context";
import { THEMES } from "~/utils/theme-utils";

const themeOptions: {
  value: Theme;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: THEMES.light, label: "Light", icon: Sun },
  { value: THEMES.dark, label: "Dark", icon: Moon },
  { value: THEMES.system, label: "System", icon: Monitor },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const currentOption = themeOptions.find((opt) => opt.value === theme);
  const Icon = currentOption?.icon || Sun;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="border-border bg-background text-foreground hover:bg-muted flex h-9 w-9 items-center justify-center rounded-lg border"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
      >
        <Icon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="border-border bg-background absolute right-0 z-50 mt-2 w-48 rounded-lg border shadow-lg">
          <div className="py-1">
            {themeOptions.map((option) => {
              const OptionIcon = option.icon;
              const isActive = theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  <OptionIcon className="h-4 w-4" />
                  <span>{option.label}</span>
                  {isActive && (
                    <svg
                      className="text-foreground ml-auto h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
