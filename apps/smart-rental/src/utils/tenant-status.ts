import type { Contract } from "~/types/contract";
import type { Invoice } from "~/types/invoice";
import type { Tenant, TenantView } from "~/types/tenant";
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

/** The two hook-computed fields every screen reads off a Người thuê (ADR-0012). */
export function toTenantView(
  tenant: Tenant,
  contracts: Contract[],
  invoices: Invoice[],
  today: Date = new Date(),
): TenantView {
  return {
    ...tenant,
    status: deriveTenantStatus(tenant.id, contracts, today),
    hasOverdueInvoice: hasOverdueInvoice(tenant.id, contracts, invoices, today),
  };
}
