import type {
  BuildingScope,
  NonEmptyBuildingScope,
  World,
} from "~/types/world";
import { mockBuildings } from "~/constants/mock/buildings";
import {
  mockNotificationTemplates,
  mockSendLogs,
} from "~/constants/mock/communications";
import { mockComplianceItems } from "~/constants/mock/compliance";
import { mockContracts } from "~/constants/mock/contracts";
import { mockExpenses } from "~/constants/mock/expenses";
import { mockInvoices } from "~/constants/mock/invoices";
import { mockRooms } from "~/constants/mock/rooms";
import { mockLandlordProfile } from "~/constants/mock/settings";
import { mockSupplierBills } from "~/constants/mock/supplier-bills";
import { mockTenants } from "~/constants/mock/tenants";
import { mockUtilities } from "~/constants/mock/utilities";
import { mockUtilityOldIndexOverrides } from "~/constants/mock/utility-old-index-overrides";
import { buildWorld } from "~/utils/world";

/**
 * The wiring site (ADR-0015 §1) — binds `buildWorld` to the live Mock. The
 * ONE function outside a mutation's own `mutationFn` allowed to touch
 * `~/constants/mock`; every derived `queryFn` reads through this rather than
 * the Mock arrays directly. Swapping to `be-motel` is this one function.
 */
export function readWorld<TScope extends string = string>(
  scope: NonEmptyBuildingScope<TScope> | null,
  today: Date = new Date(),
): World {
  return buildWorld(
    {
      buildings: mockBuildings,
      rooms: mockRooms,
      contracts: mockContracts,
      invoices: mockInvoices,
      utilities: mockUtilities,
      utilityOldIndexOverrides: mockUtilityOldIndexOverrides,
      tenants: mockTenants,
      complianceItems: mockComplianceItems,
      expenses: mockExpenses,
      supplierBills: mockSupplierBills,
      notificationTemplates: mockNotificationTemplates,
      sendLogs: mockSendLogs,
      landlordProfile: mockLandlordProfile,
    },
    scope as BuildingScope,
    today,
  );
}
