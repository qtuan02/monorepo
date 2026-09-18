import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

import type { Building } from "~/types/building";
import type { Contract } from "~/types/contract";
import type { CycleRow, CycleRowStatus } from "~/types/cycle";
import type { InvoiceLineItem } from "~/types/invoice";
import type {
  Utility,
  UtilityOldIndexOverride,
  UtilityType,
} from "~/types/utility";
import type { World } from "~/types/world";
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

type OldIndexOverrideLookup = Pick<
  UtilityOldIndexOverride,
  "roomId" | "type" | "month" | "oldIndex"
>;

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

function findOldIndexOverride(
  overrides: OldIndexOverrideLookup[],
  roomId: string,
  type: UtilityType,
  month: string,
): OldIndexOverrideLookup | undefined {
  return overrides.find(
    (item) =>
      item.roomId === roomId && item.type === type && item.month === month,
  );
}

/**
 * The chỉ số cũ a Kỳ's row starts counting from — a "Sửa chỉ số cũ"
 * correction for THIS (Phòng, loại, kỳ) wins over the last recorded reading
 * (ticket #183); absent either, a Phòng's very first kỳ starts from 0.
 */
function resolveOldIndex(
  overrides: OldIndexOverrideLookup[],
  utilities: Utility[],
  roomId: string,
  type: UtilityType,
  month: string,
): number {
  const override = findOldIndexOverride(overrides, roomId, type, month);
  if (override) return override.oldIndex;
  return lastReadingBefore(utilities, roomId, type, month)?.newIndex ?? 0;
}

/** "gấp 2,3 lần kỳ trước" — one decimal, Vietnamese comma. */
function formatAnomalyRatio(
  consumption: number,
  previousConsumption: number,
): string {
  const ratio = (consumption / previousConsumption)
    .toFixed(1)
    .replace(".", ",");
  return `gấp ${ratio} lần kỳ trước`;
}

/**
 * A reading's own "cần duyệt" text (ticket #183) — `null` once it isn't
 * bất thường, or has already been duyệt-ed. Compares against kỳ trước's own
 * consumption, never the resolved chỉ số cũ, so a "Sửa chỉ số cũ" correction
 * (about THIS kỳ's baseline) never changes what "kỳ trước" means.
 */
function resolveAnomalyReason(
  current: Pick<Utility, "oldIndex" | "newIndex" | "consumption" | "approved">,
  previous?: Pick<Utility, "consumption">,
): string | null {
  if (!isUtilityAnomalous(current, previous)) return null;
  if (previous && previous.consumption > 0) {
    return formatAnomalyRatio(current.consumption, previous.consumption);
  }
  return "chỉ số bất thường";
}

/**
 * Tiền phòng theo ngày ở khi Hợp đồng bắt đầu trong Kỳ (ticket #183) — a
 * Hợp đồng that started before the kỳ bills the full tháng, unchanged.
 */
