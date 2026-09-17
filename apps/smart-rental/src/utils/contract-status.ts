import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Contract, ContractStatus } from "~/types/contract";

/** "≤ 30 ngày tới ngày kết thúc" (ADR-0012, spec #153 §10 row 5). */
export const CONTRACT_EXPIRING_WINDOW_DAYS = 30;

/**
 * `EXPIRING`/`EXPIRED` are never persisted (ADR-0012) — they are read off
 * `endDate` fresh every time. `DRAFT` and `TERMINATED` are explicit lifecycle
 * states a landlord action set, so they pass through unchanged.
 */
export function deriveContractStatus(
  contract: Pick<Contract, "status" | "endDate">,
  today: Date = new Date(),
): ContractStatus {
  if (contract.status === "DRAFT" || contract.status === "TERMINATED") {
    return contract.status;
  }

  const daysUntilEnd = dayjs(contract.endDate, DATE_FORMAT)
    .startOf("day")
    .diff(dayjs(today).startOf("day"), "day");

  if (daysUntilEnd < 0) return "EXPIRED";
  if (daysUntilEnd <= CONTRACT_EXPIRING_WINDOW_DAYS) return "EXPIRING";
  return "ACTIVE";
}

/** Whether a Hợp đồng still covers its Người thuê — `ACTIVE` or `EXPIRING`. */
export function isContractLive(
  contract: Pick<Contract, "status" | "endDate">,
  today: Date = new Date(),
): boolean {
  const status = deriveContractStatus(contract, today);
  return status === "ACTIVE" || status === "EXPIRING";
}
