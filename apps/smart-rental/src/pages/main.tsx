import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router";

import { Toaster } from "@monorepo/ui/components/toast";

import InternalServerError from "~/components/exception/internal-server-error";
import NotFound from "~/components/exception/not-found";
import { ROUTES } from "~/constants/routes";
import { env } from "~/env";
import GuestRoute from "~/features/auth/provider/guest-route";
import ProtectedRoute from "~/features/auth/provider/protected-route";
import AuthLayoutTemplate from "~/features/auth/templates/auth-layout.template";
import LayoutTemplate from "~/features/layout/templates/layout.template";
import BatchInvoicePage from "./batch-invoice-page";
import BuildingDetailPage from "./building-detail-page";
import BuildingListPage from "./building-list-page";
import CommunicationsPage from "./communications-page";
import ComplianceDashboardPage from "./compliance-dashboard-page";
import ContractCreatePage from "./contract-create-page";
import ContractDetailPage from "./contract-detail-page";
import ContractLiquidationPage from "./contract-liquidation-page";
import ContractListPage from "./contract-list-page";
import ContractRenewPage from "./contract-renew-page";
import DashboardPage from "./dashboard-page";
import ExpenseDetailPage from "./expense-detail-page";
import ExpenseListPage from "./expense-list-page";
import InvoiceDetailPage from "./invoice-detail-page";
import InvoiceListPage from "./invoice-list-page";
import MeterInputPage from "./meter-input-page";
import OnboardingWizardPage from "./onboarding-wizard-page";
import ReconciliationPage from "./reconciliation-page";
import RegisterPage from "./register-page";
import ReportsOverviewPage from "./reports-overview-page";
import RoomDetailPage from "./room-detail-page";
import RoomListPage from "./room-list-page";
import SettingsPage from "./settings-page";
import SignInPage from "./sign-in-page";
import SupplierBillDetailPage from "./supplier-bill-detail-page";
import SupplierBillListPage from "./supplier-bill-list-page";
import TaskCenterPage from "./task-center-page";
import TenantCreatePage from "./tenant-create-page";
import TenantDetailPage from "./tenant-detail-page";
import TenantListPage from "./tenant-list-page";
import UtilityDetailPage from "./utility-detail-page";
import UtilityListPage from "./utility-list-page";

import "~/globals.css";

import { queryClient } from "~/libs/query-client";

const LazyReactQueryDevtools = React.lazy(async () => {
  const { ReactQueryDevtools } = await import("@tanstack/react-query-devtools");
  return { default: ReactQueryDevtools };
});

/**
 * The route tree on its own, so `test/pages/main.test.tsx` can mount it in a
 * memory router at any path. The providers and `BrowserRouter` live in
 * `MainApp` below.
 *
 * Three groups, as in the prototype: the guest screens under `GuestRoute`
 * (outside the shell — they are chromeless), onboarding under neither guard,
 * and everything else under `ProtectedRoute` inside the shell — with the
 * catch-all 404 beside the guard rather than under it.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayoutTemplate />}>
          <Route path={ROUTES.AUTH_LOGIN} element={<SignInPage />} />
          <Route path={ROUTES.AUTH_REGISTER} element={<RegisterPage />} />
        </Route>
      </Route>

      <Route path={ROUTES.ONBOARDING} element={<OnboardingWizardPage />} />

      <Route path={ROUTES.HOME} element={<LayoutTemplate />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />

          <Route path={ROUTES.BUILDINGS} element={<BuildingListPage />} />
          <Route
            path={ROUTES.BUILDING_DETAIL}
            element={<BuildingDetailPage />}
          />

          <Route path={ROUTES.ROOMS} element={<RoomListPage />} />
          <Route path={ROUTES.ROOM_DETAIL} element={<RoomDetailPage />} />

          <Route path={ROUTES.TENANTS} element={<TenantListPage />} />
          <Route path={ROUTES.TENANT_CREATE} element={<TenantCreatePage />} />
          <Route path={ROUTES.TENANT_DETAIL} element={<TenantDetailPage />} />

          <Route path={ROUTES.CONTRACTS} element={<ContractListPage />} />
          <Route
            path={ROUTES.CONTRACT_CREATE}
            element={<ContractCreatePage />}
          />
          <Route
            path={ROUTES.CONTRACT_DETAIL}
            element={<ContractDetailPage />}
          />
          <Route path={ROUTES.CONTRACT_RENEW} element={<ContractRenewPage />} />
          <Route
            path={ROUTES.CONTRACT_LIQUIDATION}
            element={<ContractLiquidationPage />}
          />

          <Route path={ROUTES.INVOICES} element={<InvoiceListPage />} />
          <Route path={ROUTES.INVOICE_BATCH} element={<BatchInvoicePage />} />
          <Route path={ROUTES.INVOICE_DETAIL} element={<InvoiceDetailPage />} />

          <Route path={ROUTES.UTILITIES} element={<UtilityListPage />} />
          <Route path={ROUTES.METER_INPUT} element={<MeterInputPage />} />
          <Route path={ROUTES.UTILITY_DETAIL} element={<UtilityDetailPage />} />

          <Route
            path={ROUTES.SUPPLIER_BILLS}
            element={<SupplierBillListPage />}
          />
          <Route
            path={ROUTES.SUPPLIER_BILL_DETAIL}
            element={<SupplierBillDetailPage />}
          />

          <Route path={ROUTES.EXPENSES} element={<ExpenseListPage />} />
          <Route path={ROUTES.EXPENSE_DETAIL} element={<ExpenseDetailPage />} />

          <Route
            path={ROUTES.RECONCILIATION}
            element={<ReconciliationPage />}
          />
          <Route path={ROUTES.TASKS} element={<TaskCenterPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsOverviewPage />} />
          <Route
            path={ROUTES.COMPLIANCE}
            element={<ComplianceDashboardPage />}
          />
          <Route
            path={ROUTES.COMMUNICATIONS}
            element={<CommunicationsPage />}
          />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* Outside the guard on purpose — a mistyped URL should say so, not
            bounce an already-signed-in user to sign-in. */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
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
          <AppRoutes />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default MainApp;