export function computeProratedRent(
  contract: Pick<Contract, "rentAmount" | "startDate">,
  month: string,
): { amount: number; note: string | null } {
  const monthStart = dayjs(month, "YYYY-MM").startOf("month");
  const daysInMonth = monthStart.daysInMonth();
  const startDate = dayjs(contract.startDate, DATE_FORMAT);

  if (!startDate.isAfter(monthStart, "day")) {
    return { amount: contract.rentAmount, note: null };
  }

  const monthEnd = monthStart.endOf("month");
  const daysOccupied = Math.max(0, monthEnd.diff(startDate, "day") + 1);
  const amount = Math.round((contract.rentAmount * daysOccupied) / daysInMonth);
  return { amount, note: `${daysOccupied}/${daysInMonth} ngày` };
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
  world: World,
  buildingId: string,
  month: string,
): CycleRow[] {
  const building = world.buildings.find((item) => item.id === buildingId);
  if (!building) return [];

  const { priceList } = building;
  const today = world.today;
  const utilities = world.utilities;
  const oldIndexOverrides: OldIndexOverrideLookup[] =
    world.utilityOldIndexOverrides;

  return world.rooms
    .filter((room) => room.buildingId === buildingId)
    .map((room) => {
      const contract = world.contracts.find(
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
          electricityAnomalyReason: null,
          waterAnomalyReason: null,
          rentProrationNote: null,
        } satisfies CycleRow;
      }

      // "Kỳ trước" — always the last recorded reading, never a "Sửa chỉ số
      // cũ" correction, since the ratio compares against what was actually
      // consumed last kỳ.
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
      const oldElectricity = resolveOldIndex(
        oldIndexOverrides,
        utilities,
        room.id,
        "electricity",
        month,
      );
      const oldWater = resolveOldIndex(
        oldIndexOverrides,
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

      // A reading's own persisted `consumption` is trusted as-is — EXCEPT
      // once a "Sửa chỉ số cũ" override applies to it, which must recompute
      // from the corrected chỉ số cũ rather than leave a stale number on
      // screen (ticket #183). Without an override this is unchanged from
      // before: never re-derived off `oldElectricityReading`, which is a
      // different, independently-authored record.
      const electricityOverridden = !!findOldIndexOverride(
        oldIndexOverrides,
        room.id,
        "electricity",
        month,
      );
      const waterOverridden = !!findOldIndexOverride(
        oldIndexOverrides,
        room.id,
        "water",
        month,
      );
      const electricityConsumption = currentElectricity
        ? electricityOverridden
          ? currentElectricity.newIndex - oldElectricity
          : currentElectricity.consumption
        : null;
      const waterConsumption = currentWater
        ? waterOverridden
          ? currentWater.newIndex - oldWater
          : currentWater.consumption
        : null;

      const hasBothReadings = !!currentElectricity && !!currentWater;
      const alreadyInvoiced = world.invoices.some(
        (invoice) =>
          invoice.contractId === contract.id && invoice.billingMonth === month,
      );

      const electricityAnomalyReason =
        currentElectricity && electricityConsumption !== null
          ? resolveAnomalyReason(
              {
                oldIndex: oldElectricity,
                newIndex: currentElectricity.newIndex,
                consumption: electricityConsumption,
                approved: currentElectricity.approved,
              },
              oldElectricityReading
                ? { consumption: oldElectricityReading.consumption }
                : undefined,
            )
          : null;
      const waterAnomalyReason =
        currentWater && waterConsumption !== null
          ? resolveAnomalyReason(
              {
                oldIndex: oldWater,
                newIndex: currentWater.newIndex,
                consumption: waterConsumption,
                approved: currentWater.approved,
              },
              oldWaterReading
                ? { consumption: oldWaterReading.consumption }
                : undefined,
            )
          : null;
      const isAnomalous =
        hasBothReadings && (!!electricityAnomalyReason || !!waterAnomalyReason);

      const status: CycleRowStatus = alreadyInvoiced
        ? "INVOICED"
        : !hasBothReadings
          ? "MISSING"
          : isAnomalous
            ? "ANOMALY"
            : "READY";

      const electricAmount =
        (electricityConsumption ?? 0) * priceList.electricityPricePerKwh;
      const waterAmount = (waterConsumption ?? 0) * priceList.waterPricePerM3;
      const { amount: rentAmount, note: rentProrationNote } =
        computeProratedRent(contract, month);

      const reason =
        status === "ANOMALY"
          ? [
              electricityAnomalyReason && `Điện ${electricityAnomalyReason}`,
              waterAnomalyReason && `Nước ${waterAnomalyReason}`,
            ]
              .filter(Boolean)
              .join(" · ")
          : REASON_BY_STATUS[status];

      return {
        roomId: room.id,
        roomName: room.name,
        contractId: contract.id,
        tenant: contract.tenant,
        rentAmount,
        oldElectricity,
        oldWater,
        newElectricity: currentElectricity?.newIndex ?? null,
        newWater: currentWater?.newIndex ?? null,
        electricityConsumption,
        waterConsumption,
        electricAmount,
        waterAmount,
        totalAmount:
          rentAmount + electricAmount + waterAmount + priceList.serviceFee,
        status,
        reason,
        electricityAnomalyReason,
        waterAnomalyReason,
        rentProrationNote,
      } satisfies CycleRow;
    });
}

/**
 * One Hoá đơn's dòng: tiền phòng (prorate theo ngày ở nếu Hợp đồng bắt đầu
 * trong Kỳ, ticket #183) + điện/nước theo tiêu thụ × Bảng giá + dịch vụ cố định.
 */
export function buildCycleLineItems(
  contract: Pick<Contract, "rentAmount" | "startDate">,
  building: Pick<Building, "priceList">,
  electricityConsumption: number,
  waterConsumption: number,
  month: string,
): InvoiceLineItem[] {
  const { priceList } = building;
  const { amount: rentAmount, note: rentProrationNote } = computeProratedRent(
    contract,
    month,
  );
  return [
    {
      type: "RENT",
      description: rentProrationNote
        ? `Tiền phòng (${rentProrationNote})`
        : "Tiền phòng",
      quantity: 1,
      unitPrice: rentAmount,
      amount: rentAmount,
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

/** Whether `month` hasn't started yet — the Kỳ screen's ‹ › locks navigating past it (ticket #183). */
export function isFutureCycle(
  month: string,
  today: Date = new Date(),
): boolean {
  return month > dayjs(today).format("YYYY-MM");
}
