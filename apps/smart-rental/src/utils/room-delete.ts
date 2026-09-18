import type { Contract } from "~/types/contract";
import { isContractLive } from "~/utils/contract-status";

/**
 * Xoá Phòng chỉ khi không có Hợp đồng hiệu lực gắn với nó (spec #153 §10 row
 * 37) — the room counterpart of `~/utils/building-delete.ts`, same reason it
 * lives in the foundation `~/utils` rather than the `rooms` slice: a
 * `~/hooks/api/room` mutation calls it, and a feature-slice util would be an
 * upward import (architecture-circular-dependencies.md).
 */
export function canDeleteRoom(
  roomId: string,
  contracts: Pick<Contract, "roomId" | "status" | "endDate">[],
): boolean {
  return !contracts.some(
    (contract) => contract.roomId === roomId && isContractLive(contract),
  );
}
