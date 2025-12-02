import { Inter_Tight } from "next/font/google";

/**
 * Inter Tight font configuration
 */
export const interFont = Inter_Tight({
  subsets: ["latin"],
  adjustFontFallback: true,
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter-tight",
});

