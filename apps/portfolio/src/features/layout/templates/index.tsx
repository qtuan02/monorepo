import React, { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { getQueryClient } from "~/libs/query-client";
import Footer from "./footer";
import Navbar from "./navbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <ErrorBoundary fallback={null}>
      <main className="relative min-h-screen w-full">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <div className="pt-12 md:pt-15">{children}</div>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </HydrationBoundary>
      </main>
    </ErrorBoundary>
  );
}
