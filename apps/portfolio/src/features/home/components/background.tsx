"use client";

import { FireworksBackground } from "@repo/ui/animate-ui/fireworks-background";
import { StarsBackground } from "@repo/ui/animate-ui/start-background";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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
    <FireworksBackground className="absolute inset-0 flex items-center justify-center" />
  );
};

export default Background;
