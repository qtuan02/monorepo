"use client";

import { cn } from "@web/web-ui/libs/cn";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
          "transition-transform duration-500 ease-in-out transform-3d",
          isLight ? "rotate-y-0" : "rotate-y-180"
        )}
      >
        <div className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center backface-hidden">
          <Moon size={20} />
        </div>

        <div className="absolute inset-0 rotate-y-180 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center backface-hidden">
          <Sun className="text-black dark:text-white" size={20} />
        </div>
      </div>
    </div>
  );
};

export default Theme;
