import dayjs from "@monorepo/dayjs";

import type { Building, PriceList } from "~/types/building";
import type { Contract } from "~/types/contract";
import type { CycleRow, CycleRowStatus } from "~/types/cycle";
import type { Invoice, InvoiceLineItem } from "~/types/invoice";
import type { Room } from "~/types/room";
import type { Utility, UtilityType } from "~/types/utility";
import { isContractLive } from "~/utils/contract-status";
import { formatDate } from "~/utils/date";
import { isUtilityAnomalous } from "~/utils/utility-anomaly";

const REASON_BY_STATUS: Record<CycleRowStatus, string> = {
  EMPTY: "Phòng trống — không lập hoá đơn.",
  MISSING: "Chưa nhập đủ chỉ số điện và nước của kỳ.",
  ANOMALY: "Chỉ số bất thường — cần duyệt trước khi lập.",
  READY: "Đủ điều kiện lập hoá đơn.",
  INVOICED: "Đã có hoá đơn kỳ này.",
};

function lastReadingBefore(
  utilities: Utility[],
  roomId: string,
  type: UtilityType,
  month: string,
): Utility | undefined {
  return utilities
    .filter(
      (utility) =>
        utility.roomId === roomId &&
        utility.type === type &&
        utility.month < month,
    )
    .sort((a, b) => b.month.localeCompare(a.month))[0];
}

/**
 * The Kỳ table's rows for one Toà nhà + kỳ (ADR-0013) — one row per Room,
 * replacing the old `invoice-batch` (Đợt hoá đơn tick table) and
 * `meter-input-rooms` (Nhập chỉ số rows). A vacant Phòng is `EMPTY`; an
 * occupied one is `MISSING` until both chỉ số of the kỳ are in, `ANOMALY`
 * when either regressed or is > 2× kỳ trước (never lập-able this round —
 * duyệt bất thường is a later ticket), `INVOICED` once a Hoá đơn already
 * covers this (contract, kỳ), else `READY`.
 */
export function buildCycleRows(
  buildingId: string,
  month: string,
  rooms: Room[],
  contracts: Contract[],
  utilities: Utility[],
  invoices: Pick<Invoice, "contractId" | "billingMonth">[],
  priceList: PriceList,
  today: Date = new Date(),
): CycleRow[] {
  return rooms
    .filter((room) => room.buildingId === buildingId)
    .map((room) => {
      const contract = contracts.find(
        (item) => item.roomId === room.id && isContractLive(item, today),
      );

      if (!contract) {
        return {
          roomId: room.id,
          roomName: room.name,
          contractId: null,
          tenant: null,
          rentAmount: 0,
          oldElectricity: 0,
          oldWater: 0,
          newElectricity: null,
          newWater: null,
          electricityConsumption: null,
          waterConsumption: null,
          electricAmount: 0,
          waterAmount: 0,
          totalAmount: 0,
          status: "EMPTY",
          reason: REASON_BY_STATUS.EMPTY,
        } satisfies CycleRow;
      }

      const oldElectricityReading = lastReadingBefore(
        utilities,
        room.id,
        "electricity",
        month,
      );
      const oldWaterReading = lastReadingBefore(
        utilities,
        room.id,
        "water",
        month,
      );
      const currentElectricity = utilities.find(
        (utility) =>
          utility.roomId === room.id &&
          utility.type === "electricity" &&
          utility.month === month,
      );
      const currentWater = utilities.find(
        (utility) =>
          utility.roomId === room.id &&
          utility.type === "water" &&
          utility.month === month,
      );

      const hasBothReadings = !!currentElectricity && !!currentWater;
      const alreadyInvoiced = invoices.some(
        (invoice) =>
          invoice.contractId === contract.id && invoice.billingMonth === month,
      );
      const isAnomalous =
        hasBothReadings &&
        (isUtilityAnomalous(currentElectricity, {
          consumption: oldElectricityReading?.consumption ?? 0,
        }) ||
          isUtilityAnomalous(currentWater, {
            consumption: oldWaterReading?.consumption ?? 0,
          }));

      const status: CycleRowStatus = alreadyInvoiced
        ? "INVOICED"
        : !hasBothReadings
          ? "MISSING"
          : isAnomalous
            ? "ANOMALY"
            : "READY";

      const electricityConsumption = currentElectricity?.consumption ?? null;
      const waterConsumption = currentWater?.consumption ?? null;
      const electricAmount =
        (electricityConsumption ?? 0) * priceList.electricityPricePerKwh;
      const waterAmount = (waterConsumption ?? 0) * priceList.waterPricePerM3;

      return {
        roomId: room.id,
        roomName: room.name,
        contractId: contract.id,
        tenant: contract.tenant,
        rentAmount: contract.rentAmount,
        oldElectricity: oldElectricityReading?.newIndex ?? 0,
        oldWater: oldWaterReading?.newIndex ?? 0,
        newElectricity: currentElectricity?.newIndex ?? null,
        newWater: currentWater?.newIndex ?? null,
        electricityConsumption,
        waterConsumption,
        electricAmount,
        waterAmount,
        totalAmount:
          contract.rentAmount +
          electricAmount +
          waterAmount +
          priceList.serviceFee,
        status,
        reason: REASON_BY_STATUS[status],
      } satisfies CycleRow;
    });
}

