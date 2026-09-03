"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@monorepo/ui";

type AnimationVariant = "circle" | "circle-blur" | "gif" | "polygon";
type StartPosition =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export interface ThemeToggleButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "variant"> {
  animationVariant?: AnimationVariant;
  start?: StartPosition;
  url?: string;
}

export const ThemeToggleButton = React.forwardRef<
  HTMLButtonElement,
  ThemeToggleButtonProps
>(
  (
    { animationVariant = "circle", start = "center", url, onClick, ...props },
    ref,
  ) => {
    const { theme, setTheme } = useTheme();
    const { startTransition } = useThemeTransition();

    const handleThemeToggle = React.useCallback(() => {
      const newMode = theme === "dark" ? "light" : "dark";

      startTransition(() => {
        setTheme(newMode);
      });
    }, [theme, setTheme, startTransition]);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Call the onClick handler from props if provided
        onClick?.(e);

        // Inject animation styles for this specific transition
        const styleId = `theme-transition-${Date.now()}`;
        const style = document.createElement("style");
        style.id = styleId;

        // Generate animation CSS based on variant
        let css = "";
        const positions = {
          center: "center",
          "top-left": "top left",
          "top-right": "top right",
          "bottom-left": "bottom left",
          "bottom-right": "bottom right",
          "left-right": "left right",
        };

        if (animationVariant === "circle") {
          const cx =
            start === "center" ? "50" : start.includes("left") ? "0" : "100";
          const cy =
            start === "center" ? "50" : start.includes("top") ? "0" : "100";
          css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) { 
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-expand 0.4s ease-out;
            transform-origin: ${positions[start]};
          }
          @keyframes circle-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
            }
          }
        }
      `;
        } else if (animationVariant === "circle-blur") {
          const cx =
            start === "center" ? "50" : start.includes("left") ? "0" : "100";
          const cy =
            start === "center" ? "50" : start.includes("top") ? "0" : "100";
          css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) { 
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.5s ease-out;
            transform-origin: ${positions[start]};
            filter: blur(0);
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              filter: blur(0);
            }
          }
        }
      `;
        } else if (animationVariant === "gif" && url) {
          css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: fade-out 0.4s ease-out;
          }
          ::view-transition-new(root) {
            animation: gif-reveal 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            mask-image: url('${url}');
            mask-size: 0%;
            mask-repeat: no-repeat;
            mask-position: center;
          }
          @keyframes fade-out {
            to {
              opacity: 0;
            }
          }
          @keyframes gif-reveal {
            0% {
              mask-size: 0%;
            }
            20% {
              mask-size: 35%;
            }
            60% {
              mask-size: 35%;
            }
            100% {
              mask-size: 300%;
            }
          }
        }
      `;
        } else if (animationVariant === "polygon") {
          css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: ${theme === "light" ? "wipe-in-dark" : "wipe-in-light"} 0.4s ease-out;
          }
          @keyframes wipe-in-dark {
            from {
              clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
          @keyframes wipe-in-light {
            from {
              clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
        }
      `;
        }

        if (css) {
          style.textContent = css;
          document.head.appendChild(style);

          // Clean up animation styles after transition
          setTimeout(() => {
            const styleEl = document.getElementById(styleId);
            if (styleEl) {
              styleEl.remove();
            }
          }, 3000);
        }

        // Call the theme toggle handler
        handleThemeToggle();
      },
      [handleThemeToggle, animationVariant, start, url, theme, onClick],
    );

    return (
      <Button
        ref={ref}
        variant="ghost"
        type="button"
        size="icon"
        className="size-12 cursor-pointer rounded-full"
        onClick={handleClick}
        {...props}
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200" />
        <MoonIcon className="hidden h-[1.2rem] w-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200" />
      </Button>
    );
  },
);
ThemeToggleButton.displayName = "ThemeToggleButton";
// Export a helper hook for using with View Transitions API
export const useThemeTransition = () => {
  const startTransition = React.useCallback((updateFn: () => void) => {
    if ("startViewTransition" in document) {
      (document as any).startViewTransition(updateFn);
    } else {
      updateFn();
    }
  }, []);
  return { startTransition };
};
