"use client";

import React from "react";
import dynamic from "next/dynamic";
import { QueryClientProvider } from "@tanstack/react-query";

import { env } from "~/env";
import { getQueryClient } from "~/libs/query-client";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";

const ReactQueryDevtoolsProduction = dynamic(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    })
  )
);

// handle safari camera theme color
function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  const ensureMeta = (): HTMLMetaElement => {
    let metaElement = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;

    if (!metaElement) {
      metaElement = document.createElement("meta");
      metaElement.name = "theme-color";
      document.head.appendChild(metaElement);
    }
    return metaElement;
  };

  React.useEffect(() => {
    if (!resolvedTheme) return;
    ensureMeta().content = resolvedTheme === "dark" ? "#000" : "#fff";
  }, [resolvedTheme]);

  return null;
}

export interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const queryClient = getQueryClient();
  const [showDevtools, setShowDevtools] = React.useState(
    env.NEXT_PUBLIC_ENV === "local"
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
        {children}
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
