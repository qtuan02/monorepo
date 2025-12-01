import type { Metadata } from "next";

import "./globals.css";

import { Inter_Tight } from "next/font/google";

import { cn } from "@monorepo/ui";

const inter = Inter_Tight({
  subsets: ["latin"],
  adjustFontFallback: true,
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "Assistant AI",
  description: "Assistant AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn(inter.className, "antialiased")}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
