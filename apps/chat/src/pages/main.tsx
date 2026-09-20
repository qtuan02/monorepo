import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router";

import { Toaster } from "@monorepo/ui/components/toast";

import InternalServerError from "~/components/exception/internal-server-error";
import NotFound from "~/components/exception/not-found";
import { ROUTES } from "~/constants/routes";
import { env } from "~/env";
import HealthGate from "~/features/auth/components/health-gate";
import GuestRoute from "~/features/auth/provider/guest-route";
import ProtectedRoute from "~/features/auth/provider/protected-route";
import { ChatSocketRouteBoundary } from "~/features/chat/provider/chat-socket-provider";
import { ThemeProvider } from "~/features/layout/provider/theme-provider";
import LayoutTemplate from "~/features/layout/templates/layout.template";
import ConversationPage from "./conversation-page";
import FriendsPage from "./friends-page";
import HomePage from "./home-page";
import ProfilePage from "./profile-page";
import SignInPage from "./sign-in-page";
import SignUpPage from "./sign-up-page";

import "~/globals.css";

import { queryClient } from "~/libs/query-client";

const LazyReactQueryDevtools = React.lazy(async () => {
  const { ReactQueryDevtools } = await import("@tanstack/react-query-devtools");
  return { default: ReactQueryDevtools };
});

/**
 * The route tree on its own, wrapped in the Health gate, so
 * `test/pages/main.test.tsx` can mount it at any path with no real backend
 * behind it. `MainApp` below only adds the providers and the browser router.
 */
export function AppRoutes() {
  return (
    <ThemeProvider>
      <HealthGate>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
            <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
          </Route>

          <Route path={ROUTES.HOME} element={<LayoutTemplate />}>
            <Route element={<ProtectedRoute />}>
              {/* Presence comes from the layout-level socket connection, not
                  this boundary — only the conversation screens need its
                  message/seen cache patching (see chat-socket-provider.tsx). */}
              <Route path={ROUTES.FRIENDS} element={<FriendsPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route element={<ChatSocketRouteBoundary />}>
                <Route index element={<HomePage />} />
                <Route
                  path={ROUTES.CONVERSATION_BY_ID}
                  element={<ConversationPage />}
                />
              </Route>
            </Route>

            {/* Outside the guard on purpose — a mistyped URL should say so,
                not bounce an already-signed-in user to sign-in. */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HealthGate>
    </ThemeProvider>
  );
}

const MainApp = () => {
  const [showDevtools, setShowDevtools] = React.useState(
    env.PUBLIC_APP_ENV === "local",
  );

  React.useEffect(() => {
    // @ts-expect-error
    window.monorepoToggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <ErrorBoundary fallback={<InternalServerError />}>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        {showDevtools && (
          <React.Suspense fallback={null}>
            <LazyReactQueryDevtools initialIsOpen={false} />
          </React.Suspense>
        )}
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default MainApp;
