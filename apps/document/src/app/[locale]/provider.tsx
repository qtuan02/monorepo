"use client";

import React from "react";
import dynamic from "next/dynamic";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { env } from "~/env";
import { SidebarProvider } from "~/features/layout/components/sidebar";
import { ThemeColorSync } from "~/features/layout/components/theme-color-sync";
import { getQueryClient } from "~/libs/query-client";

const ReactQueryDevtoolsProduction = dynamic(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

export interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const queryClient = getQueryClient();
  const [showDevtools, setShowDevtools] = React.useState(
    env.NEXT_PUBLIC_ENV === "local",
  );

  React.useEffect(() => {
    window.toggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <ThemeColorSync />
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>{children}</SidebarProvider>
        <Toaster />
        {showDevtools && (
          <React.Suspense fallback={null}>
            <ReactQueryDevtoolsProduction initialIsOpen={false} />
          </React.Suspense>
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export { Provider };
