"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@monorepo/ui/libs/cn";

const Theme = () => {
  const { resolvedTheme, setTheme } = useTheme(); // dùng resolvedTheme thay vì theme
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <div className="mr-2 size-5 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
    );

  const isLight = resolvedTheme === "light";
  const toggle = () => setTheme(isLight ? "dark" : "light");

  return (
    <div
      role="button"
      aria-label="Toggle theme"
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
      className="relative size-8 cursor-pointer overflow-hidden rounded-full"
    >
      <div
        className={cn(
          "transform-3d transition-transform duration-500 ease-in-out",
          isLight ? "rotate-y-0" : "rotate-y-180",
        )}
      >
        <div className="backface-hidden flex size-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Moon size={20} />
        </div>

        <div className="rotate-y-180 backface-hidden absolute inset-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Sun className="text-black dark:text-white" size={20} />
        </div>
      </div>
    </div>
  );
};

export default Theme;
