import dayjs from "@monorepo/dayjs";

/**
 * ISO `YYYY-MM-DD` end date `months` after an ISO start date, one day short
 * of the anniversary — a 12-month term from 18/09 ends 17/09 the next year,
 * not 18/09 (spec #179 wizard: "thời hạn 6/12/khác tháng").
 */
export function computeContractEndDate(
  startDateIso: string,
  months: number,
): string {
  return dayjs(startDateIso)
    .add(months, "month")
    .subtract(1, "day")
    .format("YYYY-MM-DD");
}

/**
 * ISO `YYYY-MM-DD` `months` after an ISO current end date — a Gia hạn
 * extends the existing end date, so unlike a fresh term there is no
 * day-before adjustment.
 */
export function computeRenewedEndDate(
  currentEndDateIso: string,
  months: number,
): string {
  return dayjs(currentEndDateIso).add(months, "month").format("YYYY-MM-DD");
}
