import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import dayjs from "@monorepo/dayjs";

import { mockContracts } from "~/constants/mock/contracts";
import { mockInvoices, resetMockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockUtilities } from "~/constants/mock/utilities";
import { resetMockUtilityOldIndexOverrides } from "~/constants/mock/utility-old-index-overrides";
import DashboardTemplate from "~/features/dashboard/templates/dashboard.template";
import { useCorrectCycleOldIndex } from "~/hooks/api/cycle";
import { useRecordInvoicePayment } from "~/hooks/api/invoice";
import { readWorld } from "~/libs/mock-world";
import { queryClient } from "~/libs/query-client";
import { useBuildingStore } from "~/stores/use-building-store";
import { formatCurrency } from "~/utils/currency";
import { buildTodaySummary } from "~/utils/dashboard-summary";
import { formatFullDate } from "~/utils/date";
import { deriveInvoiceStatus } from "~/utils/invoice-status";

const initialBuildingState = useBuildingStore.getState();

// The app's own `queryClient` singleton, cleared per render — not a bare
// `new QueryClient()` — because ADR-0015 §3 moved every mutation's cache
// invalidation onto that singleton's global `MutationCache.onSuccess`; a
// fresh client with no `mutationCache` config would never invalidate
// anything. `extra` mounts a raw mutation trigger beside the template, the
// same shape `reconciliation.template.test.tsx` uses.
function renderDashboard(extra?: ReactNode) {
  queryClient.clear();
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <>
            <DashboardTemplate />
            {extra}
          </>
        ),
      },
    ],
    { initialEntries: ["/"] },
  );
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

// `formatCurrency`'s NBSP-before-"₫" pitfall — see `test/pages/main.test.tsx`'s
// own comment on the same trap: RTL's default text normalizer normalizes the
// ELEMENT's own text before comparing (NBSP collapses to a plain space), but
// never the query string, so a raw NBSP in the query never matches.
const NBSP = String.fromCharCode(160);
function withoutNbsp(text: string) {
  return text.split(NBSP).join(" ");
}

// The expected numbers are computed through the same `readWorld` +
// `buildTodaySummary` the hook itself calls (ADR-0015) — never hand-derived
// here, since re-deriving OVERDUE/PARTIAL by eye is exactly the trap
// ADR-0012's own tests warn about.
function expectedSummary(buildingId: string | null) {
  return buildTodaySummary(readWorld(buildingId));
}

describe("DashboardTemplate", () => {
  beforeEach(() => {
    useBuildingStore.setState(initialBuildingState, true);
  });

  it("names the day and reads the totals under «mọi Toà nhà»", async () => {
    const expected = expectedSummary(null);
    renderDashboard();

    expect(
      screen.getByRole("heading", { level: 1, name: formatFullDate() }),
    ).toBeInTheDocument();
    expect(
      await screen.findAllByText(
        withoutNbsp(formatCurrency(expected.outstandingThisMonth.amount)),
      ),
    ).not.toHaveLength(0);
  });

  it("reads one Toà nhà's slice once the Building scope changes", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b2" });
    const expectedB2 = expectedSummary("b2");
    renderDashboard();

    expect(
      await screen.findAllByText(
        withoutNbsp(formatCurrency(expectedB2.outstandingThisMonth.amount)),
      ),
    ).not.toHaveLength(0);
  });

  it("shows the Việc cần làm queue gộp — a merged Hoá đơn quá hạn mục", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderDashboard();

    expect(await screen.findAllByText(/Hoá đơn quá hạn/)).not.toHaveLength(0);
  });

  // AC: "KPI 3 ô, hai ô đầu không bao giờ cùng số" — the old bug was two
  // SEPARATE tiles ("Cần thu tháng này" / "Quá hạn") landing on the same
  // amount; merging them into one tile's own dòng phụ makes that
  // structurally impossible, but this pins it against the rendered strip.
  it("renders 3 KPI tiles whose own values never coincide", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    renderDashboard();

    const strip = await screen
      .findByText("Còn phải thu tháng này")
      .then((label) => label.closest('[data-slot="kpi-strip"]') as HTMLElement);
    const values = within(strip)
      .getAllByText(/./, { selector: "p.text-lg" })
      .map((el) => el.textContent);

    expect(values).toHaveLength(3);
    expect(new Set(values).size).toBe(3);
  });
});

