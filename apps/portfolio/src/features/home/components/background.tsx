"use client";

import { FireworksBackground } from "@web/ui/animate-ui/background-fireworks";
import { StarsBackground } from "@web/ui/animate-ui/background-start";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const colors = [
  "#FF7F50", // coral cam
  "#FFA500", // cam tươi
  "#FFD700", // vàng ấm
  "#FFB347", // cam pastel
  "#4DB6AC", // xanh ngọc nhạt
  "#81D4FA", // xanh dương nhạt
  "#BA68C8", // tím pastel
];

const Background = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (theme === "dark")
    return (
      <StarsBackground className="absolute inset-0 flex items-center justify-center" />
    );

  return (
    <FireworksBackground
      color={colors}
      className="absolute inset-0 flex items-center justify-center"
    />
  );
};

export default Background;