/** One Hoá đơn's dòng: tiền phòng + điện/nước theo tiêu thụ × Bảng giá + dịch vụ cố định. */
export function buildCycleLineItems(
  contract: Pick<Contract, "rentAmount">,
  building: Pick<Building, "priceList">,
  electricityConsumption: number,
  waterConsumption: number,
): InvoiceLineItem[] {
  const { priceList } = building;
  return [
    {
      type: "RENT",
      description: "Tiền phòng",
      quantity: 1,
      unitPrice: contract.rentAmount,
      amount: contract.rentAmount,
    },
    {
      type: "ELECTRIC",
      description: "Tiền điện",
      quantity: electricityConsumption,
      unitPrice: priceList.electricityPricePerKwh,
      amount: electricityConsumption * priceList.electricityPricePerKwh,
    },
    {
      type: "WATER",
      description: "Tiền nước",
      quantity: waterConsumption,
      unitPrice: priceList.waterPricePerM3,
      amount: waterConsumption * priceList.waterPricePerM3,
    },
    {
      type: "SERVICE",
      description: "Phí dịch vụ",
      quantity: 1,
      unitPrice: priceList.serviceFee,
      amount: priceList.serviceFee,
    },
  ];
}

/**
 * Hạn thu của Hoá đơn Kỳ `month` — Ngày thu của Toà nhà, THÁNG KẾ TIẾP kỳ
 * được lập (ADR-0013: Hoá đơn Kỳ 09 hạn là Ngày thu tháng 10). `collectionDay`
 * is settable up to 31, so it is clamped to that next month's real length —
 * 31 in a 30-day or February month would otherwise roll `dayjs` into the
 * month after (e.g. "2026-02-31" → 03/03/2026).
 */
export function buildCycleDueDate(
  building: Pick<Building, "collectionDay">,
  month: string,
): string {
  const dueMonth = dayjs(month, "YYYY-MM").add(1, "month");
  const daysInMonth = dueMonth.daysInMonth();
  const day = String(Math.min(building.collectionDay, daysInMonth)).padStart(
    2,
    "0",
  );
  return formatDate(`${dueMonth.format("YYYY-MM")}-${day}`);
}

/**
 * Ngày chốt of a kỳ is never settable — it is always the last day of the
 * kỳ's own month (ADR-0013). Shared by the Kỳ screen's "Lập n hoá đơn" gate
 * and Việc cần làm's "chưa lập Đợt" derivation, so the two can never disagree
 * on when a kỳ is closed.
 */
export function isCycleClosingDatePassed(
  month: string,
  today: Date = new Date(),
): boolean {
  const closingDate = dayjs(month, "YYYY-MM")
    .endOf("month")
    .format("YYYY-MM-DD");
  return dayjs(today).format("YYYY-MM-DD") >= closingDate;
}
