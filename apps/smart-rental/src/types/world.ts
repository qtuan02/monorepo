import type { BuildingView } from "~/types/building";
import type { NotificationTemplate, SendLog } from "~/types/communication";
import type { ComplianceItem, ResidenceDeclaration } from "~/types/compliance";
import type { Contract } from "~/types/contract";
import type { Expense } from "~/types/expense";
import type { Invoice } from "~/types/invoice";
import type { RoomView } from "~/types/room";
import type { LandlordProfile } from "~/types/setting";
import type { SupplierBill } from "~/types/supplier-bill";
import type { TenantView } from "~/types/tenant";
import type { Utility, UtilityOldIndexOverride } from "~/types/utility";

/**
 * The Building scope every World is built under (glossary World) — `null`
 * means every Toà nhà. An empty string is never a scope: a Toà nhà always
 * has a real `id`, so `""` can only be a bug (a forgotten `?? ""`), never a
 * second spelling of "no Toà nhà chosen" — that is what `null` already means.
 */
export type BuildingScope = string | null;

/**
 * `buildWorld`/`readWorld`'s own scope parameter is typed through this
 * rather than the plain alias above — a generic literal `""` argument
 * collapses to `never`, so passing it is a compile error, while a genuine
 * (non-literal) `string` variable — the normal case, a Building's real `id`
 * — is untouched. `BuildingScope` itself stays the plain `string | null` a
 * stored/returned value (like `World.scope`) has no reason to narrow.
 */
export type NonEmptyBuildingScope<T extends string> = T extends "" ? never : T;

/**
 * Mọi thứ Portal biết dưới một Building scope tại một thời điểm (glossary
 * World, ADR-0015) — every array already scoped, Hoá đơn/Hợp đồng đã suy
 * `status` (never the raw Mock one), Chỉ số bất thường và Khai báo lưu trú
 * đã suy sẵn. The one source `~/hooks/api`'s derived `queryFn`s read
 * through instead of ghép tay mảng Mock.
 */
export interface World {
  scope: BuildingScope;
  today: Date;
  /** `totalRooms`/`activeContracts`/`availableRooms`/`occupancyRate` off Phòng and Hợp đồng live (ADR-0015 §2). */
  buildings: BuildingView[];
  /** `tenant` is the name off the Phòng's live Hợp đồng, `null` once none exists (ADR-0015 §2). */
  rooms: RoomView[];
  /** `status` is `deriveContractStatus(contract, today)` — never the raw Mock value. */
  contracts: Contract[];
  /** `status` is `deriveInvoiceStatus(invoice, today)` — never the raw Mock value. */
  invoices: Invoice[];
  utilities: Utility[];
  /** `findAnomalousUtilities(utilities)`, precomputed once for the scope. */
  anomalousUtilities: Utility[];
  /**
   * No `buildingId` field to scope by — always matched by an exact
   * (roomId, type, month), so an unscoped list is never wrong, only unfiltered.
   */
  utilityOldIndexOverrides: UtilityOldIndexOverride[];
  /** `room`/`floor`/`rentAmount`/`depositAmount`/`moveInDate`/`contractEnd`/`status`/`hasOverdueInvoice` off Hợp đồng live (ADR-0015 §2). */
  tenants: TenantView[];
  complianceItems: ComplianceItem[];
  residenceDeclarations: ResidenceDeclaration[];
  /** `buildingName` is never carried — hooks still join it via `withBuildingName`. */
  expenses: Omit<Expense, "buildingName">[];
  /** `buildingName` is never carried — hooks still join it via `withBuildingName`. */
  supplierBills: Omit<SupplierBill, "buildingName">[];
  /** No `buildingId` field to scope by — unfiltered regardless of scope. */
  notificationTemplates: NotificationTemplate[];
  /** No `buildingId` field to scope by — unfiltered regardless of scope. */
  sendLogs: SendLog[];
  /** One global record, no Building scope — unfiltered regardless of scope. */
  landlordProfile: LandlordProfile;
}
