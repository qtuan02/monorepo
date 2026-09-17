import type { Contract } from "~/types/contract";
import { isContractLive } from "~/utils/contract-status";

/**
 * Xoá Toà nhà chỉ khi không còn Phòng có Hợp đồng hiệu lực (spec #153 §10
 * row 37) — a pure check over the Mock's own `buildingId` refs. Lives in the
 * foundation `~/utils` (not the `buildings` slice) so `~/hooks/api/building`
 * can import it without pointing upward (architecture-circular-dependencies.md).
 */
export function canDeleteBuilding(
  buildingId: string,
  contracts: Pick<Contract, "buildingId" | "status" | "endDate">[],
): boolean {
  return !contracts.some(
    (contract) =>
      contract.buildingId === buildingId && isContractLive(contract),
  );
}
