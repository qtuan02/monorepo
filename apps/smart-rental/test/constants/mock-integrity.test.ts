import { describe, expect, it } from "vitest";

import { mockBuildings } from "~/constants/mock/buildings";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { mockContracts } from "~/constants/mock/contracts";
import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockSupplierBills } from "~/constants/mock/supplier-bills";
import { mockTenants } from "~/constants/mock/tenants";
import { mockUtilities } from "~/constants/mock/utilities";

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
