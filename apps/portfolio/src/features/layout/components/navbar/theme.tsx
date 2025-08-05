"use client";

import { setCookie } from "cookies-next/client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { FC, useEffect, useState } from "react";
import { THEME_COOKIE_NAME } from "~/constants/common";

const THEME_ITEMS = [
  {
    icon: <Sun className="text-white" size={20} />,
    value: "dark",
  },
  {
    icon: <Moon size={20} />,
    value: "light",
  },
];

interface ThemeProps {
  defaultTheme: string;
}

const Theme: FC<ThemeProps> = ({ defaultTheme }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const newTheme = theme === "light" ? "dark" : "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
        {THEME_ITEMS.find((item) => item.value === defaultTheme)?.icon}
      </div>
    );

  const handleChangeTheme = () => {
    setTheme(newTheme);
    setCookie(THEME_COOKIE_NAME, newTheme);
  };

  return (
    <div
      className="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      onClick={handleChangeTheme}
    >
      {THEME_ITEMS.find((item) => item.value === theme)?.icon}
    </div>
  );
};

export default Theme;
