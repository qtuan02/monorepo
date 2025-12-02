"use client";

import React from "react";
import { useTheme } from "next-themes";

/**
 * Component that syncs the theme-color meta tag with the current theme.
 * This is particularly important for Safari's camera theme color.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  const ensureMeta = (): HTMLMetaElement => {
    let metaElement = document.querySelector('meta[name="theme-color"]');

    if (!metaElement) {
      metaElement = document.createElement("meta");
      (metaElement as HTMLMetaElement).name = "theme-color";
      document.head.appendChild(metaElement);
    }
    return metaElement as HTMLMetaElement;
  };

  React.useEffect(() => {
    if (!resolvedTheme) return;
    ensureMeta().content = resolvedTheme === "dark" ? "#000" : "#fff";
  }, [resolvedTheme]);

  return null;
}

