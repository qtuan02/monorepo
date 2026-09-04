"use client";

import type { ComponentProps } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@monorepo/ui/components/button";

/**
 * `Document.startViewTransition` is not in the DOM lib this repo compiles
 * against, and it is absent in Firefox and older Safari — so it is read through
 * an optional member rather than asserted to exist.
 */
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

/**
 * The click handler as the primitive types it. Base UI hands its handlers an
 * event carrying `preventBaseUIHandler`, so a plain `React.MouseEvent` is not
 * the same type — deriving it from the component keeps the two in step.
 */
type ButtonClickHandler = NonNullable<ComponentProps<typeof Button>["onClick"]>;

interface ThemeToggleButtonProps
  extends Omit<ComponentProps<typeof Button>, "variant" | "size" | "children"> {
  /** Accessible name — the button has only icons. */
  label: string;
}

/**
 * Swaps light and dark, wiping the new theme across the page.
 *
 * The wipe itself is CSS: `src/globals.css` styles
 * `::view-transition-new(root)` and reads the direction off a
 * `data-theme-transition` attribute this handler sets. The legacy component
 * built the same animation by injecting a `<style>` element into `<head>` on
 * every click and removing it three seconds later — four variants' worth of CSS
 * in a template literal, of which one was ever used.
 *
 * Both icons are always rendered and `dark:hidden` / `dark:block` decide which
 * one shows. That is what keeps the button free of a hydration mismatch: the
 * server does not know the visitor's theme, so nothing here may branch on it in
 * JavaScript.
 */
export default function ThemeToggleButton({
  label,
  onClick,
  ...props
}: ThemeToggleButtonProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const handleClick: ButtonClickHandler = (event) => {
    onClick?.(event);

    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.themeTransition =
      nextTheme === "dark" ? "to-dark" : "to-light";

    const { startViewTransition } = document as DocumentWithViewTransition;

    if (startViewTransition) {
      startViewTransition.call(document, () => setTheme(nextTheme));
      return;
    }

    setTheme(nextTheme);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      className="size-12 cursor-pointer rounded-full"
      {...props}
      onClick={handleClick}
    >
      <SunIcon className="size-[1.2rem] dark:hidden" />
      <MoonIcon className="hidden size-[1.2rem] dark:block" />
    </Button>
  );
}
