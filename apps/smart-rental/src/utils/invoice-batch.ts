import dayjs from "@monorepo/dayjs";

import type { Building } from "~/types/building";
import type { Contract } from "~/types/contract";
import type { Invoice, InvoiceLineItem } from "~/types/invoice";
import type { Utility } from "~/types/utility";
import { isContractLive } from "~/utils/contract-status";
import { formatDate } from "~/utils/date";

/** One row of the Đợt hoá đơn tick table — one Hợp đồng hiệu lực of the Toà nhà + kỳ. */
export interface BatchInvoiceRow {
  contractId: string;
  roomId: string;
  room: string;
  floor: number;
  tenant: string;
  rentAmount: number;
  /** `null` — no Chỉ số xác nhận of the kỳ for this Phòng/loại yet. */
  electricityConsumption: number | null;
  waterConsumption: number | null;
  alreadyInvoiced: boolean;
  /** Tickable only once both readings are xác nhận and the kỳ isn't already lập. */
  eligible: boolean;
}

/**
 * The Đợt hoá đơn preview rows for one Toà nhà + kỳ (spec #153 §10 rows 6/12/25):
 * every Hợp đồng hiệu lực, gated by whether điện + nước of the kỳ are both
 * `FINALIZED` and no Hoá đơn already covers this (contract, kỳ) pair. Lives in
 * `~/utils` because `~/hooks/api/invoice` calls it.
 */
export function buildBatchInvoiceRows(
  buildingId: string,
  month: string,
  contracts: Contract[],
  utilities: Utility[],
  invoices: Pick<Invoice, "contractId" | "billingMonth">[],
  today: Date = new Date(),
): BatchInvoiceRow[] {
  return contracts
    .filter(
      (contract) =>
        contract.buildingId === buildingId && isContractLive(contract, today),
    )
    .map((contract) => {
      const electricity = utilities.find(
        (utility) =>
          utility.roomId === contract.roomId &&
          utility.type === "electricity" &&
          utility.month === month,
      );
      const water = utilities.find(
        (utility) =>
          utility.roomId === contract.roomId &&
          utility.type === "water" &&
          utility.month === month,
      );
      const alreadyInvoiced = invoices.some(
        (invoice) =>
          invoice.contractId === contract.id && invoice.billingMonth === month,
      );
      const hasFinalizedReadings =
        electricity?.status === "FINALIZED" && water?.status === "FINALIZED";

      return {
        contractId: contract.id,
        roomId: contract.roomId,
        room: contract.room,
        floor: contract.floor,
        tenant: contract.tenant,
        rentAmount: contract.rentAmount,
        electricityConsumption: electricity?.consumption ?? null,
        waterConsumption: water?.consumption ?? null,
        alreadyInvoiced,
        eligible: hasFinalizedReadings && !alreadyInvoiced,
      };
    });
}

/** One Hoá đơn's dòng: tiền phòng + điện/nước theo tiêu thụ × Bảng giá + dịch vụ cố định. */
export function buildBatchInvoiceLineItems(
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
 * Hạn thu every Hoá đơn of one Đợt shares — the Toà nhà's Ngày thu, of the
 * month AFTER the kỳ being billed (ADR-0013: Hoá đơn Kỳ 09 hạn là Ngày thu
 * tháng 10). `collectionDay` is settable up to 31
 * (`building-settings-form.ts`), so it is clamped to that next month's real
 * length — 31 in a 30-day or February month would otherwise roll `dayjs`
 * into the month after (e.g. "2026-02-31" → 03/03/2026).
 */
export function buildBatchInvoiceDueDate(
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
