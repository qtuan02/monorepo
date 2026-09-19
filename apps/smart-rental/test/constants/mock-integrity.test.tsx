import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockBuildings } from "~/constants/mock/buildings";
import { mockSendLogs } from "~/constants/mock/communications";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { mockContracts } from "~/constants/mock/contracts";
import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockSupplierBills } from "~/constants/mock/supplier-bills";
import { mockTenants } from "~/constants/mock/tenants";
import { mockUtilities } from "~/constants/mock/utilities";
import { mockUtilityOldIndexOverrides } from "~/constants/mock/utility-old-index-overrides";
import { useCreateContract } from "~/hooks/api/contract";

/**
 * ADR-0012's acceptance test: every Mock reference is by id, and every id it
 * points at exists. Written once here rather than per-entity, so a future
 * Mock rewrite (a new domain, a renamed id) is checked the same way.
 */
function assertNoDuplicateIds(label: string, ids: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  expect(duplicates, `${label} has duplicate ids`).toEqual(new Set());
}

function assertIdsExist(label: string, refs: string[], validIds: Set<string>) {
  const dangling = refs.filter((ref) => !validIds.has(ref));
  expect(dangling, `${label} references a dangling id`).toEqual([]);
}

describe("Mock referential integrity (ADR-0012)", () => {
  const buildingIds = new Set(mockBuildings.map((b) => b.id));
  const roomIds = new Set(mockRooms.map((r) => r.id));
  const tenantIds = new Set(mockTenants.map((t) => t.id));
  const contractIds = new Set(mockContracts.map((c) => c.id));

  it("has no id duplicated within any entity", () => {
    assertNoDuplicateIds(
      "buildings",
      mockBuildings.map((b) => b.id),
    );
    assertNoDuplicateIds(
      "rooms",
      mockRooms.map((r) => r.id),
    );
    assertNoDuplicateIds(
      "tenants",
      mockTenants.map((t) => t.id),
    );
    assertNoDuplicateIds(
      "contracts",
      mockContracts.map((c) => c.id),
    );
    assertNoDuplicateIds(
      "invoices",
      mockInvoices.map((i) => i.id),
    );
    assertNoDuplicateIds(
      "utilities",
      mockUtilities.map((u) => u.id),
    );
    assertNoDuplicateIds(
      "compliance",
      mockComplianceItems.map((c) => c.id),
    );
  });

  it("has no id shared across two different entities", () => {
    const allIds = [
      ...mockBuildings.map((b) => b.id),
      ...mockRooms.map((r) => r.id),
      ...mockTenants.map((t) => t.id),
      ...mockContracts.map((c) => c.id),
      ...mockInvoices.map((i) => i.id),
      ...mockUtilities.map((u) => u.id),
      ...mockComplianceItems.map((c) => c.id),
    ];
    assertNoDuplicateIds("every entity together", allIds);
  });

  it("every entity's buildingId resolves to a real Toà nhà", () => {
    assertIdsExist(
      "rooms",
      mockRooms.map((r) => r.buildingId),
      buildingIds,
    );
    assertIdsExist(
      "tenants",
      mockTenants.map((t) => t.buildingId),
      buildingIds,
    );
    assertIdsExist(
      "contracts",
      mockContracts.map((c) => c.buildingId),
      buildingIds,
    );
    assertIdsExist(
      "invoices",
      mockInvoices.flatMap((i) => (i.buildingId ? [i.buildingId] : [])),
      buildingIds,
    );
    assertIdsExist(
      "utilities",
      mockUtilities.map((u) => u.buildingId),
      buildingIds,
    );
    assertIdsExist(
      "compliance",
      mockComplianceItems.map((c) => c.buildingId),
      buildingIds,
    );
    assertIdsExist(
      "supplier bills",
      mockSupplierBills.map((s) => s.buildingId),
      buildingIds,
    );
    assertIdsExist(
      "expenses",
      mockExpenses.map((e) => e.buildingId),
      buildingIds,
    );
  });

  it("Hợp đồng references real Phòng and Người thuê", () => {
    assertIdsExist(
      "contracts.roomId",
      mockContracts.map((c) => c.roomId),
      roomIds,
    );
    assertIdsExist(
      "contracts.tenantId",
      mockContracts.map((c) => c.tenantId),
      tenantIds,
    );
  });

  it("Hoá đơn references a real Hợp đồng", () => {
    assertIdsExist(
      "invoices.contractId",
      mockInvoices.map((i) => i.contractId),
      contractIds,
    );
  });

  it("Chỉ số điện nước references a real Phòng", () => {
    assertIdsExist(
      "utilities.roomId",
      mockUtilities.map((u) => u.roomId),
      roomIds,
    );
  });

  it("Khai báo lưu trú references a real Người thuê", () => {
    assertIdsExist(
      "compliance.tenantId",
      mockComplianceItems.map((c) => c.tenantId),
      tenantIds,
    );
  });

  it("no Phòng or Người thuê has two live Hợp đồng at once (ADR-0015 §2)", () => {
    // World's RoomView/TenantView join picks a live (ACTIVE/EXPIRING)
    // contract off `roomId`/`tenantId` alone — two live at once would make
    // that join ambiguous and silently pick whichever sorts first.
    const liveContracts = mockContracts.filter(
      (c) => c.status === "ACTIVE" || c.status === "EXPIRING",
    );
    assertNoDuplicateIds(
      "contracts.roomId (live)",
      liveContracts.map((c) => c.roomId),
    );
    assertNoDuplicateIds(
      "contracts.tenantId (live)",
      liveContracts.map((c) => c.tenantId),
    );
  });
});

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH_RE = /^\d{4}-\d{2}$/;
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const DISPLAY_DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const DISPLAY_MONTH_RE = /^\d{2}\/\d{4}$/;