function PayInvoiceButton({
  invoiceId,
  amount,
}: {
  invoiceId: string;
  amount: number;
}) {
  const recordPayment = useRecordInvoicePayment();
  return (
    <button
      type="button"
      onClick={() =>
        recordPayment.mutate({
          invoiceId,
          amount,
          method: "BANK_TRANSFER",
          paidAt: dayjs().format("YYYY-MM-DD"),
        })
      }
    >
      Thu tiền kiểm thử
    </button>
  );
}

// Regression #206 (ADR-0015 §3, spec #205 seam 4a): before the global
// `MutationCache.onSuccess`, `useRecordInvoicePayment` invalidated only
// `invoice`/`task` — `dashboard` was never one of the ~20 hand-wired edges,
// so "Còn phải thu" and the queue's gộp mục stayed stale for a full
// `staleTime` after a payment.
describe("Thu tiền một Hoá đơn quá hạn cập nhật Hôm nay ngay (regression #206, seam 4a)", () => {
  afterEach(() => {
    resetMockInvoices();
  });

  it("giảm KPI Còn phải thu và mục gộp quá hạn của Toà nhà, trong cùng lần render", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    const invoice = mockInvoices.find((item) => item.id === "I071");
    if (!invoice) throw new Error("Fixture I071 missing from the Mock");
    const owed = invoice.amount - invoice.paidAmount;
    const overdueBefore = mockInvoices.filter(
      (item) =>
        item.buildingId === "b1" && deriveInvoiceStatus(item) === "OVERDUE",
    ).length;
    expect(overdueBefore).toBeGreaterThan(1); // I071 must not be the only one

    const user = userEvent.setup();
    renderDashboard(<PayInvoiceButton invoiceId="I071" amount={owed} />);

    const before = buildTodaySummary(readWorld("b1"));
    await screen.findAllByText(
      withoutNbsp(formatCurrency(before.outstandingThisMonth.amount)),
    );
    expect(
      await screen.findAllByText(
        new RegExp(`^${overdueBefore} Hoá đơn quá hạn`),
      ),
    ).not.toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Thu tiền kiểm thử" }));

    const after = buildTodaySummary(readWorld("b1"));
    expect(after.outstandingThisMonth.amount).toBe(
      before.outstandingThisMonth.amount - owed,
    );
    expect(
      await screen.findAllByText(
        withoutNbsp(formatCurrency(after.outstandingThisMonth.amount)),
      ),
    ).not.toHaveLength(0);
    expect(
      await screen.findAllByText(
        new RegExp(`^${overdueBefore - 1} Hoá đơn quá hạn`),
      ),
    ).not.toHaveLength(0);
  });
});

const KPI_TEST_ROOM_ID = "R-b1-kpi-test-206";
const KPI_TEST_CONTRACT_ID = "C-kpi-test-206";
const currentCycleMonth = dayjs().format("YYYY-MM");
const previousCycleMonth = dayjs().subtract(1, "month").format("YYYY-MM");

/**
 * A "thay công tơ điện" scenario (ticket #183): kỳ trước ended at 500, the
 * new meter starts back at 0 — `newIndex(50) < oldIndex(500)` (the last
 * recorded reading) trips the "went backwards" anomaly until "Sửa chỉ số
 * cũ" overrides the baseline to match the new meter.
 */
