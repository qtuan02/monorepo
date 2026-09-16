import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router";

import { Toaster } from "@monorepo/ui/components/toast";

import ComingSoon from "~/components/exception/coming-soon";
import InternalServerError from "~/components/exception/internal-server-error";
import NotFound from "~/components/exception/not-found";
import { ROUTES } from "~/constants/routes";
import { env } from "~/env";
import GuestRoute from "~/features/auth/provider/guest-route";
import ProtectedRoute from "~/features/auth/provider/protected-route";
import LayoutTemplate from "~/features/layout/templates/layout.template";
import HomePage from "./home-page";
import SignInPage from "./sign-in-page";

import "~/globals.css";
import "~/libs/i18n";
import "~/libs/dayjs";

import { queryClient } from "~/libs/query-client";

const LazyReactQueryDevtools = React.lazy(async () => {
  const { ReactQueryDevtools } = await import("@tanstack/react-query-devtools");
  return { default: ReactQueryDevtools };
});

const MainApp = () => {
  const [showDevtools, setShowDevtools] = React.useState(
    env.PUBLIC_APP_ENV === "local",
  );

  React.useEffect(() => {
    // @ts-expect-error
    window.monorepoToggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <ErrorBoundary
      fallback={<InternalServerError />}
      // Logged rather than swallowed: the fallback tells the user something
      // broke, this is what tells a developer what did.
      onError={(error, info) => {
        console.error("Uncaught render error:", error, info.componentStack);
      }}
    >
      <Toaster />
      <QueryClientProvider client={queryClient}>
        {showDevtools && (
          <React.Suspense fallback={null}>
            <LazyReactQueryDevtools initialIsOpen={false} />
          </React.Suspense>
        )}
        <BrowserRouter>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
            </Route>

            <Route path={ROUTES.HOME} element={<LayoutTemplate />}>
              <Route element={<ProtectedRoute />}>
                {/* The launcher is behind the guard too: nothing inside the
                    shell is reachable without a session. */}
                <Route index element={<HomePage />} />

                {/* Declared but unbuilt — the launcher links here, so each needs
                    a destination. Replace with the real page per module. */}
                <Route path={ROUTES.DASHBOARD} element={<ComingSoon />} />
                <Route path={ROUTES.POS} element={<ComingSoon />} />
                <Route path={ROUTES.PATIENTS} element={<ComingSoon />} />
                <Route path={ROUTES.MEDICATIONS} element={<ComingSoon />} />
                <Route path={ROUTES.ANALYTICS} element={<ComingSoon />} />
                <Route path={ROUTES.APPOINTMENTS} element={<ComingSoon />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default MainApp;
