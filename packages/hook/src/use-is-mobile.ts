import { useMediaQuery } from "./use-media-query";

// Tailwind's `md` breakpoint: below it a screen is treated as mobile, which is
// where the sidebar switches from an inline column to a sheet.
export const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
