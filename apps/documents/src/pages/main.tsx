import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router";

import { Toaster } from "@monorepo/ui/components/toast";

import InternalServerError from "~/components/exception/internal-server-error";
import { ROUTES } from "~/constants/routes";
import LayoutTemplate from "~/features/layout/templates/layout.template";
import ComponentDetailPage from "./component-detail-page";
import ComponentsPage from "./components-page";
import HomePage from "./home-page";
import HookDetailPage from "./hook-detail-page";
import HooksPage from "./hooks-page";
import NotFoundPage from "./not-found-page";

import "~/globals.css";
import "~/libs/i18n";
import "~/libs/dayjs";

/**
 * The route tree. Five pages under one shell, and no guard anywhere: this is a
 * public documentation site, so the Template's `ProtectedRoute` / `GuestRoute`
 * and the whole `auth` slice were dropped rather than left unused.
 *
 * There is no `QueryClientProvider` either — the site makes no HTTP call. Both
 * catalogues are JSON generated at build time from `packages/ui` and
 * `packages/hook`.
 */
const MainApp = () => (
  <ErrorBoundary
    fallback={<InternalServerError />}
    // Logged rather than swallowed: the fallback tells the user something
    // broke, this is what tells a developer what did.
    onError={(error, info) => {
      console.error("Uncaught render error:", error, info.componentStack);
    }}
  >
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<LayoutTemplate />}>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.COMPONENTS} element={<ComponentsPage />} />
          <Route
            path={ROUTES.COMPONENT_BY_SLUG}
            element={<ComponentDetailPage />}
          />
          <Route path={ROUTES.HOOKS} element={<HooksPage />} />
          <Route path={ROUTES.HOOK_BY_SLUG} element={<HookDetailPage />} />

          {/* Inside the shell on purpose: a mistyped URL should still show the
              navigation that gets the reader back to a real page. */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);

export default MainApp;