function pushCycleProgressFixture() {
  mockRooms.push({
    id: KPI_TEST_ROOM_ID,
    buildingId: "b1",
    name: "Phòng KPI test 206",
    floor: 9,
    area: 20,
    price: 3_000_000,
    status: "occupied",
    type: "single",
    lastUpdated: "18/09/2026",
  });
  mockContracts.push({
    id: KPI_TEST_CONTRACT_ID,
    buildingId: "b1",
    roomId: KPI_TEST_ROOM_ID,
    tenantId: "T-kpi-test-206",
    contractNumber: "HĐ-KPI-TEST-206",
    tenant: "Người thuê kiểm thử",
    room: "Phòng KPI test 206",
    floor: 9,
    rentAmount: 3_000_000,
    depositAmount: 3_000_000,
    depositStatus: "HELD",
    depositReturnedAmount: 0,
    noticeDays: 30,
    startDate: "01/01/2026",
    endDate: "01/01/2027",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "18/09/2026",
  });
  mockUtilities.push(
    {
      id: "u-kpi-test-206-electricity-prev",
      buildingId: "b1",
      roomId: KPI_TEST_ROOM_ID,
      roomName: "Phòng KPI test 206",
      month: previousCycleMonth,
      type: "electricity",
      oldIndex: 400,
      newIndex: 500,
      consumption: 100,
      status: "FINALIZED",
      approved: true,
      updatedAt: new Date().toISOString(),
      proofImages: [],
    },
    {
      id: "u-kpi-test-206-electricity",
      buildingId: "b1",
      roomId: KPI_TEST_ROOM_ID,
      roomName: "Phòng KPI test 206",
      month: currentCycleMonth,
      type: "electricity",
      oldIndex: 0,
      newIndex: 50,
      consumption: 50,
      status: "DRAFT",
      approved: false,
      updatedAt: new Date().toISOString(),
      proofImages: [],
    },
    {
      id: "u-kpi-test-206-water",
      buildingId: "b1",
      roomId: KPI_TEST_ROOM_ID,
      roomName: "Phòng KPI test 206",
      month: currentCycleMonth,
      type: "water",
      oldIndex: 10,
      newIndex: 15,
      consumption: 5,
      status: "DRAFT",
      approved: false,
      updatedAt: new Date().toISOString(),
      proofImages: [],
    },
  );
}

function popCycleProgressFixture() {
  const roomIndex = mockRooms.findIndex((item) => item.id === KPI_TEST_ROOM_ID);
  if (roomIndex !== -1) mockRooms.splice(roomIndex, 1);
  const contractIndex = mockContracts.findIndex(
    (item) => item.id === KPI_TEST_CONTRACT_ID,
  );
  if (contractIndex !== -1) mockContracts.splice(contractIndex, 1);
  for (let i = mockUtilities.length - 1; i >= 0; i -= 1) {
    if (mockUtilities[i]?.roomId === KPI_TEST_ROOM_ID) {
      mockUtilities.splice(i, 1);
    }
  }
  resetMockUtilityOldIndexOverrides();
}

function CorrectOldIndexButton() {
  const correctOldIndex = useCorrectCycleOldIndex();
  return (
    <button
      type="button"
      onClick={() =>
        correctOldIndex.mutate({
          roomId: KPI_TEST_ROOM_ID,
          type: "electricity",
          month: currentCycleMonth,
          oldIndex: 0,
          note: "Thay công tơ điện (kiểm thử)",
        })
      }
    >
      Sửa chỉ số cũ kiểm thử
    </button>
  );
}

// Regression #206 (ADR-0015 §3, spec #205 seam 4b): `buildCycleProgressSummary`
// called `buildCycleRows` without the 9th `oldIndexOverrides` parameter, so a
// "Sửa chỉ số cũ" correction on màn Kỳ never reached Hôm nay's own recompute —
// the Phòng stayed counted as "bất thường" there even once màn Kỳ resolved it
// as READY.
describe("Sửa chỉ số cũ trên màn Kỳ cập nhật KPI Chỉ số kỳ ở Hôm nay ngay (regression #206, seam 4b)", () => {
  beforeEach(() => {
    pushCycleProgressFixture();
  });

  afterEach(() => {
    popCycleProgressFixture();
  });

  it("đếm Phòng vừa sửa chỉ số cũ là đủ điều kiện — không còn bất thường", async () => {
    useBuildingStore.setState({ selectedBuildingId: "b1" });
    const user = userEvent.setup();
    renderDashboard(<CorrectOldIndexButton />);

    const label = await screen.findByText(/^Chỉ số Kỳ /);
    const tile = label.parentElement as HTMLElement;
    const anomalyBefore = await within(tile).findByText(/bất thường/);
    const countBefore = Number(anomalyBefore.textContent?.match(/^(\d+)/)?.[1]);
    // The fixture's own room must be counted — and Phòng 103 (b1's own real
    // fixture, see cycle.template.test.tsx) means it is never the only one.
    expect(countBefore).toBeGreaterThan(1);

    await user.click(
      screen.getByRole("button", { name: "Sửa chỉ số cũ kiểm thử" }),
    );

    await within(tile).findByText(new RegExp(`^${countBefore - 1} bất thường`));
  });
});
