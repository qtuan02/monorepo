import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import dayjs from "@monorepo/dayjs";

import type { Tenant } from "~/types/tenant";
import { mockBuildings } from "~/constants/mock/buildings";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { mockContracts } from "~/constants/mock/contracts";
import { mockRooms } from "~/constants/mock/rooms";
import { mockTenants } from "~/constants/mock/tenants";
import { ROUTES } from "~/constants/routes";
import { computeContractEndDate } from "~/features/contracts/utils/contract-term";
import { AppRoutes } from "~/pages/main";
import { useAuthStore } from "~/stores/use-auth-store";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { formatDate } from "~/utils/date";
import { deriveTasks } from "~/utils/task-derivation";
import { buildWorld } from "~/utils/world";

const initialAuthState = useAuthStore.getState();
const initialBuildingState = useBuildingStore.getState();

// `formatCurrency` interposes a NBSP before "₫" — RTL's normalizer collapses
// the DOM's own NBSP but never the query string (same gotcha as elsewhere).
const NBSP = String.fromCharCode(160);
function withoutNbsp(text: string) {
  return text.split(NBSP).join(" ");
}

// Step 1 renders Phòng and Người thuê side by side — neither combobox has a
// distinguishing accessible name (see `select-room.test.tsx`), so the
// Người thuê one is always the second.
function tenantCombobox() {
  const combobox = screen.getAllByRole("combobox")[1];
  if (!combobox) throw new Error("Combobox Người thuê chưa render");
  return combobox;
}

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "*", element: <AppRoutes /> }], {
    initialEntries: [path],
  });
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe("ContractCreateTemplate — điều khoản điền sẵn, tóm tắt sống", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "a-token" });
  });

  afterEach(() => {
    useAuthStore.setState(initialAuthState, true);
    useBuildingStore.setState(initialBuildingState, true);
    // The "ký xong" test pushes a throwaway tenant straight onto the Mock
    // (no fixture in mock/tenants.ts starts with no Hợp đồng) — pop it back
    // off so it doesn't leak into a later test in this file.
    const testTenantIndex = mockTenants.findIndex(
      (tenant) => tenant.id === "T-test-186",
    );
    if (testTenantIndex !== -1) mockTenants.splice(testTenantIndex, 1);
  });

  it("seeds tiền thuê từ giá Phòng, cọc và thời hạn theo toggle", async () => {
    const user = userEvent.setup();
    renderAt(`${ROUTES.CONTRACT_CREATE}?room=R-B1-101`); // Phòng 101 — 2.500.000 đ

    // Chờ prefill xong trước khi chọn Người thuê và sang bước 2.
    await screen.findByDisplayValue(/Phòng 101/, {}, { timeout: 5000 });
    await user.click(tenantCombobox());
    await user.click(await screen.findByRole("option", { name: /Trần Thị B/ }));
    await user.click(screen.getByRole("button", { name: "Tiếp theo" }));

    // Tiền thuê điền sẵn từ giá Phòng.
    expect(
      await screen.findByDisplayValue("2500000", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    // Cọc mặc định 1 tháng = tiền thuê.
    expect(
      screen.getByText(withoutNbsp(formatCurrency(2500000))),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "2 tháng" }));
    expect(
      screen.getByText(withoutNbsp(formatCurrency(5000000))),
    ).toBeInTheDocument();

    // Thời hạn mặc định 12 tháng, tính từ ngày bắt đầu (hôm nay).
    const expectedEnd = computeContractEndDate(
      dayjs().format("YYYY-MM-DD"),
      12,
    );
    expect(
      screen.getByText(new RegExp(`Kết thúc ${formatDate(expectedEnd)}`)),
    ).toBeInTheDocument();
  }, 15000);

  it("ký xong: Phòng thành Đang thuê, Hợp đồng Đang hiệu lực, việc Thông báo lưu trú xuất hiện", async () => {
    // Một Người thuê chưa từng có Hợp đồng nào — chỉ cách này mới chứng minh
    // việc Lưu trú xuất hiện LÀ DO hợp đồng vừa tạo, chứ không phải có sẵn
    // (mọi Người thuê trong Mock đều đã gắn một Hợp đồng hiệu lực).
    const freshTenant: Tenant = {
      id: "T-test-186",
      buildingId: "b1",
      name: "Kiểm Thử Wizard",
      phone: "0900000186",
      email: "kiemthu186@example.com",
      idNumber: "000000186",
      gender: "male",
    };
    mockTenants.push(freshTenant);

    const room = mockRooms.find((item) => item.id === "R-B1-101");
    if (!room) throw new Error("Fixture R-B1-101 missing from the Mock");
    expect(room.status).toBe("available");

    const user = userEvent.setup();
    renderAt(`${ROUTES.CONTRACT_CREATE}?room=R-B1-101`);

    await screen.findByDisplayValue(/Phòng 101/, {}, { timeout: 5000 });
    await user.click(tenantCombobox());
    await user.click(
      await screen.findByRole("option", { name: /Kiểm Thử Wizard/ }),
    );
    await user.click(screen.getByRole("button", { name: "Tiếp theo" }));

    await user.click(
      await screen.findByRole(
        "button",
        { name: "Ký hợp đồng" },
        { timeout: 5000 },
      ),
    );

    // Lands on the new Hợp đồng's own detail screen — the status shows both
    // in the badge and, on mobile, in the header stepper's own summary line.
    expect(
      await screen.findAllByText("Đang hiệu lực", {}, { timeout: 5000 }),
    ).not.toHaveLength(0);
    expect(room.status).toBe("occupied");

    const tasks = deriveTasks(
      buildWorld(
        {
          buildings: mockBuildings,
          rooms: mockRooms,
          contracts: mockContracts,
          invoices: [],
          utilities: [],
          utilityOldIndexOverrides: [],
          tenants: mockTenants,
          complianceItems: mockComplianceItems,
          expenses: [],
          supplierBills: [],
          notificationTemplates: [],
          sendLogs: [],
          landlordProfile: { name: "", phone: "", email: "" },
        },
        null,
      ),
    );
    expect(
      tasks.some(
        (task) => task.id === `residence_notification-${freshTenant.id}`,
      ),
    ).toBe(true);
  }, 15000);
});