/** A field is "date-like" by its own name, not by a fixed list of entities. */
function isDateLikeKey(key: string): boolean {
  return (
    /Date$/.test(key) ||
    /At$/.test(key) ||
    /Updated$/.test(key) ||
    key === "month" ||
    key === "period" ||
    /Month$/.test(key) ||
    /Period$/.test(key)
  );
}

function isValidIsoValue(value: string): boolean {
  return (
    value === "—" ||
    ISO_DATE_RE.test(value) ||
    ISO_MONTH_RE.test(value) ||
    ISO_DATETIME_RE.test(value)
  );
}

interface DateField {
  path: string;
  value: string;
}

function collectDateLikeFields(
  value: unknown,
  path: string,
  out: DateField[],
): void {
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      collectDateLikeFields(item, `${path}[${index}]`, out);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, entryValue] of Object.entries(value)) {
      const nextPath = `${path}.${key}`;
      if (typeof entryValue === "string" && isDateLikeKey(key)) {
        out.push({ path: nextPath, value: entryValue });
      } else {
        collectDateLikeFields(entryValue, nextPath, out);
      }
    }
  }
}

/**
 * Ticket #231 (spec #227 C4) — the Mock stores exactly ONE date encoding:
 * ISO. Never `DD/MM/YYYY` or `MM/YYYY` — every screen converts at render
 * time via `formatDate`/`formatMonth`. A field is "date-like" by its own
 * name (`*Date`, `*At`, `*Updated`, `month`/`*Month`, `period`/`*Period`),
 * not by a fixed list of entities, so a future Mock addition is caught the
 * same way without touching this file.
 */
describe("Mock date encoding (ticket #231)", () => {
  const dateFields: DateField[] = [];
  collectDateLikeFields(mockBuildings, "buildings", dateFields);
  collectDateLikeFields(mockRooms, "rooms", dateFields);
  collectDateLikeFields(mockTenants, "tenants", dateFields);
  collectDateLikeFields(mockContracts, "contracts", dateFields);
  collectDateLikeFields(mockInvoices, "invoices", dateFields);
  collectDateLikeFields(mockUtilities, "utilities", dateFields);
  collectDateLikeFields(
    mockUtilityOldIndexOverrides,
    "utilityOldIndexOverrides",
    dateFields,
  );
  collectDateLikeFields(mockComplianceItems, "compliance", dateFields);
  collectDateLikeFields(mockExpenses, "expenses", dateFields);
  collectDateLikeFields(mockSupplierBills, "supplierBills", dateFields);
  collectDateLikeFields(mockSendLogs, "sendLogs", dateFields);

  it("actually scanned some date-like fields (the scan itself isn't a no-op)", () => {
    expect(dateFields.length).toBeGreaterThan(0);
  });

  it("has no DD/MM/YYYY or MM/YYYY string anywhere in the Mock", () => {
    const displayFormatted = dateFields.filter(
      (field) =>
        DISPLAY_DATE_RE.test(field.value) || DISPLAY_MONTH_RE.test(field.value),
    );
    expect(displayFormatted).toEqual([]);
  });

  it("every date-like field is ISO (date, month, or timestamp)", () => {
    const invalid = dateFields.filter((field) => !isValidIsoValue(field.value));
    expect(invalid).toEqual([]);
  });
});

/**
 * A `mutationFn` writing a display-formatted date into the Mock would pass
 * every check above (it runs before this test's write ever happens) — so
 * this proves the scan holds for a record a `mutationFn` writes at runtime,
 * not only the ones authored by hand in `~/constants/mock`.
 */
describe("Mock date encoding survives a live mutation (ticket #231 AC)", () => {
  it("useCreateContract writes startDate/endDate/lastUpdated as ISO", async () => {
    const queryClient = new QueryClient();
    const { result } = renderHook(() => useCreateContract(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    act(() => {
      result.current.mutate({
        roomId: "R-B1-101",
        tenantId: "T001",
        startDate: "2026-09-19",
        endDate: "2027-09-18",
        rentAmount: 2_500_000,
        depositAmount: 2_500_000,
        noticeDays: 30,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const created = mockContracts.find(
      (contract) => contract.id === result.current.data?.id,
    );
    const fields: DateField[] = [];
    collectDateLikeFields(created, "createdContract", fields);

    expect(fields.length).toBeGreaterThan(0);
    expect(fields.filter((field) => !isValidIsoValue(field.value))).toEqual([]);
    expect(
      fields.filter(
        (field) =>
          DISPLAY_DATE_RE.test(field.value) ||
          DISPLAY_MONTH_RE.test(field.value),
      ),
    ).toEqual([]);
  });
});
