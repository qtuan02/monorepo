import type { Building } from "~/types/building";
import type { ComplianceItem } from "~/types/compliance";
import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Room } from "~/types/room";
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
}

function scopeByBuildingId<T extends { buildingId?: string }>(
  list: T[],
  scope: BuildingScope,
): T[] {
  return scope ? list.filter((item) => item.buildingId === scope) : list;
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
    : arrays.buildings;
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
  const tenants = scopeByBuildingId(arrays.tenants, scopeValue);
  const complianceItems = scopeByBuildingId(arrays.complianceItems, scopeValue);

  return {
    scope: scopeValue,
    today,
    buildings,
    rooms,
    contracts,
    invoices,
    utilities,
    anomalousUtilities: findAnomalousUtilities(utilities),
    utilityOldIndexOverrides: arrays.utilityOldIndexOverrides,
    tenants,
    complianceItems,
    residenceDeclarations: buildResidenceDeclarations(
      tenants,
      contracts,
      complianceItems,
      today,
    ),
  };
}
