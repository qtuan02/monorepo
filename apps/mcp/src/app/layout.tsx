import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Server",
  description: "Model Context Protocol Server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

