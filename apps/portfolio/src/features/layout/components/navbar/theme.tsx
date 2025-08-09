"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEME_ITEMS = [
  {
    value: "dark",
    icon: <Sun className="text-white" size={20} />,
  },
  {
    value: "light",
    icon: <Moon size={20} />,
  },
];

const Theme = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const newTheme = theme === "light" ? "dark" : "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <div className="size-5 mr-2 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
    );

  const handleChangeTheme = () => setTheme(newTheme);

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
