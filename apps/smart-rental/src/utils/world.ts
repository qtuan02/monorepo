import type { Building, BuildingView } from "~/types/building";
import type { NotificationTemplate, SendLog } from "~/types/communication";
import type { ComplianceItem } from "~/types/compliance";
import type { Contract } from "~/types/contract";
import type { Expense } from "~/types/expense";
import type { Invoice } from "~/types/invoice";
import type { Room, RoomView } from "~/types/room";
import type { LandlordProfile } from "~/types/setting";
import type { SupplierBill } from "~/types/supplier-bill";
import type { Tenant } from "~/types/tenant";
import type { Utility, UtilityOldIndexOverride } from "~/types/utility";
import type {
  BuildingScope,
  NonEmptyBuildingScope,
  World,
} from "~/types/world";
import { deriveContractStatus } from "~/utils/contract-status";
import { deriveInvoiceStatus } from "~/utils/invoice-status";
import { buildResidenceDeclarations } from "~/utils/residence-declaration";
import { buildTenantViews } from "~/utils/tenant-status";
import { findAnomalousUtilities } from "~/utils/utility-anomaly";

export interface WorldArrays {
  buildings: Building[];
  rooms: Room[];
  contracts: Contract[];
  invoices: Invoice[];
  utilities: Utility[];
  utilityOldIndexOverrides: UtilityOldIndexOverride[];
  tenants: Tenant[];
  complianceItems: ComplianceItem[];
  expenses: Omit<Expense, "buildingName">[];
  supplierBills: Omit<SupplierBill, "buildingName">[];
  notificationTemplates: NotificationTemplate[];
  sendLogs: SendLog[];
  landlordProfile: LandlordProfile;
}

// A copy either way — never the Mock's own array reference. A `mutationFn`
// writes straight into that array (push/splice/Object.assign) in place
// (ADR-0012 §3); handing the SAME reference back out as `data` means a
// mutated-in-place array is already "equal" to what TanStack Query cached
// before the write, so its structural-sharing check sees no change and never
// re-renders a reader that only watches `data` (see `useGetRooms` — a real
// regression this shape caused, caught by `buildings-rooms.e2e.ts`).
function scopeByBuildingId<T extends { buildingId?: string }>(
  list: T[],
  scope: BuildingScope,
): T[] {
  return scope ? list.filter((item) => item.buildingId === scope) : [...list];
}

/** A Phòng's `tenant` (ADR-0015 §2) — the name off its live Hợp đồng, `null` once none exists. */
function toRoomView(room: Room, contracts: Contract[]): RoomView {
  const liveContract = contracts.find(
    (contract) =>
      contract.roomId === room.id &&
      (contract.status === "ACTIVE" || contract.status === "EXPIRING"),
  );
  return { ...room, tenant: liveContract?.tenant ?? null };
}

/**
 * A Toà nhà's four figures (ADR-0015 §2), counted off `rooms`/`contracts`
 * already scoped to it — never the Mock's own stale numbers.
 */
function toBuildingView(
  building: Building,
  rooms: Room[],
  contracts: Contract[],
): BuildingView {
  const totalRooms = rooms.filter(
    (room) => room.buildingId === building.id,
  ).length;
  const activeContracts = contracts.filter(
    (contract) =>
      contract.buildingId === building.id &&
      (contract.status === "ACTIVE" || contract.status === "EXPIRING"),
  ).length;
  const availableRooms = Math.max(0, totalRooms - activeContracts);
  const occupancyRate =
    totalRooms === 0 ? 0 : Math.round((activeContracts / totalRooms) * 100);

  return {
    ...building,
    totalRooms,
    activeContracts,
    availableRooms,
    occupancyRate,
  };
}

/**
 * World (glossary, ADR-0015 §1) — the one pure function every derived
 * screen's read goes through instead of ghép tay 3–8 mảng Mock. `readWorld`
 * in `~/libs/mock-world` binds this to the live Mock; kept pure here so
 * `test/utils/world.test.ts` never has to touch Mock at all.
 */
export function buildWorld<TScope extends string = string>(
  arrays: WorldArrays,
  scope: NonEmptyBuildingScope<TScope> | null,
  today: Date = new Date(),
): World {
  const scopeValue = scope as BuildingScope;
  const buildings = scopeValue
    ? arrays.buildings.filter((building) => building.id === scopeValue)
    : [...arrays.buildings];
  const rooms = scopeByBuildingId(arrays.rooms, scopeValue);
  const contracts = scopeByBuildingId(arrays.contracts, scopeValue).map(
    (contract) => ({
      ...contract,
      status: deriveContractStatus(contract, today),
    }),
  );
  const invoices = scopeByBuildingId(arrays.invoices, scopeValue).map(
    (invoice) => ({
      ...invoice,
      status: deriveInvoiceStatus(invoice, today),
    }),
  );
  const utilities = scopeByBuildingId(arrays.utilities, scopeValue);
  const rawTenants = scopeByBuildingId(arrays.tenants, scopeValue);
  const complianceItems = scopeByBuildingId(arrays.complianceItems, scopeValue);
  const expenses = scopeByBuildingId(arrays.expenses, scopeValue);
  const supplierBills = scopeByBuildingId(arrays.supplierBills, scopeValue);

  const roomViews = rooms.map((room) => toRoomView(room, contracts));
  const buildingViews = buildings.map((building) =>
    toBuildingView(building, rooms, contracts),
  );
  const tenants = buildTenantViews({
    tenants: rawTenants,
    contracts,
    invoices,
    today,
  });

  return {
    scope: scopeValue,
    today,
    buildings: buildingViews,
    rooms: roomViews,
    contracts,
    invoices,
    utilities,
    anomalousUtilities: findAnomalousUtilities(utilities),
    utilityOldIndexOverrides: arrays.utilityOldIndexOverrides,
    tenants,
    complianceItems,
    residenceDeclarations: buildResidenceDeclarations({
      tenants,
      contracts,
      complianceItems,
      today,
    }),
    expenses,
    supplierBills,
    notificationTemplates: [...arrays.notificationTemplates],
    sendLogs: [...arrays.sendLogs],
    landlordProfile: { ...arrays.landlordProfile },
  };
}
