import dayjs from "@monorepo/dayjs";
import { DATE_FORMAT } from "@monorepo/dayjs/formats";

const EXPIRING_SOON_DAYS = 30;

export interface ContractExpiryMeta {
  daysUntilEnd: number;
  isExpiringSoon: boolean;
}

/** Days from `now` to a `DD/MM/YYYY` end date; "soon" is within 30 days and not yet past. */
export function getContractExpiryMeta(
  endDate: string,
  now: Date = new Date(),
): ContractExpiryMeta {
  const daysUntilEnd = dayjs(endDate, DATE_FORMAT).diff(
    dayjs(now).startOf("day"),
    "day",
  );

  return {
    daysUntilEnd,
    isExpiringSoon: daysUntilEnd <= EXPIRING_SOON_DAYS && daysUntilEnd > 0,
  };
}
