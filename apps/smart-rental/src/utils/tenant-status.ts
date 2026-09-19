import dayjs from "@monorepo/dayjs";

import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Tenant, TenantView } from "~/types/tenant";
import type { World } from "~/types/world";
import { isContractLive } from "~/utils/contract-status";
import { deriveInvoiceStatus } from "~/utils/invoice-status";

/**
 * A Người thuê has no stored status (ADR-0012, spec #153 §10 row 10) —
 * "Đang thuê" when at least one of its Hợp đồng is still `ACTIVE`/`EXPIRING`,
 * "Đã rời" otherwise (no contract at all, or every one `EXPIRED`/`TERMINATED`).
 */
export function deriveTenantStatus(
  tenantId: string,
  contracts: Contract[],
  today: Date = new Date(),
): "active" | "ended" {
  const hasLiveContract = contracts.some(
    (contract) =>
      contract.tenantId === tenantId && isContractLive(contract, today),
  );
  return hasLiveContract ? "active" : "ended";
}

/**
 * "cờ có Hoá đơn quá hạn" (spec #153 §10 row 10) — true when any Hoá đơn on
 * one of the tenant's Hợp đồng derives to `OVERDUE`.
 */
export function hasOverdueInvoice(
  tenantId: string,
  contracts: Contract[],
  invoices: Invoice[],
  today: Date = new Date(),
): boolean {
  const contractIds = new Set(
    contracts
      .filter((contract) => contract.tenantId === tenantId)
      .map((c) => c.id),
  );
  return invoices.some(
    (invoice) =>
      contractIds.has(invoice.contractId) &&
      deriveInvoiceStatus(invoice, today) === "OVERDUE",
  );
}

/**
 * The Hợp đồng a Người thuê's `room`/`floor`/… fields read off (ADR-0015 §2):
 * its live (`ACTIVE`/`EXPIRING`) one when it has one — the newest by
 * `endDate` if somehow more than one — else its most recently ended one, so
 * a departed Người thuê still shows where they last lived rather than
 * blanking out. `undefined` only for a freshly created Người thuê with no
 * Hợp đồng at all. `contracts` must already carry World's derived `status`
 * (`deriveContractStatus`, run once against World's own `today`) — checked
 * directly here rather than through `isContractLive`, which would otherwise
 * re-derive it against the real clock and disagree with a test's fixed one.
 */
export function findTenantContract(
  tenantId: string,
  contracts: Contract[],
): Contract | undefined {
  const tenantContracts = contracts.filter(
    (contract) => contract.tenantId === tenantId,
  );
  const liveContracts = tenantContracts.filter(
    (contract) =>
      contract.status === "ACTIVE" || contract.status === "EXPIRING",
  );
  const candidates = liveContracts.length > 0 ? liveContracts : tenantContracts;

  return [...candidates].sort((a, b) =>
    dayjs(b.endDate).diff(dayjs(a.endDate)),
  )[0];
}

/**
 * The hook-computed fields every screen reads off a Người thuê (ADR-0012,
 * ADR-0015 §2) — `room`/`floor`/`rentAmount`/`depositAmount`/`moveInDate`/
 * `contractEnd` off `findTenantContract`, plus `status` and
 * `hasOverdueInvoice`. Takes a World-shaped bag (ADR-0015 §1) rather than
 * positional arrays — a real `World` from `readWorld` satisfies it
 * structurally. `contracts` here already carries `deriveContractStatus`'s
 * output (World computes it before calling this), so `findTenantContract`
 * never has to re-derive it itself.
 */
export function toTenantView(
  tenant: Tenant,
  world: Pick<World, "contracts" | "invoices" | "today">,
): TenantView {
  const contract = findTenantContract(tenant.id, world.contracts);

  return {
    ...tenant,
    room: contract?.room ?? "—",
    floor: contract?.floor ?? 0,
    rentAmount: contract?.rentAmount ?? 0,
    depositAmount: contract?.depositAmount ?? 0,
    moveInDate: contract?.startDate ?? "—",
    contractEnd: contract?.endDate ?? "—",
    status: deriveTenantStatus(tenant.id, world.contracts, world.today),
    hasOverdueInvoice: hasOverdueInvoice(
      tenant.id,
      world.contracts,
      world.invoices,
      world.today,
    ),
  };
}

/**
 * Every Người thuê in scope, each with its own computed fields (ADR-0015
 * §1/§2). `tenants` here is the RAW Mock entity, not `World.tenants` itself
 * (which is this function's own output) — `buildWorld` is the one caller
 * that has both.
 */
export function buildTenantViews(
  bag: Pick<World, "contracts" | "invoices" | "today"> & {
    tenants: Tenant[];
  },
): TenantView[] {
  return bag.tenants.map((tenant) => toTenantView(tenant, bag));
}
