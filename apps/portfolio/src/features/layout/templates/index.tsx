import React from "react";
import Navbar from "./navbar";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "~/libs/query-client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <ErrorBoundary fallback={null}>
      <main className="relative min-h-screen w-full bg-white dark:bg-black">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Navbar />
          <div className="pt-15">{children}</div>
        </HydrationBoundary>
      </main>
    </ErrorBoundary>
  );
}
