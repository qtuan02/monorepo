"use client";

import React from "react";
import dynamic from "next/dynamic";
import { QueryClientProvider } from "@tanstack/react-query";

import { env } from "~/env";
import { getQueryClient } from "~/libs/query-client";

const ReactQueryDevtoolsProduction = dynamic(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    })
  )
);

export interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const queryClient = getQueryClient();

  const [showDevtools] = React.useState(env.NEXT_PUBLIC_ENV === "local");

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </React.Suspense>
      )}
    </QueryClientProvider>
  );
};

export { Provider };
