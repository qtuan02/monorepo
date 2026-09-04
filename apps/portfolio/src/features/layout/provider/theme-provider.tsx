"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * The light/dark boundary.
 *
 * `attribute="class"` because the workspace Tailwind globals declare
 * `@custom-variant dark (&:where(.dark, .dark *))` — the `dark:` utilities key
 * off a class on `<html>`, not a data attribute. `enableSystem` is off so the
 * site opens light for everyone and the dock's toggle is the only thing that
 * changes it.
 *
 * It takes `children`, so everything inside stays a Server Component: this is a
 * client boundary wrapped **around** server output, not a switch that turns the
 * tree client.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
